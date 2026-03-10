const supabase = require('../config/supabase');
const nodemailer = require('nodemailer');

// Simple in-memory OTP store: bookingId -> { otp, email, expiresAt, verified }
const OTP_STORE = new Map();

// For dev: create a reusable test account transporter (Ethereal)
let testTransporterPromise = null;
async function getTestTransporter() {
  if (testTransporterPromise) return testTransporterPromise;
  testTransporterPromise = (async () => {
    try {
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      return { transporter, testAccount };
    } catch (err) {
      console.warn('Failed to create test email account:', err);
      throw err;
    }
  })();
  return testTransporterPromise;
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.sendOtp = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId, email } = req.body;

    if (!bookingId || !email) {
      return res.status(400).json({ success: false, error: 'Missing bookingId or email' });
    }

    // Verify booking exists and belongs to user
    const { data: booking, error } = await supabase
      .from('BOOKING')
      .select('*')
      .eq('BookingID', bookingId)
      .single();

    if (error || !booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    if (booking.UserID !== userId) {
      return res.status(403).json({ success: false, error: 'Booking does not belong to user' });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    OTP_STORE.set(String(bookingId), { otp, email, expiresAt, verified: false });

    // Send email (Ethereal test) and return preview URL
    const { transporter, testAccount } = await getTestTransporter();

    const mail = await transporter.sendMail({
      from: 'no-reply@travelgo.test',
      to: email,
      subject: 'Your TravelGo booking OTP',
      text: `Your OTP is: ${otp}. It expires in 5 minutes.`,
      html: `<p>Your OTP is: <strong>${otp}</strong>. It expires in 5 minutes.</p>`
    });

    const previewUrl = nodemailer.getTestMessageUrl(mail);

    res.json({ success: true, previewUrl });
  } catch (err) {
    console.error('sendOtp error:', err);
    res.status(500).json({ success: false, error: 'Failed to send OTP' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId, otp } = req.body;

    if (!bookingId || !otp) return res.status(400).json({ success: false, error: 'Missing data' });

    const entry = OTP_STORE.get(String(bookingId));
    if (!entry) return res.status(400).json({ success: false, error: 'No OTP requested for this booking' });

    if (entry.expiresAt < Date.now()) {
      OTP_STORE.delete(String(bookingId));
      return res.status(400).json({ success: false, error: 'OTP expired' });
    }

    if (entry.otp !== otp) return res.status(400).json({ success: false, error: 'Invalid OTP' });

    // mark verified
    entry.verified = true;
    OTP_STORE.set(String(bookingId), entry);

    res.json({ success: true });
  } catch (err) {
    console.error('verifyOtp error:', err);
    res.status(500).json({ success: false, error: 'Verification failed' });
  }
};

exports.makePayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId, totalCost } = req.body;

    console.log('makePayment called:', { userId, bookingId, totalCost });

    if (!bookingId || typeof totalCost !== 'number') return res.status(400).json({ success: false, error: 'Missing or invalid data (bookingId, totalCost)' });

    const entry = OTP_STORE.get(String(bookingId));
    console.log('makePayment: OTP_STORE entry=', entry);
    if (!entry) return res.status(400).json({ success: false, error: 'No OTP requested for this booking' });
    if (!entry.verified) return res.status(400).json({ success: false, error: 'OTP not verified' });

    // Verify booking belongs to the user
    const { data: booking, error: bookingError } = await supabase
      .from('BOOKING')
      .select('*')
      .eq('BookingID', bookingId)
      .single();

    console.log('makePayment: booking fetch result=', { booking, bookingError });

    if (bookingError || !booking) {
      return res.status(404).json({ success: false, error: 'Booking not found', details: process.env.NODE_ENV !== 'production' ? bookingError : undefined });
    }
    if (booking.UserID !== userId) {
      return res.status(403).json({ success: false, error: 'Booking does not belong to user' });
    }

    // Create transaction
    const { data: txData, error: txError } = await supabase
      .from('TRANSACTION')
      .insert([{ BookingID: bookingId, TotalCost: totalCost, TimeStamp: new Date().toISOString() }])
      .select('*')
      .single();

    console.log('makePayment: transaction insert result=', { txData, txError });

    if (txError) {
      console.error('makePayment: txError=', txError);
      return res.status(500).json({ success: false, error: 'Transaction insert failed', details: process.env.NODE_ENV !== 'production' ? txError : undefined });
    }

    // Update booking confirmation
    const { error: confirmError } = await supabase
      .from('BOOKING')
      .update({ Confirmed: true })
      .eq('BookingID', bookingId);

    if (confirmError) {
      console.error('makePayment: confirmError=', confirmError);
      return res.status(500).json({ success: false, error: 'Failed to confirm booking', details: process.env.NODE_ENV !== 'production' ? confirmError : undefined });
    }

    // Send confirmation email
    const referenceId = `${Date.now()}${Math.floor(Math.random() * 9000 + 1000)}`;

    const { transporter } = await getTestTransporter();
    const mail = await transporter.sendMail({
      from: 'no-reply@travelgo.test',
      to: entry.email,
      subject: 'Booking Confirmed',
      text: `Your booking is confirmed. Reference ID: ${referenceId}`,
      html: `<p>Your booking is confirmed. <strong>Reference ID:</strong> ${referenceId}</p>`
    });

    const previewUrl = nodemailer.getTestMessageUrl(mail);

    // cleanup otp
    OTP_STORE.delete(String(bookingId));

    res.json({ success: true, referenceId, previewUrl, transaction: txData });
  } catch (err) {
    console.error('makePayment error:', err);
    const message = err?.message || 'Payment failed';
    const response = { success: false, error: message };
    if (process.env.NODE_ENV !== 'production') {
      response.details = err;
    }
    return res.status(500).json(response);
  }
};

// Developer helper to inspect OTP_STORE (dev-only)
exports.getOtpStore = async (req, res) => {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEV_ENDPOINTS !== 'true') {
    return res.status(403).json({ success: false, error: 'Dev endpoint disabled' });
  }

  try {
    const entries = Array.from(OTP_STORE.entries()).map(([bookingId, data]) => ({ bookingId, ...data }));
    res.json({ success: true, entries });
  } catch (err) {
    console.error('getOtpStore error:', err);
    res.status(500).json({ success: false, error: 'Failed to read OTP store' });
  }
};

// Legacy card payment (no OTP) - creates a transaction and confirms booking
exports.legacyPay = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId, totalCost } = req.body;

    console.log('legacyPay called:', { userId, bookingId, totalCost });

    if (!bookingId || typeof totalCost !== 'number') return res.status(400).json({ success: false, error: 'Missing or invalid data (bookingId, totalCost)' });

    // Ensure server has Supabase service role key configured so this server-side insert can bypass RLS
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('legacyPay: SUPABASE_SERVICE_ROLE_KEY not set');
      return res.status(500).json({ success: false, error: 'Server misconfigured: missing SUPABASE_SERVICE_ROLE_KEY' });
    }

    // Verify booking belongs to the user
    const { data: booking, error: bookingError } = await supabase
      .from('BOOKING')
      .select('*')
      .eq('BookingID', bookingId)
      .single();

    console.log('legacyPay: booking fetch result=', { booking, bookingError });

    if (bookingError || !booking) {
      return res.status(404).json({ success: false, error: 'Booking not found', details: process.env.NODE_ENV !== 'production' ? bookingError : undefined });
    }
    if (booking.UserID !== userId) {
      return res.status(403).json({ success: false, error: 'Booking does not belong to user' });
    }

    // Create transaction
    const { data: txData, error: txError } = await supabase
      .from('TRANSACTION')
      .insert([{ BookingID: bookingId, TotalCost: totalCost, TimeStamp: new Date().toISOString() }])
      .select('*')
      .single();

    console.log('legacyPay: transaction insert result=', { txData, txError });

    if (txError) {
      console.error('legacyPay: txError=', txError);
      return res.status(500).json({ success: false, error: 'Transaction insert failed', details: process.env.NODE_ENV !== 'production' ? txError : undefined });
    }

    // Update booking confirmation
    const { error: confirmError } = await supabase
      .from('BOOKING')
      .update({ Confirmed: true })
      .eq('BookingID', bookingId);

    if (confirmError) {
      console.error('legacyPay: confirmError=', confirmError);
      return res.status(500).json({ success: false, error: 'Failed to confirm booking', details: process.env.NODE_ENV !== 'production' ? confirmError : undefined });
    }

    // Send confirmation email (use placeholder email if none available)
    const email = booking.Email || 'no-reply@travelgo.test';
    const referenceId = `${Date.now()}${Math.floor(Math.random() * 9000 + 1000)}`;

    const { transporter } = await getTestTransporter();
    const mail = await transporter.sendMail({
      from: 'no-reply@travelgo.test',
      to: email,
      subject: 'Booking Confirmed (Legacy Payment)',
      text: `Your booking is confirmed. Reference ID: ${referenceId}`,
      html: `<p>Your booking is confirmed. <strong>Reference ID:</strong> ${referenceId}</p>`
    });

    const previewUrl = nodemailer.getTestMessageUrl(mail);

    res.json({ success: true, referenceId, previewUrl, transaction: txData });
  } catch (err) {
    console.error('legacyPay error:', err);
    const message = err?.message || 'Legacy payment failed';
    const response = { success: false, error: message };
    if (process.env.NODE_ENV !== 'production') {
      response.details = err;
    }
    return res.status(500).json(response);
  }
};

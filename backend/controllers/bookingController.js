const supabase = require("../config/supabase");

// CREATE BOOKING (Pay Now or Pay Later)
exports.createBooking = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const {  RoomTypeID,
              CheckinDate,
              CheckoutDate,
              NoOfRooms } = req.body;

    console.log('CreateBooking: userId=', userId, 'payload=', { RoomTypeID, CheckinDate, CheckoutDate, NoOfRooms });

    const { data, error } = await supabase
      .from("BOOKING")
      .insert([
        {
          UserID: userId,
          RoomTypeID: RoomTypeID,     // ✅ correct
          CheckinDate: CheckinDate,   // ✅ correct
          CheckoutDate: CheckoutDate, // ✅ correct
          NoOfRooms: NoOfRooms, 
          Confirmed: false
        }
      ])
      .select("BookingID")
      .single();

    console.log('CreateBooking: supabase result=', { data, error });

    if (error) throw error;

    res.json({
      success: true,
      bookingId: data.BookingID,
      confirmed: false
    });
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ success: false, error: err.message || 'Create booking failed' });
  }
};

// GET /api/bookings/:bookingId - fetch a booking (must belong to authenticated user)
exports.getBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;

    console.log('GetBooking: userId=', userId, 'bookingId=', bookingId);

    const { data, error } = await supabase
      .from('BOOKING')
      .select(`
        *,
        ROOM_TYPE (
          *,
          HOTEL (
            *
          )
        )
      `)
      .eq('BookingID', bookingId)
      .single();

    console.log('GetBooking: supabase result=', { data, error });

    if (error || !data) return res.status(404).json({ success: false, error: 'Booking not found' });
    if (data.UserID !== userId) return res.status(403).json({ success: false, error: 'Booking does not belong to user' });

    res.json({ success: true, booking: data });
  } catch (err) {
    console.error('Get booking error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch booking' });
  }
};

// CONFIRM BOOKING AFTER PAYMENT
exports.confirmBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from("BOOKING")
      .update({ Confirmed: true })
      .eq("BookingID", bookingId)
      .eq("UserID", userId);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error("Confirm booking error:", err);
    res.status(500).json({ success: false });
  }
};

// GET /api/bookings - return all bookings for the authenticated user
exports.getBookingsForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('GetBookingsForUser: userId=', userId);

    const { data, error } = await supabase
      .from('BOOKING')
      .select(`
        *,
        ROOM_TYPE (
          *,
          HOTEL (
            *
          )
        )
      `)
      .eq('UserID', userId)
      .order('CheckinDate', { ascending: false });

    console.log('GetBookingsForUser: supabase result=', { count: data?.length, error });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    console.error('Get bookings for user error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
};

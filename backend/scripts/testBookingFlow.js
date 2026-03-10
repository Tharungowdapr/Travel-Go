
const http = require('http');
require('dotenv').config();

// Helper to make HTTP requests
function makeRequest(path, method, body, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: process.env.PORT || 5001,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', reject);

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function runTest() {
    console.log("🚀 Starting Booking Integration Test...");

    // 1. Register a Test User
    const timestamp = Date.now();
    const userData = {
        UserName: `testuser_${timestamp}`,
        Password: "TestPassword123!",
        Email: `test_${timestamp}@example.com`,
        FName: "Test",
        LName: "User",
        Age: 25,
        Gender: "M",
        Address: "123 Test St"
    };

    console.log(`👤 Registering user: ${userData.UserName}`);
    const regRes = await makeRequest('/api/auth/register', 'POST', userData);

    if (regRes.status !== 200) {
        console.error("❌ Registration Failed:", regRes.body);
        // Try login if user exists (shouldn't happen with timestamp)
        return;
    }
    const token = regRes.body.token; // USE TOKEN FROM REGISTRATION
    console.log("✅ Registration Successful. Token received.");

    /* SKIP EXPLICIT LOGIN TO VERIFY REGISTRATION TOKEN WORKS
    // 2. Login (to get token)
    console.log("🔑 Logging in...");
    const loginRes = await makeRequest('/api/auth/login', 'POST', {
        UserName: userData.UserName,
        Password: userData.Password
    });

    if (loginRes.status !== 200) {
        console.error("❌ Login Failed:", loginRes.body);
        return;
    }
    const token = loginRes.body.token;
    console.log("✅ Login Successful. Token received.");
    */

    // 3. Create Booking
    // We verified RoomTypeID 1 exists in debugBooking.js
    const bookingPayload = {
        RoomTypeID: 1,
        CheckinDate: '2026-02-01',
        CheckoutDate: '2026-02-05',
        NoOfRooms: 1
    };

    console.log("📝 Creating Booking...", bookingPayload);
    const bookingRes = await makeRequest('/api/bookings', 'POST', bookingPayload, token);

    console.log(`Status: ${bookingRes.status}`);
    console.log("Response:", bookingRes.body);

    if (bookingRes.status === 200 && bookingRes.body.success) {
        console.log("✅ Booking Created Successfully!");
        console.log(`🆔 Booking ID: ${bookingRes.body.bookingId}`);
    } else {
        console.error("❌ Booking Failed");
    }
}

runTest();


require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugBooking() {
    console.log("🚀 Debugging BOOKING Table...");

    // 1. Probe for Table Name
    const candidates = ['BOOKING', 'Booking', 'booking', '"BOOKING"', 'Bookings'];
    let validTable = null;

    for (const t of candidates) {
        const { error } = await supabase.from(t).select('*').limit(1);
        if (!error) {
            console.log(`✅ Table Found: '${t}'`);
            validTable = t;
            break;
        }
    }

    if (!validTable) {
        console.error("❌ Could not find BOOKING table with any common casing.");
        return;
    }

    // 2. Get a valid User
    const { data: users, error: userError } = await supabase.from('USER').select('UserID').limit(1);
    if (userError || !users.length) {
        console.error("❌ Could not fetch a user to test with.");
        return;
    }
    const userId = users[0].UserID;
    console.log(`👤 Using UserID: ${userId}`);

    // 3. Get a valid RoomType
    // Check ROOM_TYPE table name first? using known valid one or guessing
    let roomTypeTable = 'ROOM_TYPE'; // Assumption based on previous work
    const { data: rooms, error: roomError } = await supabase.from(roomTypeTable).select('RoomTypeID').limit(1);

    if (roomError) {
        console.log("⚠️ Could not fetch ROOM_TYPE with default name, trying variations...");
        // simple fallback probe if needed, but likely ROOM_TYPE is correct from previous work
    }

    if (!rooms || rooms.length === 0) {
        console.error("❌ No Room Types found. Cannot test booking.");
        return;
    }
    const roomTypeId = rooms[0].RoomTypeID;
    console.log(`🏨 Using RoomTypeID: ${roomTypeId}`);

    // 4. Test Insert
    console.log("📝 Attempting Test Insert...");
    const bookingPayload = {
        UserID: userId,
        RoomTypeID: roomTypeId,
        CheckinDate: new Date().toISOString(),
        CheckoutDate: new Date(Date.now() + 86400000).toISOString(), // +1 day
        NoOfRooms: 1,
        Confirmed: false
    };

    const { data, error } = await supabase
        .from(validTable)
        .insert([bookingPayload])
        .select();

    if (error) {
        console.error("❌ Insert Failed:", error);
    } else {
        console.log("✅ Insert Success:", data);
        // Cleanup
        const bookingId = data[0].BookingID || data[0].bookingid; // case agnostic check
        if (bookingId) {
            await supabase.from(validTable).delete().eq('BookingID', bookingId); // try case-sensitive ID first
            console.log("🧹 Cleaned up test booking.");
        }
    }
}

debugBooking();

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugInsert() {
    console.log("🚀 Debugging Insert on HOTEL_IMAGE");

    // 1. Get a valid Hotel ID
    const { data: hotels } = await supabase.from('HOTEL').select('HotelID').limit(1);
    if (!hotels || hotels.length === 0) {
        console.log("No hotels found.");
        return;
    }
    const hotelId = hotels[0].HotelID;
    console.log("Using HotelID:", hotelId);

    // 2. Try Insert with UPPERCASE
    console.log("Attempting insert into 'HOTEL_IMAGE'...");
    const payload = {
        HotelID: hotelId,
        HotelImage: 'https://example.com/test.jpg'
    };

    const { data, error } = await supabase.from('HOTEL_IMAGE').insert([payload]).select();

    if (error) {
        console.error("❌ 'HOTEL_IMAGE' Insert Failed:", error);
        console.error("Error Code:", error.code);
        console.error("Error Details:", error.details);
        console.error("Error Hint:", error.hint);
        console.error("Error Message:", error.message);
    } else {
        console.log("✅ 'HOTEL_IMAGE' Insert Success!", data);
    }
}

debugInsert();

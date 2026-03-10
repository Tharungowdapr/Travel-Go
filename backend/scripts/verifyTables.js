
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTables() {
    const tables = [
        'USER', 'COUNTRY', 'CITY', 'HOTEL', 'HOTEL_IMAGE',
        'ROOM_TYPE', 'AVAILABILITY', 'BOOKING', 'REVIEW'
    ];

    console.log("🔍 Checking tables in Supabase...");

    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            if (error.code === 'PGRST116') {
                console.log(`✅ Table '${table}' exists but is EMPTY.`);
            } else if (error.message.includes('not found') || error.message.includes('does not exist')) {
                console.log(`❌ Table '${table}' DOES NOT EXIST.`);
            } else {
                console.log(`⚠️ Table '${table}' error: ${error.message}`);
            }
        } else {
            console.log(`✅ Table '${table}' exists and has DATA. (Sample columns: ${Object.keys(data[0] || {}).join(', ')})`);
        }
    }
}

verifyTables();

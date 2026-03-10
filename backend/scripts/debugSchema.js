const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debug() {
    console.log("🔌 Connecting to:", process.env.SUPABASE_URL);

    const candidates = [
        'HOTEL', 'Hotel', 'hotel', '"HOTEL"', '"Hotel"',
        'HOTELS', 'Hotels', 'hotels',
        'USER', 'User', 'user', 'users', 'Users',
        'countries', 'country', 'COUNTRY',
        'cities', 'city', 'CITY'
    ];

    console.log("\n🔍 Probing table existence...");

    for (const t of candidates) {
        const { data, error } = await supabase.from(t).select('*').limit(1);
        if (!error) {
            console.log(`✅ Table FOUND: '${t}'`);
        } else {
            // Only log if it's NOT the "not found" error to reduce noise, 
            // OR log the specific error to see if it's auth related.
            if (error.message.includes("Could not find the table")) {
                // console.log(`   (Not found: ${t})`);
            } else {
                console.log(`❓ Error accessing '${t}': ${error.message}`);
            }
        }
    }
    console.log("\n🏁 Probe complete.");
}

debug();

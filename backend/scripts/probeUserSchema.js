
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function probeUserSchema() {
    console.log("🔍 Probing USER table schema...");

    const { data, error } = await supabase.from('USER').select('*').limit(1);

    if (error) {
        console.error("❌ Error fetching from USER:", error);
        return;
    }

    if (data && data.length > 0) {
        console.log("✅ Sample data found. Columns:", Object.keys(data[0]));
    } else {
        console.log("⚠️ USER table is empty. Cannot determine columns via data.");
        // Try to insert a dummy row or use another method if possible
    }
}

probeUserSchema();

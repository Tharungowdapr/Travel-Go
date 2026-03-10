
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function probe() {
    const { data, error } = await supabase.from('AVAILABILITY').select('*').limit(1);
    console.log("AVAILABILITY result:", { data, error });
    if (data && data[0]) {
        console.log("Columns:", Object.keys(data[0]));
    }
}
probe();

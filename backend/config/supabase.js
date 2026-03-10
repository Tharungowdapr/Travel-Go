const { createClient } = require("@supabase/supabase-js");

console.log("🧪 supabaseClient env check:", {
  SUPABASE_URL: process.env.SUPABASE_URL,
  HAS_SERVICE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
});

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Supabase ENV missing INSIDE supabaseClient.js");
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = supabase;


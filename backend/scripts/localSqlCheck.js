
require("dotenv").config();
const db = require("../config/pg");

async function check() {
    try {
        const res = await db.query('SELECT count(*) FROM "HOTEL"');
        console.log(`✅ Local PostgreSQL Check: Found ${res.rows[0].count} hotels in local DB.`);

        const userRes = await db.query('SELECT "UserName" FROM "USER" WHERE "UserName" = $1', ['local_tester']);
        if (userRes.rows.length > 0) {
            console.log(`✅ Local Test User 'local_tester' found.`);
        }
    } catch (err) {
        console.error("❌ Local PostgreSQL Check Failed:", err.message);
    } finally {
        process.exit(0);
    }
}

check();

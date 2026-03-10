
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.LOCAL_PG_USER || 'tharungowdapr',
    host: process.env.LOCAL_PG_HOST || 'localhost',
    database: process.env.LOCAL_PG_DB || 'travelgo',
    password: process.env.LOCAL_PG_PASSWORD || '',
    port: process.env.LOCAL_PG_PORT || 5432,
});

pool.on('connect', () => {
    console.log('✅ Connected to local PostgreSQL');
});

pool.on('error', (err) => {
    console.error('❌ Local PostgreSQL error:', err);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};

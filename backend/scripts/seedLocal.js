
require("dotenv").config();
const { Pool } = require("pg");
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    user: process.env.LOCAL_PG_USER || 'tharungowdapr',
    host: process.env.LOCAL_PG_HOST || 'localhost',
    database: process.env.LOCAL_PG_DB || 'travelgo',
    password: process.env.LOCAL_PG_PASSWORD || '',
    port: process.env.LOCAL_PG_PORT || 5432,
});

const countries = ['France', 'United Kingdom', 'Japan', 'United States', 'Germany', 'Italy', 'Spain', 'Canada', 'Australia', 'Brazil', 'India', 'Thailand', 'Mexico'];
const cities = {
    'France': ['Paris', 'Lyon', 'Marseille'],
    'United Kingdom': ['London', 'Manchester', 'Edinburgh'],
    'Japan': ['Tokyo', 'Kyoto', 'Osaka'],
    'United States': ['New York', 'Los Angeles', 'Chicago'],
    'Germany': ['Berlin', 'Munich', 'Hamburg'],
    'Italy': ['Rome', 'Milan', 'Venice'],
    'Spain': ['Madrid', 'Barcelona', 'Valencia'],
    'Canada': ['Toronto', 'Vancouver', 'Montreal'],
    'Australia': ['Sydney', 'Melbourne', 'Brisbane'],
    'Brazil': ['Rio de Janeiro', 'São Paulo', 'Salvador'],
    'India': ['Bangalore', 'Mumbai', 'Delhi'],
    'Thailand': ['Bangkok', 'Phuket'],
    'Mexico': ['Mexico City', 'Cancun']
};

async function seedLocal() {
    console.log("🌱 Starting Local Postgres Seeding...");
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Countries
        console.log("🌍 Seeding Countries...");
        for (const name of countries) {
            await client.query('INSERT INTO "COUNTRY" ("CountryName") VALUES ($1) ON CONFLICT DO NOTHING', [name]);
        }
        const countryRes = await client.query('SELECT * FROM "COUNTRY"');
        const countryData = countryRes.rows;

        // 2. Cities
        console.log("🏙️ Seeding Cities...");
        for (const countryObj of countryData) {
            const countryCities = cities[countryObj.CountryName];
            if (!countryCities) continue;
            for (const cityName of countryCities) {
                await client.query('INSERT INTO "CITY" ("CityName", "CountryID") VALUES ($1, $2) ON CONFLICT DO NOTHING', [cityName, countryObj.CountryID]);
            }
        }
        const cityRes = await client.query('SELECT * FROM "CITY"');
        const cityData = cityRes.rows;

        // 3. Hotels
        console.log("🏨 Seeding Hotels...");
        for (const cityObj of cityData) {
            for (let i = 1; i <= 2; i++) {
                await client.query(
                    'INSERT INTO "HOTEL" ("HotelName", "HotelRating", "CityID", "LodgingType") VALUES ($1, $2, $3, $4)',
                    [`${cityObj.CityName} Local Inn ${i}`, 4, cityObj.CityID, 'Hotel']
                );
            }
        }
        const hotelRes = await client.query('SELECT * FROM "HOTEL"');
        const hotelData = hotelRes.rows;

        // 4. Room Types
        console.log("🛏️ Seeding Room Types...");
        for (const hotel of hotelData) {
            await client.query(
                'INSERT INTO "ROOM_TYPE" ("HotelID", "RoomTypeName", "Price", "Capacity") VALUES ($1, $2, $3, $4)',
                [hotel.HotelID, 'Standard Local', 150.00, 2]
            );
        }
        const roomTypeRes = await client.query('SELECT * FROM "ROOM_TYPE"');
        const roomTypeData = roomTypeRes.rows;

        // 5. Availability
        console.log("📅 Seeding Availability...");
        const today = new Date();
        for (const rt of roomTypeData) {
            for (let i = 0; i < 5; i++) {
                const date = new Date();
                date.setDate(today.getDate() + i);
                await client.query(
                    'INSERT INTO "AVAILABILITY" ("RoomTypeID", "Date", "NumberOfRooms") VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
                    [rt.RoomTypeID, date.toISOString().split('T')[0], 10]
                );
            }
        }

        // 6. Test User
        console.log("👤 Seeding Test User...");
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash("TravelGo123!", salt);
        await client.query(
            'INSERT INTO "USER" ("UserID", "UserName", "Email", "FName", "LName", "Password") VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
            [uuidv4(), 'local_tester', 'local@example.com', 'Local', 'Tester', password]
        );

        await client.query('COMMIT');
        console.log("🎉 Local Postgres Seeding Finished Successfully!");
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("❌ Local Seeding Failed:", err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

seedLocal();

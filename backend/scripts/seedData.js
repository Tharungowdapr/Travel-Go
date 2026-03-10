
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const countries = ['France', 'United Kingdom', 'Japan', 'United States', 'Germany', 'Italy', 'Spain', 'Canada', 'Australia', 'Brazil'];
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
    'Brazil': ['Rio de Janeiro', 'São Paulo', 'Salvador']
};

const lodgingTypes = ['Hotel', 'Resort', 'Apartment', 'Hostel', 'Villa'];

async function fullSeed() {
    console.log("🌱 Starting Full Seeding Process on Supabase Cloud...");

    try {
        // 1. Countries
        console.log("🌍 Seeding Countries...");
        const countryPayload = countries.map(name => ({ CountryName: name }));
        const { data: countryData, error: countryError } = await supabase.from('COUNTRY').insert(countryPayload).select();

        let finalCountries = countryData;
        if (countryError) {
            console.log("ℹ️ Countries might already exist, fetching them...");
            const { data: existingCountries, error: fetchError } = await supabase.from('COUNTRY').select();
            if (fetchError) throw fetchError;
            finalCountries = existingCountries;
        }

        // 2. Cities
        console.log("🏙️ Seeding Cities...");
        const cityPayload = [];
        for (const countryObj of finalCountries) {
            const countryCities = cities[countryObj.CountryName];
            if (!countryCities) continue;
            for (const cityName of countryCities) {
                cityPayload.push({ CityName: cityName, CountryID: countryObj.CountryID });
            }
        }
        const { data: cityData, error: cityError } = await supabase.from('CITY').insert(cityPayload).select();

        let finalCities = cityData;
        if (cityError) {
            console.log("ℹ️ Cities might already exist, fetching them...");
            const { data: existingCities, error: fetchError } = await supabase.from('CITY').select();
            if (fetchError) throw fetchError;
            finalCities = existingCities;
        }

        // 3. Hotels
        console.log("🏨 Seeding Hotels...");
        const hotelPayload = [];
        for (const cityObj of cityData) {
            for (let i = 1; i <= 3; i++) {
                hotelPayload.push({
                    HotelName: `${cityObj.CityName} Grand ${i}`,
                    HotelRating: 3 + Math.floor(Math.random() * 3),
                    CityID: cityObj.CityID
                });
            }
        }
        const { data: hotelData, error: hotelError } = await supabase.from('HOTEL').insert(hotelPayload).select();
        if (hotelError) throw hotelError;

        // 4. Hotel Images
        console.log("🖼️ Seeding Hotel Images...");
        const imagePayload = [];
        hotelData.forEach(hotel => {
            const images = [
                'https://images.unsplash.com/photo-1566073771259-6a8506099945',
                'https://images.unsplash.com/photo-1571896349842-33c89424de2d'
            ];
            images.forEach(img => {
                imagePayload.push({ HotelID: hotel.HotelID, HotelImage: img });
            });
        });
        const { error: imageError } = await supabase.from('HOTEL_IMAGE').insert(imagePayload);
        if (imageError) console.warn("⚠️ Image seeding warning (may be duplicate):", imageError.message);

        // 5. Room Types
        console.log("🛏️ Seeding Room Types...");
        const roomTypePayload = [];
        hotelData.forEach(hotel => {
            roomTypePayload.push(
                { HotelID: hotel.HotelID, RoomTypeName: 'Standard Room', Price: 150, Capacity: 2 },
                { HotelID: hotel.HotelID, RoomTypeName: 'Luxury Suite', Price: 350, Capacity: 4 }
            );
        });
        const { data: roomTypeData, error: roomTypeError } = await supabase.from('ROOM_TYPE').insert(roomTypePayload).select();
        if (roomTypeError) throw roomTypeError;

        // 6. Availability
        console.log("📅 Seeding Availability...");
        const availPayload = [];
        const today = new Date();
        roomTypeData.forEach(rt => {
            for (let i = 0; i < 7; i++) {
                const date = new Date();
                date.setDate(today.getDate() + i);
                availPayload.push({
                    RoomTypeID: rt.RoomTypeID,
                    Date: date.toISOString().split('T')[0],
                    NumberOfRooms: 5
                });
            }
        });

        // Batch insert
        const { error: availError } = await supabase.from('AVAILABILITY').insert(availPayload);
        if (availError) console.warn("⚠️ Availability seeding warning:", availError.message);

        // 7. User
        console.log("👤 Seeding Cloud Test User...");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("TravelGo123!", salt);
        await supabase.from('USER').upsert({
            UserID: uuidv4(),
            UserName: 'cloud_tester',
            Email: 'cloud@example.com',
            FName: 'Cloud',
            LName: 'Tester',
            Password: hashedPassword
        }, { onConflict: 'UserName' });

        console.log("🎉 Online Seeding Completed Successfully!");
    } catch (err) {
        console.error("❌ Seeding Failed:", err.message);
    }
}

fullSeed();

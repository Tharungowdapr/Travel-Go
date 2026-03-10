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

// High-quality hotel images from Unsplash
const SAMPLE_IMAGES = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80', // Resort pool
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80', // Luxury room
    'https://images.unsplash.com/photo-1512918760383-edce14717cf0?auto=format&fit=crop&q=80', // Bedroom
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80', // Modern interior
    'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&q=80', // Lobby
];

async function seedImages() {
    console.log('🚀 Starting Hotel Image Seeding...');

    try {
        // 1. Fetch all hotels
        const { data: hotels, error: hotelError } = await supabase
            .from('HOTEL')
            .select('HotelID, HotelName');

        if (hotelError) throw hotelError;
        console.log(`📍 Found ${hotels.length} hotels.`);

        for (const hotel of hotels) {
            // 2. Check if images already exist
            const { count, error: countError } = await supabase
                .from('HOTEL_IMAGE')
                .select('*', { count: 'exact', head: true })
                .eq('HotelID', hotel.HotelID);

            if (countError) throw countError;

            if (count > 0) {
                // console.log(`✓ [${hotel.HotelName}] already has ${count} images. Skipping.`);
                continue;
            }

            console.log(`📝 Seeding images for [${hotel.HotelName}]...`);

            // 3. Insert 1 random image for this hotel (Constraint seems to allow only 1 image or PK issue)
            const shuffled = [...SAMPLE_IMAGES].sort(() => 0.5 - Math.random());
            const selectedImage = shuffled[0];

            const imageToInsert = {
                HotelID: hotel.HotelID,
                HotelImage: selectedImage
            };

            const { error: insertError } = await supabase
                .from('HOTEL_IMAGE')
                .insert([imageToInsert]);

            if (insertError) {
                console.error(`❌ Failed to insert images for ${hotel.HotelName}:`, insertError.message);
            } else {
                console.log(`✅ Added image for ${hotel.HotelName}`);
            }
        }

        console.log('✨ Seeding complete!');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    }
}

seedImages();

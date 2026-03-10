
-- Refactored SQL Seed Data for TravelGo
-- This script uses subqueries to avoid hardcoded ID mismatches.

-- 1. Seed COUNTRY
INSERT INTO "COUNTRY" ("CountryName") VALUES 
('France'), ('United Kingdom'), ('Japan'), ('United States'), ('India'),
('Italy'), ('Spain'), ('Germany'), ('Canada'), ('Australia'),
('Brazil'), ('South Africa'), ('Thailand'), ('Mexico'), ('Greece'), ('Norway')
ON CONFLICT ("CountryName") DO NOTHING;

-- 2. Seed CITY (Using subqueries for CountryID)
INSERT INTO "CITY" ("CityName", "CountryID") VALUES 
('Paris', (SELECT "CountryID" FROM "COUNTRY" WHERE "CountryName" = 'France')),
('Lyon', (SELECT "CountryID" FROM "COUNTRY" WHERE "CountryName" = 'France')),
('Marseille', (SELECT "CountryID" FROM "COUNTRY" WHERE "CountryName" = 'France')),
('London', (SELECT "CountryID" FROM "COUNTRY" WHERE "CountryName" = 'United Kingdom')),
('Manchester', (SELECT "CountryID" FROM "COUNTRY" WHERE "CountryName" = 'United Kingdom')),
('Edinburgh', (SELECT "CountryID" FROM "COUNTRY" WHERE "CountryName" = 'United Kingdom')),
('Tokyo', (SELECT "CountryID" FROM "COUNTRY" WHERE "CountryName" = 'Japan')),
('Kyoto', (SELECT "CountryID" FROM "COUNTRY" WHERE "CountryName" = 'Japan')),
('Osaka', (SELECT "CountryID" FROM "COUNTRY" WHERE "CountryName" = 'Japan')),
('New York', (SELECT "CountryID" FROM "COUNTRY" WHERE "CountryName" = 'United States')),
('Los Angeles', (SELECT "CountryID" FROM "COUNTRY" WHERE "CountryName" = 'United States')),
('Chicago', (SELECT "CountryID" FROM "COUNTRY" WHERE "CountryName" = 'United States')),
('Bangalore', (SELECT "CountryID" FROM "COUNTRY" WHERE "CountryName" = 'India')),
('Mumbai', (SELECT "CountryID" FROM "COUNTRY" WHERE "CountryName" = 'India')),
('Delhi', (SELECT "CountryID" FROM "COUNTRY" WHERE "CountryName" = 'India')),
('Rome', (SELECT "CountryID" FROM "COUNTRY" WHERE "CountryName" = 'Italy')),
('Milan', (SELECT "CountryID" FROM "COUNTRY" WHERE "CountryName" = 'Italy')),
('Venice', (SELECT "CountryID" FROM "COUNTRY" WHERE "CountryName" = 'Italy')),
('Madrid', (SELECT "CountryID" FROM "COUNTRY" WHERE "CountryName" = 'Spain')),
('Barcelona', (SELECT "CountryID" FROM "COUNTRY" WHERE "CountryName" = 'Spain')),
('Seville', (SELECT "CountryID" FROM "COUNTRY" WHERE "CountryName" = 'Spain')),
('Berlin', (SELECT "CountryID" FROM "COUNTRY" WHERE "CountryName" = 'Germany')),
('Munich', (SELECT "CountryID" FROM "COUNTRY" WHERE "CountryName" = 'Germany')),
('Hamburg', (SELECT "CountryID" FROM "COUNTRY" WHERE "CountryName" = 'Germany')),
('Toronto', (SELECT "CountryID" FROM "COUNTRY" WHERE "CountryName" = 'Canada')),
('Vancouver', (SELECT "CountryID" FROM "COUNTRY" WHERE "CountryName" = 'Canada')),
('Montreal', (SELECT "CountryID" FROM "COUNTRY" WHERE "CountryName" = 'Canada')),
('Sydney', (SELECT "CountryID" FROM "COUNTRY" WHERE "CountryName" = 'Australia')),
('Melbourne', (SELECT "CountryID" FROM "COUNTRY" WHERE "CountryName" = 'Australia')),
('Brisbane', (SELECT "CountryID" FROM "COUNTRY" WHERE "CountryName" = 'Australia'));

-- 3. Seed HOTEL (Using subqueries for CityID)
INSERT INTO "HOTEL" ("HotelName", "HotelRating", "CityID", "LodgingType") VALUES 
('The Ritz Paris', 5, (SELECT "CityID" FROM "CITY" WHERE "CityName" = 'Paris' LIMIT 1), 'Hotel'),
('Hotel Lumiere Lyon', 4, (SELECT "CityID" FROM "CITY" WHERE "CityName" = 'Lyon' LIMIT 1), 'Boutique'),
('Marseille Marina Resort', 4, (SELECT "CityID" FROM "CITY" WHERE "CityName" = 'Marseille' LIMIT 1), 'Resort'),
('The Savoy London', 5, (SELECT "CityID" FROM "CITY" WHERE "CityName" = 'London' LIMIT 1), 'Hotel'),
('Manchester Central Inn', 3, (SELECT "CityID" FROM "CITY" WHERE "CityName" = 'Manchester' LIMIT 1), 'Hotel'),
('Edinburgh Castle View', 4, (SELECT "CityID" FROM "CITY" WHERE "CityName" = 'Edinburgh' LIMIT 1), 'Hotel'),
('Park Hyatt Tokyo', 5, (SELECT "CityID" FROM "CITY" WHERE "CityName" = 'Tokyo' LIMIT 1), 'Hotel'),
('Kyoto Zen Garden Inn', 4, (SELECT "CityID" FROM "CITY" WHERE "CityName" = 'Kyoto' LIMIT 1), 'Traditional'),
('Osaka Neon Heights', 3, (SELECT "CityID" FROM "CITY" WHERE "CityName" = 'Osaka' LIMIT 1), 'Apartment'),
('The Plaza New York', 5, (SELECT "CityID" FROM "CITY" WHERE "CityName" = 'New York' LIMIT 1), 'Hotel'),
('LA Sunset Resort', 4, (SELECT "CityID" FROM "CITY" WHERE "CityName" = 'Los Angeles' LIMIT 1), 'Resort'),
('Chicago Windy City Suites', 4, (SELECT "CityID" FROM "CITY" WHERE "CityName" = 'Chicago' LIMIT 1), 'Hotel'),
('The Leela Palace Bangalore', 5, (SELECT "CityID" FROM "CITY" WHERE "CityName" = 'Bangalore' LIMIT 1), 'Resort'),
('Mumbai Marine Drive Hotel', 4, (SELECT "CityID" FROM "CITY" WHERE "CityName" = 'Mumbai' LIMIT 1), 'Hotel'),
('Delhi heritage Haveli', 4, (SELECT "CityID" FROM "CITY" WHERE "CityName" = 'Delhi' LIMIT 1), 'Hotel'),
('Rome Eternal Suites', 5, (SELECT "CityID" FROM "CITY" WHERE "CityName" = 'Rome' LIMIT 1), 'Hotel'),
('Milan Fashion District Inn', 4, (SELECT "CityID" FROM "CITY" WHERE "CityName" = 'Milan' LIMIT 1), 'Boutique'),
('Venetian Gondola Palace', 5, (SELECT "CityID" FROM "CITY" WHERE "CityName" = 'Venice' LIMIT 1), 'Hotel'),
('Madrid Royal Plaza', 4, (SELECT "CityID" FROM "CITY" WHERE "CityName" = 'Madrid' LIMIT 1), 'Hotel'),
('Barcelona Beachfront', 5, (SELECT "CityID" FROM "CITY" WHERE "CityName" = 'Barcelona' LIMIT 1), 'Resort'),
('Seville Flamenco Inn', 3, (SELECT "CityID" FROM "CITY" WHERE "CityName" = 'Seville' LIMIT 1), 'Hostel'),
('Berlin Wall Boutique', 4, (SELECT "CityID" FROM "CITY" WHERE "CityName" = 'Berlin' LIMIT 1), 'Boutique'),
('Munich Beer Garden Hotel', 3, (SELECT "CityID" FROM "CITY" WHERE "CityName" = 'Munich' LIMIT 1), 'Hotel'),
('Hamburg Port Suites', 4, (SELECT "CityID" FROM "CITY" WHERE "CityName" = 'Hamburg' LIMIT 1), 'Apartment'),
('Toronto Maple Leaf Hotel', 4, (SELECT "CityID" FROM "CITY" WHERE "CityName" = 'Toronto' LIMIT 1), 'Hotel'),
('Vancouver Mountain Lodge', 5, (SELECT "CityID" FROM "CITY" WHERE "CityName" = 'Vancouver' LIMIT 1), 'Resort'),
('Old Montreal Charming Inn', 4, (SELECT "CityID" FROM "CITY" WHERE "CityName" = 'Montreal' LIMIT 1), 'Boutique'),
('Sydney Opera View', 5, (SELECT "CityID" FROM "CITY" WHERE "CityName" = 'Sydney' LIMIT 1), 'Hotel'),
('Melbourne Lane Way Suites', 4, (SELECT "CityID" FROM "CITY" WHERE "CityName" = 'Melbourne' LIMIT 1), 'Apartment'),
('Brisbane River Resort', 4, (SELECT "CityID" FROM "CITY" WHERE "CityName" = 'Brisbane' LIMIT 1), 'Resort');

-- 4. Seed HOTEL_IMAGE (Using subqueries for HotelID)
INSERT INTO "HOTEL_IMAGE" ("HotelID", "HotelImage") VALUES 
((SELECT "HotelID" FROM "HOTEL" WHERE "HotelName" = 'The Ritz Paris' LIMIT 1), 'https://images.unsplash.com/photo-1566073771259-6a8506099945'),
((SELECT "HotelID" FROM "HOTEL" WHERE "HotelName" = 'The Savoy London' LIMIT 1), 'https://images.unsplash.com/photo-1571896349842-33c89424de2d'),
((SELECT "HotelID" FROM "HOTEL" WHERE "HotelName" = 'Park Hyatt Tokyo' LIMIT 1), 'https://images.unsplash.com/photo-1590490360182-c33d57733427'),
((SELECT "HotelID" FROM "HOTEL" WHERE "HotelName" = 'The Plaza New York' LIMIT 1), 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa');

-- 5. Seed ROOM_TYPE (Using subqueries for HotelID)
INSERT INTO "ROOM_TYPE" ("HotelID", "RoomTypeName", "Price", "Capacity") VALUES 
((SELECT "HotelID" FROM "HOTEL" WHERE "HotelName" = 'The Ritz Paris' LIMIT 1), 'Superior Queen', 850.00, 2),
((SELECT "HotelID" FROM "HOTEL" WHERE "HotelName" = 'The Ritz Paris' LIMIT 1), 'Royal Suite', 2500.00, 4),
((SELECT "HotelID" FROM "HOTEL" WHERE "HotelName" = 'The Savoy London' LIMIT 1), 'Deluxe Single', 450.00, 1),
((SELECT "HotelID" FROM "HOTEL" WHERE "HotelName" = 'The Leela Palace Bangalore' LIMIT 1), 'Palace Suite', 800.00, 4);

-- 6. Seed USER
INSERT INTO "USER" ("UserID", "UserName", "FName", "LName", "Email", "Password", "Age", "Gender") VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'sql_tester', 'SQL', 'Tester', 'sql@example.com', '$2a$10$W2iXN8oXf0F5z6UoUv9C.e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t', 25, 'Other')
ON CONFLICT ("UserName") DO NOTHING;

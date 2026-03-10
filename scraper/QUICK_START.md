# Quick Start Guide - Hotel Scraper

## Setup (5 minutes)

### 1. Install Python Dependencies

```bash
cd scraper
pip install -r requirements.txt
```

### 2. Create .env File

Create a file named `.env` in the `scraper` directory with:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_service_role_key_here

# MongoDB Configuration (optional)
MONGODB_URI=your_mongodb_connection_string_here
MONGODB_DB_NAME=travelgo

# Scraping Configuration
SCRAPE_DELAY=2
MAX_RETRIES=3
```

### 3. Run the Scraper

```bash
python scraper.py
```

## What It Does

The scraper will:
1. ✅ Create sample hotel data for multiple cities
2. ✅ Insert countries into Supabase
3. ✅ Insert cities into Supabase
4. ✅ Insert hotels with images
5. ✅ Insert room types
6. ✅ Insert availability data (90 days)

## Customize Cities

Edit `scraper.py` and change the `cities_to_scrape` list:

```python
cities_to_scrape = [
    {'city': 'Paris', 'country': 'France'},
    {'city': 'Your City', 'country': 'Your Country'},
]
```

## Add Real Scraping

Replace the `scrape_generic_hotel_data()` call with actual scraping:

```python
# Instead of:
hotels = scraper.scrape_generic_hotel_data(city, country)

# Use:
hotels = scraper.scrape_booking_com(city, country)
```

**Note:** Real scraping requires handling anti-bot measures. See README.md for details.

## Check Results

1. Go to your Supabase dashboard
2. Check the tables: COUNTRY, CITY, HOTEL, ROOM_TYPE, AVAILABILITY
3. Verify data was inserted correctly

## Troubleshooting

- **Import errors**: Run `pip install -r requirements.txt`
- **Database errors**: Check your `.env` file credentials
- **No data inserted**: Check `scraper.log` for errors

For more details, see `README.md`.







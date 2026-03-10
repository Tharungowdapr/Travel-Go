# Hotel Data Scraper

Python web scraper to populate Supabase and MongoDB databases with hotel data.

## Features

- ✅ Web scraping from multiple sources (Booking.com, Expedia, etc.)
- ✅ Automatic database population (Supabase)
- ✅ Support for hotels, cities, countries, room types, and availability
- ✅ Error handling and logging
- ✅ Configurable scraping delays and retries

## Setup

### 1. Install Dependencies

```bash
cd scraper
pip install -r requirements.txt
```

Or use a virtual environment (recommended):

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

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

**Basic usage:**
```bash
python scraper.py
```

**Custom cities:**
Edit `scraper.py` and modify the `cities_to_scrape` list:

```python
cities_to_scrape = [
    {'city': 'Paris', 'country': 'France'},
    {'city': 'London', 'country': 'United Kingdom'},
    # Add more cities...
]
```

## Project Structure

```
scraper/
├── config.py              # Database connections and configuration
├── database_utils.py     # Database insertion functions
├── scraper.py            # Main scraping logic
├── requirements.txt      # Python dependencies
├── .env                  # Environment variables (create this)
└── scraper.log           # Log file (auto-generated)
```

## How It Works

1. **Scrapes hotel data** from websites (currently uses sample data template)
2. **Inserts countries** into Supabase COUNTRY table
3. **Inserts cities** into Supabase CITY table
4. **Inserts hotels** into Supabase HOTEL table
5. **Inserts hotel images** into Supabase HOTEL_IMAGE table
6. **Inserts room types** into Supabase ROOM_TYPE table
7. **Inserts availability** into Supabase AVAILABILITY table (90 days)

## Customizing the Scraper

### Adding New Scraping Sources

1. Add a new method in `scraper.py`:

```python
def scrape_your_source(self, city: str, country: str) -> List[Dict]:
    """Scrape from your source"""
    # Your scraping logic here
    hotels = []
    # ... scraping code ...
    return hotels
```

2. Call it in `scrape_and_populate()`:

```python
hotels = scraper.scrape_your_source(city, country)
```

### Using Selenium for JavaScript-Heavy Sites

For sites that require JavaScript, use Selenium:

```python
from selenium import webdriver
from selenium.webdriver.common.by import By

def scrape_with_selenium(self, url: str):
    driver = webdriver.Chrome()  # or Firefox()
    driver.get(url)
    # Wait for page to load
    time.sleep(3)
    # Extract data
    elements = driver.find_elements(By.CSS_SELECTOR, '.hotel-card')
    # ... process elements ...
    driver.quit()
```

## Data Structure

### Hotel Data Format

```python
{
    'name': 'Hotel Name',
    'rating': 4.5,
    'price': 150,
    'images': ['url1', 'url2'],
    'description': 'Hotel description',
    'amenities': ['WiFi', 'Pool'],
    'rooms': [
        {
            'name': 'Standard Room',
            'price': 150,
            'capacity': 2
        }
    ],
    'city': 'Paris',
    'country': 'France'
}
```

## Important Notes

### Legal and Ethical Considerations

⚠️ **Before scraping any website:**

1. **Check robots.txt**: Visit `https://website.com/robots.txt`
2. **Read Terms of Service**: Many sites prohibit scraping
3. **Respect rate limits**: Use delays between requests
4. **Use APIs when available**: Many sites offer official APIs
5. **Consider legal implications**: Web scraping may violate terms of service

### Recommended Approach

Instead of scraping, consider:

1. **Official APIs**: 
   - Booking.com API
   - Expedia API
   - Hotels.com API
   - Amadeus API (travel data)

2. **Public Datasets**:
   - Open datasets from tourism boards
   - Government tourism data

3. **Manual Data Entry**: For small datasets

## Example: Using Official APIs

### Amadeus API Example

```python
import requests

def get_hotels_amadeus(city_code: str):
    url = "https://api.amadeus.com/v1/reference-data/locations/hotels/by-city"
    headers = {
        'Authorization': f'Bearer {AMADEUS_TOKEN}'
    }
    params = {
        'cityCode': city_code
    }
    response = requests.get(url, headers=headers, params=params)
    return response.json()
```

## Troubleshooting

### Connection Errors

- Check your Supabase credentials
- Verify network connection
- Check firewall settings

### Scraping Errors

- Some sites block automated requests
- Use Selenium for JavaScript-heavy sites
- Increase `SCRAPE_DELAY` if getting rate-limited
- Use proxies if necessary (be careful with legal implications)

### Database Errors

- Verify table structure matches ERD schema
- Check foreign key relationships
- Ensure required fields are provided

## Logging

All operations are logged to:
- Console (stdout)
- `scraper.log` file

Check logs for errors and debugging information.

## Next Steps

1. ✅ Set up environment variables
2. ✅ Install dependencies
3. ✅ Customize scraping logic for your sources
4. ✅ Run scraper
5. ✅ Verify data in Supabase dashboard

## Legal Disclaimer

This scraper is provided for educational purposes. Always:
- Respect website terms of service
- Follow robots.txt guidelines
- Use official APIs when available
- Consider legal implications before scraping

Use at your own risk.







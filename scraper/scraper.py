"""
Main web scraper for hotel data
Supports multiple sources: Booking.com, Expedia, Hotels.com, etc.
"""
import requests
from bs4 import BeautifulSoup
import time
import logging
from typing import List, Dict, Optional
try:
    from fake_useragent import UserAgent  # optional, may not be installed
except Exception:
    UserAgent = None

from config import SCRAPE_DELAY, MAX_RETRIES, USER_AGENT
from database_utils import (
    insert_country, insert_city, insert_hotel, 
    insert_room_type, insert_availability
)

logger = logging.getLogger(__name__)

class HotelScraper:
    def __init__(self):
        self.session = requests.Session()
        # Use fake_useragent when available, otherwise fall back to static USER_AGENT
        self.ua = UserAgent() if UserAgent is not None else None
        self.scraped_hotels = []
    
    def get_headers(self) -> Dict:
        """Get headers for requests"""
        return {
            'User-Agent': (self.ua.random if (self.ua is not None and hasattr(self.ua, 'random')) else USER_AGENT),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        }
    
    def fetch_page(self, url: str, retries: int = MAX_RETRIES) -> Optional[BeautifulSoup]:
        """Fetch and parse a webpage"""
        for attempt in range(retries):
            try:
                response = self.session.get(url, headers=self.get_headers(), timeout=10)
                response.raise_for_status()
                return BeautifulSoup(response.content, 'html.parser')
            except Exception as e:
                logger.warning(f"Attempt {attempt + 1} failed for {url}: {e}")
                if attempt < retries - 1:
                    time.sleep(SCRAPE_DELAY * (attempt + 1))
                else:
                    logger.error(f"Failed to fetch {url} after {retries} attempts")
        return None
    
    def scrape_booking_com(self, city: str, country: str, num_hotels: int = 10) -> List[Dict]:
        """
        Scrape hotels from Booking.com
        Note: This is a template. Booking.com has anti-scraping measures.
        You may need to use Selenium or their API.
        """
        logger.info(f"Scraping Booking.com for {city}, {country}")
        hotels = []
        
        # Example URL structure (you'll need to adjust based on actual Booking.com structure)
        base_url = f"https://www.booking.com/searchresults.html"
        params = {
            'ss': f"{city}, {country}",
            'checkin_month': '1',
            'checkin_monthday': '1',
            'checkout_month': '1',
            'checkout_monthday': '2'
        }
        
        try:
            url = f"{base_url}?ss={params['ss']}"
            soup = self.fetch_page(url)
            
            if not soup:
                logger.warning("Could not fetch Booking.com page")
                return hotels
            
            # Parse hotel listings (adjust selectors based on actual HTML structure)
            hotel_elements = soup.select('[data-testid="property-card"]')[:num_hotels]
            
            for element in hotel_elements:
                try:
                    hotel = {
                        'name': self._extract_text(element, '[data-testid="title"]'),
                        'rating': self._extract_rating(element),
                        'price': self._extract_price(element),
                        'images': self._extract_images(element),
                        'description': self._extract_text(element, '[data-testid="property-description"]'),
                        'amenities': self._extract_amenities(element),
                        'city': city,
                        'country': country
                    }
                    hotels.append(hotel)
                    time.sleep(SCRAPE_DELAY)
                except Exception as e:
                    logger.error(f"Error parsing hotel element: {e}")
                    continue
            
            logger.info(f"✅ Scraped {len(hotels)} hotels from Booking.com")
        except Exception as e:
            logger.error(f"Error scraping Booking.com: {e}")
        
        return hotels
    
    def scrape_expedia(self, city: str, country: str, num_hotels: int = 10) -> List[Dict]:
        """Scrape hotels from Expedia"""
        logger.info(f"Scraping Expedia for {city}, {country}")
        hotels = []
        
        # Expedia scraping logic (similar structure)
        # Note: Expedia also has anti-scraping measures
        
        return hotels
    
    def scrape_generic_hotel_data(self, city: str, country: str) -> List[Dict]:
        """
        Generic scraper that creates sample hotel data
        Use this as a template or for testing
        """
        logger.info(f"Generating sample hotel data for {city}, {country}")
        
        sample_hotels = [
            {
                'name': f'Grand Hotel {city}',
                'rating': 4.5,
                'price': 150,
                'images': [
                    'https://images.unsplash.com/photo-1566073771259-6a8506099945',
                    'https://images.unsplash.com/photo-1571896349842-33c89424de2d'
                ],
                'description': f'Luxurious hotel in the heart of {city}',
                'amenities': ['WiFi', 'Pool', 'Spa', 'Restaurant'],
                'rooms': [
                    {
                        'name': 'Standard Room',
                        'price': 150,
                        'capacity': 2
                    },
                    {
                        'name': 'Deluxe Room',
                        'price': 200,
                        'capacity': 3
                    },
                    {
                        'name': 'Suite',
                        'price': 350,
                        'capacity': 4
                    }
                ],
                'city': city,
                'country': country
            },
            {
                'name': f'Budget Inn {city}',
                'rating': 3.5,
                'price': 80,
                'images': [
                    'https://images.unsplash.com/photo-1590490360182-c33d57733427'
                ],
                'description': f'Affordable accommodation in {city}',
                'amenities': ['WiFi', 'Parking'],
                'rooms': [
                    {
                        'name': 'Single Room',
                        'price': 80,
                        'capacity': 1
                    },
                    {
                        'name': 'Double Room',
                        'price': 100,
                        'capacity': 2
                    }
                ],
                'city': city,
                'country': country
            },
            {
                'name': f'Beach Resort {city}',
                'rating': 4.8,
                'price': 300,
                'images': [
                    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa',
                    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9'
                ],
                'description': f'Beachfront resort in {city}',
                'amenities': ['WiFi', 'Pool', 'Beach Access', 'Spa', 'Restaurant', 'Bar'],
                'rooms': [
                    {
                        'name': 'Ocean View Room',
                        'price': 300,
                        'capacity': 2
                    },
                    {
                        'name': 'Beachfront Suite',
                        'price': 500,
                        'capacity': 4
                    }
                ],
                'city': city,
                'country': country
            }
        ]
        
        return sample_hotels
    
    def _extract_text(self, element, selector: str) -> str:
        """Extract text from element using selector"""
        try:
            found = element.select_one(selector)
            return found.get_text(strip=True) if found else ''
        except:
            return ''
    
    def _extract_rating(self, element) -> float:
        """Extract rating from element"""
        try:
            rating_text = self._extract_text(element, '[data-testid="review-score"]')
            # Parse rating from text (e.g., "8.5" or "Excellent 9.2")
            import re
            rating_match = re.search(r'(\d+\.?\d*)', rating_text)
            return float(rating_match.group(1)) if rating_match else 0.0
        except:
            return 0.0
    
    def _extract_price(self, element) -> float:
        """Extract price from element"""
        try:
            price_text = self._extract_text(element, '[data-testid="price"]')
            # Remove currency symbols and parse
            import re
            price_match = re.search(r'(\d+)', price_text.replace(',', ''))
            return float(price_match.group(1)) if price_match else 0.0
        except:
            return 0.0
    
    def _extract_images(self, element) -> List[str]:
        """Extract image URLs from element"""
        try:
            images = []
            img_elements = element.select('img')
            for img in img_elements:
                src = img.get('src') or img.get('data-src')
                if src and src.startswith('http'):
                    images.append(src)
            return images[:5]  # Limit to 5 images
        except:
            return []
    
    def _extract_amenities(self, element) -> List[str]:
        """Extract amenities from element"""
        try:
            amenities = []
            amenity_elements = element.select('[data-testid="amenity"]')
            for amenity in amenity_elements:
                text = amenity.get_text(strip=True)
                if text:
                    amenities.append(text)
            return amenities
        except:
            return []


# Sample review data
SAMPLE_REVIEWS = [
    "Great hotel with excellent service and clean rooms!",
    "Perfect location, friendly staff, and affordable prices.",
    "Amazing experience! The staff was very helpful and the rooms were spacious.",
    "Would definitely stay here again. Highly recommended!",
    "Wonderful stay, beautiful accommodations and great amenities.",
    "Excellent customer service and comfortable beds.",
    "The hotel exceeded my expectations in every way.",
    "Outstanding value for money, will return soon.",
    "Staff was very professional and the food was delicious.",
    "Perfect for business travelers, good WiFi and quiet rooms.",
    "Loved the location and the breakfast was great!",
    "Clean rooms, friendly atmosphere, and fair prices.",
    "Very comfortable stay, great breakfast buffet.",
    "Highly satisfied with our stay here.",
    "Exceptional service and wonderful accommodations.",
    "Great hotel for families, kids loved the pool.",
    "Perfect location for sightseeing, everything within walking distance.",
    "The rooms are modern and well-equipped.",
    "Staff goes above and beyond to help guests.",
    "Fantastic experience from check-in to check-out.",
]

SAMPLE_REVIEWER_NAMES = [
    "John", "Sarah", "Michael", "Emma", "David", "Jessica", "Robert", "Amanda",
    "James", "Lisa", "Christopher", "Michelle", "Daniel", "Ashley", "Matthew"
]

def generate_sample_reviews(hotel_id: int, num_reviews: int = 5):
    """Generate and insert sample reviews for a hotel"""
    for _ in range(min(num_reviews, 5)):
        # Generate random review
        review_text = random.choice(SAMPLE_REVIEWS)
        reviewer_name = random.choice(SAMPLE_REVIEWER_NAMES)
        
        # Create a pseudo user ID for the reviewer
        user_id = str(uuid.uuid4())
        
        try:
            insert_review(hotel_id, user_id, review_text)
        except Exception as e:
            logger.error(f"Error inserting review for hotel {hotel_id}: {e}")


def scrape_and_populate(cities_data: List[Dict]):
    """
    Main function to scrape hotels and populate databases
    
    Args:
        cities_data: List of dicts with 'city' and 'country' keys
    """
    scraper = HotelScraper()
    
    for city_info in cities_data:
        city = city_info['city']
        country = city_info['country']
        
        logger.info(f"\n{'='*50}")
        logger.info(f"Processing: {city}, {country}")
        logger.info(f"{'='*50}\n")
        
        # Insert country and get country_id
        country_id = insert_country(country)
        if not country_id:
            logger.error(f"Failed to insert country: {country}")
            continue
        
        # Insert city and get city_id
        city_id = insert_city(city, country_id)
        if not city_id:
            logger.error(f"Failed to insert city: {city}")
            continue
        
        # Scrape hotels (using generic data for now)
        # Replace with actual scraping method: scraper.scrape_booking_com(city, country)
        hotels = scraper.scrape_generic_hotel_data(city, country)
        
        for hotel_data in hotels:
            try:
                # Insert hotel
                hotel_id = insert_hotel({
                    'name': hotel_data['name'],
                    'rating': hotel_data.get('rating', 0),
                    'city_id': city_id,
                    'images': hotel_data.get('images', [])
                })
                
                if not hotel_id:
                    continue
                
                # Insert room types
                for room_data in hotel_data.get('rooms', []):
                    room_type_id = insert_room_type(hotel_id, {
                        'name': room_data['name'],
                        'price': room_data['price'],
                        'capacity': room_data.get('capacity', 2),
                        'availability': {'default': 10}  # Default 10 rooms available
                    })
                
                # Generate and insert sample reviews
                generate_sample_reviews(hotel_id, num_reviews=5)
                
                logger.info(f"✅ Successfully inserted hotel: {hotel_data['name']}")
                time.sleep(SCRAPE_DELAY)
                
            except Exception as e:
                logger.error(f"Error processing hotel {hotel_data.get('name', 'Unknown')}: {e}")
                continue
        
        logger.info(f"\n✅ Completed processing {city}, {country}\n")


if __name__ == '__main__':
    # Example usage: 10 countries, 3 cities each
    cities_to_scrape = [
        # France
        {'city': 'Paris', 'country': 'France'},
        {'city': 'Lyon', 'country': 'France'},
        {'city': 'Marseille', 'country': 'France'},
        # United Kingdom
        {'city': 'London', 'country': 'United Kingdom'},
        {'city': 'Manchester', 'country': 'United Kingdom'},
        {'city': 'Edinburgh', 'country': 'United Kingdom'},
        # Japan
        {'city': 'Tokyo', 'country': 'Japan'},
        {'city': 'Kyoto', 'country': 'Japan'},
        {'city': 'Osaka', 'country': 'Japan'},
        # United States
        {'city': 'New York', 'country': 'United States'},
        {'city': 'Los Angeles', 'country': 'United States'},
        {'city': 'Chicago', 'country': 'United States'},
        # Germany
        {'city': 'Berlin', 'country': 'Germany'},
        {'city': 'Munich', 'country': 'Germany'},
        {'city': 'Hamburg', 'country': 'Germany'},
        # Italy
        {'city': 'Rome', 'country': 'Italy'},
        {'city': 'Milan', 'country': 'Italy'},
        {'city': 'Venice', 'country': 'Italy'},
        # Spain
        {'city': 'Madrid', 'country': 'Spain'},
        {'city': 'Barcelona', 'country': 'Spain'},
        {'city': 'Valencia', 'country': 'Spain'},
        # Canada
        {'city': 'Toronto', 'country': 'Canada'},
        {'city': 'Vancouver', 'country': 'Canada'},
        {'city': 'Montreal', 'country': 'Canada'},
        # Australia
        {'city': 'Sydney', 'country': 'Australia'},
        {'city': 'Melbourne', 'country': 'Australia'},
        {'city': 'Brisbane', 'country': 'Australia'},
        # Brazil
        {'city': 'Rio de Janeiro', 'country': 'Brazil'},
        {'city': 'São Paulo', 'country': 'Brazil'},
        {'city': 'Salvador', 'country': 'Brazil'},
    ]
    
    scrape_and_populate(cities_to_scrape)
    logger.info("🎉 Scraping completed!")







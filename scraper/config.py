import os
from dotenv import load_dotenv
from supabase import create_client, Client
from pymongo import MongoClient
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scraper.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

# MongoDB configuration
MONGODB_URI = os.getenv('MONGODB_URI')
MONGODB_DB_NAME = os.getenv('MONGODB_DB_NAME', 'travelgo')

# Scraping configuration
SCRAPE_DELAY = int(os.getenv('SCRAPE_DELAY', 2))
MAX_RETRIES = int(os.getenv('MAX_RETRIES', 3))
USER_AGENT = os.getenv('USER_AGENT', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')

# Initialize Supabase client
supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("✅ Supabase client initialized")
    except Exception as e:
        logger.error(f"❌ Failed to initialize Supabase: {e}")
else:
    logger.warning("⚠️ Supabase credentials not found")

# Initialize MongoDB client
mongodb_client = None
mongodb_db = None
if MONGODB_URI:
    try:
        mongodb_client = MongoClient(MONGODB_URI)
        mongodb_db = mongodb_client[MONGODB_DB_NAME]
        logger.info("✅ MongoDB client initialized")
    except Exception as e:
        logger.error(f"❌ Failed to initialize MongoDB: {e}")
else:
    logger.warning("⚠️ MongoDB URI not found")







import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # Database configuration for PostgreSQL
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Application configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev')
    
    # CORS configuration
    CORS_HEADERS = 'Content-Type'

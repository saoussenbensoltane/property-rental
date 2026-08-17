from pymongo import AsyncMongoClient
from beanie import init_beanie
from models import User, Property, Booking

async def init_db():
    client = AsyncMongoClient("mongodb://localhost:27017")
    await init_beanie(database=client.property_rental_db, document_models=[User, Property, Booking])
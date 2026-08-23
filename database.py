# database.py
import motor.motor_asyncio
from beanie import init_beanie
from models import User, Property, Booking, Review
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
async def init_db():
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
    await init_beanie(
        database=client.property_rental_db,
        document_models=[User, Property, Booking ,Review]  
    )
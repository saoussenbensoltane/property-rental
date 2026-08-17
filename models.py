from beanie import Document
from pydantic import EmailStr
from datetime import datetime

class User(Document):
    email: EmailStr
    password_hash: str
    role: str = "user"  # "user", "owner", "admin"

    class Settings:
        name = "users"


class Property(Document):
    title: str
    description: str
    price: float
    location: str
    type: str  # appartement, maison, studio...
    owner_id: str
    images: list[str] = []

    class Settings:
        name = "properties"


class Booking(Document):
    property_id: str
    user_id: str
    start_date: datetime
    end_date: datetime
    status: str = "pending"  # "pending", "confirmed", "cancelled"

    class Settings:
        name = "bookings"
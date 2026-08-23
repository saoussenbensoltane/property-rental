# models.py
from beanie import Document
from pydantic import EmailStr
from datetime import datetime
from typing import Optional

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
    created_at: datetime = datetime.now()
    average_rating: float = 0  # ✅ AJOUT
    review_count: int = 0      # ✅ AJOUT

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


# ✅ NOUVEAU MODÈLE POUR LES AVIS
class Review(Document):
    property_id: str
    user_id: str
    user_email: str
    rating: int  # 1 à 5 étoiles
    comment: str
    created_at: datetime = datetime.now()
    updated_at: Optional[datetime] = None

    class Settings:
        name = "reviews"
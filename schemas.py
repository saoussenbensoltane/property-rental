from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from typing import Optional
import re

# ==================== AUTH ====================
class UserCreate(BaseModel):
    email: EmailStr = Field(
        ..., 
        description="Email de l'utilisateur",
        example="user@example.com"
    )
    password: str = Field(
        ..., 
        min_length=8, 
        max_length=100,
        description="Mot de passe (8 caractères minimum)",
        example="Password123!"
    )
    role: str = Field(
        default="user", 
        pattern="^(user|owner|admin)$",
        description="Rôle de l'utilisateur",
        example="user"
    )
    
    @validator('password')
    def validate_password(cls, v):
        """Valider la complexité du mot de passe"""
        if not re.search(r'[A-Z]', v):
            raise ValueError('Le mot de passe doit contenir au moins une majuscule')
        if not re.search(r'[a-z]', v):
            raise ValueError('Le mot de passe doit contenir au moins une minuscule')
        if not re.search(r'[0-9]', v):
            raise ValueError('Le mot de passe doit contenir au moins un chiffre')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Le mot de passe doit contenir au moins un caractère spécial')
        return v

class UserLogin(BaseModel):
    email: EmailStr = Field(
        ..., 
        description="Email de l'utilisateur",
        example="user@example.com"
    )
    password: str = Field(
        ..., 
        min_length=8,
        description="Mot de passe",
        example="Password123!"
    )

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr = Field(
        ..., 
        description="Email pour la réinitialisation",
        example="user@example.com"
    )

class ForgotPasswordResponse(BaseModel):
    message: str
    temp_password: str


# ==================== PROPRIÉTÉS ====================
class PropertyCreate(BaseModel):
    title: str = Field(
        ..., 
        min_length=3, 
        max_length=100,
        description="Titre du logement",
        example="Villa avec piscine"
    )
    description: str = Field(
        ..., 
        min_length=10, 
        max_length=2000,
        description="Description détaillée du logement",
        example="Magnifique villa avec vue imprenable sur la mer"
    )
    price: float = Field(
        ..., 
        ge=0, 
        le=99999999,
        description="Prix par nuit en TND",
        example=150.00
    )
    location: str = Field(
        ..., 
        min_length=2, 
        max_length=100,
        description="Localisation du logement",
        example="Yasmine Hammamet"
    )
    type: str = Field(
        ..., 
        pattern="^(appartement|villa|maison|studio)$",
        description="Type de logement",
        example="villa"
    )

    @validator('title')
    def validate_title(cls, v):
        """Valider que le titre n'est pas vide et est correctement formaté"""
        if v.strip() == '':
            raise ValueError('Le titre ne peut pas être vide')
        if len(v.strip()) < 3:
            raise ValueError('Le titre doit contenir au moins 3 caractères')
        return v.strip()

    @validator('description')
    def validate_description(cls, v):
        """Valider que la description n'est pas vide"""
        if v.strip() == '':
            raise ValueError('La description ne peut pas être vide')
        return v.strip()

    @validator('location')
    def validate_location(cls, v):
        """Valider que la localisation n'est pas vide"""
        if v.strip() == '':
            raise ValueError('La localisation ne peut pas être vide')
        return v.strip()

    @validator('price')
    def validate_price(cls, v):
        """Valider que le prix est positif"""
        if v <= 0:
            raise ValueError('Le prix doit être supérieur à 0')
        return v


class PropertyOut(BaseModel):
    id: str
    title: str
    description: str
    price: float
    location: str
    type: str
    owner_id: str
    images: list[str] = []


class PropertyUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = Field(None, min_length=10, max_length=2000)
    price: Optional[float] = Field(None, ge=0, le=99999999)
    location: Optional[str] = Field(None, min_length=2, max_length=100)
    type: Optional[str] = Field(None, pattern="^(appartement|villa|maison|studio)$")


# ==================== RÉSERVATIONS ====================
class BookingCreate(BaseModel):
    property_id: str = Field(
        ..., 
        description="ID du logement à réserver",
        example="67c4a3b2d5f8e9a1b2c3d4e5"
    )
    start_date: datetime = Field(
        ..., 
        description="Date de début du séjour",
        example="2026-08-01T00:00:00"
    )
    end_date: datetime = Field(
        ..., 
        description="Date de fin du séjour",
        example="2026-08-31T00:00:00"
    )

    @validator('start_date')
    def validate_start_date(cls, v):
        """Valider que la date de départ n'est pas dans le passé"""
        if v.date() < datetime.now().date():
            raise ValueError('La date de départ ne peut pas être dans le passé')
        return v

    @validator('end_date')
    def validate_end_date(cls, v, values):
        """Valider que la date d'arrivée est après la date de départ"""
        if 'start_date' in values:
            if v <= values['start_date']:
                raise ValueError('La date d\'arrivée doit être après la date de départ')
        return v

    @validator('end_date')
    def validate_duration(cls, v, values):
        """Valider que le séjour dure au moins 1 nuit"""
        if 'start_date' in values:
            diff = (v - values['start_date']).days
            if diff < 1:
                raise ValueError('Le séjour doit durer au moins 1 nuit')
        return v


# 👇 SCHÉMA POUR LES RÉSERVATIONS AVEC INFOS PROPRIÉTÉ
class BookingOut(BaseModel):
    id: str
    property_id: str
    property_title: str          # Nom du logement
    property_location: str       # Localisation du logement
    user_id: str
    start_date: datetime
    end_date: datetime
    status: str  # "pending", "confirmed", "cancelled"


class BookingUpdateStatus(BaseModel):
    status: str = Field(
        ..., 
        pattern="^(confirmed|cancelled)$",
        description="Nouveau statut de la réservation",
        example="confirmed"
    )


# ==================== ADMIN ====================
class UserUpdateRole(BaseModel):
    role: str = Field(
        ..., 
        pattern="^(user|owner|admin)$",
        description="Nouveau rôle de l'utilisateur",
        example="owner"
    )


class StatsResponse(BaseModel):
    total_users: int
    total_owners: int
    total_properties: int
    total_bookings: int
    pending_bookings: int
    confirmed_bookings: int


class UserOut(BaseModel):
    id: str
    email: str
    role: str


# ==================== UTILITAIRES ====================
class SearchParams(BaseModel):
    location: Optional[str] = Field(None, min_length=1, max_length=100)
    type: Optional[str] = Field(None, pattern="^(appartement|villa|maison|studio)$")
    min_price: Optional[float] = Field(None, ge=0)
    max_price: Optional[float] = Field(None, ge=0)

    @validator('max_price')
    def validate_price_range(cls, v, values):
        """Valider que max_price est supérieur à min_price"""
        if 'min_price' in values and values['min_price'] is not None:
            if v is not None and v < values['min_price']:
                raise ValueError('Le prix maximum doit être supérieur au prix minimum')
        return v
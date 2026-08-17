from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = "user"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ForgotPasswordResponse(BaseModel):
    message: str
    temp_password: str


class PropertyCreate(BaseModel):
    title: str
    description: str
    price: float
    location: str
    type: str

class PropertyOut(BaseModel):
    id: str
    title: str
    description: str
    price: float
    location: str
    type: str
    owner_id: str
    images: list[str] = []


class BookingCreate(BaseModel):
    property_id: str
    start_date: datetime
    end_date: datetime
# auth.py
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from models import User
from schemas import ForgotPasswordRequest, ForgotPasswordResponse
import secrets
import string

SECRET_KEY = "change-moi-en-production"  # In production, use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer(auto_error=False)  # Set to False for optional auth


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def generate_reset_token():
    """Generate a secure random token for password reset"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(32))


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
) -> User:
    """
    Get current user from JWT token - required authentication
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Impossible de valider les identifiants",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await User.find_one(User.email == email)
    if user is None:
        raise credentials_exception
    return user


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)
) -> Optional[User]:
    """
    Get current user if authenticated, otherwise None
    """
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None


def require_role(required_role: str):
    """
    Dependency to require a specific role
    """
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role != required_role and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Accès réservé aux {required_role}"
            )
        return current_user
    return role_checker


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency to require admin role
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs"
        )
    return current_user


async def create_user(email: str, password: str, role: str = "user") -> User:
    """
    Create a new user
    """
    hashed_password = hash_password(password)
    user = User(
        email=email,
        password_hash=hashed_password,
        role=role
    )
    await user.insert()
    return user


async def authenticate_user(email: str, password: str) -> Optional[User]:
    """
    Authenticate user with email and password
    """
    user = await User.find_one(User.email == email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def create_user_token(user: User) -> str:
    """
    Create JWT token for user
    """
    return create_access_token({"sub": user.email})


# For password reset functionality
reset_tokens = {}  # email -> token (in production, store in Redis or database)

async def create_password_reset_token(email: str) -> str:
    """
    Create a password reset token and store it
    """
    token = generate_reset_token()
    reset_tokens[email] = {
        "token": token,
        "created_at": datetime.utcnow()
    }
    return token

async def verify_reset_token(email: str, token: str) -> bool:
    """
    Verify if reset token is valid
    """
    if email not in reset_tokens:
        return False
    stored_data = reset_tokens[email]
    if stored_data["token"] != token:
        return False
    # Token expires after 1 hour
    if datetime.utcnow() - stored_data["created_at"] > timedelta(hours=1):
        return False
    return True

async def reset_user_password(email: str, new_password: str) -> bool:
    """
    Reset user password
    """
    user = await User.find_one(User.email == email)
    if not user:
        return False
    
    user.password_hash = hash_password(new_password)
    await user.save()
    
    # Clear reset token
    if email in reset_tokens:
        del reset_tokens[email]
    
    return True
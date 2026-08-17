import secrets
import string
from fastapi import APIRouter, HTTPException, Depends
from models import User
from schemas import UserCreate, UserLogin, Token, ForgotPasswordRequest, ForgotPasswordResponse
from auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=Token)
async def register(user_data: UserCreate):
    if user_data.role == "admin":
        raise HTTPException(403, "Impossible de s'inscrire en tant qu'admin")

    existing = await User.find_one(User.email == user_data.email)
    if existing:
        raise HTTPException(400, "Email déjà utilisé")

    new_user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role=user_data.role
    )
    await new_user.insert()

    token = create_access_token({"sub": new_user.email, "role": new_user.role})
    return Token(access_token=token, role=new_user.role, user_id=str(new_user.id))


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    user = await User.find_one(User.email == credentials.email)
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(401, "Email ou mot de passe incorrect")

    token = create_access_token({"sub": user.email, "role": user.role})
    return Token(access_token=token, role=user.role, user_id=str(user.id))


@router.get("/me")
async def get_my_profile(current_user: User = Depends(get_current_user)):
    return {"email": current_user.email, "role": current_user.role}


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(data: ForgotPasswordRequest):
    user = await User.find_one(User.email == data.email)
    if not user:
        raise HTTPException(404, "Aucun compte associé à cet email")

    alphabet = string.ascii_letters + string.digits
    temp_password = ''.join(secrets.choice(alphabet) for _ in range(10))

    user.password_hash = hash_password(temp_password)
    await user.save()

    return ForgotPasswordResponse(
        message="Mot de passe temporaire généré. Connectez-vous puis changez-le dès que possible.",
        temp_password=temp_password
    )
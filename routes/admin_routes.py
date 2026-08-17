from fastapi import APIRouter, HTTPException, Depends
from models import User, Property, Booking
from auth import require_role

router = APIRouter(prefix="/admin", tags=["admin"])


# --- Gestion des utilisateurs ---

@router.get("/users")
async def list_users(current_user: User = Depends(require_role("admin"))):
    users = await User.find_all().to_list()
    return [{"id": str(u.id), "email": u.email, "role": u.role} for u in users]


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = Depends(require_role("admin"))
):
    user = await User.get(user_id)
    if not user:
        raise HTTPException(404, "Utilisateur introuvable")
    await user.delete()
    return {"message": "Utilisateur supprimé"}


@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role: str,
    current_user: User = Depends(require_role("admin"))
):
    if role not in ["user", "owner", "admin"]:
        raise HTTPException(400, "Rôle invalide")

    user = await User.get(user_id)
    if not user:
        raise HTTPException(404, "Utilisateur introuvable")

    user.role = role
    await user.save()
    return {"message": f"Rôle mis à jour vers {role}"}


# --- Gestion des propriétés (vue admin) ---

@router.get("/properties")
async def list_all_properties(current_user: User = Depends(require_role("admin"))):
    properties = await Property.find_all().to_list()
    return properties


# --- Statistiques / Dashboard ---

@router.get("/stats")
async def get_stats(current_user: User = Depends(require_role("admin"))):
    total_users = await User.find_all().count()
    total_owners = await User.find(User.role == "owner").count()
    total_properties = await Property.find_all().count()
    total_bookings = await Booking.find_all().count()
    pending_bookings = await Booking.find(Booking.status == "pending").count()
    confirmed_bookings = await Booking.find(Booking.status == "confirmed").count()

    return {
        "total_users": total_users,
        "total_owners": total_owners,
        "total_properties": total_properties,
        "total_bookings": total_bookings,
        "pending_bookings": pending_bookings,
        "confirmed_bookings": confirmed_bookings,
    }
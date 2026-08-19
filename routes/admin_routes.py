from fastapi import APIRouter, HTTPException, Depends
from models import User, Property, Booking
from schemas import UserUpdateRole  # 👈 Importer le schéma de validation
from auth import require_role

router = APIRouter(prefix="/admin", tags=["admin"])


# ==================== GESTION DES UTILISATEURS ====================

@router.get("/users")
async def list_users(current_user: User = Depends(require_role("admin"))):
    """
    Récupérer la liste de tous les utilisateurs
    (Réservé aux administrateurs)
    """
    users = await User.find_all().to_list()
    return [
        {
            "id": str(u.id), 
            "email": u.email, 
            "role": u.role
        } 
        for u in users
    ]


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = Depends(require_role("admin"))
):
    """
    Supprimer un utilisateur par son ID
    (Réservé aux administrateurs)
    """
    user = await User.get(user_id)
    if not user:
        raise HTTPException(404, "Utilisateur introuvable")
    
    # Empêcher la suppression de son propre compte
    if str(user.id) == str(current_user.id):
        raise HTTPException(400, "Vous ne pouvez pas supprimer votre propre compte")
    
    await user.delete()
    return {"message": "Utilisateur supprimé avec succès"}


@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    data: UserUpdateRole,  # 👈 Validation automatique avec Pydantic
    current_user: User = Depends(require_role("admin"))
):
    """
    Mettre à jour le rôle d'un utilisateur
    (Réservé aux administrateurs)
    
    Rôles possibles : user, owner, admin
    """
    # Vérifier que l'utilisateur existe
    user = await User.get(user_id)
    if not user:
        raise HTTPException(404, "Utilisateur introuvable")
    
    # Empêcher la modification de son propre rôle
    if str(user.id) == str(current_user.id):
        raise HTTPException(400, "Vous ne pouvez pas modifier votre propre rôle")
    
    # Mettre à jour le rôle
    old_role = user.role
    user.role = data.role  # 👈 Utiliser data.role (validé par Pydantic)
    await user.save()
    
    return {
        "message": f"Rôle mis à jour de '{old_role}' vers '{data.role}'",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "role": user.role
        }
    }


# ==================== GESTION DES PROPRIÉTÉS (VUE ADMIN) ====================

@router.get("/properties")
async def list_all_properties(current_user: User = Depends(require_role("admin"))):
    """
    Récupérer la liste de toutes les propriétés
    (Réservé aux administrateurs)
    """
    properties = await Property.find_all().to_list()
    return [
        {
            "id": str(p.id),
            "title": p.title,
            "description": p.description,
            "price": p.price,
            "location": p.location,
            "type": p.type,
            "owner_id": p.owner_id,
            "images": p.images
        }
        for p in properties
    ]


@router.delete("/properties/{property_id}")
async def admin_delete_property(
    property_id: str,
    current_user: User = Depends(require_role("admin"))
):
    """
    Supprimer une propriété (vue administrateur)
    (Réservé aux administrateurs)
    """
    property = await Property.get(property_id)
    if not property:
        raise HTTPException(404, "Logement introuvable")
    
    await property.delete()
    return {"message": "Logement supprimé par l'administrateur"}


# ==================== STATISTIQUES / DASHBOARD ====================

@router.get("/stats")
async def get_stats(current_user: User = Depends(require_role("admin"))):
    """
    Récupérer les statistiques globales pour le dashboard
    (Réservé aux administrateurs)
    """
    total_users = await User.find_all().count()
    total_owners = await User.find(User.role == "owner").count()
    total_properties = await Property.find_all().count()
    total_bookings = await Booking.find_all().count()
    pending_bookings = await Booking.find(Booking.status == "pending").count()
    confirmed_bookings = await Booking.find(Booking.status == "confirmed").count()
    
    # Calculer le nombre de réservations annulées
    cancelled_bookings = total_bookings - pending_bookings - confirmed_bookings

    return {
        "total_users": total_users,
        "total_owners": total_owners,
        "total_properties": total_properties,
        "total_bookings": total_bookings,
        "pending_bookings": pending_bookings,
        "confirmed_bookings": confirmed_bookings,
        "cancelled_bookings": cancelled_bookings,  # 👈 Ajout pour plus d'infos
        "conversion_rate": round((confirmed_bookings / total_bookings * 100) if total_bookings > 0 else 0, 2)
    }


# ==================== RECHERCHE AVANCÉE (ADMIN) ====================

@router.get("/search/users")
async def search_users(
    email: str = "",
    role: str = "",
    current_user: User = Depends(require_role("admin"))
):
    """
    Rechercher des utilisateurs par email ou rôle
    (Réservé aux administrateurs)
    """
    query = {}
    
    if email:
        query["email"] = {"$regex": email, "$options": "i"}
    
    if role and role in ["user", "owner", "admin"]:
        query["role"] = role
    
    users = await User.find(query).to_list()
    
    return [
        {
            "id": str(u.id),
            "email": u.email,
            "role": u.role
        }
        for u in users
    ]


@router.get("/search/properties")
async def search_properties(
    title: str = "",
    location: str = "",
    type: str = "",
    min_price: float = 0,
    max_price: float = 99999999,
    current_user: User = Depends(require_role("admin"))
):
    """
    Rechercher des propriétés par titre, localisation, type ou prix
    (Réservé aux administrateurs)
    """
    query = {}
    
    if title:
        query["title"] = {"$regex": title, "$options": "i"}
    
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    
    if type:
        query["type"] = {"$regex": type, "$options": "i"}
    
    if min_price >= 0 or max_price <= 99999999:
        query["price"] = {}
        if min_price >= 0:
            query["price"]["$gte"] = min_price
        if max_price <= 99999999:
            query["price"]["$lte"] = max_price
    
    properties = await Property.find(query).to_list()
    
    return [
        {
            "id": str(p.id),
            "title": p.title,
            "description": p.description,
            "price": p.price,
            "location": p.location,
            "type": p.type,
            "owner_id": p.owner_id,
            "images": p.images
        }
        for p in properties
    ]
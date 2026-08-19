import os
import shutil
import uuid
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query
from models import User, Property
from schemas import PropertyCreate
from auth import get_current_user, require_role

router = APIRouter(prefix="/properties", tags=["properties"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/")
async def list_properties(
    location: Optional[str] = Query(None, description="Filtrer par localisation (recherche partielle)"),
    type: Optional[str] = Query(None, description="Filtrer par type (recherche partielle)"),
    price_min: Optional[float] = Query(None, description="Prix minimum"),
    price_max: Optional[float] = Query(None, description="Prix maximum")
):
    query = {}
    
    # 🔍 RECHERCHE PAR LOCALISATION (insensible à la casse et partielle)
    if location:
        query["location"] = {"$regex": location, "$options": "i"}  # "i" = case insensitive
    
    # 🔍 RECHERCHE PAR TYPE (insensible à la casse et partielle)
    if type:
        query["type"] = {"$regex": type, "$options": "i"}
    
    # 💰 FILTRE PAR PRIX
    if price_min is not None or price_max is not None:
        price_filter = {}
        if price_min is not None:
            price_filter["$gte"] = price_min
        if price_max is not None:
            price_filter["$lte"] = price_max
        query["price"] = price_filter

    properties = await Property.find(query).to_list()
    return properties


@router.get("/{property_id}")
async def get_property(property_id: str):
    property = await Property.get(property_id)
    if not property:
        raise HTTPException(404, "Logement introuvable")
    return property


@router.post("/")
async def create_property(
    data: PropertyCreate,
    current_user: User = Depends(require_role("owner"))
):
    new_property = Property(**data.dict(), owner_id=str(current_user.id))
    await new_property.insert()
    return new_property


@router.put("/{property_id}")
async def update_property(
    property_id: str,
    data: PropertyCreate,
    current_user: User = Depends(require_role("owner"))
):
    property = await Property.get(property_id)
    if not property:
        raise HTTPException(404, "Logement introuvable")

    if property.owner_id != str(current_user.id):
        raise HTTPException(403, "Vous ne pouvez modifier que vos propres logements")

    await property.update({"$set": data.dict()})
    return property


@router.delete("/{property_id}")
async def delete_property(
    property_id: str,
    current_user: User = Depends(require_role("owner"))
):
    property = await Property.get(property_id)
    if not property:
        raise HTTPException(404, "Logement introuvable")

    if property.owner_id != str(current_user.id):
        raise HTTPException(403, "Vous ne pouvez supprimer que vos propres logements")

    await property.delete()
    return {"message": "Logement supprimé"}


@router.delete("/admin/{property_id}")
async def admin_delete_property(
    property_id: str,
    current_user: User = Depends(require_role("admin"))
):
    property = await Property.get(property_id)
    if not property:
        raise HTTPException(404, "Logement introuvable")
    await property.delete()
    return {"message": "Logement supprimé par l'admin"}


@router.post("/{property_id}/upload-image")
async def upload_image(
    property_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(require_role("owner"))
):
    property = await Property.get(property_id)
    if not property:
        raise HTTPException(404, "Logement introuvable")
    if property.owner_id != str(current_user.id):
        raise HTTPException(403, "Ce n'est pas votre logement")

    # Vérifier l'extension
    ext = file.filename.split(".")[-1].lower()
    if ext not in ["jpg", "jpeg", "png", "gif", "webp"]:
        raise HTTPException(400, "Format d'image non supporté")

    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    image_url = f"http://127.0.0.1:8000/uploads/{filename}"
    property.images.append(image_url)
    await property.save()

    return {"image_url": image_url}
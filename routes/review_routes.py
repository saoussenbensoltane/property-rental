# routes/review_routes.py
from fastapi import APIRouter, HTTPException, Depends
from models import User, Property, Booking, Review
from schemas import ReviewCreate, ReviewOut, ReviewUpdate
from auth import get_current_user, require_role
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.get("/my")
async def get_my_reviews(current_user: User = Depends(get_current_user)):
    """Récupérer tous les avis de l'utilisateur connecté"""
    reviews = await Review.find(
        Review.user_id == str(current_user.id)
    ).sort(-Review.created_at).to_list()
    return reviews


@router.post("/{property_id}")
async def create_review(
    property_id: str,
    data: ReviewCreate,
    current_user: User = Depends(get_current_user)
):
    """Créer un avis sur une propriété"""

    property = await Property.get(property_id)
    if not property:
        raise HTTPException(404, "Logement introuvable")

    booking = await Booking.find_one({
        "property_id": property_id,
        "user_id": str(current_user.id),
        "status": "confirmed"
    })

    if not booking:
        raise HTTPException(403, "Vous devez avoir réservé ce logement pour laisser un avis")

    existing_review = await Review.find_one({
        "property_id": property_id,
        "user_id": str(current_user.id)
    })

    if existing_review:
        raise HTTPException(400, "Vous avez déjà laissé un avis pour ce logement")

    review = Review(
        property_id=property_id,
        user_id=str(current_user.id),
        user_email=current_user.email,
        rating=data.rating,
        comment=data.comment,
        created_at=datetime.now()
    )
    await review.insert()

    await update_property_rating(property_id)

    return {
        "message": "✅ Avis ajouté avec succès !",
        "review": review
    }


@router.get("/{property_id}")
async def get_property_reviews(
    property_id: str,
    limit: Optional[int] = 10,
    skip: Optional[int] = 0
):
    """Récupérer tous les avis d'une propriété"""

    reviews = await Review.find(
        Review.property_id == property_id
    ).sort(-Review.created_at).skip(skip).limit(limit).to_list()

    total = await Review.find(Review.property_id == property_id).count()

    return {
        "reviews": reviews,
        "total": total,
        "limit": limit,
        "skip": skip
    }


@router.put("/{review_id}")
async def update_review(
    review_id: str,
    data: ReviewUpdate,
    current_user: User = Depends(get_current_user)
):
    """Modifier un avis existant"""

    review = await Review.get(review_id)
    if not review:
        raise HTTPException(404, "Avis introuvable")

    if review.user_id != str(current_user.id):
        raise HTTPException(403, "Vous ne pouvez modifier que vos propres avis")

    update_data = data.dict(exclude_unset=True)
    if update_data:
        update_data["updated_at"] = datetime.now()
        await review.update({"$set": update_data})

        if "rating" in update_data:
            await update_property_rating(review.property_id)

    return {"message": "✅ Avis modifié avec succès !"}


@router.delete("/{review_id}")
async def delete_review(
    review_id: str,
    current_user: User = Depends(get_current_user)
):
    """Supprimer un avis"""

    review = await Review.get(review_id)
    if not review:
        raise HTTPException(404, "Avis introuvable")

    if review.user_id != str(current_user.id):
        raise HTTPException(403, "Vous ne pouvez supprimer que vos propres avis")

    property_id = review.property_id
    await review.delete()

    await update_property_rating(property_id)

    return {"message": "🗑️ Avis supprimé avec succès"}


async def update_property_rating(property_id: str):
    """Mettre à jour la note moyenne d'une propriété"""

    reviews = await Review.find(Review.property_id == property_id).to_list()

    if reviews:
        total_rating = sum(r.rating for r in reviews)
        average = total_rating / len(reviews)
        await Property.find_one({"_id": property_id}).update({
            "$set": {
                "average_rating": round(average, 1),
                "review_count": len(reviews)
            }
        })
    else:
        await Property.find_one({"_id": property_id}).update({
            "$set": {
                "average_rating": 0,
                "review_count": 0
            }
        })
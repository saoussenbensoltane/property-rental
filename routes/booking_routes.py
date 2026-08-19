from fastapi import APIRouter, HTTPException, Depends
from models import User, Property, Booking
from schemas import BookingCreate
from auth import get_current_user, require_role

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("/")
async def create_booking(
    data: BookingCreate,
    current_user: User = Depends(get_current_user)
):
    property = await Property.get(data.property_id)
    if not property:
        raise HTTPException(404, "Logement introuvable")

    # Vérifie qu'aucune réservation CONFIRMÉE ne chevauche ces dates
    overlapping = await Booking.find(
        Booking.property_id == data.property_id,
        Booking.status == "confirmed",
        Booking.start_date < data.end_date,
        Booking.end_date > data.start_date
    ).to_list()

    if overlapping:
        raise HTTPException(409, "Ce logement est déjà réservé sur cette période")

    new_booking = Booking(
        property_id=data.property_id,
        user_id=str(current_user.id),
        start_date=data.start_date,
        end_date=data.end_date,
        status="pending"
    )
    await new_booking.insert()

    return {
        "_id": str(new_booking.id),
        "property_id": str(new_booking.property_id),
        "property_title": property.title,
        "property_location": property.location,
        "user_id": new_booking.user_id,
        "start_date": new_booking.start_date,
        "end_date": new_booking.end_date,
        "status": new_booking.status
    }


@router.get("/my")
async def get_my_bookings(current_user: User = Depends(get_current_user)):
    bookings = await Booking.find(Booking.user_id == str(current_user.id)).to_list()

    result = []
    for booking in bookings:
        property = await Property.get(booking.property_id)
        if property:
            result.append({
                "_id": str(booking.id),
                "property_id": str(booking.property_id),
                "property_title": property.title,
                "property_location": property.location,
                "user_id": booking.user_id,
                "start_date": booking.start_date,
                "end_date": booking.end_date,
                "status": booking.status
            })
        else:
            result.append({
                "_id": str(booking.id),
                "property_id": str(booking.property_id),
                "property_title": "Logement supprimé",
                "property_location": "",
                "user_id": booking.user_id,
                "start_date": booking.start_date,
                "end_date": booking.end_date,
                "status": booking.status
            })

    return result


@router.get("/owner")
async def get_owner_bookings(current_user: User = Depends(require_role("owner"))):
    my_properties = await Property.find(Property.owner_id == str(current_user.id)).to_list()
    property_ids = [str(p.id) for p in my_properties]
    bookings = await Booking.find({"property_id": {"$in": property_ids}}).to_list()

    result = []
    for booking in bookings:
        property = await Property.get(booking.property_id)
        if property:
            result.append({
                "_id": str(booking.id),
                "property_id": str(booking.property_id),
                "property_title": property.title,
                "property_location": property.location,
                "user_id": booking.user_id,
                "start_date": booking.start_date,
                "end_date": booking.end_date,
                "status": booking.status
            })

    return result


@router.put("/{booking_id}/status")
async def update_booking_status(
    booking_id: str,
    status: str,
    current_user: User = Depends(require_role("owner"))
):
    booking = await Booking.get(booking_id)
    if not booking:
        raise HTTPException(404, "Réservation introuvable")

    property = await Property.get(booking.property_id)
    if property.owner_id != str(current_user.id):
        raise HTTPException(403, "Ce n'est pas votre logement")

    if status not in ["confirmed", "cancelled"]:
        raise HTTPException(400, "Statut invalide")

    booking.status = status
    await booking.save()

    # Si confirmé, annule automatiquement les autres demandes "pending" qui chevauchent
    if status == "confirmed":
        others = await Booking.find(
            Booking.property_id == booking.property_id,
            Booking.status == "pending",
            Booking.id != booking.id,
            Booking.start_date < booking.end_date,
            Booking.end_date > booking.start_date
        ).to_list()
        for other in others:
            other.status = "cancelled"
            await other.save()

    return {
        "_id": str(booking.id),
        "property_id": str(booking.property_id),
        "property_title": property.title,
        "property_location": property.location,
        "user_id": booking.user_id,
        "start_date": booking.start_date,
        "end_date": booking.end_date,
        "status": booking.status
    }
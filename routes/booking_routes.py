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

    new_booking = Booking(
        property_id=data.property_id,
        user_id=str(current_user.id),
        start_date=data.start_date,
        end_date=data.end_date,
        status="pending"
    )
    await new_booking.insert()
    return new_booking


@router.get("/my")
async def get_my_bookings(current_user: User = Depends(get_current_user)):
    bookings = await Booking.find(Booking.user_id == str(current_user.id)).to_list()
    return bookings


@router.get("/owner")
async def get_owner_bookings(current_user: User = Depends(require_role("owner"))):
    my_properties = await Property.find(Property.owner_id == str(current_user.id)).to_list()
    property_ids = [str(p.id) for p in my_properties]
    bookings = await Booking.find({"property_id": {"$in": property_ids}}).to_list()
    return bookings


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
    return booking
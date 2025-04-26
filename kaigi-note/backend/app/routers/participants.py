from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..core.database import get_db
from ..core.deps import get_current_user
from ..models.user import User
from ..models.event import Event
from ..models.participant import EventParticipant
from ..schemas.participant import Participant, ParticipantCreate, ParticipantUpdate, ParticipantWithUser

router = APIRouter()


@router.get("/events/{event_id}/participants", response_model=List[ParticipantWithUser])
def get_event_participants(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all participants for a specific event."""
    # Check if the event exists
    event = db.query(Event).filter(Event.id == event_id).first()
    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    # Get participants with user info
    participants = db.query(
        EventParticipant, User.name.label("user_name")
    ).join(
        User, EventParticipant.user_id == User.id
    ).filter(
        EventParticipant.event_id == event_id
    ).all()

    # Convert to response model
    result = []
    for participant, user_name in participants:
        participant_dict = {
            "id": participant.id,
            "event_id": participant.event_id,
            "user_id": participant.user_id,
            "paid_amount": participant.paid_amount,
            "created_at": participant.created_at,
            "updated_at": participant.updated_at,
            "user_name": user_name
        }
        result.append(participant_dict)

    return result


@router.post("/events/{event_id}/participants", response_model=Participant)
def create_participant(
    event_id: int,
    participant_in: ParticipantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a participant to an event."""
    # Check if the event exists
    event = db.query(Event).filter(Event.id == event_id).first()
    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    # Check if the user exists
    user = db.query(User).filter(User.id == participant_in.user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Check if the participant already exists
    existing_participant = db.query(EventParticipant).filter(
        EventParticipant.event_id == event_id,
        EventParticipant.user_id == participant_in.user_id
    ).first()

    if existing_participant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a participant in this event"
        )

    # Create new participant
    db_participant = EventParticipant(
        event_id=event_id,
        user_id=participant_in.user_id,
        paid_amount=participant_in.paid_amount
    )
    db.add(db_participant)
    db.commit()
    db.refresh(db_participant)
    return db_participant


@router.put("/events/{event_id}/participants/{participant_id}", response_model=Participant)
def update_participant(
    event_id: int,
    participant_id: int,
    participant_in: ParticipantUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a participant."""
    # Check if the participant exists
    participant = db.query(EventParticipant).filter(
        EventParticipant.id == participant_id,
        EventParticipant.event_id == event_id
    ).first()

    if participant is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participant not found"
        )

    # Update participant fields
    update_data = participant_in.dict(exclude_unset=True)

    # Update participant attributes
    for field, value in update_data.items():
        setattr(participant, field, value)

    db.add(participant)
    db.commit()
    db.refresh(participant)
    return participant


@router.delete("/events/{event_id}/participants/{participant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_participant(
    event_id: int,
    participant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a participant."""
    # Check if the participant exists
    participant = db.query(EventParticipant).filter(
        EventParticipant.id == participant_id,
        EventParticipant.event_id == event_id
    ).first()

    if participant is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participant not found"
        )

    # Delete the participant
    db.delete(participant)
    db.commit()
    return None

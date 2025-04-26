from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional

from ..core.database import get_db
from ..core.deps import get_current_user
from ..models.user import User
from ..models.event import Event
from ..schemas.event import Event as EventSchema, EventCreate, EventUpdate, EventWithParticipants
from ..services.discord import send_discord_notification

router = APIRouter()


@router.get("/", response_model=List[EventSchema])
def get_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    keyword: Optional[str] = None,
    status: Optional[str] = None
):
    """Get all events with optional filtering."""
    query = db.query(Event)

    # Apply filters if provided
    if keyword:
        query = query.filter(
            (Event.place.contains(keyword)) |
            (Event.content.contains(keyword))
        )

    if status:
        query = query.filter(Event.status == status)

    # Order by start_time descending (newest first)
    query = query.order_by(Event.start_time.desc())

    # Apply pagination
    events = query.offset(skip).limit(limit).all()
    return events


@router.post("/", response_model=EventSchema)
async def create_event(
    event_in: EventCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new event."""
    # Create new event
    db_event = Event(
        start_time=event_in.start_time,
        end_time=event_in.end_time,
        place=event_in.place,
        content=event_in.content,
        status=event_in.status,
        total_cost=event_in.total_cost
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)

    # Send Discord notification in the background
    event_schema = EventSchema.from_orm(db_event)
    background_tasks.add_task(
        send_discord_notification, event_schema, "created")

    return db_event


@router.get("/{event_id}", response_model=EventWithParticipants)
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific event by ID."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    return event


@router.put("/{event_id}", response_model=EventSchema)
async def update_event(
    event_id: int,
    event_in: EventUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an event."""
    # Check if the event exists
    event = db.query(Event).filter(Event.id == event_id).first()
    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    # Update event fields
    update_data = event_in.dict(exclude_unset=True)

    # Update event attributes
    for field, value in update_data.items():
        setattr(event, field, value)

    db.add(event)
    db.commit()
    db.refresh(event)

    # Send Discord notification in the background (optional for updates)
    # Uncomment if you want notifications for updates
    # event_schema = EventSchema.from_orm(event)
    # background_tasks.add_task(send_discord_notification, event_schema, "updated")

    return event


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an event."""
    # Check if the event exists
    event = db.query(Event).filter(Event.id == event_id).first()
    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    # Delete the event
    db.delete(event)
    db.commit()
    return None

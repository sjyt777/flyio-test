from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .participant import ParticipantBase

# Shared properties


class EventBase(BaseModel):
    start_time: datetime
    end_time: datetime
    place: str
    content: Optional[str] = None
    status: Optional[str] = "planned"
    total_cost: Optional[int] = 0

# Properties to receive via API on creation


class EventCreate(EventBase):
    pass

# Properties to receive via API on update


class EventUpdate(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    place: Optional[str] = None
    content: Optional[str] = None
    status: Optional[str] = None
    total_cost: Optional[int] = None

# Properties to return via API


class Event(EventBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Properties to return via API with participants


class EventWithParticipants(Event):
    participants: List["ParticipantBase"] = []

    class Config:
        orm_mode = True

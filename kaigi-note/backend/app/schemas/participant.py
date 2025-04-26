from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Shared properties


class ParticipantBase(BaseModel):
    user_id: int
    paid_amount: Optional[int] = 0

# Properties to receive via API on creation


class ParticipantCreate(ParticipantBase):
    pass

# Properties to receive via API on update


class ParticipantUpdate(BaseModel):
    paid_amount: Optional[int] = None

# Properties to return via API


class Participant(ParticipantBase):
    id: int
    event_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Properties to return via API with user info


class ParticipantWithUser(Participant):
    user_name: str

    class Config:
        orm_mode = True

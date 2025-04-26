from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# Shared properties


class UserBase(BaseModel):
    name: str
    email: EmailStr

# Properties to receive via API on creation


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

# Properties to receive via API on update


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8)

# Properties to return via API


class User(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Properties to return via API for token


class Token(BaseModel):
    access_token: str
    token_type: str

# Properties to receive via API for token


class TokenPayload(BaseModel):
    sub: Optional[int] = None

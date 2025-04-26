from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.sql import func
from ..core.database import Base


class Event(Base):
    """Event model."""
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    # New field for event title
    title = Column(String(255), nullable=False, server_default='未入力')
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    place = Column(String(255), nullable=False)
    content = Column(Text)
    status = Column(String(50), default="planned")
    total_cost = Column(Integer, default=0)
    # New field for max participants
    max_participants = Column(Integer, nullable=True)
    # New field to control event visibility
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True),
                        server_default=func.now(), onupdate=func.now())

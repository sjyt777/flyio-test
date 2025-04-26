from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint, String
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..core.database import Base


class EventParticipant(Base):
    """Event participant model."""
    __tablename__ = "event_participants"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    paid_amount = Column(Integer, default=0)
    # New field for attendance status
    attendance_status = Column(String(50), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True),
                        server_default=func.now(), onupdate=func.now())

    # Relationships
    event = relationship("Event", backref="participants")
    user = relationship("User", backref="participations")

    # Unique constraint to prevent duplicate participation
    __table_args__ = (
        UniqueConstraint('event_id', 'user_id', name='uix_event_user'),
    )

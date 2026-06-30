from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from database import Base
from enums import RequestStatus, RequestPriority


class Request(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    status = Column(String, default=RequestStatus.NEW.value, nullable=False)
    priority = Column(String, default=RequestPriority.NORMAL.value, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Request {self.id}: {self.title} ({self.status})>"

from sqlalchemy import Column, Integer, String, DateTime, Boolean
from datetime import datetime

# Используем Base из database.py
# from .database import Base 

class Request(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False) # Length enforced by validation later
    description = Column(String, nullable=True) # Max 1000 chars enforced by validation later
    status = Column(String, default="new", nullable=False) # Must be one of: new, in_progress, done
    priority = Column(String, default="normal", nullable=False) # Must be one of: low, normal, high
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Примечание: Обработка бизнес-правил (например, "нельзя редактировать done") 
# будет реализована в логике сервиса/роутера, а не на уровне модели.
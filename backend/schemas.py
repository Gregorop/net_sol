from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# --- Base schemas for request operations ---

class RequestBase(BaseModel):
    """Base schema for all requests (for creation)."""
    title: str = Field(..., min_length=3, max_length=120)
    description: Optional[str] = Field(None, max_length=1000)
    status: str # Expected to be validated in the endpoint/service layer
    priority: str # Expected to be validated in the endpoint/service layer

class RequestCreate(RequestBase):
    """Schema used when creating a new request."""
    pass

class RequestUpdate(BaseModel):
    """Schema used for partial updates (status change)."""
    status: Optional[str] = Field(None, description="New status (new, in_progress, done)")
    priority: Optional[str] = Field(None, description="New priority (low, normal, high)")

# --- Response schemas ---

class RequestRead(RequestBase):
    """Schema for reading full request data."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True # Allows conversion from ORM objects

class PaginatedRequests(BaseModel):
    """Schema for paginated list responses."""
    total_items: int
    total_pages: int
    current_page: int
    page_size: int
    data: List[RequestRead]
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class RequestBase(BaseModel):
    """Base schema for all requests."""

    title: str = Field(..., min_length=3, max_length=120)
    description: Optional[str] = Field(None, max_length=1000)
    status: str
    priority: str


class RequestCreate(RequestBase):
    """Schema used when creating a new request."""

    pass


class RequestUpdate(BaseModel):
    """Schema used for partial updates."""

    status: Optional[str] = Field(
        None, description="New status (new, in_progress, done)"
    )
    priority: Optional[str] = Field(
        None, description="New priority (low, normal, high)"
    )


class RequestRead(RequestBase):
    """Schema for reading full request data."""

    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Исправлено для Pydantic v2


class PaginatedRequests(BaseModel):
    """Schema for paginated list responses."""

    total_items: int
    total_pages: int
    current_page: int
    page_size: int
    data: List[RequestRead]

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enums import RequestStatus, RequestPriority


class RequestBase(BaseModel):
    """Base schema for all requests."""

    title: str = Field(..., min_length=3, max_length=120)
    description: Optional[str] = Field(None, max_length=1000)
    status: RequestStatus
    priority: RequestPriority


class RequestCreate(RequestBase):
    pass


class RequestUpdate(BaseModel):
    status: Optional[RequestStatus] = Field(
        None, description="New status (new, in_progress, done)"
    )
    priority: Optional[RequestPriority] = Field(
        None, description="New priority (low, normal, high)"
    )


class RequestRead(RequestBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaginatedRequests(BaseModel):
    total_items: int
    total_pages: int
    current_page: int
    page_size: int
    data: List[RequestRead]

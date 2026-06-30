from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enums import RequestStatus, RequestPriority


class RequestBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=120)
    description: Optional[str] = Field(None, max_length=1000)
    status: RequestStatus
    priority: RequestPriority


class RequestCreate(RequestBase):
    pass


class RequestUpdate(BaseModel):
    status: Optional[RequestStatus] = Field(
        None, description=f"New status ({RequestStatus.get_order()})"
    )
    priority: Optional[RequestPriority] = Field(
        None, description=f"New priority ({RequestPriority.get_order()})"
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

from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

# Исправляем импорты - убираем точки
from database import get_db, engine
from models import Base, Request
from schemas import RequestCreate, RequestRead, RequestUpdate, PaginatedRequests

app = FastAPI(title="Request Tracker API")


def is_admin(api_key: str = Depends(lambda: "Bearer SECRET_ADMIN_TOKEN")):
    """Placeholder for Admin Authentication check."""
    # Исправляем проверку
    if api_key != "Bearer correct_password":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Admin credentials invalid.",
        )
    return True


def validate_request_state(request: Request):
    """Checks core business rules on the request state."""
    if request.status == "done":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot modify requests in 'done' status.",
        )


# --- 2. API ENDPOINTS ---


@app.on_event("startup")
async def startup_event():
    """Ensure database tables exist on startup."""
    print("Creating database tables...")
    # Исправляем создание таблиц
    Base.metadata.create_all(bind=engine)


@app.post("/requests/", response_model=RequestRead, status_code=status.HTTP_201_CREATED)
async def create_request(request: RequestCreate, db: Session = Depends(get_db)):
    """
    1. Создание заявки.
    Создает новую запись в БД с учетом бизнес-правил.
    """
    # Исправляем проверку статуса
    valid_statuses = ["new", "in_progress"]
    valid_priorities = ["low", "normal", "high"]

    if request.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid initial status. Must be 'new' or 'in_progress'.",
        )

    if request.priority not in valid_priorities:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid priority. Must be 'low', 'normal', or 'high'.",
        )

    db_request = Request(
        title=request.title,
        description=request.description,
        status=request.status,
        priority=request.priority,
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request


@app.get("/requests/", response_model=PaginatedRequests)
async def list_requests(
    skip: int = 0,
    limit: int = 20,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "created_at",
    sort_desc: bool = True,
    db: Session = Depends(get_db),
):
    """
    2. Просмотр списка заявок.
    Фильтрация, Поиск, Сортировка, Пагинация.
    """
    query = db.query(Request)

    # Фильтрация
    if status:
        query = query.filter(Request.status == status)

    if priority:
        query = query.filter(Request.priority == priority)

    # Поиск
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Request.title.ilike(search_pattern))
            | (Request.description.ilike(search_pattern))
        )

    # Сортировка - исправляем
    if sort_by == "priority":
        # Простая сортировка по приоритету
        priority_order = {"low": 0, "normal": 1, "high": 2}
        # Для SQLite используем CASE
        from sqlalchemy import case

        priority_case = case(priority_order, value=Request.priority, else_=0)
        query = query.order_by(
            priority_case.desc() if sort_desc else priority_case.asc()
        )
    elif sort_by in ["created_at", "updated_at"]:
        column = getattr(Request, sort_by)
        query = query.order_by(column.desc() if sort_desc else column.asc())
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid sort_by field. Use 'created_at', 'updated_at', or 'priority'.",
        )

    # Пагинация
    total_items = query.count()
    data_records = query.offset(skip * limit).limit(limit).all()

    # Исправляем преобразование
    read_data = [RequestRead.from_orm(record) for record in data_records]

    total_pages = (total_items + limit - 1) // limit if limit > 0 else 1
    return PaginatedRequests(
        total_items=total_items,
        total_pages=total_pages,
        current_page=skip // limit + 1 if limit > 0 else 1,
        page_size=limit,
        data=read_data,
    )


@app.put("/requests/{request_id}/status")
async def change_status(
    request_id: int, update: RequestUpdate, db: Session = Depends(get_db)
):
    """
    6. Изменение статуса заявки.
    """
    db_request = db.query(Request).filter(Request.id == request_id).first()
    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Request not found."
        )

    # Валидация
    validate_request_state(db_request)

    # Применение обновления
    update_data = update.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update.",
        )

    # Валидация новых значений
    if "status" in update_data and update_data["status"] not in [
        "new",
        "in_progress",
        "done",
    ]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Must be 'new', 'in_progress', or 'done'.",
        )

    if "priority" in update_data and update_data["priority"] not in [
        "low",
        "normal",
        "high",
    ]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid priority. Must be 'low', 'normal', or 'high'.",
        )

    for key, value in update_data.items():
        setattr(db_request, key, value)

    db_request.updated_at = datetime.utcnow()

    try:
        db.commit()
        db.refresh(db_request)
        return db_request
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error during update: {str(e)}",
        )


@app.delete("/requests/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_request(
    request_id: int,
    is_admin_auth: bool = Depends(is_admin),
    db: Session = Depends(get_db),
):
    """
    7. Удаление заявки (только админом).
    """
    db_request = db.query(Request).filter(Request.id == request_id).first()
    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Request not found."
        )

    # Нельзя удалять заявки в статусе 'done'
    if db_request.status == "done":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete requests in 'done' status.",
        )

    db.delete(db_request)
    db.commit()
    return None  # 204 No Content

from fastapi import FastAPI, Depends, HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

# Импорты локальных модулей
from .database import get_db
from .models import Base, Request # SQLAlchemy Model
from .schemas import RequestCreate, RequestRead, RequestUpdate, PaginatedRequests

app = FastAPI(title="Internal Request Tracker API")

# --- 1. Middleware/Dependency Functions (Authorization & Business Rules) ---

def is_admin(api_key: str = Depends(lambda: "Bearer SECRET_ADMIN_TOKEN")):
    """Placeholder for Admin Authentication check."""
    if api_key != "Bearer correct_password": # Using a simplified header check
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized: Admin credentials invalid.")
    return True

def validate_request_state(read_data: RequestRead):
    """Checks core business rules on the request state."""
    if read_data.get("status") == "done":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot modify requests in 'done' status.")

# --- 2. API ENDPOINTS ---

@app.on_event("startup")
async def startup_event():
    """Ensure database tables exist on startup."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=get_db().__next__().bind) # Simplified call, needs proper session handling in real app

@app.post("/requests/", response_model=RequestRead, status_code=status.HTTP_201_CREATED)
async def create_request(
    request: RequestCreate, db: Session = Depends(get_db)
):
    """
    1. Создание заявки.
    Создает новую запись в БД с учетом бизнес-правил.
    """
    # В идеале здесь должна быть проверка valid status/priority enums
    if request.status not in ["new", "in_progress"] and request.status != "new": # Усиленное правило для стартовой заявки
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid initial status provided.")

    db_request = Request(
        title=request.title, 
        description=request.description, 
        status=request.status, 
        priority=request.priority
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

@app.get("/requests/", response_model=PaginatedRequests)
async def list_requests(
    skip: int = 0, # Skip / Offset (for page number * page size)
    limit: int = 20,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "created_at", # 'created_at' or 'priority'
    sort_desc: bool = True,
    db: Session = Depends(get_db)
):
    """
    2. Просмотр списка заявок (3-5).
    Фильтрация, Поиск, Сортировка, Пагинация.
    """
    # --- 1. Фильтрация ---
    query = db.query(Request)

    if status:
        query = query.filter(Request.status == status)
    
    if priority:
        query = query.filter(Request.priority == priority)
    
    # --- 2. Поиск (Title OR Description) ---
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Request.title.ilike(search_pattern)) | (Request.description.ilike(search_pattern))
        )

    # --- 3. Сортировка ---
    if sort_by == "priority":
         # Можно добавить сложную логику сортировки по приоритетам: low < normal < high
         pass # Для простоты оставим только дату, но тут нужно обернуть в case statement/mapping
    elif sort_by not in ["created_at", "updated_at"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid sort_by field.")

    # SQLAlchemy supports column sorting directly
    query = query.order_by(Request.created_at.desc() if sort_desc else Request.created_at.asc())

    # --- 4. Пагинация и исполнение запроса ---
    total_items = query.count()
    data_records = query.offset(skip * limit).limit(limit).all()
    
    # Преобразование SQLAlchemy объектов в Pydantic схемы (RequestRead)
    read_data: List[RequestRead] = []
    for record in data_records:
        read_data.append(RequestRead(
            id=record.id, 
            title=record.title, 
            description=record.description, 
            status=record.status, 
            priority=record.priority, 
            created_at=record.created_at, 
            updated_at=record.updated_at
        ))

    # --- Возвращаем пагинированные данные ---
    total_pages = (total_items + limit - 1) // limit if limit > 0 else 0
    return PaginatedRequests(
        total_items=total_items, 
        total_pages=max(1, total_pages), 
        current_page=skip // limit + 1, 
        page_size=limit, 
        data=read_data
    )

@app.put("/requests/{request_id}/status")
async def change_status(
    request_id: int, 
    update: RequestUpdate, 
    db: Session = Depends(get_db)
):
    """
    6. Изменение статуса заявки.
    Обновляет статус и обновляет updated_at при успешном изменении.
    """
    # 1. Получить объект и проверить права
    db_request = db.query(Request).filter(Request.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found.")

    # 2. Валидация бизнес-правил (Admin check is usually on the endpoint level if needed)
    validate_request_state(RequestRead(id=db_request.id, title=db_request.title, description=db_request.description, status=db_request.status, priority=db_request.priority, created_at=db_request.created_at, updated_at=db_request.updated_at))

    # 3. Применение обновления
    update_data = update.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields provided for update.")

    for key, value in update_data.items():
        setattr(db_request, key, value)
        
    # Обновление поля updated_at (SQLAlchemy делает это автоматически при onupdate, но явный вызов лучше для ясности)
    db_request.updated_at = datetime.utcnow()

    try:
        db.commit()
        db.refresh(db_request)
        return db_request
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error during update: {str(e)}")

@app.delete("/requests/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_request(
    request_id: int, 
    is_admin_auth: bool = Depends(is_admin), # Защищаем эндпоинт
    db: Session = Depends(get_db)
):
    """
    7. Удаление заявки (только админом).
    Требует авторизации и проверки статуса.
    """
    # 1. Получить объект
    db_request = db.query(Request).filter(Request.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found.")

    # 2. Валидация бизнес-правил: нельзя удалять done заявки (хотя статус и так должен быть в проверяемом объекте)
    validate_request_state(RequestRead(id=db_request.id, title=db_request.title, description=db_request.description, status=db_request.status, priority=db_request.priority, created_at=db_request.created_at, updated_at=db_request.updated_at))

    # В контексте этого задания: Администратор должен иметь возможность удалить что угодно, 
    # кроме заявок в статусе 'done' (это правило для редактирования/изменения состояния).
    if db_request.status == "done":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete requests in 'done' status.")

    # 3. Удаление
    db.delete(db_request)
    db.commit()
    return {} # 204 No Content

# FastAPI требует что все классы Pydantic и ORM-объекты находятся в одном пакете для импорта
# В идеале, здесь была бы сложная инициализация роутеров: include_router(...)
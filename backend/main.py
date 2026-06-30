from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.middleware.cors import CORSMiddleware  # Добавлен импорт
from sqlalchemy.orm import Session
from sqlalchemy import case, inspect
from typing import Optional
from datetime import datetime
from contextlib import asynccontextmanager
import secrets

from database import get_db, engine
from models import Base, Request
from schemas import RequestCreate, RequestRead, RequestUpdate, PaginatedRequests
from config import settings
from enums import RequestStatus, RequestPriority

security = HTTPBasic()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up...")
    try:
        print("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("Database tables ready!")
    except Exception as e:
        print(f"Error creating tables: {e}")

    yield
    print("Shutting down...")


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

# Добавляем CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,  # Используем из config
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,  # Кэшировать preflight на 10 минут
)


def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = settings.ADMIN_USERNAME
    correct_password = settings.ADMIN_PASSWORD

    is_username_correct = secrets.compare_digest(
        credentials.username.encode("utf-8"), correct_username.encode("utf-8")
    )
    is_password_correct = secrets.compare_digest(
        credentials.password.encode("utf-8"), correct_password.encode("utf-8")
    )

    if not (is_username_correct and is_password_correct):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Не админ username или password",
            headers={"WWW-Authenticate": "Basic"},
        )

    return True


def validate_request_state(request: Request):
    if request.status == "done":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Заявку в статусе done нельзя редактировать или удалять.",
        )


@app.post("/requests/", response_model=RequestRead, status_code=status.HTTP_201_CREATED)
async def create_request(request: RequestCreate, db: Session = Depends(get_db)):
    db_request = Request(
        title=request.title,
        description=request.description,
        status=request.status.value,
        priority=request.priority.value,
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request


@app.get("/requests/", response_model=PaginatedRequests)
async def list_requests(
    skip: int = 0,
    limit: int = 20,
    status: Optional[RequestStatus] = None,
    priority: Optional[RequestPriority] = None,
    search: Optional[str] = None,
    sort: str = "-created_at,+priority",  # Формат: "-field1,+field2" (- = DESC, + = ASC)
    db: Session = Depends(get_db),
):
    query = db.query(Request)

    if status:
        query = query.filter(Request.status == status.value)

    if priority:
        query = query.filter(Request.priority == priority.value)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Request.title.ilike(search_pattern))
            | (Request.description.ilike(search_pattern))
        )

    sort_fields = sort.split(",")
    allowed_fields = {
        "priority": RequestPriority.get_order(),
        "created_at": None,
    }

    order_by_clauses = []
    for sort_field in sort_fields:
        descending = sort_field.startswith("-")
        field_name = sort_field[1:]

        if field_name not in allowed_fields:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Не сортируем  по: {field_name}. Можно по: priority, created_at",
            )

        if field_name == "priority":
            priority_order = RequestPriority.get_order()
            priority_case = case(priority_order, value=Request.priority, else_=0)
            order_by_clauses.append(
                priority_case.desc() if descending else priority_case.asc()
            )
        else:
            column = getattr(Request, field_name)
            order_by_clauses.append(column.desc() if descending else column.asc())

    query = query.order_by(*order_by_clauses)

    total_items = query.count()
    data_records = query.offset(skip * limit).limit(limit).all()

    read_data = [RequestRead.model_validate(record) for record in data_records]

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
    db_request = db.query(Request).filter(Request.id == request_id).first()
    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Заявка не найдена"
        )

    validate_request_state(db_request)

    if (update.status is None and update.priority is None) or (
        db_request.status == update.status and db_request.priority == update.priority
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нужно поменять хотя бы 1: (status или priority)",
        )

    if update.status:
        status_order = RequestStatus.get_order()
        current_status_value = status_order.get(RequestStatus(db_request.status), 0)
        new_status_value = status_order.get(update.status, 0)

        if new_status_value < current_status_value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Нельзя перевести заявку обратно в другой статус из '{db_request.status}' в '{update.status.value}'.",
            )

        db_request.status = update.status.value

    if update.priority:
        db_request.priority = update.priority.value

    db_request.updated_at = datetime.now()

    try:
        db.commit()
        db.refresh(db_request)
        return db_request
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Че то с БД: {str(e)}",
        )


@app.delete("/requests/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_request(
    request_id: int,
    admin_auth: bool = Depends(verify_admin),
    db: Session = Depends(get_db),
):
    if not admin_auth:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Требуются права администратора",
        )

    db_request = db.query(Request).filter(Request.id == request_id).first()
    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Заявка не найдена"
        )

    if db_request.status == RequestStatus.DONE.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Заявку в статусе done нельзя редактировать или удалять.",
        )

    db.delete(db_request)
    db.commit()


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        return {"status": "healthy", "database": "connected", "tables": tables}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

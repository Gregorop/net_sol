from enum import Enum


class RequestStatus(str, Enum):
    NEW = "new"
    IN_PROGRESS = "in_progress"
    DONE = "done"

    @classmethod
    def get_order(cls) -> dict:
        return {cls.NEW: 0, cls.IN_PROGRESS: 1, cls.DONE: 2}

    @classmethod
    def get_initial_statuses(cls) -> list:
        return [cls.NEW, cls.IN_PROGRESS]


class RequestPriority(str, Enum):
    """Приоритеты заявки."""

    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"

    @classmethod
    def get_order(cls) -> dict:
        """Порядок приоритетов для сортировки."""
        return {cls.LOW: 0, cls.NORMAL: 1, cls.HIGH: 2}

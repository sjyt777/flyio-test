from .auth import router as auth_router
from .users import router as users_router
from .events import router as events_router
from .participants import router as participants_router

# Export all routers
__all__ = ["auth_router", "users_router",
           "events_router", "participants_router"]

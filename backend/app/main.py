from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from app.core.rate_limit import limiter
from app.api import auth, conversations, schemes, admin
from app.db.database import Base, engine

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Red Tape Translator API", version="1.0.0")

# Rate limiter
app.state.limiter = limiter

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests. Please wait a moment before sending another message."},
    )

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://your-production-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(conversations.router)
app.include_router(schemes.router)
app.include_router(admin.router)

@app.get("/health")
def health():
    return {"status": "ok"}
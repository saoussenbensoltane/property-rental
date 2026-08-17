from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routes.auth_routes import router as auth_router
from routes.property_routes import router as property_router
from routes.booking_routes import router as booking_router
from routes.admin_routes import router as admin_router
from fastapi.staticfiles import StaticFiles
@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(property_router)
app.include_router(booking_router)
app.include_router(admin_router)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
@app.get("/")
def read_root():
    return {"message": "API Property Rental Management fonctionne"}
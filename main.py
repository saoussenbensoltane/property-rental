# main.py
from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routes.auth_routes import router as auth_router
from routes.property_routes import router as property_router
from routes.booking_routes import router as booking_router
from routes.admin_routes import router as admin_router
from routes.review_routes import router as review_router
from fastapi.staticfiles import StaticFiles
import os

# ✅ IMPORT THE AI ROUTER - Make sure this line exists
from routes.ai_routes import router as ai_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🔄 Initialisation de la base de données...")
    await init_db()
    print("✅ Base de données initialisée avec succès")
    yield
    print("🛑 Arrêt de l'application")

app = FastAPI(
    title="Property Rental Management API",
    description="API pour la gestion de location de propriétés",
    version="1.0.0",
    lifespan=lifespan
)

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200",
        "http://localhost",
        "http://127.0.0.1",
        "http://localhost:80",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "Accept",
        "Origin",
        "X-Requested-With"
    ],
    expose_headers=["Content-Length", "Content-Type"],
    max_age=3600
)

# ✅ Middleware pour logger les requêtes
@app.middleware("http")
async def log_requests(request, call_next):
    print(f"📨 {request.method} {request.url.path}")
    response = await call_next(request)
    print(f"📤 {request.method} {request.url.path} - {response.status_code}")
    return response

# ✅ INCLUDE ALL ROUTES - Make sure ai_router is included
app.include_router(auth_router)
app.include_router(property_router)
app.include_router(booking_router)
app.include_router(admin_router)
app.include_router(review_router)
app.include_router(ai_router)  # ✅ THIS LINE MUST BE PRESENT

# ✅ Vérifier que le dossier uploads existe
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def read_root():
    return {
        "message": "API Property Rental Management fonctionne",
        "version": "1.0.0",
        "status": "online"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "message": "✅ API is running"
    }

# ✅ Add a debug endpoint to list all routes
@app.get("/routes")
async def list_routes():
    """List all available routes for debugging"""
    routes = []
    for route in app.routes:
        routes.append({
            "path": route.path,
            "name": route.name,
            "methods": list(route.methods) if hasattr(route, 'methods') else []
        })
    return {
        "total_routes": len(routes),
        "routes": routes
    }
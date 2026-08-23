# routes/ai_routes.py
from fastapi import APIRouter, HTTPException, Depends, status
from typing import Optional, List
from datetime import datetime, timedelta
import logging

from models import User, Property, Booking, Review
from auth import get_current_user, require_role, get_current_user_optional
from services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["AI"])
logger = logging.getLogger(__name__)

# ==================== PRICE PREDICTION ====================
@router.get("/price-prediction/{property_id}")
async def predict_price(
    property_id: str,
    current_user: User = Depends(require_role("owner"))
):
    """
    🤖 Prédire le prix optimal pour un logement
    Nécessite le rôle owner ou admin
    """
    try:
        property = await Property.get(property_id)
        if not property:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Logement introuvable"
            )
        
        if current_user.role != "admin" and str(property.owner_id) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Ce n'est pas votre logement"
            )
        
        property_data = {
            "id": property_id,
            "price": property.price,
            "location": property.location,
            "type": property.type
        }
        
        prediction = AIService.predict_optimal_price(property_data)
        
        return {
            "property_id": property_id,
            "property_title": property.title,
            "current_price": property.price,
            "prediction": prediction,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur dans la prédiction: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur de prédiction: {str(e)}"
        )

# ==================== MARKET INSIGHTS ====================
@router.get("/market-insights")
async def get_market_insights(
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    📊 Insights du marché immobilier
    Accessible à tous (authentification optionnelle)
    """
    try:
        properties = await Property.find_all().to_list()
        
        if not properties:
            return {
                "message": "Aucune propriété disponible pour l'analyse",
                "total_properties": 0
            }
        
        prices = [p.price for p in properties]
        type_counts = {}
        location_counts = {}
        
        for p in properties:
            type_counts[p.type] = type_counts.get(p.type, 0) + 1
            location_counts[p.location] = location_counts.get(p.location, 0) + 1
        
        return {
            "total_properties": len(properties),
            "average_price": round(sum(prices) / len(prices), 2),
            "price_range": {
                "min": min(prices),
                "max": max(prices),
                "average": round(sum(prices) / len(prices), 2)
            },
            "by_type": type_counts,
            "by_location": dict(sorted(location_counts.items(), key=lambda x: x[1], reverse=True)[:10]),
            "trending": "📈 Marché en croissance" if len(properties) > 10 else "📊 Marché stable"
        }
        
    except Exception as e:
        logger.error(f"Erreur dans les insights: {e}")
        return {"error": str(e), "message": "Impossible de générer les insights"}

# ==================== PROPERTY VALUATION ====================
@router.get("/property-valuation/{property_id}")
async def get_property_valuation(
    property_id: str,
    current_user: User = Depends(require_role("owner"))
):
    """
    💰 Évaluation détaillée d'une propriété
    """
    try:
        property = await Property.get(property_id)
        if not property:
            raise HTTPException(404, "Propriété introuvable")
        
        if current_user.role != "admin" and str(property.owner_id) != str(current_user.id):
            raise HTTPException(403, "Ce n'est pas votre propriété")
        
        property_data = {
            "id": property_id,
            "price": property.price,
            "location": property.location,
            "type": property.type
        }
        
        prediction = AIService.predict_optimal_price(property_data)
        
        return {
            "property_id": property_id,
            "title": property.title,
            "current_price": property.price,
            "valuation": prediction
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur dans l'évaluation: {e}")
        raise HTTPException(500, detail=str(e))

# ==================== PORTFOLIO ANALYSIS ====================
@router.post("/analyze-portfolio")
async def analyze_portfolio(
    current_user: User = Depends(require_role("owner"))
):
    """
    📊 Analyser toutes les propriétés d'un propriétaire
    """
    try:
        properties = await Property.find({"owner_id": str(current_user.id)}).to_list()
        
        if not properties:
            return {
                "message": "Aucune propriété dans votre portefeuille",
                "total_properties": 0
            }
        
        portfolio_analysis = []
        total_current_value = 0
        total_optimal_value = 0
        
        for property in properties:
            property_data = {
                "id": str(property.id),
                "price": property.price,
                "location": property.location,
                "type": property.type
            }
            
            prediction = AIService.predict_optimal_price(property_data)
            total_current_value += property.price
            total_optimal_value += prediction["optimal_price"]
            
            portfolio_analysis.append({
                "property_id": str(property.id),
                "title": property.title,
                "current_price": property.price,
                "optimal_price": prediction["optimal_price"],
                "potential_gain": round(prediction["optimal_price"] - property.price, 2),
                "recommendation": prediction["recommendation"],
                "confidence": prediction["confidence"]
            })
        
        total_potential_gain = total_optimal_value - total_current_value
        
        return {
            "total_properties": len(properties),
            "total_current_value": round(total_current_value, 2),
            "total_optimal_value": round(total_optimal_value, 2),
            "total_potential_gain": round(total_potential_gain, 2),
            "gain_percentage": round((total_potential_gain / total_current_value) * 100, 2) if total_current_value > 0 else 0,
            "properties": portfolio_analysis
        }
        
    except Exception as e:
        logger.error(f"Erreur dans l'analyse du portefeuille: {e}")
        raise HTTPException(500, detail=str(e))

# ==================== RECOMMENDATIONS ====================
@router.get("/recommendations")
async def get_recommendations(
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    💡 Recommandations IA basées sur les données du marché
    """
    try:
        properties = await Property.find_all().limit(100).to_list()
        
        if not properties:
            return {
                "message": "Pas assez de données pour les recommandations",
                "recommendations": ["Ajoutez plus de propriétés"]
            }
        
        recommendations = []
        type_counts = {}
        
        for p in properties:
            type_counts[p.type] = type_counts.get(p.type, 0) + 1
        
        for prop_type, count in type_counts.items():
            if count < 3:
                recommendations.append(
                    f"💡 Ajoutez plus de {prop_type}s (actuellement {count})"
                )
        
        return {
            "recommendations": recommendations if recommendations else ["✅ Votre portefeuille est bien diversifié"],
            "market_health": "sain" if len(properties) > 10 else "en croissance",
            "total_properties_analyzed": len(properties)
        }
        
    except Exception as e:
        logger.error(f"Erreur dans les recommandations: {e}")
        return {"error": str(e), "recommendations": ["Erreur lors de la génération"]}
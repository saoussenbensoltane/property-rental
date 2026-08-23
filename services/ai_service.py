# services/ai_service.py
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Any
import random

class AIService:
    """Service d'IA pour l'analyse des prix et recommandations"""
    
    @staticmethod
    def predict_optimal_price(property_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Prédire le prix optimal pour un logement
        """
        # Facteurs influençant le prix
        base_price = property_data.get('price', 0)
        location = property_data.get('location', '')
        property_type = property_data.get('type', '')
        season = AIService._get_season()
        
        # Calcul des coefficients
        location_factor = AIService._get_location_factor(location)
        type_factor = AIService._get_type_factor(property_type)
        season_factor = AIService._get_season_factor(season)
        demand_factor = AIService._get_demand_factor(property_data.get('id', ''))
        
        # Prix optimal
        optimal_price = base_price * (1 + location_factor + type_factor + season_factor + demand_factor)
        
        return {
            "current_price": base_price,
            "optimal_price": round(optimal_price, 2),
            "suggested_price_range": {
                "min": round(optimal_price * 0.85, 2),
                "max": round(optimal_price * 1.15, 2)
            },
            "confidence": random.randint(70, 95),
            "factors": {
                "location": f"{location_factor * 100:.0f}%",
                "type": f"{type_factor * 100:.0f}%",
                "season": f"{season_factor * 100:.0f}%",
                "demand": f"{demand_factor * 100:.0f}%"
            },
            "recommendation": AIService._get_recommendation(optimal_price, base_price)
        }
    
    @staticmethod
    def _get_season() -> str:
        """Déterminer la saison actuelle"""
        month = datetime.now().month
        if 6 <= month <= 8:
            return "summer"
        elif 12 <= month <= 2:
            return "winter"
        elif 3 <= month <= 5:
            return "spring"
        else:
            return "autumn"
    
    @staticmethod
    def _get_location_factor(location: str) -> float:
        """Facteur basé sur la localisation"""
        popular_locations = {
            "tunis": 0.15,
            "sousse": 0.20,
            "hammamet": 0.25,
            "yasmine hammamet": 0.30,
            "djerba": 0.35,
            "monastir": 0.18,
            "nabeul": 0.12
        }
        location_lower = location.lower()
        for key, factor in popular_locations.items():
            if key in location_lower:
                return factor
        return 0.0
    
    @staticmethod
    def _get_type_factor(property_type: str) -> float:
        """Facteur basé sur le type de logement"""
        type_factors = {
            "villa": 0.25,
            "maison": 0.15,
            "appartement": 0.10,
            "studio": -0.05
        }
        return type_factors.get(property_type.lower(), 0.0)
    
    @staticmethod
    def _get_season_factor(season: str) -> float:
        """Facteur basé sur la saison"""
        season_factors = {
            "summer": 0.30,
            "spring": 0.10,
            "autumn": -0.05,
            "winter": -0.15
        }
        return season_factors.get(season, 0.0)
    
    @staticmethod
    def _get_demand_factor(property_id: str) -> float:
        """Facteur basé sur la demande (simulé)"""
        # Simuler la demande basée sur les réservations récentes
        # Dans la vraie vie, compter les vues/réservations
        return random.uniform(-0.1, 0.3)
    
    @staticmethod
    def _get_recommendation(optimal_price: float, current_price: float) -> str:
        """Recommandation basée sur la différence de prix"""
        diff_percent = ((optimal_price - current_price) / current_price) * 100
        
        if diff_percent > 20:
            return "📈 Augmentez votre prix pour maximiser vos revenus"
        elif diff_percent > 5:
            return "📈 Légère augmentation recommandée"
        elif diff_percent > -5:
            return "✅ Prix optimal, continuez comme ça !"
        elif diff_percent > -20:
            return "📉 Réduisez légèrement le prix pour plus de réservations"
        else:
            return "📉 Baissez significativement le prix pour attirer les clients"
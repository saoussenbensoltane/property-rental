import requests
import pytest

class TestAPI:
    BASE_URL = "http://localhost:8000"

    @classmethod
    def setup_class(cls):
        # Crée le compte de test avant les tests (ignore si déjà existant)
        requests.post(f"{cls.BASE_URL}/auth/register", json={
            "email": "monadmin@test.com",
            "password": "Admin123!",
            "name": "Mon Admin"
        })

    def test_health_check(self):
        response = requests.get(f"{self.BASE_URL}/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

    def test_root(self):
        response = requests.get(f"{self.BASE_URL}/")
        assert response.status_code == 200
        assert "Property Rental Management" in response.json()["message"]

    def test_login(self):
        login_data = {
            "email": "monadmin@test.com",
            "password": "Admin123!"
        }
        response = requests.post(f"{self.BASE_URL}/auth/login", json=login_data)
        assert response.status_code == 200
        assert "access_token" in response.json()

    def test_login_invalid(self):
        login_data = {
            "email": "monadmin@test.com",
            "password": "WrongPassword!"
        }
        response = requests.post(f"{self.BASE_URL}/auth/login", json=login_data)
        assert response.status_code == 401

        
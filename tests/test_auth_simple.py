import requests
import time

class TestAuth:
    BASE_URL = "http://localhost:8000"

    def test_register(self):
        # Utiliser un timestamp pour avoir un email unique
        timestamp = int(time.time())
        user_data = {
            "email": f"newuser_{timestamp}@test.com",
            "password": "Admin123!",
            "name": "New User"
        }
        response = requests.post(f"{self.BASE_URL}/auth/register", json=user_data)
        assert response.status_code == 200
        assert "access_token" in response.json()

    def test_login(self):
        # Créer un utilisateur avec un email unique
        timestamp = int(time.time())
        user_data = {
            "email": f"logintest_{timestamp}@test.com",
            "password": "Admin123!",
            "name": "Login Test"
        }
        requests.post(f"{self.BASE_URL}/auth/register", json=user_data)
        
        login_data = {
            "email": user_data["email"],
            "password": "Admin123!"
        }
        response = requests.post(f"{self.BASE_URL}/auth/login", json=login_data)
        assert response.status_code == 200
        assert "access_token" in response.json()

    def test_login_invalid_password(self):
        login_data = {
            "email": "monadmin@test.com",
            "password": "WrongPassword!"
        }
        response = requests.post(f"{self.BASE_URL}/auth/login", json=login_data)
        assert response.status_code == 401
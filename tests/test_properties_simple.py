import requests

class TestProperties:
    BASE_URL = "http://localhost:8000"

    def test_get_properties(self):
        response = requests.get(f"{self.BASE_URL}/properties")
        assert response.status_code == 200
        # La réponse est une liste, pas un objet avec une clé "properties"
        assert isinstance(response.json(), list)
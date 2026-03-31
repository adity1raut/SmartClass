"""
test_info.py — E2E tests for the Info/health-check section.

Endpoints covered:
  GET /         → root index with available endpoints
  GET /health   → liveness probe
"""


class TestRootEndpoint:
    def test_returns_200(self, client):
        res = client.get("/")
        assert res.status_code == 200

    def test_response_shape(self, client):
        data = client.get("/").json()
        assert data["service"] == "SmartClass AI Agent API"
        assert "version" in data
        assert "model" in data
        assert "endpoints" in data

    def test_all_routes_listed(self, client):
        endpoints = client.get("/").json()["endpoints"]
        # Every deployed route should appear in the index
        expected = [
            "/health",
            "/chat",
            "/generate-quiz",
            "/summarize",
            "/feedback",
            "/study-plan",
            "/explain",
            "/analyze-performance",
            "/course-outline",
            "/agent",
        ]
        combined = " ".join(endpoints.keys()) + " " + " ".join(endpoints.values())
        for route in expected:
            assert route in combined, f"Route {route!r} not listed in root index"


class TestHealthEndpoint:
    def test_returns_200(self, client):
        res = client.get("/health")
        assert res.status_code == 200

    def test_status_healthy(self, client):
        data = client.get("/health").json()
        assert data["status"] == "healthy"

    def test_model_field_present(self, client):
        data = client.get("/health").json()
        assert "model" in data
        assert isinstance(data["model"], str)
        assert len(data["model"]) > 0

import pytest


@pytest.fixture
def base_auth_login_call(monkeypatch, test_client):
    monkeypatch.setenv("SPOTIFY_CLIENT_ID", "test")
    return lambda: test_client.get("/auth/login?client_redirect_uri=test")

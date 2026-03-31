"""
conftest.py — Shared pytest fixtures for SmartClass AI Agent E2E tests.

Patching strategy
-----------------
Each module does `from config import client` which creates a LOCAL name binding.
Patching `config.client` alone does NOT affect those already-bound names.
We must patch the `client` attribute in every module that references it directly:
  - llm.client            → used by all tool implementations via _call_claude()
  - agent.client          → used by the agentic loop
  - routes.student.client → used by the /chat endpoint directly
"""

import os

# Must be set before any project module is imported so config.py does not raise.
os.environ.setdefault("ANTHROPIC_API_KEY", "sk-test-key-conftest")

import json
import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient


# ---------------------------------------------------------------------------
# Mock response factories (also imported by test files)
# ---------------------------------------------------------------------------

def make_text_response(text: str = "This is a mock AI response for testing.") -> MagicMock:
    """Build a mock that mirrors anthropic.types.Message with stop_reason='end_turn'."""
    block = MagicMock()
    block.text = text
    block.type = "text"

    usage = MagicMock()
    usage.input_tokens = 42
    usage.output_tokens = 99

    resp = MagicMock()
    resp.content = [block]
    resp.stop_reason = "end_turn"
    resp.usage = usage
    return resp


def make_tool_use_response(
    tool_name: str,
    tool_input: dict,
    tool_id: str = "toolu_test_001",
) -> MagicMock:
    """Build a mock that mirrors an Anthropic tool_use response."""
    block = MagicMock()
    block.type = "tool_use"
    block.name = tool_name
    block.input = tool_input
    block.id = tool_id

    resp = MagicMock()
    resp.content = [block]
    resp.stop_reason = "tool_use"
    resp.usage = MagicMock()
    resp.usage.input_tokens = 100
    resp.usage.output_tokens = 50
    return resp


def make_quiz_json_response(num_questions: int = 3) -> MagicMock:
    """Return a mock whose text is a valid JSON quiz array."""
    questions = [
        {
            "question": f"Sample question {i + 1}?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_answer": i % 4,
            "explanation": f"Explanation for question {i + 1}.",
        }
        for i in range(num_questions)
    ]
    return make_text_response(json.dumps(questions))


# ---------------------------------------------------------------------------
# Session-scoped app / TestClient
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def app():
    """Import and return the FastAPI app once per test session."""
    from app import app as fastapi_app
    return fastapi_app


@pytest.fixture(scope="session")
def client(app):
    """Single TestClient shared across the entire test session."""
    return TestClient(app)


# ---------------------------------------------------------------------------
# Function-scoped LLM mock
# ---------------------------------------------------------------------------

def _apply_mock_client(monkeypatch, mock_client):
    """
    Patch the `client` name in every module that imported it from config.
    This is necessary because `from config import client` creates a local
    binding — patching `config.client` alone would not affect those copies.
    """
    import llm as _llm
    import agent as _agent
    from routes import student as _student_routes

    monkeypatch.setattr(_llm, "client", mock_client)
    monkeypatch.setattr(_agent, "client", mock_client)
    monkeypatch.setattr(_student_routes, "client", mock_client)
    # Also patch config so any future imports see the mock
    import config as _config
    monkeypatch.setattr(_config, "client", mock_client)


@pytest.fixture
def mock_llm(monkeypatch):
    """
    Replace the Anthropic client for the duration of one test.
    Default: returns a plain text response on every call.
    Tests may override mock_llm.messages.create.return_value or .side_effect.
    """
    mock_client = MagicMock()
    mock_client.messages.create.return_value = make_text_response()
    _apply_mock_client(monkeypatch, mock_client)
    return mock_client


@pytest.fixture
def mock_llm_quiz(monkeypatch):
    """Like mock_llm but returns a valid JSON quiz array — for generate-quiz tests."""
    mock_client = MagicMock()
    mock_client.messages.create.return_value = make_quiz_json_response()
    _apply_mock_client(monkeypatch, mock_client)
    return mock_client

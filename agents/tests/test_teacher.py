"""
test_teacher.py — E2E tests for teacher-facing endpoints (excluding /agent).

Endpoints covered:
  POST /generate-quiz    — Generate MCQ quiz questions from a topic or content
  POST /course-outline   — Generate a detailed N-week course outline
"""

import json
from .conftest import make_text_response, make_quiz_json_response


# ---------------------------------------------------------------------------
# POST /generate-quiz
# ---------------------------------------------------------------------------

class TestGenerateQuizEndpoint:
    BASE = "/generate-quiz"
    VALID_PAYLOAD = {
        "topic": "Python Data Structures",
        "num_questions": 3,
        "difficulty": "medium",
    }

    def test_happy_path_returns_200(self, client, mock_llm_quiz):
        res = client.post(self.BASE, json=self.VALID_PAYLOAD)
        assert res.status_code == 200

    def test_response_shape_parsed(self, client, mock_llm_quiz):
        data = client.post(self.BASE, json=self.VALID_PAYLOAD).json()
        assert "questions" in data
        assert "topic" in data
        assert "difficulty" in data
        assert "count" in data

    def test_question_count_matches(self, client, mock_llm_quiz):
        data = client.post(self.BASE, json=self.VALID_PAYLOAD).json()
        assert data["count"] == len(data["questions"])

    def test_each_question_has_required_fields(self, client, mock_llm_quiz):
        data = client.post(self.BASE, json=self.VALID_PAYLOAD).json()
        for q in data["questions"]:
            assert "question" in q
            assert "options" in q
            assert "correct_answer" in q
            assert len(q["options"]) == 4

    def test_topic_echoed(self, client, mock_llm_quiz):
        data = client.post(self.BASE, json=self.VALID_PAYLOAD).json()
        assert data["topic"] == "Python Data Structures"

    def test_difficulty_echoed(self, client, mock_llm_quiz):
        data = client.post(self.BASE, json=self.VALID_PAYLOAD).json()
        assert data["difficulty"] == "medium"

    def test_easy_difficulty(self, client, mock_llm_quiz):
        payload = {**self.VALID_PAYLOAD, "difficulty": "easy"}
        res = client.post(self.BASE, json=payload)
        assert res.status_code == 200

    def test_hard_difficulty(self, client, mock_llm_quiz):
        payload = {**self.VALID_PAYLOAD, "difficulty": "hard"}
        res = client.post(self.BASE, json=payload)
        assert res.status_code == 200

    def test_with_source_content(self, client, mock_llm_quiz):
        """LLM should receive the source content in its prompt."""
        payload = {
            **self.VALID_PAYLOAD,
            "content": "Lists are ordered, mutable collections. Tuples are immutable.",
        }
        res = client.post(self.BASE, json=payload)
        assert res.status_code == 200

    def test_with_course_title(self, client, mock_llm_quiz):
        payload = {**self.VALID_PAYLOAD, "course_title": "Introduction to Python"}
        res = client.post(self.BASE, json=payload)
        assert res.status_code == 200

    def test_single_question(self, client, mock_llm):
        """num_questions=1 should produce a single-item array."""
        questions = [{
            "question": "What is a list?",
            "options": ["A", "B", "C", "D"],
            "correct_answer": 0,
            "explanation": "A list is a mutable sequence.",
        }]
        mock_llm.messages.create.return_value = make_text_response(json.dumps(questions))
        data = client.post(self.BASE, json={**self.VALID_PAYLOAD, "num_questions": 1}).json()
        assert data["count"] == 1

    def test_malformed_json_from_llm_returns_parse_error(self, client, mock_llm):
        """If Claude returns non-JSON text, the endpoint should surface parse_error=True."""
        mock_llm.messages.create.return_value = make_text_response(
            "Sorry, I could not generate questions in JSON format."
        )
        data = client.post(self.BASE, json=self.VALID_PAYLOAD).json()
        assert data.get("parse_error") is True
        assert "raw_response" in data

    def test_json_wrapped_in_code_fence_is_parsed(self, client, mock_llm):
        """Claude sometimes wraps JSON in ```json ... ``` — the endpoint should strip it."""
        questions = [{
            "question": "Q?",
            "options": ["A", "B", "C", "D"],
            "correct_answer": 1,
            "explanation": "Explanation.",
        }]
        fenced = f"```json\n{json.dumps(questions)}\n```"
        mock_llm.messages.create.return_value = make_text_response(fenced)
        data = client.post(self.BASE, json=self.VALID_PAYLOAD).json()
        assert "questions" in data
        assert data.get("parse_error") is not True

    def test_missing_topic_returns_422(self, client):
        payload = {k: v for k, v in self.VALID_PAYLOAD.items() if k != "topic"}
        res = client.post(self.BASE, json=payload)
        assert res.status_code == 422

    def test_llm_error_returns_500(self, client, mock_llm):
        mock_llm.messages.create.side_effect = Exception("Model unavailable")
        res = client.post(self.BASE, json=self.VALID_PAYLOAD)
        assert res.status_code == 500


# ---------------------------------------------------------------------------
# POST /course-outline
# ---------------------------------------------------------------------------

class TestCourseOutlineEndpoint:
    BASE = "/course-outline"
    VALID_PAYLOAD = {
        "course_title": "Introduction to Machine Learning",
        "subject": "Computer Science",
        "duration_weeks": 8,
        "target_level": "intermediate",
    }

    def test_happy_path_returns_200(self, client, mock_llm):
        res = client.post(self.BASE, json=self.VALID_PAYLOAD)
        assert res.status_code == 200

    def test_response_shape(self, client, mock_llm):
        mock_llm.messages.create.return_value = make_text_response(
            "### Course Overview\nThis course covers ML fundamentals.\n"
            "### Weekly Breakdown\nWeek 1: Introduction to ML"
        )
        data = client.post(self.BASE, json=self.VALID_PAYLOAD).json()
        assert "outline" in data
        assert "course_title" in data

    def test_course_title_echoed(self, client, mock_llm):
        data = client.post(self.BASE, json=self.VALID_PAYLOAD).json()
        assert data["course_title"] == "Introduction to Machine Learning"

    def test_outline_is_non_empty_string(self, client, mock_llm):
        mock_llm.messages.create.return_value = make_text_response("Full outline here...")
        data = client.post(self.BASE, json=self.VALID_PAYLOAD).json()
        assert isinstance(data["outline"], str)
        assert len(data["outline"]) > 0

    def test_beginner_level(self, client, mock_llm):
        payload = {**self.VALID_PAYLOAD, "target_level": "beginner"}
        res = client.post(self.BASE, json=payload)
        assert res.status_code == 200
        assert "beginner" in str(mock_llm.messages.create.call_args)

    def test_advanced_level(self, client, mock_llm):
        payload = {**self.VALID_PAYLOAD, "target_level": "advanced"}
        res = client.post(self.BASE, json=payload)
        assert res.status_code == 200

    def test_with_learning_objectives(self, client, mock_llm):
        payload = {
            **self.VALID_PAYLOAD,
            "learning_objectives": "Students will implement supervised and unsupervised learning algorithms.",
        }
        res = client.post(self.BASE, json=payload)
        assert res.status_code == 200
        assert "supervised" in str(mock_llm.messages.create.call_args)

    def test_custom_duration(self, client, mock_llm):
        payload = {**self.VALID_PAYLOAD, "duration_weeks": 12}
        res = client.post(self.BASE, json=payload)
        assert res.status_code == 200
        assert "12" in str(mock_llm.messages.create.call_args)

    def test_missing_course_title_returns_422(self, client):
        payload = {k: v for k, v in self.VALID_PAYLOAD.items() if k != "course_title"}
        res = client.post(self.BASE, json=payload)
        assert res.status_code == 422

    def test_missing_subject_returns_422(self, client):
        payload = {k: v for k, v in self.VALID_PAYLOAD.items() if k != "subject"}
        res = client.post(self.BASE, json=payload)
        assert res.status_code == 422

    def test_missing_duration_weeks_uses_default(self, client, mock_llm):
        """duration_weeks has a default of 8 — omitting it is valid."""
        payload = {k: v for k, v in self.VALID_PAYLOAD.items() if k != "duration_weeks"}
        res = client.post(self.BASE, json=payload)
        assert res.status_code == 200
        assert "8" in str(mock_llm.messages.create.call_args)

    def test_missing_target_level_uses_default(self, client, mock_llm):
        """target_level defaults to 'intermediate' — omitting it is valid."""
        payload = {k: v for k, v in self.VALID_PAYLOAD.items() if k != "target_level"}
        res = client.post(self.BASE, json=payload)
        assert res.status_code == 200
        assert "intermediate" in str(mock_llm.messages.create.call_args)

    def test_llm_error_returns_500(self, client, mock_llm):
        mock_llm.messages.create.side_effect = Exception("Service unavailable")
        res = client.post(self.BASE, json=self.VALID_PAYLOAD)
        assert res.status_code == 500

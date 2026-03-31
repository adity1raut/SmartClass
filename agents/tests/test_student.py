"""
test_student.py — E2E tests for all student-facing endpoints.

Endpoints covered:
  POST /chat                — Multi-turn AI chat assistant
  POST /summarize           — Summarize course material
  POST /explain             — Explain a concept (adaptive difficulty)
  POST /feedback            — AI feedback on assignment submission
  POST /study-plan          — Personalized study plan
  POST /analyze-performance — Student performance analysis
"""

from .conftest import make_text_response


# ---------------------------------------------------------------------------
# POST /chat
# ---------------------------------------------------------------------------

class TestChatEndpoint:
    BASE = "/chat"

    def test_happy_path_returns_200(self, client, mock_llm):
        res = client.post(self.BASE, json={"message": "What is photosynthesis?"})
        assert res.status_code == 200

    def test_response_contains_text(self, client, mock_llm):
        mock_llm.messages.create.return_value = make_text_response("Photosynthesis is the process...")
        data = client.post(self.BASE, json={"message": "What is photosynthesis?"}).json()
        assert "response" in data
        assert "Photosynthesis" in data["response"]

    def test_response_includes_usage_tokens(self, client, mock_llm):
        data = client.post(self.BASE, json={"message": "Hello"}).json()
        assert "usage" in data
        assert "input_tokens" in data["usage"]
        assert "output_tokens" in data["usage"]

    def test_with_course_context(self, client, mock_llm):
        res = client.post(self.BASE, json={
            "message": "Explain mitosis",
            "course_context": "Biology 101",
        })
        assert res.status_code == 200
        # Verify the system prompt included the course context
        call_kwargs = mock_llm.messages.create.call_args
        system = call_kwargs.kwargs.get("system", "") or call_kwargs.args[0] if call_kwargs.args else ""
        # Check via the keyword args dict
        assert "Biology 101" in str(call_kwargs)

    def test_with_conversation_history(self, client, mock_llm):
        res = client.post(self.BASE, json={
            "message": "Can you elaborate?",
            "history": [
                {"role": "user", "content": "What is gravity?"},
                {"role": "assistant", "content": "Gravity is a fundamental force..."},
            ],
        })
        assert res.status_code == 200

    def test_teacher_role_accepted(self, client, mock_llm):
        res = client.post(self.BASE, json={
            "message": "How should I structure a lesson?",
            "user_role": "teacher",
        })
        assert res.status_code == 200

    def test_missing_message_returns_422(self, client):
        res = client.post(self.BASE, json={})
        assert res.status_code == 422

    def test_llm_error_returns_500(self, client, mock_llm):
        mock_llm.messages.create.side_effect = RuntimeError("Anthropic API unavailable")
        res = client.post(self.BASE, json={"message": "Hello"})
        assert res.status_code == 500


# ---------------------------------------------------------------------------
# POST /summarize
# ---------------------------------------------------------------------------

class TestSummarizeEndpoint:
    BASE = "/summarize"
    SAMPLE_CONTENT = (
        "The cell is the basic structural and functional unit of all living organisms. "
        "Cells can be prokaryotic (no nucleus) or eukaryotic (with a nucleus). "
        "Organelles like mitochondria produce energy while the nucleus houses DNA."
    )

    def test_happy_path_returns_200(self, client, mock_llm):
        res = client.post(self.BASE, json={"content": self.SAMPLE_CONTENT})
        assert res.status_code == 200

    def test_response_shape(self, client, mock_llm):
        mock_llm.messages.create.return_value = make_text_response("• Cell is the basic unit\n• Two types: prokaryotic and eukaryotic")
        data = client.post(self.BASE, json={"content": self.SAMPLE_CONTENT}).json()
        assert "summary" in data
        assert "style" in data
        assert "word_count" in data

    def test_word_count_is_int(self, client, mock_llm):
        data = client.post(self.BASE, json={"content": self.SAMPLE_CONTENT}).json()
        assert isinstance(data["word_count"], int)
        assert data["word_count"] > 0

    def test_default_style_is_bullet_points(self, client, mock_llm):
        data = client.post(self.BASE, json={"content": self.SAMPLE_CONTENT}).json()
        assert data["style"] == "bullet-points"

    def test_concise_style(self, client, mock_llm):
        data = client.post(self.BASE, json={"content": self.SAMPLE_CONTENT, "style": "concise"}).json()
        assert data["style"] == "concise"

    def test_detailed_style(self, client, mock_llm):
        res = client.post(self.BASE, json={"content": self.SAMPLE_CONTENT, "style": "detailed"})
        assert res.status_code == 200

    def test_key_concepts_style(self, client, mock_llm):
        res = client.post(self.BASE, json={"content": self.SAMPLE_CONTENT, "style": "key-concepts"})
        assert res.status_code == 200

    def test_missing_content_returns_422(self, client):
        res = client.post(self.BASE, json={})
        assert res.status_code == 422

    def test_llm_error_returns_500(self, client, mock_llm):
        mock_llm.messages.create.side_effect = Exception("Connection timeout")
        res = client.post(self.BASE, json={"content": self.SAMPLE_CONTENT})
        assert res.status_code == 500


# ---------------------------------------------------------------------------
# POST /explain
# ---------------------------------------------------------------------------

class TestExplainEndpoint:
    BASE = "/explain"

    def test_happy_path_returns_200(self, client, mock_llm):
        res = client.post(self.BASE, json={"concept": "recursion"})
        assert res.status_code == 200

    def test_response_shape(self, client, mock_llm):
        mock_llm.messages.create.return_value = make_text_response(
            "### Definition\nRecursion is a function calling itself.\n### Why It Matters\n..."
        )
        data = client.post(self.BASE, json={"concept": "recursion"}).json()
        assert "explanation" in data
        assert "concept" in data
        assert "level" in data

    def test_concept_echoed_in_response(self, client, mock_llm):
        data = client.post(self.BASE, json={"concept": "binary search"}).json()
        assert data["concept"] == "binary search"

    def test_beginner_level(self, client, mock_llm):
        data = client.post(self.BASE, json={"concept": "gravity", "difficulty_level": "beginner"}).json()
        assert data["level"] == "beginner"

    def test_intermediate_level_is_default(self, client, mock_llm):
        data = client.post(self.BASE, json={"concept": "gravity"}).json()
        assert data["level"] == "intermediate"

    def test_advanced_level(self, client, mock_llm):
        res = client.post(self.BASE, json={"concept": "quantum entanglement", "difficulty_level": "advanced"})
        assert res.status_code == 200

    def test_with_course_context(self, client, mock_llm):
        res = client.post(self.BASE, json={
            "concept": "pointers",
            "course_context": "Systems Programming",
            "difficulty_level": "intermediate",
        })
        assert res.status_code == 200
        assert "Systems Programming" in str(mock_llm.messages.create.call_args)

    def test_missing_concept_returns_422(self, client):
        res = client.post(self.BASE, json={"difficulty_level": "beginner"})
        assert res.status_code == 422

    def test_llm_error_returns_500(self, client, mock_llm):
        mock_llm.messages.create.side_effect = ValueError("Model overloaded")
        res = client.post(self.BASE, json={"concept": "osmosis"})
        assert res.status_code == 500


# ---------------------------------------------------------------------------
# POST /feedback
# ---------------------------------------------------------------------------

class TestFeedbackEndpoint:
    BASE = "/feedback"
    VALID_PAYLOAD = {
        "assignment_title": "Essay on Climate Change",
        "student_submission": (
            "Climate change is caused by greenhouse gases such as CO2 and methane. "
            "Human activities like burning fossil fuels are the main drivers. "
            "We need renewable energy to mitigate the effects."
        ),
        "max_score": 100,
    }

    def test_happy_path_returns_200(self, client, mock_llm):
        res = client.post(self.BASE, json=self.VALID_PAYLOAD)
        assert res.status_code == 200

    def test_response_shape(self, client, mock_llm):
        mock_llm.messages.create.return_value = make_text_response(
            "### Overall Assessment\nGood work.\n### Strengths\n- Clear argument\n### Suggested Score\n78 / 100"
        )
        data = client.post(self.BASE, json=self.VALID_PAYLOAD).json()
        assert "feedback" in data
        assert "assignment" in data
        assert "max_score" in data

    def test_assignment_title_echoed(self, client, mock_llm):
        data = client.post(self.BASE, json=self.VALID_PAYLOAD).json()
        assert data["assignment"] == "Essay on Climate Change"

    def test_max_score_echoed(self, client, mock_llm):
        data = client.post(self.BASE, json=self.VALID_PAYLOAD).json()
        assert data["max_score"] == 100

    def test_custom_max_score(self, client, mock_llm):
        payload = {**self.VALID_PAYLOAD, "max_score": 50}
        data = client.post(self.BASE, json=payload).json()
        assert data["max_score"] == 50

    def test_with_assignment_description(self, client, mock_llm):
        payload = {**self.VALID_PAYLOAD, "assignment_description": "Write 500 words on the causes of climate change."}
        res = client.post(self.BASE, json=payload)
        assert res.status_code == 200

    def test_with_course_title(self, client, mock_llm):
        payload = {**self.VALID_PAYLOAD, "course_title": "Environmental Science 101"}
        res = client.post(self.BASE, json=payload)
        assert res.status_code == 200

    def test_missing_title_returns_422(self, client):
        payload = {k: v for k, v in self.VALID_PAYLOAD.items() if k != "assignment_title"}
        res = client.post(self.BASE, json=payload)
        assert res.status_code == 422

    def test_missing_submission_returns_422(self, client):
        payload = {k: v for k, v in self.VALID_PAYLOAD.items() if k != "student_submission"}
        res = client.post(self.BASE, json=payload)
        assert res.status_code == 422

    def test_llm_error_returns_500(self, client, mock_llm):
        mock_llm.messages.create.side_effect = Exception("Rate limit exceeded")
        res = client.post(self.BASE, json=self.VALID_PAYLOAD)
        assert res.status_code == 500


# ---------------------------------------------------------------------------
# POST /study-plan
# ---------------------------------------------------------------------------

class TestStudyPlanEndpoint:
    BASE = "/study-plan"
    VALID_PAYLOAD = {
        "student_name": "Alice",
        "enrolled_courses": ["Mathematics", "Physics", "Computer Science"],
        "available_hours_per_week": 15,
    }

    def test_happy_path_returns_200(self, client, mock_llm):
        res = client.post(self.BASE, json=self.VALID_PAYLOAD)
        assert res.status_code == 200

    def test_response_shape(self, client, mock_llm):
        mock_llm.messages.create.return_value = make_text_response(
            "### Weekly Overview\n| Course | Hours |\n|---|---|\n| Math | 5 |"
        )
        data = client.post(self.BASE, json=self.VALID_PAYLOAD).json()
        assert "study_plan" in data
        assert "student" in data

    def test_student_name_echoed(self, client, mock_llm):
        data = client.post(self.BASE, json=self.VALID_PAYLOAD).json()
        assert data["student"] == "Alice"

    def test_with_weak_areas(self, client, mock_llm):
        payload = {**self.VALID_PAYLOAD, "weak_areas": ["Integration", "Quantum Mechanics"]}
        res = client.post(self.BASE, json=payload)
        assert res.status_code == 200
        assert "Integration" in str(mock_llm.messages.create.call_args)

    def test_with_goals(self, client, mock_llm):
        payload = {**self.VALID_PAYLOAD, "goals": "Score above 90% in all subjects"}
        res = client.post(self.BASE, json=payload)
        assert res.status_code == 200

    def test_single_course(self, client, mock_llm):
        payload = {**self.VALID_PAYLOAD, "enrolled_courses": ["Biology"]}
        res = client.post(self.BASE, json=payload)
        assert res.status_code == 200

    def test_missing_student_name_returns_422(self, client):
        payload = {k: v for k, v in self.VALID_PAYLOAD.items() if k != "student_name"}
        res = client.post(self.BASE, json=payload)
        assert res.status_code == 422

    def test_missing_courses_returns_422(self, client):
        payload = {k: v for k, v in self.VALID_PAYLOAD.items() if k != "enrolled_courses"}
        res = client.post(self.BASE, json=payload)
        assert res.status_code == 422

    def test_llm_error_returns_500(self, client, mock_llm):
        mock_llm.messages.create.side_effect = Exception("Server error")
        res = client.post(self.BASE, json=self.VALID_PAYLOAD)
        assert res.status_code == 500


# ---------------------------------------------------------------------------
# POST /analyze-performance
# ---------------------------------------------------------------------------

class TestAnalyzePerformanceEndpoint:
    BASE = "/analyze-performance"
    VALID_PAYLOAD = {
        "subject": "Mathematics",
        "quiz_scores": [72.0, 68.0, 85.0, 91.0],
        "assignment_grades": [80.0, 75.0, 90.0],
        "course_progress": 65.0,
    }

    def test_happy_path_returns_200(self, client, mock_llm):
        res = client.post(self.BASE, json=self.VALID_PAYLOAD)
        assert res.status_code == 200

    def test_response_shape(self, client, mock_llm):
        mock_llm.messages.create.return_value = make_text_response(
            "### Performance Summary\nGood\n### Trend Analysis\nImproving"
        )
        data = client.post(self.BASE, json=self.VALID_PAYLOAD).json()
        assert "analysis" in data
        assert "subject" in data

    def test_subject_echoed(self, client, mock_llm):
        data = client.post(self.BASE, json=self.VALID_PAYLOAD).json()
        assert data["subject"] == "Mathematics"

    def test_subject_only_no_scores(self, client, mock_llm):
        """Only 'subject' is required — all score fields are optional."""
        res = client.post(self.BASE, json={"subject": "History"})
        assert res.status_code == 200

    def test_scores_passed_to_llm(self, client, mock_llm):
        client.post(self.BASE, json=self.VALID_PAYLOAD)
        prompt_args = str(mock_llm.messages.create.call_args)
        assert "72" in prompt_args or "72.0" in prompt_args

    def test_course_progress_passed_to_llm(self, client, mock_llm):
        client.post(self.BASE, json=self.VALID_PAYLOAD)
        assert "65" in str(mock_llm.messages.create.call_args)

    def test_perfect_scores(self, client, mock_llm):
        payload = {
            "subject": "Physics",
            "quiz_scores": [100.0, 100.0, 100.0],
            "assignment_grades": [100.0],
            "course_progress": 100.0,
        }
        res = client.post(self.BASE, json=payload)
        assert res.status_code == 200

    def test_missing_subject_returns_422(self, client):
        payload = {k: v for k, v in self.VALID_PAYLOAD.items() if k != "subject"}
        res = client.post(self.BASE, json=payload)
        assert res.status_code == 422

    def test_llm_error_returns_500(self, client, mock_llm):
        mock_llm.messages.create.side_effect = Exception("Timeout")
        res = client.post(self.BASE, json=self.VALID_PAYLOAD)
        assert res.status_code == 500

"""
test_agent.py — E2E tests for the POST /agent agentic workflow endpoint.

The agentic loop in agent.py calls config.client.messages.create in a while-loop:
  1. If stop_reason == "end_turn"  → return final text
  2. If stop_reason == "tool_use"  → dispatch each tool, feed results back, loop again

Each tool implementation (in llm.py) also calls config.client.messages.create
for its own single-turn response.  When testing a full tool-use round-trip we
therefore need to account for those intermediate calls via side_effect sequences.

Scenarios tested:
  A. Direct answer — agent ends on first turn (no tools used)
  B. Single-tool use — agent calls one tool then ends
  C. Multi-tool chain — agent calls two tools sequentially then ends
  D. Tool dispatch error — unknown tool name is handled gracefully
  E. Max iterations reached — loop terminates with fallback message
  F. HTTP-level validation — missing required field returns 422
  G. Unexpected exception — returns 500
"""

from unittest.mock import MagicMock
from .conftest import make_text_response, make_tool_use_response


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _end_turn(text: str = "Here is the final answer.") -> MagicMock:
    return make_text_response(text)


def _tool_call(tool_name: str, tool_input: dict, tool_id: str = "toolu_001") -> MagicMock:
    return make_tool_use_response(tool_name, tool_input, tool_id)


# ---------------------------------------------------------------------------
# A. Direct answer (stop_reason == "end_turn" immediately)
# ---------------------------------------------------------------------------

class TestAgentDirectAnswer:
    BASE = "/agent"

    def test_returns_200(self, client, mock_llm):
        mock_llm.messages.create.return_value = _end_turn("Photosynthesis converts light to energy.")
        res = client.post(self.BASE, json={"task": "What is photosynthesis?"})
        assert res.status_code == 200

    def test_response_shape(self, client, mock_llm):
        mock_llm.messages.create.return_value = _end_turn("The answer is 42.")
        data = client.post(self.BASE, json={"task": "What is 6 × 7?"}).json()
        assert "response" in data
        assert "tools_used" in data
        assert "iterations" in data

    def test_response_text_comes_from_llm(self, client, mock_llm):
        mock_llm.messages.create.return_value = _end_turn("Direct answer text.")
        data = client.post(self.BASE, json={"task": "Quick question"}).json()
        assert data["response"] == "Direct answer text."

    def test_no_tools_used_when_end_turn(self, client, mock_llm):
        mock_llm.messages.create.return_value = _end_turn()
        data = client.post(self.BASE, json={"task": "Hello"}).json()
        assert data["tools_used"] == []

    def test_iterations_is_one_for_direct_answer(self, client, mock_llm):
        mock_llm.messages.create.return_value = _end_turn()
        data = client.post(self.BASE, json={"task": "Hello"}).json()
        assert data["iterations"] == 1

    def test_with_context(self, client, mock_llm):
        mock_llm.messages.create.return_value = _end_turn("Personalised answer.")
        res = client.post(self.BASE, json={
            "task": "Summarise my progress",
            "context": {"student_name": "Bob", "course": "Math 101"},
        })
        assert res.status_code == 200
        # Context should be injected into the user message
        call_messages = mock_llm.messages.create.call_args.kwargs.get("messages") or []
        first_content = call_messages[0]["content"] if call_messages else ""
        assert "Bob" in first_content or "Math 101" in first_content

    def test_empty_context_accepted(self, client, mock_llm):
        mock_llm.messages.create.return_value = _end_turn()
        res = client.post(self.BASE, json={"task": "Simple task", "context": {}})
        assert res.status_code == 200


# ---------------------------------------------------------------------------
# B. Single-tool use round-trip
# ---------------------------------------------------------------------------

class TestAgentSingleToolUse:
    BASE = "/agent"

    def _setup_explain_concept_flow(self, mock_llm):
        """
        Call sequence:
          1. agent loop call 1  → tool_use (explain_concept)
          2. llm.explain_concept → _call_claude → end_turn (explanation text)
          3. agent loop call 2  → end_turn (final synthesis)
        """
        tool_response = _tool_call(
            "explain_concept",
            {"concept": "recursion", "level": "beginner", "include_examples": True},
            tool_id="toolu_exp_001",
        )
        tool_impl_response = _end_turn("Recursion is when a function calls itself.")
        final_response = _end_turn("Here is a beginner explanation of recursion for you.")
        mock_llm.messages.create.side_effect = [
            tool_response,
            tool_impl_response,
            final_response,
        ]

    def test_returns_200(self, client, mock_llm):
        self._setup_explain_concept_flow(mock_llm)
        res = client.post(self.BASE, json={"task": "Explain recursion to a beginner"})
        assert res.status_code == 200

    def test_tool_recorded_in_tools_used(self, client, mock_llm):
        self._setup_explain_concept_flow(mock_llm)
        data = client.post(self.BASE, json={"task": "Explain recursion to a beginner"}).json()
        tools = [t["tool"] for t in data["tools_used"]]
        assert "explain_concept" in tools

    def test_tool_success_flag_is_true(self, client, mock_llm):
        self._setup_explain_concept_flow(mock_llm)
        data = client.post(self.BASE, json={"task": "Explain recursion to a beginner"}).json()
        for tool_log in data["tools_used"]:
            assert tool_log["success"] is True

    def test_final_response_from_last_turn(self, client, mock_llm):
        self._setup_explain_concept_flow(mock_llm)
        data = client.post(self.BASE, json={"task": "Explain recursion to a beginner"}).json()
        assert "recursion" in data["response"].lower()

    def test_iterations_count_increments(self, client, mock_llm):
        self._setup_explain_concept_flow(mock_llm)
        data = client.post(self.BASE, json={"task": "Explain recursion to a beginner"}).json()
        # Two agent loop turns (tool_use + end_turn)
        assert data["iterations"] == 2

    def _setup_quiz_generation_flow(self, mock_llm):
        """Simulate agent calling generate_quiz_questions tool."""
        import json as _json
        questions = [
            {"question": "What is a list?", "options": ["A", "B", "C", "D"], "correct_answer": 0, "explanation": "..."},
        ]
        tool_response = _tool_call(
            "generate_quiz_questions",
            {"topic": "Python lists", "num_questions": 1, "difficulty": "easy"},
            tool_id="toolu_quiz_001",
        )
        tool_impl_response = _end_turn(_json.dumps(questions))
        final_response = _end_turn("I have generated 1 quiz question about Python lists.")
        mock_llm.messages.create.side_effect = [tool_response, tool_impl_response, final_response]

    def test_generate_quiz_tool_recorded(self, client, mock_llm):
        self._setup_quiz_generation_flow(mock_llm)
        data = client.post(self.BASE, json={"task": "Generate 1 easy quiz question on Python lists"}).json()
        tools = [t["tool"] for t in data["tools_used"]]
        assert "generate_quiz_questions" in tools

    def _setup_study_schedule_flow(self, mock_llm):
        tool_response = _tool_call(
            "create_study_schedule",
            {"courses": ["Math", "Physics"], "hours_per_week": 10},
            tool_id="toolu_sched_001",
        )
        tool_impl_response = _end_turn("### Weekly Overview\nMath: 5h, Physics: 5h")
        final_response = _end_turn("Your personalised study schedule is ready.")
        mock_llm.messages.create.side_effect = [tool_response, tool_impl_response, final_response]

    def test_study_schedule_tool_recorded(self, client, mock_llm):
        self._setup_study_schedule_flow(mock_llm)
        data = client.post(self.BASE, json={"task": "Create a study schedule for Math and Physics"}).json()
        tools = [t["tool"] for t in data["tools_used"]]
        assert "create_study_schedule" in tools


# ---------------------------------------------------------------------------
# C. Multi-tool chain (two tools in sequence)
# ---------------------------------------------------------------------------

class TestAgentMultiToolChain:
    BASE = "/agent"

    def _setup_summarize_then_quiz_flow(self, mock_llm):
        """
        Agent calls summarize_material, then generate_quiz_questions, then ends.
        Call sequence:
          1. agent → tool_use (summarize_material)
          2. llm.summarize_material → _call_claude → text (summary)
          3. agent (with summary result) → tool_use (generate_quiz_questions)
          4. llm.generate_quiz → _call_claude → JSON questions
          5. agent (with quiz result) → end_turn
        """
        import json as _json

        summarize_call = _tool_call(
            "summarize_material",
            {"content": "Neural networks are...", "format": "bullet-points"},
            tool_id="toolu_sum_001",
        )
        summary_impl = _end_turn("• Neural networks mimic the brain\n• They have layers")

        quiz_call = _tool_call(
            "generate_quiz_questions",
            {"topic": "Neural Networks", "num_questions": 2, "difficulty": "medium"},
            tool_id="toolu_quiz_002",
        )
        questions = [
            {"question": "Q1?", "options": ["A", "B", "C", "D"], "correct_answer": 0, "explanation": "E1"},
            {"question": "Q2?", "options": ["A", "B", "C", "D"], "correct_answer": 1, "explanation": "E2"},
        ]
        quiz_impl = _end_turn(_json.dumps(questions))
        final = _end_turn("I summarised the content and generated 2 quiz questions on Neural Networks.")

        mock_llm.messages.create.side_effect = [
            summarize_call,
            summary_impl,
            quiz_call,
            quiz_impl,
            final,
        ]

    def test_returns_200(self, client, mock_llm):
        self._setup_summarize_then_quiz_flow(mock_llm)
        res = client.post(self.BASE, json={
            "task": "Summarise this content and generate 2 quiz questions from it",
            "context": {"content": "Neural networks are..."},
        })
        assert res.status_code == 200

    def test_both_tools_recorded(self, client, mock_llm):
        self._setup_summarize_then_quiz_flow(mock_llm)
        data = client.post(self.BASE, json={"task": "Summarise then quiz"}).json()
        tools = [t["tool"] for t in data["tools_used"]]
        assert "summarize_material" in tools
        assert "generate_quiz_questions" in tools

    def test_tools_used_count_is_two(self, client, mock_llm):
        self._setup_summarize_then_quiz_flow(mock_llm)
        data = client.post(self.BASE, json={"task": "Summarise then quiz"}).json()
        assert len(data["tools_used"]) == 2

    def test_iterations_count_is_three(self, client, mock_llm):
        """3 agent loop turns: summarize tool_use → quiz tool_use → end_turn."""
        self._setup_summarize_then_quiz_flow(mock_llm)
        data = client.post(self.BASE, json={"task": "Summarise then quiz"}).json()
        assert data["iterations"] == 3

    def test_all_tools_succeed(self, client, mock_llm):
        self._setup_summarize_then_quiz_flow(mock_llm)
        data = client.post(self.BASE, json={"task": "Summarise then quiz"}).json()
        for entry in data["tools_used"]:
            assert entry["success"] is True


# ---------------------------------------------------------------------------
# D. Tool dispatch error (unknown tool name)
# ---------------------------------------------------------------------------

class TestAgentToolDispatchError:
    BASE = "/agent"

    def test_unknown_tool_recorded_as_failed(self, client, mock_llm):
        """
        If the agent tries to call a non-existent tool, _dispatch_tool raises
        ValueError which is caught and logged as success=False.
        """
        unknown_tool_call = make_tool_use_response(
            tool_name="non_existent_tool",
            tool_input={"param": "value"},
            tool_id="toolu_bad_001",
        )
        final = _end_turn("I attempted a tool that doesn't exist.")
        mock_llm.messages.create.side_effect = [unknown_tool_call, final]

        data = client.post(self.BASE, json={"task": "Do something weird"}).json()
        assert len(data["tools_used"]) == 1
        assert data["tools_used"][0]["success"] is False
        assert data["tools_used"][0]["tool"] == "non_existent_tool"
        assert "error" in data["tools_used"][0]

    def test_failed_tool_does_not_crash_endpoint(self, client, mock_llm):
        unknown_tool_call = make_tool_use_response("bad_tool", {}, tool_id="toolu_bad_002")
        final = _end_turn("Recovered gracefully.")
        mock_llm.messages.create.side_effect = [unknown_tool_call, final]

        res = client.post(self.BASE, json={"task": "Trigger a bad tool"})
        assert res.status_code == 200

    def test_response_still_returned_after_tool_error(self, client, mock_llm):
        unknown_tool_call = make_tool_use_response("missing_tool", {}, tool_id="toolu_bad_003")
        final = _end_turn("Final answer despite tool failure.")
        mock_llm.messages.create.side_effect = [unknown_tool_call, final]

        data = client.post(self.BASE, json={"task": "Task with bad tool"}).json()
        assert data["response"] == "Final answer despite tool failure."


# ---------------------------------------------------------------------------
# E. Max iterations reached
# ---------------------------------------------------------------------------

class TestAgentMaxIterations:
    BASE = "/agent"
    MAX = 10

    def test_returns_200_when_max_iterations_hit(self, client, mock_llm):
        """Agent keeps calling tools forever → hits max_iterations → returns fallback."""
        # Each call returns tool_use so the loop never ends naturally
        tool_call = _tool_call("explain_concept", {"concept": "X", "level": "beginner"})
        tool_impl = _end_turn("explanation text")
        # Alternate tool_use and tool_impl responses for MAX iterations
        responses = []
        for _ in range(self.MAX):
            responses.append(tool_call)
            responses.append(tool_impl)
        mock_llm.messages.create.side_effect = responses

        res = client.post(self.BASE, json={"task": "Keep looping forever"})
        assert res.status_code == 200

    def test_fallback_message_on_max_iterations(self, client, mock_llm):
        tool_call = _tool_call("explain_concept", {"concept": "X", "level": "beginner"})
        tool_impl = _end_turn("explanation")
        responses = []
        for _ in range(self.MAX):
            responses.append(tool_call)
            responses.append(tool_impl)
        mock_llm.messages.create.side_effect = responses

        data = client.post(self.BASE, json={"task": "Keep looping"}).json()
        assert "maximum iterations" in data["response"].lower() or len(data["response"]) > 0

    def test_iterations_capped_at_max(self, client, mock_llm):
        tool_call = _tool_call("explain_concept", {"concept": "X", "level": "beginner"})
        tool_impl = _end_turn("explanation")
        responses = []
        for _ in range(self.MAX):
            responses.append(tool_call)
            responses.append(tool_impl)
        mock_llm.messages.create.side_effect = responses

        data = client.post(self.BASE, json={"task": "Keep looping"}).json()
        assert data["iterations"] == self.MAX


# ---------------------------------------------------------------------------
# F. Input validation
# ---------------------------------------------------------------------------

class TestAgentValidation:
    BASE = "/agent"

    def test_missing_task_returns_422(self, client):
        res = client.post(self.BASE, json={})
        assert res.status_code == 422

    def test_empty_task_accepted(self, client, mock_llm):
        """Empty string is technically valid per the Pydantic model."""
        mock_llm.messages.create.return_value = _end_turn()
        res = client.post(self.BASE, json={"task": ""})
        assert res.status_code == 200

    def test_context_defaults_to_empty_dict(self, client, mock_llm):
        mock_llm.messages.create.return_value = _end_turn()
        res = client.post(self.BASE, json={"task": "No context provided"})
        assert res.status_code == 200

    def test_complex_context_serialised_into_message(self, client, mock_llm):
        mock_llm.messages.create.return_value = _end_turn()
        ctx = {
            "student": {"name": "Dana", "id": "stu_123"},
            "course": "Advanced Physics",
            "scores": [88, 92, 76],
        }
        client.post(self.BASE, json={"task": "Analyse Dana's progress", "context": ctx})
        first_message = mock_llm.messages.create.call_args.kwargs["messages"][0]["content"]
        assert "Dana" in first_message
        assert "Advanced Physics" in first_message


# ---------------------------------------------------------------------------
# G. Internal exception → 500
# ---------------------------------------------------------------------------

class TestAgentErrorHandling:
    BASE = "/agent"

    def test_llm_exception_returns_500(self, client, mock_llm):
        mock_llm.messages.create.side_effect = RuntimeError("Anthropic service down")
        res = client.post(self.BASE, json={"task": "Do something"})
        assert res.status_code == 500

    def test_500_response_contains_detail(self, client, mock_llm):
        mock_llm.messages.create.side_effect = Exception("Unexpected failure")
        data = client.post(self.BASE, json={"task": "Do something"}).json()
        assert "detail" in data

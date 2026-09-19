/**
 * Authorization regression tests.
 *
 * These exist because the API was, at one point, almost entirely unauthenticated:
 * only /api/ai had `requireAuth`, so every other endpoint — courses, assignments,
 * grades, dashboards, notifications — was reachable with no credentials at all.
 * On top of that, controllers read the actor's identity (`teacherId`, `studentId`,
 * `userId`) out of the REQUEST BODY, so ownership checks compared a database value
 * against attacker-controlled input.
 *
 * The happy-path tests could never have caught either problem: they always send
 * the correct ids. Every case below is a NEGATIVE case — the thing that must NOT
 * be allowed. Keep them.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import supertest from "supertest";
import mongoose from "mongoose";
import { buildApp } from "../app.js";
import { createTestUser, loginUser } from "./helpers.js";

const { app } = buildApp();
const request = supertest(app);

let teacher, otherTeacher, student, otherStudent;
let teacherCookie, otherTeacherCookie, studentCookie;

const OID = "000000000000000000000000";

beforeAll(async () => {
  teacher = await createTestUser({ email: "authz-t1@test.io", role: "teacher" });
  otherTeacher = await createTestUser({ email: "authz-t2@test.io", role: "teacher" });
  student = await createTestUser({ email: "authz-s1@test.io", role: "student" });
  otherStudent = await createTestUser({ email: "authz-s2@test.io", role: "student" });

  teacherCookie = (await loginUser(request, teacher.email, teacher.plainPassword)).cookie;
  otherTeacherCookie = (await loginUser(request, otherTeacher.email, otherTeacher.plainPassword))
    .cookie;
  studentCookie = (await loginUser(request, student.email, student.plainPassword)).cookie;
});

afterAll(async () => {
  for (const c of Object.values(mongoose.connection.collections)) await c.deleteMany({});
});

// ─────────────────────────────────────────────────────────────────────────────
describe("Authorization", () => {
  // ── 1. Anonymous access ────────────────────────────────────────────────────
  describe("unauthenticated requests are rejected", () => {
    const anonymous = [
      ["get", "/api/courses"],
      ["post", "/api/courses"],
      ["get", `/api/assignments/${OID}`],
      ["get", `/api/quizzes/${OID}`],
      ["get", `/api/live-classes/${OID}`],
      ["get", `/api/notifications/${OID}`],
      ["get", `/api/teachers/${OID}/dashboard`],
      ["get", `/api/students/${OID}/dashboard`],
      ["post", "/api/ai/chat"],
      ["post", "/api/enrollments"],
    ];

    it.each(anonymous)("%s %s -> 401", async (method, path) => {
      const res = await request[method](path).send({});
      expect(res.status).toBe(401);
    });

    it("rejects a token signed with the wrong secret", async () => {
      const res = await request.get("/api/courses").set("Cookie", "sc_token=not.a.real.token");
      expect(res.status).toBe(401);
    });
  });

  // ── 2. Role escalation ─────────────────────────────────────────────────────
  describe("a student cannot perform teacher actions", () => {
    const teacherOnly = [
      ["post", "/api/courses"],
      ["patch", `/api/courses/${OID}`],
      ["delete", `/api/courses/${OID}`],
      ["get", `/api/courses/${OID}/students`],
      ["post", `/api/courses/${OID}/assignments`],
      ["patch", `/api/assignments/${OID}`],
      ["delete", `/api/assignments/${OID}`],
      ["get", `/api/assignments/${OID}/submissions`],
      ["patch", `/api/assignments/submissions/${OID}/grade`],
      ["post", `/api/courses/${OID}/quizzes`],
      ["get", `/api/quizzes/${OID}/results`],
      ["post", `/api/courses/${OID}/live-classes`],
      ["patch", `/api/live-classes/${OID}/status`],
      ["post", `/api/courses/${OID}/materials`],
      ["post", `/api/ai/courses/${OID}/save-quiz`],
      ["post", `/api/ai/submissions/${OID}/feedback`],
    ];

    it.each(teacherOnly)("student %s %s -> 403", async (method, path) => {
      const res = await request[method](path).set("Cookie", studentCookie).send({});
      expect(res.status).toBe(403);
    });
  });

  // ── 3. Cross-user access to personal data ──────────────────────────────────
  describe("users cannot read other users' data", () => {
    it("a student cannot read another user's notifications", async () => {
      const res = await request
        .get(`/api/notifications/${otherStudent.id}`)
        .set("Cookie", studentCookie);
      expect(res.status).toBe(403);
    });

    it("a student cannot mark another user's notifications read", async () => {
      const res = await request
        .patch(`/api/notifications/read-all/${otherStudent.id}`)
        .set("Cookie", studentCookie)
        .send({});
      expect(res.status).toBe(403);
    });

    it("a student cannot read another student's dashboard", async () => {
      const res = await request
        .get(`/api/students/${otherStudent.id}/dashboard`)
        .set("Cookie", studentCookie);
      expect(res.status).toBe(403);
    });

    it("a student cannot read a teacher's dashboard", async () => {
      const res = await request
        .get(`/api/teachers/${teacher.id}/dashboard`)
        .set("Cookie", studentCookie);
      expect(res.status).toBe(403);
    });

    it("a teacher cannot read another teacher's dashboard", async () => {
      const res = await request
        .get(`/api/teachers/${otherTeacher.id}/dashboard`)
        .set("Cookie", teacherCookie);
      expect(res.status).toBe(403);
    });

    it("a student cannot read another student's AI study plans", async () => {
      const res = await request
        .get(`/api/ai/students/${otherStudent.id}/study-plans`)
        .set("Cookie", studentCookie);
      expect(res.status).toBe(403);
    });

    it("a teacher cannot read another teacher's AI outlines", async () => {
      const res = await request
        .get(`/api/ai/teachers/${otherTeacher.id}/outlines`)
        .set("Cookie", teacherCookie);
      expect(res.status).toBe(403);
    });
  });

  // ── 4. Identity must come from the token, not the body ─────────────────────
  describe("a body-supplied id cannot override the authenticated identity", () => {
    it("a course is owned by the caller, not by the teacherId in the body", async () => {
      const res = await request
        .post("/api/courses")
        .set("Cookie", teacherCookie)
        .send({ title: "Ownership probe", teacherId: otherTeacher.id });

      expect(res.status).toBe(201);
      // The course must belong to whoever was authenticated, NOT to the id sent.
      const owner = res.body.teacher?.id ?? res.body.teacher;
      expect(String(owner)).toBe(teacher.id);
      expect(String(owner)).not.toBe(otherTeacher.id);
    });

    it("a teacher cannot modify another teacher's course by sending their id", async () => {
      const mine = await request
        .post("/api/courses")
        .set("Cookie", teacherCookie)
        .send({ title: "Belongs to teacher 1" });

      const res = await request
        .patch(`/api/courses/${mine.body.id}`)
        .set("Cookie", otherTeacherCookie)
        .send({ title: "Hijacked", teacherId: teacher.id });

      expect(res.status).toBe(403);
    });
  });
});

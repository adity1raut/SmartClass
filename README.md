# SmartClass

An AI-powered Learning Management System for teachers and students.

---

## Features

### Authentication
- Email registration with OTP verification
- Login with email and password
- Google OAuth sign-in
- JWT-based session management via HTTP-only cookies

### Course Management
- Teachers can create, update, and delete courses
- Students can browse and enroll in courses
- Course materials upload and management

### Assignments
- Teachers create assignments with due dates and max scores
- Students submit assignments
- AI-assisted grading and feedback

### Quizzes
- Teachers create quizzes manually or via AI generation
- Students attempt quizzes with real-time scoring
- Quiz result history and performance tracking

### Live Classes
- Real-time video broadcasting via WebRTC
- Screen sharing support
- Raise hand, lower hand, and emoji reactions
- Chat during live sessions
- Class recordings upload and storage

### Dashboards
- Teacher dashboard: enrolled students, pending submissions, upcoming classes, course stats
- Student dashboard: enrolled courses, pending assignments, quiz completions, upcoming classes

### Notifications
- Real-time in-app notifications via Socket.IO
- Mark all notifications as read

### AI Playground (powered by Claude)
- **Quiz generation** — auto-generate multiple-choice questions from a topic or content
- **Material summarization** — summarize course content in multiple formats
- **Concept explanation** — explain any concept at beginner, intermediate, or advanced level
- **Grading and feedback** — AI reviews student submissions and suggests a score
- **Study schedule creation** — personalized weekly study plan based on courses and weak areas
- **Performance analysis** — analyze quiz scores and assignment grades with recommendations
- **Course outline generation** — generate a full week-by-week course outline for educators
- **Agentic AI** — multi-step AI agent that chains tools to handle complex requests

---

## Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Gmail account with an [App Password](https://myaccount.google.com/apppasswords) for email
- Anthropic API key for AI features
- Google OAuth Client ID (optional, for Google sign-in)

### 1. Clone the repository

```bash
git clone https://github.com/adity1raut/SmartClass.git
cd SmartClass
```

### 2. Set up the server

```bash
cd server
npm install
cp .env.example .env
```

Open `server/.env` and fill in the required values:

```env
MONGO_URI=your_mongodb_connection_string
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
JWT_SECRET=a_long_random_secret_string
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_CLIENT_ID=your_google_client_id   # optional
```

Start the server:

```bash
npm run dev
```

The API will be running at `http://localhost:5000`.

### 3. Set up the client

```bash
cd ../client
npm install
cp .env.example .env
```

Open `client/.env` and fill in:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id   # optional
```

The other values (`BACKEND_URL`, `VITE_API_URL`, etc.) default to `http://localhost:5000` and work out of the box for local development.

Start the client:

```bash
npm run dev
```

The app will be running at `http://localhost:5173`.

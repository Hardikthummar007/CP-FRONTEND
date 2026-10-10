# CP Platform Frontend

A React (Vite) frontend for your Competitive Programming platform. It follows the provided API contract exactly and uses a LeetCode-like layout.

## Tech
- React 18 + Vite
- React Router v6
- Axios
- Monaco Editor (`@monaco-editor/react`)

## Project Structure
- `src/context/AuthContext.jsx` auth state + localStorage token
- `src/api/client.js` axios client + API wrappers
- `src/components/` UI components (`Navbar`, `CodeEditor`)
- `src/pages/`
  - `Landing.jsx` contests entry + problems CTA
  - `Login.jsx`, `Signup.jsx` (note: login is GET with body)
  - `ProblemsList.jsx` public `getAllProblem`
  - `ProblemDetail.jsx` secured `getProblem?id=` + normal submission
  - `ContestDetail.jsx` get/register/start/end
  - `ContestPage.jsx` navigate problems, submit per problem

## Requirements mapped
- Store token in localStorage after auth
- Use Authorization: Bearer token for secured routes
- `langauge` field name preserved
- `auth/login` uses GET with a body
- `getAllProblem` public; others secured

## Setup
1. Install deps:
   ```bash
   npm install
   ```
2. Run dev server:
   ```bash
   npm run dev
   ```
   Open the shown URL (default http://localhost:5173)

Ensure your backend services are running:
- Auth Service: http://localhost:8087/auth
- Problem & User & Contest Services: http://localhost:8085

## Usage
- Signup or Login. On successful auth, JWT is stored in localStorage.
- Problems: browse list (public). Click into a problem (secured), view details and submit code.
- Contests: from Landing, enter a contest ID to open details. Register, Start (navigates to contest page), Submit per problem, End contest.

## Notes
- If signup does not return a token, you will be redirected to login.
- Sample IO rendering supports both string arrays and JSON-like structures.
- Minimal styling is provided in `src/index.css`. Adjust as needed.


# Dockgen-AI
Dockgen-AI: Setup & Run Instructions

Prerequisites
Node.js (v18+ recommended)
npm (v9+ recommended)
MongoDB (Atlas or local, see .env.example)
Docker (for Docker build/push features)

1. Clone the Repository
git clone https://github.com/govind098/Dockgen-AI.git :
cd Dockgen-AI

2. Backend Setup
cd backend
cp .env.example .env   # Edit .env with your real secrets and config:
npm install

Set up your MongoDB URI, Gemini API key, Docker credentials, and allowed origins in .env.

Start Backend (Development):
npm run dev

Build & Start Backend (Production):
npm run build
npm start

3. Frontend Setup:
cd ../frontend
npm install

Set NEXT_PUBLIC_API_URL in your deployment environment or .env.local (for local dev).

Start Frontend (Development):
npm run dev

Build & Start Frontend (Production):
npm run build
npm start

4. Environment Variables
See backend/.env.example for all required backend variables.
For frontend, set NEXT_PUBLIC_API_URL to your backend's deployed URL.

6. Deployment Notes
CORS: Set ALLOWED_ORIGINS in backend .env to your frontend domain(s).
Production: Use process managers (e.g., PM2) or cloud platforms (Vercel, Heroku, AWS, etc.).
Security: Never commit real secrets or .env files to git.

6. Troubleshooting
If you see CORS errors, check ALLOWED_ORIGINS and NEXT_PUBLIC_API_URL.
For Docker build issues, ensure Docker is running and config files (like nginx.conf) exist.
For Gemini API errors, verify your API key and endpoint

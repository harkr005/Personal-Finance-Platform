## AI Finance Platform - Quick Commands

### Backend (Node + Postgres)

```bash
cd backend
# Ensure .env has your DB password
npm install
npm run migrate
npm run dev
```

Health check (in another terminal):
```bash
curl http://localhost:5000/api/health
```

### ML Service (FastAPI)

Use Python 3.11 (recommended on Windows):
```bash
# From project root
cd mlservice
py -3.11 -m venv venv311
venv311\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python main.py
```

If you only have Python 3.10 installed, replace `-3.11` with `-3.10` and `venv311` with `venv310`.

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

### Environment Files
- Backend: `backend/.env` (already created)
- ML Service: `mlservice/.env`
  ```
  GEMINI_API_KEY=your_gemini_api_key_here
  ML_SERVICE_PORT=8000
  MODEL_PATH=../models
  UPLOAD_DIR=uploads
  ```
- Frontend: `frontend/.env`
  ```
  VITE_API_URL=http://localhost:5000/api
  ```

### Common Troubleshooting
- Postgres auth error: ensure `DATABASE_URL` and `DATABASE_PASSWORD` match your real Postgres password.
- Windows pip build error for scikit‑learn/TensorFlow: use Python 3.11.
- Port in use: stop other processes on 5000/8000/3000 or change the port in env.

# ⚡ RepurposeAI — Complete Full-Stack App

## DEPLOY IN 10 MINUTES

### Step 1: Backend on Render
1. Go to render.com → New → Web Service
2. Connect GitHub repo
3. Settings:
   - Root Directory: `backend`
   - Build: `pip install -r requirements.txt`
   - Start: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --timeout 60`
4. Environment Variables:
   - GROQ_API_KEY = your_key
   - SECRET_KEY = any_random_32char_string
   - RAZORPAY_KEY_ID = rzp_test_xxxxx
   - RAZORPAY_KEY_SECRET = xxxxxxxxxx
   - RAZORPAY_WEBHOOK_SECRET = any_string
5. Deploy → copy URL e.g. https://repurposeai-backend.onrender.com

### Step 2: Frontend on Vercel
1. Go to vercel.com → New Project → Import GitHub repo
2. Settings:
   - Root Directory: `frontend`
   - (everything else auto-detected)
3. Environment Variables:
   - REACT_APP_API_URL = https://repurposeai-backend.onrender.com/api
4. Deploy → DONE!

## Local Development

### Backend
```
cd backend
pip install -r requirements.txt
# Create .env with your keys (see .env.example)
python app.py
```

### Frontend
```
cd frontend
npm install
# Create .env.local: REACT_APP_API_URL=http://localhost:5000/api
npm start
```

## Test Payments
- Card: 4111 1111 1111 1111 | Any future date | Any CVV
- UPI: success@razorpay

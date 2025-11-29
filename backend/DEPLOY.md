# Deploy Instructions

## Option 1: Railway (Fastest - 2 minutes)

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `nodejsFinalProject` → Set root directory to `backend`
5. Add environment variables (copy from .env)
6. Deploy!

Your backend will be at: `https://your-app.railway.app`

Update `VNP_RETURN_URL` to: `https://your-app.railway.app/api/payment/vnpay_return`

## Option 2: Render (Free forever)

Follow steps in DEPLOY_VNPAY.md

## After Deploy

1. Update frontend `src/services/api.js`:
```javascript
const BASE_URL = 'https://your-backend-url.com/api';
```

2. Test VNPay - it will work 100%!

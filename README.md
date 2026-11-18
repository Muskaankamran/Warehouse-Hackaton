# Warehouse & Inventory Management System

A full-stack MERN application for managing warehouse inventory, products, suppliers, and sales orders with role-based access control.

## 🛠️ Tech Stack
- **Frontend**: React.js + Vite + React Router + Axios
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcrypt
- **Image Uploads**: ImageKit (mandatory)

## 🚀 Setup Instructions

### Backend Setup
```bash
cd backend
npm install
# Configure .env (copy from .env.example)
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
# Configure .env (copy from .env.example, add your ImageKit public key)
npm run dev
```

### .env Variables (Backend)
```
MONGODB_URI=your_mongodb_connection_string
PORT=3000
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
JWT_SECRET=your_secret
IMAGEKIT_PRIVATE_KEY=private_xxxx
IMAGEKIT_PUBLIC_KEY=public_xxxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

### .env Variables (Frontend)
```
VITE_IMAGEKIT_PUBLIC_KEY=public_xxxx
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
VITE_API_URL=http://localhost:3000/api
```

## 👥 User Roles & Test Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Admin | admin@wms.com | Admin123! | Full system access |
| Warehouse Manager | manager@wms.com | Manager123! | Assigned warehouse stock |
| Supplier | supplier@wms.com | Supplier123! | Own profile & requests |
| Sales Rep | sales@wms.com | Sales123! | Products & orders |

> **Note**: Create these via the Admin "Create User" form after seeding an admin.

## 🏗️ Creating the First Admin
Since public registration blocks admin creation:
1. Register with any role, then manually update the role in MongoDB Atlas:
   ```
   db.users.updateOne({ email: "admin@wms.com" }, { $set: { role: "admin" } })
   ```
2. Or use the backend directly (Postman) with the registration endpoint.

## 📡 API Endpoints

| Module | Method | Endpoint |
|--------|--------|----------|
| Auth | POST | /api/auth/register |
| Auth | POST | /api/auth/login |
| Auth | GET | /api/auth/me |
| Users | GET/POST | /api/users |
| Users | PUT/DELETE | /api/users/:id |
| Products | GET/POST | /api/products |
| Products | GET/PUT/DELETE | /api/products/:id |
| Warehouses | GET/POST | /api/warehouses |
| Warehouses | PUT/DELETE | /api/warehouses/:id |
| Stock | GET | /api/stock |
| Stock | GET | /api/stock/low |
| Stock | POST | /api/stock/in |
| Stock | POST | /api/stock/out |
| Transactions | GET | /api/transactions |
| Orders | GET/POST | /api/orders |
| Orders | GET/PUT | /api/orders/:id |
| Orders | PUT | /api/orders/:id/status |
| Orders | PUT | /api/orders/:id/cancel |
| Supply Requests | GET/POST | /api/supply-requests |
| Supply Requests | PUT | /api/supply-requests/:id/status |
| Upload | GET | /api/upload/auth |
| Dashboard | GET | /api/dashboard/stats |

## 🔐 Security Notes
- Passwords hashed with bcrypt (salt rounds: 10)
- JWT tokens expire in 7 days
- Role-based middleware on every protected route
- ImageKit private key never exposed to frontend
- Public registration cannot create Admin accounts

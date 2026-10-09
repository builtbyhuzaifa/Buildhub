# Buildhub — Building Materials Marketplace

A full-stack **MERN** marketplace where buyers order construction and interior materials (cement, TMT steel, tiles, plywood, paint) directly from verified sellers, and sellers manage their catalogue, stock and orders from a dashboard.

![Stack](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express_5-000000?logo=express&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?logo=react&logoColor=61DAFB)
![Node](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

## Features

**Buyers**
- Browse products with search, category, price range and in-stock filters, sorting and pagination
- Product pages with live stock, seller details and quantity selector
- Cart saved in the browser, checkout with delivery address (cash on delivery)
- Order history with status tracking and cancellation before shipping

**Sellers**
- Separate seller sign-up with business name
- Dashboard with product count, new orders, low-stock alerts and revenue
- Add, edit and delete products (only their own)
- Incoming orders showing only their own line items, with confirm → ship → deliver workflow

**Under the hood**
- JWT authentication with bcrypt-hashed passwords and role-based access (`buyer`, `seller`, `admin`)
- Stock is reserved with atomic conditional updates, so two buyers can never buy the last unit; cancelled orders return stock
- Prices are always read from the database at checkout, never trusted from the client
- Layered API: routes → controllers → services → Mongoose models
- Central error handler that turns validation, cast and duplicate-key errors into clear 4xx responses
- Search input is regex-escaped; field selection is whitelisted
- Responsive UI with automatic light/dark theme

## Tech stack

| Layer    | Tech |
|----------|------|
| Frontend | React 19, React Router 7, Vite |
| Backend  | Node.js, Express 5 |
| Database | MongoDB with Mongoose |
| Auth     | JSON Web Tokens, bcryptjs |

## Project structure

```
buildhub/
├── client/                 # React app (Vite)
│   └── src/
│       ├── api.js          # fetch wrapper with auth header
│       ├── context/        # AuthContext, CartContext
│       ├── components/     # Navbar, ProductCard, ProtectedRoute…
│       └── pages/          # Home, Products, ProductDetail, Cart, Orders, seller/Dashboard
└── server/                 # Express API
    ├── app.js              # middleware + routes
    ├── server.js           # DB connection + listen
    ├── seed.js             # demo data
    ├── controllers/
    ├── services/
    ├── models/             # User, Category, Product, Order
    ├── middleware/         # auth, validation, errors, logger
    └── routes/
```

## Getting started

**Requirements:** Node.js 20+ and a MongoDB database (local, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster).

```bash
git clone https://github.com/builtbyhuzaifa/Buildhub.git
cd Buildhub
npm run install:all

cp server/.env.example server/.env   # then set MONGO_URI and JWT_SECRET
npm run seed                          # loads demo categories, products and users
```

Run the API and the React app in two terminals:

```bash
npm run dev:server   # http://localhost:5000
npm run dev:client   # http://localhost:5173
```

### Demo accounts (after seeding)

| Role   | Email                 | Password   |
|--------|-----------------------|------------|
| Buyer  | buyer@buildhub.dev    | buyer123   |
| Seller | seller@buildhub.dev   | seller123  |
| Admin  | admin@buildhub.dev    | admin123   |

## API reference

All routes are prefixed with `/api`. Protected routes need `Authorization: Bearer <token>`.

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/auth/register` | Public | Create a buyer or seller account |
| POST | `/auth/login` | Public | Log in, returns a token |
| GET | `/auth/me` | Logged in | Current user |
| GET | `/categories` | Public | Categories with product counts |
| POST | `/categories` | Admin | Create a category |
| DELETE | `/categories/:id` | Admin | Delete an empty category |
| GET | `/products` | Public | List products. Query: `search`, `category` (id or slug), `minPrice`, `maxPrice`, `inStock`, `seller`, `sort` (`newest`, `price_asc`, `price_desc`, `name`), `page`, `limit`, `fields` |
| GET | `/products/:id` | Public | Product details |
| GET | `/products/mine` | Seller | The seller's own products |
| POST | `/products` | Seller | Create a product |
| PATCH | `/products/:id` | Owner / Admin | Update a product |
| DELETE | `/products/:id` | Owner / Admin | Delete a product |
| POST | `/orders` | Logged in | Place an order `{ items: [{ product, quantity }], shippingAddress }` |
| GET | `/orders/mine` | Logged in | Buyer's orders |
| GET | `/orders/seller` | Seller | Orders containing the seller's products |
| PATCH | `/orders/:id/status` | Buyer / Seller / Admin | Move an order along `placed → confirmed → shipped → delivered`, or cancel |

Example:

```bash
curl "http://localhost:5000/api/products?category=cement&sort=price_asc&limit=5"
```

## Deployment

The server serves the built React app when `NODE_ENV=production`, so the project deploys as **one web service** (Render, Railway, etc.):

- **Build command:** `npm run build`
- **Start command:** `npm start`
- **Environment variables:** `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`

## Roadmap

- Image upload to Cloudinary instead of image URLs
- Online payments (Razorpay)
- Product reviews and ratings
- Bulk / quote requests for contractors

## Author

**Mohd Huzaifa** — Full-stack MERN developer · [GitHub](https://github.com/builtbyhuzaifa) · huzaifa@interiorzifa.store

Available for freelance projects.

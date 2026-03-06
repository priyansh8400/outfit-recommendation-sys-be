# 👗 Fashion Outfit Recommendation System

A full-stack fashion outfit recommendation system that lets users explore model outfits and discover similar clothing items. Built with React, Node.js, Express, PostgreSQL, and a Puppeteer-based web scraper.

---

## 📂 Project Structure

```
Outfit System/
├── outfit-recommendation-sys-fe/       # Frontend (React + Vite + TypeScript)
├── outfit-recommendation-sys-be/       # Backend API (Express + Prisma)
└── outfit-recommendation-sys-scraper/  # Scraper Pipeline (Puppeteer + Cheerio)
```

---

## ✅ Prerequisites

Make sure the following are installed on your PC:

| Software       | Version     | Download Link |
|---------------|-------------|---------------|
| **Node.js**    | v18 or above | https://nodejs.org |
| **PostgreSQL** | v14 or above | https://www.postgresql.org/download |
| **Git**        | Latest       | https://git-scm.com |
| **Google Chrome** | Latest    | Required for Puppeteer (scraper) |

---

## 🚀 Setup Instructions

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd "Outfit System"
```

---

### Step 2: Setup PostgreSQL Database

1. Open **pgAdmin** or **psql** terminal
2. Create a new database:

```sql
CREATE DATABASE fashion_outfit_db;
```

3. Note down your PostgreSQL credentials (username, password, port). Default is usually:
   - Username: `postgres`
   - Password: `postgres`
   - Port: `5432`

---

### Step 3: Setup the Scraper (Data Pipeline)

```bash
cd outfit-recommendation-sys-scraper
npm install
```

Create a `.env` file (copy from the example):

```bash
copy .env.example .env
```

Edit `.env` with your database credentials:

```env
PORT=4000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fashion_outfit_db?schema=public"
SCRAPE_DELAY_MIN=1000
SCRAPE_DELAY_MAX=3000
MAX_PAGES_PER_CATEGORY=5
USE_PUPPETEER=false
BATCH_SIZE=50
REDIS_HOST=localhost
REDIS_PORT=6379
```

> ⚠️ Replace `postgres:postgres` with your actual PostgreSQL username and password if different.

Push the database schema:

```bash
npx prisma db push
```

Run the scraping pipeline (this scrapes products from ASOS and normalizes them into the database):

```bash
npm run pipeline
```

> ⏱️ This takes **~1.5 to 2 hours** as it scrapes multiple categories. You can reduce `MAX_PAGES_PER_CATEGORY` in `.env` for faster runs.

After the pipeline finishes, backfill product URLs:

```bash
node scripts/backfill-product-url.js
```

---

### Step 4: Setup the Backend

```bash
cd ../outfit-recommendation-sys-be
npm install
```

Create a `.env` file:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fashion_outfit_db?schema=public"
```

> ⚠️ The `DATABASE_URL` must be the **same** as the scraper's.

Generate Prisma client and push schema:

```bash
npx prisma generate
npx prisma db push
```

Seed the database with sample persons and outfits:

```bash
npm run seed
```

Start the backend server:

```bash
npm run dev
```

✅ Backend will be running at **http://localhost:5000**

Verify it's working:

```
http://localhost:5000/health
```

---

### Step 5: Setup the Frontend

```bash
cd ../outfit-recommendation-sys-fe
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend dev server:

```bash
npm run dev
```

✅ Frontend will be running at **http://localhost:5173**

---

## 🎯 Running Order (Quick Reference)

Always start services in this order:

```
1. PostgreSQL         → Must be running
2. Backend            → cd outfit-recommendation-sys-be && npm run dev
3. Frontend           → cd outfit-recommendation-sys-fe && npm run dev
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |
| GET | `/persons` | All persons |
| GET | `/persons?gender=male` | Persons filtered by gender |
| GET | `/persons/:id/outfits` | All outfits for a person |
| GET | `/outfit/:personId/:outfitId` | Full outfit details + recommendations |
| GET | `/recommendations?gender=&category=` | Similar clothes recommendations |

---

## 🛠️ Useful Commands

### Scraper

| Command | Description |
|---------|-------------|
| `npm run pipeline` | Run full scrape + normalize pipeline |
| `npm run scrape` | Run scrapers only |
| `npm run normalize` | Run normalizer only |
| `npx prisma studio` | Open database browser GUI |

### Backend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend with auto-reload |
| `npm run seed` | Seed persons and outfits |
| `npx prisma studio` | Open database browser GUI |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend dev server |
| `npm run build` | Build for production |

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, React Router v7 |
| Backend | Node.js, Express.js, Prisma ORM |
| Database | PostgreSQL |
| Scraper | Puppeteer (headless Chrome), Cheerio, Axios |
| Styling | Vanilla CSS (Lookbook-style minimal design) |

---

## 💡 Troubleshooting

| Issue | Solution |
|-------|----------|
| `ECONNREFUSED` on backend | Make sure PostgreSQL is running |
| Frontend shows blank page | Check that backend is running on port 5000 |
| `prisma generate` fails with EPERM | Stop the backend server first, then regenerate |
| Scraper takes too long | Reduce `MAX_PAGES_PER_CATEGORY` in scraper `.env` |
| No recommendations showing | Run the pipeline first to populate the clothes table |
| Product links not working | Run `node scripts/backfill-product-url.js` in scraper |

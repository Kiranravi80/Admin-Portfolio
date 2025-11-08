Portfolio Admin - Persistence & Server

What I changed

- Front-end (`app.js`):
  - Added `loadSavedData()` which on page load will try to fetch data from `GET /api/portfolio`. If the server isn't available it falls back to `localStorage` and finally to the built-in in-memory defaults.
  - Added `persistData()` which attempts to `PUT /api/portfolio` (server) and falls back to `localStorage` if the server is unavailable.
  - All edit/add/delete handlers now call `persistData()` so changes survive a page refresh.
- CSS (`style.css`): flipped the experience timeline rules so items alternate left/right starting with left for the first item.
- Small Express server scaffold (`/server`) with `GET /api/portfolio` and `PUT /api/portfolio` backed by a `db.json` file.

Run the optional server (Windows PowerShell)

1. Open PowerShell in the project folder `c:\Users\Kiran\Downloads\portfolio-admin`.
2. Install dependencies for the server:

   cd server; npm install

3. Start the server:

   # production
   npm start

   # or dev mode (auto-restart)
   npm run dev

The server listens on http://localhost:3000 by default. When the front-end is loaded from the file system (opening `index.html` in the browser) it will still try to call `http://localhost:3000/api/portfolio` (same origin won't apply) — modern browsers may block `file://` pages from making requests. To avoid CORS/file origin issues, serve the front-end from a small static server or open `index.html` via a local web server (e.g., Live Server extension in VSCode or `npx http-server`).

Notes & next steps

- If you want the server to be the single source of truth, serve the static front-end from the server (add an Express static route) or host both behind the same origin.
- For production, consider using a real DB (SQLite, PostgreSQL) instead of a JSON file and add validation.
- I intentionally kept the server minimal to be easy to run locally.

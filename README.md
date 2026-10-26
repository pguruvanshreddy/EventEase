# EventEase — Event & Workshop Registration System

EventEase is a web application for creating events and workshops, managing registrations, tracking seat availability, and viewing attendee lists through a clean, responsive interface.

**Live Website:** https://eventease-frontend-hn28.onrender.com  
**Backend API:** https://eventease-api-fxsn.onrender.com  
**GitHub Repository:** https://github.com/pguruvanshreddy/EventEase

## Features

- Create events with a title, description, date, location, and seat capacity.
- Browse available events.
- Register participants using their name and email address.
- Prevent duplicate registrations for the same email address within an event.
- Enforce event capacity and track remaining seats.
- View the attendee list for each event.
- Display registration counts and seat availability.

## Tech Stack

**Frontend**

- React
- Vite
- CSS
- Lucide React icons

**Backend**

- Node.js
- Express.js
- CORS

**Deployment**

- Render Static Site for the frontend
- Render Web Service for the backend

## Project Structure

```text
EventEase/
├── client/          # React frontend
│   ├── src/
│   ├── package.json
│   └── ...
├── server/          # Express backend
│   ├── server.js
│   ├── package.json
│   └── ...
├── .gitignore
└── README.md
```

## Run Locally

### Prerequisites

- Node.js and npm installed
- Git installed

### 1. Clone the repository

```bash
git clone https://github.com/pguruvanshreddy/EventEase.git
cd EventEase
```

### 2. Start the backend

Open a terminal:

```bash
cd server
npm install
node server.js
```

The backend runs on `http://localhost:5000` by default.

### 3. Start the frontend

Open a second terminal from the project root:

```bash
cd client
npm install
npm run dev
```

Vite will print the local development URL, usually `http://localhost:5173`.

**Note:** The frontend's API URL is currently configured for the deployed backend. To run the entire application locally, update the `API_URL` constant in `client/src/App.jsx` to:

```js
const API_URL = "http://localhost:5000/api";
```

Restore the deployed API URL before committing changes intended for production.

## API Endpoints

The backend base URL is:

`https://eventease-api-fxsn.onrender.com`

| Method | Endpoint                    | Description                         |
| ------ | --------------------------- | ----------------------------------- |
| GET    | `/api/health`               | Check backend status                |
| GET    | `/api/events`               | Retrieve all events                 |
| POST   | `/api/events`               | Create an event                     |
| POST   | `/api/events/:id/register`  | Register a participant for an event |
| GET    | `/api/events/:id/attendees` | Retrieve an event's attendee list   |

### Example: Create an Event

Send a `POST` request to `/api/events` with JSON:

```json
{
  "title": "Web Development Workshop",
  "description": "An introductory web development workshop",
  "date": "2026-12-12",
  "location": "Bengaluru",
  "capacity": 30
}
```

### Example: Register a Participant

Send a `POST` request to `/api/events/:id/register` with JSON:

```json
{
  "name": "Alex Smith",
  "email": "alex@example.com"
}
```

The backend validates required fields, rejects duplicate email registrations for an event, and prevents registrations once the event reaches capacity.

## Current Storage Limitation

**The current deployed version uses in-memory storage.** Events and registrations are held in the backend process's memory rather than being persisted in MongoDB.

As a result:

- Data can be lost whenever the backend restarts or redeploys.
- Newly created events and registrations are not permanently stored.
- The current deployment does not provide persistent database storage.

MongoDB persistence was explored during development but could not be made operational in the deployed environment. It remains an area for future improvement.

## Future Improvements

- Integrate persistent MongoDB storage.
- Add authentication and role-based access for event organizers.
- Add event editing and deletion.
- Improve automated testing and validation.
- Add pagination and search for larger event lists.

## Author

**Guruvansh**  
GitHub: https://github.com/pguruvanshreddy

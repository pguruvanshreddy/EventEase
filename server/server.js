
const express = require("express");
const cors = require("cors");
const { randomUUID } = require("crypto");

const app = express();

app.use(cors());
app.use(express.json());

// Temporary storage until database connectivity is fixed
const events = [];

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "EventEase backend is running!" });
});

// Get all events
app.get("/api/events", (req, res) => {
  res.json(events);
});

// Create an event
app.post("/api/events", (req, res) => {
  const { title, description, date, location, capacity } = req.body;

  if (!title || !date || !location || capacity === undefined) {
    return res.status(400).json({
      message: "Title, date, location and capacity are required.",
    });
  }

  const seats = Number(capacity);

  if (!Number.isInteger(seats) || seats < 1) {
    return res.status(400).json({
      message: "Capacity must be a positive whole number.",
    });
  }

  const event = {
    id: randomUUID(),
    title: title.trim(),
    description: description || "",
    date,
    location: location.trim(),
    capacity: seats,
    registrations: [],
    createdAt: new Date().toISOString(),
  };

  events.push(event);
  res.status(201).json(event);
});

// Register a participant
app.post("/api/events/:id/register", (req, res) => {
  const event = events.find((item) => item.id === req.params.id);

  if (!event) {
    return res.status(404).json({ message: "Event not found." });
  }

  const name = req.body.name?.trim();
  const email = req.body.email?.trim().toLowerCase();

  if (!name || !email) {
    return res.status(400).json({
      message: "Participant name and email are required.",
    });
  }

  const alreadyRegistered = event.registrations.some(
    (person) => person.email === email
  );

  if (alreadyRegistered) {
    return res.status(409).json({
      message: "This email is already registered for the event.",
    });
  }

  if (event.registrations.length >= event.capacity) {
    return res.status(409).json({
      message: "Sorry, this event is full.",
    });
  }

  const participant = {
    id: randomUUID(),
    name,
    email,
    registeredAt: new Date().toISOString(),
  };

  event.registrations.push(participant);

  res.status(201).json({
    message: "Registration successful!",
    participant,
    seatsRemaining: event.capacity - event.registrations.length,
  });
});

// Get attendees for an event
app.get("/api/events/:id/attendees", (req, res) => {
  const event = events.find((item) => item.id === req.params.id);

  if (!event) {
    return res.status(404).json({ message: "Event not found." });
  }

  res.json(event.registrations);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`EventEase server running on port ${PORT}`);
});

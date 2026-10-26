
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB models
const participantSchema = new mongoose.Schema(
  {
    id: { type: String, default: randomUUID },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    registeredAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema({
  id: { type: String, default: randomUUID, unique: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  date: { type: String, required: true },
  location: { type: String, required: true, trim: true },
  capacity: { type: Number, required: true, min: 1 },
  registrations: { type: [participantSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

const Event = mongoose.model("Event", eventSchema);

// Convert MongoDB documents to the format the frontend expects.
function formatEvent(event) {
  const item = event.toObject();

  return {
    ...item,
    _id: undefined,
    createdAt: new Date(item.createdAt).toISOString(),
    registrations: item.registrations.map((person) => ({
      ...person,
      registeredAt: new Date(person.registeredAt).toISOString(),
    })),
  };
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: mongoose.connection.readyState === 1 ? "OK" : "DB_DISCONNECTED",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Get all events
app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events.map(formatEvent));
  } catch (error) {
    console.error("Fetch events failed:", error.message);
    res.status(500).json({ message: "Could not fetch events." });
  }
});

// Create an event
app.post("/api/events", async (req, res) => {
  try {
    const { title, description, date, location, capacity } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      !date ||
      typeof location !== "string" ||
      !location.trim() ||
      capacity === undefined
    ) {
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

    const event = await Event.create({
      title: title.trim(),
      description: description || "",
      date,
      location: location.trim(),
      capacity: seats,
      registrations: [],
    });

    res.status(201).json(formatEvent(event));
  } catch (error) {
    console.error("Create event failed:", error.message);
    res.status(500).json({ message: "Could not create event." });
  }
});

// Register a participant
app.post("/api/events/:id/register", async (req, res) => {
  try {
    const event = await Event.findOne({ id: req.params.id });

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

    if (event.registrations.some((person) => person.email === email)) {
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
      registeredAt: new Date(),
    };

    event.registrations.push(participant);
    await event.save();

    res.status(201).json({
      message: "Registration successful!",
      participant: {
        ...participant,
        registeredAt: participant.registeredAt.toISOString(),
      },
      seatsRemaining: event.capacity - event.registrations.length,
    });
  } catch (error) {
    console.error("Registration failed:", error.message);
    res.status(500).json({ message: "Could not complete registration." });
  }
});

// Get attendees for an event
app.get("/api/events/:id/attendees", async (req, res) => {
  try {
    const event = await Event.findOne({ id: req.params.id });

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    res.json(
      event.registrations.map((person) => ({
        ...person.toObject(),
        registeredAt: new Date(person.registeredAt).toISOString(),
      }))
    );
  } catch (error) {
    console.error("Fetch attendees failed:", error.message);
    res.status(500).json({ message: "Could not fetch attendees." });
  }
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing from the environment.");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log("MongoDB connected successfully.");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`EventEase server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();

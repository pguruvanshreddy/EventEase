
import { useEffect, useState } from "react";
import {
  CalendarDays,
  MapPin,
  Users,
  Plus,
  ArrowUpRight,
  Ticket,
  X,
} from "lucide-react";
import "./App.css";

const API_URL = "http://localhost:5000/api";

const emptyForm = {
  title: "",
  description: "",
  date: "",
  location: "",
  capacity: "50",
};

function App() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [participants, setParticipants] = useState({});
  const [registrationMessages, setRegistrationMessages] = useState({});
  const [attendeeEvent, setAttendeeEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);

  async function loadEvents() {
    try {
      const response = await fetch(`${API_URL}/events`);

      if (!response.ok) {
        throw new Error("Couldn't load events.");
      }

      const data = await response.json();
      setEvents(data);
    } catch {
      setError("Couldn't reach the backend. Make sure your server is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function createEvent(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          title: form.title.trim(),
          description: form.description.trim(),
          location: form.location.trim(),
          capacity: Number(form.capacity),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Couldn't create event.");
      }

      setEvents((previous) => [...previous, data]);
      setForm(emptyForm);
      setShowForm(false);
      setMessage("Your event has been created!");
    } catch (err) {
      setError(err.message || "Couldn't create event.");
    } finally {
      setSaving(false);
    }
  }

  function updateParticipant(eventId, field, value) {
    setParticipants((previous) => ({
      ...previous,
      [eventId]: {
        ...(previous[eventId] || { name: "", email: "" }),
        [field]: value,
      },
    }));

    setRegistrationMessages((previous) => ({
      ...previous,
      [eventId]: null,
    }));
  }

  async function registerParticipant(e, event) {
    e.preventDefault();

    const participant = participants[event.id] || {
      name: "",
      email: "",
    };

    setRegistrationMessages((previous) => ({
      ...previous,
      [event.id]: {
        type: "info",
        text: "Submitting your registration...",
      },
    }));

    try {
      const response = await fetch(
        `${API_URL}/events/${event.id}/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(participant),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      setRegistrationMessages((previous) => ({
        ...previous,
        [event.id]: {
          type: "success",
          text: `${data.participant.name} is registered for ${event.title}!`,
        },
      }));

      setParticipants((previous) => ({
        ...previous,
        [event.id]: { name: "", email: "" },
      }));

      await loadEvents();
    } catch (err) {
      setRegistrationMessages((previous) => ({
        ...previous,
        [event.id]: {
          type: "error",
          text: err.message || "Registration failed.",
        },
      }));
    }
  }

  async function viewAttendees(event) {
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/events/${event.id}/attendees`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Couldn't load attendees.");
      }

      setAttendees(data);
      setAttendeeEvent(event);
    } catch (err) {
      setError(err.message || "Couldn't load attendees.");
    }
  }

  const totalRegistrations = events.reduce(
    (total, event) => total + (event.registrations?.length || 0),
    0
  );

  function seatsRemaining(event) {
    return Math.max(
      0,
      Number(event.capacity) - (event.registrations?.length || 0)
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="EventEase home">
          <span className="brand-mark">
            <CalendarDays size={21} />
          </span>
          <span>
            event<span className="brand-accent">ease</span>
          </span>
        </a>

        <span className="topbar-label">EVENT MANAGEMENT, MADE EASY</span>

        <button
          className="button button-primary top-create"
          onClick={() => {
            setError("");
            setMessage("");
            setShowForm(true);
          }}
        >
          <Plus size={17} />
          Create event
        </button>
      </header>

      <main className="main-content">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="status-dot" />
              YOUR EVENTS, ALL IN ONE PLACE
            </div>

            <h1>
              Make every event
              <br />
              <span>an experience.</span>
            </h1>

            <p>
              Create events, bring people together, and keep every registration
              organized — all from one simple dashboard.
            </p>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />

            <div className="art-card art-card-back">
              <CalendarDays size={24} />
              <span>
                Good things
                <br />
                are happening.
              </span>
            </div>

            <div className="art-card art-card-front">
              <div className="art-card-icon">
                <Ticket size={25} />
              </div>
              <span className="art-small">SAVE YOUR SPOT</span>
              <strong>
                Something
                <br />
                to look forward to.
              </strong>
              <div className="art-lines">
                <i />
                <i />
                <i />
              </div>
            </div>

            <span className="floating-dot dot-one" />
            <span className="floating-dot dot-two" />
          </div>
        </section>

        <section className="stats-grid" aria-label="Event statistics">
          <div className="stat-card">
            <span className="stat-icon purple">
              <CalendarDays size={20} />
            </span>
            <div>
              <span className="stat-label">TOTAL EVENTS</span>
              <strong>{events.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon green">
              <Users size={20} />
            </span>
            <div>
              <span className="stat-label">REGISTRATIONS</span>
              <strong>{totalRegistrations}</strong>
            </div>
          </div>
        </section>

        {(message || error) && (
          <div
            className={`notice ${error ? "notice-error" : "notice-success"}`}
            role="status"
          >
            <span>{error || message}</span>
            <button
              onClick={() => {
                setMessage("");
                setError("");
              }}
              aria-label="Dismiss message"
            >
              <X size={17} />
            </button>
          </div>
        )}

        <section className="events-section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">THE LINEUP</div>
              <h2>
                Explore events<span className="heading-period">.</span>
              </h2>
              <p>Everything happening, right here.</p>
            </div>

            <button
              className="button button-secondary"
              onClick={() => {
                setError("");
                setMessage("");
                setShowForm(true);
              }}
            >
              <Plus size={17} />
              New event
            </button>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="loader" />
              <p>Loading your events…</p>
            </div>
          ) : events.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <CalendarDays size={28} />
              </div>
              <h3>Your next big thing starts here.</h3>
              <p>
                You haven't created any events yet. Make one and invite people
                along.
              </p>
              <button
                className="button button-primary"
                onClick={() => setShowForm(true)}
              >
                <Plus size={17} />
                Create an event
              </button>
            </div>
          ) : (
            <div className="events-grid">
              {events.map((event, index) => {
                const registered = event.registrations?.length || 0;
                const remaining = seatsRemaining(event);
                const participant = participants[event.id] || {
                  name: "",
                  email: "",
                };

                return (
                  <article className="event-card" key={event.id}>
                    <div className={`event-card-banner banner-${index % 4}`}>
                      <span className="event-category">
                        <CalendarDays size={14} />
                        EVENT
                      </span>

                      <span className="event-capacity">
                        {remaining === 0
                          ? "SOLD OUT"
                          : `${remaining} SEATS LEFT`}
                      </span>

                      <div className="banner-decoration">
                        <span />
                        <span />
                        <span />
                      </div>

                      <div className="banner-date">
                        <strong>
                          {event.date
                            ? new Date(`${event.date}T12:00:00`).getDate()
                            : "—"}
                        </strong>
                        <span>
                          {event.date
                            ? new Date(`${event.date}T12:00:00`)
                                .toLocaleDateString("en-US", {
                                  month: "short",
                                })
                                .toUpperCase()
                            : "DATE"}
                        </span>
                      </div>
                    </div>

                    <div className="event-card-content">
                      <h3>{event.title}</h3>

                      <p className="event-description">
                        {event.description ||
                          "Come along and be part of the experience."}
                      </p>

                      <div className="event-meta">
                        <CalendarDays size={16} />
                        <span>{event.date}</span>
                      </div>

                      <div className="event-meta">
                        <MapPin size={16} />
                        <span>{event.location}</span>
                      </div>

                      <div className="registration-progress">
                        <div className="progress-label">
                          <span>Registrations</span>
                          <strong>
                            {registered} / {event.capacity}
                          </strong>
                        </div>

                        <div className="progress-track">
                          <span
                            style={{
                              width: `${
                                Number(event.capacity) > 0
                                  ? Math.min(
                                      100,
                                      (registered / Number(event.capacity)) *
                                        100
                                    )
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      <form
                        className="register-form"
                        onSubmit={(e) => registerParticipant(e, event)}
                      >
                        <div className="form-row">
                          <input
                            aria-label={`Your name for ${event.title}`}
                            placeholder="Your name"
                            value={participant.name}
                            onChange={(e) =>
                              updateParticipant(
                                event.id,
                                "name",
                                e.target.value
                              )
                            }
                            required
                          />

                          <input
                            aria-label={`Your email for ${event.title}`}
                            type="email"
                            placeholder="Email address"
                            value={participant.email}
                            onChange={(e) =>
                              updateParticipant(
                                event.id,
                                "email",
                                e.target.value
                              )
                            }
                            required
                          />
                        </div>

                        <button
                          className="button button-primary register-button"
                          type="submit"
                          disabled={remaining === 0}
                        >
                          {remaining === 0 ? (
                            "Event full"
                          ) : (
                            <>
                              Register for event
                              <ArrowUpRight size={16} />
                            </>
                          )}
                        </button>
                      </form>

                      {registrationMessages[event.id] && (
                        <p
                          className={`registration-feedback ${
                            registrationMessages[event.id].type
                          }`}
                          role="status"
                        >
                          {registrationMessages[event.id].text}
                        </p>
                      )}

                      <button
                        className="attendees-button"
                        onClick={() => viewAttendees(event)}
                      >
                        <Users size={15} />
                        View attendee list
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className="footer">
          <span className="footer-brand">
            event<span>ease</span>
          </span>
          <span>Thoughtfully organized. Easily experienced.</span>
          <span>© 2026 EventEase</span>
        </footer>
      </main>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowForm(false);
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-title"
          >
            <div className="modal-heading">
              <div>
                <div className="eyebrow">LET'S GET IT STARTED</div>
                <h2 id="create-title">
                  Create an event<span className="heading-period">.</span>
                </h2>
              </div>

              <button
                className="icon-button"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form className="create-form" onSubmit={createEvent}>
              <label>
                Event name
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="e.g. Campus Tech Fest"
                  required
                />
              </label>

              <label>
                Description <span className="optional">(optional)</span>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="What should people know?"
                  rows="3"
                />
              </label>

              <div className="form-row">
                <label>
                  Date
                  <input
                    type="date"
                    min={new Date().toLocaleDateString("en-CA")}
                    value={form.date}
                    onChange={(e) =>
                      setForm({ ...form, date: e.target.value })
                    }
                    required
                  />
                </label>

                <label>
                  Seat limit
                  <input
                    type="number"
                    min="1"
                    value={form.capacity}
                    onChange={(e) =>
                      setForm({ ...form, capacity: e.target.value })
                    }
                    required
                  />
                </label>
              </div>

              <label>
                Location
                <input
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  placeholder="e.g. BMSCE, Bengaluru"
                  required
                />
              </label>

              <div className="modal-actions">
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  className="button button-primary"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? (
                    "Creating…"
                  ) : (
                    <>
                      <Plus size={17} />
                      Create event
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {attendeeEvent && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setAttendeeEvent(null);
          }}
        >
          <section
            className="modal attendee-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="attendee-title"
          >
            <div className="modal-heading">
              <div>
                <div className="eyebrow">THE GUEST LIST</div>
                <h2 id="attendee-title">
                  Attendees<span className="heading-period">.</span>
                </h2>
                <p className="modal-subtitle">{attendeeEvent.title}</p>
              </div>

              <button
                className="icon-button"
                onClick={() => setAttendeeEvent(null)}
                aria-label="Close attendees"
              >
                <X size={20} />
              </button>
            </div>

            {attendees.length === 0 ? (
              <div className="attendee-empty">
                <Users size={25} />
                <p>
                  No one has registered yet. Be the first to spread the word!
                </p>
              </div>
            ) : (
              <div className="attendee-list">
                {attendees.map((person) => (
                  <div className="attendee-row" key={person.id}>
                    <span className="attendee-avatar">
                      {person.name.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <strong>{person.name}</strong>
                      <span>{person.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default App;

import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import interactionPlugin from "@fullcalendar/react/interaction";

import "@fullcalendar/react/skeleton.css";
import "./App.css";

const STORAGE_KEY = "post-scheduler-posts";

const defaultPosts = [
  {
    id: "1",
    title: "Instagram Post",
    start: "2026-08-15T10:00:00",
    status: "Scheduled",
  },
  {
    id: "2",
    title: "Weekly Update",
    start: "2026-08-21T11:30:00",
    status: "Scheduled",
  },
  {
    id: "3",
    title: "bday",
    start: "2026-08-27T00:00:00",
    status: "Scheduled",
  },
];

function App() {
  const [posts, setPosts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultPosts;
    } catch {
      return defaultPosts;
    }
  });

  const [showPosts, setShowPosts] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    status: "Scheduled",
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }, [posts]);

  const statistics = useMemo(() => {
    return {
      scheduled: posts.filter((post) => post.status === "Scheduled").length,
      drafts: posts.filter((post) => post.status === "Draft").length,
      published: posts.filter((post) => post.status === "Published").length,
      total: posts.length,
    };
  }, [posts]);

  const calendarEvents = posts.map((post) => ({
    id: post.id,
    title: post.title,
    start: post.start,
    editable: true,
    backgroundColor: getStatusColor(post.status),
    borderColor: getStatusColor(post.status),
    extendedProps: {
      status: post.status,
    },
  }));

  function getStatusColor(status) {
    if (status === "Published") return "#22a06b";
    if (status === "Draft") return "#f0a51a";
    return "#7561e8";
  }

  function openAddModal(date = "") {
    const now = new Date();

    let selectedDate = date;

    if (!selectedDate) {
      selectedDate = now.toISOString().split("T")[0];
    }

    setEditingPost(null);

    setForm({
      title: "",
      date: selectedDate,
      time: "10:00",
      status: "Scheduled",
    });

    setShowModal(true);
  }

  function openEditModal(post) {
    const [date, timePart] = post.start.split("T");

    setEditingPost(post);

    setForm({
      title: post.title,
      date,
      time: timePart ? timePart.substring(0, 5) : "10:00",
      status: post.status,
    });

    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingPost(null);
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function savePost(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      alert("Please enter a post title.");
      return;
    }

    if (!form.date) {
      alert("Please select a date.");
      return;
    }

    const start = `${form.date}T${form.time || "10:00"}:00`;

    if (editingPost) {
      setPosts((previous) =>
        previous.map((post) =>
          post.id === editingPost.id
            ? {
                ...post,
                title: form.title.trim(),
                start,
                status: form.status,
              }
            : post
        )
      );
    } else {
      const newPost = {
        id: crypto.randomUUID(),
        title: form.title.trim(),
        start,
        status: form.status,
      };

      setPosts((previous) => [...previous, newPost]);
    }

    closeModal();
  }

  function deletePost(id) {
    const post = posts.find((item) => item.id === id);

    if (!post) return;

    const confirmed = window.confirm(
      `Delete "${post.title}"?`
    );

    if (!confirmed) return;

    setPosts((previous) =>
      previous.filter((item) => item.id !== id)
    );
  }

  function changeStatus(id, status) {
    setPosts((previous) =>
      previous.map((post) =>
        post.id === id
          ? {
              ...post,
              status,
            }
          : post
      )
    );
  }

  function handleDateClick(info) {
    openAddModal(info.dateStr);
  }

  function handleEventClick(info) {
    const post = posts.find(
      (item) => item.id === info.event.id
    );

    if (post) {
      openEditModal(post);
    }
  }

  function handleEventDrop(info) {
    const newStart = info.event.start;

    if (!newStart) return;

    const year = newStart.getFullYear();
    const month = String(
      newStart.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      newStart.getDate()
    ).padStart(2, "0");

    const hours = String(
      newStart.getHours()
    ).padStart(2, "0");

    const minutes = String(
      newStart.getMinutes()
    ).padStart(2, "0");

    const newDateTime =
      `${year}-${month}-${day}T${hours}:${minutes}:00`;

    setPosts((previous) =>
      previous.map((post) =>
        post.id === info.event.id
          ? {
              ...post,
              start: newDateTime,
            }
          : post
      )
    );
  }

  function handleEventResize(info) {
    const newStart = info.event.start;

    if (!newStart) return;

    const year = newStart.getFullYear();
    const month = String(
      newStart.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      newStart.getDate()
    ).padStart(2, "0");

    const hours = String(
      newStart.getHours()
    ).padStart(2, "0");

    const minutes = String(
      newStart.getMinutes()
    ).padStart(2, "0");

    const newDateTime =
      `${year}-${month}-${day}T${hours}:${minutes}:00`;

    setPosts((previous) =>
      previous.map((post) =>
        post.id === info.event.id
          ? {
              ...post,
              start: newDateTime,
            }
          : post
      )
    );
  }

  function formatPostDate(start) {
    return new Date(start).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <div className="app">

      {/* Header */}
      <section className="hero">
        <div>
          <div className="eyebrow">
            CONTENT MANAGEMENT
          </div>

          <h1>Post Scheduler</h1>

          <p>
            Plan, schedule and manage your posts in one place.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => openAddModal()}
        >
          + Add New Post
        </button>
      </section>

      {/* Statistics */}
      <section className="stats-grid">

        <StatCard
          icon="🗓️"
          title="Scheduled Posts"
          value={statistics.scheduled}
          description="Ready to publish"
          type="scheduled"
        />

        <StatCard
          icon="📝"
          title="Drafts"
          value={statistics.drafts}
          description="Still in progress"
          type="draft"
        />

        <StatCard
          icon="✓"
          title="Published"
          value={statistics.published}
          description="Successfully published"
          type="published"
        />

        <StatCard
          icon="📊"
          title="Total Posts"
          value={statistics.total}
          description="All your posts"
          type="total"
        />

      </section>

      {/* Manage Posts */}
      <section className="content-card">

        <div className="section-header">

          <div>
            <div className="eyebrow">CONTENT</div>
            <h2>Manage Posts</h2>
          </div>

          <button
            className="outline-button"
            onClick={() => setShowPosts((value) => !value)}
          >
            {showPosts ? "Hide Posts ▲" : "Show Posts ▼"}
          </button>

        </div>

        {showPosts && (
          <div className="post-list">

            {posts.length === 0 ? (
              <div className="empty-state">
                No posts available.
              </div>
            ) : (
              posts.map((post) => (
                <div
                  className="post-row"
                  key={post.id}
                >

                  <div className="post-information">

                    <div className="post-title-line">
                      <strong>{post.title}</strong>

                      <span
                        className={`status-badge ${post.status.toLowerCase()}`}
                      >
                        {post.status}
                      </span>
                    </div>

                    <div className="post-date">
                      ◷ {formatPostDate(post.start)}
                    </div>

                  </div>

                  <div className="post-actions">

                    <select
                      value={post.status}
                      onChange={(event) =>
                        changeStatus(
                          post.id,
                          event.target.value
                        )
                      }
                    >
                      <option>Scheduled</option>
                      <option>Draft</option>
                      <option>Published</option>
                    </select>

                    <button
                      className="edit-button"
                      onClick={() =>
                        openEditModal(post)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() =>
                        deletePost(post.id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>
              ))
            )}

          </div>
        )}

      </section>

      {/* Drag information */}
      <div className="drag-info">
        ↔ Drag and drop a post on the calendar to reschedule it.
      </div>

      {/* Calendar */}
      <section className="calendar-card">

        <div className="calendar-heading">

          <div>
            <div className="eyebrow">SCHEDULE</div>
            <h2>Content Calendar</h2>
          </div>

          <div className="legend">

            <span>
              <i className="dot scheduled-dot"></i>
              Scheduled
            </span>

            <span>
              <i className="dot draft-dot"></i>
              Draft
            </span>

            <span>
              <i className="dot published-dot"></i>
              Published
            </span>

          </div>

        </div>

        <div className="calendar-wrapper">

          <FullCalendar
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
            ]}
            initialView="dayGridMonth"
            initialDate="2026-08-18"

            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right:
                "dayGridMonth,timeGridWeek,timeGridDay",
            }}

            buttonText={{
              today: "Today",
              month: "Month",
              week: "Week",
              day: "Day",
            }}

            events={calendarEvents}

            editable={true}
            selectable={true}
            dayMaxEvents={3}

            dateClick={handleDateClick}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}

            height="auto"
            contentHeight="650px"

            eventDisplay="block"

            eventContent={(info) => (
              <div className="custom-event">

                <span className="event-dot"></span>

                <span>
                  {info.timeText
                    ? `${info.timeText} `
                    : ""}
                  {info.event.title}
                </span>

              </div>
            )}
          />

        </div>

      </section>

      {/* Modal */}
      {showModal && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >

          <div className="modal">

            <div className="modal-header">

              <div>
                <div className="eyebrow">
                  CONTENT MANAGEMENT
                </div>

                <h2>
                  {editingPost
                    ? "Edit Post"
                    : "Create New Post"}
                </h2>
              </div>

              <button
                className="close-button"
                onClick={closeModal}
              >
                ×
              </button>

            </div>

            <form onSubmit={savePost}>

              <label>
                Post Title

                <input
                  type="text"
                  name="title"
                  placeholder="Enter post title"
                  value={form.title}
                  onChange={handleFormChange}
                  autoFocus
                />
              </label>

              <div className="form-row">

                <label>
                  Date

                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleFormChange}
                  />
                </label>

                <label>
                  Time

                  <input
                    type="time"
                    name="time"
                    value={form.time}
                    onChange={handleFormChange}
                  />
                </label>

              </div>

              <label>
                Status

                <select
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                >
                  <option value="Scheduled">
                    Scheduled
                  </option>

                  <option value="Draft">
                    Draft
                  </option>

                  <option value="Published">
                    Published
                  </option>
                </select>
              </label>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  {editingPost
                    ? "Save Changes"
                    : "Create Post"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  description,
  type,
}) {
  return (
    <div className="stat-card">

      <div className={`stat-icon ${type}`}>
        {icon}
      </div>

      <div>
        <div className="stat-title">
          {title}
        </div>

        <div className="stat-value">
          {value}
        </div>

        <div className="stat-description">
          {description}
        </div>
      </div>

    </div>
  );
}

export default App;
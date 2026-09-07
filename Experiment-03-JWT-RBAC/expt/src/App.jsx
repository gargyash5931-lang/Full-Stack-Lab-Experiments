import { memo, useCallback, useEffect, useMemo, useState } from "react";

import FullCalendar from "@fullcalendar/react";
import themePlugin from "@fullcalendar/react/themes/classic";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import interactionPlugin from "@fullcalendar/react/interaction";

import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/classic/theme.css";
import "@fullcalendar/react/themes/classic/palette.css";

import "./App.css";

const POSTS_KEY = "post_scheduler_posts";
const DARK_KEY = "post_scheduler_dark";

const DEFAULT_POSTS = [
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

/* =====================================================
   STAT CARD
===================================================== */

const StatCard = memo(function StatCard({
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

      <div className="stat-info">
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-description">
          {description}
        </div>
      </div>
    </div>
  );
});

/* =====================================================
   POST ROW
===================================================== */

const PostRow = memo(function PostRow({
  post,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const date = new Date(post.start);

  const formattedDate = date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="post-row">
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
          ◷ {formattedDate}
        </div>
      </div>

      <div className="post-actions">
        <select
          value={post.status}
          onChange={(e) =>
            onStatusChange(
              post.id,
              e.target.value
            )
          }
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

        <button
          className="edit-button"
          onClick={() => onEdit(post)}
        >
          Edit
        </button>

        <button
          className="delete-button"
          onClick={() => onDelete(post.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
});

/* =====================================================
   APP
===================================================== */

function App() {
  /* ===================================================
     POSTS
  =================================================== */

  const [posts, setPosts] = useState(() => {
    try {
      const saved =
        localStorage.getItem(POSTS_KEY);

      if (saved) {
        return JSON.parse(saved);
      }

      return DEFAULT_POSTS;
    } catch {
      return DEFAULT_POSTS;
    }
  });

  /* ===================================================
     DARK MODE
  =================================================== */

  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.getItem(DARK_KEY) ===
      "true"
    );
  });

  /* ===================================================
     SHOW POSTS
  =================================================== */

  const [showPosts, setShowPosts] =
    useState(true);

  /* ===================================================
     MODAL
  =================================================== */

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingPost, setEditingPost] =
    useState(null);

  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "10:00",
    status: "Scheduled",
  });

  /* ===================================================
     SAVE POSTS
  =================================================== */

  useEffect(() => {
    localStorage.setItem(
      POSTS_KEY,
      JSON.stringify(posts)
    );
  }, [posts]);

  /* ===================================================
     SAVE DARK MODE
  =================================================== */

  useEffect(() => {
    localStorage.setItem(
      DARK_KEY,
      String(darkMode)
    );
  }, [darkMode]);

  /* ===================================================
     STATISTICS
  =================================================== */

  const stats = useMemo(() => {
    const scheduled = posts.filter(
      (post) =>
        post.status === "Scheduled"
    ).length;

    const drafts = posts.filter(
      (post) =>
        post.status === "Draft"
    ).length;

    const published = posts.filter(
      (post) =>
        post.status === "Published"
    ).length;

    return {
      scheduled,
      drafts,
      published,
      total: posts.length,
    };
  }, [posts]);

  /* ===================================================
     CALENDAR EVENTS
  =================================================== */

  const events = useMemo(() => {
    return posts.map((post) => {
      let color = "#7561e8";

      if (post.status === "Draft") {
        color = "#e9a51a";
      }

      if (post.status === "Published") {
        color = "#22a06b";
      }

      return {
        id: post.id,
        title: post.title,
        start: post.start,

        backgroundColor: color,
        borderColor: color,

        editable: true,

        extendedProps: {
          status: post.status,
        },
      };
    });
  }, [posts]);

  /* ===================================================
     DARK MODE TOGGLE
  =================================================== */

  const toggleDarkMode = useCallback(() => {
    setDarkMode(
      (previous) => !previous
    );
  }, []);

  /* ===================================================
     SHOW / HIDE
  =================================================== */

  const togglePosts = useCallback(() => {
    setShowPosts(
      (previous) => !previous
    );
  }, []);

  /* ===================================================
     OPEN ADD MODAL
  =================================================== */

  const openAddModal = useCallback(
    (selectedDate = "") => {
      const today =
        new Date()
          .toISOString()
          .split("T")[0];

      setEditingPost(null);

      setForm({
        title: "",
        date:
          selectedDate || today,
        time: "10:00",
        status: "Scheduled",
      });

      setModalOpen(true);
    },
    []
  );

  /* ===================================================
     OPEN EDIT MODAL
  =================================================== */

  const openEditModal = useCallback(
    (post) => {
      const [date, time] =
        post.start.split("T");

      setEditingPost(post);

      setForm({
        title: post.title,
        date: date,
        time: time
          ? time.substring(0, 5)
          : "10:00",
        status: post.status,
      });

      setModalOpen(true);
    },
    []
  );

  /* ===================================================
     CLOSE MODAL
  =================================================== */

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingPost(null);

    setForm({
      title: "",
      date: "",
      time: "10:00",
      status: "Scheduled",
    });
  }, []);

  /* ===================================================
     FORM INPUT
  =================================================== */

  const handleInputChange = useCallback(
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setForm((previous) => ({
        ...previous,
        [name]: value,
      }));
    },
    []
  );

  /* ===================================================
     SAVE POST
  =================================================== */

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      if (!form.title.trim()) {
        alert(
          "Please enter a post title."
        );
        return;
      }

      if (!form.date) {
        alert(
          "Please select a date."
        );
        return;
      }

      const start =
        `${form.date}T${form.time || "10:00"}:00`;

      if (editingPost) {
        setPosts((previous) =>
          previous.map((post) =>
            post.id ===
            editingPost.id
              ? {
                  ...post,
                  title:
                    form.title.trim(),
                  start,
                  status:
                    form.status,
                }
              : post
          )
        );
      } else {
        const newPost = {
          id:
            crypto.randomUUID(),

          title:
            form.title.trim(),

          start,

          status:
            form.status,
        };

        setPosts((previous) => [
          ...previous,
          newPost,
        ]);
      }

      closeModal();
    },
    [form, editingPost, closeModal]
  );

  /* ===================================================
     DELETE
  =================================================== */

  const deletePost = useCallback(
    (id) => {
      const post = posts.find(
        (item) => item.id === id
      );

      if (!post) return;

      const yes = window.confirm(
        `Delete "${post.title}"?`
      );

      if (!yes) return;

      setPosts((previous) =>
        previous.filter(
          (item) =>
            item.id !== id
        )
      );
    },
    [posts]
  );

  /* ===================================================
     STATUS
  =================================================== */

  const changeStatus = useCallback(
    (id, status) => {
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
    },
    []
  );

  /* ===================================================
     DATE CLICK
  =================================================== */

  const handleDateClick = useCallback(
    (info) => {
      openAddModal(info.dateStr);
    },
    [openAddModal]
  );

  /* ===================================================
     EVENT CLICK
  =================================================== */

  const handleEventClick = useCallback(
    (info) => {
      const post = posts.find(
        (item) =>
          item.id ===
          info.event.id
      );

      if (post) {
        openEditModal(post);
      }
    },
    [posts, openEditModal]
  );

  /* ===================================================
     DRAG & DROP
  =================================================== */

  const handleEventDrop = useCallback(
    (info) => {
      const date =
        info.event.start;

      if (!date) return;

      const year =
        date.getFullYear();

      const month = String(
        date.getMonth() + 1
      ).padStart(2, "0");

      const day = String(
        date.getDate()
      ).padStart(2, "0");

      const hours = String(
        date.getHours()
      ).padStart(2, "0");

      const minutes = String(
        date.getMinutes()
      ).padStart(2, "0");

      const newStart =
        `${year}-${month}-${day}T${hours}:${minutes}:00`;

      setPosts((previous) =>
        previous.map((post) =>
          post.id ===
          info.event.id
            ? {
                ...post,
                start: newStart,
              }
            : post
        )
      );
    },
    []
  );

  /* ===================================================
     EVENT RESIZE
  =================================================== */

  const handleEventResize =
    useCallback((info) => {
      const date =
        info.event.start;

      if (!date) return;

      const year =
        date.getFullYear();

      const month = String(
        date.getMonth() + 1
      ).padStart(2, "0");

      const day = String(
        date.getDate()
      ).padStart(2, "0");

      const hours = String(
        date.getHours()
      ).padStart(2, "0");

      const minutes = String(
        date.getMinutes()
      ).padStart(2, "0");

      const newStart =
        `${year}-${month}-${day}T${hours}:${minutes}:00`;

      setPosts((previous) =>
        previous.map((post) =>
          post.id ===
          info.event.id
            ? {
                ...post,
                start: newStart,
              }
            : post
        )
      );
    }, []);

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <div
      className={
        darkMode
          ? "app dark-mode"
          : "app"
      }
    >

      {/* ===============================================
          FLOATING DARK MODE BUTTON
      =============================================== */}

      <button
        type="button"
        className="dark-toggle"
        onClick={toggleDarkMode}
        title={
          darkMode
            ? "Switch to light mode"
            : "Switch to dark mode"
        }
      >
        {darkMode
          ? "☀️ Light"
          : "🌙 Dark"}
      </button>

      {/* ===============================================
          HEADER
      =============================================== */}

      <section className="hero">

        <div>
          <div className="eyebrow">
            CONTENT MANAGEMENT
          </div>

          <h1>
            Post Scheduler
          </h1>

          <p>
            Plan, schedule and manage
            your posts in one place.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() =>
            openAddModal()
          }
        >
          + Add New Post
        </button>

      </section>

      {/* ===============================================
          STATISTICS
      =============================================== */}

      <section className="stats-grid">

        <StatCard
          icon="🗓️"
          title="Scheduled Posts"
          value={stats.scheduled}
          description="Ready to publish"
          type="scheduled"
        />

        <StatCard
          icon="📝"
          title="Drafts"
          value={stats.drafts}
          description="Still in progress"
          type="draft"
        />

        <StatCard
          icon="✓"
          title="Published"
          value={stats.published}
          description="Successfully published"
          type="published"
        />

        <StatCard
          icon="📊"
          title="Total Posts"
          value={stats.total}
          description="All your posts"
          type="total"
        />

      </section>

      {/* ===============================================
          POSTS
      =============================================== */}

      <section className="content-card">

        <div className="section-header">

          <div>
            <div className="eyebrow">
              CONTENT
            </div>

            <h2>
              Manage Posts
            </h2>
          </div>

          <button
            type="button"
            className="outline-button"
            onClick={
              togglePosts
            }
          >
            {showPosts
              ? "Hide Posts ▲"
              : "Show Posts ▼"}
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
                <PostRow
                  key={post.id}
                  post={post}
                  onEdit={
                    openEditModal
                  }
                  onDelete={
                    deletePost
                  }
                  onStatusChange={
                    changeStatus
                  }
                />
              ))
            )}

          </div>
        )}

      </section>

      {/* ===============================================
          DRAG INFO
      =============================================== */}

      <div className="drag-info">
        ↔ Drag and drop a post on the
        calendar to reschedule it.
      </div>

      {/* ===============================================
          CALENDAR
      =============================================== */}

      <section className="calendar-card">

        <div className="calendar-heading">

          <div>
            <div className="eyebrow">
              SCHEDULE
            </div>

            <h2>
              Content Calendar
            </h2>
          </div>

          <div className="legend">

            <span>
              <i className="dot scheduled-dot" />
              Scheduled
            </span>

            <span>
              <i className="dot draft-dot" />
              Draft
            </span>

            <span>
              <i className="dot published-dot" />
              Published
            </span>

          </div>

        </div>

        <div className="calendar-wrapper">

          <FullCalendar

            plugins={[
              themePlugin,
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
            ]}

            themeSystem="classic"

            initialView="dayGridMonth"

            initialDate="2026-08-18"

            headerToolbar={{
              left:
                "prev,next today",

              center:
                "title",

              right:
                "dayGridMonth,timeGridWeek,timeGridDay",
            }}

            buttonText={{
              today: "Today",
              month: "Month",
              week: "Week",
              day: "Day",
            }}

            events={events}

            editable={true}

            selectable={true}

            eventStartEditable={true}

            eventDurationEditable={
              true
            }

            dateClick={
              handleDateClick
            }

            eventClick={
              handleEventClick
            }

            eventDrop={
              handleEventDrop
            }

            eventResize={
              handleEventResize
            }

            dayMaxEvents={3}

            height="auto"

            contentHeight="650px"

            displayEventTime={true}

            eventDisplay="block"

            eventContent={(info) => (
              <div className="custom-event">

                <span className="event-dot" />

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

      {/* ===============================================
          MODAL
      =============================================== */}

      {modalOpen && (

        <div className="modal-overlay">

          <div
            className="modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >

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
                type="button"
                className="close-button"
                onClick={
                  closeModal
                }
              >
                ×
              </button>

            </div>

            {/* IMPORTANT: REAL FORM */}

            <form
              className="post-form"
              onSubmit={
                handleSubmit
              }
            >

              <div className="form-field">

                <label htmlFor="post-title">
                  Post Title
                </label>

                <input
                  id="post-title"
                  name="title"
                  type="text"
                  value={
                    form.title
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter post title"
                  autoComplete="off"
                />

              </div>

              <div className="form-row">

                <div className="form-field">

                  <label htmlFor="post-date">
                    Date
                  </label>

                  <input
                    id="post-date"
                    name="date"
                    type="date"
                    value={
                      form.date
                    }
                    onChange={
                      handleInputChange
                    }
                  />

                </div>

                <div className="form-field">

                  <label htmlFor="post-time">
                    Time
                  </label>

                  <input
                    id="post-time"
                    name="time"
                    type="time"
                    value={
                      form.time
                    }
                    onChange={
                      handleInputChange
                    }
                  />

                </div>

              </div>

              <div className="form-field">

                <label htmlFor="post-status">
                  Status
                </label>

                <select
                  id="post-status"
                  name="status"
                  value={
                    form.status
                  }
                  onChange={
                    handleInputChange
                  }
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

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={
                    closeModal
                  }
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

export default App;
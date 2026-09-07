import React, { useMemo, useState } from "react";
import "./App.css";

const initialPosts = [
  {
    id: 1,
    title: "New video announcement",
    date: "2026-08-30",
    color: "#ef1717",
    platform: "Instagram",
    time: "10:00 am",
    status: "Draft",
  },
  {
    id: 2,
    title: "Birthday",
    date: "2026-09-09",
    color: "#df2f76",
    platform: "Instagram",
    time: "12:00 am",
    status: "Scheduled",
  },
  {
    id: 3,
    title: "Weekly industry tip",
    date: "2026-09-17",
    color: "#1467b9",
    platform: "LinkedIn",
    time: "09:00 am",
    status: "Scheduled",
  },
  {
    id: 4,
    title: "Product launch teaser",
    date: "2026-09-22",
    color: "#df2f76",
    platform: "Instagram",
    time: "06:00 pm",
    status: "Scheduled",
  },
  {
    id: 5,
    title: "Customer story",
    date: "2026-09-28",
    color: "#f1a928",
    platform: "Facebook",
    time: "11:00 am",
    status: "Draft",
  },
];

const pad = (n) => String(n).padStart(2, "0");

const dateKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;

function addDays(date, amount) {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
}

function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function getMonthDays(date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = startOfWeek(first);

  return Array.from({ length: 42 }, (_, index) =>
    addDays(start, index)
  );
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatUpcoming(value) {
  const d = new Date(`${value}T12:00:00`);

  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}

function App() {
  const [posts, setPosts] = useState(initialPosts);

  const [currentDate, setCurrentDate] = useState(
    new Date(2026, 8, 7)
  );

  const [view, setView] = useState("Month");

  const [optimized, setOptimized] = useState(true);

  const [dark, setDark] = useState(false);

  const [draggedId, setDraggedId] = useState(null);

  const [selectedPost, setSelectedPost] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const [stats, setStats] = useState({
    calendarView: 26,
    calendar: 26,
    events: 63,
    modal: 0,
    sidebar: 9,
  });

  const days = useMemo(
    () => getMonthDays(currentDate),
    [currentDate]
  );

  const scheduledCount = posts.filter(
    (post) => post.status === "Scheduled"
  ).length;

  const draftCount = posts.filter(
    (post) => post.status === "Draft"
  ).length;

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const visibleDays =
    view === "Week"
      ? Array.from({ length: 7 }, (_, index) =>
          addDays(startOfWeek(currentDate), index)
        )
      : view === "Day"
      ? [currentDate]
      : days;

  function updateStats(values = {}) {
    setStats((previous) => ({
      ...previous,
      ...values,
    }));
  }

  function changeDate(amount) {
    const next = new Date(currentDate);

    if (view === "Month") {
      next.setMonth(next.getMonth() + amount);
    }

    if (view === "Week") {
      next.setDate(next.getDate() + amount * 7);
    }

    if (view === "Day") {
      next.setDate(next.getDate() + amount);
    }

    setCurrentDate(next);

    updateStats({
      calendarView: stats.calendarView + 1,
      calendar: stats.calendar + 1,
    });
  }

  function goToday() {
    setCurrentDate(new Date(2026, 8, 7));

    updateStats({
      calendarView: stats.calendarView + 1,
    });
  }

  function handleDrop(date) {
    if (!draggedId) return;

    setPosts((previousPosts) =>
      previousPosts.map((post) =>
        post.id === draggedId
          ? {
              ...post,
              date: dateKey(date),
            }
          : post
      )
    );

    setDraggedId(null);

    updateStats({
      calendarView: stats.calendarView + 1,
      calendar: stats.calendar + 1,
      events: stats.events + 1,
    });
  }

  function optimizeCalendar() {
    const baseDate = new Date(2026, 8, 9);

    const times = [
      "10:00 am",
      "12:00 am",
      "09:00 am",
      "06:00 pm",
      "11:00 am",
    ];

    const optimizedPosts = posts.map((post, index) => ({
      ...post,
      date: dateKey(addDays(baseDate, index * 4)),
      time: times[index % times.length],
    }));

    setPosts(optimizedPosts);

    setOptimized(true);

    updateStats({
      calendarView: stats.calendarView + 3,
      calendar: stats.calendar + 3,
      events: stats.events + posts.length * 2,
    });
  }

  function openPost(post) {
    setSelectedPost(post);

    updateStats({
      modal: stats.modal + 1,
    });
  }

  function createPost(event) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const title =
      form.get("title")?.toString().trim() || "New post";

    const platform =
      form.get("platform")?.toString() || "Instagram";

    const date =
      form.get("date")?.toString() || dateKey(currentDate);

    const rawTime =
      form.get("time")?.toString() || "10:00";

    const colors = {
      Instagram: "#df2f76",
      LinkedIn: "#1467b9",
      Facebook: "#f1a928",
      X: "#111827",
    };

    const [hour, minute] = rawTime.split(":");

    const hourNumber = Number(hour);

    const formattedTime = `${
      hourNumber > 12 ? hourNumber - 12 : hourNumber
    }:${minute} ${hourNumber >= 12 ? "pm" : "am"}`;

    const newPost = {
      id: Date.now(),
      title,
      platform,
      date,
      time: formattedTime,
      color: colors[platform] || "#7256ed",
      status: "Scheduled",
    };

    setPosts((previousPosts) => [
      ...previousPosts,
      newPost,
    ]);

    setShowModal(false);

    updateStats({
      modal: stats.modal + 1,
      calendar: stats.calendar + 1,
      events: stats.events + 1,
    });
  }

  function postsForDay(date) {
    return posts.filter(
      (post) => post.date === dateKey(date)
    );
  }

  return (
    <div className={`app-shell ${dark ? "dark" : ""}`}>
      {/* HEADER */}

      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">✦</div>

          <div>
            <div className="eyebrow">
              CONTENT PLANNING
            </div>

            <h1>Social Scheduler</h1>
          </div>
        </div>

        <div className="top-actions">
          <div className="hint">
            Drag posts to find better publishing windows.
          </div>

          <button
            className="theme-button"
            onClick={() => setDark((value) => !value)}
          >
            ◐ {dark ? "Light" : "Dark"}
          </button>
        </div>
      </header>

      <main className="page">

        {/* RENDERING PANEL */}

        <section className="stats-panel">
          <div className="stats-heading">
            <div>
              <div className="eyebrow">
                REACT RENDERING
              </div>

              <h2>
                {optimized ? "Optimized" : "Standard"}
              </h2>
            </div>

            <button
              className={`switch ${
                optimized ? "on" : ""
              }`}
              onClick={() => {
                setOptimized((value) => !value);

                updateStats({
                  calendarView:
                    stats.calendarView + 1,
                  events: stats.events + 1,
                });
              }}
            >
              <span />
              <strong>
                {optimized ? "Optimized" : "Standard"}
              </strong>
            </button>
          </div>

          <div className="stat-grid">
            <Stat
              number={stats.calendarView}
              label="CalendarView renders"
            />

            <Stat
              number={stats.calendar}
              label="Calendar renders"
            />

            <Stat
              number={stats.events}
              label="Event renders"
            />

            <Stat
              number={stats.modal}
              label="Post modal renders"
            />
          </div>

          <div className="stat-foot">
            <span>
              Sidebar renders: {stats.sidebar}
            </span>

            <span>
              Total tracked renders:{" "}
              {stats.calendarView +
                stats.calendar +
                stats.events +
                stats.modal +
                stats.sidebar}
            </span>
          </div>

          <p className="muted">
            Change the calendar, drag a post, open a post,
            or switch views to observe rendering activity.
          </p>
        </section>

        {/* MAIN WORKSPACE */}

        <div className="workspace">

          {/* CALENDAR */}

          <section className="calendar-card">

            <div className="calendar-toolbar">

              <button
                className="today-btn"
                onClick={goToday}
              >
                Today
              </button>

              <button
                className="icon-btn"
                onClick={() => changeDate(-1)}
              >
                ‹
              </button>

              <button
                className="icon-btn"
                onClick={() => changeDate(1)}
              >
                ›
              </button>

              <div className="view-switch">
                {["Month", "Week", "Day"].map(
                  (item) => (
                    <button
                      key={item}
                      className={
                        view === item ? "active" : ""
                      }
                      onClick={() => {
                        setView(item);

                        updateStats({
                          calendarView:
                            stats.calendarView + 1,
                        });
                      }}
                    >
                      {item}
                    </button>
                  )
                )}
              </div>

              <button
                className="new-post"
                onClick={() => setShowModal(true)}
              >
                + New post
              </button>

              <button
                className="optimize-btn"
                onClick={optimizeCalendar}
              >
                ● Optimize calendar
              </button>
            </div>

            <div className="calendar-title">
              <h2>
                {view === "Month"
                  ? monthName
                  : view === "Week"
                  ? `Week of ${formatDate(
                      startOfWeek(currentDate)
                    )}`
                  : formatDate(currentDate)}
              </h2>

              <span>
                {posts.length} posts in your content plan
              </span>
            </div>

            {/* MONTH VIEW */}

            {view === "Month" && (
              <div className="month-grid">

                <div className="week-head">
                  {[
                    "SUN",
                    "MON",
                    "TUE",
                    "WED",
                    "THU",
                    "FRI",
                    "SAT",
                  ].map((day) => (
                    <div key={day}>{day}</div>
                  ))}
                </div>

                <div className="days-grid">
                  {days.map((day) => {
                    const outside =
                      day.getMonth() !==
                      currentDate.getMonth();

                    const isToday =
                      dateKey(day) ===
                      dateKey(
                        new Date(2026, 8, 7)
                      );

                    const dayPosts =
                      postsForDay(day);

                    return (
                      <div
                        key={dateKey(day)}
                        className={`day-cell ${
                          outside ? "outside" : ""
                        } ${
                          isToday ? "today-cell" : ""
                        }`}
                        onDragOver={(event) =>
                          event.preventDefault()
                        }
                        onDrop={() =>
                          handleDrop(day)
                        }
                      >
                        <div className="day-number">
                          {pad(day.getDate())}
                        </div>

                        <div className="event-list">
                          {dayPosts.map((post) => (
                            <PostChip
                              key={post.id}
                              post={post}
                              onDragStart={() =>
                                setDraggedId(post.id)
                              }
                              onClick={() =>
                                openPost(post)
                              }
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* WEEK VIEW */}

            {view === "Week" && (
              <div className="week-view">
                {visibleDays.map((day) => (
                  <DayColumn
                    key={dateKey(day)}
                    date={day}
                    posts={postsForDay(day)}
                    onDrop={() =>
                      handleDrop(day)
                    }
                    onDragStart={setDraggedId}
                    onClick={openPost}
                  />
                ))}
              </div>
            )}

            {/* DAY VIEW */}

            {view === "Day" && (
              <div
                className="day-view"
                onDragOver={(event) =>
                  event.preventDefault()
                }
                onDrop={() =>
                  handleDrop(currentDate)
                }
              >
                <div className="day-view-header">
                  <span>
                    {currentDate.toLocaleDateString(
                      "en-US",
                      { weekday: "long" }
                    )}
                  </span>

                  <strong>
                    {currentDate.getDate()}
                  </strong>
                </div>

                <div className="day-timeline">
                  {Array.from(
                    { length: 10 },
                    (_, index) => {
                      const hour = index + 9;

                      const displayHour =
                        hour > 12
                          ? hour - 12
                          : hour;

                      const label = `${displayHour}:00 ${
                        hour >= 12 ? "pm" : "am"
                      }`;

                      return (
                        <div
                          className="timeline-row"
                          key={hour}
                        >
                          <span>{label}</span>

                          <div>
                            {postsForDay(
                              currentDate
                            )
                              .filter((post) =>
                                post.time
                                  .toLowerCase()
                                  .startsWith(
                                    `${displayHour}:`
                                  )
                              )
                              .map((post) => (
                                <PostChip
                                  key={post.id}
                                  post={post}
                                  onDragStart={() =>
                                    setDraggedId(
                                      post.id
                                    )
                                  }
                                  onClick={() =>
                                    openPost(post)
                                  }
                                />
                              ))}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </section>

          {/* SIDEBAR */}

          <aside className="sidebar">

            {/* SCHEDULE PREFERENCE */}

            <section className="side-card preference-card">

              <div className="side-title">
                <span className="eyebrow">
                  SCHEDULE PREFERENCE
                </span>

                <strong>70%</strong>
              </div>

              <div className="orange-progress">
                <span />
              </div>

              <div className="best-window">
                <div>
                  <strong>
                    Workable publishing window
                  </strong>

                  <span>
                    Wed, 12:00 am
                  </span>
                </div>

                <p>
                  This slot can work, although another
                  time may give you a stronger schedule.
                </p>
              </div>

              <Range
                label="Time window"
                value="40"
                width="42%"
              />

              <Range
                label="Post spacing"
                value="100"
                width="100%"
              />

              <Range
                label="Day quality"
                value="95"
                width="95%"
              />

              <Range
                label="Preferred time"
                value="60"
                width="60%"
              />

              <div className="best-result">
                Best window: Wed, 10:00 am
              </div>
            </section>

            {/* UPCOMING POSTS */}

            <section className="side-card upcoming-card">

              <div className="side-title">
                <h3>Upcoming posts</h3>

                <span className="count-pill">
                  {posts.length}
                </span>
              </div>

              <div className="mini-stats">

                <div>
                  <strong>
                    {draftCount}
                  </strong>

                  <span>DRAFTS</span>
                </div>

                <div>
                  <strong>
                    {scheduledCount}
                  </strong>

                  <span>SCHEDULED</span>
                </div>

                <div>
                  <strong>0</strong>
                  <span>LIVE</span>
                </div>

              </div>

              <div className="upcoming-list">
                {posts.slice(0, 4).map((post) => (
                  <button
                    className="upcoming-item"
                    key={post.id}
                    onClick={() =>
                      openPost(post)
                    }
                  >
                    <span
                      className="dot"
                      style={{
                        background: post.color,
                      }}
                    />

                    <span className="upcoming-content">

                      <strong>
                        {post.title}
                      </strong>

                      <small>
                        {post.platform} /{" "}
                        {formatUpcoming(
                          post.date
                        )}
                        , {post.time}
                      </small>

                      <em>
                        {post.status}
                      </em>

                    </span>
                  </button>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </main>

      {/* POST DETAILS MODAL */}

      {selectedPost && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setSelectedPost(null)
          }
        >
          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-head">
              <div>
                <div className="eyebrow">
                  POST DETAILS
                </div>

                <h3>
                  {selectedPost.title}
                </h3>
              </div>

              <button
                onClick={() =>
                  setSelectedPost(null)
                }
              >
                ×
              </button>
            </div>

            <div className="detail-row">
              <span>Platform</span>
              <strong>
                {selectedPost.platform}
              </strong>
            </div>

            <div className="detail-row">
              <span>Date</span>

              <strong>
                {formatDate(
                  new Date(
                    `${selectedPost.date}T12:00:00`
                  )
                )}
              </strong>
            </div>

            <div className="detail-row">
              <span>Time</span>

              <strong>
                {selectedPost.time}
              </strong>
            </div>

            <div className="detail-row">
              <span>Status</span>

              <strong>
                {selectedPost.status}
              </strong>
            </div>

            <button
              className="new-post full"
              onClick={() =>
                setSelectedPost(null)
              }
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* NEW POST MODAL */}

      {showModal && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setShowModal(false)
          }
        >
          <form
            className="modal"
            onSubmit={createPost}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-head">
              <div>
                <div className="eyebrow">
                  CONTENT PLANNING
                </div>

                <h3>
                  Create new post
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowModal(false)
                }
              >
                ×
              </button>
            </div>

            <label>
              Post title

              <input
                name="title"
                placeholder="e.g. Product launch teaser"
                required
              />
            </label>

            <label>
              Platform

              <select
                name="platform"
                defaultValue="Instagram"
              >
                <option>
                  Instagram
                </option>

                <option>
                  LinkedIn
                </option>

                <option>
                  Facebook
                </option>

                <option>
                  X
                </option>
              </select>
            </label>

            <div className="form-two">

              <label>
                Date

                <input
                  name="date"
                  type="date"
                  defaultValue={dateKey(
                    currentDate
                  )}
                />
              </label>

              <label>
                Time

                <input
                  name="time"
                  type="time"
                  defaultValue="10:00"
                />
              </label>

            </div>

            <button
              className="new-post full"
              type="submit"
            >
              Create post
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function Stat({ number, label }) {
  return (
    <div className="stat-box">
      <strong>{number}</strong>
      <span>{label}</span>
    </div>
  );
}

function Range({ label, value, width }) {
  return (
    <div className="range">
      <div>
        <span>{label}</span>
        <b>{value}</b>
      </div>

      <div className="range-track">
        <span style={{ width }} />
      </div>
    </div>
  );
}

function PostChip({
  post,
  onDragStart,
  onClick,
}) {
  return (
    <button
      className="post-chip"
      style={{
        background: post.color,
      }}
      draggable
      onDragStart={onDragStart}
      onClick={(event) => {
        event.stopPropagation();
        onClick(post);
      }}
      title={`${post.title} — drag to another date`}
    >
      {post.title}
    </button>
  );
}

function DayColumn({
  date,
  posts,
  onDrop,
  onDragStart,
  onClick,
}) {
  return (
    <div
      className="day-column"
      onDragOver={(event) =>
        event.preventDefault()
      }
      onDrop={onDrop}
    >
      <div className="column-date">
        <span>
          {date.toLocaleDateString("en-US", {
            weekday: "short",
          })}
        </span>

        <strong>
          {date.getDate()}
        </strong>
      </div>

      <div className="column-events">
        {posts.map((post) => (
          <PostChip
            key={post.id}
            post={post}
            onDragStart={() =>
              onDragStart(post.id)
            }
            onClick={onClick}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
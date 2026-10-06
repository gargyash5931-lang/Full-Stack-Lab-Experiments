import React, {
  Profiler,
  memo,
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

/* =========================================================
   INITIAL DATA
========================================================= */

const initialPosts = [
  {
    id: 1,
    title: "New video announcement",
    date: "2026-08-30",
    time: "10:00 am",
    platform: "Instagram",
    status: "Draft",
    color: "#ef4444",
  },
  {
    id: 2,
    title: "Birthday",
    date: "2026-09-09",
    time: "12:00 am",
    platform: "Instagram",
    status: "Scheduled",
    color: "#ec4899",
  },
  {
    id: 3,
    title: "Weekly industry tip",
    date: "2026-09-17",
    time: "09:00 am",
    platform: "LinkedIn",
    status: "Scheduled",
    color: "#3b82f6",
  },
  {
    id: 4,
    title: "Product launch teaser",
    date: "2026-09-22",
    time: "06:00 pm",
    platform: "Instagram",
    status: "Scheduled",
    color: "#ec4899",
  },
  {
    id: 5,
    title: "Customer story",
    date: "2026-09-28",
    time: "11:00 am",
    platform: "Facebook",
    status: "Draft",
    color: "#f97316",
  },
];

/* =========================================================
   DATE HELPERS
========================================================= */

const pad = (number) => String(number).padStart(2, "0");

const dateKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;

const parseDate = (value) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const addDays = (date, amount) => {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
};

const startOfWeek = (date) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);

  return result;
};

const getMonthDays = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const firstMonday = startOfWeek(firstDay);

  return Array.from({ length: 42 }, (_, index) =>
    addDays(firstMonday, index)
  );
};

const formatDate = (date) =>
  date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

const formatShortDate = (date) =>
  date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

/* =========================================================
   SCHEDULE PERFORMANCE
========================================================= */

const getTimeScore = (time) => {
  const match = time.match(/(\d+):(\d+)\s*(am|pm)/i);

  if (!match) return 50;

  let hour = Number(match[1]);
  const period = match[3].toLowerCase();

  if (period === "pm" && hour !== 12) hour += 12;
  if (period === "am" && hour === 12) hour = 0;

  if (hour >= 9 && hour <= 11) return 100;
  if (hour >= 8 && hour <= 12) return 85;
  if (hour >= 13 && hour <= 18) return 70;

  return 45;
};

const getDayQuality = (dateValue) => {
  const date = parseDate(dateValue);
  const day = date.getDay();

  if (day >= 1 && day <= 5) return 95;
  if (day === 6) return 75;

  return 55;
};

const calculateSchedulePerformance = (posts) => {
  if (!posts.length) {
    return {
      overall: 0,
      timeWindow: 0,
      spacing: 0,
      dayQuality: 0,
      preferredTime: 0,
      bestPost: null,
    };
  }

  const timeAverage =
    posts.reduce((sum, post) => sum + getTimeScore(post.time), 0) /
    posts.length;

  const dayAverage =
    posts.reduce((sum, post) => sum + getDayQuality(post.date), 0) /
    posts.length;

  const sortedDates = [...posts]
    .sort((a, b) => parseDate(a.date) - parseDate(b.date))
    .map((post) => parseDate(post.date));

  let spacingScore = 100;

  if (sortedDates.length > 1) {
    let totalGap = 0;

    for (let i = 1; i < sortedDates.length; i++) {
      totalGap +=
        (sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24);
    }

    const averageGap = totalGap / (sortedDates.length - 1);

    if (averageGap >= 3) spacingScore = 100;
    else if (averageGap >= 2) spacingScore = 80;
    else if (averageGap >= 1) spacingScore = 60;
    else spacingScore = 35;
  }

  const overall = Math.round(
    (timeAverage + dayAverage + spacingScore) / 3
  );

  const bestPost = [...posts].sort(
    (a, b) => getTimeScore(b.time) - getTimeScore(a.time)
  )[0];

  return {
    overall,
    timeWindow: Math.round(overall * 0.42),
    spacing: spacingScore,
    dayQuality: Math.round(dayAverage),
    preferredTime: Math.round(timeAverage),
    bestPost,
  };
};

/* =========================================================
   RENDER PROFILER STORE
   This keeps render statistics outside the App component so
   updating the statistics does not itself create a render loop.
========================================================= */

let renderStats = {
  calendarView: 0,
  calendar: 0,
  events: 0,
  modal: 0,
};

const renderListeners = new Set();

const notifyRenderListeners = () => {
  renderListeners.forEach((listener) => listener());
};

const getRenderStats = () => renderStats;

const subscribeRenderStats = (listener) => {
  renderListeners.add(listener);

  return () => {
    renderListeners.delete(listener);
  };
};

const updateRenderStats = (id, phase) => {
  // Mount renders are ignored so the teacher can reset and test actions.
  if (phase === "mount") return;

  if (id === "CalendarView") {
    renderStats = {
      ...renderStats,
      calendarView: renderStats.calendarView + 1,
    };
  }

  if (id === "Calendar") {
    renderStats = {
      ...renderStats,
      calendar: renderStats.calendar + 1,
    };
  }

  if (id === "Event") {
    renderStats = {
      ...renderStats,
      events: renderStats.events + 1,
    };
  }

  if (id === "PostModal") {
    renderStats = {
      ...renderStats,
      modal: renderStats.modal + 1,
    };
  }

  notifyRenderListeners();
};

const resetRenderStats = () => {
  renderStats = {
    calendarView: 0,
    calendar: 0,
    events: 0,
    modal: 0,
  };

  notifyRenderListeners();
};

/* =========================================================
   RENDER STATS PANEL
========================================================= */

function RenderStatsPanel({ optimized, dragCount }) {
  const stats = useSyncExternalStore(
    subscribeRenderStats,
    getRenderStats,
    getRenderStats
  );

  const total =
    stats.calendarView +
    stats.calendar +
    stats.events +
    stats.modal;

  return (
    <section className="stats-panel">
      <div className="stats-heading">
        <div>
          <span className="eyebrow">RENDER PERFORMANCE</span>
          <h2>{optimized ? "Optimized" : "Standard"}</h2>
        </div>

        <button className="today-btn" onClick={resetRenderStats}>
          🔄 Reset renders
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-box">
          <strong>{stats.calendarView}</strong>
          <span>CalendarView renders</span>
        </div>

        <div className="stat-box">
          <strong>{stats.calendar}</strong>
          <span>Calendar renders</span>
        </div>

        <div className="stat-box">
          <strong>{stats.events}</strong>
          <span>Event renders</span>
        </div>

        <div className="stat-box">
          <strong>{stats.modal}</strong>
          <span>Post modal renders</span>
        </div>
      </div>

      <div className="stat-foot">
        <span>
          Total tracked renders: <strong>{total}</strong>
        </span>

        <span>
          Drag &amp; drop actions: <strong>{dragCount}</strong>
        </span>
      </div>
    </section>
  );
}

/* =========================================================
   POST CHIP
========================================================= */

function PostChip({ post, onDragStart, onClick }) {
  return (
    <button
      className="post-chip"
      style={{ background: post.color }}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        onDragStart(post.id);
      }}
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

const OptimizedPostChip = memo(PostChip);

/* =========================================================
   EVENT
========================================================= */

function Event({
  post,
  onDragStart,
  onClick,
  optimized,
}) {
  const EventComponent = optimized
    ? OptimizedPostChip
    : PostChip;

  return (
    <Profiler
      id="Event"
      onRender={updateRenderStats}
    >
      <EventComponent
        post={post}
        onDragStart={onDragStart}
        onClick={onClick}
      />
    </Profiler>
  );
}

/* =========================================================
   MONTH CALENDAR
========================================================= */

function StandardMonthCalendar({
  currentDate,
  posts,
  postsForDay,
  onDrop,
  onDragOver,
  onDragStart,
  onClick,
}) {
  const days = getMonthDays(currentDate);

  return (
    <div className="month-grid">
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
        (day) => (
          <div className="week-head" key={day}>
            {day}
          </div>
        )
      )}

      {days.map((day) => {
        const key = dateKey(day);
        const dayPosts = postsForDay(key);

        return (
          <div
            className={`day-cell ${
              day.getMonth() !== currentDate.getMonth()
                ? "outside"
                : ""
            }`}
            key={key}
            onDragOver={onDragOver}
            onDrop={() => onDrop(key)}
          >
            <div className="day-number">{day.getDate()}</div>

            <div className="event-list">
              {dayPosts.map((post) => (
                <Event
                  key={post.id}
                  post={post}
                  onDragStart={onDragStart}
                  onClick={onClick}
                  optimized={false}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   OPTIMIZED MONTH CALENDAR
========================================================= */

const OptimizedMonthCalendar = memo(
  function OptimizedMonthCalendar({
    currentDate,
    postsForDay,
    onDrop,
    onDragOver,
    onDragStart,
    onClick,
  }) {
    const days = useMemo(
      () => getMonthDays(currentDate),
      [currentDate]
    );

    return (
      <div className="month-grid">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
          (day) => (
            <div className="week-head" key={day}>
              {day}
            </div>
          )
        )}

        {days.map((day) => {
          const key = dateKey(day);
          const dayPosts = postsForDay(key);

          return (
            <div
              className={`day-cell ${
                day.getMonth() !== currentDate.getMonth()
                  ? "outside"
                  : ""
              }`}
              key={key}
              onDragOver={onDragOver}
              onDrop={() => onDrop(key)}
            >
              <div className="day-number">{day.getDate()}</div>

              <div className="event-list">
                {dayPosts.map((post) => (
                  <Event
                    key={post.id}
                    post={post}
                    onDragStart={onDragStart}
                    onClick={onClick}
                    optimized
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);

/* =========================================================
   WEEK CALENDAR
========================================================= */

function DayColumn({
  date,
  posts,
  onDrop,
  onDragOver,
  onDragStart,
  onClick,
  optimized,
}) {
  return (
    <div
      className="day-column"
      onDragOver={onDragOver}
      onDrop={() => onDrop(dateKey(date))}
    >
      <div className="column-date">
        <strong>{date.getDate()}</strong>
        <span>
          {date.toLocaleDateString("en-US", {
            weekday: "short",
          })}
        </span>
      </div>

      <div className="column-events">
        {posts.map((post) => (
          <Event
            key={post.id}
            post={post}
            onDragStart={onDragStart}
            onClick={onClick}
            optimized={optimized}
          />
        ))}
      </div>
    </div>
  );
}

const OptimizedDayColumn = memo(DayColumn);

function StandardWeekCalendar({
  currentDate,
  postsForDay,
  onDrop,
  onDragOver,
  onDragStart,
  onClick,
}) {
  const start = startOfWeek(currentDate);

  return (
    <div className="week-view">
      <div className="days-grid">
        {Array.from({ length: 7 }, (_, index) => {
          const date = addDays(start, index);

          return (
            <DayColumn
              key={dateKey(date)}
              date={date}
              posts={postsForDay(dateKey(date))}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragStart={onDragStart}
              onClick={onClick}
              optimized={false}
            />
          );
        })}
      </div>
    </div>
  );
}

const OptimizedWeekCalendar = memo(
  function OptimizedWeekCalendar({
    currentDate,
    postsForDay,
    onDrop,
    onDragOver,
    onDragStart,
    onClick,
  }) {
    const start = useMemo(
      () => startOfWeek(currentDate),
      [currentDate]
    );

    return (
      <div className="week-view">
        <div className="days-grid">
          {Array.from({ length: 7 }, (_, index) => {
            const date = addDays(start, index);

            return (
              <OptimizedDayColumn
                key={dateKey(date)}
                date={date}
                posts={postsForDay(dateKey(date))}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragStart={onDragStart}
                onClick={onClick}
                optimized
              />
            );
          })}
        </div>
      </div>
    );
  }
);

/* =========================================================
   DAY CALENDAR
========================================================= */

function DayCalendar({
  currentDate,
  postsForDay,
  onDrop,
  onDragOver,
  onDragStart,
  onClick,
  optimized,
}) {
  const key = dateKey(currentDate);
  const posts = postsForDay(key);

  return (
    <div
      className="day-view"
      onDragOver={onDragOver}
      onDrop={() => onDrop(key)}
    >
      <div className="day-view-header">
        <h3>{formatShortDate(currentDate)}</h3>
        <span>{posts.length} scheduled post(s)</span>
      </div>

      <div className="day-timeline">
        {posts.length === 0 ? (
          <div className="timeline-row">
            <span className="muted">No posts scheduled.</span>
          </div>
        ) : (
          posts.map((post) => (
            <div className="timeline-row" key={post.id}>
              <span>{post.time}</span>

              <Event
                post={post}
                onDragStart={onDragStart}
                onClick={onClick}
                optimized={optimized}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const OptimizedDayCalendar = memo(DayCalendar);

/* =========================================================
   CALENDAR VIEW
========================================================= */

function StandardCalendar({
  currentDate,
  view,
  postsForDay,
  onDrop,
  onDragOver,
  onDragStart,
  onClick,
}) {
  return (
    <Profiler id="Calendar" onRender={updateRenderStats}>
      {view === "Month" && (
        <StandardMonthCalendar
          currentDate={currentDate}
          postsForDay={postsForDay}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragStart={onDragStart}
          onClick={onClick}
        />
      )}

      {view === "Week" && (
        <StandardWeekCalendar
          currentDate={currentDate}
          postsForDay={postsForDay}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragStart={onDragStart}
          onClick={onClick}
        />
      )}

      {view === "Day" && (
        <DayCalendar
          currentDate={currentDate}
          postsForDay={postsForDay}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragStart={onDragStart}
          onClick={onClick}
          optimized={false}
        />
      )}
    </Profiler>
  );
}

const OptimizedCalendar = memo(
  function OptimizedCalendar({
    currentDate,
    view,
    postsForDay,
    onDrop,
    onDragOver,
    onDragStart,
    onClick,
  }) {
    return (
      <Profiler id="Calendar" onRender={updateRenderStats}>
        {view === "Month" && (
          <OptimizedMonthCalendar
            currentDate={currentDate}
            postsForDay={postsForDay}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragStart={onDragStart}
            onClick={onClick}
          />
        )}

        {view === "Week" && (
          <OptimizedWeekCalendar
            currentDate={currentDate}
            postsForDay={postsForDay}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragStart={onDragStart}
            onClick={onClick}
          />
        )}

        {view === "Day" && (
          <OptimizedDayCalendar
            currentDate={currentDate}
            postsForDay={postsForDay}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragStart={onDragStart}
            onClick={onClick}
            optimized
          />
        )}
      </Profiler>
    );
  }
);

/* =========================================================
   MAIN APP
========================================================= */

export default function App() {
  const [posts, setPosts] = useState(initialPosts);

  const [currentDate, setCurrentDate] = useState(
    new Date(2026, 8, 1)
  );

  const [view, setView] = useState("Month");

  const [optimized, setOptimized] = useState(true);

  const [darkMode, setDarkMode] = useState(false);

  const [draggedPostId, setDraggedPostId] = useState(null);

  const [dragCount, setDragCount] = useState(0);

  const [selectedPost, setSelectedPost] = useState(null);

  const [showNewPost, setShowNewPost] = useState(false);

  const [newPost, setNewPost] = useState({
    title: "",
    date: "2026-09-15",
    time: "10:00 am",
    platform: "Instagram",
  });

  /* =====================================================
     MEMOIZED DATA
  ===================================================== */

  const schedulePerformance = useMemo(
    () => calculateSchedulePerformance(posts),
    [posts]
  );

  const upcomingPosts = useMemo(() => {
    return [...posts]
      .sort(
        (a, b) =>
          parseDate(a.date) - parseDate(b.date)
      )
      .slice(0, 5);
  }, [posts]);

  /* =====================================================
     CALLBACKS
  ===================================================== */

  const postsForDay = useCallback(
    (date) => {
      return posts.filter((post) => post.date === date);
    },
    [posts]
  );

  const handleDragStart = useCallback((id) => {
    setDraggedPostId(id);
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (date) => {
      if (!draggedPostId) return;

      setPosts((previousPosts) =>
        previousPosts.map((post) =>
          post.id === draggedPostId
            ? {
                ...post,
                date,
                status: "Scheduled",
              }
            : post
        )
      );

      setDragCount((count) => count + 1);
      setDraggedPostId(null);
    },
    [draggedPostId]
  );

  const openPost = useCallback((post) => {
    setSelectedPost(post);
  }, []);

  /* =====================================================
     NAVIGATION
  ===================================================== */

  const goPrevious = () => {
    setCurrentDate((date) => {
      const next = new Date(date);

      if (view === "Month") {
        next.setMonth(next.getMonth() - 1);
      } else if (view === "Week") {
        next.setDate(next.getDate() - 7);
      } else {
        next.setDate(next.getDate() - 1);
      }

      return next;
    });
  };

  const goNext = () => {
    setCurrentDate((date) => {
      const next = new Date(date);

      if (view === "Month") {
        next.setMonth(next.getMonth() + 1);
      } else if (view === "Week") {
        next.setDate(next.getDate() + 7);
      } else {
        next.setDate(next.getDate() + 1);
      }

      return next;
    });
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  /* =====================================================
     OPTIMIZE CALENDAR
  ===================================================== */

  const optimizeCalendar = () => {
    const optimizedDates = [
      "2026-09-09",
      "2026-09-11",
      "2026-09-15",
      "2026-09-17",
      "2026-09-21",
    ];

    const optimizedTimes = [
      "10:00 am",
      "10:00 am",
      "11:00 am",
      "09:00 am",
      "10:00 am",
    ];

    setPosts((previousPosts) =>
      previousPosts.map((post, index) => ({
        ...post,
        date:
          optimizedDates[index % optimizedDates.length],
        time:
          optimizedTimes[index % optimizedTimes.length],
        status: "Scheduled",
      }))
    );
  };

  /* =====================================================
     NEW POST
  ===================================================== */

  const createPost = (event) => {
    event.preventDefault();

    if (!newPost.title.trim()) return;

    const colors = [
      "#ef4444",
      "#ec4899",
      "#3b82f6",
      "#f97316",
      "#8b5cf6",
    ];

    const post = {
      id: Date.now(),
      title: newPost.title,
      date: newPost.date,
      time: newPost.time,
      platform: newPost.platform,
      status: "Scheduled",
      color: colors[posts.length % colors.length],
    };

    setPosts((previousPosts) => [
      ...previousPosts,
      post,
    ]);

    setNewPost({
      title: "",
      date: "2026-09-15",
      time: "10:00 am",
      platform: "Instagram",
    });

    setShowNewPost(false);
  };

  /* =====================================================
     CALENDAR COMPONENT
  ===================================================== */

  const CalendarComponent = optimized
    ? OptimizedCalendar
    : StandardCalendar;

  return (
    <div className={darkMode ? "app-shell dark" : "app-shell"}>
      {/* =================================================
          TOP BAR
      ================================================= */}

      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">S</div>

          <div>
            <strong>Social Scheduler</strong>
            <span>Interactive Calendar Optimization</span>
          </div>
        </div>

        <div className="top-actions">
          <span className="hint">
            {optimized
              ? "Memoized rendering enabled"
              : "Standard rendering enabled"}
          </span>

          <button
            className="theme-button"
            onClick={() => setDarkMode((value) => !value)}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </header>

      <main className="page">
        {/* =================================================
            RENDER STATS
        ================================================= */}

        <Profiler
          id="CalendarView"
          onRender={updateRenderStats}
        >
          <RenderStatsPanel
            optimized={optimized}
            dragCount={dragCount}
          />
        </Profiler>

        {/* =================================================
            WORKSPACE
        ================================================= */}

        <div className="workspace">
          <section className="calendar-card">
            {/* TOOLBAR */}

            <div className="calendar-toolbar">
              <div className="toolbar-left">
                <button
                  className="today-btn"
                  onClick={goToday}
                >
                  Today
                </button>

                <button
                  className="icon-btn"
                  onClick={goPrevious}
                  title="Previous"
                >
                  ‹
                </button>

                <button
                  className="icon-btn"
                  onClick={goNext}
                  title="Next"
                >
                  ›
                </button>

                <h1 className="calendar-title">
                  {view === "Month"
                    ? formatDate(currentDate)
                    : formatShortDate(currentDate)}
                </h1>
              </div>

              <div className="toolbar-right">
                <div className="view-switch">
                  {["Month", "Week", "Day"].map(
                    (option) => (
                      <button
                        key={option}
                        className={
                          view === option
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          setView(option)
                        }
                      >
                        {option}
                      </button>
                    )
                  )}
                </div>

                <button
                  className="new-post"
                  onClick={() =>
                    setShowNewPost(true)
                  }
                >
                  + New Post
                </button>

                <button
                  className="optimize-btn"
                  onClick={optimizeCalendar}
                >
                  ✨ Optimize Calendar
                </button>
              </div>
            </div>

            {/* MODE TOGGLE */}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <button
                className={
                  !optimized
                    ? "today-btn active"
                    : "today-btn"
                }
                onClick={() =>
                  setOptimized(false)
                }
              >
                Standard
              </button>

              <button
                className={
                  optimized
                    ? "today-btn active"
                    : "today-btn"
                }
                onClick={() =>
                  setOptimized(true)
                }
              >
                Optimized
              </button>
            </div>

            {/* CALENDAR */}

            <CalendarComponent
              currentDate={currentDate}
              view={view}
              postsForDay={postsForDay}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragStart={handleDragStart}
              onClick={openPost}
            />
          </section>

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="sidebar">
            {/* SCHEDULE PERFORMANCE */}

            <section className="side-card preference-card">
              <div className="side-title">
                <span>Schedule Performance</span>
                <strong>
                  {schedulePerformance.overall}%
                </strong>
              </div>

              <div className="orange-progress">
                <span
                  style={{
                    width: `${schedulePerformance.overall}%`,
                  }}
                />
              </div>

              <div className="best-window">
                <span>Best posting window</span>
                <strong>
                  9:00 AM – 11:00 AM
                </strong>
              </div>

              <div className="range">
                <div className="range-track">
                  <span
                    style={{
                      width: `${schedulePerformance.timeWindow}%`,
                    }}
                  />
                </div>
              </div>

              <div className="best-result">
                <div>
                  <span>Time preference</span>
                  <strong>
                    {schedulePerformance.preferredTime}%
                  </strong>
                </div>

                <div>
                  <span>Day quality</span>
                  <strong>
                    {schedulePerformance.dayQuality}%
                  </strong>
                </div>

                <div>
                  <span>Spacing</span>
                  <strong>
                    {schedulePerformance.spacing}%
                  </strong>
                </div>
              </div>
            </section>

            {/* UPCOMING POSTS */}

            <section className="side-card upcoming-card">
              <div className="side-title">
                <span>Upcoming Posts</span>

                <span className="count-pill">
                  {posts.length}
                </span>
              </div>

              <div className="upcoming-list">
                {upcomingPosts.map((post) => (
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
                      <strong>{post.title}</strong>
                      <small>
                        {formatShortDate(
                          parseDate(post.date)
                        )}{" "}
                        · {post.time}
                      </small>
                    </span>
                  </button>
                ))}
              </div>

              <div className="mini-stats">
                <div>
                  <strong>
                    {
                      posts.filter(
                        (post) =>
                          post.status ===
                          "Scheduled"
                      ).length
                    }
                  </strong>
                  <span>Scheduled</span>
                </div>

                <div>
                  <strong>
                    {
                      posts.filter(
                        (post) =>
                          post.status ===
                          "Draft"
                      ).length
                    }
                  </strong>
                  <span>Drafts</span>
                </div>

                <div>
                  <strong>{dragCount}</strong>
                  <span>Moves</span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>

      {/* =================================================
          POST DETAILS MODAL
      ================================================= */}

      {selectedPost && (
        <Profiler
          id="PostModal"
          onRender={updateRenderStats}
        >
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
                  <span className="eyebrow">
                    POST DETAILS
                  </span>

                  <h2>{selectedPost.title}</h2>
                </div>

                <button
                  className="icon-btn"
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
                  {formatShortDate(
                    parseDate(selectedPost.date)
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

              <div className="detail-row full">
                <span>Schedule score</span>
                <strong>
                  {Math.round(
                    (getTimeScore(
                      selectedPost.time
                    ) +
                      getDayQuality(
                        selectedPost.date
                      )) /
                      2
                  )}
                  %
                </strong>
              </div>
            </div>
          </div>
        </Profiler>
      )}

      {/* =================================================
          NEW POST MODAL
      ================================================= */}

      {showNewPost && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setShowNewPost(false)
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
                <span className="eyebrow">
                  CREATE
                </span>

                <h2>New Post</h2>
              </div>

              <button
                className="icon-btn"
                onClick={() =>
                  setShowNewPost(false)
                }
              >
                ×
              </button>
            </div>

            <form onSubmit={createPost}>
              <div className="detail-row full">
                <label>Post title</label>

                <input
                  value={newPost.title}
                  onChange={(event) =>
                    setNewPost({
                      ...newPost,
                      title:
                        event.target.value,
                    })
                  }
                  placeholder="Enter post title"
                  required
                />
              </div>

              <div className="form-two">
                <div className="detail-row full">
                  <label>Date</label>

                  <input
                    type="date"
                    value={newPost.date}
                    onChange={(event) =>
                      setNewPost({
                        ...newPost,
                        date:
                          event.target.value,
                      })
                    }
                  />
                </div>

                <div className="detail-row full">
                  <label>Time</label>

                  <input
                    value={newPost.time}
                    onChange={(event) =>
                      setNewPost({
                        ...newPost,
                        time:
                          event.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="detail-row full">
                <label>Platform</label>

                <select
                  value={newPost.platform}
                  onChange={(event) =>
                    setNewPost({
                      ...newPost,
                      platform:
                        event.target.value,
                    })
                  }
                >
                  <option>Instagram</option>
                  <option>LinkedIn</option>
                  <option>Facebook</option>
                  <option>Twitter</option>
                </select>
              </div>

              <button
                className="new-post"
                type="submit"
              >
                Create Post
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
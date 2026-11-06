import React, {
  useEffect,
  useState
} from "react";

import {
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate
} from "react-router-dom";

import {
  useDispatch,
  useSelector
} from "react-redux";

import {
  login,
  register,
  logout,
  updateProfile,
  changePassword,
  loadMe
} from "./features/authSlice";

import {
  fetchContent,
  saveContent
} from "./features/contentSlice";

import {
  apiRequest
} from "./api";

/* =========================
   PROTECTED ROUTE
========================= */

function PrivateRoute({
  children,
  roles
}) {

  const { user } =
    useSelector(
      state => state.auth
    );

  if (!user) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    roles &&
    !roles.includes(
      user.role
    )
  ) {

    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}

/* =========================
   LOGIN
========================= */

function Login() {

  const dispatch =
    useDispatch();

  const navigate =
    useNavigate();

  const {
    user,
    loading,
    error
  } =
    useSelector(
      state => state.auth
    );

  const [
    username,
    setUsername
  ] =
    useState("admin");

  const [
    password,
    setPassword
  ] =
    useState("1234");

  const [
    showPassword,
    setShowPassword
  ] =
    useState(false);

  const [
    localError,
    setLocalError
  ] =
    useState("");

  useEffect(() => {

    if (user) {

      navigate(
        "/dashboard"
      );
    }

  }, [
    user,
    navigate
  ]);

  async function handleLogin(e) {

    e.preventDefault();

    setLocalError("");

    if (
      !username.trim() ||
      !password.trim()
    ) {

      setLocalError(
        "Username and password are required."
      );

      return;
    }

    const result =
      await dispatch(
        login({
          username:
            username.trim(),

          password
        })
      );

    if (
      login.fulfilled.match(
        result
      )
    ) {

      navigate(
        "/dashboard"
      );
    }
  }

  return (

    <div className="auth-page">

      <div className="auth-box">

        <div className="tabs">

          <Link
            className="active"
            to="/login"
          >
            Sign in
          </Link>

          <Link
            to="/register"
          >
            Create account
          </Link>

        </div>

        <div className="welcome">
          WELCOME BACK
        </div>

        <h1>
          Sign in to your account
        </h1>

        <form
          onSubmit={
            handleLogin
          }
        >

          <label>
            Username
          </label>

          <input
            type="text"
            value={username}
            onChange={
              e =>
                setUsername(
                  e.target.value
                )
            }
            placeholder="Enter username"
            autoComplete="username"
          />

          <label>
            Password
          </label>

          <div className="password-box">

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={password}
              onChange={
                e =>
                  setPassword(
                    e.target.value
                  )
              }
              placeholder="Enter password"
              autoComplete="current-password"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
            >
              {
                showPassword
                  ? "Hide"
                  : "Show"
              }
            </button>

          </div>

          <div className="login-options">

            <label className="remember">

              <input
                type="checkbox"
                defaultChecked
              />

              Remember me

            </label>

          </div>

          <button
            type="submit"
            className="primary-btn"
            disabled={loading}
          >

            {
              loading
                ? "Signing in..."
                : "Sign in"
            }

            <span>
              →
            </span>

          </button>

          {(localError ||
            error) && (

            <div className="error-box">

              {
                localError ||
                error
              }

            </div>
          )}

        </form>

        <div className="demo-box">

          <strong>
            Demo Accounts
          </strong>

          <p>
            Admin:
            <b> admin / 1234</b>
          </p>

          <p>
            Editor:
            <b> editor / 1234</b>
          </p>

          <p>
            Viewer:
            <b> viewer / 1234</b>
          </p>

          <p>
            Yash:
            <b> yash / 123456</b>
          </p>

        </div>

      </div>

    </div>
  );
}

/* =========================
   LAYOUT
========================= */

function Layout({
  children
}) {

  const { user } =
    useSelector(
      state => state.auth
    );

  const dispatch =
    useDispatch();

  const navigate =
    useNavigate();

  return (

    <div className="app-shell">

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            YG
          </div>

          <div>
            <strong>
              Yash Garg
            </strong>

            <small>
              Portal
            </small>
          </div>

        </div>

        <nav className="nav">

          <Link to="/dashboard">
            Dashboard
          </Link>

          <Link to="/website">
            Website
          </Link>

          <Link to="/profile">
            My Profile
          </Link>

          {user.role ===
            "admin" && (

            <Link to="/users">
              User Management
            </Link>
          )}

        </nav>

        <div className="sidebar-bottom">

          <div className="mini-user">

            <div className="avatar">

              {
                user.name
                  .charAt(0)
                  .toUpperCase()
              }

            </div>

            <div>

              <strong>
                {user.name}
              </strong>

              <small>
                {user.role}
              </small>

            </div>

          </div>

          <button
            className="logout-btn"
            onClick={() => {

              dispatch(
                logout()
              );

              navigate(
                "/login"
              );

            }}
          >
            Logout
          </button>

        </div>

      </aside>

      <main className="main">

        <header className="topbar">

          <div>

            <h1>
              Welcome, {user.name}
            </h1>

            <p>
              Manage your account and website.
            </p>

          </div>

          <span className="role-badge">
            {user.role}
          </span>

        </header>

        {children}

      </main>

    </div>
  );
}

/* =========================
   DASHBOARD
========================= */

function Dashboard() {

  const { user } =
    useSelector(
      state => state.auth
    );

  const {
    data
  } =
    useSelector(
      state => state.content
    );

  const dispatch =
    useDispatch();

  useEffect(() => {

    dispatch(
      fetchContent()
    );

  }, [dispatch]);

  return (

    <section>

      <div className="stats">

        <div className="stat-card">

          <span>
            Current Role
          </span>

          <strong>
            {user.role}
          </strong>

        </div>

        <div className="stat-card">

          <span>
            Username
          </span>

          <strong>
            {user.username}
          </strong>

        </div>

        <div className="stat-card">

          <span>
            Website
          </span>

          <strong>
            {
              data?.siteName ||
              "Loading..."
            }
          </strong>

        </div>

      </div>

      <div className="panel">

        <h2>
          Role Permissions
        </h2>

        <div className="permission-grid">

          <Permission
            name="View website"
            allowed={true}
          />

          <Permission
            name="Edit website"
            allowed={
              user.role ===
                "admin" ||
              user.role ===
                "editor"
            }
          />

          <Permission
            name="Manage users"
            allowed={
              user.role ===
              "admin"
            }
          />

          <Permission
            name="Edit profile"
            allowed={true}
          />

          <Permission
            name="Change password"
            allowed={true}
          />

        </div>

      </div>

    </section>
  );
}

function Permission({
  name,
  allowed
}) {

  return (

    <div className="permission">

      <span
        className={
          allowed
            ? "yes"
            : "no"
        }
      >
        {
          allowed
            ? "✓"
            : "×"
        }
      </span>

      {name}

    </div>
  );
}

/* =========================
   WEBSITE
========================= */

function Website() {

  const { user } =
    useSelector(
      state => state.auth
    );

  const {
    data,
    saving,
    error
  } =
    useSelector(
      state => state.content
    );

  const dispatch =
    useDispatch();

  const [
    form,
    setForm
  ] =
    useState(null);

  const canEdit =
    user.role === "admin" ||
    user.role === "editor";

  useEffect(() => {

    dispatch(
      fetchContent()
    );

  }, [dispatch]);

  useEffect(() => {

    if (data) {

      setForm(data);
    }

  }, [data]);

  if (!form) {

    return (
      <div className="panel">
        Loading website...
      </div>
    );
  }

  function update(
    field,
    value
  ) {

    setForm({
      ...form,
      [field]: value
    });
  }

  return (

    <section>

      <div className="section-heading">

        <div>

          <h2>
            Website
          </h2>

          <p>
            {
              canEdit
                ? "Admin/Editor can edit."
                : "Viewer mode."
            }
          </p>

        </div>

        {canEdit && (

          <button
            className="save-btn"
            disabled={saving}
            onClick={() =>
              dispatch(
                saveContent(form)
              )
            }
          >

            {
              saving
                ? "Saving..."
                : "Save changes"
            }

          </button>

        )}

      </div>

      {error && (

        <div className="error-box">
          {error}
        </div>

      )}

      <div className="website-preview">

        <span className="announcement">
          {form.announcement}
        </span>

        <h1>
          {form.heroTitle}
        </h1>

        <p>
          {form.heroText}
        </p>

        <div className="about-card">

          <h3>
            About
          </h3>

          <p>
            {form.about}
          </p>

        </div>

        <small>
          Last updated by{" "}
          <b>
            {form.lastUpdatedBy}
          </b>
        </small>

      </div>

      {canEdit && (

        <div className="panel">

          <h2>
            Edit Website
          </h2>

          <Field
            label="Site Name"
            value={form.siteName}
            onChange={
              v =>
                update(
                  "siteName",
                  v
                )
            }
          />

          <Field
            label="Hero Title"
            value={form.heroTitle}
            onChange={
              v =>
                update(
                  "heroTitle",
                  v
                )
            }
          />

          <Field
            label="Hero Text"
            textarea
            value={form.heroText}
            onChange={
              v =>
                update(
                  "heroText",
                  v
                )
            }
          />

          <Field
            label="Announcement"
            value={
              form.announcement
            }
            onChange={
              v =>
                update(
                  "announcement",
                  v
                )
            }
          />

          <Field
            label="About"
            textarea
            value={form.about}
            onChange={
              v =>
                update(
                  "about",
                  v
                )
            }
          />

        </div>
      )}

    </section>
  );
}

/* =========================
   PROFILE
========================= */

function Profile() {

  const { user } =
    useSelector(
      state => state.auth
    );

  const dispatch =
    useDispatch();

  const [
    name,
    setName
  ] =
    useState(user.name);

  const [
    email,
    setEmail
  ] =
    useState(user.email);

  const [
    currentPassword,
    setCurrentPassword
  ] =
    useState("");

  const [
    newPassword,
    setNewPassword
  ] =
    useState("");

  const [
    message,
    setMessage
  ] =
    useState("");

  async function saveProfile(e) {

    e.preventDefault();

    const result =
      await dispatch(
        updateProfile({
          name,
          email
        })
      );

    setMessage(
      result.error
        ? result.payload
        : "Profile updated successfully."
    );
  }

  async function savePassword(e) {

    e.preventDefault();

    const result =
      await dispatch(
        changePassword({
          currentPassword,
          newPassword
        })
      );

    if (result.error) {

      setMessage(
        result.payload
      );

    } else {

      setMessage(
        "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
    }
  }

  return (

    <section>

      <div className="profile-header">

        <div className="large-avatar">

          {
            user.name
              .charAt(0)
              .toUpperCase()
          }

        </div>

        <div>

          <h2>
            {user.name}
          </h2>

          <p>
            @{user.username}
            {" · "}
            {user.role}
          </p>

        </div>

      </div>

      {message && (

        <div className="success-box">
          {message}
        </div>

      )}

      <div className="two-column">

        <form
          className="panel"
          onSubmit={
            saveProfile
          }
        >

          <h2>
            Profile
          </h2>

          <Field
            label="Name"
            value={name}
            onChange={setName}
          />

          <Field
            label="Email"
            value={email}
            onChange={setEmail}
          />

          <button className="save-btn">
            Save Profile
          </button>

        </form>

        <form
          className="panel"
          onSubmit={
            savePassword
          }
        >

          <h2>
            Change Password
          </h2>

          <Field
            label="Current Password"
            password
            value={
              currentPassword
            }
            onChange={
              setCurrentPassword
            }
          />

          <Field
            label="New Password"
            password
            value={
              newPassword
            }
            onChange={
              setNewPassword
            }
          />

          <button className="save-btn">
            Change Password
          </button>

        </form>

      </div>

    </section>
  );
}

/* =========================
   FIELD
========================= */

function Field({
  label,
  value,
  onChange,
  textarea,
  password
}) {

  return (

    <div className="field">

      <label>
        {label}
      </label>

      {textarea ? (

        <textarea
          rows="4"
          value={value}
          onChange={
            e =>
              onChange(
                e.target.value
              )
          }
        />

      ) : (

        <input
          type={
            password
              ? "password"
              : "text"
          }
          value={value}
          onChange={
            e =>
              onChange(
                e.target.value
              )
          }
        />

      )}

    </div>
  );
}

/* =========================
   REGISTER
========================= */

function Register() {

  const dispatch =
    useDispatch();

  const navigate =
    useNavigate();

  const { user, error } =
    useSelector(
      state => state.auth
    );

  const [
    form,
    setForm
  ] =
    useState({
      name: "",
      email: "",
      username: "",
      password: ""
    });

  useEffect(() => {

    if (user) {

      navigate(
        "/dashboard"
      );
    }

  }, [user, navigate]);

  function submit(e) {

    e.preventDefault();

    dispatch(
      register(form)
    );
  }

  return (

    <div className="auth-page">

      <div className="auth-box">

        <div className="tabs">

          <Link to="/login">
            Sign in
          </Link>

          <Link
            className="active"
            to="/register"
          >
            Create account
          </Link>

        </div>

        <h1>
          Create your account
        </h1>

        <form
          onSubmit={submit}
        >

          <Field
            label="Name"
            value={form.name}
            onChange={
              v =>
                setForm({
                  ...form,
                  name: v
                })
            }
          />

          <Field
            label="Email"
            value={form.email}
            onChange={
              v =>
                setForm({
                  ...form,
                  email: v
                })
            }
          />

          <Field
            label="Username"
            value={
              form.username
            }
            onChange={
              v =>
                setForm({
                  ...form,
                  username: v
                })
            }
          />

          <Field
            label="Password"
            password
            value={
              form.password
            }
            onChange={
              v =>
                setForm({
                  ...form,
                  password: v
                })
            }
          />

          <button className="primary-btn">
            Create Account
            <span>→</span>
          </button>

          {error && (

            <div className="error-box">
              {error}
            </div>

          )}

        </form>

      </div>

    </div>
  );
}

/* =========================
   USERS
========================= */

function Users() {

  const [
    users,
    setUsers
  ] =
    useState([]);

  const [
    message,
    setMessage
  ] =
    useState("");

  async function loadUsers() {

    try {

      const data =
        await apiRequest(
          "/users"
        );

      setUsers(
        data.users
      );

    } catch (error) {

      setMessage(
        error.message
      );
    }
  }

  useEffect(() => {

    loadUsers();

  }, []);

  async function changeRole(
    id,
    role
  ) {

    try {

      await apiRequest(
        `/users/${id}/role`,
        {
          method: "PUT",

          body:
            JSON.stringify({
              role
            })
        }
      );

      setMessage(
        "Role updated successfully."
      );

      loadUsers();

    } catch (error) {

      setMessage(
        error.message
      );
    }
  }

  return (

    <section>

      <h2>
        User Management
      </h2>

      {message && (

        <div className="success-box">
          {message}
        </div>

      )}

      <div className="panel">

        <table>

          <thead>

            <tr>

              <th>
                Name
              </th>

              <th>
                Username
              </th>

              <th>
                Email
              </th>

              <th>
                Role
              </th>

            </tr>

          </thead>

          <tbody>

            {users.map(
              user => (

                <tr
                  key={user.id}
                >

                  <td>
                    {user.name}
                  </td>

                  <td>
                    {user.username}
                  </td>

                  <td>
                    {user.email}
                  </td>

                  <td>

                    <select
                      value={
                        user.role
                      }
                      onChange={
                        e =>
                          changeRole(
                            user.id,
                            e.target.value
                          )
                      }
                    >

                      <option value="admin">
                        Admin
                      </option>

                      <option value="editor">
                        Editor
                      </option>

                      <option value="viewer">
                        Viewer
                      </option>

                    </select>

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

    </section>
  );
}

/* =========================
   APP
========================= */

function App() {

  const dispatch =
    useDispatch();

  const { token } =
    useSelector(
      state => state.auth
    );

  useEffect(() => {

    if (token) {

      dispatch(
        loadMe()
      );
    }

  }, [
    token,
    dispatch
  ]);

  return (

    <Routes>

      <Route
        path="/login"
        element={
          <Login />
        }
      />

      <Route
        path="/register"
        element={
          <Register />
        }
      />

      <Route
        path="/dashboard"
        element={

          <PrivateRoute>

            <Layout>
              <Dashboard />
            </Layout>

          </PrivateRoute>

        }
      />

      <Route
        path="/website"
        element={

          <PrivateRoute>

            <Layout>
              <Website />
            </Layout>

          </PrivateRoute>

        }
      />

      <Route
        path="/profile"
        element={

          <PrivateRoute>

            <Layout>
              <Profile />
            </Layout>

          </PrivateRoute>

        }
      />

      <Route
        path="/users"
        element={

          <PrivateRoute
            roles={["admin"]}
          >

            <Layout>
              <Users />
            </Layout>

          </PrivateRoute>

        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;
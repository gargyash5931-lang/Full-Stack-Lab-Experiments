const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = 5000;
const JWT_SECRET = "YASH_GARG_SECRET_2026";

app.use(cors());
app.use(express.json());

/* ==============================
   JSON DATABASE
============================== */

const dataFolder = path.join(__dirname, "data");

const usersFile = path.join(
  dataFolder,
  "users.json"
);

const contentFile = path.join(
  dataFolder,
  "content.json"
);

if (!fs.existsSync(dataFolder)) {
  fs.mkdirSync(dataFolder, {
    recursive: true
  });
}

/* ==============================
   USERS
============================== */

const defaultUsers = [
  {
    id: "1",
    username: "admin",
    name: "Administrator",
    email: "admin@example.com",
    role: "admin",
    passwordHash: bcrypt.hashSync("1234", 10)
  },
  {
    id: "2",
    username: "editor",
    name: "Website Editor",
    email: "editor@example.com",
    role: "editor",
    passwordHash: bcrypt.hashSync("1234", 10)
  },
  {
    id: "3",
    username: "viewer",
    name: "Website Viewer",
    email: "viewer@example.com",
    role: "viewer",
    passwordHash: bcrypt.hashSync("1234", 10)
  },
  {
    id: "4",
    username: "yash",
    name: "Yash Garg",
    email: "gargyash5931@gmail.com",
    role: "admin",
    passwordHash: bcrypt.hashSync("123456", 10)
  }
];

/* ==============================
   WEBSITE CONTENT
============================== */

const defaultContent = {
  siteName: "Yash Garg Portal",

  heroTitle: "Welcome to the Website",

  heroText:
    "This website uses JWT Authentication and Role Based Access Control.",

  announcement:
    "Welcome back! Your website is running successfully.",

  about:
    "Admin and Editor users can edit this website.",

  lastUpdatedBy: "system",

  lastUpdatedAt: new Date().toISOString()
};

/* ==============================
   FILE HELPERS
============================== */

function writeJSON(file, data) {
  fs.writeFileSync(
    file,
    JSON.stringify(data, null, 2),
    "utf8"
  );
}

function readJSON(file) {
  return JSON.parse(
    fs.readFileSync(file, "utf8")
  );
}

/* ==============================
   AUTOMATIC JSON CREATION
============================== */

function initializeDatabase() {

  let users = null;

  if (fs.existsSync(usersFile)) {
    try {
      users = readJSON(usersFile);
    } catch {
      users = null;
    }
  }

  /*
    If old/broken users.json exists,
    replace it automatically.
  */

  const validUsers =
    Array.isArray(users) &&
    users.some(
      user => user.username === "admin"
    ) &&
    users.some(
      user => user.username === "yash"
    ) &&
    users.every(
      user => user.passwordHash
    );

  if (!validUsers) {

    writeJSON(
      usersFile,
      defaultUsers
    );

    console.log(
      "users.json created/reset"
    );
  }

  if (!fs.existsSync(contentFile)) {

    writeJSON(
      contentFile,
      defaultContent
    );

    console.log(
      "content.json created"
    );
  }
}

initializeDatabase();

/* ==============================
   PUBLIC USER
============================== */

function publicUser(user) {

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

/* ==============================
   JWT
============================== */

function createToken(user) {

  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    {
      expiresIn: "2h"
    }
  );
}

/* ==============================
   AUTH MIDDLEWARE
============================== */

function authenticate(
  req,
  res,
  next
) {

  const auth =
    req.headers.authorization;

  if (
    !auth ||
    !auth.startsWith("Bearer ")
  ) {

    return res.status(401).json({
      message:
        "Please login first."
    });
  }

  const token =
    auth.substring(7);

  try {

    req.user =
      jwt.verify(
        token,
        JWT_SECRET
      );

    next();

  } catch {

    return res.status(401).json({
      message:
        "Invalid or expired token."
    });
  }
}

/* ==============================
   ROLE MIDDLEWARE
============================== */

function authorize(...roles) {

  return (
    req,
    res,
    next
  ) => {

    if (
      !roles.includes(
        req.user.role
      )
    ) {

      return res.status(403).json({
        message:
          "You do not have permission."
      });
    }

    next();
  };
}

/* ==============================
   HEALTH
============================== */

app.get(
  "/api/health",
  (req, res) => {

    res.json({
      success: true,
      message:
        "JWT backend is working"
    });

  }
);

/* ==============================
   LOGIN
============================== */

app.post(
  "/api/auth/login",
  (req, res) => {

    console.log(
      "LOGIN REQUEST:",
      req.body
    );

    const username =
      String(
        req.body.username || ""
      ).trim();

    const password =
      String(
        req.body.password || ""
      );

    /*
      IMPORTANT:
      LOGIN USES USERNAME,
      NOT EMAIL.
    */

    if (
      !username ||
      !password
    ) {

      return res.status(400).json({
        message:
          "Username and password are required."
      });
    }

    const users =
      readJSON(usersFile);

    const user =
      users.find(
        item =>
          item.username.toLowerCase() ===
          username.toLowerCase()
      );

    if (!user) {

      return res.status(401).json({
        message:
          "Invalid username or password."
      });
    }

    const validPassword =
      bcrypt.compareSync(
        password,
        user.passwordHash
      );

    if (!validPassword) {

      return res.status(401).json({
        message:
          "Invalid username or password."
      });
    }

    const token =
      createToken(user);

    console.log(
      "LOGIN SUCCESS:",
      user.username,
      user.role
    );

    res.json({
      success: true,
      token: token,
      user: publicUser(user)
    });
  }
);

/* ==============================
   REGISTER
============================== */

app.post(
  "/api/auth/register",
  (req, res) => {

    const {
      name,
      email,
      username,
      password
    } = req.body;

    if (
      !name ||
      !email ||
      !username ||
      !password
    ) {

      return res.status(400).json({
        message:
          "All fields are required."
      });
    }

    const users =
      readJSON(usersFile);

    const exists =
      users.some(
        user =>
          user.username.toLowerCase() ===
          username.toLowerCase()
      );

    if (exists) {

      return res.status(409).json({
        message:
          "Username already exists."
      });
    }

    const newUser = {

      id:
        Date.now().toString(),

      username:
        username.trim(),

      name:
        name.trim(),

      email:
        email.trim(),

      role:
        "viewer",

      passwordHash:
        bcrypt.hashSync(
          password,
          10
        )
    };

    users.push(newUser);

    writeJSON(
      usersFile,
      users
    );

    const token =
      createToken(newUser);

    res.status(201).json({
      success: true,
      token,
      user:
        publicUser(newUser)
    });
  }
);

/* ==============================
   CURRENT USER
============================== */

app.get(
  "/api/auth/me",
  authenticate,
  (req, res) => {

    const users =
      readJSON(usersFile);

    const user =
      users.find(
        item =>
          item.id === req.user.id
      );

    if (!user) {

      return res.status(404).json({
        message:
          "User not found."
      });
    }

    res.json({
      user:
        publicUser(user)
    });
  }
);

/* ==============================
   UPDATE PROFILE
============================== */

app.put(
  "/api/auth/profile",
  authenticate,
  (req, res) => {

    const users =
      readJSON(usersFile);

    const index =
      users.findIndex(
        user =>
          user.id === req.user.id
      );

    if (index === -1) {

      return res.status(404).json({
        message:
          "User not found."
      });
    }

    if (req.body.name) {
      users[index].name =
        req.body.name.trim();
    }

    if (req.body.email) {
      users[index].email =
        req.body.email.trim();
    }

    writeJSON(
      usersFile,
      users
    );

    res.json({
      success: true,
      message:
        "Profile updated successfully.",
      user:
        publicUser(users[index])
    });
  }
);

/* ==============================
   CHANGE PASSWORD
============================== */

app.put(
  "/api/auth/password",
  authenticate,
  (req, res) => {

    const {
      currentPassword,
      newPassword
    } = req.body;

    if (
      !currentPassword ||
      !newPassword
    ) {

      return res.status(400).json({
        message:
          "Both passwords are required."
      });
    }

    const users =
      readJSON(usersFile);

    const index =
      users.findIndex(
        user =>
          user.id === req.user.id
      );

    if (index === -1) {

      return res.status(404).json({
        message:
          "User not found."
      });
    }

    const correct =
      bcrypt.compareSync(
        currentPassword,
        users[index].passwordHash
      );

    if (!correct) {

      return res.status(400).json({
        message:
          "Current password is incorrect."
      });
    }

    users[index].passwordHash =
      bcrypt.hashSync(
        newPassword,
        10
      );

    writeJSON(
      usersFile,
      users
    );

    res.json({
      success: true,
      message:
        "Password changed successfully."
    });
  }
);

/* ==============================
   WEBSITE CONTENT
============================== */

app.get(
  "/api/content",
  (req, res) => {

    res.json(
      readJSON(contentFile)
    );
  }
);

/* ==============================
   EDIT WEBSITE
   ADMIN + EDITOR
============================== */

app.put(
  "/api/content",
  authenticate,
  authorize(
    "admin",
    "editor"
  ),
  (req, res) => {

    const content =
      readJSON(contentFile);

    const fields = [
      "siteName",
      "heroTitle",
      "heroText",
      "announcement",
      "about"
    ];

    fields.forEach(
      field => {

        if (
          req.body[field] !==
          undefined
        ) {

          content[field] =
            String(
              req.body[field]
            );
        }
      }
    );

    content.lastUpdatedBy =
      req.user.username;

    content.lastUpdatedAt =
      new Date().toISOString();

    writeJSON(
      contentFile,
      content
    );

    res.json({
      success: true,
      message:
        "Website updated successfully.",
      content
    });
  }
);

/* ==============================
   ADMIN USERS
============================== */

app.get(
  "/api/users",
  authenticate,
  authorize("admin"),
  (req, res) => {

    const users =
      readJSON(usersFile);

    res.json({
      users:
        users.map(publicUser)
    });
  }
);

/* ==============================
   CHANGE ROLE
============================== */

app.put(
  "/api/users/:id/role",
  authenticate,
  authorize("admin"),
  (req, res) => {

    const {
      role
    } = req.body;

    if (
      ![
        "admin",
        "editor",
        "viewer"
      ].includes(role)
    ) {

      return res.status(400).json({
        message:
          "Invalid role."
      });
    }

    const users =
      readJSON(usersFile);

    const index =
      users.findIndex(
        user =>
          user.id ===
          req.params.id
      );

    if (index === -1) {

      return res.status(404).json({
        message:
          "User not found."
      });
    }

    users[index].role =
      role;

    writeJSON(
      usersFile,
      users
    );

    res.json({
      success: true,
      message:
        "Role updated successfully.",
      user:
        publicUser(users[index])
    });
  }
);

/* ==============================
   DELETE USER
============================== */

app.delete(
  "/api/users/:id",
  authenticate,
  authorize("admin"),
  (req, res) => {

    if (
      req.params.id ===
      req.user.id
    ) {

      return res.status(400).json({
        message:
          "You cannot delete yourself."
      });
    }

    const users =
      readJSON(usersFile);

    const newUsers =
      users.filter(
        user =>
          user.id !==
          req.params.id
      );

    writeJSON(
      usersFile,
      newUsers
    );

    res.json({
      success: true,
      message:
        "User deleted successfully."
    });
  }
);

/* ==============================
   START
============================== */

app.listen(
  PORT,
  () => {

    console.log("");
    console.log(
      "================================="
    );
    console.log(
      " JWT + RBAC SERVER RUNNING"
    );
    console.log(
      " http://localhost:5000"
    );
    console.log(
      "================================="
    );
    console.log(
      "admin  / 1234"
    );
    console.log(
      "editor / 1234"
    );
    console.log(
      "viewer / 1234"
    );
    console.log(
      "yash   / 123456"
    );
    console.log(
      "================================="
    );
    console.log("");
  }
);
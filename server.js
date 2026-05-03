"use strict";
const express  = require("express");
const Database = require("better-sqlite3");
const bcrypt   = require("bcryptjs");
const cors     = require("cors");
const path     = require("path");
const crypto   = require("crypto");

const app = express();
const db  = new Database(path.join(__dirname, "game.db"));

// ── Schema ────────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    username     TEXT    UNIQUE NOT NULL,
    password_hash TEXT   NOT NULL,
    created_at   TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS characters (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER UNIQUE NOT NULL,
    name            TEXT NOT NULL,
    class_name      TEXT NOT NULL,
    class_icon      TEXT NOT NULL DEFAULT '⚔️',
    level           INTEGER DEFAULT 1,
    xp              INTEGER DEFAULT 0,
    floor           INTEGER DEFAULT 1,
    hp              INTEGER DEFAULT 120,
    mp              INTEGER DEFAULT 60,
    col             INTEGER DEFAULT 0,
    gems            INTEGER DEFAULT 0,
    inventory_json  TEXT DEFAULT '{}',
    equipment_json  TEXT DEFAULT '{}',
    quests_json     TEXT DEFAULT '[]',
    pvp_wins        INTEGER DEFAULT 0,
    pvp_losses      INTEGER DEFAULT 0,
    trophies_json   TEXT DEFAULT '[]',
    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS pvp_battles (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    attacker_id INTEGER NOT NULL,
    defender_id INTEGER NOT NULL,
    winner_id   INTEGER NOT NULL,
    created_at  TEXT DEFAULT (datetime('now'))
  );
`);

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
// Serve only the specific front-end files needed by the browser
const staticRateLimit = makeRateLimit("api", 60);
app.get("/",         staticRateLimit, (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/game.js",  staticRateLimit, (req, res) => res.sendFile(path.join(__dirname, "game.js")));
app.get("/style.css",staticRateLimit, (req, res) => res.sendFile(path.join(__dirname, "style.css")));

// ── HMAC-signed token auth ─────────────────────────────────────────────────────
const TOKEN_SECRET = process.env.TOKEN_SECRET || crypto.randomBytes(32).toString("hex");

function makeToken(userId, username) {
  const payload = Buffer.from(`${userId}:${username}:${Date.now()}`).toString("base64url");
  const sig = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function verifyToken(token) {
  if (typeof token !== "string") return null;
  const dotIdx = token.lastIndexOf(".");
  if (dotIdx < 1) return null;
  const payload = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);
  let expected;
  try {
    expected = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("base64url");
  } catch {
    return null;
  }
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const decoded = Buffer.from(payload, "base64url").toString("utf8");
  const [userId, username] = decoded.split(":");
  if (!userId || !username) return null;
  return { userId: Number(userId), username };
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Необходима авторизация" });
  }
  const info = verifyToken(auth.slice(7));
  if (!info) return res.status(401).json({ error: "Недействительный токен" });
  const user = db.prepare("SELECT id, username FROM users WHERE id = ? AND username = ?").get(info.userId, info.username);
  if (!user) return res.status(401).json({ error: "Пользователь не найден" });
  req.user = user;
  next();
}

// In-memory rate limiter (max 20 req/min per IP for auth, 60 req/min for API)
const rateMaps = { auth: new Map(), api: new Map() };
function makeRateLimit(key, limit) {
  return function rateLimit(req, res, next) {
    const ip  = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const map = rateMaps[key];
    const entry = map.get(ip) || { count: 0, reset: now + 60000 };
    if (now > entry.reset) { entry.count = 0; entry.reset = now + 60000; }
    entry.count++;
    map.set(ip, entry);
    if (entry.count > limit) {
      return res.status(429).json({ error: "Слишком много запросов. Попробуйте позже." });
    }
    next();
  };
}
const authRateLimit = makeRateLimit("auth", 20);
const apiRateLimit  = makeRateLimit("api",  60);

// ── POST /api/register ─────────────────────────────────────────────────────────
app.post("/api/register", authRateLimit, async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "Требуется имя пользователя и пароль" });
  if (username.length < 3 || username.length > 16) return res.status(400).json({ error: "Имя: от 3 до 16 символов" });
  if (password.length < 4) return res.status(400).json({ error: "Пароль: минимум 4 символа" });
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = db.prepare("INSERT INTO users (username, password_hash) VALUES (?,?)").run(username, hash);
    const token = makeToken(result.lastInsertRowid, username);
    res.json({ token, userId: result.lastInsertRowid, username, hasCharacter: false });
  } catch (e) {
    if (e.message && e.message.includes("UNIQUE")) {
      return res.status(400).json({ error: "Имя пользователя уже занято" });
    }
    console.error(e);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// ── POST /api/login ────────────────────────────────────────────────────────────
app.post("/api/login", authRateLimit, async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "Требуется имя пользователя и пароль" });
  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  if (!user) return res.status(401).json({ error: "Неверные данные" });
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: "Неверные данные" });
  const char = db.prepare("SELECT id FROM characters WHERE user_id = ?").get(user.id);
  const token = makeToken(user.id, user.username);
  res.json({ token, userId: user.id, username: user.username, hasCharacter: !!char });
});

// ── GET /api/me ────────────────────────────────────────────────────────────────
app.get("/api/me", apiRateLimit, authMiddleware, (req, res) => {
  const char = db.prepare("SELECT * FROM characters WHERE user_id = ?").get(req.user.id);
  if (!char) return res.json({ user: { id: req.user.id, username: req.user.username }, character: null });
  res.json({
    user: { id: req.user.id, username: req.user.username },
    character: parseChar(char),
  });
});

// ── POST /api/character ────────────────────────────────────────────────────────
app.post("/api/character", apiRateLimit, authMiddleware, (req, res) => {
  const { name, class_name, class_icon } = req.body || {};
  if (!name || !class_name) return res.status(400).json({ error: "Требуется имя и класс" });
  if (db.prepare("SELECT id FROM characters WHERE user_id = ?").get(req.user.id)) {
    return res.status(400).json({ error: "Персонаж уже создан" });
  }
  db.prepare("INSERT INTO characters (user_id, name, class_name, class_icon) VALUES (?,?,?,?)").run(
    req.user.id, name, class_name, class_icon || "⚔️"
  );
  const char = db.prepare("SELECT * FROM characters WHERE user_id = ?").get(req.user.id);
  res.json({ character: parseChar(char) });
});

// ── PUT /api/character ─────────────────────────────────────────────────────────
app.put("/api/character", apiRateLimit, authMiddleware, (req, res) => {
  const d = req.body || {};
  db.prepare(`
    UPDATE characters SET
      level=?, xp=?, floor=?, hp=?, mp=?, col=?, gems=?,
      inventory_json=?, equipment_json=?, quests_json=?,
      pvp_wins=?, pvp_losses=?, trophies_json=?,
      updated_at=datetime('now')
    WHERE user_id=?
  `).run(
    d.level ?? 1, d.xp ?? 0, d.floor ?? 1, d.hp ?? 0, d.mp ?? 0, d.col ?? 0, d.gems ?? 0,
    JSON.stringify(d.inventory || {}),
    JSON.stringify(d.equipment || {}),
    JSON.stringify(d.quests    || []),
    d.pvpWins ?? 0, d.pvpLosses ?? 0,
    JSON.stringify(d.trophies  || []),
    req.user.id
  );
  res.json({ success: true });
});

// ── GET /api/leaderboard ───────────────────────────────────────────────────────
app.get("/api/leaderboard", apiRateLimit, (req, res) => {
  const rows = db.prepare(`
    SELECT name, class_name, class_icon, level, floor
    FROM characters
    ORDER BY level DESC, floor DESC
    LIMIT 10
  `).all();
  res.json(rows);
});

// ── GET /api/players ──────────────────────────────────────────────────────────
app.get("/api/players", apiRateLimit, authMiddleware, (req, res) => {
  const rows = db.prepare(`
    SELECT c.id, c.name, c.class_name, c.class_icon, c.level, c.floor, c.pvp_wins, c.pvp_losses
    FROM characters c
    WHERE c.user_id != ?
    ORDER BY c.level DESC
  `).all(req.user.id);
  // Compute combat stats from level (same formula as client-side)
  const withStats = rows.map(r => ({
    ...r,
    max_hp: 120 + (r.level - 1) * 22,
    atk:    20  + (r.level - 1) * 5,
    def:    10  + (r.level - 1) * 3,
  }));
  res.json(withStats);
});

// ── POST /api/pvp ──────────────────────────────────────────────────────────────
app.post("/api/pvp", apiRateLimit, authMiddleware, (req, res) => {
  const { defender_id, winner } = req.body || {};
  const attacker = db.prepare("SELECT * FROM characters WHERE user_id = ?").get(req.user.id);
  if (!attacker) return res.status(400).json({ error: "Персонаж не найден" });
  const defender = db.prepare("SELECT * FROM characters WHERE id = ?").get(Number(defender_id));
  if (!defender) return res.status(400).json({ error: "Противник не найден" });

  const winnerId = winner === "attacker" ? attacker.id : defender.id;
  db.prepare("INSERT INTO pvp_battles (attacker_id, defender_id, winner_id) VALUES (?,?,?)").run(attacker.id, defender.id, winnerId);

  if (winner === "attacker") {
    db.prepare("UPDATE characters SET pvp_wins   = pvp_wins   + 1 WHERE id = ?").run(attacker.id);
    db.prepare("UPDATE characters SET pvp_losses = pvp_losses + 1 WHERE id = ?").run(defender.id);
  } else {
    db.prepare("UPDATE characters SET pvp_losses = pvp_losses + 1 WHERE id = ?").run(attacker.id);
    db.prepare("UPDATE characters SET pvp_wins   = pvp_wins   + 1 WHERE id = ?").run(defender.id);
  }
  res.json({ success: true });
});

// ── Helper ─────────────────────────────────────────────────────────────────────
function parseChar(c) {
  return {
    ...c,
    inventory: safeJson(c.inventory_json, {}),
    equipment: safeJson(c.equipment_json, {}),
    quests:    safeJson(c.quests_json,    []),
    trophies:  safeJson(c.trophies_json,  []),
  };
}
function safeJson(str, fallback) {
  try { return JSON.parse(str); } catch { return fallback; }
}

// ── Start ──────────────────────────────────────────────────────────────────────
app.listen(3000, () => console.log("SAO RPG сервер запущен на порту 3000"));

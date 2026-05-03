/* =====================================================
   SWORD ART ONLINE – Web RPG  |  Full Game Logic (RU)
   ===================================================== */
"use strict";

// ── Utilities ──────────────────────────────────────────────────────────────────
const rand  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const $     = id => document.getElementById(id);

// ── Classes ────────────────────────────────────────────────────────────────────
const CLASSES = [
  { id:"swordsman", name:"Мечник",  icon:"⚔️",  color:"#4af", stats:{ hpMult:1.0, mpMult:0.8, atkMult:1.2, defMult:1.0 }, desc:"Мастер одноручного меча. Высокая атака." },
  { id:"paladin",   name:"Паладин", icon:"🛡️",  color:"#fa4", stats:{ hpMult:1.3, mpMult:0.7, atkMult:0.9, defMult:1.4 }, desc:"Защитник с высоким HP и защитой." },
  { id:"mage",      name:"Маг",     icon:"🔮",  color:"#a4f", stats:{ hpMult:0.8, mpMult:1.5, atkMult:1.0, defMult:0.8 }, desc:"Чародей с огромным запасом MP." },
  { id:"assassin",  name:"Убийца",  icon:"🥷",  color:"#4fa", stats:{ hpMult:0.9, mpMult:1.0, atkMult:1.3, defMult:0.9 }, desc:"Скоростной боец с критическими ударами." },
];

// ── Enemy pool ─────────────────────────────────────────────────────────────────
const ENEMY_POOL = [
  { name:"Бешеный Кабан",       sprite:"🐗", hp: 60, mp:  0, atk:12, def: 5, spd: 8, xp: 18, col:1, isBoss:false, skills:[], loot:[{item:"health_potion",chance:.3}] },
  { name:"Лесной Волк",         sprite:"🐺", hp: 80, mp: 20, atk:16, def: 6, spd:12, xp: 25, col:1, isBoss:false, skills:["Свирепый укус"], loot:[{item:"health_potion",chance:.25}] },
  { name:"Скелет-Воин",         sprite:"💀", hp:100, mp: 30, atk:20, def:10, spd:10, xp: 35, col:3, isBoss:false, skills:["Костедробилка"], loot:[{item:"mana_crystal",chance:.3}] },
  { name:"Тёмный Эльф-Лучник",  sprite:"🧝", hp: 90, mp: 40, atk:24, def: 8, spd:16, xp: 40, col:3, isBoss:false, skills:["Отравленная стрела"], loot:[{item:"health_potion",chance:.2},{item:"mana_crystal",chance:.2}] },
  { name:"Ящеролюд",            sprite:"🦎", hp:130, mp: 20, atk:28, def:14, spd:11, xp: 55, col:5, isBoss:false, skills:["Удар хвостом"], loot:[{item:"health_potion",chance:.3}] },
  { name:"Проклятый Дух",       sprite:"👻", hp:110, mp: 60, atk:26, def:10, spd:18, xp: 58, col:5, isBoss:false, skills:["Высасывание души"], loot:[{item:"mana_crystal",chance:.35}] },
  { name:"Воин-Минотавр",       sprite:"🐃", hp:160, mp:  0, atk:34, def:18, spd: 9, xp: 75, col:7, isBoss:false, skills:["Таранный удар"], loot:[{item:"health_potion",chance:.4}] },
  { name:"Теневой Убийца",      sprite:"🥷", hp:120, mp: 50, atk:38, def:12, spd:22, xp: 80, col:7, isBoss:false, skills:["Теневой шаг","Свирепый укус"], loot:[{item:"elixir",chance:.15}] },
  { name:"Обсидиановый Рыцарь", sprite:"🤺", hp:200, mp: 60, atk:42, def:22, spd:12, xp:110, col:9, isBoss:false, skills:["Костедробилка","Таранный удар"], loot:[{item:"elixir",chance:.2}] },
];

const BOSSES = [
  { name:"Илфанг, Владыка Кобольдов",  sprite:"👹", floor:1, hp: 320, mp: 60, atk:28, def:14, spd:10, xp: 250, isBoss:true, skills:["Рунный клинок","Удар хвостом"], intro:"БОСС 1-ГО ЭТАЖА" },
  { name:"Астериус, Король Тавров",     sprite:"🦬", floor:3, hp: 480, mp: 80, atk:36, def:18, spd:13, xp: 400, isBoss:true, skills:["Таранный удар","Костедробилка","Рунный клинок"], intro:"БОСС 3-ГО ЭТАЖА" },
  { name:"Нериус, Злобный Трент",       sprite:"🌲", floor:5, hp: 620, mp:100, atk:44, def:22, spd: 8, xp: 600, isBoss:true, skills:["Отравленная стрела","Высасывание души","Удар хвостом"], intro:"БОСС 5-ГО ЭТАЖА" },
  { name:"Мерцающий Взор",             sprite:"😈", floor:7, hp: 800, mp:120, atk:52, def:26, spd:16, xp: 900, isBoss:true, skills:["Рунный клинок","Таранный удар","Теневой шаг","Высасывание души"], intro:"БОСС 7-ГО ЭТАЖА" },
  { name:"Хитклифф (Акихико Каяба)",   sprite:"⚔️", floor:9, hp:1200, mp:200, atk:68, def:35, spd:20, xp:2000, isBoss:true, skills:["Рунный клинок","Таранный удар","Высасывание души","Теневой шаг","Костедробилка"], intro:"ФИНАЛЬНЫЙ БОСС – ЭТАЖ 10" },
];

const ENEMY_SKILLS = {
  "Свирепый укус":      { dmgMult:1.5, effect:null,     mpCost:10, msg:"{enemy} яростно кусает!" },
  "Костедробилка":      { dmgMult:1.8, effect:"stun",   mpCost:15, msg:"{enemy} наносит сокрушительный удар!" },
  "Отравленная стрела": { dmgMult:1.2, effect:"poison", mpCost:12, msg:"{enemy} выпускает отравленную стрелу!" },
  "Удар хвостом":       { dmgMult:1.6, effect:null,     mpCost:10, msg:"{enemy} бьёт хвостом!" },
  "Высасывание души":   { dmgMult:1.3, effect:"drain",  mpCost:20, msg:"{enemy} высасывает вашу жизненную силу!" },
  "Таранный удар":      { dmgMult:2.0, effect:null,     mpCost:15, msg:"{enemy} атакует с полной силой!" },
  "Теневой шаг":        { dmgMult:1.7, effect:null,     mpCost:18, msg:"{enemy} исчезает и наносит удар из тени!" },
  "Рунный клинок":      { dmgMult:2.2, effect:"burn",   mpCost:25, msg:"{enemy} ударяет светящимся рунным клинком!" },
};

const SWORD_SKILLS = [
  { id:"horizontal",       name:"Горизонталь",       mpCost:15, dmgMult:1.6, hits:1,  effect:null,    desc:"Стремительный горизонтальный удар.",            unlockedAt:1 },
  { id:"sonic_leap",       name:"Звуковой прыжок",   mpCost:20, dmgMult:2.0, hits:1,  effect:null,    desc:"Прыжок вперёд с ослепительной скоростью.",      unlockedAt:3 },
  { id:"vertical_arc",     name:"Вертикальная дуга", mpCost:18, dmgMult:1.4, hits:2,  effect:null,    desc:"Два стремительных вертикальных удара.",          unlockedAt:5 },
  { id:"vorpal_strike",    name:"Вихревой удар",      mpCost:30, dmgMult:2.6, hits:1,  effect:"stun",  desc:"Пронзающий удар, способный оглушить врага.",    unlockedAt:7 },
  { id:"eclipse",          name:"Затмение",           mpCost:35, dmgMult:1.5, hits:3,  effect:"burn",  desc:"Тройной удар, поджигающий врага.",               unlockedAt:9 },
  { id:"starburst_stream", name:"Звёздный Поток",     mpCost:80, dmgMult:1.2, hits:16, effect:null,    desc:"Легендарная 16-ударная комбо Кирито!",          unlockedAt:10 },
];

const ITEMS = {
  health_potion: { name:"Зелье здоровья", icon:"🧪", desc:"Восстановить 80 HP",  action:"heal",   value:80 },
  mana_crystal:  { name:"Кристалл маны",  icon:"💎", desc:"Восстановить 50 MP",  action:"mana",   value:50 },
  elixir:        { name:"Эликсир",        icon:"✨", desc:"HP +120 и MP +40",     action:"elixir", value:0  },
};

const EQUIPMENT_ITEMS = [
  { id:"e1",  slot:"weapon",    name:"Деревянный Меч",    icon:"🗡️", atk: 5, def: 0, floor:1 },
  { id:"e2",  slot:"weapon",    name:"Железный Меч",      icon:"⚔️", atk:12, def: 0, floor:2 },
  { id:"e3",  slot:"weapon",    name:"Стальной Клинок",   icon:"🔪", atk:20, def: 0, floor:4 },
  { id:"e4",  slot:"weapon",    name:"Тёмный Рапир",      icon:"🗡️", atk:30, def: 0, floor:6 },
  { id:"e5",  slot:"weapon",    name:"Руническое Лезвие", icon:"⚔️", atk:45, def: 0, floor:9 },
  { id:"e6",  slot:"armor",     name:"Кожаная Броня",     icon:"🛡️", atk: 0, def: 5, floor:1 },
  { id:"e7",  slot:"armor",     name:"Кольчуга",          icon:"🛡️", atk: 0, def:12, floor:3 },
  { id:"e8",  slot:"armor",     name:"Рыцарский Доспех",  icon:"🛡️", atk: 0, def:20, floor:6 },
  { id:"e9",  slot:"accessory", name:"Амулет Силы",       icon:"📿", atk: 8, def: 0, floor:2 },
  { id:"e10", slot:"accessory", name:"Кольцо Защиты",     icon:"💍", atk: 0, def: 8, floor:4 },
];

const FLOOR_LOCATIONS = [
  { name:"Лес Начала",     type:"battle", icon:"🌲", floor:1 },
  { name:"Толбана",        type:"town",   icon:"🏘️", floor:1 },
  { name:"Горный Перевал", type:"battle", icon:"⛰️", floor:2 },
  { name:"Страна Эльфов",  type:"battle", icon:"🌿", floor:3 },
  { name:"Азалия",         type:"town",   icon:"🏘️", floor:3 },
  { name:"Пещера Теней",   type:"battle", icon:"🕳️", floor:5 },
  { name:"Гранам",         type:"town",   icon:"🏘️", floor:5 },
  { name:"Замок Хаоса",    type:"battle", icon:"🏰", floor:7 },
  { name:"Сёлия",          type:"town",   icon:"🏘️", floor:7 },
  { name:"Башня Тьмы",     type:"battle", icon:"🗼", floor:9 },
];

const TOWN_NPCS = [
  { icon:"⚔️", name:"Кузнец Стальной Клык", role:"Оружейник",  greeting:"Добро пожаловать в мою кузницу! Посмотри мои лучшие клинки.", type:"shop"  },
  { icon:"🛡️", name:"Торговец Бронёй",      role:"Торговец",   greeting:"Нужна хорошая защита? У меня есть всё!",                      type:"armor" },
  { icon:"🧙", name:"Маг Исцеления",        role:"Целитель",   greeting:"Ваши раны исцелятся здесь. Чем могу помочь?",                 type:"heal"  },
  { icon:"📖", name:"Мудрец Аинкрада",      role:"Информатор", greeting:"Приветствую, авантюрист! Поделюсь знаниями об Аинкраде.",    type:"info"  },
];

const QUESTS = [
  { id:"q1", name:"Первые шаги",       desc:"Победите 5 врагов.",          req:{ type:"kills",  count:5 },  reward:{ xp:100,  col:50   } },
  { id:"q2", name:"Охотник на боссов", desc:"Победите босса 1-го этажа.",  req:{ type:"boss",   floor:1 },  reward:{ xp:500,  col:200  } },
  { id:"q3", name:"Мастер клинка",     desc:"Используйте навыки 10 раз.",  req:{ type:"skills", count:10 }, reward:{ xp:300,  col:100  } },
  { id:"q4", name:"Исследователь",     desc:"Достигните 5-го этажа.",      req:{ type:"floor",  floor:5 },  reward:{ xp:1000, col:500  } },
  { id:"q5", name:"Непобедимый",       desc:"Победите 3 боссов.",          req:{ type:"bosses", count:3 },  reward:{ xp:2000, col:1000 } },
];

const TROPHIES = [
  { id:"t1", name:"Первая кровь",     icon:"🩸", desc:"Победите первого врага.",     check: g => (g.mobsFelled||0) >= 1 },
  { id:"t2", name:"Убийца боссов",    icon:"💀", desc:"Победите первого босса.",     check: g => (g.bossesDefeated||0) >= 1 },
  { id:"t3", name:"Мастер меча",      icon:"⚔️", desc:"Достигните 10-го уровня.",   check: g => g.level >= 10 },
  { id:"t4", name:"Аинкрадский герой",icon:"🏆", desc:"Пройдите все 10 этажей.",    check: g => g.floor > 10 },
  { id:"t5", name:"Боец арены",       icon:"🥊", desc:"Выиграйте ПвП бой.",         check: g => (g.pvpWins||0) >= 1 },
  { id:"t6", name:"Коллекционер",     icon:"🎁", desc:"Соберите 20 предметов.",      check: g => (g.totalItemsEver||0) >= 20 },
];

const GEM_PACKAGES = [
  { gems:100,  price:"50 руб.",  icon:"💎",     label:"Стартовый"  },
  { gems:300,  price:"130 руб.", icon:"💎💎",   label:"Популярный" },
  { gems:700,  price:"280 руб.", icon:"💎💎💎", label:"Выгодный"   },
  { gems:1500, price:"550 руб.", icon:"👑",     label:"Премиум"    },
];

const GEM_ITEMS = [
  { id:"gi1", name:"Зелье здоровья ×5", icon:"🧪", cost: 50, item:"health_potion", qty:5, desc:"5 зелий здоровья"        },
  { id:"gi2", name:"Эликсир ×3",        icon:"✨", cost:150, item:"elixir",         qty:3, desc:"3 эликсира"              },
  { id:"gi3", name:"Свиток Возрождения",icon:"📜", cost:200, item:"revive_scroll",  qty:1, desc:"Возродиться при смерти"  },
  { id:"gi4", name:"Кристалл маны ×5",  icon:"💎", cost: 80, item:"mana_crystal",   qty:5, desc:"5 кристаллов маны"      },
];

const STATUS_ICONS = { burn:"🔥", poison:"☠️", stun:"⚡", regen:"💚", drain:"🩸" };
const STATUS_RU    = { burn:"горение", poison:"яд", stun:"оглушение", regen:"регенерация", drain:"высасывание" };

// ── Auth & State ───────────────────────────────────────────────────────────────
let AUTH = { token:null, userId:null, username:null };
let G    = {};

// ── API helpers ────────────────────────────────────────────────────────────────
async function apiFetch(method, url, body) {
  const opts = { method, headers:{ "Content-Type":"application/json" } };
  if (AUTH.token) opts.headers["Authorization"] = "Bearer " + AUTH.token;
  if (body) opts.body = JSON.stringify(body);
  const r    = await fetch(url, opts);
  const json = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(json.error || "Ошибка сервера");
  return json;
}
const apiPost = (url, body) => apiFetch("POST", url, body);
const apiGet  = (url)       => apiFetch("GET",  url);
const apiPut  = (url, body) => apiFetch("PUT",  url, body);

// ── Level/stat helpers ─────────────────────────────────────────────────────────
function xpToNextLevel(lv) { return Math.floor(50 * Math.pow(1.45, lv - 1)); }

function baseStatsAtLevel(lv) {
  return {
    maxHp: 120 + (lv-1)*22,
    maxMp:  60 + (lv-1)*12,
    atk:    20 + (lv-1)*5,
    def:    10 + (lv-1)*3,
    spd:    15 + (lv-1)*2,
  };
}

function recomputeStats() {
  const cls  = G.playerClass || CLASSES[0];
  const base = baseStatsAtLevel(G.level);
  G.maxHp    = Math.floor(base.maxHp * cls.stats.hpMult);
  G.maxMp    = Math.floor(base.maxMp * cls.stats.mpMult);
  let atk    = Math.floor(base.atk   * cls.stats.atkMult);
  let def    = Math.floor(base.def   * cls.stats.defMult);
  G.spd      = base.spd;
  const eq   = G.equipment && G.equipment.equipped;
  if (eq) {
    ["weapon","armor","accessory"].forEach(slot => {
      const item = EQUIPMENT_ITEMS.find(i => i.id === eq[slot]);
      if (item) { atk += item.atk; def += item.def; }
    });
  }
  G.atk = atk;
  G.def = def;
}

// ── Quest helpers ──────────────────────────────────────────────────────────────
function initQuestProgress() {
  if (!G.quests) G.quests = [];
  QUESTS.forEach(q => {
    if (!G.quests.find(x => x.id === q.id))
      G.quests.push({ id:q.id, progress:0, completed:false, claimed:false });
  });
}

function updateQuestProgress(eventType, value) {
  initQuestProgress();
  QUESTS.forEach(qDef => {
    const q = G.quests.find(x => x.id === qDef.id);
    if (!q || q.completed) return;
    const r = qDef.req;
    if (r.type === "kills" && eventType === "kills") {
      q.progress = (q.progress||0) + value;
      if (q.progress >= r.count) { q.completed = true; showQuestToast(qDef); }
    } else if (r.type === "bosses" && eventType === "bosses") {
      q.progress = (q.progress||0) + value;
      if (q.progress >= r.count) { q.completed = true; showQuestToast(qDef); }
    } else if (r.type === "skills" && eventType === "skills") {
      q.progress = (q.progress||0) + value;
      if (q.progress >= r.count) { q.completed = true; showQuestToast(qDef); }
    } else if (r.type === "boss" && eventType === "boss" && value === r.floor) {
      q.progress = 1; q.completed = true; showQuestToast(qDef);
    } else if (r.type === "floor" && eventType === "floor" && value >= r.floor) {
      q.progress = value; q.completed = true; showQuestToast(qDef);
    }
  });
}

function showQuestToast(qDef) {
  const el = document.createElement("div");
  el.style.cssText = "position:fixed;top:80px;left:50%;transform:translateX(-50%);z-index:9999;background:#2a4;color:#fff;padding:12px 24px;border-radius:8px;font-size:1rem;pointer-events:none;";
  el.textContent = "📋 Задание выполнено: " + qDef.name + "!";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

// ── Trophy helpers ─────────────────────────────────────────────────────────────
function checkTrophies() {
  if (!G.trophies) G.trophies = [];
  G.totalItemsEver = Object.values(G.inventory || {}).reduce((a,b) => a + (typeof b==="number"?b:0), 0);
  TROPHIES.forEach(t => {
    if (!G.trophies.includes(t.id) && t.check(G)) {
      G.trophies.push(t.id);
      showTrophyToast(t);
    }
  });
}

function showTrophyToast(t) {
  const el = document.createElement("div");
  el.style.cssText = "position:fixed;top:130px;left:50%;transform:translateX(-50%);z-index:9999;background:#a40;color:#fff;padding:12px 24px;border-radius:8px;font-size:1rem;pointer-events:none;";
  el.textContent = t.icon + " Трофей получен: " + t.name + "!";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

// ── Load character from server data ────────────────────────────────────────────
function loadCharacterFromData(char) {
  const cls        = CLASSES.find(c => c.id === char.class_name) || CLASSES[0];
  G.playerName     = char.name;
  G.playerClass    = cls;
  G.level          = char.level  || 1;
  G.xp             = char.xp     || 0;
  G.xpNext         = xpToNextLevel(G.level);
  G.floor          = char.floor  || 1;
  G.col            = char.col    || 0;
  G.gems           = char.gems   || 0;
  G.pvpWins        = char.pvp_wins   || 0;
  G.pvpLosses      = char.pvp_losses || 0;
  G.trophies       = Array.isArray(char.trophies) ? char.trophies : [];
  G.quests         = Array.isArray(char.quests)   ? char.quests   : [];
  const inv        = char.inventory || {};
  G.mobsFelled     = inv._mf   || 0;
  G.bossesDefeated = inv._bd   || 0;
  G.skillsUsed     = inv._su   || 0;
  G.inventory = {
    health_potion: inv.health_potion || 0,
    mana_crystal:  inv.mana_crystal  || 0,
    elixir:        inv.elixir        || 0,
    revive_scroll: inv.revive_scroll || 0,
  };
  const eq    = char.equipment || {};
  G.equipment = {
    equipped: eq.equipped || { weapon:null, armor:null, accessory:null },
    owned:    eq.owned    || [],
  };
  recomputeStats();
  G.hp              = Math.min(char.hp || G.maxHp, G.maxHp);
  G.mp              = Math.min(char.mp || G.maxMp, G.maxMp);
  G.skills          = SWORD_SKILLS.filter(s => s.unlockedAt <= G.level);
  G.battlesOnFloor  = 0;
  G.battlesNeeded   = 3 + Math.floor(G.floor / 3);
  G.statuses        = [];
  G.enemyStatuses   = [];
  G.enemy           = null;
  G.inBattle        = false;
  G.playerTurn      = true;
  initQuestProgress();
}

// ── Screen management ──────────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  const el = $(id);
  if (el) el.classList.remove("hidden");
}

// ── Save character ─────────────────────────────────────────────────────────────
async function saveCharacter() {
  if (!AUTH.token) return;
  try {
    await apiPut("/api/character", {
      level:  G.level, xp: G.xp, floor: G.floor, hp: G.hp, mp: G.mp,
      col:    G.col,   gems: G.gems,
      inventory: {
        ...G.inventory,
        _mf: G.mobsFelled     || 0,
        _bd: G.bossesDefeated || 0,
        _su: G.skillsUsed     || 0,
      },
      equipment: G.equipment,
      quests:    G.quests,
      pvpWins:   G.pvpWins,
      pvpLosses: G.pvpLosses,
      trophies:  G.trophies,
    });
  } catch (e) { console.warn("Save failed:", e.message); }
}

// ════════════════════════════════════════════════════════════════
//  AUTH SCREENS
// ════════════════════════════════════════════════════════════════
function setupAuthScreens() {
  $("login-btn").addEventListener("click", doLogin);
  $("login-user").addEventListener("keydown", e => { if (e.key==="Enter") doLogin(); });
  $("login-pass").addEventListener("keydown", e => { if (e.key==="Enter") doLogin(); });
  $("goto-register-btn").addEventListener("click",  () => { $("login-error").textContent=""; showScreen("register-screen"); });
  $("register-btn").addEventListener("click", doRegister);
  $("back-to-login-btn").addEventListener("click",  () => { $("reg-error").textContent=""; showScreen("login-screen"); });
}

async function doLogin() {
  const user = $("login-user").value.trim();
  const pass = $("login-pass").value;
  $("login-error").textContent = "";
  if (!user || !pass) { $("login-error").textContent = "Введите имя и пароль."; return; }
  $("login-btn").disabled = true;
  try {
    const data = await apiPost("/api/login", { username:user, password:pass });
    AUTH = { token:data.token, userId:data.userId, username:data.username };
    localStorage.setItem("sao_token", data.token);
    if (data.hasCharacter) {
      const me = await apiGet("/api/me");
      loadCharacterFromData(me.character);
      showHub();
    } else {
      showScreen("char-create-screen");
      renderCharCreate();
    }
  } catch (e) {
    $("login-error").textContent = e.message;
  } finally {
    $("login-btn").disabled = false;
  }
}

async function doRegister() {
  const user  = $("reg-user").value.trim();
  const pass  = $("reg-pass").value;
  const pass2 = $("reg-pass2").value;
  $("reg-error").textContent = "";
  if (!user || !pass) { $("reg-error").textContent = "Заполните все поля."; return; }
  if (pass !== pass2) { $("reg-error").textContent = "Пароли не совпадают."; return; }
  $("register-btn").disabled = true;
  try {
    const data = await apiPost("/api/register", { username:user, password:pass });
    AUTH = { token:data.token, userId:data.userId, username:data.username };
    localStorage.setItem("sao_token", data.token);
    showScreen("char-create-screen");
    renderCharCreate();
  } catch (e) {
    $("reg-error").textContent = e.message;
  } finally {
    $("register-btn").disabled = false;
  }
}

// ════════════════════════════════════════════════════════════════
//  CHARACTER CREATE
// ════════════════════════════════════════════════════════════════
let selectedClassId = null;

function renderCharCreate() {
  selectedClassId = null;
  $("cc-confirm-btn").disabled = true;
  const grid = $("cc-classes");
  grid.innerHTML = "";
  CLASSES.forEach(cls => {
    const card = document.createElement("div");
    card.className = "cc-class-card";
    card.innerHTML = `<div class="cc-class-icon">${cls.icon}</div><div class="cc-class-name">${cls.name}</div>`;
    card.style.setProperty("--cls-color", cls.color);
    card.addEventListener("click", () => {
      grid.querySelectorAll(".cc-class-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      selectedClassId = cls.id;
      $("cc-preview").innerHTML = `<div style="color:${cls.color};font-size:2rem;margin-bottom:6px">${cls.icon} ${cls.name}</div><p style="color:#aaa">${cls.desc}</p>`;
      $("cc-confirm-btn").disabled = !$("cc-name").value.trim();
    });
    grid.appendChild(card);
  });
  const nameInput = $("cc-name");
  nameInput.value = "";
  nameInput.addEventListener("input", () => {
    $("cc-confirm-btn").disabled = !nameInput.value.trim() || !selectedClassId;
  });
  $("cc-confirm-btn").onclick = doCreateCharacter;
}

async function doCreateCharacter() {
  const name = $("cc-name").value.trim();
  if (!name || !selectedClassId) return;
  const cls = CLASSES.find(c => c.id === selectedClassId);
  $("cc-confirm-btn").disabled = true;
  try {
    const data = await apiPost("/api/character", { name, class_name:cls.id, class_icon:cls.icon });
    const char = data.character;
    // Give starting equipment
    char.equipment = { equipped:{ weapon:"e1", armor:"e6", accessory:null }, owned:["e1","e6"] };
    char.inventory = { health_potion:3, mana_crystal:2, elixir:0, revive_scroll:0 };
    loadCharacterFromData(char);
    await saveCharacter();
    showHub();
  } catch (e) {
    alert("Ошибка: " + e.message);
    $("cc-confirm-btn").disabled = false;
  }
}

// ════════════════════════════════════════════════════════════════
//  HUB
// ════════════════════════════════════════════════════════════════
function showHub() {
  renderHub();
  showScreen("hub-screen");
}

function renderHub() {
  const cls = G.playerClass || CLASSES[0];
  $("hub-player-icon").textContent  = cls.icon;
  $("hub-player-name").textContent  = G.playerName;
  $("hub-player-class").textContent = cls.name;
  $("hub-player-level").textContent = "Ур." + G.level;
  $("hub-hp-val").textContent  = G.hp + "/" + G.maxHp;
  $("hub-mp-val").textContent  = G.mp + "/" + G.maxMp;
  $("hub-hp-fill").style.width = clamp(G.hp/G.maxHp*100,0,100) + "%";
  $("hub-mp-fill").style.width = clamp(G.mp/G.maxMp*100,0,100) + "%";
  $("hub-col").textContent     = "💰 " + G.col + " Col";
  $("hub-gems").textContent    = "💎 " + G.gems + " Алмазов";
  $("hub-xp-fill").style.width = clamp(G.xp/G.xpNext*100,0,100) + "%";
  $("hub-xp-text").textContent = G.xp + " / " + G.xpNext + " XP";
  $("hub-floor-label").textContent = "Этаж " + G.floor + " / 10";
  $("hub-loc-floor").textContent   = G.floor;
  renderLocationGrid();
}

function renderLocationGrid() {
  const grid = $("hub-location-grid");
  grid.innerHTML = "";
  FLOOR_LOCATIONS.forEach(loc => {
    const locked = loc.floor > G.floor;
    const card   = document.createElement("div");
    card.className = "hub-loc-card" + (locked ? " locked" : "");
    card.innerHTML =
      `<span class="hub-loc-icon">${loc.icon}</span>` +
      `<span class="hub-loc-name">${loc.name}</span>` +
      `<span class="hub-loc-floor">Этаж ${loc.floor}</span>`;
    if (!locked) {
      card.addEventListener("click", () => {
        if (loc.type === "battle") startBattleFromLocation(loc);
        else showTown(loc);
      });
    }
    grid.appendChild(card);
  });
}

function setupHubNav() {
  $("nav-equip-btn").addEventListener("click",  showEquipScreen);
  $("nav-items-btn").addEventListener("click",  showItemsScreen);
  $("nav-quest-btn").addEventListener("click",  showQuestScreen);
  $("nav-pvp-btn").addEventListener("click",    showPvpScreen);
  $("nav-trophy-btn").addEventListener("click", showTrophyScreen);
  $("nav-donate-btn").addEventListener("click", showDonateScreen);
  $("nav-logout-btn").addEventListener("click", doLogout);
}

async function doLogout() {
  await saveCharacter();
  AUTH = { token:null, userId:null, username:null };
  G    = {};
  localStorage.removeItem("sao_token");
  $("login-user").value = "";
  $("login-pass").value = "";
  $("login-error").textContent = "";
  showScreen("login-screen");
}

// ════════════════════════════════════════════════════════════════
//  TOWN
// ════════════════════════════════════════════════════════════════
function showTown(loc) {
  $("town-title").textContent    = loc.name;
  $("town-subtitle").textContent = "Безопасная зона – Этаж " + loc.floor;
  renderTownNpcs();
  showScreen("town-screen");
}

function renderTownNpcs() {
  const grid = $("town-npc-grid");
  grid.innerHTML = "";
  TOWN_NPCS.forEach(npc => {
    const card = document.createElement("div");
    card.className = "npc-card";
    card.innerHTML =
      `<div class="npc-icon">${npc.icon}</div>` +
      `<div class="npc-name">${npc.name}</div>` +
      `<div class="npc-role">${npc.role}</div>`;
    card.addEventListener("click", () => openNpcModal(npc));
    grid.appendChild(card);
  });
}

function openNpcModal(npc) {
  $("npc-modal-icon").textContent     = npc.icon;
  $("npc-modal-name").textContent     = npc.name;
  $("npc-modal-role").textContent     = npc.role;
  $("npc-modal-greeting").textContent = npc.greeting;
  const content = $("npc-modal-content");
  content.innerHTML = "";
  if (npc.type === "heal") {
    const cost = 50 * G.floor;
    const btn  = document.createElement("button");
    btn.className   = "btn-primary";
    btn.textContent = "Исцелить (" + cost + " Col)";
    btn.addEventListener("click", () => {
      if (G.col < cost) { alert("Недостаточно Col!"); return; }
      G.col -= cost;
      G.hp = G.maxHp;
      G.mp = G.maxMp;
      saveCharacter();
      renderHub();
      $("npc-modal").classList.add("hidden");
    });
    content.appendChild(btn);
  } else if (npc.type === "shop") {
    buildShopContent(content, "weapon");
  } else if (npc.type === "armor") {
    buildShopContent(content, "armor");
  } else {
    content.innerHTML = `<p style="color:#bbb;line-height:1.7">Аинкрад – замок из 100 этажей, парящий в небе. Игроки заперты здесь до тех пор, пока кто-то не пройдёт все этажи. На каждом этаже тебя ждут испытания и могущественные боссы.</p>`;
  }
  $("npc-modal").classList.remove("hidden");
}

function buildShopContent(container, filterSlot) {
  container.innerHTML = "";
  const available = EQUIPMENT_ITEMS.filter(i => i.slot === filterSlot && i.floor <= G.floor + 1);
  if (!available.length) {
    container.innerHTML = `<p style="color:#888">Нет доступных товаров.</p>`;
    return;
  }
  available.forEach(item => {
    const owned = G.equipment.owned.includes(item.id);
    const price = item.floor * 100;
    const row   = document.createElement("div");
    row.style.cssText = "display:flex;align-items:center;gap:12px;padding:8px;border-bottom:1px solid #333;";
    row.innerHTML =
      `<span style="font-size:1.5rem">${item.icon}</span>` +
      `<div style="flex:1"><div style="color:#eee">${item.name}</div><div style="color:#888;font-size:.8rem">ATK+${item.atk} DEF+${item.def}</div></div>` +
      (owned ? `<span style="color:#4f4">Куплено</span>` : `<button class="btn-secondary" style="padding:6px 12px">${price} Col</button>`);
    if (!owned) {
      row.querySelector("button").addEventListener("click", () => {
        if (G.col < price) { alert("Недостаточно Col!"); return; }
        G.col -= price;
        G.equipment.owned.push(item.id);
        saveCharacter();
        buildShopContent(container, filterSlot);
      });
    }
    container.appendChild(row);
  });
}

// ════════════════════════════════════════════════════════════════
//  BATTLE SYSTEM
// ════════════════════════════════════════════════════════════════
function startBattleFromLocation(loc) {
  G.battlesOnFloor = 0;
  G.battlesNeeded  = 3 + Math.floor(G.floor / 3);
  G.enemy = null;
  $("hub-message").textContent = "";
  nextEncounter();
}

function pickEnemy() {
  if (G.battlesOnFloor >= G.battlesNeeded) {
    const boss = BOSSES.find(b => b.floor === Math.min(G.floor, 9));
    return { template:boss, isBoss:true };
  }
  const pool  = ENEMY_POOL.filter(e => e.col <= G.floor);
  const tmpl  = pool[rand(0, pool.length - 1)];
  const scale = 1 + (G.floor - tmpl.col) * 0.15;
  return { template:{ ...tmpl, hp:Math.floor(tmpl.hp*scale), atk:Math.floor(tmpl.atk*scale) }, isBoss:false };
}

function nextEncounter() {
  showScreen("game-screen");
  const { template, isBoss } = pickEnemy();
  if (!isBoss) {
    G.hp = clamp(G.hp + Math.floor(G.maxHp * 0.08), 0, G.maxHp);
    G.mp = clamp(G.mp + Math.floor(G.maxMp * 0.10), 0, G.maxMp);
  }
  startBattle(template, isBoss);
}

async function startBattle(tmpl, isBoss) {
  G.inBattle      = true;
  G.playerTurn    = true;
  G.enemyStatuses = [];
  G.enemy = { ...tmpl, maxHp:tmpl.hp, maxMp:tmpl.mp||0, hp:tmpl.hp, mp:tmpl.mp||0, isBoss:!!isBoss };

  if (isBoss) await showBossIntro(G.enemy);

  showScreen("game-screen");
  hidePostBattleBar();
  setActionsEnabled(true);
  buildSkillButtons();
  buildItemButtons();

  const cls = G.playerClass || CLASSES[0];
  $("player-sprite").textContent = cls.icon;
  $("player-name").textContent   = G.playerName;
  $("floor-label").textContent   = "Аинкрад – Этаж " + G.floor;
  $("level-label").textContent   = "Ур." + G.level;
  $("xp-fill").style.width       = clamp(G.xp/G.xpNext*100,0,100) + "%";
  $("xp-text").textContent       = G.xp + " / " + G.xpNext + " XP";
  $("battle-log").innerHTML      = "";

  updateBattleHud();
  log("⚔  Бой начинается! Вы встретили " + G.enemy.name + "!", "system");
  showPhaseBanner("ВАШ ХОД");
}

// ── HUD ──────────────────────────────────────────────────────────────────────
function updateBattleHud() {
  updateBar($("player-hp-fill"), $("player-hp-val"), G.hp,       G.maxHp,       "hp");
  updateBar($("player-mp-fill"), $("player-mp-val"), G.mp,       G.maxMp,       "mp");
  renderStatuses($("player-status"), G.statuses);
  if (G.enemy) {
    $("enemy-name").textContent   = G.enemy.name;
    $("enemy-sprite").textContent = G.enemy.sprite;
    updateBar($("enemy-hp-fill"), $("enemy-hp-val"), G.enemy.hp, G.enemy.maxHp, "hp");
    updateBar($("enemy-mp-fill"), $("enemy-mp-val"), G.enemy.mp, G.enemy.maxMp, "mp");
    renderStatuses($("enemy-status"), G.enemyStatuses);
  }
}

function updateBar(fillEl, valEl, cur, max, type) {
  const pct = Math.max(0, (cur / max) * 100);
  fillEl.style.width = pct + "%";
  if (type === "hp" && pct < 25)  fillEl.style.background = "var(--red)";
  else if (type === "hp" && pct < 50) fillEl.style.background = "#e0a030";
  else if (type === "hp")             fillEl.style.background = "";
  valEl.textContent = Math.max(0,cur) + " / " + max;
}

function renderStatuses(el, statuses) {
  el.innerHTML = statuses.filter(s=>s.turns>0)
    .map(s => `<span class="status-tag ${s.type}">${STATUS_ICONS[s.type]||""}${STATUS_RU[s.type]||s.type} (${s.turns})</span>`)
    .join("");
}

// ── Log & FX ─────────────────────────────────────────────────────────────────
function log(msg, cls) {
  if (!cls) cls = "system";
  const el    = document.createElement("div");
  el.className = "log-entry " + cls;
  el.textContent = msg;
  const logEl = $("battle-log");
  logEl.appendChild(el);
  logEl.scrollTop = logEl.scrollHeight;
  while (logEl.children.length > 80) logEl.removeChild(logEl.firstChild);
}

function floatDmg(targetEl, text, cls) {
  const rect = targetEl.getBoundingClientRect();
  const el   = document.createElement("div");
  el.className   = "dmg-float " + cls;
  el.textContent = text;
  el.style.left  = (rect.left + rect.width/2 - 20) + "px";
  el.style.top   = (rect.top  + rect.height/2)     + "px";
  document.body.appendChild(el);
  el.addEventListener("animationend", () => el.remove());
}

function showPhaseBanner(text, extra) {
  const el = document.createElement("div");
  el.className   = "phase-banner " + (extra||"");
  el.textContent = text;
  document.body.appendChild(el);
  el.addEventListener("animationend", () => el.remove());
}

async function showBossIntro(boss) {
  const el = document.createElement("div");
  el.className = "boss-intro";
  el.innerHTML =
    `<div class="boss-sprite">${boss.sprite}</div>` +
    `<div class="boss-name">${boss.name}</div>` +
    `<div class="boss-sub">${boss.intro}</div>`;
  document.body.appendChild(el);
  await sleep(2200);
  el.remove();
}

// ── Skill / Item buttons ──────────────────────────────────────────────────────
function buildSkillButtons() {
  const bar = $("skills-bar");
  bar.innerHTML = "";
  G.skills.forEach(sk => {
    const btn = document.createElement("button");
    btn.className = "btn-action skill-btn";
    btn.id        = "skill-" + sk.id;
    btn.innerHTML =
      sk.name +
      `<small class="mp-cost">MP: ${sk.mpCost}</small>` +
      `<span class="skill-tooltip">${sk.desc}<br>${sk.hits>1?sk.hits+" уд · ":""}×${sk.dmgMult}</span>`;
    btn.addEventListener("click", () => useSkill(sk));
    bar.appendChild(btn);
  });
}

function buildItemButtons() {
  const bar = $("items-bar");
  bar.innerHTML = "";
  Object.entries(ITEMS).forEach(([key, item]) => {
    const count = G.inventory[key] || 0;
    const btn   = document.createElement("button");
    btn.className = "btn-action item-btn";
    btn.innerHTML = item.icon + " " + item.name + ` <small class="mp-cost">(${count})</small>`;
    btn.disabled  = count === 0;
    btn.addEventListener("click", () => useItem(key));
    bar.appendChild(btn);
  });
}

function setActionsEnabled(enabled) {
  $("action-bar").querySelectorAll("button:not(#continue-btn):not(#retreat-btn)").forEach(b => b.disabled = !enabled);
  if (enabled) {
    G.skills.forEach(s => {
      const b = $("skill-" + s.id);
      if (b) b.disabled = G.mp < s.mpCost;
    });
    Object.keys(ITEMS).forEach(key => {
      const count = G.inventory[key] || 0;
      $("items-bar").querySelectorAll(".item-btn").forEach(b => {
        if (b.textContent.includes(ITEMS[key].name)) b.disabled = count === 0;
      });
    });
  }
}

function hidePostBattleBar() {
  $("post-battle-bar").classList.add("hidden");
  $("main-action-group").classList.remove("hidden");
  $("skills-sep").classList.remove("hidden");
  $("skills-bar").classList.remove("hidden");
}

function showPostBattleBar() {
  $("post-battle-bar").classList.remove("hidden");
  $("main-action-group").classList.add("hidden");
  $("skills-sep").classList.add("hidden");
  $("skills-bar").classList.add("hidden");
  $("item-panel").classList.add("hidden");
}

// ── Damage calc ───────────────────────────────────────────────────────────────
function calcDamage(atk, def, mult) {
  if (!mult) mult = 1.0;
  const base     = Math.max(1, atk - def/2);
  const variance = rand(-Math.floor(base*0.15), Math.floor(base*0.15));
  return Math.max(1, Math.floor((base + variance) * mult));
}

function applyStatus(arr, type, turns) {
  const ex = arr.find(s => s.type === type);
  if (ex) ex.turns = Math.max(ex.turns, turns);
  else arr.push({ type, turns });
}

function tickStatuses(whose) {
  const arr    = whose==="player" ? G.statuses      : G.enemyStatuses;
  const target = whose==="player" ? G               : G.enemy;
  const spr    = whose==="player" ? $("player-sprite") : $("enemy-sprite");
  const msgs   = [];
  for (let i = arr.length-1; i >= 0; i--) {
    const st = arr[i];
    if (st.turns <= 0) { arr.splice(i,1); continue; }
    const tname = whose==="player" ? G.playerName : G.enemy.name;
    if (st.type === "burn" || st.type === "poison") {
      const dmg = Math.floor(target.maxHp * 0.05);
      target.hp = clamp(target.hp - dmg, 0, target.maxHp);
      msgs.push((st.type==="burn"?"🔥":"☠️") + " " + tname + " получает " + dmg + " урона от " + STATUS_RU[st.type] + "!");
      floatDmg(spr, "-"+dmg, "player-dmg");
    } else if (st.type === "regen") {
      const heal = Math.floor(target.maxHp * 0.06);
      target.hp  = clamp(target.hp + heal, 0, target.maxHp);
      msgs.push("💚 " + tname + " восстанавливает " + heal + " HP!");
      floatDmg(spr, "+"+heal, "heal-dmg");
    } else if (st.type === "drain") {
      const dmg = Math.floor(target.maxHp * 0.04);
      target.hp = clamp(target.hp - dmg, 0, target.maxHp);
      if (whose==="player") G.enemy.hp = clamp(G.enemy.hp + dmg, 0, G.enemy.maxHp);
      msgs.push("🩸 Высасывание: " + tname + " теряет " + dmg + " HP!");
      floatDmg(spr, "-"+dmg, "player-dmg");
    }
    st.turns--;
    if (st.turns <= 0) arr.splice(i,1);
  }
  msgs.forEach(m => log(m, "damage"));
}

// ── Player actions ────────────────────────────────────────────────────────────
async function doAttack() {
  if (!G.playerTurn || !G.inBattle) return;
  const stun = G.statuses.find(s => s.type==="stun");
  if (stun) {
    log("⚡ " + G.playerName + " оглушён и не может действовать!", "damage");
    stun.turns = 0; await endPlayerTurn(); return;
  }
  setActionsEnabled(false);
  $("item-panel").classList.add("hidden");
  const dmg  = calcDamage(G.atk, G.enemy.def);
  G.enemy.hp = clamp(G.enemy.hp - dmg, 0, G.enemy.maxHp);
  $("player-sprite").style.transform = "translateX(18px) scale(1.15)";
  await sleep(150);
  $("enemy-panel").classList.add("shake");
  $("player-sprite").style.transform = "";
  floatDmg($("enemy-sprite"), "-"+dmg, "enemy-dmg");
  log("⚔  " + G.playerName + " атакует и наносит " + dmg + " урона!", "player");
  await sleep(350);
  $("enemy-panel").classList.remove("shake");
  updateBattleHud();
  await checkEnemyDead();
}

async function useSkill(skill) {
  if (!G.playerTurn || !G.inBattle) return;
  const stun = G.statuses.find(s => s.type==="stun");
  if (stun) {
    log("⚡ " + G.playerName + " оглушён!", "damage");
    stun.turns = 0; await endPlayerTurn(); return;
  }
  if (G.mp < skill.mpCost) return;
  setActionsEnabled(false);
  $("item-panel").classList.add("hidden");
  G.mp         = clamp(G.mp - skill.mpCost, 0, G.maxMp);
  G.skillsUsed = (G.skillsUsed||0) + 1;
  updateQuestProgress("skills", 1);
  let totalDmg = 0;
  for (let i = 0; i < skill.hits; i++) {
    const dmg  = calcDamage(G.atk, G.enemy.def, skill.dmgMult);
    totalDmg  += dmg;
    G.enemy.hp = clamp(G.enemy.hp - dmg, 0, G.enemy.maxHp);
    $("player-sprite").style.transform = "translateX(22px) scale(1.2) rotate(-8deg)";
    await sleep(80);
    $("enemy-panel").classList.add("shake");
    $("player-sprite").style.transform = "";
    floatDmg($("enemy-sprite"), "-"+dmg, "skill-dmg");
    await sleep(skill.hits > 4 ? 80 : 150);
    $("enemy-panel").classList.remove("shake");
    if (G.enemy.hp <= 0) break;
  }
  log("✨ " + G.playerName + " применяет " + skill.name + "! (" + totalDmg + " урона)", "skill");
  if (skill.effect==="stun")   { applyStatus(G.enemyStatuses,"stun",  2); log("⚡ " + G.enemy.name + " оглушён!",   "skill"); }
  if (skill.effect==="burn")   { applyStatus(G.enemyStatuses,"burn",  3); log("🔥 " + G.enemy.name + " горит!",    "skill"); }
  if (skill.effect==="poison") { applyStatus(G.enemyStatuses,"poison",3); log("☠️ " + G.enemy.name + " отравлен!", "skill"); }
  updateBattleHud();
  await checkEnemyDead();
}

async function useItem(key) {
  if (!G.playerTurn || !G.inBattle) return;
  if ((G.inventory[key]||0) === 0) return;
  setActionsEnabled(false);
  $("item-panel").classList.add("hidden");
  G.inventory[key]--;
  const item = ITEMS[key];
  if (item.action === "heal") {
    const h = Math.min(item.value, G.maxHp - G.hp);
    G.hp    = clamp(G.hp + item.value, 0, G.maxHp);
    floatDmg($("player-sprite"), "+"+h, "heal-dmg");
    log("🧪 " + G.playerName + " выпивает Зелье здоровья. +" + h + " HP!", "heal");
  } else if (item.action === "mana") {
    const m = Math.min(item.value, G.maxMp - G.mp);
    G.mp    = clamp(G.mp + item.value, 0, G.maxMp);
    floatDmg($("player-sprite"), "+"+m+"MP", "heal-dmg");
    log("💎 " + G.playerName + " использует Кристалл маны. +" + m + " MP!", "heal");
  } else if (item.action === "elixir") {
    G.hp = clamp(G.hp + 120, 0, G.maxHp);
    G.mp = clamp(G.mp + 40,  0, G.maxMp);
    floatDmg($("player-sprite"), "+120HP", "heal-dmg");
    log("✨ " + G.playerName + " использует Эликсир! HP+120, MP+40!", "heal");
  }
  updateBattleHud();
  buildItemButtons();
  await sleep(200);
  await endPlayerTurn();
}

async function flee() {
  if (!G.playerTurn || !G.inBattle) return;
  if (G.enemy && G.enemy.isBoss) { log("❌ Невозможно бежать от босса!", "damage"); return; }
  setActionsEnabled(false);
  if (rand(1,10) <= 5) {
    log("🏃 " + G.playerName + " успешно убегает!", "system");
    await sleep(600);
    G.inBattle = false;
    G.hp = clamp(G.hp - Math.floor(G.maxHp * 0.05), 1, G.maxHp);
    showHub();
  } else {
    log("❌ Побег не удался! Враг наносит ответный удар!", "damage");
    await sleep(400);
    await endPlayerTurn();
  }
}

async function endPlayerTurn() {
  G.playerTurn = false;
  await sleep(300);
  showPhaseBanner("ХОД ВРАГА", "enemy-turn");
  await sleep(600);
  await enemyTurn();
}

async function startPlayerTurn() {
  G.playerTurn = true;
  showPhaseBanner("ВАШ ХОД");
  await sleep(200);
  setActionsEnabled(true);
  buildSkillButtons();
  buildItemButtons();
  updateBattleHud();
}

async function enemyTurn() {
  if (!G.inBattle || !G.enemy || G.enemy.hp <= 0) return;
  tickStatuses("enemy");
  updateBattleHud();
  if (G.enemy.hp <= 0) { await checkEnemyDead(); return; }

  const stunned = G.enemyStatuses.find(s => s.type==="stun");
  if (stunned) {
    log("⚡ " + G.enemy.name + " оглушён и пропускает ход!", "system");
    stunned.turns = 0;
    G.enemyStatuses = G.enemyStatuses.filter(s => s.turns>0);
    updateBattleHud();
    await sleep(500);
    await startPlayerTurn();
    return;
  }

  let acted = false;
  if (G.enemy.skills && G.enemy.skills.length>0 && G.enemy.mp>=10 && rand(1,10)<=4) {
    const skName = G.enemy.skills[rand(0, G.enemy.skills.length-1)];
    const sk     = ENEMY_SKILLS[skName];
    if (sk && G.enemy.mp >= sk.mpCost) {
      G.enemy.mp = clamp(G.enemy.mp - sk.mpCost, 0, G.enemy.maxMp);
      log(sk.msg.replace("{enemy}", G.enemy.name), "enemy");
      const dmg = calcDamage(G.enemy.atk, G.def, sk.dmgMult);
      G.hp = clamp(G.hp - dmg, 0, G.maxHp);
      $("enemy-sprite").style.transform = "translateX(-18px) scale(1.15)";
      await sleep(150);
      $("player-panel").classList.add("shake");
      $("enemy-sprite").style.transform = "";
      floatDmg($("player-sprite"), "-"+dmg, "player-dmg");
      log("💥 " + G.enemy.name + " – " + skName + " – " + dmg + " урона!", "damage");
      await sleep(350);
      $("player-panel").classList.remove("shake");
      if (sk.effect==="stun")   { applyStatus(G.statuses,"stun",  2); log("⚡ " + G.playerName + " оглушён!",   "damage"); }
      if (sk.effect==="burn")   { applyStatus(G.statuses,"burn",  3); log("🔥 " + G.playerName + " горит!",    "damage"); }
      if (sk.effect==="poison") { applyStatus(G.statuses,"poison",3); log("☠️ " + G.playerName + " отравлен!", "damage"); }
      if (sk.effect==="drain")  { applyStatus(G.statuses,"drain", 2); log("🩸 " + G.playerName + " высасывается!", "damage"); }
      acted = true;
    }
  }

  if (!acted) {
    const dmg = calcDamage(G.enemy.atk, G.def);
    G.hp = clamp(G.hp - dmg, 0, G.maxHp);
    $("enemy-sprite").style.transform = "translateX(-18px) scale(1.15)";
    await sleep(150);
    $("player-panel").classList.add("shake");
    $("enemy-sprite").style.transform = "";
    floatDmg($("player-sprite"), "-"+dmg, "player-dmg");
    log("⚔  " + G.enemy.name + " атакует " + G.playerName + " – " + dmg + " урона!", "enemy");
    await sleep(350);
    $("player-panel").classList.remove("shake");
  }

  updateBattleHud();
  if (G.hp <= 0) { await handlePlayerDead(); return; }
  tickStatuses("player");
  updateBattleHud();
  if (G.hp <= 0) { await handlePlayerDead(); return; }
  await sleep(300);
  await startPlayerTurn();
}

async function checkEnemyDead() {
  if (G.enemy.hp <= 0) await handleEnemyDead();
  else await endPlayerTurn();
}

async function handleEnemyDead() {
  G.inBattle = false;
  setActionsEnabled(false);
  log("💀 " + G.enemy.name + " повержен!", "system");
  await sleep(400);

  const wasBoss   = G.enemy.isBoss;
  const bossFloor = wasBoss ? G.floor : null;

  const xpGain  = G.enemy.xp;
  const colGain = G.enemy.col * G.floor * rand(1,3);
  G.xp  += xpGain;
  G.col += colGain;
  log("⭐ +" + xpGain + " XP!  💰 +" + colGain + " Col!", "system");

  G.mobsFelled = (G.mobsFelled||0) + 1;
  updateQuestProgress("kills", 1);
  if (wasBoss) {
    G.bossesDefeated = (G.bossesDefeated||0) + 1;
    updateQuestProgress("boss", bossFloor);
    updateQuestProgress("bosses", 1);
  }

  if (G.enemy.loot) {
    G.enemy.loot.forEach(l => {
      if (Math.random() < l.chance) {
        G.inventory[l.item] = (G.inventory[l.item]||0) + 1;
        const it = ITEMS[l.item];
        log("🎁 Получено: " + (it?it.icon+" "+it.name:l.item) + "!", "system");
      }
    });
  }

  // Level up loop
  while (G.xp >= G.xpNext) {
    G.xp    -= G.xpNext;
    G.level++;
    G.xpNext = xpToNextLevel(G.level);
    const prevMaxHp = G.maxHp;
    const prevMaxMp = G.maxMp;
    recomputeStats();
    G.hp = clamp(G.hp + (G.maxHp - prevMaxHp) + 30, 0, G.maxHp);
    G.mp = clamp(G.mp + (G.maxMp - prevMaxMp) + 10, 0, G.maxMp);
    const newSkills = SWORD_SKILLS.filter(s => s.unlockedAt===G.level && !G.skills.find(x=>x.id===s.id));
    newSkills.forEach(s => { G.skills.push(s); log("🌟 Новый навык: " + s.name + "!", "system"); });
    log("🎉 ПОВЫШЕНИЕ УРОВНЯ! " + G.playerName + " достиг Ур." + G.level + "!", "system");
    showLevelUpToast(G.level);
    updateQuestProgress("floor", G.floor);
  }

  checkTrophies();
  updateBattleHud();
  $("xp-fill").style.width  = clamp(G.xp/G.xpNext*100,0,100) + "%";
  $("xp-text").textContent  = G.xp + " / " + G.xpNext + " XP";
  $("floor-label").textContent = "Аинкрад – Этаж " + G.floor;
  $("level-label").textContent = "Ур." + G.level;
  await sleep(600);

  if (wasBoss) {
    await saveCharacter();
    await handleFloorClear();
  } else {
    G.battlesOnFloor++;
    showPostBattleBar();
    await saveCharacter();
  }
}

function showLevelUpToast(lv) {
  const el = $("levelup-toast");
  el.textContent = "🎉 УРОВЕНЬ " + lv + "!";
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 2500);
}

async function handleFloorClear() {
  if (G.floor >= 10) {
    $("vic-msg").textContent = "Поздравляем, " + G.playerName + "! Вы прошли все 10 этажей Аинкрада и победили Хитклиффа. Смертельная игра окончена. Вы свободны!";
    showScreen("victory-screen");
    return;
  }
  const hpR = Math.floor(G.maxHp * 0.5);
  const mpR = Math.floor(G.maxMp * 0.5);
  G.hp = clamp(G.hp + hpR, 0, G.maxHp);
  G.mp = clamp(G.mp + mpR, 0, G.maxMp);
  G.statuses = [];

  let dropMsg = "";
  const floorDrops = EQUIPMENT_ITEMS.filter(e => e.floor <= G.floor+1 && !G.equipment.owned.includes(e.id));
  if (floorDrops.length > 0) {
    const drop = floorDrops[rand(0, Math.min(2, floorDrops.length-1))];
    G.equipment.owned.push(drop.id);
    dropMsg = `<div class="reward-item"><span>${drop.icon} ${drop.name}</span><small>Снаряжение найдено!</small></div>`;
  }

  $("fc-title").textContent = "Этаж " + G.floor + " пройден!";
  $("fc-reward").innerHTML =
    `<div class="reward-row">` +
    `<div class="reward-item"><span>+${hpR}</span><small>HP восстановлено</small></div>` +
    `<div class="reward-item"><span>+${mpR}</span><small>MP восстановлено</small></div>` +
    dropMsg +
    `</div>` +
    `<p style="margin-top:12px;color:var(--text-dim);font-size:.9rem">Переход на этаж ${G.floor + 1}…</p>`;
  showScreen("floor-clear-screen");
}

function advanceFloor() {
  G.floor++;
  G.battlesOnFloor = 0;
  G.battlesNeeded  = 3 + Math.floor(G.floor / 3);
  G.enemy = null;
  updateQuestProgress("floor", G.floor);
  checkTrophies();
  saveCharacter();
  nextEncounter();
}

async function handlePlayerDead() {
  G.inBattle = false;
  setActionsEnabled(false);
  if ((G.inventory.revive_scroll||0) > 0) {
    G.inventory.revive_scroll--;
    G.hp = Math.floor(G.maxHp * 0.3);
    log("📜 Свиток возрождения использован! HP восстановлен!", "heal");
    await sleep(600);
    await startPlayerTurn();
    return;
  }
  log("💀 " + G.playerName + " пал в бою…", "damage");
  await sleep(800);
  $("go-msg").textContent = "Вы были повержены " + (G.enemy?G.enemy.name:"врагом") + " на Этаже " + G.floor + ". Ваш путь окончен.";
  await saveCharacter();
  showScreen("gameover-screen");
}

function toggleItemPanel() {
  $("item-panel").classList.toggle("hidden");
  buildItemButtons();
}

// ════════════════════════════════════════════════════════════════
//  EQUIPMENT SCREEN
// ════════════════════════════════════════════════════════════════
function showEquipScreen() {
  renderEquipScreen();
  showScreen("equip-screen");
}

function renderEquipScreen() {
  const slots = ["weapon", "armor", "accessory"];
  const slotIcons  = { weapon:"⚔️", armor:"🛡️", accessory:"💍" };
  const slotLabels = { weapon:"Оружие", armor:"Броня", accessory:"Аксессуар" };

  // Equipped slots
  const slotsEl = $("equip-slots");
  slotsEl.innerHTML = "";
  slots.forEach(slot => {
    const eid  = G.equipment.equipped[slot];
    const item = eid ? EQUIPMENT_ITEMS.find(e=>e.id===eid) : null;
    const card = document.createElement("div");
    card.className = "equip-slot-card";
    card.innerHTML =
      `<div class="slot-label">${slotLabels[slot]}</div>` +
      (item
        ? `<div class="equip-icon">${item.icon}</div><div class="equip-name">${item.name}</div><div class="equip-stats">ATK+${item.atk} DEF+${item.def}</div><button class="btn-secondary btn-sm unequip-btn" data-id="${item.id}">Снять</button>`
        : `<div class="equip-icon">${slotIcons[slot]}</div><div class="equip-name" style="color:#666">Пусто</div>`);
    const unequipBtn = card.querySelector(".unequip-btn");
    if (unequipBtn) {
      unequipBtn.addEventListener("click", e => {
        e.stopPropagation();
        G.equipment.equipped[slot] = null;
        recomputeStats();
        saveCharacter();
        renderEquipScreen();
      });
    }
    slotsEl.appendChild(card);
  });

  // Inventory of owned items
  const invEl = $("equip-inventory");
  invEl.innerHTML = "";
  G.equipment.owned.forEach(eid => {
    const item     = EQUIPMENT_ITEMS.find(e=>e.id===eid);
    if (!item) return;
    const isEq     = Object.values(G.equipment.equipped).includes(eid);
    const card     = document.createElement("div");
    card.className = "equip-inv-card" + (isEq ? " equipped" : "");
    card.innerHTML =
      `<span class="equip-icon">${item.icon}</span>` +
      `<span class="equip-name">${item.name}</span>` +
      `<span class="equip-stats">ATK+${item.atk} DEF+${item.def}</span>` +
      (isEq
        ? `<span style="color:#4f4;font-size:.8rem">Экипировано</span>`
        : `<button class="btn-primary btn-sm equip-btn">Экипировать</button>`);
    const btn = card.querySelector(".equip-btn");
    if (btn) {
      btn.addEventListener("click", () => {
        G.equipment.equipped[item.slot] = eid;
        recomputeStats();
        saveCharacter();
        renderEquipScreen();
      });
    }
    invEl.appendChild(card);
  });

  // Stats panel
  $("equip-stats-panel").innerHTML =
    `<div class="stat-row"><span>⚔️ Атака</span><span>${G.atk}</span></div>` +
    `<div class="stat-row"><span>🛡️ Защита</span><span>${G.def}</span></div>` +
    `<div class="stat-row"><span>❤️ Макс HP</span><span>${G.maxHp}</span></div>` +
    `<div class="stat-row"><span>💧 Макс MP</span><span>${G.maxMp}</span></div>` +
    `<div class="stat-row"><span>💨 Скорость</span><span>${G.spd}</span></div>`;
}

// ════════════════════════════════════════════════════════════════
//  ITEMS SCREEN
// ════════════════════════════════════════════════════════════════
function showItemsScreen() {
  renderItemsScreen();
  showScreen("items-screen");
}

function renderItemsScreen() {
  const el = $("items-list");
  el.innerHTML = "";
  Object.entries(ITEMS).forEach(([key, item]) => {
    const count = G.inventory[key] || 0;
    const row   = document.createElement("div");
    row.className = "item-row";
    row.style.cssText = "display:flex;align-items:center;gap:14px;padding:12px;border-bottom:1px solid #333;";
    row.innerHTML =
      `<span style="font-size:2rem">${item.icon}</span>` +
      `<div style="flex:1"><div style="color:#eee;font-weight:600">${item.name}</div><div style="color:#888;font-size:.85rem">${item.desc}</div></div>` +
      `<span style="color:#ffda6a;font-size:1.1rem">×${count}</span>`;
    el.appendChild(row);
  });
  if (!el.children.length) {
    el.innerHTML = `<p style="color:#888;text-align:center;padding:40px">Инвентарь пуст.</p>`;
  }
}

// ════════════════════════════════════════════════════════════════
//  QUEST SCREEN
// ════════════════════════════════════════════════════════════════
function showQuestScreen() {
  initQuestProgress();
  renderQuestScreen();
  showScreen("quest-screen");
}

function renderQuestScreen() {
  const el = $("quest-list");
  el.innerHTML = "";
  QUESTS.forEach(qDef => {
    const target = qDef.req.count || qDef.req.floor || 1;
    const q    = G.quests.find(x=>x.id===qDef.id) || { id:qDef.id, progress:0, completed:false, claimed:false };
    const pct  = Math.min(100, Math.floor((q.progress/target)*100));
    const row  = document.createElement("div");
    row.className = "quest-row";
    row.innerHTML =
      `<div class="quest-name">${qDef.name}</div>` +
      `<div class="quest-desc">${qDef.desc}</div>` +
      `<div class="quest-progress-bar"><div class="quest-progress-fill" style="width:${pct}%"></div></div>` +
      `<div class="quest-meta">` +
      `  <span>${q.progress} / ${target}</span>` +
      `  <span>Награда: ${qDef.reward.col} Col${qDef.reward.xp?" • "+qDef.reward.xp+" XP":""}</span>` +
      `</div>` +
      (q.completed && !q.claimed
        ? `<button class="btn-primary claim-btn">Получить награду</button>`
        : (q.claimed ? `<span class="quest-claimed">✅ Получено</span>` : ""));
    const claimBtn = row.querySelector(".claim-btn");
    if (claimBtn) claimBtn.addEventListener("click", () => claimQuest(qDef));
    el.appendChild(row);
  });
}

async function claimQuest(qDef) {
  const q = G.quests.find(x=>x.id===qDef.id);
  if (!q || !q.completed || q.claimed) return;
  q.claimed = true;
  G.col += qDef.reward.col;
  G.xp  += qDef.reward.xp || 0;
  log("🎁 Задание «" + qDef.name + "» выполнено! +" + qDef.reward.col + " Col!", "system");
  await saveCharacter();
  renderQuestScreen();
}

// ════════════════════════════════════════════════════════════════
//  PVP SCREEN
// ════════════════════════════════════════════════════════════════
let pvpOpponents = [];

function showPvpScreen() {
  loadPvpOpponents();
  showScreen("pvp-screen");
}

async function loadPvpOpponents() {
  $("pvp-list").innerHTML = `<p style="color:#888">Загрузка соперников…</p>`;
  try {
    const data = await apiGet("/api/players");
    pvpOpponents = (data || []).filter(p => p.id !== (G.charId || 0));
    renderPvpScreen();
  } catch {
    $("pvp-list").innerHTML = `<p style="color:#f44">Ошибка загрузки. Сервер недоступен.</p>`;
  }
}

function renderPvpScreen() {
  const el = $("pvp-list");
  el.innerHTML = "";
  if (!pvpOpponents.length) {
    el.innerHTML = `<p style="color:#888;text-align:center;padding:40px">Других игроков пока нет.</p>`;
    return;
  }
  pvpOpponents.forEach(p => {
    const row = document.createElement("div");
    row.className = "pvp-opponent-row";
    row.innerHTML =
      `<span class="pvp-icon">${p.class_icon||"⚔️"}</span>` +
      `<span class="pvp-name">${p.name}</span>` +
      `<span class="pvp-level">Ур.${p.level}</span>` +
      `<button class="btn-primary pvp-challenge-btn">Сразиться</button>`;
    row.querySelector(".pvp-challenge-btn").addEventListener("click", () => showPvpDetail(p));
    el.appendChild(row);
  });
}

function showPvpDetail(p) {
  $("pvp-detail-name").textContent    = p.name;
  $("pvp-detail-class").textContent   = (p.class_icon||"⚔️") + " Ур." + p.level;
  $("pvp-detail-stats").innerHTML =
    `HP: ${p.max_hp||"?"} | ATK: ${p.atk||"?"} | DEF: ${p.def||"?"}`;
  $("pvp-fight-btn").onclick = () => doPvpFight(p);
  $("pvp-detail-panel").classList.remove("hidden");
}

async function doPvpFight(opp) {
  $("pvp-fight-btn").disabled = true;
  $("pvp-result").textContent = "Бой идёт…";

  // Simulate combat
  let pHp = G.maxHp, oHp = opp.max_hp || 100;
  const pAtk = G.atk, pDef = G.def;
  const oAtk = opp.atk || 20, oDef = opp.def || 10;
  let winner = null;
  for (let i = 0; i < 50; i++) {
    if (i % 2 === 0) {
      oHp -= Math.max(1, Math.floor(pAtk - oDef/2) + rand(-3,3));
      if (oHp <= 0) { winner = "player"; break; }
    } else {
      pHp -= Math.max(1, Math.floor(oAtk - pDef/2) + rand(-3,3));
      if (pHp <= 0) { winner = "enemy"; break; }
    }
  }
  if (!winner) winner = pHp > oHp ? "player" : "enemy";

  try {
    await apiPost("/api/pvp", {
      defender_id: opp.id,
      winner:      winner === "player" ? "attacker" : "defender"
    });
  } catch {/* offline */ }

  if (winner === "player") {
    const colGain = rand(30, 80) * G.floor;
    G.col += colGain;
    G.pvpWins = (G.pvpWins||0) + 1;
    $("pvp-result").textContent = "✅ Победа! +" + colGain + " Col";
    await saveCharacter();
  } else {
    const colLoss = rand(10, 40);
    G.col = Math.max(0, G.col - colLoss);
    $("pvp-result").textContent = "❌ Поражение. -" + colLoss + " Col";
    await saveCharacter();
  }
  $("pvp-fight-btn").disabled = false;
}

// ════════════════════════════════════════════════════════════════
//  TROPHY SCREEN
// ════════════════════════════════════════════════════════════════
function showTrophyScreen() {
  checkTrophies();
  renderTrophyScreen();
  loadLeaderboard();
  showScreen("trophy-screen");
}

function renderTrophyScreen() {
  const el = $("trophy-list");
  el.innerHTML = "";
  TROPHIES.forEach(tr => {
    const earned = G.trophies.includes(tr.id);
    const card   = document.createElement("div");
    card.className = "trophy-card" + (earned ? " earned" : "");
    card.innerHTML =
      `<div class="trophy-icon">${earned ? tr.icon : "🔒"}</div>` +
      `<div class="trophy-name">${tr.name}</div>` +
      `<div class="trophy-desc">${tr.desc}</div>`;
    el.appendChild(card);
  });
}

async function loadLeaderboard() {
  $("leaderboard-list").innerHTML = `<p style="color:#888">Загрузка…</p>`;
  try {
    const data = await apiGet("/api/leaderboard");
    const el   = $("leaderboard-list");
    el.innerHTML = "";
    (data.leaderboard || []).forEach((p, i) => {
      const row = document.createElement("div");
      row.style.cssText = "display:flex;gap:12px;align-items:center;padding:8px 0;border-bottom:1px solid #333;";
      row.innerHTML =
        `<span style="color:#888;width:24px">${i+1}.</span>` +
        `<span style="flex:1;color:#eee">${p.name}</span>` +
        `<span style="color:#ffda6a">Ур.${p.level}</span>` +
        `<span style="color:#aaa">Этаж ${p.floor}</span>`;
      el.appendChild(row);
    });
    if (!el.children.length) el.innerHTML = `<p style="color:#888">Рейтинг пуст.</p>`;
  } catch {
    $("leaderboard-list").innerHTML = `<p style="color:#888">Недоступно.</p>`;
  }
}

// ════════════════════════════════════════════════════════════════
//  DONATE SCREEN
// ════════════════════════════════════════════════════════════════
function showDonateScreen() {
  renderDonateScreen();
  showScreen("donate-screen");
}

function renderDonateScreen() {
  // Gem packages
  const pkgEl = $("donate-packages");
  pkgEl.innerHTML = "";
  GEM_PACKAGES.forEach(pkg => {
    const card = document.createElement("div");
    card.className = "donate-pkg-card";
    card.innerHTML =
      `<div class="pkg-gems">💎 ${pkg.gems}</div>` +
      `<div class="pkg-name">${pkg.label}</div>` +
      `<div class="pkg-price">${pkg.price}</div>` +
      `<div class="pkg-bonus" style="color:#4f4;font-size:.8rem">${pkg.icon||""}</div>` +
      `<button class="btn-primary" style="margin-top:8px">Купить</button>`;
    card.querySelector("button").addEventListener("click", () => {
      G.gems += pkg.gems;
      saveCharacter();
      renderDonateScreen();
      alert("💎 Получено " + pkg.gems + " алмазов! (симуляция)");
    });
    pkgEl.appendChild(card);
  });

  // Gem items shop
  const itemEl = $("donate-items");
  itemEl.innerHTML = "";
  GEM_ITEMS.forEach(gi => {
    buyGemItemButton(itemEl, gi);
  });
  $("donate-gems-label").textContent = "💎 " + G.gems + " Алмазов";
}

function buyGemItemButton(container, gi) {
  const card = document.createElement("div");
  card.className = "donate-item-card";
  card.innerHTML =
    `<span class="donate-item-icon">${gi.icon}</span>` +
    `<span class="donate-item-name">${gi.name}</span>` +
    `<span class="donate-item-cost">💎 ${gi.cost}</span>` +
    `<button class="btn-primary buy-gem-btn">Купить</button>`;
  card.querySelector(".buy-gem-btn").addEventListener("click", () => buyGemItem(gi));
  container.appendChild(card);
}

async function buyGemItem(gi) {
  if (G.gems < gi.cost) { alert("Недостаточно алмазов!"); return; }
  G.gems -= gi.cost;
  G.inventory[gi.item] = (G.inventory[gi.item]||0) + (gi.qty||1);
  await saveCharacter();
  renderDonateScreen();
}

// ════════════════════════════════════════════════════════════════
//  BOOT / DOMContentLoaded
// ════════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", async () => {
  // Wire back buttons (all use class back-to-hub)
  document.querySelectorAll(".back-to-hub").forEach(btn =>
    btn.addEventListener("click", () => { showHub(); })
  );

  // Battle action buttons
  $("attack-btn").addEventListener("click",   doAttack);
  $("flee-btn").addEventListener("click",     flee);
  $("item-toggle-btn").addEventListener("click", toggleItemPanel);

  // Post-battle-bar buttons
  $("continue-btn").addEventListener("click",  () => {
    G.battlesOnFloor++;
    hidePostBattleBar();
    nextEncounter();
  });
  $("retreat-btn").addEventListener("click",   () => {
    G.battlesOnFloor = 0;
    showHub();
  });

  // Floor clear → advance
  $("next-floor-btn").addEventListener("click", advanceFloor);
  $("go-hub-btn").addEventListener("click",     () => { showHub(); });

  // Victory screen
  $("vic-hub-btn") && $("vic-hub-btn").addEventListener("click", () => {
    G.floor = 1;
    G.battlesOnFloor = 0;
    saveCharacter();
    showHub();
  });

  // Game over → retry / hub
  $("gameover-retry-btn") && $("gameover-retry-btn").addEventListener("click", () => {
    G.hp = Math.floor(G.maxHp * 0.25);
    G.mp = Math.floor(G.maxMp * 0.25);
    G.statuses = [];
    G.floor = Math.max(1, G.floor - 1);
    saveCharacter();
    showHub();
  });
  $("go-hub-btn-2") && $("go-hub-btn-2").addEventListener("click", () => { showHub(); });

  // NPC modal close
  $("npc-modal-close").addEventListener("click", () => {
    $("npc-modal").classList.add("hidden");
  });
  $("npc-modal").addEventListener("click", e => {
    if (e.target === $("npc-modal")) $("npc-modal").classList.add("hidden");
  });

  // Town back button
  document.querySelectorAll(".town-back-btn").forEach(btn =>
    btn.addEventListener("click", () => showHub())
  );

  // PvP detail close
  $("pvp-detail-close") && $("pvp-detail-close").addEventListener("click", () => {
    $("pvp-detail-panel") && $("pvp-detail-panel").classList.add("hidden");
  });

  // Auth screens
  setupAuthScreens();
  setupHubNav();

  // Try restore session
  const savedToken = localStorage.getItem("sao_token");
  if (savedToken) {
    const parts = atob(savedToken).split(":");
    AUTH.token    = savedToken;
    AUTH.userId   = parseInt(parts[0]);
    AUTH.username = parts[1];
    try {
      const me = await apiGet("/api/me");
      loadCharacterFromData(me.character);
      showHub();
      return;
    } catch {
      localStorage.removeItem("sao_token");
      AUTH = { token:null, userId:null, username:null };
    }
  }
  showScreen("login-screen");
});

/* =====================================================
   SWORD ART ONLINE – Web RPG  |  Game Logic
   ===================================================== */
"use strict";

// ── Utility ───────────────────────────────────────────
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Enemy definitions (by floor set) ─────────────────
const ENEMY_POOL = [
  // Floor 1-2
  {
    name: "Frenzy Boar",   sprite: "🐗",
    hp: 60, mp: 0, atk: 12, def: 5, spd: 8,
    xp: 18, col: 1, isBoss: false,
    skills: [],
    loot: [{item:"health_potion", chance:.3}],
  },
  {
    name: "Forest Ruin Wolf", sprite: "🐺",
    hp: 80, mp: 20, atk: 16, def: 6, spd: 12,
    xp: 25, col: 1, isBoss: false,
    skills: ["Feral Bite"],
    loot: [{item:"health_potion", chance:.25}],
  },
  // Floor 3-4
  {
    name: "Skeleton Soldier", sprite: "💀",
    hp: 100, mp: 30, atk: 20, def: 10, spd: 10,
    xp: 35, col: 3, isBoss: false,
    skills: ["Bone Crush"],
    loot: [{item:"mana_crystal", chance:.3}],
  },
  {
    name: "Dark Elf Archer", sprite: "🧝",
    hp: 90, mp: 40, atk: 24, def: 8, spd: 16,
    xp: 40, col: 3, isBoss: false,
    skills: ["Poison Arrow"],
    loot: [{item:"health_potion", chance:.2},{item:"mana_crystal", chance:.2}],
  },
  // Floor 5-6
  {
    name: "Lizardman",      sprite: "🦎",
    hp: 130, mp: 20, atk: 28, def: 14, spd: 11,
    xp: 55, col: 5, isBoss: false,
    skills: ["Tail Whip"],
    loot: [{item:"health_potion", chance:.3}],
  },
  {
    name: "Cursed Spirit",  sprite: "👻",
    hp: 110, mp: 60, atk: 26, def: 10, spd: 18,
    xp: 58, col: 5, isBoss: false,
    skills: ["Soul Drain"],
    loot: [{item:"mana_crystal", chance:.35}],
  },
  // Floor 7-8
  {
    name: "Minotaur Warrior", sprite: "🐃",
    hp: 160, mp: 0, atk: 34, def: 18, spd: 9,
    xp: 75, col: 7, isBoss: false,
    skills: ["Charge"],
    loot: [{item:"health_potion", chance:.4}],
  },
  {
    name: "Shadow Assassin", sprite: "🥷",
    hp: 120, mp: 50, atk: 38, def: 12, spd: 22,
    xp: 80, col: 7, isBoss: false,
    skills: ["Shadow Step","Feral Bite"],
    loot: [{item:"elixir", chance:.15}],
  },
  // Floor 9-10
  {
    name: "Obsidian Knight", sprite: "🤺",
    hp: 200, mp: 60, atk: 42, def: 22, spd: 12,
    xp: 110, col: 9, isBoss: false,
    skills: ["Bone Crush","Charge"],
    loot: [{item:"elixir", chance:.2}],
  },
];

const BOSSES = [
  {
    name: "Illfang the Kobold Lord", sprite: "👹", floor: 1,
    hp: 320, mp: 60, atk: 28, def: 14, spd: 10,
    xp: 250, isBoss: true,
    skills: ["Rune Blade","Tailswipe"],
    intro: "FLOOR 1 BOSS",
    loot: [],
  },
  {
    name: "Asterius the Taurus King", sprite: "🦬", floor: 3,
    hp: 480, mp: 80, atk: 36, def: 18, spd: 13,
    xp: 400, isBoss: true,
    skills: ["Charge","Bone Crush","Rune Blade"],
    intro: "FLOOR 3 BOSS",
    loot: [],
  },
  {
    name: "Nerius the Evil Treant", sprite: "🌲", floor: 5,
    hp: 620, mp: 100, atk: 44, def: 22, spd: 8,
    xp: 600, isBoss: true,
    skills: ["Poison Arrow","Soul Drain","Tailswipe"],
    intro: "FLOOR 5 BOSS",
    loot: [],
  },
  {
    name: "The Gleam Eyes", sprite: "😈", floor: 7,
    hp: 800, mp: 120, atk: 52, def: 26, spd: 16,
    xp: 900, isBoss: true,
    skills: ["Rune Blade","Charge","Shadow Step","Soul Drain"],
    intro: "FLOOR 7 BOSS",
    loot: [],
  },
  {
    name: "Heathcliff (Akihiko Kayaba)", sprite: "⚔️", floor: 9,
    hp: 1200, mp: 200, atk: 68, def: 35, spd: 20,
    xp: 2000, isBoss: true,
    skills: ["Rune Blade","Charge","Soul Drain","Shadow Step","Bone Crush"],
    intro: "FINAL BOSS – FLOOR 10",
    loot: [],
  },
];

// Enemy skills
const ENEMY_SKILLS = {
  "Feral Bite":   { dmgMult: 1.5, effect: null,    mpCost: 10, msg: "{enemy} bites savagely!" },
  "Bone Crush":   { dmgMult: 1.8, effect: "stun",  mpCost: 15, msg: "{enemy} smashes with crushing force!" },
  "Poison Arrow": { dmgMult: 1.2, effect: "poison", mpCost: 12, msg: "{enemy} fires a poisoned arrow!" },
  "Tail Whip":    { dmgMult: 1.6, effect: null,    mpCost: 10, msg: "{enemy} lashes with its tail!" },
  "Soul Drain":   { dmgMult: 1.3, effect: "drain",  mpCost: 20, msg: "{enemy} drains your life force!" },
  "Charge":       { dmgMult: 2.0, effect: null,    mpCost: 15, msg: "{enemy} charges with full force!" },
  "Shadow Step":  { dmgMult: 1.7, effect: null,    mpCost: 18, msg: "{enemy} vanishes and strikes from the shadows!" },
  "Tailswipe":    { dmgMult: 1.9, effect: "stun",  mpCost: 20, msg: "{enemy} sweeps with a massive tail!" },
  "Rune Blade":   { dmgMult: 2.2, effect: "burn",  mpCost: 25, msg: "{enemy} strikes with a glowing rune blade!" },
};

// Player sword skills
const SWORD_SKILLS = [
  {
    id: "horizontal",
    name: "Horizontal",
    mpCost: 15,
    dmgMult: 1.6,
    hits: 1,
    effect: null,
    desc: "A swift horizontal slash.",
    unlockedAt: 1,
  },
  {
    id: "sonic_leap",
    name: "Sonic Leap",
    mpCost: 20,
    dmgMult: 2.0,
    hits: 1,
    effect: null,
    desc: "Leap forward with blinding speed.",
    unlockedAt: 3,
  },
  {
    id: "vertical_arc",
    name: "Vertical Arc",
    mpCost: 18,
    dmgMult: 1.4,
    hits: 2,
    effect: null,
    desc: "Two rapid vertical cuts.",
    unlockedAt: 5,
  },
  {
    id: "vorpal_strike",
    name: "Vorpal Strike",
    mpCost: 30,
    dmgMult: 2.6,
    hits: 1,
    effect: "stun",
    desc: "A piercing thrust that may stun.",
    unlockedAt: 7,
  },
  {
    id: "eclipse",
    name: "Eclipse",
    mpCost: 35,
    dmgMult: 1.5,
    hits: 3,
    effect: "burn",
    desc: "Triple slash, burning enemy.",
    unlockedAt: 9,
  },
  {
    id: "starburst_stream",
    name: "Starburst Stream",
    mpCost: 80,
    dmgMult: 1.2,
    hits: 16,
    effect: null,
    desc: "Kirito's legendary 16-hit combo!",
    unlockedAt: 10,
  },
];

// Items
const ITEMS = {
  health_potion: { name: "Health Potion", icon: "🧪", desc: "Restore 80 HP",  action: "heal",     value: 80  },
  mana_crystal:  { name: "Mana Crystal",  icon: "💎", desc: "Restore 50 MP",  action: "mana",     value: 50  },
  elixir:        { name: "Elixir",        icon: "✨", desc: "Restore 120 HP + 40 MP", action: "elixir", value: 0 },
};

// ── Level table ───────────────────────────────────────
function xpToNextLevel(level) {
  return Math.floor(50 * Math.pow(1.45, level - 1));
}

// Player stat growth per level
function playerStatsAtLevel(level) {
  return {
    maxHp: 120 + (level - 1) * 22,
    maxMp: 60  + (level - 1) * 12,
    atk:   20  + (level - 1) * 5,
    def:   10  + (level - 1) * 3,
    spd:   15  + (level - 1) * 2,
  };
}

// ── State ─────────────────────────────────────────────
let G = {};   // game state

function initGame(playerName) {
  const stats = playerStatsAtLevel(1);
  G = {
    playerName,
    level: 1,
    xp: 0,
    xpNext: xpToNextLevel(1),
    ...stats,
    hp: stats.maxHp,
    mp: stats.maxMp,
    floor: 1,
    battlesOnFloor: 0,
    battlesNeeded: 3,   // normal battles before boss
    statuses: [],       // [{type, turns}]
    inventory: {
      health_potion: 3,
      mana_crystal:  2,
      elixir:        0,
    },
    inBattle: false,
    playerTurn: true,
    enemy: null,
    enemyStatuses: [],
    skills: SWORD_SKILLS.filter(s => s.unlockedAt <= 1),
  };
}

// ── DOM refs ──────────────────────────────────────────
const $ = id => document.getElementById(id);
const screens = {};
const dom = {};

function cacheDom() {
  screens.title      = $("title-screen");
  screens.game       = $("game-screen");
  screens.victory    = $("victory-screen");
  screens.gameOver   = $("gameover-screen");
  screens.floorClear = $("floor-clear-screen");

  dom.nameInput  = $("name-input");
  dom.startBtn   = $("start-btn");

  dom.floorLabel   = $("floor-label");
  dom.levelLabel   = $("level-label");
  dom.xpFill       = $("xp-fill");
  dom.xpText       = $("xp-text");

  dom.playerName   = $("player-name");
  dom.playerSprite = $("player-sprite");
  dom.playerHpFill = $("player-hp-fill");
  dom.playerHpVal  = $("player-hp-val");
  dom.playerMpFill = $("player-mp-fill");
  dom.playerMpVal  = $("player-mp-val");
  dom.playerStatus = $("player-status");
  dom.playerPanel  = $("player-panel");

  dom.enemyName    = $("enemy-name");
  dom.enemySprite  = $("enemy-sprite");
  dom.enemyHpFill  = $("enemy-hp-fill");
  dom.enemyHpVal   = $("enemy-hp-val");
  dom.enemyMpFill  = $("enemy-mp-fill");
  dom.enemyMpVal   = $("enemy-mp-val");
  dom.enemyStatus  = $("enemy-status");
  dom.enemyPanel   = $("enemy-panel");

  dom.battleLog  = $("battle-log");
  dom.actionBar  = $("action-bar");
  dom.skillsBar  = $("skills-bar");
  dom.itemPanel  = $("item-panel");
  dom.itemsBar   = $("items-bar");

  dom.attackBtn  = $("attack-btn");
  dom.itemsBtn   = $("items-btn");
  dom.fleeBtn    = $("flee-btn");

  // result screens
  dom.fcFloor   = $("fc-floor");
  dom.fcReward  = $("fc-reward");
  dom.fcNextBtn = $("fc-next-btn");
  dom.goMsg     = $("go-msg");
  dom.goRetryBtn = $("go-retry-btn");
  dom.vicMsg    = $("vic-msg");
}

// ── Screen helpers ────────────────────────────────────
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.add("hidden"));
  screens[name].classList.remove("hidden");
}

// ── HUD update ────────────────────────────────────────
function updateHud() {
  dom.floorLabel.textContent = `Aincrad – Floor ${G.floor}`;
  dom.levelLabel.textContent = `Lv.${G.level}`;
  dom.xpFill.style.width     = `${(G.xp / G.xpNext) * 100}%`;
  dom.xpText.textContent     = `${G.xp} / ${G.xpNext} XP`;

  dom.playerName.textContent = G.playerName;
  updateBar(dom.playerHpFill, dom.playerHpVal, G.hp, G.maxHp, "hp");
  updateBar(dom.playerMpFill, dom.playerMpVal, G.mp, G.maxMp, "mp");
  renderStatuses(dom.playerStatus, G.statuses);

  if (G.enemy) {
    dom.enemyName.textContent = G.enemy.name;
    dom.enemySprite.textContent = G.enemy.sprite;
    updateBar(dom.enemyHpFill, dom.enemyHpVal, G.enemy.hp, G.enemy.maxHp, "hp");
    updateBar(dom.enemyMpFill, dom.enemyMpVal, G.enemy.mp, G.enemy.maxMp, "mp");
    renderStatuses(dom.enemyStatus, G.enemyStatuses);
  }
}

function updateBar(fillEl, valEl, cur, max, type) {
  const pct = Math.max(0, (cur / max) * 100);
  fillEl.style.width = `${pct}%`;
  if (type === "hp" && pct < 25) { fillEl.style.background = "var(--red)"; }
  else if (type === "hp" && pct < 50) { fillEl.style.background = "#e0a030"; }
  else if (!fillEl.classList.contains("mp")) { fillEl.style.background = ""; }
  valEl.textContent = `${Math.max(0,cur)} / ${max}`;
}

function renderStatuses(el, statuses) {
  el.innerHTML = statuses
    .filter(s => s.turns > 0)
    .map(s => `<span class="status-tag ${s.type}">${STATUS_ICONS[s.type] || ""}${s.type} (${s.turns})</span>`)
    .join("");
}

const STATUS_ICONS = { burn:"🔥", poison:"☠️", stun:"⚡", regen:"💚", drain:"🩸" };

// ── Battle log ────────────────────────────────────────
function log(msg, cls = "system") {
  const el = document.createElement("div");
  el.className = `log-entry ${cls}`;
  el.textContent = msg;
  dom.battleLog.appendChild(el);
  dom.battleLog.scrollTop = dom.battleLog.scrollHeight;
  // keep log manageable
  while (dom.battleLog.children.length > 80) {
    dom.battleLog.removeChild(dom.battleLog.firstChild);
  }
}

// ── Skill buttons ─────────────────────────────────────
function buildSkillButtons() {
  dom.skillsBar.innerHTML = "";
  G.skills.forEach(skill => {
    const btn = document.createElement("button");
    btn.className = "btn-action skill-btn";
    btn.id = `skill-${skill.id}`;
    btn.innerHTML = `${skill.name}<small class="mp-cost">MP: ${skill.mpCost}</small>
      <span class="skill-tooltip">${skill.desc}<br>${skill.hits > 1 ? `${skill.hits} hits · ` : ""}×${skill.dmgMult} dmg</span>`;
    btn.addEventListener("click", () => useSkill(skill));
    dom.skillsBar.appendChild(btn);
  });
}

function buildItemButtons() {
  dom.itemsBar.innerHTML = "";
  Object.entries(ITEMS).forEach(([key, item]) => {
    const count = G.inventory[key] || 0;
    const btn = document.createElement("button");
    btn.className = "btn-action item-btn";
    btn.innerHTML = `${item.icon} ${item.name} <small class="mp-cost">(${count})</small>`;
    btn.disabled = count === 0;
    btn.addEventListener("click", () => useItem(key));
    dom.itemsBar.appendChild(btn);
  });
}

// ── Floating damage numbers ───────────────────────────
function floatDmg(targetEl, text, cls) {
  const rect = targetEl.getBoundingClientRect();
  const el = document.createElement("div");
  el.className = `dmg-float ${cls}`;
  el.textContent = text;
  el.style.left = `${rect.left + rect.width / 2 - 20}px`;
  el.style.top  = `${rect.top  + rect.height / 2}px`;
  document.body.appendChild(el);
  el.addEventListener("animationend", () => el.remove());
}

// ── Phase banner ─────────────────────────────────────
function showPhaseBanner(text, extra = "") {
  const el = document.createElement("div");
  el.className = `phase-banner ${extra}`;
  el.textContent = text;
  document.body.appendChild(el);
  el.addEventListener("animationend", () => el.remove());
}

// ── Boss intro ────────────────────────────────────────
async function showBossIntro(boss) {
  const el = document.createElement("div");
  el.className = "boss-intro";
  el.innerHTML = `
    <div class="boss-sprite">${boss.sprite}</div>
    <div class="boss-name">${boss.name}</div>
    <div class="boss-sub">${boss.intro}</div>
  `;
  document.body.appendChild(el);
  await sleep(2200);
  el.remove();
}

// ── Start battle ──────────────────────────────────────
async function startBattle(enemyTemplate, isBoss) {
  G.inBattle = true;
  G.playerTurn = true;
  G.enemyStatuses = [];

  // deep copy enemy
  G.enemy = {
    ...enemyTemplate,
    maxHp: enemyTemplate.hp,
    maxMp: enemyTemplate.mp || 0,
    hp: enemyTemplate.hp,
    mp: enemyTemplate.mp || 0,
    isBoss: !!isBoss,
  };

  if (isBoss) {
    await showBossIntro(G.enemy);
  }

  showScreen("game");
  setActionsEnabled(true);
  buildSkillButtons();
  buildItemButtons();
  updateHud();

  log(`⚔  Battle begins! You face ${G.enemy.name}!`, "system");
  showPhaseBanner("YOUR TURN");
}

// ── Pick next encounter ───────────────────────────────
function pickEnemy() {
  const floor = G.floor;
  // Is it a boss fight?
  if (G.battlesOnFloor >= G.battlesNeeded) {
    const boss = BOSSES.find(b => b.floor === Math.min(floor, 9));
    return { template: boss, isBoss: true };
  }
  // Normal enemy
  const pool = ENEMY_POOL.filter(e => e.col <= floor);
  const e = pool[rand(0, pool.length - 1)];
  // scale HP/ATK slightly per floor
  const scale = 1 + (floor - e.col) * 0.15;
  return {
    template: {
      ...e,
      hp: Math.floor(e.hp * scale),
      atk: Math.floor(e.atk * scale),
    },
    isBoss: false,
  };
}

// ── Actions enabled/disabled ──────────────────────────
function setActionsEnabled(enabled) {
  const btns = dom.actionBar.querySelectorAll("button");
  btns.forEach(b => (b.disabled = !enabled));
  if (enabled) {
    // re-disable skills based on MP
    G.skills.forEach(s => {
      const btn = $(`skill-${s.id}`);
      if (btn) btn.disabled = G.mp < s.mpCost;
    });
    // re-disable items
    Object.keys(ITEMS).forEach(key => {
      const count = G.inventory[key] || 0;
      const btns = dom.itemsBar.querySelectorAll(".item-btn");
      btns.forEach(b => {
        if (b.textContent.includes(ITEMS[key].name)) b.disabled = count === 0;
      });
    });
  }
}

// ── Compute damage ────────────────────────────────────
function calcDamage(atk, def, mult = 1.0) {
  const base = Math.max(1, atk - def / 2);
  const variance = rand(-Math.floor(base * 0.15), Math.floor(base * 0.15));
  return Math.max(1, Math.floor((base + variance) * mult));
}

// ── Apply status ──────────────────────────────────────
function applyStatus(statusArr, type, turns) {
  const existing = statusArr.find(s => s.type === type);
  if (existing) { existing.turns = Math.max(existing.turns, turns); }
  else { statusArr.push({ type, turns }); }
}

// ── Process statuses (tick) ───────────────────────────
function tickStatuses(whose) {
  // whose = "player" | "enemy"
  const statusArr = whose === "player" ? G.statuses : G.enemyStatuses;
  const target    = whose === "player" ? G : G.enemy;
  const panel     = whose === "player" ? dom.playerPanel : dom.enemyPanel;
  const spriteEl  = whose === "player" ? dom.playerSprite : dom.enemySprite;
  let msgs = [];

  for (let i = statusArr.length - 1; i >= 0; i--) {
    const st = statusArr[i];
    if (st.turns <= 0) { statusArr.splice(i, 1); continue; }

    switch (st.type) {
      case "burn":
      case "poison": {
        const dmg = Math.floor(target.maxHp * 0.05);
        target.hp = clamp(target.hp - dmg, 0, target.maxHp);
        msgs.push(`${st.type === "burn" ? "🔥" : "☠️"} ${whose === "player" ? G.playerName : G.enemy.name} takes ${dmg} ${st.type} damage!`);
        floatDmg(spriteEl, `-${dmg}`, "player-dmg");
        break;
      }
      case "regen": {
        const heal = Math.floor(target.maxHp * 0.06);
        target.hp = clamp(target.hp + heal, 0, target.maxHp);
        msgs.push(`💚 ${whose === "player" ? G.playerName : G.enemy.name} regenerates ${heal} HP!`);
        floatDmg(spriteEl, `+${heal}`, "heal-dmg");
        break;
      }
      case "drain": {
        const dmg = Math.floor(target.maxHp * 0.04);
        target.hp = clamp(target.hp - dmg, 0, target.maxHp);
        if (whose === "player") {
          G.enemy.hp = clamp(G.enemy.hp + dmg, 0, G.enemy.maxHp);
        }
        msgs.push(`🩸 Drain: ${whose === "player" ? G.playerName : G.enemy.name} loses ${dmg} HP!`);
        floatDmg(spriteEl, `-${dmg}`, "player-dmg");
        break;
      }
    }
    st.turns--;
    if (st.turns <= 0) statusArr.splice(i, 1);
  }
  msgs.forEach(m => log(m, "damage"));
}

// ── Player: basic attack ──────────────────────────────
async function doAttack() {
  if (!G.playerTurn || !G.inBattle) return;
  setActionsEnabled(false);
  dom.itemPanel.classList.add("hidden");

  const dmg = calcDamage(G.atk, G.enemy.def);
  G.enemy.hp = clamp(G.enemy.hp - dmg, 0, G.enemy.maxHp);

  // animate
  dom.playerSprite.style.transform = "translateX(18px) scale(1.15)";
  await sleep(150);
  dom.enemyPanel.classList.add("shake");
  dom.playerSprite.style.transform = "";
  floatDmg(dom.enemySprite, `-${dmg}`, "enemy-dmg");
  log(`⚔  ${G.playerName} attacks for ${dmg} damage!`, "player");

  await sleep(350);
  dom.enemyPanel.classList.remove("shake");

  updateHud();
  await checkEnemyDead();
}

// ── Player: use sword skill ───────────────────────────
async function useSkill(skill) {
  if (!G.playerTurn || !G.inBattle) return;

  // check stun before MP consumption
  const stun = G.statuses.find(s => s.type === "stun");
  if (stun) {
    log(`⚡ ${G.playerName} is stunned and cannot act!`, "damage");
    stun.turns = 0;
    await endPlayerTurn();
    return;
  }

  if (G.mp < skill.mpCost) return;

  setActionsEnabled(false);
  dom.itemPanel.classList.add("hidden");

  G.mp = clamp(G.mp - skill.mpCost, 0, G.maxMp);

  let totalDmg = 0;
  for (let i = 0; i < skill.hits; i++) {
    const dmg = calcDamage(G.atk, G.enemy.def, skill.dmgMult);
    totalDmg += dmg;
    G.enemy.hp = clamp(G.enemy.hp - dmg, 0, G.enemy.maxHp);

    dom.playerSprite.style.transform = "translateX(22px) scale(1.2) rotate(-8deg)";
    await sleep(80);
    dom.enemyPanel.classList.add("shake");
    dom.playerSprite.style.transform = "";
    floatDmg(dom.enemySprite, `-${dmg}`, "skill-dmg");
    await sleep(skill.hits > 4 ? 80 : 150);
    dom.enemyPanel.classList.remove("shake");

    if (G.enemy.hp <= 0) break;
  }

  log(`✨ ${G.playerName} uses ${skill.name}! (${totalDmg} total damage)`, "skill");

  if (skill.effect === "stun")  { applyStatus(G.enemyStatuses, "stun",   2); log(`⚡ ${G.enemy.name} is stunned!`,  "skill"); }
  if (skill.effect === "burn")  { applyStatus(G.enemyStatuses, "burn",   3); log(`🔥 ${G.enemy.name} is burning!`, "skill"); }
  if (skill.effect === "poison"){ applyStatus(G.enemyStatuses, "poison", 3); log(`☠️ ${G.enemy.name} is poisoned!`, "skill"); }

  updateHud();
  await checkEnemyDead();
}

// ── Player: use item ──────────────────────────────────
async function useItem(key) {
  if (!G.playerTurn || !G.inBattle) return;
  if ((G.inventory[key] || 0) === 0) return;

  setActionsEnabled(false);
  dom.itemPanel.classList.add("hidden");

  G.inventory[key]--;
  const item = ITEMS[key];

  if (item.action === "heal") {
    const h = Math.min(item.value, G.maxHp - G.hp);
    G.hp = clamp(G.hp + item.value, 0, G.maxHp);
    floatDmg(dom.playerSprite, `+${h}`, "heal-dmg");
    log(`🧪 ${G.playerName} drinks a Health Potion. +${h} HP!`, "heal");
  } else if (item.action === "mana") {
    const m = Math.min(item.value, G.maxMp - G.mp);
    G.mp = clamp(G.mp + item.value, 0, G.maxMp);
    floatDmg(dom.playerSprite, `+${m}MP`, "heal-dmg");
    log(`💎 ${G.playerName} uses a Mana Crystal. +${m} MP!`, "heal");
  } else if (item.action === "elixir") {
    G.hp = clamp(G.hp + 120, 0, G.maxHp);
    G.mp = clamp(G.mp + 40,  0, G.maxMp);
    floatDmg(dom.playerSprite, "+120HP", "heal-dmg");
    log(`✨ ${G.playerName} uses an Elixir! HP +120, MP +40!`, "heal");
  }

  updateHud();
  buildItemButtons();
  await sleep(200);
  await endPlayerTurn();
}

// ── Player: flee ──────────────────────────────────────
async function flee() {
  if (!G.playerTurn || !G.inBattle) return;
  if (G.enemy && G.enemy.isBoss) {
    log("❌ You cannot flee from a boss battle!", "damage");
    return;
  }
  setActionsEnabled(false);
  const success = rand(1, 10) <= 5;
  if (success) {
    log(`🏃 ${G.playerName} fled successfully!`, "system");
    await sleep(600);
    G.inBattle = false;
    // small HP penalty for fleeing
    G.hp = clamp(G.hp - Math.floor(G.maxHp * 0.05), 1, G.maxHp);
    nextEncounter();
  } else {
    log(`❌ Couldn't escape! The enemy strikes back!`, "damage");
    await sleep(400);
    await endPlayerTurn();
  }
}

// ── End player turn → enemy turn ─────────────────────
async function endPlayerTurn() {
  G.playerTurn = false;
  await sleep(300);
  showPhaseBanner("ENEMY TURN", "enemy-turn");
  await sleep(600);
  await enemyTurn();
}

// ── Enemy turn ────────────────────────────────────────
async function enemyTurn() {
  if (!G.inBattle || !G.enemy || G.enemy.hp <= 0) return;

  // Tick enemy statuses
  tickStatuses("enemy");
  updateHud();
  if (G.enemy.hp <= 0) { await checkEnemyDead(); return; }

  // Check stun
  const stunned = G.enemyStatuses.find(s => s.type === "stun");
  if (stunned) {
    log(`⚡ ${G.enemy.name} is stunned and loses its turn!`, "system");
    stunned.turns = 0;
    G.enemyStatuses = G.enemyStatuses.filter(s => s.turns > 0);
    updateHud();
    await sleep(500);
    await startPlayerTurn();
    return;
  }

  // Decide action: skill or basic attack
  let acted = false;
  if (G.enemy.skills && G.enemy.skills.length > 0 && G.enemy.mp >= 10 && rand(1,10) <= 4) {
    // use a random skill
    const skillName = G.enemy.skills[rand(0, G.enemy.skills.length - 1)];
    const sk = ENEMY_SKILLS[skillName];
    if (sk && G.enemy.mp >= sk.mpCost) {
      G.enemy.mp = clamp(G.enemy.mp - sk.mpCost, 0, G.enemy.maxMp);
      const msg = sk.msg.replace("{enemy}", G.enemy.name);
      log(msg, "enemy");

      const dmg = calcDamage(G.enemy.atk, G.def, sk.dmgMult);
      G.hp = clamp(G.hp - dmg, 0, G.maxHp);

      dom.enemySprite.style.transform = "translateX(-18px) scale(1.15)";
      await sleep(150);
      dom.playerPanel.classList.add("shake");
      dom.enemySprite.style.transform = "";
      floatDmg(dom.playerSprite, `-${dmg}`, "player-dmg");
      log(`💥 ${G.enemy.name}'s ${skillName} deals ${dmg} damage!`, "damage");
      await sleep(350);
      dom.playerPanel.classList.remove("shake");

      if (sk.effect === "stun")   { applyStatus(G.statuses, "stun",   2); log(`⚡ ${G.playerName} is stunned!`,  "damage"); }
      if (sk.effect === "burn")   { applyStatus(G.statuses, "burn",   3); log(`🔥 ${G.playerName} is burning!`, "damage"); }
      if (sk.effect === "poison") { applyStatus(G.statuses, "poison", 3); log(`☠️ ${G.playerName} is poisoned!`, "damage"); }
      if (sk.effect === "drain")  { applyStatus(G.statuses, "drain",  2); log(`🩸 ${G.playerName} is drained!`,  "damage"); }

      acted = true;
    }
  }

  if (!acted) {
    const dmg = calcDamage(G.enemy.atk, G.def);
    G.hp = clamp(G.hp - dmg, 0, G.maxHp);

    dom.enemySprite.style.transform = "translateX(-18px) scale(1.15)";
    await sleep(150);
    dom.playerPanel.classList.add("shake");
    dom.enemySprite.style.transform = "";
    floatDmg(dom.playerSprite, `-${dmg}`, "player-dmg");
    log(`⚔  ${G.enemy.name} attacks ${G.playerName} for ${dmg} damage!`, "enemy");
    await sleep(350);
    dom.playerPanel.classList.remove("shake");
  }

  updateHud();

  if (G.hp <= 0) {
    await handlePlayerDead();
    return;
  }

  // Tick player statuses
  tickStatuses("player");
  updateHud();

  if (G.hp <= 0) {
    await handlePlayerDead();
    return;
  }

  await sleep(300);
  await startPlayerTurn();
}

// ── Start player turn ─────────────────────────────────
async function startPlayerTurn() {
  G.playerTurn = true;
  showPhaseBanner("YOUR TURN");
  await sleep(200);
  setActionsEnabled(true);
  buildSkillButtons();
  buildItemButtons();
  updateHud();
}

// ── Check if enemy died ───────────────────────────────
async function checkEnemyDead() {
  if (G.enemy.hp <= 0) {
    await handleEnemyDead();
  } else {
    await endPlayerTurn();
  }
}

// ── Enemy died ────────────────────────────────────────
async function handleEnemyDead() {
  G.inBattle = false;
  setActionsEnabled(false);
  log(`💀 ${G.enemy.name} has been defeated!`, "system");
  await sleep(400);

  const wasBoss = G.enemy.isBoss;

  // XP reward
  const xpGain = G.enemy.xp;
  G.xp += xpGain;
  log(`⭐ +${xpGain} XP!`, "system");

  // Check loot
  if (G.enemy.loot) {
    G.enemy.loot.forEach(l => {
      if (Math.random() < l.chance) {
        G.inventory[l.item] = (G.inventory[l.item] || 0) + 1;
        log(`🎁 Obtained: ${ITEMS[l.item].icon} ${ITEMS[l.item].name}!`, "system");
      }
    });
  }

  // Level up loop
  while (G.xp >= G.xpNext) {
    G.xp -= G.xpNext;
    G.level++;
    G.xpNext = xpToNextLevel(G.level);
    const newStats = playerStatsAtLevel(G.level);
    const hpGain = newStats.maxHp - G.maxHp;
    const mpGain = newStats.maxMp - G.maxMp;
    Object.assign(G, newStats);
    G.hp = clamp(G.hp + hpGain + 30, 0, G.maxHp);
    G.mp = clamp(G.mp + mpGain + 10, 0, G.maxMp);

    // Unlock skills
    const newSkills = SWORD_SKILLS.filter(
      s => s.unlockedAt === G.level && !G.skills.find(x => x.id === s.id)
    );
    newSkills.forEach(s => {
      G.skills.push(s);
      log(`🌟 New skill unlocked: ${s.name}!`, "system");
    });

    log(`🎉 LEVEL UP! ${G.playerName} is now Lv.${G.level}!`, "system");
  }

  updateHud();
  await sleep(600);

  if (wasBoss) {
    await handleFloorClear();
  } else {
    G.battlesOnFloor++;
    nextEncounter();
  }
}

// ── Floor cleared ─────────────────────────────────────
async function handleFloorClear() {
  const isLastFloor = G.floor >= 10;

  if (isLastFloor) {
    // Victory!
    $("vic-msg").textContent =
      `Congratulations, ${G.playerName}! You have cleared all 10 floors of Aincrad and defeated Heathcliff. The death game is over. You are free.`;
    showScreen("victory");
    return;
  }

  $("fc-floor").textContent = `Floor ${G.floor} Cleared!`;

  // HP/MP restore on floor clear
  const hpRestore = Math.floor(G.maxHp * 0.5);
  const mpRestore = Math.floor(G.maxMp * 0.5);
  G.hp = clamp(G.hp + hpRestore, 0, G.maxHp);
  G.mp = clamp(G.mp + mpRestore, 0, G.maxMp);
  G.statuses = [];

  $("fc-reward").innerHTML = `
    <div class="reward-row">
      <div class="reward-item"><span>+${hpRestore}</span><small>HP Restored</small></div>
      <div class="reward-item"><span>+${mpRestore}</span><small>MP Restored</small></div>
    </div>
    <p style="margin-top:12px;color:var(--text-dim);font-size:.9rem">Advancing to Floor ${G.floor + 1}…</p>
  `;
  showScreen("floorClear");
}

// ── Advance to next floor ─────────────────────────────
function advanceFloor() {
  G.floor++;
  G.battlesOnFloor = 0;
  G.battlesNeeded  = 3 + Math.floor(G.floor / 3); // more battles on higher floors
  G.enemy = null;
  nextEncounter();
}

// ── Next encounter ────────────────────────────────────
function nextEncounter() {
  showScreen("game");
  const { template, isBoss } = pickEnemy();
  // small rest: partial HP/MP regen between normal battles
  if (!isBoss) {
    const hpRegen = Math.floor(G.maxHp * 0.08);
    const mpRegen = Math.floor(G.maxMp * 0.10);
    G.hp = clamp(G.hp + hpRegen, 0, G.maxHp);
    G.mp = clamp(G.mp + mpRegen, 0, G.maxMp);
  }
  startBattle(template, isBoss);
}

// ── Player died ───────────────────────────────────────
async function handlePlayerDead() {
  G.inBattle = false;
  setActionsEnabled(false);
  log(`💀 ${G.playerName} has fallen…`, "damage");
  await sleep(800);
  $("go-msg").textContent = `You were defeated by ${G.enemy ? G.enemy.name : "an enemy"} on Floor ${G.floor}. Your journey ends here.`;
  showScreen("gameOver");
}

// ── Toggle items panel ────────────────────────────────
function toggleItemPanel() {
  dom.itemPanel.classList.toggle("hidden");
  buildItemButtons();
}

// ── Event wiring ──────────────────────────────────────
function wireEvents() {
  // Title screen
  dom.startBtn.addEventListener("click", () => {
    const name = dom.nameInput.value.trim() || "Kirito";
    initGame(name);
    showScreen("game");
    nextEncounter();
  });
  dom.nameInput.addEventListener("keydown", e => {
    if (e.key === "Enter") dom.startBtn.click();
  });

  // Actions
  dom.attackBtn.addEventListener("click", doAttack);
  dom.itemsBtn.addEventListener("click", toggleItemPanel);
  dom.fleeBtn.addEventListener("click", flee);

  // Floor clear next
  $("fc-next-btn").addEventListener("click", advanceFloor);

  // Retry
  $("go-retry-btn").addEventListener("click", () => {
    showScreen("title");
  });

  // Victory new game
  $("vic-new-btn").addEventListener("click", () => {
    showScreen("title");
  });
}

// ── Boot ──────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  cacheDom();
  wireEvents();
  showScreen("title");
});

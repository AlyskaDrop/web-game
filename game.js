'use strict';

// ============================================================
// DATA — Skills, Enemies, Areas, Story
// ============================================================

const SKILLS = [
  {
    id: 'fireball', name: '🔥 Огненный Шар',
    mpCost: 15, element: 'fire', type: 'damage', power: 2.0,
    desc: 'Огненная магия (×2 ATK)', minLevel: 2,
  },
  {
    id: 'ice', name: '❄️ Ледяная Стрела',
    mpCost: 10, element: 'ice', type: 'damage', power: 1.5,
    desc: 'Замедляет врага на 2 хода (×1.5 ATK)', minLevel: 3,
  },
  {
    id: 'thunder', name: '⚡ Удар Молнии',
    mpCost: 20, element: 'lightning', type: 'damage', power: 2.5,
    desc: 'Мощная молния (×2.5 ATK)', minLevel: 4,
  },
  {
    id: 'heal', name: '💚 Исцеление',
    mpCost: 25, element: 'heal', type: 'heal', power: 0.4,
    desc: 'Восстанавливает 40% от макс. HP', minLevel: 1,
  },
  {
    id: 'dragon_soul', name: '🐉 Душа Дракона',
    mpCost: 50, element: 'dragon', type: 'damage', power: 4.0,
    desc: 'Мощь древнего дракона (×4 ATK)', minLevel: 5,
  },
];

const ENEMIES = {
  // ─── Area 1: Burning Village ───────────────────────────────
  goblin: {
    name: 'Гоблин', emoji: '👺',
    hp: 65, atk: 15, def: 5, spd: 10,
    exp: 25, ai: 'normal',
  },
  bandit: {
    name: 'Бандит-разбойник', emoji: '🗡️',
    hp: 88, atk: 20, def: 8, spd: 11,
    exp: 42, ai: 'aggressive',
  },
  dark_knight: {
    name: 'Тёмный Рыцарь', emoji: '🧟',
    hp: 240, atk: 30, def: 12, spd: 11,
    exp: 85, ai: 'boss', isBoss: true,
    bossSkill: { name: 'Удар Судьбы', power: 2.0 },
  },
  // ─── Area 2: Dark Forest ──────────────────────────────────
  wolf: {
    name: 'Лесной Волк', emoji: '🐺',
    hp: 90, atk: 22, def: 7, spd: 15,
    exp: 52, ai: 'aggressive',
  },
  witch: {
    name: 'Лесная Ведьма', emoji: '🧙‍♀️',
    hp: 108, atk: 28, def: 6, spd: 12,
    exp: 68, ai: 'mage',
    spells: ['Проклятие Тьмы', 'Ядовитые Тернии'],
  },
  ancient_golem: {
    name: 'Древний Голем', emoji: '🗿',
    hp: 380, atk: 40, def: 22, spd: 6,
    exp: 140, ai: 'boss', isBoss: true,
    bossSkill: { name: 'Кулак Земли', power: 2.5 },
  },
  // ─── Area 3: Mountain Passes ──────────────────────────────
  orc: {
    name: 'Горный Орк', emoji: '👹',
    hp: 132, atk: 34, def: 14, spd: 9,
    exp: 88, ai: 'aggressive',
  },
  wyvern: {
    name: 'Виверна', emoji: '🦎',
    hp: 158, atk: 40, def: 10, spd: 18,
    exp: 112, ai: 'flying',
  },
  shadow_drake: {
    name: 'Тёмный Дракон', emoji: '🐲',
    hp: 540, atk: 50, def: 26, spd: 14,
    exp: 210, ai: 'boss', isBoss: true,
    bossSkill: { name: 'Тёмное Дыхание', power: 2.8 },
  },
  // ─── Area 4: Dragon's Lair ────────────────────────────────
  fire_lizard: {
    name: 'Огненная Ящерица', emoji: '🔥',
    hp: 188, atk: 44, def: 18, spd: 13,
    exp: 138, ai: 'aggressive',
  },
  demon_guard: {
    name: 'Страж Демон', emoji: '😈',
    hp: 215, atk: 50, def: 23, spd: 12,
    exp: 165, ai: 'mage',
    spells: ['Адское Пламя', 'Взрыв Тьмы'],
  },
  drake_lord: {
    name: 'Повелитель Дракона', emoji: '🐉',
    hp: 740, atk: 60, def: 30, spd: 15,
    exp: 310, ai: 'boss', isBoss: true,
    bossSkill: { name: 'Огненный Шторм', power: 3.0 },
  },
  // ─── Area 5: Sky Fortress ─────────────────────────────────
  sky_knight: {
    name: 'Небесный Рыцарь', emoji: '🪄',
    hp: 230, atk: 57, def: 26, spd: 16,
    exp: 185, ai: 'aggressive',
  },
  ancient_spirit: {
    name: 'Древний Дух', emoji: '👻',
    hp: 265, atk: 62, def: 16, spd: 20,
    exp: 225, ai: 'mage',
    spells: ['Призрачный Удар', 'Поглощение Души'],
  },
  ancient_dragon: {
    name: 'Древний Дракон', emoji: '🐉',
    hp: 1250, atk: 74, def: 36, spd: 16,
    exp: 520, ai: 'final_boss', isBoss: true,
    bossSkill: { name: 'Апокалиптическое Пламя', power: 3.6 },
  },
};

const AREAS = [
  {
    name: 'Горящая Деревня', emoji: '🏘️',
    desc: 'Ваша деревня охвачена огнём. Повсюду враги — выживите любой ценой.',
    bg: 'radial-gradient(ellipse at 40% 30%, #2a0800 0%, #0a0200 60%, #000 100%)',
    enemies: ['goblin', 'bandit'], boss: 'dark_knight', battles: 3,
  },
  {
    name: 'Тёмный Лес', emoji: '🌲',
    desc: 'Густые кроны скрывают опасность. Здесь живут слуги тьмы.',
    bg: 'radial-gradient(ellipse at 40% 30%, #031208 0%, #010803 60%, #000 100%)',
    enemies: ['wolf', 'witch'], boss: 'ancient_golem', battles: 3,
  },
  {
    name: 'Горные Перевалы', emoji: '⛰️',
    desc: 'Суровые скалы и свирепые создания. Дорога к логову дракона.',
    bg: 'radial-gradient(ellipse at 40% 30%, #0d0d28 0%, #040410 60%, #000 100%)',
    enemies: ['orc', 'wyvern'], boss: 'shadow_drake', battles: 3,
  },
  {
    name: 'Логово Дракона', emoji: '🌋',
    desc: 'Горячий воздух пропитан серой. Дракон совсем близко.',
    bg: 'radial-gradient(ellipse at 40% 30%, #260000 0%, #0e0000 60%, #000 100%)',
    enemies: ['fire_lizard', 'demon_guard'], boss: 'drake_lord', battles: 3,
  },
  {
    name: 'Небесная Крепость', emoji: '🏯',
    desc: 'Финальное испытание. Древний Дракон ждёт достойного противника.',
    bg: 'radial-gradient(ellipse at 40% 30%, #0a0a26 0%, #030312 60%, #000 100%)',
    enemies: ['sky_knight', 'ancient_spirit'], boss: 'ancient_dragon', battles: 3,
  },
];

const STORY_PAGES = [
  {
    emoji: '🔥', title: 'Пролог',
    text: 'Ночью Великого Пробуждения тьма обрушилась на деревню Смиль...\n\nОгонь пожирал дома, а крики жителей разрывали ночную тишину.',
  },
  {
    emoji: '⚔️', title: 'Разрушение',
    text: 'Солдаты Чёрного Императора Мелбу уничтожили всё, что вам было дорого.\n\nОни искали Камень Дракона — реликвию, хранящуюся в вашей семье веками.',
  },
  {
    emoji: '🩸', title: 'Наследник',
    text: 'Вы — единственный выживший. В вашей крови течёт древняя сила.\n\nВы — наследник Дракона.',
  },
  {
    emoji: '📜', title: 'Пророчество',
    text: 'Легенда гласит: тот, кто победит Древнего Дракона, унаследует его силу и восстановит мир.\n\nНо это путь, где выживают немногие...',
  },
  {
    emoji: '🗡️', title: 'В путь',
    text: 'Вооружившись мечом отца, вы вступаете во тьму.\n\nМесть. Наследие. Судьба мира.\n\nВсё это ждёт вас впереди.',
  },
];

// Total EXP thresholds to reach each level (index = level)
const EXP_THRESHOLDS = [0, 0, 100, 300, 650, 1200, 2000, 3100, 4600, 6600, 9200];
//                      -   1    2    3    4     5     6     7     8     9    10

// ============================================================
// GAME STATE
// ============================================================

let S = newState();

function newState() {
  return {
    player:       null,
    enemy:        null,
    areaIndex:    0,
    battlesWon:   0,
    isBoss:       false,
    turn:         'player',  // 'player' | 'enemy' | 'anim'
    defending:    false,
    enemySlowTurns: 0,
    items:        { potion: 3, elixir: 1 },
    kills:        0,
    storyPage:    0,
    gameWon:      false,
  };
}

// ============================================================
// PLAYER
// ============================================================

function createPlayer(name) {
  return {
    name, level: 1, exp: 0,
    hp: 150, maxHp: 150,
    mp: 80,  maxMp: 80,
    atk: 25, def: 15, spd: 12,
  };
}

function checkLevelUp() {
  const p = S.player;
  if (p.level >= 10) return false;
  if (p.exp < EXP_THRESHOLDS[p.level + 1]) return false;

  p.level++;
  const hpGain = 20, mpGain = 10;
  p.maxHp += hpGain; p.maxMp += mpGain;
  p.hp = Math.min(p.hp + hpGain, p.maxHp);
  p.mp = Math.min(p.mp + mpGain, p.maxMp);
  p.atk += 3; p.def += 2; p.spd += 1;

  renderLevelUpScreen(p.level, hpGain, mpGain);
  showScreen('levelup');
  return true;
}

// ============================================================
// UTILITIES
// ============================================================

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }

function calcDamage(atk, def, mult = 1.0) {
  const base = Math.max(1, atk - Math.floor(def * 0.5));
  const variance = 0.85 + Math.random() * 0.3;   // ±15 %
  const isCrit = Math.random() < 0.1;
  return {
    damage: Math.max(1, Math.round(base * mult * variance * (isCrit ? 2 : 1))),
    isCrit,
  };
}

// ============================================================
// BATTLE — start / player actions
// ============================================================

function createEnemy(id) {
  const t = ENEMIES[id];
  return {
    id, name: t.name, emoji: t.emoji,
    hp: t.hp, maxHp: t.hp,
    atk: t.atk, def: t.def, spd: t.spd,
    exp: t.exp, ai: t.ai, isBoss: !!t.isBoss,
    bossSkill: t.bossSkill || null,
    spells: t.spells || [],
    phase: 1,
  };
}

function startBattle(enemyId, isBoss) {
  S.enemy        = createEnemy(enemyId);
  S.isBoss       = !!isBoss;
  S.turn         = 'player';
  S.defending    = false;
  S.enemySlowTurns = 0;

  showScreen('battle');
  document.getElementById('battle-bg').style.background = AREAS[S.areaIndex].bg;

  clearLog();
  renderBattleUI();

  const msg = S.isBoss
    ? `⚠️ БОСС: ${S.enemy.name} преграждает путь!`
    : `${S.enemy.emoji} ${S.enemy.name} нападает!`;
  addLog(msg, 'system');
  addLog('Ваш ход. Выберите действие.', 'info');

  showActionMenu();
  enableActions();
}

function doPlayerAttack() {
  if (S.turn !== 'player') return;
  S.defending = false;
  disableActions();
  S.turn = 'anim';

  const { damage, isCrit } = calcDamage(S.player.atk, S.enemy.def);

  animateAttack(() => {
    applyDamageToEnemy(damage, isCrit);
    addLog(`⚔️ ${S.player.name} атакует — ${damage} урона!${isCrit ? ' КРИТ!' : ''}`, 'player-action');
    setTimeout(afterPlayerAction, 650);
  });
}

function doPlayerSpell(skillId) {
  if (S.turn !== 'player') return;
  const skill = SKILLS.find(s => s.id === skillId);
  if (!skill) return;

  if (S.player.mp < skill.mpCost) {
    addLog('❌ Недостаточно MP!', 'error'); return;
  }
  if (S.player.level < skill.minLevel) {
    addLog(`❌ Требуется уровень ${skill.minLevel}!`, 'error'); return;
  }

  S.defending = false;
  disableActions();
  S.turn = 'anim';
  S.player.mp -= skill.mpCost;
  renderPlayerBars();
  showActionMenu();

  if (skill.type === 'damage') {
    const { damage, isCrit } = calcDamage(S.player.atk, S.enemy.def, skill.power);
    animateSpell(skill.element, () => {
      applyDamageToEnemy(damage, isCrit);
      addLog(`✨ ${S.player.name}: ${skill.name} — ${damage} урона!${isCrit ? ' КРИТ!' : ''}`, 'player-action');
      if (skill.id === 'ice') {
        S.enemySlowTurns = 2;
        addLog('❄️ Враг замедлен на 2 хода!', 'buff');
      }
      setTimeout(afterPlayerAction, 650);
    });
  } else if (skill.type === 'heal') {
    const heal = Math.round(S.player.maxHp * skill.power);
    S.player.hp = clamp(S.player.hp + heal, 0, S.player.maxHp);
    renderPlayerBars();
    spawnHealFloat(heal);
    addLog(`💚 ${S.player.name} исцелился на ${heal} HP!`, 'player-action');
    setTimeout(afterPlayerAction, 800);
  }
}

function doPlayerItem(itemId) {
  if (S.turn !== 'player') return;

  if (itemId === 'potion') {
    if (S.items.potion <= 0) { addLog('❌ Зелий нет!', 'error'); return; }
    S.items.potion--;
    const heal = 60;
    S.player.hp = clamp(S.player.hp + heal, 0, S.player.maxHp);
    addLog(`💊 Использовано зелье — +${heal} HP!`, 'player-action');
    renderPlayerBars();
    spawnHealFloat(heal);
  } else if (itemId === 'elixir') {
    if (S.items.elixir <= 0) { addLog('❌ Эликсиров нет!', 'error'); return; }
    S.items.elixir--;
    const mp = 40;
    S.player.mp = clamp(S.player.mp + mp, 0, S.player.maxMp);
    addLog(`💙 Использован эликсир — +${mp} MP!`, 'player-action');
    renderPlayerBars();
  }

  showActionMenu();
  S.defending = false;
  setTimeout(enemyTurn, 850);
}

function doPlayerDefend() {
  if (S.turn !== 'player') return;
  S.defending = true;
  disableActions();
  addLog(`🛡️ ${S.player.name} принимает защитную стойку!`, 'player-action');
  setTimeout(enemyTurn, 800);
}

function applyDamageToEnemy(damage, isCrit) {
  S.enemy.hp = clamp(S.enemy.hp - damage, 0, S.enemy.maxHp);
  renderEnemyBar();
  shakeEl('enemy-sprite');
  spawnDmgFloat(damage, isCrit, true);
}

function afterPlayerAction() {
  if (S.enemy.hp <= 0) { battleVictory(); return; }
  enemyTurn();
}

// ============================================================
// BATTLE — enemy turn
// ============================================================

function enemyTurn() {
  S.turn = 'enemy';
  const e = S.enemy;

  // Slow debuff
  if (S.enemySlowTurns > 0) {
    S.enemySlowTurns--;
    if (Math.random() < 0.5) {
      addLog(`❄️ ${e.name} слишком медлен и пропускает ход!`, 'debuff');
      setTimeout(startPlayerTurn, 900);
      return;
    }
    addLog(`❄️ ${e.name} действует медленно... (ещё ${S.enemySlowTurns} хода)`, 'debuff');
  }

  // Boss phase 2 trigger
  if (e.isBoss && e.phase === 1 && e.hp < e.maxHp * 0.5) {
    e.phase = 2;
    addLog(`⚠️ ${e.name} впадает в ярость! Атака усиливается!`, 'boss-event');
    screenFlash('battle-enemy-section', 'red');
  }

  const action = chooseEnemyAction(e);
  setTimeout(() => execEnemyAction(e, action), 850);
}

function chooseEnemyAction(e) {
  const ratio = e.hp / e.maxHp;
  switch (e.ai) {
    case 'normal': return 'attack';
    case 'aggressive': return Math.random() < 0.2 ? 'special' : 'attack';
    case 'flying':     return 'attack';
    case 'mage':       return Math.random() < 0.45 ? 'spell' : 'attack';
    case 'boss':
      return (e.phase === 2 ? Math.random() < 0.4 : Math.random() < 0.22) ? 'special' : 'attack';
    case 'final_boss':
      if (ratio < 0.3) return Math.random() < 0.6 ? 'special' : 'attack';
      if (ratio < 0.6) return Math.random() < 0.4 ? 'special' : 'attack';
      return Math.random() < 0.25 ? 'special' : 'attack';
    default: return 'attack';
  }
}

function execEnemyAction(e, action) {
  const p = S.player;

  if (action === 'spell' && e.spells.length) {
    const spellName = e.spells[rand(0, e.spells.length - 1)];
    const { damage: raw } = calcDamage(Math.round(e.atk * 1.5), Math.round(p.def * 0.5));
    const dmg = S.defending ? Math.floor(raw * 0.5) : raw;
    dealDamageToPlayer(dmg, false);
    addLog(`🔮 ${e.name}: ${spellName} — ${dmg} урона!`, 'enemy-special');
    screenFlash('battle-player-section', 'purple');

  } else if (action === 'special' && e.bossSkill) {
    const phaseMult = e.phase === 2 ? e.bossSkill.power * 1.2 : e.bossSkill.power;
    const { damage: raw, isCrit } = calcDamage(e.atk, p.def, phaseMult);
    const dmg = S.defending ? Math.floor(raw * 0.5) : raw;
    dealDamageToPlayer(dmg, isCrit);
    addLog(`💥 ${e.name}: ${e.bossSkill.name} — ${dmg} урона!${isCrit ? ' КРИТ!' : ''}`, 'enemy-special');
    screenFlash('battle-player-section', 'red');

  } else {
    // Normal attack
    const { damage: raw, isCrit } = calcDamage(e.atk, p.def);
    const dmg = S.defending ? Math.floor(raw * 0.5) : raw;
    const defend = S.defending ? ' (блок!)' : '';
    dealDamageToPlayer(dmg, isCrit);
    addLog(`${e.emoji} ${e.name} атакует — ${dmg} урона!${isCrit ? ' КРИТ!' : ''}${defend}`, 'enemy-action');
  }

  S.defending = false;

  setTimeout(() => {
    if (p.hp <= 0) { battleDefeat(); return; }
    startPlayerTurn();
  }, 800);
}

function dealDamageToPlayer(dmg, isCrit) {
  S.player.hp = clamp(S.player.hp - dmg, 0, S.player.maxHp);
  renderPlayerBars();
  shakeEl('battle-player-section');
  spawnDmgFloat(dmg, isCrit, false);
}

function startPlayerTurn() {
  S.turn = 'player';
  enableActions();
  addLog('─── Ваш ход ───', 'separator');
}

// ============================================================
// BATTLE — resolution
// ============================================================

function battleVictory() {
  const e = S.enemy;
  S.kills++;
  S.player.exp += e.exp;

  addLog(`🏆 ${e.name} повержен!`, 'victory');
  addLog(`⭐ Получено ${e.exp} EXP`, 'exp');

  // Random potion drop (20 % chance for regular, 50 % for boss)
  const dropChance = e.isBoss ? 0.5 : 0.2;
  if (Math.random() < dropChance) {
    S.items.potion++;
    addLog('💊 Выпало зелье здоровья!', 'loot');
  }

  disableActions();

  if (S.isBoss) {
    if (S.areaIndex >= AREAS.length - 1) {
      S.gameWon = true;
    } else {
      S.areaIndex++;
      S.battlesWon = 0;
      addLog(`🗺️ Открыта новая локация: ${AREAS[S.areaIndex].name}!`, 'buff');
    }
  } else {
    S.battlesWon++;
  }

  // Check level-up — if it happens, the "Continue" button handles navigation
  setTimeout(() => {
    const leveled = checkLevelUp();
    if (!leveled) {
      if (S.gameWon) { showWinScreen(); }
      else           { showScreen('map'); renderMapUI(); }
    }
  }, 1200);
}

function battleDefeat() {
  addLog(`💀 ${S.player.name} пал в бою...`, 'defeat');
  disableActions();
  setTimeout(showGameOverScreen, 1500);
}

// ============================================================
// MAP
// ============================================================

function exploreArea() {
  const area = AREAS[S.areaIndex];
  if (S.battlesWon >= area.battles) {
    startBattle(area.boss, true);
  } else {
    const eid = area.enemies[rand(0, area.enemies.length - 1)];
    startBattle(eid, false);
  }
}

function restPlayer() {
  if (S.items.elixir <= 0) {
    setRestMsg('Нет эликсиров! (требуется 1 для отдыха)');
    return;
  }
  S.items.elixir--;
  const hpR = Math.floor(S.player.maxHp * 0.5);
  const mpR = Math.floor(S.player.maxMp * 0.5);
  S.player.hp = clamp(S.player.hp + hpR, 0, S.player.maxHp);
  S.player.mp = clamp(S.player.mp + mpR, 0, S.player.maxMp);
  setRestMsg(`💤 Отдохнули: +${hpR} HP, +${mpR} MP. (Эликсир использован)`);
  renderMapUI();
}

function setRestMsg(text) {
  const el = document.getElementById('rest-msg');
  el.textContent = text;
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.textContent = ''; }, 3200);
}

// ============================================================
// RENDER — map
// ============================================================

function renderMapUI() {
  const area = AREAS[S.areaIndex];
  const p    = S.player;

  document.getElementById('hud-name').textContent  = p.name;
  document.getElementById('hud-level').textContent = p.level;

  const hpPct  = p.hp / p.maxHp * 100;
  const mpPct  = p.mp / p.maxMp * 100;
  const expCur = p.exp - (EXP_THRESHOLDS[p.level] || 0);
  const expNxt = p.level < 10 ? EXP_THRESHOLDS[p.level + 1] - EXP_THRESHOLDS[p.level] : 999;
  const expPct = p.level >= 10 ? 100 : Math.min(100, expCur / expNxt * 100);

  setBar('hud-hp-bar', hpPct);
  setBar('hud-mp-bar', mpPct);
  setBar('hud-exp-bar', expPct);
  document.getElementById('hud-hp-text').textContent  = `${p.hp}/${p.maxHp}`;
  document.getElementById('hud-mp-text').textContent  = `${p.mp}/${p.maxMp}`;
  document.getElementById('hud-exp-text').textContent =
    p.level >= 10 ? 'МАКС.' : `${expCur}/${expNxt}`;

  document.getElementById('hud-potions').textContent = S.items.potion;
  document.getElementById('hud-elixirs').textContent = S.items.elixir;

  document.getElementById('area-name').textContent = `${area.emoji} ${area.name}`;
  document.getElementById('area-desc').textContent  = area.desc;

  const bossReady = S.battlesWon >= area.battles;
  const explBtn = document.getElementById('btn-explore');
  if (bossReady) {
    document.getElementById('area-progress').textContent =
      '⚠️ Босс готов к бою! Все стражники уничтожены.';
    explBtn.textContent = '💀 Сразиться с Боссом';
    explBtn.classList.add('boss-ready');
  } else {
    document.getElementById('area-progress').textContent =
      `Победы: ${S.battlesWon}/${area.battles}`;
    explBtn.textContent = '⚔️ Исследовать';
    explBtn.classList.remove('boss-ready');
  }

  const list = document.getElementById('area-list');
  list.innerHTML = '';
  AREAS.forEach((a, i) => {
    const div = document.createElement('div');
    const icon = i < S.areaIndex ? '✅' : i === S.areaIndex ? '▶' : '🔒';
    const cls  = i < S.areaIndex ? 'completed' : i === S.areaIndex ? 'current' : 'locked';
    div.className   = `area-item ${cls}`;
    div.textContent = `${icon} ${a.emoji} ${a.name}`;
    list.appendChild(div);
  });
}

// ============================================================
// RENDER — battle UI
// ============================================================

function renderBattleUI() {
  const p = S.player;
  const e = S.enemy;

  document.getElementById('pname-battle').textContent = p.name;
  document.getElementById('plevel-badge').textContent = `Ур.${p.level}`;
  document.getElementById('ename').textContent        = e.name;

  renderPlayerBars();
  renderEnemyBar();

  const sprite = document.getElementById('enemy-sprite');
  sprite.textContent = e.emoji;
  sprite.className   = `enemy-sprite${e.isBoss ? ' boss-sprite' : ''}`;

  document.getElementById('estatus').textContent = '';
  document.getElementById('pstatus').textContent = '';
}

function renderPlayerBars() {
  const p = S.player;
  const hpPct = p.hp / p.maxHp * 100;
  const mpPct = p.mp / p.maxMp * 100;

  const bar = document.getElementById('php-bar');
  setBar('php-bar', hpPct);
  setBar('pmp-bar', mpPct);

  // Color coding
  if (hpPct <= 25) bar.className = 'bar-fill hp-fill crit';
  else if (hpPct <= 50) bar.className = 'bar-fill hp-fill low';
  else bar.className = 'bar-fill hp-fill';

  document.getElementById('php-text').textContent = `${p.hp}/${p.maxHp}`;
  document.getElementById('pmp-text').textContent = `${p.mp}/${p.maxMp}`;
}

function renderEnemyBar() {
  const e = S.enemy;
  const pct = e.hp / e.maxHp * 100;

  const bar = document.getElementById('ehp-bar');
  setBar('ehp-bar', pct);

  if (pct <= 25) bar.className = 'bar-fill hp-fill crit';
  else if (pct <= 50) bar.className = 'bar-fill hp-fill low';
  else bar.className = 'bar-fill hp-fill';

  document.getElementById('ehp-text').textContent = `${e.hp}/${e.maxHp}`;
}

function setBar(id, pct) {
  document.getElementById(id).style.width = clamp(pct, 0, 100) + '%';
}

// ============================================================
// RENDER — level-up screen
// ============================================================

function renderLevelUpScreen(newLevel, hpGain, mpGain) {
  const p = S.player;
  const newSkill = SKILLS.find(s => s.minLevel === newLevel);
  document.getElementById('levelup-details').innerHTML = `
    <div class="lu-level">⬆️ Уровень ${newLevel}!</div>
    <div class="lu-gains">
      <div class="stat-gain">❤️ HP +${hpGain} → ${p.maxHp}</div>
      <div class="stat-gain">💙 MP +${mpGain} → ${p.maxMp}</div>
      <div class="stat-gain">⚔️ ATK +3 → ${p.atk}</div>
      <div class="stat-gain">🛡️ DEF +2 → ${p.def}</div>
      <div class="stat-gain">💨 SPD +1 → ${p.spd}</div>
    </div>
    ${newSkill ? `<div class="new-skill">✨ Изучено: ${newSkill.name}!</div>` : ''}
  `;
}

// ============================================================
// RENDER — game over / win
// ============================================================

function showGameOverScreen() {
  const p = S.player;
  document.getElementById('gameover-msg').textContent =
    `${p.name} пал в битве с ${S.enemy.name}.\nПройдено битв: ${S.kills}.`;
  showScreen('gameover');
}

function showWinScreen() {
  const p = S.player;
  document.getElementById('win-stats').innerHTML = `
    <div class="win-stat-item">Герой: <span>${p.name}</span></div>
    <div class="win-stat-item">Уровень: <span>${p.level}</span></div>
    <div class="win-stat-item">Битв: <span>${S.kills}</span></div>
    <div class="win-stat-item">EXP: <span>${p.exp}</span></div>
  `;
  showScreen('win');
}

// ============================================================
// MENUS / ACTIONS
// ============================================================

function showActionMenu() {
  document.getElementById('menu-action').classList.remove('hidden');
  document.getElementById('menu-magic').classList.add('hidden');
  document.getElementById('menu-item').classList.add('hidden');
}

function openMagicMenu() {
  buildMagicList();
  document.getElementById('menu-action').classList.add('hidden');
  document.getElementById('menu-magic').classList.remove('hidden');
  document.getElementById('menu-item').classList.add('hidden');
}

function openItemMenu() {
  buildItemList();
  document.getElementById('menu-action').classList.add('hidden');
  document.getElementById('menu-magic').classList.add('hidden');
  document.getElementById('menu-item').classList.remove('hidden');
}

function buildMagicList() {
  const list = document.getElementById('magic-list');
  list.innerHTML = '';
  SKILLS.forEach(skill => {
    const canAfford = S.player.mp >= skill.mpCost;
    const canUse    = S.player.level >= skill.minLevel;
    const btn = document.createElement('button');
    btn.className = 'skill-btn';
    btn.disabled  = !canAfford || !canUse;
    btn.innerHTML = `
      <span class="skill-name">${skill.name}</span>
      <span class="skill-cost">MP:${skill.mpCost}</span>
      <span class="skill-desc">${skill.desc}${!canUse ? ` (Ур.${skill.minLevel})` : ''}</span>
    `;
    if (!btn.disabled) btn.addEventListener('click', () => doPlayerSpell(skill.id));
    list.appendChild(btn);
  });
}

function buildItemList() {
  const list = document.getElementById('item-list');
  list.innerHTML = '';
  const items = [
    { id: 'potion', name: '💊 Зелье здоровья', desc: '+60 HP',  count: S.items.potion },
    { id: 'elixir', name: '💙 Эликсир маны',   desc: '+40 MP',  count: S.items.elixir },
  ];
  items.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'item-btn';
    btn.disabled  = item.count <= 0;
    btn.innerHTML = `
      <span class="item-name">${item.name}</span>
      <span class="item-count">×${item.count}</span>
      <span class="item-desc">${item.desc}</span>
    `;
    if (!btn.disabled) btn.addEventListener('click', () => doPlayerItem(item.id));
    list.appendChild(btn);
  });
}

function enableActions() {
  document.querySelectorAll('.cmd-btn').forEach(b => { b.disabled = false; });
  showActionMenu();
}

function disableActions() {
  document.querySelectorAll('.cmd-btn, .skill-btn, .item-btn').forEach(b => { b.disabled = true; });
}

// ============================================================
// SCREEN MANAGEMENT
// ============================================================

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id + '-screen');
  if (el) el.classList.add('active');
}

// ============================================================
// STORY
// ============================================================

function showStoryPage(index) {
  const page = STORY_PAGES[index];
  S.storyPage = index;
  document.getElementById('story-content').innerHTML = `
    <div class="story-emoji">${page.emoji}</div>
    <div class="story-title">${page.title}</div>
    <p class="story-body">${page.text.replace(/\n/g, '<br>')}</p>
  `;
}

// ============================================================
// BATTLE LOG
// ============================================================

function clearLog() {
  document.getElementById('log-content').innerHTML = '';
}

function addLog(text, type = 'info') {
  const wrap = document.getElementById('log-content');
  const el   = document.createElement('div');
  el.className   = `log-entry log-${type}`;
  el.textContent = text;
  wrap.appendChild(el);
  wrap.parentElement.scrollTop = wrap.parentElement.scrollHeight;
}

// ============================================================
// ANIMATIONS
// ============================================================

function animateAttack(cb) {
  const sprite = document.getElementById('enemy-sprite');
  sprite.classList.add('hit-flash');
  setTimeout(() => { sprite.classList.remove('hit-flash'); cb(); }, 350);
}

function animateSpell(element, cb) {
  const section = document.querySelector('.battle-enemy');
  const overlay = document.createElement('div');
  overlay.className = `spell-overlay spell-${element}`;
  section.appendChild(overlay);
  setTimeout(() => { overlay.remove(); cb(); }, 550);
}

function shakeEl(id) {
  const el = document.getElementById(id);
  el.classList.remove('shake');
  void el.offsetWidth; // reflow
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 450);
}

function screenFlash(sectionId, color) {
  const section = document.getElementById(sectionId);
  const el = document.createElement('div');
  el.className = `screen-flash flash-${color}`;
  section.appendChild(el);
  setTimeout(() => el.remove(), 420);
}

function spawnDmgFloat(amount, isCrit, isEnemy) {
  const wrap = isEnemy
    ? document.querySelector('.enemy-sprite-wrap')
    : document.querySelector('.battle-player');
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = `dmg-float${isCrit ? ' crit' : ''} ${isEnemy ? 'enemy' : 'player'}`;
  el.textContent = `-${amount}`;
  el.style.cssText = 'position:absolute;pointer-events:none;z-index:30;';
  wrap.style.position = 'relative';
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 1100);
}

function spawnHealFloat(amount) {
  const wrap = document.querySelector('.battle-player');
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = 'heal-float';
  el.textContent = `+${amount}`;
  el.style.cssText = 'position:absolute;pointer-events:none;z-index:30;';
  wrap.style.position = 'relative';
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 1100);
}

// ============================================================
// RESET
// ============================================================

function resetGame() {
  S = newState();
  showScreen('title');
}

// ============================================================
// INIT & EVENT LISTENERS
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // Title
  document.getElementById('btn-start').addEventListener('click', () => {
    showScreen('name');
    setTimeout(() => document.getElementById('name-input').focus(), 80);
  });

  // Name
  const confirmName = () => {
    const val = document.getElementById('name-input').value.trim() || 'Дарт';
    S.player = createPlayer(val);
    showScreen('intro');
    showStoryPage(0);
  };
  document.getElementById('btn-confirm-name').addEventListener('click', confirmName);
  document.getElementById('name-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') confirmName();
  });

  // Story
  document.getElementById('btn-next-story').addEventListener('click', () => {
    const next = S.storyPage + 1;
    if (next >= STORY_PAGES.length) {
      showScreen('map');
      renderMapUI();
    } else {
      showStoryPage(next);
    }
  });

  // Map
  document.getElementById('btn-explore').addEventListener('click', exploreArea);
  document.getElementById('btn-rest').addEventListener('click', restPlayer);

  // Battle — action buttons
  document.querySelectorAll('.cmd-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switch (btn.dataset.act) {
        case 'attack':  doPlayerAttack(); break;
        case 'magic':   openMagicMenu();  break;
        case 'item':    openItemMenu();   break;
        case 'defend':  doPlayerDefend(); break;
      }
    });
  });

  // Back buttons in sub-menus
  document.getElementById('back-magic').addEventListener('click', showActionMenu);
  document.getElementById('back-item').addEventListener('click', showActionMenu);

  // Level-up continue
  document.getElementById('btn-levelup-ok').addEventListener('click', () => {
    if (S.gameWon) { showWinScreen(); }
    else           { showScreen('map'); renderMapUI(); }
  });

  // Game over / win
  document.getElementById('btn-restart').addEventListener('click', resetGame);
  document.getElementById('btn-play-again').addEventListener('click', resetGame);

  // Start on title
  showScreen('title');
});

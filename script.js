const els = {
  board: document.getElementById("board"),
  introOverlay: document.getElementById("introOverlay"),
  step1: document.getElementById("step1"),
  step2: document.getElementById("step2"),
  step3: document.getElementById("step3"),
  toVictoryBtn: document.getElementById("toVictoryBtn"),
  backToIntroBtn: document.getElementById("backToIntroBtn"),
  toFactionBtn: document.getElementById("toFactionBtn"),
  backToVictoryBtn: document.getElementById("backToVictoryBtn"),
  pickUSBtn: document.getElementById("pickUSBtn"),
  pickUSSRBtn: document.getElementById("pickUSSRBtn"),
  startGameBtn: document.getElementById("startGameBtn"),

  rulesBtn: document.getElementById("rulesBtn"),
  rulesPopup: document.getElementById("rulesPopup"),
  closeRulesBtn: document.getElementById("closeRulesBtn"),
  toast: document.getElementById("toast"),

  roundPill: document.getElementById("roundPill"),
  turnPill: document.getElementById("turnPill"),
  orderPill: document.getElementById("orderPill"),

  regions: document.getElementById("regions"),

  enemyFaction: document.getElementById("enemyFaction"),
  enemyScore: document.getElementById("enemyScore"),
  enemyHandCount: document.getElementById("enemyHandCount"),
  enemyControlCount: document.getElementById("enemyControlCount"),
  enemyDominanceCount: document.getElementById("enemyDominanceCount"),
  enemyLog: document.getElementById("enemyLog"),

  playerFaction: document.getElementById("playerFaction"),
  playerLine: document.getElementById("playerLine"),
  playerScore: document.getElementById("playerScore"),
  playerHandCount: document.getElementById("playerHandCount"),
  playerControlCount: document.getElementById("playerControlCount"),
  playerDominanceCount: document.getElementById("playerDominanceCount"),
  drawBtn: document.getElementById("drawBtn"),
  noLegalBtn: document.getElementById("noLegalBtn"),

  handPage: document.getElementById("handPage"),
  prevHandBtn: document.getElementById("prevHandBtn"),
  nextHandBtn: document.getElementById("nextHandBtn"),
  handSlots: Array.from({ length: 5 }, (_, i) => document.getElementById(`hand${i}`)),

  playModal: document.getElementById("playModal"),
  playTitle: document.getElementById("playTitle"),
  playMeta: document.getElementById("playMeta"),
  playDesc: document.getElementById("playDesc"),
  target1: document.getElementById("target1"),
  target2: document.getElementById("target2"),
  target3: document.getElementById("target3"),
  target2Wrap: document.getElementById("target2Wrap"),
  target3Wrap: document.getElementById("target3Wrap"),
  modeWrap: document.getElementById("modeWrap"),
  modeSelect: document.getElementById("modeSelect"),
  cancelPlayBtn: document.getElementById("cancelPlayBtn"),
  confirmPlayBtn: document.getElementById("confirmPlayBtn"),

  vetoModal: document.getElementById("vetoModal"),
  vetoMeta: document.getElementById("vetoMeta"),
  vetoDesc: document.getElementById("vetoDesc"),
  useVetoBtn: document.getElementById("useVetoBtn"),
  declineVetoBtn: document.getElementById("declineVetoBtn"),

  resultOverlay: document.getElementById("resultOverlay"),
  resultTitle: document.getElementById("resultTitle"),
  resultSub: document.getElementById("resultSub"),
  resultPlayerFaction: document.getElementById("resultPlayerFaction"),
  resultEnemyFaction: document.getElementById("resultEnemyFaction"),
  resultPlayerScore: document.getElementById("resultPlayerScore"),
  resultEnemyScore: document.getElementById("resultEnemyScore"),
  restartBtn: document.getElementById("restartBtn"),
};

const SIDE_NAME = {
  US: "United States",
  USSR: "Soviet Union"
};

const 
ALL_REGIONS = GAME_DATA.regions;
const INITIAL = GAME_DATA.initialInfluence;
const TOTAL_ROUNDS = 30;
const SWITCH_ROUND = 16;
const DELTA_PREVIEW_MS = 3000;

let selectedFaction = "US";
let state = null;
let handPageIndex = 0;
let pendingCardId = null;
let toastTimer = null;
let turnAdvanceTimer = null;

const NO_TARGET_RULES = [
  "nato",
  "warsawPact",
  "nonAlignedMovement",
  "berlinWall",
  "castroRevolution",
  "bayOfPigs",
  "intelligenceLeak",
  "vetoResponse"
];

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function opposite(side) {
  return side === "US" ? "USSR" : "US";
}

function regionToLabel(region) {
  return region;
}

function showIntroStep(stepEl) {
  [els.step1, els.step2, els.step3].forEach(el => el.classList.remove("active"));
  stepEl.classList.add("active");
}

function showToast(text) {
  clearTimeout(toastTimer);
  els.toast.textContent = text;
  els.toast.classList.remove("hidden");
  els.toast.classList.remove("toast");
  void els.toast.offsetWidth;
  els.toast.classList.add("toast");

  toastTimer = setTimeout(() => {
    els.toast.classList.add("hidden");
  }, 2000);
}

function pushEnemyLog(text, roundOverride = null) {
  const logRound = roundOverride ?? state.round;
  state.enemyLogHistory.unshift({ round: logRound, text });

  if (state.enemyLogHistory.length > 3) {
    state.enemyLogHistory = state.enemyLogHistory.slice(0, 3);
  }
}

function buildDeck() {
  const deck = [];
  for (const card of GAME_DATA.decklist) {
    for (let i = 0; i < card.count; i++) {
      deck.push({
        uid: `${card.id}-${i}-${Math.random().toString(36).slice(2, 8)}`,
        ...card
      });
    }
  }
  return shuffle(deck);
}

function drawCards(s, side, count) {
  for (let i = 0; i < count; i++) {
    if (s.deck.length === 0) {
      if (s.discard.length === 0) return;
      s.deck = shuffle(s.discard);
      s.discard = [];
    }
    const card = s.deck.shift();
    if (card) s.hands[side].push(card);
  }
}

function createInitialState(playerSide) {
  const enemySide = playerSide === "US" ? "USSR" : "US";
  const firstPlayer = Math.random() < 0.5 ? "US" : "USSR";

  const s = {
    playerSide,
    enemySide,
    round: 1,
    currentActor: firstPlayer,
    firstHalfFirst: firstPlayer,
    hasDrawn: false,
    gameEnded: false,

    deck: buildDeck(),
    discard: [],
    hands: { US: [], USSR: [] },
    regions: JSON.parse(JSON.stringify(INITIAL)),

    pendingEvent: null,

    deltas: Object.fromEntries(
      ALL_REGIONS.map(region => [region, { US: 0, USSR: 0 }])
    ),

    enemyLogHistory: []
  };

  drawCards(s, "US", 5);
  drawCards(s, "USSR", 5);
  return s;
}

function setupGame() {
  state = createInitialState(selectedFaction);
  handPageIndex = 0;
  els.board.classList.add("active");
  renderAll();

  if (state.currentActor === state.enemySide) {
    maybeBotTurn();
  }
}

function getCurrentFirstPlayer(round = state.round) {
  return round < SWITCH_ROUND ? state.firstHalfFirst : opposite(state.firstHalfFirst);
}

function getInfluence(region, side) {
  return state.regions[region][side];
}

function setInfluence(region, side, value) {
  state.regions[region][side] = clamp(value, 0, 12);
}

function clearAllDeltas() {
  ALL_REGIONS.forEach(region => {
    state.deltas[region] = { US: 0, USSR: 0 };
  });
}

function markDelta(region, side, amount) {
  if (!amount) return;
  state.deltas[region][side] += amount;
}

function addInfluence(region, side, value) {
  const before = getInfluence(region, side);
  setInfluence(region, side, before + value);
  const after = getInfluence(region, side);
  markDelta(region, side, after - before);
}

function isControlledBy(region, side) {
  const own = getInfluence(region, side);
  const opp = getInfluence(region, opposite(side));
  return own >= 6 && own - opp >= 4;
}

function isDominatedBy(region, side) {
  const own = getInfluence(region, side);
  const opp = getInfluence(region, opposite(side));
  return own >= 9 && own - opp >= 7;
}

function isUncontrolled(region) {
  return !isControlledBy(region, "US") && !isControlledBy(region, "USSR");
}

function diff(region) {
  return Math.abs(getInfluence(region, "US") - getInfluence(region, "USSR"));
}

function regionStatus(region) {
  if (isDominatedBy(region, "US")) return "US Dominates";
  if (isDominatedBy(region, "USSR")) return "USSR Dominates";
  if (isControlledBy(region, "US")) return "US Controls";
  if (isControlledBy(region, "USSR")) return "USSR Controls";
  return "Contested";
}

function regionClass(region) {
  if (isDominatedBy(region, "US")) return "us-dominance";
  if (isDominatedBy(region, "USSR")) return "ussr-dominance";
  if (isControlledBy(region, "US")) return "us-control";
  if (isControlledBy(region, "USSR")) return "ussr-control";
  return "contested";
}

function scoreSummary(side) {
  let score = 0;
  let controls = 0;
  let dominances = 0;
  let totalInfluence = 0;

  for (const region of ALL_REGIONS) {
    totalInfluence += getInfluence(region, side);

    if (isControlledBy(region, side)) {
      controls += 1;
      score += 2;
    }

    if (isDominatedBy(region, side)) {
      dominances += 1;
      score += 1;
    }
  }

  const opp = opposite(side);
  let oppControls = 0;
  for (const region of ALL_REGIONS) {
    if (isControlledBy(region, opp)) oppControls += 1;
  }

  if (controls > oppControls) score += 2;

  return { score, controls, dominances, totalInfluence };
}

function renderRegions() {
  els.regions.innerHTML = "";

  ALL_REGIONS.forEach((region, idx) => {
    const usValue = getInfluence(region, "US");
    const ussrValue = getInfluence(region, "USSR");
    const usDelta = state.deltas?.[region]?.US || 0;
    const ussrDelta = state.deltas?.[region]?.USSR || 0;

    const usDeltaHtml =
      usDelta > 0 ? `<span class="delta up">↑${usDelta}</span>` :
      usDelta < 0 ? `<span class="delta down">↓${Math.abs(usDelta)}</span>` : "";

    const ussrDeltaHtml =
      ussrDelta > 0 ? `<span class="delta up">↑${ussrDelta}</span>` :
      ussrDelta < 0 ? `<span class="delta down">↓${Math.abs(ussrDelta)}</span>` : "";

    const card = document.createElement("div");
    card.className = `region-card ${regionClass(region)}`;
    card.innerHTML = `
      <div class="region-head">
        <div>
          <div class="region-name">${regionToLabel(region)}</div>
          <div class="region-state">${regionStatus(region)}</div>
        </div>
        <div class="region-index">Region ${idx + 1}</div>
      </div>
      <div class="scores">
        <div class="side-box us">
          <div class="side-label">US</div>
          <div class="side-value-wrap">
            <div class="side-value">${usValue}</div>
            ${usDeltaHtml}
          </div>
        </div>
        <div class="side-box ussr">
          <div class="side-label">USSR</div>
          <div class="side-value-wrap">
            <div class="side-value">${ussrValue}</div>
            ${ussrDeltaHtml}
          </div>
        </div>
      </div>
    `;
    els.regions.appendChild(card);
  });
}

function renderEnemyLogHistory() {
  const items = [...state.enemyLogHistory];

  while (items.length < 3) {
    items.push({ round: "", text: "" });
  }

  els.enemyLog.innerHTML = items
    .map((item, index) => `
      <div class="log-item">
        <div class="log-round">${item.round !== "" ? `Round ${item.round}` : ""}</div>
        <div class="log-main">${item.text || (index === 0 && state.enemyLogHistory.length === 0 ? "Waiting to begin." : "")}</div>
      </div>
    `)
    .join("");
}

function renderStats() {
  const player = scoreSummary(state.playerSide);
  const enemy = scoreSummary(state.enemySide);

  els.enemyFaction.textContent = SIDE_NAME[state.enemySide];
  els.playerFaction.textContent = SIDE_NAME[state.playerSide];

  els.enemyScore.textContent = `${enemy.score}`;
  els.enemyHandCount.textContent = `${state.hands[state.enemySide].length}`;
  els.enemyControlCount.textContent = `${enemy.controls}`;
  els.enemyDominanceCount.textContent = `${enemy.dominances}`;

  els.playerScore.textContent = `${player.score}`;
  els.playerHandCount.textContent = `${state.hands[state.playerSide].length}`;
  els.playerControlCount.textContent = `${player.controls}`;
  els.playerDominanceCount.textContent = `${player.dominances}`;
  els.playerLine.textContent = `Score ${player.score} · Controlled ${player.controls} · Dominated ${player.dominances}`;

  els.roundPill.textContent = `Round ${Math.min(state.round, TOTAL_ROUNDS)} / ${TOTAL_ROUNDS}`;
  const actorName = state.currentActor === state.playerSide ? "Your Turn" : `${SIDE_NAME[state.enemySide]} Turn`;
  const drawText = state.hasDrawn ? "Play 1" : "Draw 1 / Play 1";
  els.turnPill.textContent = `${actorName}: ${drawText}`;
  els.orderPill.textContent =
    state.round < SWITCH_ROUND
      ? `First-half initiative: ${SIDE_NAME[state.firstHalfFirst]}`
      : `Second-half initiative: ${SIDE_NAME[opposite(state.firstHalfFirst)]}`;
}

function findCardInHand(side, uid) {
  return state.hands[side].find(c => c.uid === uid);
}

function renderHand() {
  const hand = state.hands[state.playerSide];
  const totalPages = Math.max(1, Math.ceil(hand.length / 5));
  handPageIndex = clamp(handPageIndex, 0, totalPages - 1);
  els.handPage.textContent = `${handPageIndex + 1} / ${totalPages}`;

  const start = handPageIndex * 5;
  const visible = hand.slice(start, start + 5);

  els.handSlots.forEach((slot, i) => {
    const card = visible[i];
    if (!card) {
      slot.innerHTML = "";
      slot.className = "player-card disabled";
      slot.onclick = null;
      return;
    }

    const legal = state.currentActor === state.playerSide && state.hasDrawn && hasAnyLegalTarget(card, state.playerSide);
    slot.className = `player-card ${legal ? "" : "disabled"}`.trim();
    slot.innerHTML = `
      <div class="card-type">${card.type}</div>
      <div class="card-title">${card.name}</div>
      <div class="card-desc">${card.effect}</div>
      <div class="card-flavor">${card.flavor || ""}</div>
      <div class="card-btn">${legal ? "Select" : "Unavailable"}</div>
    `;
    slot.onclick = legal ? () => openPlayModal(card.uid) : null;
  });

  els.prevHandBtn.disabled = handPageIndex === 0;
  els.nextHandBtn.disabled = handPageIndex >= totalPages - 1;
}

function renderAll() {
  renderRegions();
  renderStats();
  renderEnemyLogHistory();
  renderHand();
}

function removeCardFromHand(side, uid) {
  const idx = state.hands[side].findIndex(c => c.uid === uid);
  if (idx >= 0) {
    const [card] = state.hands[side].splice(idx, 1);
    state.discard.push(card);
    return card;
  }
  return null;
}

function uiConfigForCard(card) {
  return {
    target2: ["twoDifferentPlusOne", "threeDifferentPlusOne", "armsRace", "civilianAid", "kgbOperations"].includes(card.rules),
    target3: ["threeDifferentPlusOne"].includes(card.rules),
    mode: ["selfPlusOneOrOppMinusOne"].includes(card.rules)
  };
}

function getLegalRegionsForCard(card, side, targetIndex = 1) {
  const opp = opposite(side);

  switch (card.rules) {
    case "uncontrolledPlusTwo":
    case "scandalExposure":
      return ALL_REGIONS.filter(r => isUncontrolled(r));

    case "trailByTwoPlusTwo":
      return ALL_REGIONS.filter(r => {
        const gap = getInfluence(r, opp) - getInfluence(r, side);
        return gap >= 1 && gap <= 2;
      });

    case "controlledRegionSanctions":
    case "brinkmanship":
      return ALL_REGIONS.filter(r => isControlledBy(r, opp));

    case "trumanDoctrine":
      return ["Europe", "Middle East"];

    case "technicalAssistance":
      return ALL_REGIONS.filter(r => {
        const gap = getInfluence(r, opp) - getInfluence(r, side);
        return isUncontrolled(r) || (gap >= 1 && gap <= 3);
      });

    case "civilianAid":
      return ["Africa", "Middle East", "Non-Aligned World"];

    case "pragueSpring":
      return ["Europe", "Non-Aligned World"];

    case "khrushchevThaw":
      return ["Europe", "East Asia"];

    case "yalta":
      return ["Europe", "Non-Aligned World"];

    case "marshallPlan":
      return ALL_REGIONS.filter(r => r !== "Europe");

    case "sabotage":
      return ALL_REGIONS.filter(r => diff(r) <= 4);

    case "coupOperation":
      return ALL_REGIONS.filter(r => diff(r) <= 2);

    default:
      return [...ALL_REGIONS];
  }
}

function fillRegionOptions(card) {
  const legal1 = getLegalRegionsForCard(card, state.playerSide, 1);
  const legal2 = getLegalRegionsForCard(card, state.playerSide, 2);
  const legal3 = getLegalRegionsForCard(card, state.playerSide, 3);

  [
    { select: els.target1, legal: legal1 },
    { select: els.target2, legal: legal2 },
    { select: els.target3, legal: legal3 }
  ].forEach(({ select, legal }) => {
    select.innerHTML = "";
    ALL_REGIONS.forEach(r => {
      const opt = document.createElement("option");
      opt.value = r;
      opt.textContent = regionToLabel(r);
      const baseDisabled = !legal.includes(r);
      opt.disabled = baseDisabled;
      opt.dataset.baseDisabled = baseDisabled ? "true" : "false";
      select.appendChild(opt);
    });

    const firstLegal = Array.from(select.options).find(o => !o.disabled);
    select.value = firstLegal ? firstLegal.value : "";
  });

  updateTargetOptionLocks();
}

function updateTargetOptionLocks() {
  const activeSelects = [];

  if (!els.target1.parentElement.classList.contains("hidden")) activeSelects.push(els.target1);
  if (!els.target2Wrap.classList.contains("hidden")) activeSelects.push(els.target2);
  if (!els.target3Wrap.classList.contains("hidden")) activeSelects.push(els.target3);

  activeSelects.forEach((select, index) => {
    Array.from(select.options).forEach(option => {
      const baseDisabled = option.dataset.baseDisabled === "true";
      const usedElsewhere = activeSelects.some((other, i) => i !== index && other.value && other.value === option.value);
      option.disabled = baseDisabled || usedElsewhere;
    });
  });
}

function openPlayModal(uid) {
  const card = findCardInHand(state.playerSide, uid);
  if (!card) return;

  pendingCardId = uid;
  fillRegionOptions(card);

  const cfg = uiConfigForCard(card);

  els.target2Wrap.classList.toggle("hidden", !cfg.target2);
  els.target3Wrap.classList.toggle("hidden", !cfg.target3);
  els.modeWrap.classList.toggle("hidden", !cfg.mode);

  if (NO_TARGET_RULES.includes(card.rules)) {
    els.target1.parentElement.classList.add("hidden");
    els.target2Wrap.classList.add("hidden");
    els.target3Wrap.classList.add("hidden");
  } else {
    els.target1.parentElement.classList.remove("hidden");
  }

  updateTargetOptionLocks();

  els.playTitle.textContent = card.name;
  els.playMeta.textContent = `${card.type} · ${card.effect}`;
  els.playDesc.textContent = card.flavor || "";
  els.playModal.classList.remove("hidden");
}

function closePlayModal() {
  pendingCardId = null;
  els.playModal.classList.add("hidden");
}

function hasAnyLegalTarget(card, side) {
  switch (card.rules) {
    case "twoDifferentPlusOne":
    case "threeDifferentPlusOne":
    case "yalta":
    case "marshallPlan":
    case "nato":
    case "warsawPact":
    case "nonAlignedMovement":
    case "armsRace":
    case "castroRevolution":
    case "bayOfPigs":
    case "kgbOperations":
    case "khrushchevThaw":
    case "detente":
    case "saltI":
    case "intelligenceLeak":
    case "reaganThatcher":
      return true;

    case "vetoResponse":
      return false;

    default:
      return getLegalRegionsForCard(card, side, 1).length > 0;
  }
}

function applyCard(card, side, targets, mode) {
  const opp = opposite(side);
  const [r1, r2, r3] = targets;

  switch (card.rules) {
    case "twoDifferentPlusOne":
      if (r1 === r2) return false;
      addInfluence(r1, side, 1);
      addInfluence(r2, side, 1);
      return true;

    case "uncontrolledPlusTwo":
      if (!isUncontrolled(r1)) return false;
      addInfluence(r1, side, 2);
      return true;

    case "trailByTwoPlusTwo": {
      const gap = getInfluence(r1, opp) - getInfluence(r1, side);
      if (!(gap >= 1 && gap <= 2)) return false;
      addInfluence(r1, side, 2);
      return true;
    }

    case "selfPlusOneOrOppMinusOne":
      if (mode === "oppMinus") addInfluence(r1, opp, -1);
      else addInfluence(r1, side, 1);
      return true;

    case "controlledRegionSanctions":
      if (!isControlledBy(r1, opp)) return false;
      addInfluence(r1, opp, isDominatedBy(r1, opp) ? -1 : -2);
      return true;

    case "threeDifferentPlusOne":
      if (new Set([r1, r2, r3]).size !== 3) return false;
      addInfluence(r1, side, 1);
      addInfluence(r2, side, 1);
      addInfluence(r3, side, 1);
      return true;

    case "yalta":
      addInfluence("Europe", "US", 1);
      addInfluence("Europe", "USSR", 1);
      if (!["Europe", "Non-Aligned World"].includes(r1)) return false;
      addInfluence(r1, side, 1);
      return true;

    case "trumanDoctrine":
      if (!["Europe", "Middle East"].includes(r1)) return false;
      addInfluence(r1, side, isControlledBy(r1, opp) ? 3 : 2);
      return true;

    case "marshallPlan":
      if (!r1 || r1 === "Europe") return false;
      addInfluence("Europe", side, 2);
      addInfluence(r1, side, 1);
      return true;

    case "nato":
      addInfluence("Europe", side, 2);
      return true;

    case "warsawPact":
      addInfluence("Europe", side, 2);
      if (isControlledBy("Europe", side)) addInfluence("East Asia", side, 1);
      return true;

    case "nonAlignedMovement":
      if (isControlledBy("Non-Aligned World", "US") || isControlledBy("Non-Aligned World", "USSR")) {
        addInfluence("Non-Aligned World", "US", -1);
        addInfluence("Non-Aligned World", "USSR", -1);
      }
      addInfluence("Non-Aligned World", side, 2);
      return true;

    case "armsRace":
      if (r1 === r2) return false;
      addInfluence(r1, side, 2);
      addInfluence(r2, side, 1);
      drawCards(state, opp, 1);
      return true;

    case "berlinWall":
      addInfluence("Europe", side, 1);
      return true;

    case "brinkmanship":
      if (!isControlledBy(r1, opp)) return false;
      addInfluence(r1, opp, isDominatedBy(r1, opp) ? -1 : -2);
      return true;

    case "castroRevolution":
      addInfluence("Latin America", side, 3);
      if (getInfluence("Latin America", opp) >= 4) addInfluence("Latin America", opp, -1);
      return true;

    case "bayOfPigs":
      addInfluence("Latin America", opp, -2);
      if (getInfluence("Latin America", side) < getInfluence("Latin America", opp)) addInfluence("Latin America", side, 1);
      return true;

    case "civilianAid": {
      if (r1 === r2) return false;
      const allowed = ["Africa", "Middle East", "Non-Aligned World"];
      if (!allowed.includes(r1) || !allowed.includes(r2)) return false;
      addInfluence(r1, side, 1);
      addInfluence(r2, side, 1);
      return true;
    }

    case "technicalAssistance": {
      const gap = getInfluence(r1, opp) - getInfluence(r1, side);
      if (!(isUncontrolled(r1) || (gap >= 1 && gap <= 3))) return false;
      addInfluence(r1, side, 3);
      return true;
    }

    case "kgbOperations":
      if (r1 === r2) return false;
      addInfluence(r1, opp, -1);
      addInfluence(r2, opp, -1);
      return true;

    case "khrushchevThaw":
      if (!["Europe", "East Asia"].includes(r1)) return false;
      addInfluence(r1, side, 2);
      drawCards(state, side, 1);
      return true;

    case "pragueSpring":
      if (!["Europe", "Non-Aligned World"].includes(r1)) return false;
      if (isDominatedBy(r1, opp)) {
        addInfluence(r1, opp, -1);
        addInfluence(r1, side, 1);
      } else {
        addInfluence(r1, opp, -2);
      }
      return true;

    case "detente":
      drawCards(state, "US", 1);
      drawCards(state, "USSR", 1);
      addInfluence(r1, side, 1);
      return true;

    case "saltI":
      addInfluence(r1, side, 1);
      return true;

    case "reaganThatcher":
      addInfluence("Europe", side, 2);
      if (r1 !== "Europe" && isControlledBy("Europe", side)) addInfluence(r1, side, 1);
      return true;

    case "sabotage":
      if (diff(r1) > 4) return false;
      addInfluence(r1, opp, -2);
      return true;

    case "coupOperation":
      if (diff(r1) > 2) return false;
      addInfluence(r1, side, 2);
      addInfluence(r1, opp, -1);
      return true;

    case "intelligenceLeak": {
      const oppEvent = state.hands[opp].find(c => c.type === "Event" && c.name !== "UN Veto");
      if (oppEvent) removeCardFromHand(opp, oppEvent.uid);
      else drawCards(state, side, 1);
      return true;
    }

    case "scandalExposure":
      if (!isUncontrolled(r1)) return false;
      addInfluence(r1, opp, -1);
      addInfluence(r1, side, 1);
      return true;

    default:
      return false;
  }
}

function formatTargetsText(targets) {
  if (!targets || !targets.length) return "No target";
  const filtered = targets.filter(Boolean);
  return filtered.length ? filtered.join(", ") : "No target";
}

function botShouldUseVeto(pendingEvent) {
  if (!pendingEvent) return false;

  const strongEvents = [
    "Marshall Plan",
    "Truman Doctrine",
    "NATO",
    "Warsaw Pact",
    "Technical Assistance",
    "Castro Revolution",
    "Arms Race",
    "Reagan-Thatcher Alliance"
  ];

  return strongEvents.includes(pendingEvent.card.name);
}

function tryResolveCardWithVeto(card, side, targets, mode) {
  const opp = opposite(side);

  if (card.name === "UN Veto") {
    return { resolved: false, vetoed: false };
  }

  if (card.type === "Event") {
    const vetoCard = state.hands[opp].find(c => c.name === "UN Veto");
    if (vetoCard) {
      state.pendingEvent = {
        card,
        side,
        targets: [...targets],
        mode,
        vetoSide: opp,
        vetoUid: vetoCard.uid
      };

      if (opp === state.playerSide) {
        els.vetoMeta.textContent = `${SIDE_NAME[side]} played event: ${card.name}`;
        els.vetoDesc.textContent = `Effect: ${card.effect}\nTarget: ${formatTargetsText(targets)}`;
        els.vetoModal.classList.remove("hidden");
      } else {
        setTimeout(() => {
          resolvePendingEvent(botShouldUseVeto(state.pendingEvent));
        }, 700);
      }

      return { resolved: false, waitingVeto: true };
    }
  }

  const ok = applyCard(card, side, targets, mode);
  return { resolved: ok, vetoed: false };
}

function queueAdvanceTurn() {
  clearTimeout(turnAdvanceTimer);
  turnAdvanceTimer = setTimeout(() => {
    advanceTurn();
  }, DELTA_PREVIEW_MS);
}

function resolvePendingEvent(useVeto) {
  const pending = state.pendingEvent;
  if (!pending) return;

  const { card, side, targets, mode, vetoSide, vetoUid } = pending;

  if (useVeto) {
    removeCardFromHand(vetoSide, vetoUid);
    removeCardFromHand(side, card.uid);

    if (vetoSide === state.enemySide) {
      pushEnemyLog(
        `${SIDE_NAME[vetoSide]} used UN Veto against your ${card.name}\nOriginal effect: ${card.effect}\nTarget: ${formatTargetsText(targets)}`,
        state.round
      );
    }

    showToast(`${SIDE_NAME[vetoSide]} used UN Veto`);
  } else {
    const ok = applyCard(card, side, targets, mode);
    if (ok) {
      removeCardFromHand(side, card.uid);

      if (side === state.enemySide) {
        pushEnemyLog(
          `${SIDE_NAME[side]} played ${card.name}\nEffect: ${card.effect}\nTarget: ${formatTargetsText(targets)}`,
          state.round
        );
      }
    }
  }

  state.pendingEvent = null;
  els.vetoModal.classList.add("hidden");
  renderAll();
  queueAdvanceTurn();
}

function confirmPlay() {
  const card = findCardInHand(state.playerSide, pendingCardId);
  if (!card) return;

  const targets = NO_TARGET_RULES.includes(card.rules)
    ? []
    : [els.target1.value, els.target2.value, els.target3.value];

  const mode = els.modeSelect.value;
  const result = tryResolveCardWithVeto(card, state.playerSide, targets, mode);

  if (result.waitingVeto) {
    closePlayModal();
    return;
  }

  if (!result.resolved) {
    alert("Illegal target or invalid play.");
    return;
  }

  removeCardFromHand(state.playerSide, card.uid);
  showToast(`You played ${card.name}`);
  closePlayModal();
  renderAll();
  queueAdvanceTurn();
}

function playerDraw() {
  if (state.gameEnded) return;
  if (state.currentActor !== state.playerSide) return;
  if (state.hasDrawn) return;
  if (state.pendingEvent) return;

  drawCards(state, state.playerSide, 1);
  state.hasDrawn = true;
  showToast("You drew 1 card");
  renderAll();
}

function playerNoLegalPlay() {
  if (state.gameEnded) return;
  if (state.currentActor !== state.playerSide) return;
  if (!state.hasDrawn) return;
  if (state.pendingEvent) return;

  const legalExists = state.hands[state.playerSide].some(c => hasAnyLegalTarget(c, state.playerSide));
  if (legalExists) {
    alert("You still have a legal play.");
    return;
  }

  if (state.hands[state.playerSide].length > 0) {
    const discarded = state.hands[state.playerSide].shift();
    state.discard.push(discarded);
  }

  drawCards(state, state.playerSide, 1);
  showToast("You discarded 1 and drew 1");
  advanceTurn();
}

function aiChoosePlay(side) {
  const hand = state.hands[side];
  for (const card of hand) {
    const plan = chooseBestTargets(card, side);
    if (plan) return { card, ...plan };
  }
  return null;
}

function chooseBestTargets(card, side) {
  const opp = opposite(side);

  function regionScore(region) {
    const my = getInfluence(region, side);
    const their = getInfluence(region, opp);
    let score = 0;
    if (isControlledBy(region, opp)) score += 6;
    if (isControlledBy(region, side)) score += 3;
    score += 6 - Math.abs(my - their);
    score += my;
    return score;
  }

  switch (card.rules) {
    case "twoDifferentPlusOne": {
      const sorted = [...ALL_REGIONS].sort((a, b) => regionScore(b) - regionScore(a));
      return { targets: [sorted[0], sorted[1]], mode: "selfPlus" };
    }

    case "uncontrolledPlusTwo": {
      const options = ALL_REGIONS.filter(isUncontrolled).sort((a, b) => regionScore(b) - regionScore(a));
      if (!options.length) return null;
      return { targets: [options[0]], mode: "selfPlus" };
    }

    case "trailByTwoPlusTwo": {
      const options = ALL_REGIONS
        .filter(r => {
          const gap = getInfluence(r, opp) - getInfluence(r, side);
          return gap >= 1 && gap <= 2;
        })
        .sort((a, b) => regionScore(b) - regionScore(a));
      if (!options.length) return null;
      return { targets: [options[0]], mode: "selfPlus" };
    }

    case "selfPlusOneOrOppMinusOne": {
      const best = [...ALL_REGIONS].sort((a, b) => regionScore(b) - regionScore(a))[0];
      return { targets: [best], mode: isControlledBy(best, opp) ? "oppMinus" : "selfPlus" };
    }

    case "controlledRegionSanctions":
    case "brinkmanship": {
      const options = ALL_REGIONS.filter(r => isControlledBy(r, opp)).sort((a, b) => regionScore(b) - regionScore(a));
      if (!options.length) return null;
      return { targets: [options[0]], mode: "selfPlus" };
    }

    case "threeDifferentPlusOne": {
      const sorted = [...ALL_REGIONS].sort((a, b) => regionScore(b) - regionScore(a));
      return { targets: [sorted[0], sorted[1], sorted[2]], mode: "selfPlus" };
    }

    case "yalta":
      return { targets: ["Europe"], mode: "selfPlus" };

    case "trumanDoctrine": {
      const opts = ["Europe", "Middle East"].sort((a, b) => regionScore(b) - regionScore(a));
      return { targets: [opts[0]], mode: "selfPlus" };
    }

    case "marshallPlan": {
      const sorted = [...ALL_REGIONS].filter(r => r !== "Europe").sort((a, b) => regionScore(b) - regionScore(a));
      return { targets: [sorted[0]], mode: "selfPlus" };
    }

    case "nato":
    case "warsawPact":
    case "nonAlignedMovement":
    case "berlinWall":
    case "castroRevolution":
    case "bayOfPigs":
    case "intelligenceLeak":
      return { targets: [], mode: "selfPlus" };

    case "armsRace": {
      const sorted = [...ALL_REGIONS].sort((a, b) => regionScore(b) - regionScore(a));
      return { targets: [sorted[0], sorted[1]], mode: "selfPlus" };
    }

    case "civilianAid": {
      const allowed = ["Africa", "Middle East", "Non-Aligned World"].sort((a, b) => regionScore(b) - regionScore(a));
      return { targets: [allowed[0], allowed[1]], mode: "selfPlus" };
    }

    case "technicalAssistance": {
      const options = ALL_REGIONS
        .filter(r => {
          const gap = getInfluence(r, opp) - getInfluence(r, side);
          return isUncontrolled(r) || (gap >= 1 && gap <= 3);
        })
        .sort((a, b) => regionScore(b) - regionScore(a));
      if (!options.length) return null;
      return { targets: [options[0]], mode: "selfPlus" };
    }

    case "kgbOperations": {
      const sorted = [...ALL_REGIONS].sort((a, b) => regionScore(b) - regionScore(a));
      return { targets: [sorted[0], sorted[1]], mode: "selfPlus" };
    }

    case "khrushchevThaw":
    case "pragueSpring": {
      const pool = card.rules === "khrushchevThaw" ? ["Europe", "East Asia"] : ["Europe", "Non-Aligned World"];
      const opts = pool.sort((a, b) => regionScore(b) - regionScore(a));
      return { targets: [opts[0]], mode: "selfPlus" };
    }

    case "detente":
    case "saltI": {
      const best = [...ALL_REGIONS].sort((a, b) => regionScore(b) - regionScore(a))[0];
      return { targets: [best], mode: "selfPlus" };
    }

    case "reaganThatcher": {
      const sorted = [...ALL_REGIONS].filter(r => r !== "Europe").sort((a, b) => regionScore(b) - regionScore(a));
      return { targets: [sorted[0]], mode: "selfPlus" };
    }

    case "sabotage": {
      const options = ALL_REGIONS.filter(r => diff(r) <= 4).sort((a, b) => regionScore(b) - regionScore(a));
      if (!options.length) return null;
      return { targets: [options[0]], mode: "selfPlus" };
    }

    case "coupOperation": {
      const options = ALL_REGIONS.filter(r => diff(r) <= 2).sort((a, b) => regionScore(b) - regionScore(a));
      if (!options.length) return null;
      return { targets: [options[0]], mode: "selfPlus" };
    }

    case "scandalExposure": {
      const options = ALL_REGIONS.filter(isUncontrolled).sort((a, b) => regionScore(b) - regionScore(a));
      if (!options.length) return null;
      return { targets: [options[0]], mode: "selfPlus" };
    }

    default:
      return null;
  }
}

function maybeBotTurn() {
  if (state.gameEnded) return;
  if (state.currentActor !== state.enemySide) return;
  if (state.pendingEvent) return;

  setTimeout(() => {
    if (!state.hasDrawn) {
      drawCards(state, state.enemySide, 1);
      state.hasDrawn = true;
      showToast(`${SIDE_NAME[state.enemySide]} drew 1 card`);
      renderAll();
    }

    const plan = aiChoosePlay(state.enemySide);

    if (!plan) {
      if (state.hands[state.enemySide].length > 0) {
        const discarded = state.hands[state.enemySide].shift();
        state.discard.push(discarded);
      }
      drawCards(state, state.enemySide, 1);

      pushEnemyLog(`${SIDE_NAME[state.enemySide]} had no legal play and discarded 1, then drew 1.`, state.round);
      showToast(`${SIDE_NAME[state.enemySide]} discarded 1 and drew 1`);
      advanceTurn();
      return;
    }

    const result = tryResolveCardWithVeto(plan.card, state.enemySide, plan.targets, plan.mode);

    if (result.waitingVeto) {
      renderAll();
      return;
    }

    if (result.resolved) {
      removeCardFromHand(state.enemySide, plan.card.uid);

      pushEnemyLog(
        `${SIDE_NAME[state.enemySide]} played ${plan.card.name}\nEffect: ${plan.card.effect}\nTarget: ${formatTargetsText(plan.targets)}`,
        state.round
      );

      showToast(`${SIDE_NAME[state.enemySide]} played ${plan.card.name}`);
      renderAll();
      queueAdvanceTurn();
      return;
    }

    advanceTurn();
  }, 3000);
}

function advanceTurn() {
  clearAllDeltas();

  const currentRoundFirst = getCurrentFirstPlayer(state.round);

  if (state.currentActor === currentRoundFirst) {
    state.currentActor = opposite(currentRoundFirst);
    state.hasDrawn = false;
  } else {
    if (state.round >= TOTAL_ROUNDS) {
      state.gameEnded = true;
      finalizeGame();
      return;
    }

    state.round += 1;
    state.currentActor = getCurrentFirstPlayer(state.round);
    state.hasDrawn = false;
  }

  renderAll();

  if (!state.gameEnded) {
    showToast(
      state.currentActor === state.playerSide
        ? "Your turn"
        : `${SIDE_NAME[state.enemySide]}'s turn`
    );
  }

  if (state.currentActor === state.enemySide && !state.pendingEvent) {
    maybeBotTurn();
  }
}

function finalizeGame() {
  const player = scoreSummary(state.playerSide);
  const enemy = scoreSummary(state.enemySide);

  let playerFinalScore = player.score;
  let enemyFinalScore = enemy.score;
  let result = "";

  if (playerFinalScore > enemyFinalScore) {
    result = "You Win";
  } else if (playerFinalScore < enemyFinalScore) {
    result = `${SIDE_NAME[state.enemySide]} Wins`;
  } else {
    if (player.dominances > enemy.dominances) {
      playerFinalScore += 1;
      result = "You Win by Dominance";
    } else if (player.dominances < enemy.dominances) {
      enemyFinalScore += 1;
      result = `${SIDE_NAME[state.enemySide]} Wins by Dominance`;
    } else if (player.totalInfluence > enemy.totalInfluence) {
      playerFinalScore += 1;
      result = "You Win by Total Influence";
    } else if (player.totalInfluence < enemy.totalInfluence) {
      enemyFinalScore += 1;
      result = `${SIDE_NAME[state.enemySide]} Wins by Total Influence`;
    } else if (getInfluence("Europe", state.playerSide) > getInfluence("Europe", state.enemySide)) {
      playerFinalScore += 1;
      result = "You Win by Europe Influence";
    } else if (getInfluence("Europe", state.playerSide) < getInfluence("Europe", state.enemySide)) {
      enemyFinalScore += 1;
      result = `${SIDE_NAME[state.enemySide]} Wins by Europe Influence`;
    } else {
      result = "Draw";
    }
  }

  els.toast.classList.add("hidden");

  els.resultTitle.textContent = result;
  els.resultSub.textContent = `The game lasted ${TOTAL_ROUNDS} rounds.`;
  els.resultPlayerFaction.textContent = SIDE_NAME[state.playerSide];
  els.resultEnemyFaction.textContent = SIDE_NAME[state.enemySide];
  els.resultPlayerScore.textContent = `${playerFinalScore}`;
  els.resultEnemyScore.textContent = `${enemyFinalScore}`;

  pushEnemyLog(`Match ended: ${result}`, TOTAL_ROUNDS);

  els.resultOverlay.classList.remove("hidden");
  renderAll();
}

function bindIntro() {
  els.toVictoryBtn.onclick = () => showIntroStep(els.step2);
  els.backToIntroBtn.onclick = () => showIntroStep(els.step1);
  els.toFactionBtn.onclick = () => showIntroStep(els.step3);
  els.backToVictoryBtn.onclick = () => showIntroStep(els.step2);

  els.pickUSBtn.onclick = () => {
    selectedFaction = "US";
    els.pickUSBtn.classList.add("selected");
    els.pickUSSRBtn.classList.remove("selected");
  };

  els.pickUSSRBtn.onclick = () => {
    selectedFaction = "USSR";
    els.pickUSSRBtn.classList.add("selected");
    els.pickUSBtn.classList.remove("selected");
  };

  els.startGameBtn.onclick = () => {
    els.introOverlay.classList.add("hidden");
    setupGame();
  };
}

function bindUI() {
  els.rulesBtn.onclick = () => els.rulesPopup.classList.toggle("hidden");
  els.closeRulesBtn.onclick = () => els.rulesPopup.classList.add("hidden");

  els.drawBtn.onclick = playerDraw;
  els.noLegalBtn.onclick = playerNoLegalPlay;

  els.prevHandBtn.onclick = () => {
    handPageIndex = Math.max(0, handPageIndex - 1);
    renderHand();
  };

  els.nextHandBtn.onclick = () => {
    const pages = Math.max(1, Math.ceil(state.hands[state.playerSide].length / 5));
    handPageIndex = Math.min(pages - 1, handPageIndex + 1);
    renderHand();
  };

  els.cancelPlayBtn.onclick = closePlayModal;
  els.confirmPlayBtn.onclick = confirmPlay;

  [els.target1, els.target2, els.target3].forEach(select => {
    select.addEventListener("change", updateTargetOptionLocks);
  });

  els.useVetoBtn.onclick = () => resolvePendingEvent(true);
  els.declineVetoBtn.onclick = () => resolvePendingEvent(false);

  els.restartBtn.onclick = () => window.location.reload();
}

bindIntro();
bindUI();
// =====================================================================
//  Valeurs par défaut (utilisées tant qu'aucune date n'a été enregistrée
//  via le bouton ⚙). Tu peux laisser tel quel : tout se règle désormais
//  depuis l'interface.
//
//  Rappel : dans Date(...), le mois part de 0 (juillet = 6, juin = 5).
// =====================================================================
const DEFAULT_TARGET = new Date(2026, 6, 10, 17, 1, 0); // ven. 10 juil. 2026, 17h01
const DEFAULT_START  = new Date(2026, 5, 15, 0, 0, 0);  // 15 juin 2026

// État courant (peut être remplacé par les réglages enregistrés)
let TARGET = DEFAULT_TARGET;
let START  = DEFAULT_START;
let timerId = null;

const $ = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2, "0");

const hasStorage =
  typeof chrome !== "undefined" && chrome.storage && chrome.storage.local;

// ---------- Conversions <-> valeurs des champs ----------
function dtLocalValue(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function dateValue(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function parseDtLocal(v) {
  const [date, time] = v.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, 0);
}
function parseDate(v) {
  const [y, m, d] = v.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0);
}

// ---------- Affichage ----------
function formatTarget(d) {
  const date = d.toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  return `${date} à ${d.getHours()}h${pad(d.getMinutes())}`;
}

function message(days, hours) {
  if (days > 14) return "encore un peu de patience";
  if (days > 5) return "ça se rapproche";
  if (days > 1) return "dernière ligne droite";
  if (days === 1) return "c'est pour demain";
  if (hours > 1) return "presque l'heure";
  return "ça arrive";
}

function renderCountdown(now) {
  const totalSec = Math.floor((TARGET - now) / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  $("days").textContent = days;
  $("hours").textContent = pad(hours);
  $("mins").textContent = pad(mins);
  $("secs").textContent = pad(secs);

  const span = TARGET - START;
  let p = span > 0 ? (now - START) / span : 1;
  p = Math.max(0, Math.min(1, p));
  const pct = Math.round(p * 100);

  const hue = Math.round(p * 140); // 0 = rouge, 140 = vert
  const head = `hsl(${hue}, 78%, 52%)`;
  const fill = $("fill");
  fill.style.width = `${p * 100}%`;
  fill.style.background = `linear-gradient(90deg, hsl(2, 80%, 52%), ${head})`;

  $("bar").setAttribute("aria-valuenow", String(pct));
  $("pct").textContent = `${pct}\u00A0%`;
  $("pct").style.color = head;
  $("msg").textContent = message(days, hours);
}

function renderDone() {
  document.body.classList.add("done");
  $("target").textContent = "C'est les congés \u{1F3D6}\u{FE0F}";
  $("days").textContent = "0";
  $("hours").textContent = "00";
  $("mins").textContent = "00";
  $("secs").textContent = "00";
  const fill = $("fill");
  fill.style.width = "100%";
  fill.style.background = "linear-gradient(90deg, #10b981, #34d399)";
  $("bar").setAttribute("aria-valuenow", "100");
  $("pct").textContent = "100\u00A0%";
  $("pct").style.color = "#34d399";
  $("msg").textContent = "profite bien";
}

function tick() {
  const now = new Date();
  if (TARGET - now <= 0) {
    renderDone();
    return false;
  }
  document.body.classList.remove("done");
  renderCountdown(now);
  return true;
}

function startLoop() {
  if (timerId) clearInterval(timerId);
  $("target").textContent = formatTarget(TARGET);
  if (tick()) {
    timerId = setInterval(() => {
      if (!tick()) { clearInterval(timerId); timerId = null; }
    }, 1000);
  }
}

// ---------- Paramètres ----------
function showSettings(show) {
  $("view-count").hidden = show;
  $("view-settings").hidden = !show;
  if (show) {
    $("targetInput").value = dtLocalValue(TARGET);
    $("startInput").value = dateValue(START);
    $("hint").textContent = "";
  }
}

function saveSettings() {
  const tv = $("targetInput").value;
  const sv = $("startInput").value;
  if (!tv) { $("hint").textContent = "Indique une date et une heure de congés."; return; }
  if (!sv) { $("hint").textContent = "Indique une date de début pour la barre."; return; }

  const newTarget = parseDtLocal(tv);
  const newStart = parseDate(sv);
  if (newStart >= newTarget) {
    $("hint").textContent = "Le début doit être avant la date des congés.";
    return;
  }

  TARGET = newTarget;
  START = newStart;
  if (hasStorage) {
    chrome.storage.local.set({ targetISO: tv, startISO: sv });
  }
  showSettings(false);
  startLoop();
}

function resetSettings() {
  TARGET = DEFAULT_TARGET;
  START = DEFAULT_START;
  if (hasStorage) chrome.storage.local.remove(["targetISO", "startISO"]);
  $("targetInput").value = dtLocalValue(TARGET);
  $("startInput").value = dateValue(START);
  $("hint").textContent = "Valeurs par défaut restaurées.";
}

$("gear").addEventListener("click", () => showSettings($("view-settings").hidden));
$("cancel").addEventListener("click", () => showSettings(false));
$("save").addEventListener("click", saveSettings);
$("reset").addEventListener("click", resetSettings);

// ---------- Démarrage ----------
function init(data) {
  if (data && data.targetISO) TARGET = parseDtLocal(data.targetISO);
  if (data && data.startISO) START = parseDate(data.startISO);
  startLoop();
}

if (hasStorage) {
  chrome.storage.local.get(["targetISO", "startISO"], init);
} else {
  init(null);
}

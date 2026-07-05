// ═══════════════════════════════════════════════════════════════
// mikeandadam Cloud Functions — notifications engine
// Rewritten 2026-07-05: data-only pushes (no double notifications),
// everything on Eastern time, daily couple digest, smart memory
// prompts, instant Firestore-trigger pushes for tasks + training.
// Deploy: firebase deploy --only functions   (from repo root)
// ═══════════════════════════════════════════════════════════════
const { setGlobalOptions } = require("firebase-functions");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated, onDocumentUpdated, onDocumentWritten } = require("firebase-functions/v2/firestore");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const { initializeApp } = require("firebase-admin/app");
const logger = require("firebase-functions/logger");

initializeApp();
setGlobalOptions({ maxInstances: 10, region: "us-central1" });

const db = getFirestore();
const ET = "America/New_York";
const APP_URL = "https://mikeandadam.app";

// ── Eastern-time date helpers (NEVER use toISOString for "today") ──
function etNow() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: ET }));
}
function toYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function etTodayStr() { return toYMD(etNow()); }
function addDays(ymd, n) {
  const d = new Date(ymd + "T12:00:00");
  d.setDate(d.getDate() + n);
  return toYMD(d);
}
function fmtDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
function etHour() { return etNow().getHours(); }
function inQuietHours() { const h = etHour(); return h >= 22 || h < 7; }

// ── Notification preferences (tripData/notifyPrefs) ──
// Shape: { mike: {digest:true, instant:true, memory:true}, adam: {...} }
// Missing doc/keys default to true.
async function getPrefs() {
  try {
    const snap = await db.collection("tripData").doc("notifyPrefs").get();
    return snap.exists ? snap.data() : {};
  } catch (e) { return {}; }
}
function prefAllows(prefs, person, kind) {
  const p = prefs?.[person];
  if (!p) return true;
  return p[kind] !== false;
}

// ── Data-only push (the SW displays it; never send `notification`
//    or the browser AND the SW will both show it → duplicates) ──
async function dataPush(person, token, { title, body, url, tag }) {
  const messaging = getMessaging();
  try {
    await messaging.send({
      token,
      data: {
        title: title || "Mike & Adam",
        body: body || "",
        url: url || APP_URL,
        tag: tag || "mikeandadam",
      },
      webpush: { headers: { Urgency: "high", TTL: "43200" } },
    });
    return true;
  } catch (error) {
    logger.error(`Push failed for ${person}:`, error.message);
    if (error.code === "messaging/registration-token-not-registered" ||
        error.code === "messaging/invalid-registration-token") {
      await db.collection("tripData").doc("fcmTokens").update({ [person]: FieldValue.delete() })
        .catch(() => {});
    }
    return false;
  }
}

// Send to everyone (or a subset). kind gates against notifyPrefs.
// opts: { only: 'mike'|'adam', except: 'mike'|'adam', kind: 'digest'|'instant'|'memory' }
async function sendPush({ title, body, url, tag }, opts = {}) {
  const tokensDoc = await db.collection("tripData").doc("fcmTokens").get();
  if (!tokensDoc.exists) { logger.warn("No FCM tokens doc."); return { sent: 0 }; }
  const tokens = tokensDoc.data();
  const prefs = await getPrefs();
  let sent = 0;
  for (const [person, token] of Object.entries(tokens)) {
    if (!token || typeof token !== "string") continue;
    if (opts.only && person !== opts.only) continue;
    if (opts.except && person === opts.except) continue;
    if (opts.kind && !prefAllows(prefs, person, opts.kind)) continue;
    if (await dataPush(person, token, { title, body, url, tag })) sent++;
  }
  return { sent };
}

// ── Firestore readers (subcollection first, legacy array fallback) ──
async function readTasks() {
  const col = await db.collection("tripData").doc("sharedHub").collection("tasks").get();
  if (!col.empty) return col.docs.map((d) => d.data());
  const hub = await db.collection("tripData").doc("sharedHub").get();
  return hub.exists ? (hub.data().tasks || []) : [];
}
async function readMemories() {
  const col = await db.collection("tripData").doc("shared").collection("memories").get();
  if (!col.empty) return col.docs.map((d) => d.data());
  const shared = await db.collection("tripData").doc("shared").get();
  return shared.exists ? (shared.data().memories || []) : [];
}
async function readShared() {
  const snap = await db.collection("tripData").doc("shared").get();
  return snap.exists ? snap.data() : {};
}
async function readHubDoc() {
  const snap = await db.collection("tripData").doc("sharedHub").get();
  return snap.exists ? snap.data() : {};
}
async function readFitness() {
  const snap = await db.collection("tripData").doc("fitness").get();
  return snap.exists ? snap.data() : {};
}
async function readPartyEvents() {
  const snap = await db.collection("tripData").doc("partyEvents").get();
  return snap.exists ? (snap.data().events || []) : [];
}

// ── Digest builders ──
function todaysTraining(fitness, todayStr) {
  const out = [];
  const plans = fitness.trainingPlans || {};
  const events = fitness.events || [];
  for (const [eventId, weeks] of Object.entries(plans)) {
    const ev = events.find((e) => e.id === eventId);
    if (ev && ev.status === "completed") continue;
    if (!Array.isArray(weeks)) continue;
    const week = weeks.find((w) => w.startDate <= todayStr && todayStr <= w.endDate);
    if (!week) continue;
    const remaining = (week.runs || []).filter((r) => !(r.mike && ("adam" in r ? r.adam : true)));
    if (remaining.length === 0) continue;
    out.push({
      eventName: ev?.name || eventId,
      weekNumber: week.weekNumber,
      weekNotes: week.weekNotes || "",
      isRaceWeek: !!week.isRaceWeek,
      runs: remaining.map((r) => `${r.label} ${r.distance}${r.mike ? " (Adam left)" : ""}${(("adam" in r) && r.adam && !r.mike) ? " (Mike left)" : ""}`),
    });
  }
  return out;
}
function tasksDue(tasks, todayStr) {
  const open = tasks.filter((t) => t.status !== "done");
  const due = open.filter((t) =>
    (t.dueDate && t.dueDate <= todayStr) || t.timeHorizon === "today");
  const overdue = due.filter((t) => t.dueDate && t.dueDate < todayStr);
  return { due, overdue };
}
function upcoming(shared, partyEvents, todayStr, horizonDays) {
  const until = addDays(todayStr, horizonDays);
  const tripStart = (t) => t.dates?.start || t.start; // native trips use dates.{start,end}
  const trips = (shared.trips || []).filter((t) => tripStart(t) && tripStart(t) >= todayStr && tripStart(t) <= until);
  const events = partyEvents.filter((e) => e.date && e.date >= todayStr && e.date <= until);
  return { trips, events };
}
function lookbackMemories(memories, todayStr) {
  // "One year ago this week" — same ISO week last year, +/- 3 days.
  const target = addDays(todayStr, -365);
  const lo = addDays(target, -3);
  const hi = addDays(target, 3);
  return memories.filter((m) => m.date && m.date >= lo && m.date <= hi);
}
function daysSinceLastMemory(memories) {
  const dates = memories.map((m) => m.date).filter(Boolean).sort();
  if (dates.length === 0) return null;
  const last = new Date(dates[dates.length - 1] + "T12:00:00");
  return Math.floor((etNow() - last) / 86400000);
}

// ═══════════════════════════════════════════════
// Daily couple digest — 7:30 AM ET.
// Weekdays: today's training + tasks due + near-term events/trips.
// Sundays: week-ahead edition + "one year ago this week" lookback.
// ═══════════════════════════════════════════════
exports.coupleDigest = onSchedule(
  { schedule: "30 7 * * *", timeZone: ET, retryCount: 1 },
  async () => {
    const todayStr = etTodayStr();
    const isSunday = etNow().getDay() === 0;
    const [fitness, tasks, shared, partyEvents, memories] = await Promise.all([
      readFitness(), readTasks(), readShared(), readPartyEvents(), readMemories(),
    ]);

    const lines = [];
    const training = todaysTraining(fitness, todayStr);
    for (const t of training) {
      lines.push(`🏃 ${t.eventName} wk${t.weekNumber}: ${t.runs.join(" · ")}`);
      if (t.isRaceWeek) lines.push("🏁 RACE WEEK!");
    }

    const { due, overdue } = tasksDue(tasks, todayStr);
    if (due.length > 0) {
      const names = due.slice(0, 4).map((t) => t.title).join(", ");
      lines.push(`✅ Due: ${names}${due.length > 4 ? ` +${due.length - 4}` : ""}${overdue.length ? ` (${overdue.length} overdue)` : ""}`);
    }

    const near = upcoming(shared, partyEvents, todayStr, isSunday ? 7 : 3);
    for (const trip of near.trips) {
      lines.push(`✈️ ${trip.emoji || ""} ${trip.name || trip.destination} — ${fmtDate(trip.dates?.start || trip.start)}`);
    }
    for (const ev of near.events) {
      lines.push(`🎉 ${ev.title || ev.name} — ${fmtDate(ev.date)}`);
    }

    if (isSunday) {
      const lb = lookbackMemories(memories, todayStr);
      if (lb.length > 0) {
        const m = lb[0];
        lines.push(`💝 One year ago: ${m.title}${m.location ? ` (${m.location})` : ""}`);
      }
      const hub = await readHubDoc();
      const openLists = (hub.lists || []).filter((l) => l.status === "active" && (l.items || []).some((i) => !i.checked)).length;
      if (openLists) lines.push(`📝 ${openLists} lists with open items`);
    }

    if (lines.length === 0) {
      logger.info("coupleDigest: nothing to say today, skipping push.");
      return;
    }
    const title = isSunday ? "🗓️ Your week together" : "☀️ Today together";
    await sendPush(
      { title, body: lines.join("\n"), url: APP_URL + "/home", tag: "digest" },
      { kind: "digest" }
    );
    logger.info("coupleDigest sent", { lines: lines.length, isSunday });
  }
);

// ═══════════════════════════════════════════════
// Post-event memory prompts — 10:00 AM ET daily.
// If a trip ended or a race happened yesterday → "add your photos".
// ═══════════════════════════════════════════════
exports.memoryPrompt = onSchedule(
  { schedule: "0 10 * * *", timeZone: ET, retryCount: 1 },
  async () => {
    const yesterday = addDays(etTodayStr(), -1);
    const [shared, fitness, partyEvents] = await Promise.all([
      readShared(), readFitness(), readPartyEvents(),
    ]);
    const prompts = [];
    for (const trip of shared.trips || []) {
      const end = trip.dates?.end || trip.end;
      if (end === yesterday) prompts.push(`your ${trip.name || trip.destination} trip`);
    }
    for (const ev of fitness.events || []) {
      if (ev.date === yesterday) prompts.push(`the ${ev.name}`);
    }
    for (const ev of partyEvents) {
      if (ev.date === yesterday) prompts.push(ev.title || ev.name);
    }
    if (prompts.length === 0) return;
    await sendPush({
      title: "📸 Capture it while it's fresh",
      body: `Add photos + a memory from ${prompts.join(" and ")} 💛`,
      url: APP_URL + "/memories",
      tag: "memory-prompt",
    }, { kind: "memory" });
    logger.info("memoryPrompt sent", { prompts });
  }
);

// ═══════════════════════════════════════════════
// Biweekly fallback memory nudge — Saturdays 10 AM ET, every other
// week, and only when it's actually been a while (≥10 days).
// ═══════════════════════════════════════════════
function isMemoryOnWeek() {
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const epochWeek = Math.floor(Date.now() / weekMs);
  return epochWeek % 2 === 0;
}
exports.memoryReminder = onSchedule(
  { schedule: "every saturday 10:00", timeZone: ET, retryCount: 1 },
  async () => {
    if (!isMemoryOnWeek()) return;
    const memories = await readMemories();
    const days = daysSinceLastMemory(memories);
    if (days !== null && days < 10) {
      logger.info(`memoryReminder: last memory ${days}d ago, skipping.`);
      return;
    }
    const body = days === null
      ? "You haven't logged any memories yet — capture a moment together. 💛"
      : `It's been ${days} days since your last memory. Add one before it fades. 💛`;
    await sendPush(
      { title: "📸 Time to make a memory", body, url: APP_URL + "/memories", tag: "memory-nudge" },
      { kind: "memory" }
    );
  }
);

// ═══════════════════════════════════════════════
// Instant: task assigned → push the assignee.
// Fires on tripData/sharedHub/tasks/{taskId} creation (subcollection
// model, Phase 2). Suppressed during quiet hours (22:00–07:00 ET).
// ═══════════════════════════════════════════════
function normPerson(v) {
  const s = String(v || "").toLowerCase();
  return s === "mike" || s === "adam" ? s : null;
}
exports.taskAssigned = onDocumentCreated("tripData/sharedHub/tasks/{taskId}", async (event) => {
  if (inQuietHours()) return;
  const task = event.data?.data();
  if (!task || task._migrated) return;
  const assignee = normPerson(task.assignedTo);
  const creator = normPerson(task.createdBy);
  if (!assignee || assignee === creator) return; // self-assigned or "both"
  const due = task.dueDate ? ` (due ${fmtDate(task.dueDate)})` : "";
  await sendPush({
    title: "📝 New task for you",
    body: `${task.title}${due}`,
    url: APP_URL + "/home",
    tag: `task-${event.params.taskId}`,
  }, { only: assignee, kind: "instant" });
});

// ═══════════════════════════════════════════════
// Instant: task completed → tell the other person.
// ═══════════════════════════════════════════════
exports.taskCompleted = onDocumentUpdated("tripData/sharedHub/tasks/{taskId}", async (event) => {
  if (inQuietHours()) return;
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();
  if (!before || !after) return;
  if (before.status === "done" || after.status !== "done") return;
  const who = normPerson(after.completedBy) || normPerson(after.updatedBy);
  if (!who) return;
  const name = who === "mike" ? "Mike" : "Adam";
  await sendPush({
    title: `✅ ${name} finished a task`,
    body: after.title,
    url: APP_URL + "/home",
    tag: `task-${event.params.taskId}`,
  }, { except: who, kind: "instant" });
});

// ═══════════════════════════════════════════════
// Instant: training run checked off → tell the other person.
// Diffs tripData/fitness trainingPlans person-flags false→true.
// ═══════════════════════════════════════════════
exports.trainingActivity = onDocumentWritten("tripData/fitness", async (event) => {
  if (inQuietHours()) return;
  const before = event.data?.before?.exists ? event.data.before.data() : null;
  const after = event.data?.after?.exists ? event.data.after.data() : null;
  if (!before || !after) return;
  const who = normPerson(after.updatedBy);
  if (!who) return;
  const bPlans = before.trainingPlans || {};
  const aPlans = after.trainingPlans || {};
  const newlyDone = [];
  for (const [planId, aWeeks] of Object.entries(aPlans)) {
    const bWeeks = bPlans[planId];
    if (!Array.isArray(aWeeks) || !Array.isArray(bWeeks)) continue;
    for (const aWeek of aWeeks) {
      const bWeek = bWeeks.find((w) => w.weekNumber === aWeek.weekNumber);
      if (!bWeek) continue;
      for (const kind of ["runs", "crossTraining"]) {
        for (const aItem of aWeek[kind] || []) {
          const bItem = (bWeek[kind] || []).find((r) => r.id === aItem.id);
          if (!bItem) continue;
          if (aItem[who] === true && bItem[who] !== true) {
            newlyDone.push(`${aItem.label}${aItem.distance ? ` (${aItem.distance})` : ""}`);
          }
        }
      }
    }
  }
  if (newlyDone.length === 0) return;
  const name = who === "mike" ? "Mike" : "Adam";
  await sendPush({
    title: `👟 ${name} just logged a workout`,
    body: newlyDone.join(" · "),
    url: APP_URL + "/fitness",
    tag: "training-activity", // same tag → rapid check-offs replace, not stack
  }, { except: who, kind: "instant" });
});

// ═══════════════════════════════════════════════
// Test endpoints (no auth — they only READ + preview, except sendTest)
// ═══════════════════════════════════════════════
exports.testDigest = onRequest(async (req, res) => {
  const todayStr = etTodayStr();
  const [fitness, tasks, shared, partyEvents, memories] = await Promise.all([
    readFitness(), readTasks(), readShared(), readPartyEvents(), readMemories(),
  ]);
  res.json({
    todayET: todayStr,
    training: todaysTraining(fitness, todayStr),
    tasksDue: tasksDue(tasks, todayStr),
    upcoming: upcoming(shared, partyEvents, todayStr, 7),
    lookback: lookbackMemories(memories, todayStr),
    daysSinceLastMemory: daysSinceLastMemory(memories),
    taskSource: tasks.length ? "ok" : "empty",
  });
});

exports.sendTest = onRequest(async (req, res) => {
  const result = await sendPush({
    title: "🧪 Test from mikeandadam",
    body: "Data-only push pipeline is working.",
    url: APP_URL,
    tag: "test",
  });
  res.json(result);
});

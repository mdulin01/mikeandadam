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

// ── Couple poll invitation ──
// Creating a poll can optionally invite one partner. The poll stays generic;
// content and recipient come from the document, while this function preserves
// the app's data-only push pattern.
exports.tripPollCreated = onDocumentCreated("tripData/tripPolls/polls/{pollId}", async (event) => {
  const poll = event.data?.data();
  const invite = poll?.invite;
  if (!invite?.recipient || !['mike', 'adam'].includes(invite.recipient)) return;

  const result = await sendPush({
    title: invite.title || poll.title || "A new trip poll is ready",
    body: invite.body || "Open Mike & Adam to make your picks.",
    url: invite.url || `${APP_URL}/?poll=${event.params.pollId}`,
    tag: invite.tag || `trip-poll-${event.params.pollId}`,
  }, { only: invite.recipient, kind: 'instant' });

  await event.data.ref.set({
    inviteResult: {
      sent: result.sent,
      attemptedAt: new Date().toISOString(),
    },
  }, { merge: true });
});

// Notify Mike as soon as Adam submits or changes a poll response. A write made
// below records delivery, but the submittedAt guard prevents a notification
// loop when that bookkeeping update re-triggers this function.
exports.tripPollResponded = onDocumentUpdated("tripData/tripPolls/polls/{pollId}", async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  const beforeAt = before?.responses?.adam?.submittedAt;
  const afterAt = after?.responses?.adam?.submittedAt;
  if (!afterAt || beforeAt === afterAt) return;

  const isUpdate = Boolean(beforeAt);
  const result = await sendPush({
    title: isUpdate ? "Adam updated his Durham picks" : "Adam finished the Durham survey 🗳️",
    body: "Open Mike & Adam to compare his hotel, dinner and Sunday choices.",
    url: `${APP_URL}/?poll=${event.params.pollId}`,
    tag: `trip-poll-result-${event.params.pollId}`,
  }, { only: 'mike', kind: 'instant' });

  await event.data.after.ref.set({
    responseNotifications: {
      adam: {
        sent: result.sent,
        responseAt: afterAt,
        attemptedAt: new Date().toISOString(),
      },
    },
  }, { merge: true });
});

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
async function readCheckins() {
  const col = await db.collection("tripData").doc("checkins").collection("entries").get();
  return col.docs.map((d) => d.data());
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
// Week Kickoff — MONDAYS 7:30 AM ET only. The notification diet:
// at most ONE scheduled push per day, themed by weekday —
//   Mon: week kickoff · Wed: memory · Fri: training pulse · Sun: check-in
//   + event-driven travel prep (T-21/14/7/2) and rare instants.
// ═══════════════════════════════════════════════
exports.coupleDigest = onSchedule(
  { schedule: "30 7 * * 1", timeZone: ET, retryCount: 1 },
  async () => {
    const todayStr = etTodayStr();
    const weekEnd = addDays(todayStr, 6);
    const [fitness, tasks, shared, partyEvents] = await Promise.all([
      readFitness(), readTasks(), readShared(), readPartyEvents(),
    ]);

    const lines = [];

    // This week's training plan (the whole week once — no per-day nagging).
    const plans = fitness.trainingPlans || {};
    const events = fitness.events || [];
    for (const [eventId, weeks] of Object.entries(plans)) {
      const ev = events.find((e) => e.id === eventId);
      if (ev && ev.status === "completed") continue;
      if (!Array.isArray(weeks)) continue;
      const week = weeks.find((w) => w.startDate <= todayStr && todayStr <= w.endDate);
      if (!week || (week.runs || []).length === 0) continue;
      const runList = (week.runs || []).map((r) => r.distance).join(" / ");
      lines.push(`🏃 ${ev?.name || eventId} wk${week.weekNumber}: ${runList}${week.isRaceWeek ? " — 🏁 RACE WEEK!" : ""}`);
      if (week.weekNotes) lines.push(`   ${week.weekNotes}`);
    }

    // Tasks due this week.
    const open = tasks.filter((t) => t.status !== "done");
    const dueThisWeek = open.filter((t) => t.dueDate && t.dueDate <= weekEnd);
    if (dueThisWeek.length > 0) {
      lines.push(`✅ Due this week: ${dueThisWeek.slice(0, 4).map((t) => t.title).join(", ")}${dueThisWeek.length > 4 ? ` +${dueThisWeek.length - 4}` : ""}`);
    }

    // Events this week + trip countdowns (60 days out).
    const near = upcoming(shared, partyEvents, todayStr, 7);
    for (const ev of near.events) lines.push(`🎉 ${ev.title || ev.name} — ${fmtDate(ev.date)}`);
    const tripStart = (t) => t.dates?.start || t.start;
    const horizon = addDays(todayStr, 60);
    for (const trip of (shared.trips || [])) {
      const start = tripStart(trip);
      if (!start || start < todayStr || start > horizon) continue;
      const days = Math.round((new Date(start + "T12:00:00") - new Date(todayStr + "T12:00:00")) / 86400000);
      lines.push(`✈️ ${trip.destination || trip.name} — ${days === 0 ? "TODAY!" : `in ${days} days`}`);
    }

    if (lines.length === 0) { logger.info("weekKickoff: quiet week."); return; }
    await sendPush(
      { title: "🗓️ Your week together", body: lines.join("\n"), url: APP_URL + "/home", tag: "digest" },
      { kind: "digest" }
    );
    logger.info("weekKickoff sent", { lines: lines.length });
  }
);

// ═══════════════════════════════════════════════
// Travel prep — checked daily 10 AM ET, but a trip only fires at EXACTLY
// 21 / 14 / 7 / 2 days out: four well-spaced prompts per trip, total.
// ═══════════════════════════════════════════════
const TRAVEL_STAGES = {
  21: (name) => `${name} is 3 weeks out 🗓️ — good week to book dinners & activities before they fill up.`,
  14: (name) => `Two weeks to ${name} — lock in reservations and give the itinerary a once-over.`,
  7: (name) => `One week to ${name}! Time to start the packing list 🧳`,
  2: (name) => `${name} in 2 days — review the packing list + travel details today.`,
};
exports.travelPrep = onSchedule(
  { schedule: "0 10 * * *", timeZone: ET, retryCount: 1 },
  async () => {
    const todayStr = etTodayStr();
    const shared = await readShared();
    const tripStart = (t) => t.dates?.start || t.start;
    for (const trip of (shared.trips || [])) {
      const start = tripStart(trip);
      if (!start || start < todayStr) continue;
      const days = Math.round((new Date(start + "T12:00:00") - new Date(todayStr + "T12:00:00")) / 86400000);
      const stage = TRAVEL_STAGES[days];
      if (!stage) continue;
      const name = trip.destination || trip.name || "your trip";
      await sendPush({
        title: `✈️ ${name} — ${days} days to go`,
        body: stage(name),
        url: APP_URL + "/events",
        tag: `travel-prep-${trip.id}`,
      }, { kind: "digest" });
      logger.info("travelPrep sent", { trip: name, days });
    }
  }
);

// ═══════════════════════════════════════════════
// Training pulse — FRIDAYS 5 PM ET. Positive-first: celebrate what got
// logged this week; nudge gently only if the plan week is untouched.
// ═══════════════════════════════════════════════
exports.trainingPulse = onSchedule(
  { schedule: "0 17 * * 5", timeZone: ET, retryCount: 1 },
  async () => {
    const todayStr = etTodayStr();
    const fitness = await readFitness();
    const plans = fitness.trainingPlans || {};
    const events = fitness.events || [];
    for (const [eventId, weeks] of Object.entries(plans)) {
      const ev = events.find((e) => e.id === eventId);
      if (ev && ev.status === "completed") continue;
      if (!Array.isArray(weeks)) continue;
      const week = weeks.find((w) => w.startDate <= todayStr && todayStr <= w.endDate);
      if (!week || (week.runs || []).length === 0) continue;
      const runs = week.runs || [];
      const doneMike = runs.filter((r) => r.mike).length;
      const doneAdam = runs.filter((r) => ("adam" in r ? r.adam : r.mike)).length;
      const total = runs.length;
      let body;
      if (doneMike + doneAdam === 0) {
        body = `Week ${week.weekNumber} of ${ev?.name || "training"} is still open — ${total} runs, and the weekend is right there. 🌤️`;
      } else if (doneMike >= total && doneAdam >= total) {
        body = `Week ${week.weekNumber} DONE — all ${total} runs, both of you. ${week.isRaceWeek ? "See you at the finish line! 🏁" : "Strong work 💪"}`;
      } else {
        body = `This week so far: Mike ${doneMike}/${total} · Adam ${doneAdam}/${total}. Weekend miles count double (emotionally). 💪`;
      }
      await sendPush({
        title: "🏃 Training pulse",
        body,
        url: APP_URL + "/fitness",
        tag: "training-pulse",
      }, { kind: "digest" });
      logger.info("trainingPulse sent", { eventId, doneMike, doneAdam, total });
      return; // one active plan = one push
    }
    logger.info("trainingPulse: no active plan week.");
  }
);

// ═══════════════════════════════════════════════
// This week in your story — WEDNESDAYS 9 AM ET (weekly, not daily).
// One shared memory from this week's anniversaries (Wed→Tue window),
// the SAME one for both, deep-linked to open that memory in the feed.
// ═══════════════════════════════════════════════
exports.onThisDay = onSchedule(
  { schedule: "0 9 * * 3", timeZone: ET, retryCount: 1 },
  async () => {
    const todayStr = etTodayStr();
    const memories = await readMemories();
    const windowDays = [];
    for (let i = 0; i < 7; i++) windowDays.push(addDays(todayStr, i).slice(5));
    const hasPhoto = (x) => (x.images || []).length > 0 || x.image;
    const hits = memories
      .filter((m) => m.date && m.date < todayStr && !m.autoStory && windowDays.includes(m.date.slice(5)))
      .sort((a, b) => {
        const d = windowDays.indexOf(a.date.slice(5)) - windowDays.indexOf(b.date.slice(5));
        if (d !== 0) return d; // today's exact anniversary first, then soonest
        return (hasPhoto(a) ? 0 : 1) - (hasPhoto(b) ? 0 : 1); // photos win ties
      });
    if (hits.length === 0) { logger.info("onThisDay: quiet week in history."); return; }
    const m = hits.find(hasPhoto) || hits[0];
    const years = parseInt(todayStr.slice(0, 4), 10) - parseInt(m.date.slice(0, 4), 10);
    const exact = m.date.slice(5) === todayStr.slice(5);
    await sendPush({
      title: exact ? `💝 On this day ${years} year${years > 1 ? "s" : ""} ago` : "💝 This week in your story",
      body: `${m.title}${m.location ? ` — ${m.location}` : ""} (${fmtDate(m.date)}, ${m.date.slice(0, 4)})`,
      url: `${APP_URL}/memories?memory=${encodeURIComponent(m.id)}`,
      tag: "on-this-day",
    }, { kind: "memory" });
    logger.info("onThisDay sent", { memory: m.title });
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
// Weekly couple check-in reminder — Sundays 5 PM ET.
// Nudges only the person (or people) who haven't checked in this week.
// ═══════════════════════════════════════════════
exports.checkinReminder = onSchedule(
  { schedule: "0 17 * * 0", timeZone: ET, retryCount: 1 },
  async () => {
    const now = etNow();
    const sunday = new Date(now);
    sunday.setDate(sunday.getDate() - sunday.getDay());
    const week = toYMD(sunday);
    const checkins = await readCheckins();
    const done = new Set(checkins.filter((c) => c.week === week).map((c) => c.by));
    const missing = ["mike", "adam"].filter((p) => !done.has(p));
    if (missing.length === 0) { logger.info("checkinReminder: both done."); return; }
    for (const person of missing) {
      await sendPush({
        title: "💌 Weekly check-in",
        body: done.size > 0
          ? `${[...done][0] === "mike" ? "Mike" : "Adam"} already checked in — two minutes to add yours?`
          : "Two minutes, five questions — future you will treasure these.",
        url: APP_URL + "/home",
        tag: "checkin",
      }, { only: person, kind: "digest" });
    }
    logger.info("checkinReminder sent", { missing });
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

  // Notification diet: at most one partner-activity push per person per day.
  const todayStr = etTodayStr();
  const stateRef = db.collection("tripData").doc("notifyState");
  const state = (await stateRef.get()).data() || {};
  const lastPush = state.trainingPushDate?.[who];
  if (lastPush !== todayStr) {
    await sendPush({
      title: `👟 ${name} just logged a workout`,
      body: newlyDone.join(" · "),
      url: APP_URL + "/fitness",
      tag: "training-activity", // same tag → rapid check-offs replace, not stack
    }, { except: who, kind: "instant" });
    await stateRef.set({ trainingPushDate: { [who]: todayStr } }, { merge: true });
  } else {
    logger.info("trainingActivity: daily cap hit for", who);
  }

  // Week complete? Celebrate once — both partners, every run, current week.
  for (const [planId, aWeeks] of Object.entries(aPlans)) {
    if (!Array.isArray(aWeeks)) continue;
    const week = aWeeks.find((w) => w.startDate <= todayStr && todayStr <= w.endDate);
    if (!week || (week.runs || []).length === 0) continue;
    const allDone = (week.runs || []).every((r) => r.mike && ("adam" in r ? r.adam : true));
    if (!allDone) continue;
    const key = `${planId}-wk${week.weekNumber}`;
    if (state.weekCelebrated === key) continue;
    const ev = (after.events || []).find((e) => e.id === planId);
    await sendPush({
      title: "🎉 Week complete!",
      body: `Week ${week.weekNumber} of ${ev?.name || "training"} — every run, both of you. ${week.isRaceWeek ? "RACE TIME! 🏁" : "Onward. 💪"}`,
      url: APP_URL + "/fitness",
      tag: `week-complete-${key}`,
    }, { kind: "instant" });
    await stateRef.set({ weekCelebrated: key }, { merge: true });
    logger.info("week complete celebration", { key });
  }
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

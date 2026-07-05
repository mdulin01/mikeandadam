import React from 'react';

/**
 * TodayCard — "what's happening with us today" strip at the top of the Hub.
 * Pure presentational; all data computed in trip-planner's todaySnapshot memo.
 */
const fmtShort = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};
const daysUntil = (dateStr, today) => {
  if (!dateStr || !today) return null;
  return Math.round((new Date(dateStr + 'T12:00:00') - new Date(today + 'T12:00:00')) / 86400000);
};

// Static class map — Tailwind can't see dynamically-built class names.
const TONES = {
  slate: 'bg-slate-500/15 hover:bg-slate-500/25',
  orange: 'bg-orange-500/15 hover:bg-orange-500/25',
  blue: 'bg-blue-500/15 hover:bg-blue-500/25',
  teal: 'bg-teal-500/15 hover:bg-teal-500/25',
  amber: 'bg-amber-500/15 hover:bg-amber-500/25',
  rose: 'bg-rose-500/15 hover:bg-rose-500/25',
};

const Chip = ({ emoji, children, onClick, tone = 'slate' }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left text-sm transition border border-white/10 text-slate-200 ${TONES[tone] || TONES.slate}`}
  >
    <span className="text-lg leading-none">{emoji}</span>
    <span className="min-w-0">{children}</span>
  </button>
);

const TodayCard = ({ snapshot, onGo }) => {
  const { today, runsToday, tasksDueToday, nextEvent, nextTrip, latestMemory } = snapshot || {};
  const hasAnything = (runsToday?.length || tasksDueToday?.length || nextEvent || nextTrip);
  if (!hasAnything && !latestMemory) return null;

  const tripStart = nextTrip?.dates?.start || nextTrip?.start;
  const tripDays = daysUntil(tripStart, today);
  const eventDays = daysUntil(nextEvent?.date, today);

  return (
    <div className="mb-6 bg-white/5 border border-white/10 rounded-3xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-white">☀️ Today together</h3>
        <span className="text-xs text-slate-400">{fmtShort(today)}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {(runsToday || []).slice(0, 3).map((r, i) => (
          <Chip key={`run-${i}`} emoji="🏃" tone="orange" onClick={() => onGo('fitness')}>
            <span className="font-medium">{r.label} {r.distance}</span>
            <span className="text-slate-400"> · wk{r.weekNumber}</span>
            {(r.mike || r.adam) && (
              <span className="text-slate-400"> · {r.mike ? 'Mike ✓' : ''}{r.mike && r.adam ? ' ' : ''}{r.adam ? 'Adam ✓' : ''}</span>
            )}
          </Chip>
        ))}
        {(tasksDueToday || []).slice(0, 3).map((t) => (
          <Chip key={`task-${t.id}`} emoji="✅" tone="blue" onClick={() => onGo('home')}>
            <span className="font-medium">{t.title}</span>
            {t.dueDate && t.dueDate < today && <span className="text-red-400"> · overdue</span>}
          </Chip>
        ))}
        {(tasksDueToday || []).length > 3 && (
          <Chip emoji="➕" tone="blue" onClick={() => onGo('home')}>
            {(tasksDueToday || []).length - 3} more due
          </Chip>
        )}
        {nextTrip && tripDays !== null && tripDays <= 30 && (
          <Chip emoji={nextTrip.emoji || '✈️'} tone="teal" onClick={() => onGo('events')}>
            <span className="font-medium">{nextTrip.destination || nextTrip.name}</span>
            <span className="text-slate-400"> · {tripDays === 0 ? 'today!' : `in ${tripDays}d`}</span>
          </Chip>
        )}
        {nextEvent && eventDays !== null && eventDays <= 30 && (
          <Chip emoji={nextEvent.emoji || '🎉'} tone="amber" onClick={() => onGo('events')}>
            <span className="font-medium">{nextEvent.name || nextEvent.title}</span>
            <span className="text-slate-400"> · {eventDays === 0 ? 'today!' : `in ${eventDays}d`}</span>
          </Chip>
        )}
        {latestMemory && (
          <Chip emoji="💝" tone="rose" onClick={() => onGo('memories')}>
            <span className="text-slate-400">Latest memory:</span>{' '}
            <span className="font-medium">{latestMemory.title}</span>
          </Chip>
        )}
      </div>
    </div>
  );
};

export default TodayCard;

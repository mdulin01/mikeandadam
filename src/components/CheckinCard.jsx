import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

/**
 * CheckinCard — the weekly couple check-in (Hub).
 * One doc per person per week in tripData/checkins/entries:
 *   { week: 'YYYY-MM-DD' (Sunday), by: 'mike'|'adam', mood, wentWell,
 *     stressed, appreciated, nextWeek, createdAt }
 * Your partner's "appreciated" answer is revealed after YOU submit —
 * a little reward for showing up.
 */
const MOODS = ['😊', '😐', '😞'];
const QUESTIONS = [
  ['wentWell', 'What went well this week?'],
  ['stressed', 'What stressed you?'],
  ['appreciated', 'One thing you appreciated about your partner'],
  ['nextWeek', "One thing you'd like next week"],
];

export const weekKeyFor = (d = new Date()) => {
  const day = new Date(d);
  day.setDate(day.getDate() - day.getDay()); // back to Sunday
  const y = day.getFullYear();
  const m = String(day.getMonth() + 1).padStart(2, '0');
  const dd = String(day.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

const fmtWeek = (weekKey) => {
  const d = new Date(weekKey + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const Answer = ({ label, text }) => text ? (
  <p className="text-sm text-white/80 mt-1"><span className="text-white/40">{label}:</span> {text}</p>
) : null;

const CheckinCard = ({ me, checkins, onSubmit }) => {
  const week = weekKeyFor();
  const partner = me === 'mike' ? 'adam' : 'mike';
  const mine = checkins.find((c) => c.week === week && c.by === me);
  const theirs = checkins.find((c) => c.week === week && c.by === partner);

  const [mood, setMood] = useState('😊');
  const [answers, setAnswers] = useState({ wentWell: '', stressed: '', appreciated: '', nextWeek: '' });
  const [showArchive, setShowArchive] = useState(false);
  const [saving, setSaving] = useState(false);

  const past = useMemo(() => {
    const byWeek = new Map();
    for (const c of checkins) {
      if (c.week === week) continue;
      if (!byWeek.has(c.week)) byWeek.set(c.week, []);
      byWeek.get(c.week).push(c);
    }
    return [...byWeek.entries()].sort((a, b) => b[0].localeCompare(a[0])).slice(0, 12);
  }, [checkins, week]);

  const submit = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onSubmit({ week, by: me, mood, ...answers });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-6 rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-950/30 via-slate-900/50 to-slate-950/40 backdrop-blur-xl">
      <div className="p-4 pb-2 flex items-center justify-between">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span>💌</span> Weekly check-in
          <span className="text-xs text-white/30 font-normal">week of {fmtWeek(week)}</span>
        </h3>
        <div className="flex items-center gap-1.5 text-xs">
          <span className={`px-2 py-0.5 rounded-full ${mine ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/40'}`}>
            {me === 'mike' ? 'Mike' : 'Adam'} {mine ? '✓' : '…'}
          </span>
          <span className={`px-2 py-0.5 rounded-full ${theirs ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/40'}`}>
            {partner === 'mike' ? 'Mike' : 'Adam'} {theirs ? '✓' : '…'}
          </span>
        </div>
      </div>

      <div className="px-4 pb-4">
        {!mine ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/60">How was your week?</span>
              {MOODS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={`text-2xl p-1.5 rounded-xl transition ${mood === m ? 'bg-rose-500/30 scale-110' : 'opacity-50 hover:opacity-100'}`}
                >
                  {m}
                </button>
              ))}
            </div>
            {QUESTIONS.map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs text-white/50 mb-1">{label}</label>
                <input
                  value={answers[key]}
                  onChange={(e) => setAnswers((a) => ({ ...a, [key]: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-rose-400/50"
                  placeholder="…"
                />
              </div>
            ))}
            <button
              onClick={submit}
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" /> {saving ? 'Saving…' : 'Save my check-in'}
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-emerald-300">You checked in {mine.mood} — saved forever. 💛</p>
            {theirs ? (
              <div className="mt-2 bg-white/5 rounded-xl p-3">
                <p className="text-xs text-white/40 mb-1">{partner === 'mike' ? 'Mike' : 'Adam'} felt {theirs.mood} and appreciated:</p>
                <p className="text-sm text-rose-200">“{theirs.appreciated || '…'}”</p>
                <Answer label="Went well" text={theirs.wentWell} />
                <Answer label="Next week" text={theirs.nextWeek} />
              </div>
            ) : (
              <p className="text-xs text-white/40 mt-1">
                {partner === 'mike' ? 'Mike' : 'Adam'} hasn't checked in yet — their answers appear here when they do.
              </p>
            )}
          </div>
        )}

        {past.length > 0 && (
          <button
            onClick={() => setShowArchive((v) => !v)}
            className="mt-3 text-xs text-white/40 hover:text-white/70 flex items-center gap-1 transition"
          >
            {showArchive ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            Past check-ins ({past.length})
          </button>
        )}
        {showArchive && (
          <div className="mt-2 space-y-3 max-h-80 overflow-y-auto pr-1">
            {past.map(([wk, entries]) => (
              <div key={wk} className="bg-white/5 rounded-xl p-3">
                <p className="text-[11px] uppercase tracking-wider text-rose-300/60 mb-1.5">Week of {fmtWeek(wk)}</p>
                {entries.sort((a, b) => a.by.localeCompare(b.by)).map((c) => (
                  <div key={c.by} className="mb-2 last:mb-0">
                    <p className="text-xs font-semibold text-white capitalize">{c.by} {c.mood}</p>
                    <Answer label="Went well" text={c.wentWell} />
                    <Answer label="Stressed" text={c.stressed} />
                    <Answer label="Appreciated" text={c.appreciated} />
                    <Answer label="Next week" text={c.nextWeek} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckinCard;

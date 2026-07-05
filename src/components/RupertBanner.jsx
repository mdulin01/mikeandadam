import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';

/**
 * RupertBanner — same pattern as mikes-money / mikesfitness / rainbow-rentals.
 * Reads the single doc rupert/note in THIS app's Firestore (trip-planner-5cc84),
 * written by the mikeslife cron-couple-context job. Shape:
 *   { text, signals: [{label, href}], priorities: [], updatedAt }
 * Dismissable per-update (remembers the dismissed updatedAt in localStorage).
 */
const RupertBanner = ({ db }) => {
  const [note, setNote] = useState(null);
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem('rupertBannerDismissed') || ''; } catch { return ''; }
  });

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(
      doc(db, 'rupert', 'note'),
      (snap) => setNote(snap.exists() ? snap.data() : null),
      () => setNote(null)
    );
    return () => unsub();
  }, [db]);

  if (!note?.text) return null;
  const stamp = note.updatedAt || '';
  if (dismissed && dismissed === stamp) return null;

  const dismiss = () => {
    setDismissed(stamp || 'x');
    try { localStorage.setItem('rupertBannerDismissed', stamp || 'x'); } catch { /* noop */ }
  };

  return (
    <div className="mt-4 bg-gradient-to-r from-teal-500/15 to-emerald-500/15 border border-teal-400/30 rounded-2xl px-4 py-3 flex items-start gap-3">
      <span className="text-2xl leading-none mt-0.5">🦚</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-teal-100">{note.text}</p>
        {Array.isArray(note.signals) && note.signals.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-2">
            {note.signals.map((s, i) => (
              <a
                key={i}
                href={s.href}
                target={s.href?.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="text-xs px-2.5 py-1 rounded-full bg-teal-400/20 text-teal-200 hover:bg-teal-400/30 transition"
              >
                {s.label}
              </a>
            ))}
          </div>
        )}
      </div>
      <button onClick={dismiss} className="text-teal-300/60 hover:text-teal-200 text-lg leading-none px-1" aria-label="Dismiss">
        ×
      </button>
    </div>
  );
};

export default RupertBanner;

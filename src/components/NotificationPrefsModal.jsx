import React from 'react';
import { X, Bell, BellOff } from 'lucide-react';

/**
 * NotificationPrefsModal — per-person notification preferences.
 * Writes tripData/notifyPrefs { mike: {digest, instant, memory}, adam: {...} }.
 * The Cloud Functions default every kind to ON when a key is missing, so this
 * only ever needs to store explicit choices.
 */
const KINDS = [
  { key: 'digest', emoji: '🗓️', label: 'Weekly rhythm', desc: 'Mon kickoff · Fri training pulse · trip-prep reminders' },
  { key: 'instant', emoji: '⚡', label: 'Activity', desc: 'Partner finished a task or logged a run (max 1/day)' },
  { key: 'memory', emoji: '💝', label: 'Memories', desc: 'Wednesday \'this week in your story\' + post-trip photo prompts' },
];

const NotificationPrefsModal = ({ me, prefs, onToggle, onClose, onDisable }) => {
  const mine = prefs?.[me] || {};
  const isOn = (k) => mine[k] !== false; // missing = on

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-slate-800 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" /> Notifications
          </h2>
          <button onClick={onClose} className="text-white/50 hover:text-white" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {KINDS.map(({ key, emoji, label, desc }) => (
            <button
              key={key}
              onClick={() => onToggle(key, !isOn(key))}
              className="w-full flex items-center gap-3 text-left"
            >
              <span className="text-xl">{emoji}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-white">{label}</span>
                <span className="block text-xs text-white/40">{desc}</span>
              </span>
              <span
                className={`shrink-0 w-11 h-6 rounded-full p-0.5 transition ${
                  isOn(key) ? 'bg-emerald-500' : 'bg-white/15'
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    isOn(key) ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </span>
            </button>
          ))}
          <p className="text-[11px] text-white/30 pt-1">
            Quiet hours 10 PM – 7 AM apply to activity pushes automatically. These
            choices are just for {me === 'mike' ? 'Mike' : 'Adam'} — {me === 'mike' ? 'Adam' : 'Mike'} has his own.
          </p>
        </div>

        <div className="p-5 pt-0">
          <button
            onClick={onDisable}
            className="w-full py-2.5 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 hover:text-white text-sm flex items-center justify-center gap-2 transition"
          >
            <BellOff className="w-4 h-4" /> Turn off push on this device
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPrefsModal;

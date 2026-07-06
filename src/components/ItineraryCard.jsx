import React from 'react';

/**
 * ItineraryCard — mikestravel-style day-by-day itinerary, rendered from the
 * verbatim segments mirrored by mikeslife cron-travel into
 * tripDetails[trip.id].segments. Read-only here: mikestravel is canonical.
 */
const TYPE_EMOJI = { flight: '✈️', hotel: '🏨', car: '🚗', activity: '🥾', food: '🍽️', note: '📝' };

const dayLabel = (dateStr) => {
  if (!dateStr) return 'Undated';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
};

const ItineraryCard = ({ segments }) => {
  const sorted = [...segments].sort((a, b) =>
    String(a.date || '9999').localeCompare(String(b.date || '9999')) ||
    String(a.time || '99:99').localeCompare(String(b.time || '99:99')));
  const days = [];
  for (const seg of sorted) {
    const key = seg.date || '';
    let day = days[days.length - 1];
    if (!day || day.key !== key) { day = { key, label: dayLabel(seg.date), segs: [] }; days.push(day); }
    day.segs.push(seg);
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🗓️</span>
        <h3 className="text-2xl font-bold text-white">Itinerary</h3>
        <a
          href="https://www.mikestravel.app"
          target="_blank"
          rel="noreferrer"
          className="ml-auto text-xs px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-200 hover:bg-sky-500/30 transition"
        >
          ✈️ Edit in mikestravel
        </a>
      </div>
      <div className="space-y-5">
        {days.map((day) => (
          <div key={day.key || 'undated'}>
            <p className="text-[11px] font-bold tracking-widest text-sky-300/70 mb-2">{day.label}</p>
            <div className="space-y-2">
              {day.segs.map((seg, i) => (
                <div key={seg.id || i} className="flex items-start gap-3 bg-white/5 rounded-xl px-4 py-3">
                  <span className="text-xl leading-none mt-0.5">{TYPE_EMOJI[seg.type] || '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{seg.title}</p>
                    {seg.location && <p className="text-xs text-white/50 mt-0.5">{seg.location}</p>}
                    {seg.notes && <p className="text-xs text-white/40 mt-0.5">{seg.notes}</p>}
                    {(seg.conf || seg.link) && (
                      <div className="flex items-center gap-2 mt-1">
                        {seg.conf && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                            conf {seg.conf}
                          </span>
                        )}
                        {seg.link && (
                          <a href={seg.link} target="_blank" rel="noreferrer" className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-200 hover:bg-sky-500/30 transition">
                            🔗 link
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  {seg.time && <span className="text-xs text-white/50 shrink-0 font-mono mt-1">{seg.time}</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItineraryCard;

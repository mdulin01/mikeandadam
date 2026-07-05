import React, { useState, useMemo } from 'react';

/**
 * MemoriesFeed — the "our own social feed" view of memories.
 * Newest first, big photos, emoji reactions + comments stored ON the
 * memory doc ({reactions: {mike:'❤️'}, comments: [{by, at, text}]}),
 * which is safe now that each memory is its own Firestore doc.
 */
const REACTIONS = ['❤️', '😂', '😮', '🥰', '🎉'];

const fmtDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const timeAgoYears = (dateStr, todayStr) => {
  const y = parseInt(todayStr?.slice(0, 4), 10) - parseInt(dateStr?.slice(0, 4), 10);
  return y;
};

const MemoryPost = ({ memory, currentUser, onReact, onAddComment, onOpen }) => {
  const [commentText, setCommentText] = useState('');
  const me = String(currentUser || '').toLowerCase();
  const reactions = memory.reactions || {};
  const comments = memory.comments || [];
  const img = (memory.images && memory.images[0]) || memory.image || '';
  const counts = REACTIONS.map((e) => ({ e, n: Object.values(reactions).filter((v) => v === e).length }));

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
      {img && (
        <button onClick={() => onOpen?.(memory)} className="block w-full">
          <img src={img} alt={memory.title} className="w-full max-h-[420px] object-cover" loading="lazy" />
        </button>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{memory.icon || '💝'}</span>
              <span className="truncate">{memory.title}</span>
              {memory.isFirstTime && <span title="A first!">⭐</span>}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {fmtDate(memory.date)}{memory.location ? ` · ${memory.location}` : ''}
            </p>
          </div>
          {(memory.images?.length || 0) > 1 && (
            <span className="text-xs text-slate-400 shrink-0">📸 {memory.images.length}</span>
          )}
        </div>
        {memory.description && <p className="text-sm text-slate-300 mt-2">{memory.description}</p>}

        {/* Reactions */}
        <div className="flex items-center gap-1.5 mt-3">
          {counts.map(({ e, n }) => (
            <button
              key={e}
              onClick={() => onReact(memory.id, e)}
              className={`px-2.5 py-1.5 rounded-full text-sm transition border ${
                reactions[me] === e
                  ? 'bg-rose-500/30 border-rose-400/50'
                  : 'bg-white/5 border-white/10 hover:bg-white/15'
              }`}
            >
              {e}{n > 0 && <span className="ml-1 text-xs text-slate-300">{n}</span>}
            </button>
          ))}
        </div>

        {/* Comments */}
        {comments.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {comments.map((c, i) => (
              <p key={i} className="text-sm text-slate-300">
                <span className="font-semibold text-white capitalize">{c.by}</span>{' '}
                {c.text}
              </p>
            ))}
          </div>
        )}
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!commentText.trim()) return;
            onAddComment(memory.id, commentText);
            setCommentText('');
          }}
        >
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment…"
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-400/50"
          />
          {commentText.trim() && (
            <button type="submit" className="px-4 py-2 rounded-full bg-rose-500 text-white text-sm font-semibold">
              Post
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

const MemoriesFeed = ({ memories, currentUser, todayStr, onReact, onAddComment, onOpen }) => {
  const sorted = useMemo(
    () => [...memories].filter((m) => m.date).sort((a, b) => String(b.date).localeCompare(String(a.date))),
    [memories]
  );

  // "On this week" lookback: same calendar week (±4 days) in earlier years.
  const lookback = useMemo(() => {
    if (!todayStr) return [];
    const mmdd = (s) => s.slice(5);
    const center = mmdd(todayStr);
    const near = (a, b) => {
      const da = new Date(`2000-${a}T12:00:00`);
      const db = new Date(`2000-${b}T12:00:00`);
      return Math.abs(da - db) <= 4 * 86400000;
    };
    return sorted.filter((m) => m.date.slice(0, 4) < todayStr.slice(0, 4) && near(mmdd(m.date), center));
  }, [sorted, todayStr]);

  return (
    <div className="max-w-2xl mx-auto space-y-5 mt-6">
      {lookback.length > 0 && (
        <div className="bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-400/30 rounded-3xl p-5">
          <h4 className="text-sm font-bold text-violet-200 mb-2">⏪ This week in your story</h4>
          {lookback.slice(0, 3).map((m) => (
            <button key={m.id} onClick={() => onOpen?.(m)} className="block text-left w-full py-1">
              <span className="text-white font-medium">{m.icon || '💝'} {m.title}</span>
              <span className="text-xs text-violet-300 ml-2">
                {timeAgoYears(m.date, todayStr)} year{timeAgoYears(m.date, todayStr) > 1 ? 's' : ''} ago
              </span>
            </button>
          ))}
        </div>
      )}
      {sorted.length === 0 && (
        <p className="text-center text-slate-400 py-12">No memories yet — add your first one! 💝</p>
      )}
      {sorted.map((m) => (
        <MemoryPost
          key={m.id}
          memory={m}
          currentUser={currentUser}
          onReact={onReact}
          onAddComment={onAddComment}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
};

export default MemoriesFeed;

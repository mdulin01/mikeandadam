import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronUp, MoreVertical, Star, Edit3, Trash2, Check } from 'lucide-react';
import PortalMenu from './PortalMenu';

const GoalCard = React.memo(({ goal, currentUser, onToggleMilestone, onEdit, onDelete, onHighlight }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const menuRef = useRef(null);

  // Calculate milestone completion percentage
  const completedMilestones = goal.milestones?.filter(m => m.completed).length || 0;
  const totalMilestones = goal.milestones?.length || 0;
  const progressPercentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  // Scope badge styling
  const getScopeBadgeColor = () => {
    switch (goal.scope) {
      case 'Mike':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Adam':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Couple':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-white/10 text-white/70 border-white/20';
    }
  };

  // Get category color
  const getCategoryColor = () => {
    switch (goal.category) {
      case 'career':
        return 'from-blue-500/20 to-cyan-500/20';
      case 'relationship':
        return 'from-rose-500/20 to-pink-500/20';
      case 'finance':
        return 'from-green-500/20 to-emerald-500/20';
      case 'health':
        return 'from-orange-500/20 to-amber-500/20';
      case 'growth':
        return 'from-purple-500/20 to-violet-500/20';
      case 'adventure':
        return 'from-indigo-500/20 to-blue-500/20';
      case 'home':
        return 'from-teal-500/20 to-green-500/20';
      default:
        return 'from-slate-600/20 to-slate-500/20';
    }
  };

  // Ring color based on status
  const getRingColor = () => {
    if (goal.status === 'achieved') {
      return 'text-amber-400';
    }
    if (progressPercentage >= 75) {
      return 'text-emerald-400';
    }
    if (progressPercentage >= 50) {
      return 'text-cyan-400';
    }
    if (progressPercentage > 0) {
      return 'text-blue-400';
    }
    return 'text-slate-600';
  };

  const borderClass = goal.highlighted
    ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-400/60'
    : goal.status === 'achieved'
    ? 'border-amber-500/30 shadow-lg shadow-amber-500/10'
    : 'border-emerald-500/20';

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className={`bg-white/[0.05] backdrop-blur-md border rounded-2xl transition-all hover:bg-white/[0.08] ${borderClass}`}>
      {/* Main card content */}
      <div className="flex items-center">
        {/* Left section: emoji and progress ring */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="shrink-0 ml-4 my-3 flex flex-col items-center justify-center"
        >
          <div className="text-2xl mb-1">{goal.emoji}</div>
          {/* Progress ring */}
          <div className="w-12 h-12 relative">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-700" />
              <circle
                cx="18" cy="18" r="15" fill="none" strokeWidth="2"
                strokeDasharray={`${(progressPercentage / 100) * 94.2} 94.2`}
                strokeLinecap="round"
                className={getRingColor()}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white/70">{progressPercentage}%</span>
            </div>
          </div>
        </button>

        {/* Main content — tap to expand */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 flex flex-col p-4 text-left hover:bg-white/5 transition min-w-0"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                {goal.highlighted && <Star className="w-3 h-3 text-emerald-400 fill-emerald-400 shrink-0" />}
                <span className="truncate">{goal.title}</span>
              </div>
            </div>
          </div>

          {/* Badges: scope and timeframe */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-[10px] px-2 py-1 rounded-full border ${getScopeBadgeColor()}`}>
              {goal.scope === 'Couple' ? 'M & A' : goal.scope === 'Mike' ? 'M' : 'A'}
            </span>
            <span className="text-[10px] px-2 py-1 rounded-full bg-slate-600/50 text-white/60 border border-slate-600">
              {goal.timeframe === '1year' ? '1 yr' : '5 yr'}
            </span>
          </div>

          {/* Progress bar */}
          <div className="flex-1 min-h-1 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r from-emerald-500/70 to-teal-500/70 transition-all duration-500`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </button>

        {/* Chevron and menu */}
        <div className="flex items-center gap-1 pr-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 text-white/30 hover:text-white/60 transition p-1"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* 3-dot menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-2 rounded-lg hover:bg-white/10 transition text-white/40 hover:text-white"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            <PortalMenu anchorRef={menuRef} show={showMenu} onClose={() => setShowMenu(false)}>
              <button
                onClick={() => { setShowMenu(false); onEdit(goal); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition text-left"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => { setShowMenu(false); onHighlight(goal.id); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition text-left"
              >
                <Star className={`w-3.5 h-3.5 ${goal.highlighted ? 'text-emerald-400 fill-emerald-400' : ''}`} />
                {goal.highlighted ? 'Unhighlight' : 'Highlight'}
              </button>
              <button
                onClick={() => { setShowMenu(false); onDelete(goal.id); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition text-left"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </PortalMenu>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-white/5 p-4 space-y-4">
          {/* Milestones checklist */}
          {totalMilestones > 0 && (
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2.5">Milestones ({completedMilestones}/{totalMilestones})</div>
              <div className="space-y-2">
                {goal.milestones.map(milestone => (
                  <button
                    key={milestone.id}
                    onClick={() => onToggleMilestone(goal.id, milestone.id)}
                    className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-white/5 transition text-left"
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition border ${
                      milestone.completed
                        ? 'bg-emerald-500/40 border-emerald-500/60'
                        : 'bg-slate-700 border-slate-600'
                    }`}>
                      {milestone.completed && <Check className="w-3 h-3 text-emerald-300" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs ${milestone.completed ? 'text-white/50 line-through' : 'text-white/80'}`}>
                        {milestone.text}
                      </p>
                      {milestone.completed && milestone.completedAt && (
                        <p className="text-[9px] text-white/30 mt-0.5">
                          {new Date(milestone.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {goal.description && (
            <div className="bg-slate-700/30 rounded-xl p-3">
              <span className="text-[10px] text-white/30 uppercase tracking-wider">Description</span>
              <p className="text-xs text-white/70 mt-1.5">{goal.description}</p>
            </div>
          )}

          {/* Target date */}
          {goal.targetDate && (
            <div className="flex items-start gap-2">
              <div>
                <span className="text-[10px] text-white/30 uppercase tracking-wider">Target Date</span>
                <p className="text-xs text-white/80 mt-0.5">{formatDate(goal.targetDate)}</p>
              </div>
            </div>
          )}

          {/* Category and status info */}
          <div className="flex items-center gap-3 pt-2">
            <div>
              <span className="text-[10px] text-white/30 uppercase tracking-wider">Category</span>
              <p className="text-xs text-white/70 mt-0.5 capitalize">{goal.category}</p>
            </div>
            {goal.status === 'achieved' && (
              <div className="ml-auto">
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Achieved
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

GoalCard.displayName = 'GoalCard';
export default GoalCard;

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MoreVertical, Edit, Trash2 } from 'lucide-react';

export default function OdysseyPlanCard({ plan, onEdit, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const gaugeConfig = [
    { key: 'resources', label: 'Resources', color: 'bg-blue-500' },
    { key: 'likability', label: 'Likability', color: 'bg-pink-500' },
    { key: 'confidence', label: 'Confidence', color: 'bg-amber-500' },
    { key: 'coherence', label: 'Coherence', color: 'bg-emerald-500' },
  ];

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this Odyssey Plan?')) {
      onDelete(plan.id);
    }
    setShowMenu(false);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative rounded-lg border border-violet-500/20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden hover:border-violet-500/40 transition-colors">
      {/* Header */}
      <div className="p-5 border-b border-slate-700/50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">{plan.title}</h3>
            <p className="text-xs text-slate-400">
              Created by {plan.createdBy} • {formatDate(plan.createdAt)}
            </p>
          </div>
          {/* Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-white"
            >
              <MoreVertical size={18} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    onEdit(plan);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-700/50 flex items-center gap-2 transition-colors"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors border-t border-slate-700"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gauges Section */}
      <div className="px-5 py-4 border-b border-slate-700/50">
        <div className="space-y-3">
          {gaugeConfig.map(({ key, label, color }) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-slate-300">{label}</label>
                <span className="text-xs font-bold text-slate-300">{plan.gauges[key]}%</span>
              </div>
              <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color} transition-all duration-300`}
                  style={{ width: `${plan.gauges[key]}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Section */}
      <div className="px-5 py-4 border-b border-slate-700/50">
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">5-Year Timeline</h4>

          {/* Timeline Container */}
          <div className="space-y-2">
            {/* Year markers and dots */}
            <div className="flex justify-between items-start px-2">
              {plan.timeline.map((entry, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1">
                  <span className="text-xs font-semibold text-violet-400 mb-2">Year {entry.year}</span>
                  <div className="w-3 h-3 rounded-full bg-violet-500/60 border border-violet-400/40" />
                </div>
              ))}
            </div>

            {/* Timeline events - collapsed view */}
            {!isExpanded && (
              <div className="text-xs text-slate-400 space-y-1 mt-4">
                {plan.timeline.map((entry, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="font-medium text-slate-300 min-w-fit">Y{entry.year}:</span>
                    <span className="line-clamp-1">{entry.events || '—'}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Timeline events - expanded view */}
            {isExpanded && (
              <div className="text-xs text-slate-400 space-y-2 mt-4">
                {plan.timeline.map((entry, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="font-medium text-slate-300 min-w-fit">Year {entry.year}:</span>
                    <span className="text-slate-300">{entry.events || '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description - Expandable */}
      <div className="px-5 py-4">
        {!isExpanded && (
          <p className="text-sm text-slate-300 line-clamp-2">{plan.description}</p>
        )}
        {isExpanded && (
          <p className="text-sm text-slate-300 whitespace-pre-wrap">{plan.description}</p>
        )}

        {/* Expand Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 flex items-center gap-2 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp size={16} />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              Show More
            </>
          )}
        </button>
      </div>
    </div>
  );
}

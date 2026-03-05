import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function AddOdysseyPlanModal({ onClose, onSave, editPlan, currentUser }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeline: [
      { year: 1, events: '' },
      { year: 2, events: '' },
      { year: 3, events: '' },
      { year: 4, events: '' },
      { year: 5, events: '' },
    ],
    gauges: {
      resources: 50,
      likability: 50,
      confidence: 50,
      coherence: 50,
    },
  });

  // Pre-fill form if editing
  useEffect(() => {
    if (editPlan) {
      setFormData({
        title: editPlan.title || '',
        description: editPlan.description || '',
        timeline: editPlan.timeline || [
          { year: 1, events: '' },
          { year: 2, events: '' },
          { year: 3, events: '' },
          { year: 4, events: '' },
          { year: 5, events: '' },
        ],
        gauges: editPlan.gauges || {
          resources: 50,
          likability: 50,
          confidence: 50,
          coherence: 50,
        },
      });
    }
  }, [editPlan]);

  const handleTitleChange = (e) => {
    setFormData((prev) => ({ ...prev, title: e.target.value }));
  };

  const handleDescriptionChange = (e) => {
    setFormData((prev) => ({ ...prev, description: e.target.value }));
  };

  const handleTimelineChange = (yearIndex, value) => {
    setFormData((prev) => ({
      ...prev,
      timeline: prev.timeline.map((entry, idx) =>
        idx === yearIndex ? { ...entry, events: value } : entry
      ),
    }));
  };

  const handleGaugeChange = (gaugeKey, value) => {
    setFormData((prev) => ({
      ...prev,
      gauges: {
        ...prev.gauges,
        [gaugeKey]: parseInt(value, 10),
      },
    }));
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      alert('Please enter a plan title');
      return;
    }
    onSave(formData);
  };

  const gaugeConfig = [
    { key: 'resources', label: 'Resources' },
    { key: 'likability', label: 'Likability' },
    { key: 'confidence', label: 'Confidence' },
    { key: 'coherence', label: 'Coherence' },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl max-h-[90vh] rounded-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-violet-500/20 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">
            {editPlan ? 'Edit Odyssey Plan' : 'New Odyssey Plan'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Title Field */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Plan Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="e.g., Plan A: Stay the Course"
              className="w-full px-4 py-2 rounded-lg bg-slate-700/30 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-colors"
            />
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={handleDescriptionChange}
              placeholder="Describe your life plan narrative..."
              rows={4}
              className="w-full px-4 py-2 rounded-lg bg-slate-700/30 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-colors resize-none"
            />
          </div>

          {/* Timeline Section */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-4">
              5-Year Timeline
            </label>
            <div className="space-y-4">
              {formData.timeline.map((entry, idx) => (
                <div key={idx}>
                  <label className="block text-xs font-semibold text-violet-400 mb-2">
                    Year {entry.year}
                  </label>
                  <textarea
                    value={entry.events}
                    onChange={(e) => handleTimelineChange(idx, e.target.value)}
                    placeholder={`What happens in year ${entry.year}?`}
                    rows={2}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700/30 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-colors resize-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Gauges Section */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-4">
              Life Design Gauges
            </label>
            <div className="space-y-5">
              {gaugeConfig.map(({ key, label }) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      {label}
                    </label>
                    <span className="text-xs font-bold text-violet-400">
                      {formData.gauges[key]}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.gauges[key]}
                    onChange={(e) => handleGaugeChange(key, e.target.value)}
                    className="w-full h-2 bg-slate-700/50 rounded-full appearance-none cursor-pointer accent-violet-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-700/50 flex-shrink-0 bg-slate-900/50 backdrop-blur-sm">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-medium transition-all duration-200"
          >
            {editPlan ? 'Update Plan' : 'Create Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, Check, Plus, Trash2, Target } from 'lucide-react';

const goalCategories = [
  { value: 'career', label: 'Career', emoji: '💼' },
  { value: 'relationship', label: 'Relationship', emoji: '💕' },
  { value: 'finance', label: 'Finance', emoji: '💰' },
  { value: 'health', label: 'Health', emoji: '💪' },
  { value: 'growth', label: 'Growth', emoji: '📚' },
  { value: 'adventure', label: 'Adventure', emoji: '🌍' },
  { value: 'home', label: 'Home', emoji: '🏠' },
  { value: 'other', label: 'Other', emoji: '✨' },
];

const timeframes = [
  { value: '1year', label: '1 Year' },
  { value: '5year', label: '5 Year' },
];

const scopes = [
  { value: 'Mike', label: 'Mike' },
  { value: 'Adam', label: 'Adam' },
  { value: 'Couple', label: 'Couple' },
];

const AddGoalModal = React.memo(({ onClose, onSave, editGoal, currentUser }) => {
  const isEditing = !!editGoal;

  const [formData, setFormData] = useState(editGoal ? {
    title: editGoal.title || '',
    description: editGoal.description || '',
    category: editGoal.category || 'growth',
    emoji: editGoal.emoji || '📚',
    timeframe: editGoal.timeframe || '1year',
    scope: editGoal.scope || 'Couple',
    targetDate: editGoal.targetDate || '',
    milestones: editGoal.milestones || [],
  } : {
    title: '',
    description: '',
    category: 'growth',
    emoji: '📚',
    timeframe: '1year',
    scope: 'Couple',
    targetDate: '',
    milestones: [],
  });

  const [validationError, setValidationError] = useState('');

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationError('');
  };

  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { id: Date.now(), text: '', completed: false, completedAt: null }]
    }));
  };

  const updateMilestone = (id, text) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map(m => m.id === id ? { ...m, text } : m)
    }));
  };

  const deleteMilestone = (id) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter(m => m.id !== id)
    }));
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      setValidationError('Goal title is required');
      return;
    }

    const goal = {
      id: editGoal?.id || Date.now(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      emoji: formData.emoji,
      timeframe: formData.timeframe,
      scope: formData.scope,
      targetDate: formData.targetDate,
      milestones: formData.milestones,
      status: editGoal?.status || 'active',
      highlighted: editGoal?.highlighted || false,
      createdBy: editGoal?.createdBy || currentUser,
      createdAt: editGoal?.createdAt || new Date().toISOString(),
    };
    onSave(goal);
  };

  const saveAndClose = () => {
    if (formData.title.trim()) {
      handleSave();
    } else {
      onClose();
    }
  };

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) saveAndClose();
  };

  const selectedCategory = goalCategories.find(c => c.value === formData.category);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
      onClick={handleBackgroundClick}
    >
      <div className="bg-slate-800/95 rounded-2xl shadow-2xl max-w-2xl mx-auto w-full max-h-[90dvh] flex flex-col overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-green-400" />

        {/* Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-emerald-400" />
              {isEditing ? 'Edit Goal' : 'New Goal'}
            </h3>
            <button
              onClick={saveAndClose}
              className="p-2 hover:bg-slate-700 rounded-full transition text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Goal Title */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Goal Title *</label>
            <input
              type="text"
              placeholder="e.g., Save for a house down payment"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-emerald-400 focus:outline-none transition"
              autoFocus
            />
            {validationError && <p className="text-red-400 text-sm mt-1">{validationError}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Description</label>
            <textarea
              placeholder="Add details about this goal..."
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-emerald-400 focus:outline-none transition resize-none"
              rows="3"
            />
          </div>

          {/* Category Grid */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Category</label>
            <div className="grid grid-cols-4 gap-2">
              {goalCategories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => { updateField('category', cat.value); updateField('emoji', cat.emoji); }}
                  className={`px-2 py-3 rounded-xl font-medium transition text-xs text-center flex flex-col items-center gap-1 ${
                    formData.category === cat.value
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white'
                      : 'bg-slate-700 text-white/60 hover:text-white hover:bg-slate-600'
                  }`}
                >
                  <span className="text-lg">{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeframe Toggle */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Timeframe</label>
            <div className="flex gap-2">
              {timeframes.map(tf => (
                <button
                  key={tf.value}
                  onClick={() => updateField('timeframe', tf.value)}
                  className={`flex-1 px-4 py-2 rounded-xl font-medium transition ${
                    formData.timeframe === tf.value
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white'
                      : 'bg-slate-700 text-white/60 hover:text-white'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scope */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Scope</label>
            <div className="flex gap-2">
              {scopes.map(scope => (
                <button
                  key={scope.value}
                  onClick={() => updateField('scope', scope.value)}
                  className={`flex-1 px-4 py-2 rounded-xl font-medium transition ${
                    formData.scope === scope.value
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white'
                      : 'bg-slate-700 text-white/60 hover:text-white'
                  }`}
                >
                  {scope.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Target Date</label>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) => updateField('targetDate', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white focus:border-emerald-400 focus:outline-none transition"
            />
          </div>

          {/* Milestones */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Milestones</label>
            <div className="space-y-2 mb-3">
              {formData.milestones.map(milestone => (
                <div key={milestone.id} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., Save $10,000"
                    value={milestone.text}
                    onChange={(e) => updateMilestone(milestone.id, e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:border-emerald-400 focus:outline-none transition"
                  />
                  <button
                    onClick={() => deleteMilestone(milestone.id)}
                    className="p-2 bg-slate-700 hover:bg-red-500/20 text-white/60 hover:text-red-400 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addMilestone}
              className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white/70 hover:text-white rounded-lg transition flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Milestone
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700/50 bg-slate-900/50 shrink-0" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
          <button
            onClick={handleSave}
            className="w-full py-3 bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg"
          >
            <Check className="w-5 h-5" />
            {isEditing ? 'Save Goal' : 'Create Goal'}
          </button>
        </div>
      </div>
    </div>
  );
});

AddGoalModal.displayName = 'AddGoalModal';
export default AddGoalModal;

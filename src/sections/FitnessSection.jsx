import React from 'react';
import { Camera, Check, ChevronDown, ChevronRight, Clock, Loader, Pencil, Share2, Upload, X } from 'lucide-react';
import { formatDate, parseLocalDate, toLocalDateStr } from '../utils';

/**
 * FitnessSection — extracted verbatim from trip-planner.jsx (Phase 2 refactor,
 * 2026-07-06, docs/REFACTORING_GUIDE.md). All state stays in the parent; this
 * is a pure render slice, so behavior is unchanged.
 */
const FitnessSection = (props) => {
  const {
    fitnessEvents,
    fitnessTrainingPlans,
    fitnessViewMode,
    getActiveTrainingPlan,
    handleRaceDayPhotoAdd,
    handleRaceDayPhotoRemove,
    handleWeekNotesChange,
    handleWeekPhotoAdd,
    handleWeekPhotoRemove,
    openLightbox,
    pastWeeksExpanded,
    selectedFitnessEvent,
    setEditingFitnessEvent,
    setEditingTrainingWeek,
    setFitnessViewMode,
    setPastWeeksExpanded,
    setSelectedFitnessEvent,
    setWeekPhotoDrag,
    showToast,
    updateRaceDay,
    updateWorkout,
    uploadingWeekPhotoId,
    weekNotesLocal,
    weekPhotoDrag,
  } = props;

  return (
            <div>
              {/* Fitness View Mode Toggle (left padding for FAB on mobile)
                   The 'training' viewMode is still active when an event card is clicked,
                   but no longer has its own button — it was a useless empty placeholder
                   without an event selected. Tab bar now: Active Races · Stats · Past Races. */}
              <div className="flex gap-1.5 md:gap-2 mb-4 items-center justify-start sticky top-0 z-20 bg-slate-800/95 backdrop-blur-md py-3 -mx-6 px-6">
                {[
                  { id: 'events',     emoji: '🎯', label: 'Active Races' },
                  { id: 'stats',      emoji: '📊', label: 'Stats' },
                  { id: 'past-races', emoji: '🏆', label: 'Past Races' },
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setFitnessViewMode(mode.id)}
                    title={mode.label}
                    className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-xl font-medium transition text-base md:text-lg text-center ${
                      fitnessViewMode === mode.id || (mode.id === 'events' && fitnessViewMode === 'training')
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {mode.emoji}
                  </button>
                ))}
              </div>

              {/* Events View */}
              {fitnessViewMode === 'events' && (
                <div className="grid md:grid-cols-2 gap-6">
                  {fitnessEvents.filter(e => e.status !== 'completed').map(event => {
                    const eventDate = parseLocalDate(event.date);
                    const today = new Date();
                    const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
                    const weeksUntil = Math.ceil(daysUntil / 7);
                    const isPast = daysUntil < 0;
                    const trainingPlan = getActiveTrainingPlan(event.id);
                    // Mike-only plans (e.g., triathlon, custom mike-only events) don't have `adam` field — count just mike
                    const isMikeOnlyPlan = trainingPlan[0]?.runs?.[0] && !('adam' in trainingPlan[0].runs[0]);
                    const isAdamOnlyPlan = trainingPlan[0]?.runs?.[0] && !('mike' in trainingPlan[0].runs[0]);
                    const completedWorkouts = trainingPlan.reduce((acc, week) => {
                      let runsDone, crossDone;
                      if (isMikeOnlyPlan) {
                        runsDone = week.runs?.filter(r => r.mike).length || 0;
                        crossDone = week.crossTraining?.filter(c => c.mike).length || 0;
                      } else if (isAdamOnlyPlan) {
                        runsDone = week.runs?.filter(r => r.adam).length || 0;
                        crossDone = week.crossTraining?.filter(c => c.adam).length || 0;
                      } else {
                        runsDone = week.runs?.filter(r => r.mike && r.adam).length || 0;
                        crossDone = week.crossTraining?.filter(c => c.mike && c.adam).length || 0;
                      }
                      return acc + runsDone + crossDone;
                    }, 0);
                    const totalWorkouts = trainingPlan.reduce((acc, week) => {
                      return acc + (week.runs?.length || 0) + (week.crossTraining?.length || 0);
                    }, 0);

                    return (
                      <div
                        key={event.id}
                        data-search-id={`fitness-${event.id}`}
                        className={`bg-gradient-to-br ${event.color} rounded-3xl p-6 shadow-xl relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform`}
                        onClick={() => {
                          setSelectedFitnessEvent(event);
                          setFitnessViewMode('training');
                        }}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-16 -translate-y-16" />

                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <span className="text-4xl">{event.emoji}</span>
                              <h3 className="text-2xl font-bold text-white mt-2">{event.name}</h3>
                              <p className="text-white/80">{formatDate(event.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                            <div className={`text-right px-4 py-2 rounded-full whitespace-nowrap shrink-0 ${isPast ? 'bg-green-500/30' : 'bg-white/20'}`}>
                              {isPast ? (
                                <span className="text-white font-bold">✓ Completed!</span>
                              ) : (
                                <>
                                  <div className="text-3xl font-bold text-white leading-none">{daysUntil}</div>
                                  <div className="text-[10px] text-white/80 uppercase tracking-wider mt-1">days to go</div>
                                </>
                              )}
                            </div>
                          </div>

                          {!isPast && (
                            <>
                              <div className="flex items-center gap-2 text-white/80 mb-3">
                                <Clock className="w-4 h-4" />
                                <span>{weeksUntil} weeks of training</span>
                              </div>

                              {/* Progress Bar */}
                              {totalWorkouts > 0 && (
                                <div className="mb-3">
                                  <div className="flex justify-between text-sm text-white/80 mb-1">
                                    <span>Progress</span>
                                    <span>{completedWorkouts}/{totalWorkouts} workouts</span>
                                  </div>
                                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-white rounded-full transition-all"
                                      style={{ width: `${(completedWorkouts / totalWorkouts) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          <div className="flex items-center justify-between mt-4">
                            <span className="text-white/60 text-sm">Click to view training plan →</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const text = `🏃 Training for ${event.emoji} ${event.name}!\n\n` +
                                    `📅 ${daysUntil > 0 ? `${daysUntil} days to go!` : 'Race day!'}\n` +
                                    `✅ ${completedWorkouts}/${totalWorkouts} workouts completed\n` +
                                    `📊 ${Math.round((completedWorkouts / totalWorkouts) * 100)}% progress\n\n` +
                                    `#TrainingTogether #${event.name.replace(/[^a-zA-Z]/g, '')}`;
                                  if (navigator.share) {
                                    navigator.share({ title: 'Training Progress', text });
                                  } else {
                                    navigator.clipboard.writeText(text);
                                    showToast('Progress copied to clipboard! 📋', 'success');
                                  }
                                }}
                                className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition"
                                title="Share progress"
                              >
                                <Share2 className="w-4 h-4 text-white" />
                              </button>
                              <div className="flex gap-1">
                                {['🏃', '💪', '🎯'].map((e, i) => (
                                  <span key={i} className="text-xl opacity-50 group-hover:opacity-100 transition">{e}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Training Plan View */}
              {fitnessViewMode === 'training' && (
                <div>
                  {/* Event Selector — only active races (completed ones live on the Past Races tab) */}
                  <div className="flex gap-2 mb-6 flex-wrap items-center">
                    {fitnessEvents.filter(e => e.status !== 'completed').map(event => (
                      <div key={event.id} className="relative group">
                        <button
                          onClick={() => {
                            setSelectedFitnessEvent(event);
                          }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition ${
                            selectedFitnessEvent?.id === event.id
                              ? `bg-gradient-to-r ${event.color} text-white`
                              : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                        >
                          <span>{event.emoji}</span>
                          {event.name}
                        </button>
                        {/* Edit button - only show for non-hardcoded events */}
                        {!['indy-half-2026', 'gso-half-2026'].includes(event.id) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingFitnessEvent(event);
                            }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                            title="Edit event"
                          >
                            <Pencil className="w-3 h-3 text-white" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {selectedFitnessEvent && getActiveTrainingPlan(selectedFitnessEvent.id) && (
                    <div className="space-y-4">
                      {/* Race Day — appears on/after race date */}
                      {(() => {
                        const eventDate = parseLocalDate(selectedFitnessEvent.date);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        eventDate.setHours(0, 0, 0, 0);
                        const isPastRace = eventDate <= today;
                        if (!isPastRace) return null;
                        const raceDay = selectedFitnessEvent.raceDay || {};
                        const racePhotos = raceDay.photos || [];
                        const finishTime = raceDay.finishTime || '';
                        const raceNotes = raceDay.notes || '';
                        return (
                          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/30">
                            <div className="flex items-center gap-2 mb-4">
                              <span className="text-3xl">🏆</span>
                              <h3 className="text-xl font-bold text-white">Race Day — {formatDate(selectedFitnessEvent.date, { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-sm text-white/70 mb-1">Finish Time</label>
                                <input
                                  type="text"
                                  placeholder="e.g. 1:45:32"
                                  defaultValue={finishTime}
                                  onBlur={(e) => { if (e.target.value !== finishTime) updateRaceDay(selectedFitnessEvent.id, { finishTime: e.target.value }); }}
                                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-green-400"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-white/70 mb-1">How did it go?</label>
                                <textarea
                                  placeholder="Splits, weather, highlights..."
                                  defaultValue={raceNotes}
                                  onBlur={(e) => { if (e.target.value !== raceNotes) updateRaceDay(selectedFitnessEvent.id, { notes: e.target.value }); }}
                                  rows={2}
                                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-green-400 resize-none"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm text-white/70 mb-2">Race Photos ({racePhotos.length})</label>
                              <div className="flex flex-wrap gap-2">
                                {racePhotos.map((p, idx) => (
                                  <div key={p.id} className="relative group/photo">
                                    <img src={p.url} alt="" className="w-20 h-20 rounded-lg object-cover border border-white/10 cursor-pointer" onClick={() => openLightbox(racePhotos.map(rp => rp.url), idx)} />
                                    <button onClick={() => handleRaceDayPhotoRemove(selectedFitnessEvent.id, p.id)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition">
                                      <X className="w-3 h-3 text-white" />
                                    </button>
                                  </div>
                                ))}
                                <label className="w-20 h-20 border-2 border-dashed border-white/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-400 hover:bg-white/5 transition">
                                  <Camera className="w-5 h-5 text-white/50" />
                                  <span className="text-[10px] text-white/50 mt-1">Add photo</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={async (e) => {
                                      const files = Array.from(e.target.files || []);
                                      for (const file of files) {
                                        await handleRaceDayPhotoAdd(selectedFitnessEvent.id, file);
                                      }
                                      e.target.value = '';
                                    }}
                                  />
                                </label>
                              </div>
                              <p className="text-xs text-white/40 mt-2">Photos auto-sync to Memories.</p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Stats and Encouragement */}
                      {(() => {
                        const plan = getActiveTrainingPlan(selectedFitnessEvent.id);
                        // Triathlon is gone from this app; isTriathlon kept as a no-op
                        // alias of isMikeOnlyPlan so downstream UI branches keep working.
                        const isMikeOnlyPlan = plan[0]?.runs?.[0] && !('adam' in plan[0].runs[0]);
                        const isTriathlon = isMikeOnlyPlan;

                        // A week is "done" based on plan type
                        const completedWeeks = plan.filter(w => {
                          if (isMikeOnlyPlan) {
                            return w.runs?.every(r => r.mike) && w.crossTraining?.every(c => c.mike);
                          }
                          return w.runs?.every(r => r.mike && r.adam) && w.crossTraining?.every(c => c.mike && c.adam);
                        }).length;

                        // For triathlon, separate by activity type
                        if (isTriathlon) {
                          const mikeSwimYards = plan.reduce((acc, w) => {
                            return acc + (w.runs?.filter(r => r.mike && r.label?.toLowerCase().includes('swim'))
                              .reduce((sum, r) => sum + (parseFloat(String(r.distance).replace(/[^\d.]/g, '')) || 0), 0) || 0);
                          }, 0);
                          const mikeBikeMiles = plan.reduce((acc, w) => {
                            return acc + (w.runs?.filter(r => r.mike && r.label?.toLowerCase().includes('bike'))
                              .reduce((sum, r) => sum + (parseFloat(String(r.distance).replace(/[^\d.]/g, '')) || 0), 0) || 0);
                          }, 0);
                          const mikeRunMiles = plan.reduce((acc, w) => {
                            return acc + (w.runs?.filter(r => r.mike && r.label?.toLowerCase().includes('run'))
                              .reduce((sum, r) => sum + (parseFloat(String(r.distance).replace(/[^\d.]/g, '')) || 0), 0) || 0);
                          }, 0);
                          const mikeWorkouts = plan.reduce((acc, w) => acc + (w.runs?.filter(r => r.mike).length || 0) + (w.crossTraining?.filter(c => c.mike).length || 0), 0);

                          return (
                            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl p-6 border border-orange-500/30 mb-6">
                              {/* Mike Only Legend */}
                              <div className="flex justify-center gap-6 mb-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                                  <span className="text-blue-400">Mike</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 rounded bg-green-500/40"></div>
                                  <span className="text-green-400">Complete ✓</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-5 gap-3 text-center mb-4">
                                <div>
                                  <div className="text-2xl font-bold text-orange-400">{completedWeeks}</div>
                                  <div className="text-white/60 text-xs">Weeks Done</div>
                                </div>
                                <div>
                                  <div className="text-2xl font-bold text-blue-400">{mikeSwimYards.toLocaleString()}</div>
                                  <div className="text-white/60 text-xs">🏊 Yards Swam</div>
                                </div>
                                <div>
                                  <div className="text-2xl font-bold text-green-400">{mikeBikeMiles.toFixed(1)}</div>
                                  <div className="text-white/60 text-xs">🚴 Miles Biked</div>
                                </div>
                                <div>
                                  <div className="text-2xl font-bold text-orange-400">{mikeRunMiles.toFixed(1)}</div>
                                  <div className="text-white/60 text-xs">🏃 Miles Run</div>
                                </div>
                                <div>
                                  <div className="text-2xl font-bold text-purple-400">{mikeWorkouts}</div>
                                  <div className="text-white/60 text-xs">Workouts</div>
                                </div>
                              </div>
                              <div className="text-center text-lg text-white/80">
                                Go Mike! You're training for a triathlon! 🏊🚴🏃
                              </div>
                              <button
                                onClick={() => {
                                  const eventDate = parseLocalDate(selectedFitnessEvent.date);
                                  const today = new Date();
                                  const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
                                  const text = `🏊🚴🏃 Triathlon Training for ${selectedFitnessEvent.emoji} ${selectedFitnessEvent.name}!\n\n` +
                                    `📅 ${daysUntil} days until race day\n` +
                                    `✅ ${completedWeeks} / ${plan.length} weeks done\n` +
                                    `🏊 ${mikeSwimYards.toLocaleString()} yards swam\n` +
                                    `🚴 ${mikeBikeMiles.toFixed(1)} miles biked\n` +
                                    `🏃 ${mikeRunMiles.toFixed(1)} miles run\n` +
                                    `💪 ${mikeWorkouts} workouts logged\n\n` +
                                    `#TriTraining #Triathlon`;
                                  if (navigator.share) {
                                    navigator.share({ title: 'Triathlon Progress', text }).catch(() => {});
                                  } else {
                                    navigator.clipboard.writeText(text);
                                    showToast('Progress copied to clipboard📋', 'success');
                                  }
                                }}
                                className="mt-4 w-full py-2 bg-orange-500/30 hover:bg-orange-500/40 text-orange-300 rounded-lg transition flex items-center justify-center gap-2"
                              >
                                <Share2 className="w-4 h-4" />
                                Share Progress
                              </button>
                            </div>
                          );
                        }

                        // Calculate miles for Mike and Adam separately (half marathon and other plans)
                        const mikeMiles = plan.reduce((acc, w) => {
                          const weekMiles = w.runs?.filter(r => r.mike).reduce((sum, r) => sum + (parseFloat(String(r.distance).replace(/[^\d.]/g, '')) || 0), 0) || 0;
                          return acc + weekMiles;
                        }, 0);
                        const adamMiles = plan.reduce((acc, w) => {
                          const weekMiles = w.runs?.filter(r => r.adam).reduce((sum, r) => sum + (parseFloat(String(r.distance).replace(/[^\d.]/g, '')) || 0), 0) || 0;
                          return acc + weekMiles;
                        }, 0);
                        const mikeWorkouts = plan.reduce((acc, w) => acc + (w.runs?.filter(r => r.mike).length || 0) + (w.crossTraining?.filter(c => c.mike).length || 0), 0);
                        const adamWorkouts = plan.reduce((acc, w) => acc + (w.runs?.filter(r => r.adam).length || 0) + (w.crossTraining?.filter(c => c.adam).length || 0), 0);

                        const encouragements = [
                          "You're crushing it! 💪",
                          "Every mile makes you stronger! 🔥",
                          "Keep going, champions! 🏆",
                          "The finish line is waiting for you! 🎯",
                          "Together you're unstoppable! 💕"
                        ];
                        const encouragement = encouragements[Math.floor(mikeMiles + adamMiles) % encouragements.length];

                        return (
                          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl p-6 border border-orange-500/30 mb-6">
                            {/* Color Legend */}
                            <div className="flex justify-center gap-6 mb-4 text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                                <span className="text-blue-400">Mike</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                                <span className="text-purple-400">Adam</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-green-500/40"></div>
                                <span className="text-green-400">Both ✓</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-yellow-500/40"></div>
                                <span className="text-yellow-400">One ✓</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center mb-4">
                              <div>
                                <div className="text-3xl font-bold text-orange-400">{completedWeeks}</div>
                                <div className="text-white/60 text-sm">Weeks Done (Both)</div>
                              </div>
                              <div>
                                <div className="flex justify-center gap-4">
                                  <div>
                                    <div className="text-2xl font-bold text-blue-400">{mikeMiles.toFixed(1)}</div>
                                    <div className="text-white/40 text-xs">Mike</div>
                                  </div>
                                  <div>
                                    <div className="text-2xl font-bold text-purple-400">{adamMiles.toFixed(1)}</div>
                                    <div className="text-white/40 text-xs">Adam</div>
                                  </div>
                                </div>
                                <div className="text-white/60 text-sm">Miles Run</div>
                              </div>
                              <div>
                                <div className="flex justify-center gap-4">
                                  <div>
                                    <div className="text-2xl font-bold text-blue-400">{mikeWorkouts}</div>
                                    <div className="text-white/40 text-xs">Mike</div>
                                  </div>
                                  <div>
                                    <div className="text-2xl font-bold text-purple-400">{adamWorkouts}</div>
                                    <div className="text-white/40 text-xs">Adam</div>
                                  </div>
                                </div>
                                <div className="text-white/60 text-sm">Workouts</div>
                              </div>
                            </div>
                            <div className="text-center text-lg text-white font-medium mb-4">
                              {encouragement}
                            </div>

                            {/* Share Progress Button */}
                            <div className="text-center">
                              <button
                                onClick={() => {
                                  const eventDate = parseLocalDate(selectedFitnessEvent.date);
                                  const today = new Date();
                                  const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
                                  const totalMiles = mikeMiles + adamMiles;
                                  const text = `🏃 Training Update for ${selectedFitnessEvent.emoji} ${selectedFitnessEvent.name}!\n\n` +
                                    `📅 ${daysUntil} days until race day\n` +
                                    `✅ ${completedWeeks} weeks completed together\n` +
                                    `🏃 ${totalMiles.toFixed(1)} miles run combined\n` +
                                    `💪 Mike: ${mikeWorkouts} workouts | Adam: ${adamWorkouts} workouts\n\n` +
                                    `${encouragement}\n\n#TrainingTogether #RunningPartners`;
                                  if (navigator.share) {
                                    navigator.share({ title: 'Training Progress', text });
                                  } else {
                                    navigator.clipboard.writeText(text);
                                    showToast('Progress copied to clipboard! 📋', 'success');
                                  }
                                }}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-full text-white font-medium transition"
                              >
                                <Share2 className="w-4 h-4" />
                                Share Progress
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Training Weeks - Past (collapsed) → Current (highlight) → Future (accordion) */}
                      {(() => {
                        const allWeeks = getActiveTrainingPlan(selectedFitnessEvent.id);
                        const today = new Date();
                        const todayStr = toLocalDateStr(today);
                        const pastWeeks = allWeeks.filter(w => w.endDate < todayStr);
                        const currentWeek = allWeeks.find(w => w.startDate <= todayStr && w.endDate >= todayStr);
                        const currentWeekIndex = allWeeks.findIndex(w => w.startDate <= todayStr && w.endDate >= todayStr);
                        const futureWeeks = allWeeks.filter(w => w.startDate > todayStr);
                        // Triathlon removed; isTriathlon is now a Mike-only-plan check (same UI behavior).
                        const isTriathlon = allWeeks[0]?.runs?.[0] && !('adam' in allWeeks[0].runs[0]);

                        const renderWeekAccordion = (week, index, opts = {}) => {
                          const isPast = week.endDate < todayStr;
                          const completedCount = isTriathlon
                            ? (week.runs?.filter(r => r.mike).length || 0) + (week.crossTraining?.filter(c => c.mike).length || 0)
                            : (week.runs?.filter(r => r.mike && r.adam).length || 0) + (week.crossTraining?.filter(c => c.mike && c.adam).length || 0);
                          const totalCount = (week.runs?.length || 0) + (week.crossTraining?.length || 0);
                          const weekPhotos = week.photos || [];

                          return (
                            <details
                              key={week.id}
                              className={`group rounded-xl border transition ${
                                isPast ? 'border-white/10 bg-gray-600/20 opacity-70' :
                                'border-white/10 hover:border-white/20 bg-white/5'
                              } ${week.isRecovery ? 'bg-green-500/10' : ''}`}
                            >
                              <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    isPast ? 'bg-white/20 text-white/60' : 'bg-white/10 text-white/80'
                                  }`}>
                                    {index + 1}
                                  </div>
                                  <div>
                                    <div className="text-white font-medium flex items-center gap-2">
                                      Week {index + 1}
                                      {week.isRecovery && <span className="text-xs px-2 py-0.5 bg-green-500/30 text-green-300 rounded-full">Recovery</span>}
                                    </div>
                                    <div className="text-white/60 text-sm">
                                      {formatDate(week.startDate)} - {formatDate(week.endDate)}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {weekPhotos.length > 0 && (
                                    <div className="flex -space-x-2">
                                      {weekPhotos.slice(0, 3).map(photo => (
                                        <img key={photo.id} src={photo.url} alt="" className="w-8 h-8 rounded-lg object-cover border-2 border-slate-800" />
                                      ))}
                                      {weekPhotos.length > 3 && <span className="w-8 h-8 rounded-lg bg-white/20 border-2 border-slate-800 flex items-center justify-center text-[10px] text-white/70 font-medium">+{weekPhotos.length - 3}</span>}
                                    </div>
                                  )}
                                  <div className="text-white/60 text-sm">{completedCount}/{totalCount} done</div>
                                  <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${completedCount === totalCount ? 'bg-green-500' : 'bg-orange-400'}`} style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }} />
                                  </div>
                                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingTrainingWeek({ eventId: selectedFitnessEvent.id, week: { ...week } }); }} className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition" title="Edit week">
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <ChevronRight className="w-5 h-5 text-white/40 transition-transform group-open:rotate-90" />
                                </div>
                              </summary>
                              <div className="px-4 pb-4 pt-2 border-t border-white/10">
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="text-sm font-semibold text-orange-300 mb-2">{isTriathlon ? '🏃 Activities' : '🏃 Runs'}</h4>
                                    <div className="space-y-1">
                                      {week.runs?.map(run => (
                                        <div key={run.id} className={`flex items-center gap-2 p-2 rounded ${isTriathlon ? (run.mike ? 'bg-green-500/20' : 'bg-white/5') : ((run.mike && run.adam) ? 'bg-green-500/20' : (run.mike || run.adam) ? 'bg-yellow-500/20' : 'bg-white/5')}`}>
                                          <div className="flex gap-1">
                                            <button onClick={() => updateWorkout(selectedFitnessEvent.id, week.id, 'runs', run.id, { mike: !run.mike })} className={`w-5 h-5 rounded-full border flex items-center justify-center ${run.mike ? 'bg-blue-500 border-blue-500' : 'border-white/40'}`} title="Mike">
                                              {run.mike && <Check className="w-3 h-3 text-white" />}
                                            </button>
                                            {!isTriathlon && <button onClick={() => updateWorkout(selectedFitnessEvent.id, week.id, 'runs', run.id, { adam: !run.adam })} className={`w-5 h-5 rounded-full border flex items-center justify-center ${run.adam ? 'bg-purple-500 border-purple-500' : 'border-white/40'}`} title="Adam">{run.adam && <Check className="w-3 h-3 text-white" />}</button>}
                                          </div>
                                          <span className="text-white/80 text-sm flex-1">{run.label || run.day}</span>
                                          <span className="text-white font-medium text-sm">{run.distance}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold text-red-300 mb-2">💪 Cross Training</h4>
                                    <div className="space-y-1">
                                      {week.crossTraining?.map(ct => (
                                        <div key={ct.id} className={`flex items-center gap-2 p-2 rounded ${isTriathlon ? (ct.mike ? 'bg-green-500/20' : 'bg-white/5') : ((ct.mike && ct.adam) ? 'bg-green-500/20' : (ct.mike || ct.adam) ? 'bg-yellow-500/20' : 'bg-white/5')}`}>
                                          <div className="flex gap-1">
                                            <button onClick={() => updateWorkout(selectedFitnessEvent.id, week.id, 'crossTraining', ct.id, { mike: !ct.mike })} className={`w-5 h-5 rounded-full border flex items-center justify-center ${ct.mike ? 'bg-blue-500 border-blue-500' : 'border-white/40'}`} title="Mike">
                                              {ct.mike && <Check className="w-3 h-3 text-white" />}
                                            </button>
                                            {!isTriathlon && <button onClick={() => updateWorkout(selectedFitnessEvent.id, week.id, 'crossTraining', ct.id, { adam: !ct.adam })} className={`w-5 h-5 rounded-full border flex items-center justify-center ${ct.adam ? 'bg-purple-500 border-purple-500' : 'border-white/40'}`} title="Adam">{ct.adam && <Check className="w-3 h-3 text-white" />}</button>}
                                          </div>
                                          <span className="text-white/80 text-sm flex-1">{ct.label || ct.day}</span>
                                          <span className="text-white/60 text-xs">30+ min</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <textarea value={weekNotesLocal[`${selectedFitnessEvent.id}:${week.id}`] ?? week.weekNotes ?? ''} onChange={(e) => handleWeekNotesChange(selectedFitnessEvent.id, week.id, e.target.value)} placeholder="Notes for this week..." className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm resize-y" rows={1} />
                                </div>
                                <div
                                  className="mt-3"
                                  onDrop={(e) => { e.preventDefault(); setWeekPhotoDrag(null); const file = e.dataTransfer?.files?.[0]; if (file) handleWeekPhotoAdd(selectedFitnessEvent.id, week.id, weekPhotos, file); }}
                                  onDragOver={(e) => { e.preventDefault(); setWeekPhotoDrag(week.id); }}
                                  onDragLeave={() => setWeekPhotoDrag(null)}
                                >
                                  {weekPhotos.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                      {weekPhotos.map((photo, photoIdx) => (
                                        <div key={photo.id} className="relative group/photo">
                                          <img src={photo.url} alt="" className="w-20 h-20 rounded-lg object-cover border border-white/10 cursor-pointer" onClick={() => openLightbox(weekPhotos.map(p => p.url), photoIdx)} />
                                          <button onClick={(e) => { e.stopPropagation(); handleWeekPhotoRemove(selectedFitnessEvent.id, week.id, weekPhotos, photo.id); }} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition"><X className="w-3 h-3 text-white" /></button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {uploadingWeekPhotoId === week.id ? (
                                    <div className="flex items-center gap-2 px-3 py-2 border border-dashed rounded-lg border-orange-400 bg-orange-500/10 text-orange-300">
                                      <Loader className="w-4 h-4 animate-spin" />
                                      <span className="text-xs">Uploading...</span>
                                    </div>
                                  ) : (
                                    <label className={`flex items-center gap-2 px-3 py-2 border border-dashed rounded-lg cursor-pointer transition ${weekPhotoDrag === week.id ? 'border-orange-400 bg-orange-500/10 text-orange-300' : 'border-white/10 text-white/30 hover:text-white/50 hover:border-white/20'}`}>
                                      <Upload className="w-4 h-4" />
                                      <span className="text-xs">Add Photo</span>
                                      <input
                                        type="file"
                                        accept="image/*,.heic,.heif"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) handleWeekPhotoAdd(selectedFitnessEvent.id, week.id, weekPhotos, file);
                                          e.target.value = '';
                                        }}
                                      />
                                    </label>
                                  )}
                                </div>
                              </div>
                            </details>
                          );
                        };

                        return (
                          <div className="space-y-2">
                            {/* 1. Past Weeks - Collapsed */}
                            {pastWeeks.length > 0 && (
                              <div className="rounded-xl border border-white/10 overflow-hidden">
                                <button
                                  onClick={() => setPastWeeksExpanded(!pastWeeksExpanded)}
                                  className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 transition text-white/60"
                                >
                                  <div className="flex items-center gap-2">
                                    {pastWeeksExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    <span className="text-sm font-medium">Past Weeks ({pastWeeks.length})</span>
                                  </div>
                                  <span className="text-xs text-white/40">
                                    {pastWeeks.filter(w => {
                                      const cc = isTriathlon ? (w.runs?.filter(r => r.mike).length || 0) + (w.crossTraining?.filter(c => c.mike).length || 0) : (w.runs?.filter(r => r.mike && r.adam).length || 0) + (w.crossTraining?.filter(c => c.mike && c.adam).length || 0);
                                      const tc = (w.runs?.length || 0) + (w.crossTraining?.length || 0);
                                      return tc > 0 && cc === tc;
                                    }).length}/{pastWeeks.length} completed
                                  </span>
                                </button>
                                {pastWeeksExpanded && (
                                  <div className="space-y-2 p-2">
                                    {pastWeeks.map((week) => renderWeekAccordion(week, allWeeks.findIndex(w => w.id === week.id)))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* 2. Current Week Highlight */}
                            {currentWeek && (
                              <div className="bg-gradient-to-r from-orange-500/30 to-red-500/30 rounded-2xl p-6 border-2 border-orange-500/50">
                                <div className="flex items-center gap-2 mb-4">
                                  <span className="text-2xl">📅</span>
                                  <h3 className="text-xl font-bold text-white">This Week - Week {currentWeek.weekNumber || currentWeekIndex + 1}</h3>
                                  <span className="px-3 py-1 bg-orange-500 text-white text-sm font-bold rounded-full">CURRENT</span>
                                  {currentWeek.totalMiles && <span className="px-3 py-1 bg-white/20 text-white text-sm rounded-full">{currentWeek.totalMiles} mi goal</span>}
                                  <button onClick={() => setEditingTrainingWeek({ eventId: selectedFitnessEvent.id, week: { ...currentWeek } })} className="ml-auto p-2 text-white/60 hover:text-white hover:bg-white/20 rounded-lg transition" title="Edit week">
                                    <Pencil className="w-5 h-5" />
                                  </button>
                                </div>
                                {currentWeek.weekNotes && <div className="mb-4 px-4 py-2 bg-white/10 rounded-lg text-white/90">{currentWeek.weekNotes}</div>}
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div className="bg-white/10 rounded-xl p-4">
                                    <h4 className="text-lg font-semibold text-orange-300 mb-3 flex items-center gap-2"><span>🏃</span> {isTriathlon ? 'Activities' : 'Runs'}</h4>
                                    <div className="space-y-2">
                                      {currentWeek.runs?.map(run => (
                                        <div key={run.id} className={`flex items-center gap-3 p-3 rounded-lg ${isTriathlon ? (run.mike ? 'bg-green-500/20' : 'bg-white/5') : ((run.mike && run.adam) ? 'bg-green-500/20' : (run.mike || run.adam) ? 'bg-yellow-500/20' : 'bg-white/5')}`}>
                                          <div className="flex gap-2">
                                            <button onClick={() => updateWorkout(selectedFitnessEvent.id, currentWeek.id, 'runs', run.id, { mike: !run.mike })} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${run.mike ? 'bg-blue-500 border-blue-500' : 'border-white/40 hover:border-white'}`} title="Mike">{run.mike && <Check className="w-4 h-4 text-white" />}</button>
                                            {!isTriathlon && <button onClick={() => updateWorkout(selectedFitnessEvent.id, currentWeek.id, 'runs', run.id, { adam: !run.adam })} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${run.adam ? 'bg-purple-500 border-purple-500' : 'border-white/40 hover:border-white'}`} title="Adam">{run.adam && <Check className="w-4 h-4 text-white" />}</button>}
                                          </div>
                                          <div className="flex-1">
                                            <div className="text-white font-medium">{run.label || run.day}</div>
                                            <div className="text-xs text-white/50">{isTriathlon ? <span className={run.mike ? 'text-blue-400' : 'text-white/30'}>Mike</span> : <><span className={run.mike ? 'text-blue-400' : 'text-white/30'}>M</span>{' / '}<span className={run.adam ? 'text-purple-400' : 'text-white/30'}>A</span></>}</div>
                                          </div>
                                          <div className="text-white font-bold">{run.distance}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="bg-white/10 rounded-xl p-4">
                                    <h4 className="text-lg font-semibold text-red-300 mb-3 flex items-center gap-2"><span>💪</span> Cross Training</h4>
                                    <div className="space-y-2">
                                      {currentWeek.crossTraining?.map(ct => (
                                        <div key={ct.id} className={`flex items-center gap-3 p-3 rounded-lg ${isTriathlon ? (ct.mike ? 'bg-green-500/20' : 'bg-white/5') : ((ct.mike && ct.adam) ? 'bg-green-500/20' : (ct.mike || ct.adam) ? 'bg-yellow-500/20' : 'bg-white/5')}`}>
                                          <div className="flex gap-2">
                                            <button onClick={() => updateWorkout(selectedFitnessEvent.id, currentWeek.id, 'crossTraining', ct.id, { mike: !ct.mike })} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${ct.mike ? 'bg-blue-500 border-blue-500' : 'border-white/40 hover:border-white'}`} title="Mike">{ct.mike && <Check className="w-4 h-4 text-white" />}</button>
                                            {!isTriathlon && <button onClick={() => updateWorkout(selectedFitnessEvent.id, currentWeek.id, 'crossTraining', ct.id, { adam: !ct.adam })} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${ct.adam ? 'bg-purple-500 border-purple-500' : 'border-white/40 hover:border-white'}`} title="Adam">{ct.adam && <Check className="w-4 h-4 text-white" />}</button>}
                                          </div>
                                          <div className="flex-1">
                                            <div className="text-white font-medium">{ct.label || ct.day}</div>
                                            <div className="text-xs text-white/50">{isTriathlon ? <span className={ct.mike ? 'text-blue-400' : 'text-white/30'}>Mike</span> : <><span className={ct.mike ? 'text-blue-400' : 'text-white/30'}>M</span>{' / '}<span className={ct.adam ? 'text-purple-400' : 'text-white/30'}>A</span></>}</div>
                                          </div>
                                          <span className="text-white/60 text-sm">30+ min</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                {/* Current Week Notes */}
                                <div className="mt-4">
                                  <textarea value={weekNotesLocal[`${selectedFitnessEvent.id}:${currentWeek.id}`] ?? currentWeek.weekNotes ?? ''} onChange={(e) => handleWeekNotesChange(selectedFitnessEvent.id, currentWeek.id, e.target.value)} placeholder="Add notes for this week..." className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 resize-y" rows={2} />
                                </div>
                                {/* Current Week Photos */}
                                <div
                                  className="mt-4"
                                  onDrop={(e) => { e.preventDefault(); setWeekPhotoDrag(null); const file = e.dataTransfer?.files?.[0]; if (file) handleWeekPhotoAdd(selectedFitnessEvent.id, currentWeek.id, currentWeek.photos || [], file); }}
                                  onDragOver={(e) => { e.preventDefault(); setWeekPhotoDrag(currentWeek.id); }}
                                  onDragLeave={() => setWeekPhotoDrag(null)}
                                >
                                  {(currentWeek.photos || []).length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                      {(currentWeek.photos || []).map(photo => (
                                        <div key={photo.id} className="relative group/photo">
                                          <img src={photo.url} alt="" className="w-24 h-24 rounded-xl object-cover border border-white/20" />
                                          <button onClick={() => handleWeekPhotoRemove(selectedFitnessEvent.id, currentWeek.id, currentWeek.photos, photo.id)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition"><X className="w-3 h-3 text-white" /></button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {uploadingWeekPhotoId === currentWeek.id ? (
                                    <div className="flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl border-orange-400 bg-orange-500/10 text-orange-300">
                                      <Loader className="w-5 h-5 animate-spin" />
                                      <span className="text-sm">Uploading photo...</span>
                                    </div>
                                  ) : (
                                  <label className={`flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition ${weekPhotoDrag === currentWeek.id ? 'border-orange-400 bg-orange-500/10 text-orange-300' : 'border-white/20 text-white/40 hover:text-white/60 hover:border-white/30'}`}>
                                    <Upload className="w-5 h-5" />
                                    <span className="text-sm">Add Photo</span>
                                    <input
                                      type="file"
                                      accept="image/*,.heic,.heif"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleWeekPhotoAdd(selectedFitnessEvent.id, currentWeek.id, currentWeek.photos || [], file);
                                        e.target.value = '';
                                      }}
                                    />
                                  </label>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* 3. Future Weeks */}
                            {futureWeeks.map((week) => renderWeekAccordion(week, allWeeks.findIndex(w => w.id === week.id)))}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {!selectedFitnessEvent && (
                    <div className="text-center text-white/60 py-12">
                      <span className="text-4xl mb-4 block">👆</span>
                      <p>Select an event above to view its training plan</p>
                    </div>
                  )}
                </div>
              )}

              {/* Stats View */}
              {fitnessViewMode === 'stats' && (
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Total Stats */}
                  {(() => {
                    // Initialize counters
                    let totalRuns = 0, mikeRuns = 0, adamRuns = 0;
                    let totalSwims = 0, mikeSwims = 0, adamSwims = 0;
                    let totalBikes = 0, mikeBikes = 0, adamBikes = 0;
                    let totalCross = 0, mikeCross = 0, adamCross = 0;
                    let mikeRunMiles = 0, adamRunMiles = 0;
                    let mikeSwimYards = 0, adamSwimYards = 0;
                    let mikeBikeMiles = 0, adamBikeMiles = 0;

                    // Helper to detect activity type from label
                    const isSwim = (label) => label?.toLowerCase().includes('swim') || label?.includes('🏊');
                    const isBike = (label) => label?.toLowerCase().includes('bike') || label?.toLowerCase().includes('cycle') || label?.includes('🚴');

                    // Use getActiveTrainingPlan to get merged hardcoded + Firebase data
                    fitnessEvents.forEach(event => {
                      const plan = getActiveTrainingPlan(event.id);
                      plan.forEach(week => {
                        week.runs?.forEach(activity => {
                          const label = activity.label || '';
                          const distanceStr = activity.distance || '';
                          const distanceNum = parseFloat(distanceStr) || 0;

                          if (isSwim(label)) {
                            totalSwims++;
                            if (activity.mike) {
                              mikeSwims++;
                              mikeSwimYards += distanceNum;
                            }
                            if (activity.adam) {
                              adamSwims++;
                              adamSwimYards += distanceNum;
                            }
                          } else if (isBike(label)) {
                            totalBikes++;
                            if (activity.mike) {
                              mikeBikes++;
                              mikeBikeMiles += distanceNum;
                            }
                            if (activity.adam) {
                              adamBikes++;
                              adamBikeMiles += distanceNum;
                            }
                          } else {
                            // Treat as run
                            totalRuns++;
                            if (activity.mike) {
                              mikeRuns++;
                              mikeRunMiles += distanceNum;
                            }
                            if (activity.adam) {
                              adamRuns++;
                              adamRunMiles += distanceNum;
                            }
                          }
                        });
                        week.crossTraining?.forEach(ct => {
                          totalCross++;
                          if (ct.mike) mikeCross++;
                          if (ct.adam) adamCross++;
                        });
                      });
                    });

                    return (
                      <>
                        {/* Runs */}
                        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl p-6 border border-orange-500/30">
                          <div className="text-4xl mb-2">🏃</div>
                          <div className="text-xl font-bold text-white mb-2">Runs Completed</div>
                          <div className="flex justify-around">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-400">{mikeRuns}</div>
                              <div className="text-xs text-white/60">Mike</div>
                              <div className="text-xs text-blue-300">{mikeRunMiles.toFixed(1)} mi</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-400">{adamRuns}</div>
                              <div className="text-xs text-white/60">Adam</div>
                              <div className="text-xs text-purple-300">{adamRunMiles.toFixed(1)} mi</div>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-orange-300 text-center">{totalRuns} total in plan</div>
                        </div>

                        {/* Swims */}
                        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl p-6 border border-cyan-500/30">
                          <div className="text-4xl mb-2">🏊</div>
                          <div className="text-xl font-bold text-white mb-2">Swims Completed</div>
                          <div className="flex justify-around">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-400">{mikeSwims}</div>
                              <div className="text-xs text-white/60">Mike</div>
                              <div className="text-xs text-blue-300">{mikeSwimYards.toFixed(0)} yds</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-400">{adamSwims}</div>
                              <div className="text-xs text-white/60">Adam</div>
                              <div className="text-xs text-purple-300">{adamSwimYards.toFixed(0)} yds</div>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-cyan-300 text-center">{totalSwims} total in plan</div>
                        </div>

                        {/* Bikes */}
                        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/30">
                          <div className="text-4xl mb-2">🚴</div>
                          <div className="text-xl font-bold text-white mb-2">Bike Rides</div>
                          <div className="flex justify-around">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-400">{mikeBikes}</div>
                              <div className="text-xs text-white/60">Mike</div>
                              <div className="text-xs text-blue-300">{mikeBikeMiles.toFixed(1)} mi</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-400">{adamBikes}</div>
                              <div className="text-xs text-white/60">Adam</div>
                              <div className="text-xs text-purple-300">{adamBikeMiles.toFixed(1)} mi</div>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-green-300 text-center">{totalBikes} total in plan</div>
                        </div>

                        {/* Cross Training */}
                        <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-2xl p-6 border border-red-500/30">
                          <div className="text-4xl mb-2">💪</div>
                          <div className="text-xl font-bold text-white mb-2">Cross Training</div>
                          <div className="flex justify-around">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-400">{mikeCross}</div>
                              <div className="text-xs text-white/60">Mike</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-400">{adamCross}</div>
                              <div className="text-xs text-white/60">Adam</div>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-red-300 text-center">{totalCross} total in plan</div>
                        </div>

                        {/* Total Distance Summary */}
                        <div className="md:col-span-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-500/30">
                          <div className="text-4xl mb-2">📏</div>
                          <div className="text-xl font-bold text-white mb-4">Total Distance Logged</div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-400 mb-1">Mike</div>
                              <div className="space-y-1 text-sm">
                                <div className="text-white/80">🏃 {mikeRunMiles.toFixed(1)} miles running</div>
                                <div className="text-white/80">🏊 {mikeSwimYards.toFixed(0)} yards swimming</div>
                                <div className="text-white/80">🚴 {mikeBikeMiles.toFixed(1)} miles biking</div>
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-purple-400 mb-1">Adam</div>
                              <div className="space-y-1 text-sm">
                                <div className="text-white/80">🏃 {adamRunMiles.toFixed(1)} miles running</div>
                                <div className="text-white/80">🏊 {adamSwimYards.toFixed(0)} yards swimming</div>
                                <div className="text-white/80">🚴 {adamBikeMiles.toFixed(1)} miles biking</div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 text-sm text-yellow-300 text-center">Keep pushing! 🔥</div>
                        </div>
                      </>
                    );
                  })()}

                  {/* Weekly Streak - Mike */}
                  <div className="md:col-span-3 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl p-6 border border-blue-500/30">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <span>🔥</span> Mike's Training Consistency
                    </h3>
                    {fitnessEvents.filter(e => e.status !== 'completed').map(event => {
                      const plan = getActiveTrainingPlan(event.id);
                      return (
                        <div key={event.id} className="mb-4">
                          <div className="text-sm text-blue-300 mb-2">{event.emoji} {event.name}</div>
                          <div className="flex gap-2 flex-wrap">
                            {plan.map((week, i) => {
                              const completed = (week.runs?.filter(r => r.mike).length || 0) + (week.crossTraining?.filter(c => c.mike).length || 0);
                              const total = (week.runs?.length || 0) + (week.crossTraining?.length || 0);
                              const percentage = total > 0 ? (completed / total) * 100 : 0;

                              return (
                                <div
                                  key={week.id || i}
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${
                                    percentage === 100 ? 'bg-green-500 text-white' :
                                    percentage >= 50 ? 'bg-yellow-500 text-white' :
                                    percentage > 0 ? 'bg-orange-500/50 text-white' :
                                    'bg-white/10 text-white/40'
                                  }`}
                                  title={`Week ${i + 1}: ${completed}/${total}`}
                                >
                                  {i + 1}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex gap-4 mt-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded" />
                        <span className="text-white/60">100%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded" />
                        <span className="text-white/60">50-99%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-orange-500/50 rounded" />
                        <span className="text-white/60">1-49%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-white/10 rounded" />
                        <span className="text-white/60">0%</span>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Streak - Adam */}
                  <div className="md:col-span-3 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-2xl p-6 border border-purple-500/30">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <span>🔥</span> Adam's Training Consistency
                    </h3>
                    {/* Adam's stats: skip Mike-only events (no `adam` field on workouts) */}
                    {fitnessEvents.filter(e => {
                      const plan = fitnessTrainingPlans[e.id];
                      return !plan?.[0]?.runs?.[0] || ('adam' in plan[0].runs[0]);
                    }).map(event => {
                      const plan = getActiveTrainingPlan(event.id);
                      return (
                        <div key={event.id} className="mb-4">
                          <div className="text-sm text-purple-300 mb-2">{event.emoji} {event.name}</div>
                          <div className="flex gap-2 flex-wrap">
                            {plan.map((week, i) => {
                              const completed = (week.runs?.filter(r => r.adam).length || 0) + (week.crossTraining?.filter(c => c.adam).length || 0);
                              const total = (week.runs?.length || 0) + (week.crossTraining?.length || 0);
                              const percentage = total > 0 ? (completed / total) * 100 : 0;

                              return (
                                <div
                                  key={week.id || i}
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${
                                    percentage === 100 ? 'bg-green-500 text-white' :
                                    percentage >= 50 ? 'bg-yellow-500 text-white' :
                                    percentage > 0 ? 'bg-orange-500/50 text-white' :
                                    'bg-white/10 text-white/40'
                                  }`}
                                  title={`Week ${i + 1}: ${completed}/${total}`}
                                >
                                  {i + 1}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex gap-4 mt-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded" />
                        <span className="text-white/60">100%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded" />
                        <span className="text-white/60">50-99%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-orange-500/50 rounded" />
                        <span className="text-white/60">1-49%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-white/10 rounded" />
                        <span className="text-white/60">0%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Past Races View — memorial cards for completed events */}
              {fitnessViewMode === 'past-races' && (() => {
                const pastEvents = fitnessEvents
                  .filter(e => e.status === 'completed')
                  .sort((a, b) => b.date.localeCompare(a.date)); // most recent first

                if (pastEvents.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-3">🏆</div>
                      <p className="text-white/70">No past races yet — finish one and the memorial lives here forever.</p>
                    </div>
                  );
                }

                return (
                  <div className="grid md:grid-cols-2 gap-6">
                    {pastEvents.map(event => {
                      const plan = getActiveTrainingPlan(event.id);
                      const isMikeOnlyPlan = plan[0]?.runs?.[0] && !('adam' in plan[0].runs[0]);
                      const isAdamOnlyPlan = plan[0]?.runs?.[0] && !('mike' in plan[0].runs[0]);
                      const completedWorkouts = plan.reduce((acc, week) => {
                        let runsDone, crossDone;
                        if (isMikeOnlyPlan) {
                          runsDone = week.runs?.filter(r => r.mike).length || 0;
                          crossDone = week.crossTraining?.filter(c => c.mike).length || 0;
                        } else if (isAdamOnlyPlan) {
                          runsDone = week.runs?.filter(r => r.adam).length || 0;
                          crossDone = week.crossTraining?.filter(c => c.adam).length || 0;
                        } else {
                          runsDone = week.runs?.filter(r => r.mike && r.adam).length || 0;
                          crossDone = week.crossTraining?.filter(c => c.mike && c.adam).length || 0;
                        }
                        return acc + runsDone + crossDone;
                      }, 0);
                      const totalWorkouts = plan.reduce((acc, week) => acc + (week.runs?.length || 0) + (week.crossTraining?.length || 0), 0);
                      const totalMiles = plan.reduce((acc, week) => acc + (week.totalMiles || 0), 0);
                      // Photos persist on the week object (Storage URLs); collect any for hero display
                      const allPhotos = plan.flatMap(week => week.photos || []);

                      return (
                        <div
                          key={event.id}
                          onClick={() => { setSelectedFitnessEvent(event); setFitnessViewMode('training'); }}
                          className={`bg-gradient-to-br ${event.color} rounded-3xl p-6 shadow-xl relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform`}
                        >
                          {/* Trophy badge */}
                          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                            <span className="text-lg">🏆</span>
                            <span className="text-white text-xs font-semibold">Completed</span>
                          </div>

                          <div className="flex items-start gap-3 mb-2">
                            <span className="text-4xl">{event.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-2xl font-bold text-white">{event.name}</h3>
                              <p className="text-white/80 text-sm">
                                {parseLocalDate(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                              </p>
                              {event.location && <p className="text-white/70 text-xs">📍 {event.location}</p>}
                            </div>
                          </div>

                          {/* Photo strip if any */}
                          {allPhotos.length > 0 && (
                            <div className="flex gap-1.5 mt-3 overflow-x-auto">
                              {allPhotos.slice(0, 5).map((p, i) => (
                                <img key={i} src={p.url || p} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0 ring-2 ring-white/30" />
                              ))}
                              {allPhotos.length > 5 && (
                                <div className="w-14 h-14 rounded-lg bg-white/20 flex items-center justify-center text-white text-xs flex-shrink-0">+{allPhotos.length - 5}</div>
                              )}
                            </div>
                          )}

                          {/* Finish time hero (only for races with a recorded time) */}
                          {event.finishTime && (
                            <div className="mt-3 bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                              <div className="text-[10px] text-white/70 uppercase tracking-widest font-semibold">Finish Time</div>
                              <div className="text-3xl font-bold text-white tracking-tight">{event.finishTime}</div>
                            </div>
                          )}

                          {/* Memorial stats */}
                          <div className="grid grid-cols-3 gap-2 mt-4 bg-black/20 rounded-xl p-3">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-white">{plan.length}</div>
                              <div className="text-[10px] text-white/70 uppercase tracking-wide">weeks</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-white">{completedWorkouts}<span className="text-sm text-white/60">/{totalWorkouts}</span></div>
                              <div className="text-[10px] text-white/70 uppercase tracking-wide">workouts</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-white">{totalMiles}</div>
                              <div className="text-[10px] text-white/70 uppercase tracking-wide">miles</div>
                            </div>
                          </div>

                          <div className="text-white/80 text-xs mt-3 group-hover:text-white transition-colors">
                            Tap to relive the training journey →
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Love Note for Fitness */}
              <div className="text-center mt-12">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 rounded-full border border-red-500/30">
                  <span className="text-xl">💪</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-red-300 to-pink-300 font-medium">
                    Stronger together, one workout at a time
                  </span>
                  <span className="text-xl">❤️</span>
                </div>
              </div>

            </div>
  );
};

export default FitnessSection;

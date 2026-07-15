import React from 'react';
import { ChevronDown, ChevronLeft, ChevronUp, Plus } from 'lucide-react';
import GoalCard from '../components/SharedHub/GoalCard';
import IdeaCard from '../components/SharedHub/IdeaCard';
import ListCard from '../components/SharedHub/ListCard';
import OdysseyPlanCard from '../components/SharedHub/OdysseyPlanCard';
import SocialCard from '../components/SharedHub/SocialCard';
import TaskCard from '../components/SharedHub/TaskCard';
import TodayCard from '../components/TodayCard';
import CheckinCard from '../components/CheckinCard';
import TripPollCard from '../components/TripPollCard';
import { ideaCategories, listCategories, socialTypes, timeHorizons } from '../constants';

/**
 * HubSection — extracted verbatim from trip-planner.jsx (Phase 2 refactor,
 * 2026-07-06). State stays in the parent; pure render slice.
 */
const HubSection = (props) => {
  const {
    checkins,
    activeTripPoll,
    submitTripPoll,
    submitCheckin,
    weeklyQuestion,
    rerollQuestion,
    updateGoal,
    calendarAgenda,
    collapsedSections,
    completeSocial,
    completeTask,
    currentUser,
    deleteGoal,
    deleteIdea,
    deleteOdysseyPlan,
    deleteSocial,
    deleteTask,
    getEventLabel,
    getLinkedLabel,
    highlightGoal,
    highlightIdea,
    highlightSocial,
    highlightTask,
    hubGoalFilter,
    hubIdeaFilter,
    hubListFilter,
    hubSocialFilter,
    hubSubView,
    hubTaskFilter,
    hubTaskSort,
    navigateToEvent,
    navigateToLinked,
    promoteIdeaToTask,
    setActiveSection,
    setHubGoalFilter,
    setHubIdeaFilter,
    setHubListFilter,
    setHubSocialFilter,
    setHubSubView,
    setHubTaskFilter,
    setHubTaskSort,
    setShowAddGoalModal,
    setShowAddIdeaModal,
    setShowAddSocialModal,
    setShowAddTaskModal,
    setShowOdysseyPlanModal,
    setShowSharedListModal,
    sharedGoals,
    sharedIdeas,
    sharedLists,
    sharedOdysseyPlans,
    sharedSocial,
    sharedTasks,
    taskMatchesHorizon,
    todaySnapshot,
    toggleDashSection,
    toggleMilestone,
    updateTask,
  } = props;

  return (
            <div>
              {/* Hub sub-nav removed — all creation via FAB, dashboard shows everything */}

              {/* ===== HUB DASHBOARD VIEW ===== */}
              {hubSubView === 'home' && (
                <>
                  {/* ACTIVE COUPLE POLL */}
                  {activeTripPoll && (
                    <TripPollCard
                      poll={activeTripPoll}
                      currentUser={currentUser}
                      onSubmit={submitTripPoll}
                    />
                  )}

                  {/* TODAY TOGETHER (Phase 3) */}
                  <TodayCard
                    snapshot={todaySnapshot}
                    onGo={(s) => { setActiveSection(s); if (s === 'home') setHubSubView('home'); }}
                    onOpenTask={(t) => setShowAddTaskModal(t)}
                  />

                  {/* WEEKLY COUPLE CHECK-IN */}
                  <CheckinCard
                    me={String(currentUser || 'mike').toLowerCase()}
                    checkins={checkins}
                    onSubmit={submitCheckin}
                    question={weeklyQuestion}
                    onRerollQuestion={rerollQuestion}
                  />

                  {/* UPCOMING (shared Google calendar via Rupert/mikeslife) */}
                  {(() => {
                    const days = (calendarAgenda?.days || []).filter(d => (d.events || []).length > 0).slice(0, 7);
                    return (
                      <div className="mb-6 rounded-3xl border border-sky-500/20 bg-gradient-to-br from-sky-950/30 via-slate-900/50 to-slate-950/40 backdrop-blur-xl shadow-[0_0_30px_rgba(56,189,248,0.06)]">
                        <div className="p-4 pb-2 flex items-center justify-between">
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <span>📅</span> Upcoming
                          </h3>
                          {calendarAgenda?.updatedAt && (
                            <span className="text-[10px] text-white/30">synced {new Date(calendarAgenda.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          )}
                        </div>
                        <div className="px-4 pb-4">
                          {days.length === 0 ? (
                            <div className="py-3">
                              <p className="text-sm text-white/40">
                                {calendarAgenda ? 'Nothing on the calendar for the next two weeks.' : 'Calendar syncs each morning from the shared Google calendar (via Rupert).'}
                              </p>
                              {calendarAgenda?.nextUp && (
                                <p className="text-sm text-sky-200 mt-2">
                                  ⏭️ Next up: <span className="font-semibold">{calendarAgenda.nextUp.title}</span>
                                  <span className="text-sky-300/60"> · {calendarAgenda.nextUp.label}{calendarAgenda.nextUp.time ? ` ${calendarAgenda.nextUp.time}` : ''}</span>
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {days.map(day => (
                                <div key={day.date}>
                                  <p className="text-[11px] uppercase tracking-wider text-sky-300/60 mb-1">{day.label}</p>
                                  {(day.events || []).map((ev, i) => (
                                    <div key={i} className="flex items-baseline gap-2 py-0.5">
                                      {ev.time && <span className="text-xs text-white/40 shrink-0 w-14">{ev.time}</span>}
                                      {!ev.time && <span className="text-xs text-white/25 shrink-0 w-14">all day</span>}
                                      <span className="text-sm text-white/90 min-w-0 truncate">{ev.title}</span>
                                      {ev.calendar && <span className="text-[10px] text-white/30 shrink-0">{ev.calendar}</span>}
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* ACTIVE LISTS WIDGET */}
                  {(() => {
                    // Newest lists first — previously this sliced the array in insertion
                    // order, so a freshly created list (appended at the end) never showed
                    // on the dashboard and looked like it hadn't saved at all.
                    const allActiveLists = sharedLists.filter(l => l.status === 'active');
                    const activeLists = [...allActiveLists]
                      .sort((a, b) => String(b.createdAt || b.id || '').localeCompare(String(a.createdAt || a.id || '')))
                      .slice(0, 3);
                    const isCollapsed = collapsedSections.lists;
                    return (
                      <div className="mb-6 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 via-slate-900/50 to-slate-950/40 backdrop-blur-xl shadow-[0_0_30px_rgba(16,185,129,0.06)]">
                        <button
                          onClick={() => toggleDashSection('lists')}
                          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition"
                        >
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <span>🛒</span> Lists
                            {allActiveLists.length > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">{allActiveLists.length}</span>}
                          </h3>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowSharedListModal('create'); }}
                              className="w-7 h-7 rounded-full bg-emerald-500/20 hover:bg-emerald-500/40 flex items-center justify-center transition text-emerald-400"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <div className="text-white/40">
                              {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                            </div>
                          </div>
                        </button>
                        {!isCollapsed && (
                          <>
                            <div className="px-4 pb-1">
                              <button onClick={() => setHubSubView('lists')} className="text-xs text-teal-400 hover:text-teal-300 transition">See All →</button>
                            </div>
                            <div className="p-4 pt-2 space-y-3">
                              {activeLists.length === 0 ? (
                                <div className="text-center py-6">
                                  <span className="text-3xl mb-2 block">📝</span>
                                  <p className="text-white/40 text-sm">No active lists</p>
                                  <button onClick={() => setShowSharedListModal('create')} className="mt-3 text-xs text-teal-400 hover:text-teal-300 transition">+ Create a list</button>
                                </div>
                              ) : (
                                activeLists.map(list => (
                                  <ListCard
                                    key={list.id}
                                    list={list}
                                    currentUser={currentUser}
                                   
                                    onNavigateToLinked={navigateToLinked}
                                    getLinkedLabel={getLinkedLabel}
                                  />
                                ))
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}

                  {/* GOALS WIDGET */}
                  {(() => {
                    const activeGoals = sharedGoals.filter(g => g.status === 'active');
                    const isCollapsed = collapsedSections.goals;
                    const totalMs = activeGoals.flatMap(g => g.milestones || []);
                    const doneMs = totalMs.filter(m => m.completed).length;
                    return (
                      <div className="mb-6 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 via-slate-900/50 to-slate-950/40 backdrop-blur-xl shadow-[0_0_30px_rgba(52,211,153,0.06)]">
                        <button
                          onClick={() => toggleDashSection('goals')}
                          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition"
                        >
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <span>🎯</span> Goals
                            {activeGoals.length > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">{doneMs}/{totalMs.length} milestones</span>}
                          </h3>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowAddGoalModal('create'); }}
                              className="w-7 h-7 rounded-full bg-emerald-500/20 hover:bg-emerald-500/40 flex items-center justify-center transition text-emerald-400"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <div className="text-white/40">
                              {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                            </div>
                          </div>
                        </button>
                        {!isCollapsed && (
                          <>
                            <div className="px-4 pb-1">
                              <button onClick={() => setHubSubView('goals')} className="text-xs text-emerald-400 hover:text-emerald-300 transition">See All →</button>
                            </div>
                            <div className="p-4 pt-2 space-y-2">
                              {activeGoals.length === 0 ? (
                                <div className="text-center py-6">
                                  <span className="text-3xl mb-2 block">🎯</span>
                                  <p className="text-white/40 text-sm">No goals yet</p>
                                  <button onClick={() => setShowAddGoalModal('create')} className="mt-3 text-xs text-teal-400 hover:text-teal-300 transition">+ Add a goal</button>
                                </div>
                              ) : (
                                <>
                                  {activeGoals.slice(0, 5).map(goal => (
                                    <GoalCard
                                      key={goal.id}
                                      goal={goal}
                                      currentUser={currentUser}
                                      onToggleMilestone={toggleMilestone}
                                      onEdit={() => setShowAddGoalModal(goal)}
                                      onDelete={() => deleteGoal(goal.id)}
                                      onHighlight={() => highlightGoal(goal.id)}
                                      onToggleAchieved={(g) => updateGoal(g.id, g.status === 'achieved'
                                        ? { status: 'active', achievedAt: null }
                                        : { status: 'achieved', achievedAt: new Date().toISOString() })}
                                    />
                                  ))}
                                  {activeGoals.length > 5 && <div className="text-xs text-white/30 text-center pt-1">+{activeGoals.length - 5} more</div>}
                                </>
                              )}

                              {/* 🏆 ACHIEVED SHELF — completed goals live here forever */}
                              {(() => {
                                const achieved = sharedGoals.filter(g => g.status === 'achieved')
                                  .sort((a, b) => String(b.achievedAt || '').localeCompare(String(a.achievedAt || '')));
                                if (achieved.length === 0) return null;
                                return (
                                  <div className="mt-4 pt-3 border-t border-white/10">
                                    <p className="text-[11px] uppercase tracking-wider text-amber-300/60 mb-2">🏆 Achieved ({achieved.length})</p>
                                    <div className="space-y-1.5">
                                      {achieved.map(g => (
                                        <div key={g.id} className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/15 rounded-xl px-3 py-2">
                                          <span>{g.emoji || '🏆'}</span>
                                          <span className="text-sm text-white/80 flex-1 min-w-0 truncate">{g.title}</span>
                                          {g.achievedAt && (
                                            <span className="text-[10px] text-amber-300/50 shrink-0">
                                              {new Date(g.achievedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                          )}
                                          <button
                                            onClick={() => updateGoal(g.id, { status: 'active', achievedAt: null })}
                                            className="text-[10px] text-white/30 hover:text-white/70 shrink-0"
                                            title="Reopen"
                                          >↩️</button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}

                  {/* RECENT IDEAS WIDGET */}
                  {(() => {
                    // Newest first (same fix as Lists — insertion-order slice hid new items)
                    const recentIdeas = [...sharedIdeas.filter(i => i.status === 'inbox' || i.status === 'saved')]
                      .sort((a, b) => String(b.createdAt || b.id || '').localeCompare(String(a.createdAt || a.id || '')))
                      .slice(0, 4);
                    const isCollapsed = collapsedSections.ideas;
                    return (
                      <div className="mb-6 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-950/30 via-slate-900/50 to-slate-950/40 backdrop-blur-xl shadow-[0_0_30px_rgba(245,158,11,0.06)]">
                        <button
                          onClick={() => toggleDashSection('ideas')}
                          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition"
                        >
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <span>💡</span> Ideas
                          </h3>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowAddIdeaModal('create'); }}
                              className="w-7 h-7 rounded-full bg-amber-500/20 hover:bg-amber-500/40 flex items-center justify-center transition text-amber-400"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <div className="text-white/40">
                              {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                            </div>
                          </div>
                        </button>
                        {!isCollapsed && (
                          <>
                            <div className="px-4 pb-1">
                              <button onClick={() => setHubSubView('ideas')} className="text-xs text-teal-400 hover:text-teal-300 transition">See All →</button>
                            </div>
                            <div className="p-4 pt-2 grid grid-cols-2 gap-3">
                              {recentIdeas.length === 0 ? (
                                <div className="col-span-2 text-center py-6">
                                  <span className="text-3xl mb-2 block">💡</span>
                                  <p className="text-white/40 text-sm">No ideas yet</p>
                                  <button onClick={() => setShowAddIdeaModal('create')} className="mt-3 text-xs text-teal-400 hover:text-teal-300 transition">+ Add an idea</button>
                                </div>
                              ) : (
                                recentIdeas.map(idea => (
                                  <IdeaCard
                                    key={idea.id}
                                    idea={idea}

                                    onPromoteToTask={promoteIdeaToTask}
                                  />
                                ))
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}

                  {/* Stats section removed — replaced by Goal Progress at top */}
                </>
              )}

              {/* ===== TASKS FULL VIEW ===== */}
              {hubSubView === 'tasks' && (
                <div>
                  <button onClick={() => setHubSubView('home')} className="flex items-center gap-1 text-sm text-white/60 hover:text-white mb-3 transition">
                    <ChevronLeft className="w-4 h-4" /> Back to Hub
                  </button>
                  {/* Time horizon filter tabs + sort toggle */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex gap-1.5 overflow-x-auto pb-1 flex-1">
                      {timeHorizons.map(h => (
                        <button key={h.value} onClick={() => setHubTaskFilter(h.value)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${hubTaskFilter === h.value ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                          {h.emoji} {h.label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setHubTaskSort(prev => prev === 'date' ? 'priority' : 'date')}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition shrink-0 ${
                        hubTaskSort === 'priority' ? 'bg-red-500/20 text-red-300 border border-red-400/30' : 'bg-white/5 text-white/50 hover:bg-white/10'
                      }`}
                      title={hubTaskSort === 'priority' ? 'Sorted by priority' : 'Sort by priority'}
                    >
                      🔥 {hubTaskSort === 'priority' ? 'Priority' : 'Date'}
                    </button>
                  </div>
                  {/* Task list */}
                  <div className="space-y-2 mb-4">
                    {sharedTasks
                      .filter(t => t.status !== 'done' && taskMatchesHorizon(t, hubTaskFilter))
                      .sort((a, b) => {
                        if (hubTaskSort === 'priority') {
                          const pOrder = { high: 0, medium: 1, low: 2 };
                          const pa = pOrder[a.priority] ?? 2;
                          const pb = pOrder[b.priority] ?? 2;
                          if (pa !== pb) return pa - pb;
                        }
                        return (a.dueDate || '9999') > (b.dueDate || '9999') ? 1 : -1;
                      })
                      .map(task => (
                        <div key={task.id} data-search-id={`tasks-${task.id}`}>
                          <TaskCard task={task} onComplete={completeTask} onDelete={deleteTask} onHighlight={highlightTask} onUpdatePriority={(id, p) => updateTask(id, { priority: p })} onNavigateToLinked={navigateToLinked} getLinkedLabel={getLinkedLabel} />
                        </div>
                      ))
                    }
                    {sharedTasks.filter(t => t.status !== 'done' && taskMatchesHorizon(t, hubTaskFilter)).length === 0 && (
                      <div className="text-center py-12">
                        <span className="text-4xl mb-3 block">{timeHorizons.find(h => h.value === hubTaskFilter)?.emoji || '✅'}</span>
                        <p className="text-white/40 text-sm">No tasks for {timeHorizons.find(h => h.value === hubTaskFilter)?.label?.toLowerCase()}</p>
                      </div>
                    )}
                  </div>
                  {/* Completed tasks */}
                  {sharedTasks.filter(t => t.status === 'done').length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-xs uppercase tracking-wider text-white/30 mb-3">Completed</h4>
                      <div className="space-y-2">
                        {sharedTasks.filter(t => t.status === 'done').slice(0, 10).map(task => (
                          <TaskCard key={task.id} task={task} onNavigateToLinked={navigateToLinked} getLinkedLabel={getLinkedLabel} />
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Add task button */}
                  <button onClick={() => setShowAddTaskModal('create')}
                    className="w-full mt-4 py-3 rounded-2xl border-2 border-dashed border-white/10 text-white/40 hover:border-teal-500/30 hover:text-teal-400 transition text-sm">
                    + Add Task
                  </button>
                </div>
              )}

              {/* ===== LISTS FULL VIEW ===== */}
              {hubSubView === 'lists' && (
                <div>
                  <button onClick={() => setHubSubView('home')} className="flex items-center gap-1 text-sm text-white/60 hover:text-white mb-3 transition">
                    <ChevronLeft className="w-4 h-4" /> Back to Hub
                  </button>
                  {/* Category filter */}
                  <div className="flex gap-1.5 mb-4 overflow-x-auto pb-2">
                    <button onClick={() => setHubListFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${hubListFilter === 'all' ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                      All
                    </button>
                    {listCategories.map(c => (
                      <button key={c.value} onClick={() => setHubListFilter(c.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${hubListFilter === c.value ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                        {c.emoji} {c.label}
                      </button>
                    ))}
                  </div>
                  {/* Lists */}
                  <div className="space-y-3 mb-4">
                    {sharedLists
                      .filter(l => l.status === 'active' && (hubListFilter === 'all' || l.category === hubListFilter))
                      .map(list => (
                        <div key={list.id} data-search-id={`lists-${list.id}`}>
                          <ListCard list={list} currentUser={currentUser} onNavigateToLinked={navigateToLinked} getLinkedLabel={getLinkedLabel} />
                        </div>
                      ))
                    }
                    {sharedLists.filter(l => l.status === 'active' && (hubListFilter === 'all' || l.category === hubListFilter)).length === 0 && (
                      <div className="text-center py-12">
                        <span className="text-4xl mb-3 block">📝</span>
                        <p className="text-white/40 text-sm">No lists yet</p>
                      </div>
                    )}
                  </div>
                  <button onClick={() => setShowSharedListModal('create')}
                    className="w-full mt-4 py-3 rounded-2xl border-2 border-dashed border-white/10 text-white/40 hover:border-emerald-500/30 hover:text-emerald-400 transition text-sm">
                    + Create List
                  </button>
                </div>
              )}

              {/* ===== SOCIAL FULL VIEW ===== */}
              {hubSubView === 'social' && (
                <div>
                  <button onClick={() => setHubSubView('home')} className="flex items-center gap-1 text-sm text-white/60 hover:text-white mb-3 transition">
                    <ChevronLeft className="w-4 h-4" /> Back to Hub
                  </button>
                  {/* Type filter */}
                  <div className="flex gap-1.5 mb-4 overflow-x-auto pb-2">
                    {[{ value: 'all', label: 'All', emoji: '👥' }, ...socialTypes].map(st => (
                      <button key={st.value} onClick={() => setHubSocialFilter(st.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${hubSocialFilter === st.value ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                        {st.emoji} {st.label}
                      </button>
                    ))}
                  </div>
                  {/* Planned */}
                  <div className="space-y-2 mb-4">
                    {sharedSocial
                      .filter(s => s.status !== 'done')
                      .filter(s => hubSocialFilter === 'all' || s.type === hubSocialFilter)
                      .sort((a, b) => {
                        if (a.date && b.date) return a.date.localeCompare(b.date);
                        if (a.date) return -1;
                        if (b.date) return 1;
                        return (b.createdAt || '').localeCompare(a.createdAt || '');
                      })
                      .map(social => (
                        <div key={social.id} data-search-id={`social-${social.id}`}>
                          <SocialCard social={social} onNavigateToEvent={navigateToEvent} getEventLabel={getEventLabel} />
                        </div>
                      ))
                    }
                  </div>
                  {/* Done section */}
                  {sharedSocial.filter(s => s.status === 'done' && (hubSocialFilter === 'all' || s.type === hubSocialFilter)).length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2">Done</h4>
                      <div className="space-y-2">
                        {sharedSocial
                          .filter(s => s.status === 'done' && (hubSocialFilter === 'all' || s.type === hubSocialFilter))
                          .slice(0, 10)
                          .map(social => (
                            <SocialCard key={social.id} social={social} onComplete={completeSocial} onDelete={deleteSocial} onHighlight={highlightSocial} onNavigateToEvent={navigateToEvent} getEventLabel={getEventLabel} />
                          ))
                        }
                      </div>
                    </div>
                  )}
                  {sharedSocial.filter(s => hubSocialFilter === 'all' || s.type === hubSocialFilter).length === 0 && (
                    <div className="text-center py-12">
                      <span className="text-4xl mb-3 block">👥</span>
                      <p className="text-white/40 text-sm">No social plans yet</p>
                      <p className="text-white/30 text-xs mt-1">Plan texts, calls, meetups, gatherings...</p>
                    </div>
                  )}
                  <button onClick={() => setShowAddSocialModal('create')}
                    className="w-full mt-4 py-3 rounded-2xl border-2 border-dashed border-white/10 text-white/40 hover:border-purple-500/30 hover:text-purple-400 transition text-sm">
                    + Plan Social
                  </button>
                </div>
              )}

              {/* ===== HABITS FULL VIEW ===== */}
              {/* ===== GOALS FULL VIEW ===== */}
              {hubSubView === 'goals' && (
                <div>
                  <button onClick={() => setHubSubView('home')} className="flex items-center gap-1 text-sm text-white/60 hover:text-white mb-3 transition">
                    <ChevronLeft className="w-4 h-4" /> Back to Hub
                  </button>
                  {/* Timeframe + scope filter */}
                  <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
                    {[
                      { value: 'all', label: 'All', emoji: '🎯' },
                      { value: '1year', label: '1 Year', emoji: '📅' },
                      { value: '5year', label: '5 Year', emoji: '🗓️' },
                      { value: 'Mike', label: 'Mike', emoji: '👤' },
                      { value: 'Adam', label: 'Adam', emoji: '👤' },
                      { value: 'Couple', label: 'Couple', emoji: '💕' },
                    ].map(f => (
                      <button key={f.value} onClick={() => setHubGoalFilter(f.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${hubGoalFilter === f.value ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                        {f.emoji} {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Active goals */}
                  <div className="space-y-3 mb-4">
                    {sharedGoals
                      .filter(g => g.status === 'active')
                      .filter(g => {
                        if (hubGoalFilter === 'all') return true;
                        if (hubGoalFilter === '1year' || hubGoalFilter === '5year') return g.timeframe === hubGoalFilter;
                        return g.scope === hubGoalFilter;
                      })
                      .map(goal => (
                        <div key={goal.id} data-search-id={`goals-${goal.id}`}>
                          <GoalCard
                            goal={goal}
                            currentUser={currentUser}
                            onToggleMilestone={toggleMilestone}
                            onEdit={() => setShowAddGoalModal(goal)}
                            onDelete={() => deleteGoal(goal.id)}
                            onHighlight={() => highlightGoal(goal.id)}
                          />
                        </div>
                      ))
                    }
                    {sharedGoals.filter(g => g.status === 'active').length === 0 && (
                      <div className="text-center py-12">
                        <span className="text-4xl mb-3 block">🎯</span>
                        <p className="text-white/40 text-sm">No goals yet</p>
                        <p className="text-white/30 text-xs mt-1">Set goals together and track your progress</p>
                      </div>
                    )}
                  </div>

                  {/* Achieved goals */}
                  {sharedGoals.filter(g => g.status === 'achieved').length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">🏆 Achieved</h4>
                      <div className="space-y-3">
                        {sharedGoals.filter(g => g.status === 'achieved').map(goal => (
                          <GoalCard
                            key={goal.id}
                            goal={goal}
                            currentUser={currentUser}
                            onToggleMilestone={toggleMilestone}
                            onEdit={() => setShowAddGoalModal(goal)}
                            onDelete={() => deleteGoal(goal.id)}
                            onHighlight={() => highlightGoal(goal.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <button onClick={() => setShowAddGoalModal('create')}
                    className="w-full mt-4 py-3 rounded-2xl border-2 border-dashed border-white/10 text-white/40 hover:border-emerald-500/30 hover:text-emerald-400 transition text-sm">
                    + New Goal
                  </button>
                </div>
              )}

              {/* ===== ODYSSEY PLANS FULL VIEW ===== */}
              {hubSubView === 'odyssey' && (
                <div>
                  <button onClick={() => setHubSubView('home')} className="flex items-center gap-1 text-sm text-white/60 hover:text-white mb-3 transition">
                    <ChevronLeft className="w-4 h-4" /> Back to Hub
                  </button>
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                      <span>🧭</span> Odyssey Plans
                    </h3>
                    <p className="text-xs text-white/40">Create 3 alternative 5-year life plans — from "Designing Your Life"</p>
                  </div>

                  <div className="space-y-4 mb-4">
                    {sharedOdysseyPlans.map(plan => (
                      <OdysseyPlanCard
                        key={plan.id}
                        plan={plan}
                        onEdit={() => setShowOdysseyPlanModal(plan)}
                        onDelete={() => deleteOdysseyPlan(plan.id)}
                      />
                    ))}
                    {sharedOdysseyPlans.length === 0 && (
                      <div className="text-center py-12">
                        <span className="text-4xl mb-3 block">🧭</span>
                        <p className="text-white/40 text-sm">No odyssey plans yet</p>
                        <p className="text-white/30 text-xs mt-1">Design 3 possible futures together</p>
                      </div>
                    )}
                  </div>

                  {sharedOdysseyPlans.length < 3 && (
                    <button onClick={() => setShowOdysseyPlanModal('create')}
                      className="w-full mt-4 py-3 rounded-2xl border-2 border-dashed border-white/10 text-white/40 hover:border-violet-500/30 hover:text-violet-400 transition text-sm">
                      + New Odyssey Plan ({sharedOdysseyPlans.length}/3)
                    </button>
                  )}
                </div>
              )}

              {/* ===== IDEAS FULL VIEW ===== */}
              {hubSubView === 'ideas' && (
                <div>
                  <button onClick={() => setHubSubView('home')} className="flex items-center gap-1 text-sm text-white/60 hover:text-white mb-3 transition">
                    <ChevronLeft className="w-4 h-4" /> Back to Hub
                  </button>
                  {/* Filters */}
                  <div className="flex gap-1.5 mb-4 overflow-x-auto pb-2">
                    {[{ value: 'all', label: 'All' }, ...ideaCategories].map(c => (
                      <button key={c.value} onClick={() => setHubIdeaFilter(c.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${hubIdeaFilter === c.value ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                        {c.emoji || '🔍'} {c.label}
                      </button>
                    ))}
                  </div>
                  {/* Ideas grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {sharedIdeas
                      .filter(i => (hubIdeaFilter === 'all' || i.category === hubIdeaFilter))
                      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
                      .map(idea => (
                        <div key={idea.id} data-search-id={`ideas-${idea.id}`}>
                          <IdeaCard idea={idea} onDelete={deleteIdea} onHighlight={highlightIdea} onPromoteToTask={promoteIdeaToTask} />
                        </div>
                      ))
                    }
                  </div>
                  {sharedIdeas.filter(i => hubIdeaFilter === 'all' || i.category === hubIdeaFilter).length === 0 && (
                    <div className="text-center py-12">
                      <span className="text-4xl mb-3 block">💡</span>
                      <p className="text-white/40 text-sm">No ideas saved yet</p>
                      <p className="text-white/30 text-xs mt-1">Paste links from restaurants, travel sites, recipes...</p>
                    </div>
                  )}
                  <button onClick={() => setShowAddIdeaModal('create')}
                    className="w-full mt-4 py-3 rounded-2xl border-2 border-dashed border-white/10 text-white/40 hover:border-amber-500/30 hover:text-amber-400 transition text-sm">
                    + Add Idea
                  </button>
                </div>
              )}
            </div>
  );
};

export default HubSection;

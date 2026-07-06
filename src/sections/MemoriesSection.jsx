import React from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Folder, Loader, MapPin, Pencil, Plus } from 'lucide-react';
import MemoriesFeed from '../components/MemoriesFeed';
import { formatDate, parseLocalDate, toLocalDateStr } from '../utils';

/**
 * MemoriesSection — extracted verbatim from trip-planner.jsx (Phase 2 refactor,
 * 2026-07-06, docs/REFACTORING_GUIDE.md). All state stays in the parent; this
 * is a pure render slice, so behavior is unchanged.
 */
const MemoriesSection = (props) => {
  const {
    collapsedMemorySections,
    commentOnMemory,
    currentUser,
    dragOverEventId,
    dragOverMemoryId,
    fitnessEvents,
    fitnessTrainingPlans,
    getMemoryImages,
    getRandomMemoryImage,
    handleCardDrop,
    handleEventCardDrop,
    memories,
    memoriesView,
    openLightbox,
    partyEvents,
    reactToMemory,
    setActiveSection,
    setCollapsedMemorySections,
    setDragOverEventId,
    setDragOverMemoryId,
    setEditingMemory,
    setEditingTrainingWeek,
    setFitnessViewMode,
    setMemoriesView,
    setSelectedFitnessEvent,
    setSelectedPartyEvent,
    setSelectedTrip,
    setShowAddMemoryModal,
    setTimelineSortOrder,
    setTimelineYearFilter,
    timelineSortOrder,
    timelineYearFilter,
    trips,
    uploadingToEventId,
    uploadingToMemoryId,
  } = props;

  return (
            <div>
              {/* Controls Row - Responsive mobile buttons (left padding for FAB on mobile) */}
              <div className="flex gap-1.5 md:gap-2 mb-4 items-center justify-start sticky top-0 z-20 bg-slate-800/95 backdrop-blur-md py-3 -mx-6 px-6">
                {/* View Switcher */}
                {[
                  { id: 'feed', emoji: '💞' },
                  { id: 'timeline', emoji: '📅' },
                  { id: 'events', emoji: '🎭' },
                  { id: 'media', emoji: '📸' },
                ].map(view => (
                  <button
                    key={view.id}
                    onClick={() => setMemoriesView(view.id)}
                    className={`px-3 md:px-4 py-2 rounded-xl font-medium transition text-base md:text-lg text-center ${
                      memoriesView === view.id
                        ? 'bg-rose-500 text-white shadow-lg'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {view.emoji}
                  </button>
                ))}

                {/* Spacer to push controls right */}
                <div className="flex-1" />

                {/* Timeline Controls - Right justified (only show for timeline view) */}
                {memoriesView === 'timeline' && (
                  <>
                    {/* Sort Order Toggle - Just arrow icon */}
                    <button
                      onClick={() => setTimelineSortOrder(timelineSortOrder === 'newest' ? 'oldest' : 'newest')}
                      className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/10 text-slate-300 hover:bg-white/20 transition"
                      title={timelineSortOrder === 'newest' ? 'Newest first - click for oldest' : 'Oldest first - click for newest'}
                    >
                      {timelineSortOrder === 'newest' ? (
                        <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
                      ) : (
                        <ChevronUp className="w-4 h-4 md:w-5 md:h-5" />
                      )}
                    </button>

                    {/* Year Filter Dropdown */}
                    <div className="relative group">
                      <button
                        className={`px-3 md:px-4 py-2 rounded-xl font-medium transition flex items-center gap-1 text-sm md:text-base ${
                          timelineYearFilter === 'all'
                            ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {timelineYearFilter === 'all' ? 'All' : timelineYearFilter}
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 bg-slate-800 rounded-xl shadow-xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[100px]">
                        <button
                          onClick={() => setTimelineYearFilter('all')}
                          className={`w-full px-4 py-2 text-left rounded-t-xl transition ${
                            timelineYearFilter === 'all' ? 'bg-rose-500/20 text-rose-300' : 'text-white/70 hover:bg-white/10'
                          }`}
                        >
                          All
                        </button>
                        {(() => {
                          const years = new Set();
                          memories.forEach(m => years.add(new Date(m.date).getFullYear()));
                          trips.forEach(t => t.dates?.start && years.add(new Date(t.dates.start).getFullYear()));
                          const yearArray = Array.from(years).sort((a, b) => b - a);
                          return yearArray.map((year, idx) => (
                            <button
                              key={year}
                              onClick={() => setTimelineYearFilter(year.toString())}
                              className={`w-full px-4 py-2 text-left transition ${
                                idx === yearArray.length - 1 ? 'rounded-b-xl' : ''
                              } ${
                                timelineYearFilter === year.toString() ? 'bg-rose-500/20 text-rose-300' : 'text-white/70 hover:bg-white/10'
                              }`}
                            >
                              {year}
                            </button>
                          ));
                        })()}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* ===== FEED VIEW (Phase 3 — our own social feed) ===== */}
              {memoriesView === 'feed' && (
                <MemoriesFeed
                  memories={memories}
                  currentUser={currentUser}
                  todayStr={toLocalDateStr()}
                  onReact={reactToMemory}
                  onAddComment={commentOnMemory}
                  onOpen={(m) => setEditingMemory({ ...m })}
                />
              )}

              {/* Timeline View */}
              {memoriesView === 'timeline' && (
                <div className="relative">
                  {/* Top Banner Card */}
                  <div className="mb-8 relative z-10">
                    <div className="w-full bg-gradient-to-r from-rose-500/20 via-pink-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20 flex items-center justify-between">
                      <span className="text-5xl">🌈</span>
                      <div className="text-center flex-1 px-4">
                        <h3 className="text-xl font-bold text-white">Building Our Story</h3>
                        <p className="text-white/60 text-sm">And the adventure continues...</p>
                      </div>
                      <div className="flex gap-1">
                        {['💕', '✨', '🦄', '🏳️‍🌈', '💜'].map((emoji, i) => (
                          <span key={i} className="text-base">{emoji}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Timeline line */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-rose-500 via-pink-500 to-purple-500 h-full rounded-full" style={{ top: '80px' }} />

                  {/* Timeline events - dynamically built - overlapping cards */}
                  <div className="flex flex-col">
                    {(() => {
                      const today = new Date();
                      const timelineEvents = [];

                      // Add all memories from state to timeline
                      const categoryIcons = {
                        milestone: '✨',
                        datenight: '🥂',
                        travel: '✈️',
                        fitness: '🏆',
                        concert: '🎵',
                        pride: '🏳️‍🌈',
                        karaoke: '🎤'
                      };
                      memories.forEach(memory => {
                        const memDate = parseLocalDate(memory.date);
                        timelineEvents.push({
                          id: memory.id,
                          isMemory: true,
                          date: memDate,
                          year: memDate.getFullYear().toString(),
                          month: memDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
                          title: memory.title,
                          description: memory.description,
                          icon: memory.icon || categoryIcons[memory.category] || '✨',
                          location: memory.location,
                          image: memory.image,
                          link: memory.link,
                          comment: memory.comment,
                          category: memory.category,
                          memory: memory
                        });
                      });

                      // Add past trips to timeline
                      trips.filter(trip => {
                        if (!trip.dates?.end) return false;
                        const endDate = parseLocalDate(trip.dates.end);
                        return endDate < today;
                      }).forEach(trip => {
                        const tripDate = parseLocalDate(trip.dates.start);
                        timelineEvents.push({
                          id: `trip-${trip.id}`,
                          isTrip: true,
                          date: tripDate,
                          year: tripDate.getFullYear().toString(),
                          month: tripDate.toLocaleDateString('en-US', { month: 'long' }),
                          title: `${trip.emoji} ${trip.destination}`,
                          description: `Our adventure to ${trip.destination}`,
                          icon: trip.emoji,
                          image: trip.coverImage
                        });
                      });

                      // Add completed fitness events to timeline
                      const fitnessEvents = [
                        { id: 'indy-half-2026', name: 'Indy Half Marathon', date: '2026-05-02', emoji: '🏃' },
                        { id: 'gso-half-2026', name: 'Greensboro Half Marathon', date: '2026-11-21', emoji: '🏃' },
                      ];
                      fitnessEvents.forEach(event => {
                        const eventDate = parseLocalDate(event.date);
                        if (eventDate < today) {
                          timelineEvents.push({
                            id: `fitness-${event.id}`,
                            isFitness: true,
                            date: eventDate,
                            year: eventDate.getFullYear().toString(),
                            month: eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
                            title: `${event.emoji} ${event.name}`,
                            description: 'We did it together!',
                            icon: '🏆'
                          });
                        }
                      });

                      // Filter by year if selected
                      let filteredEvents = timelineEvents;
                      if (timelineYearFilter !== 'all') {
                        const filterYear = parseInt(timelineYearFilter);
                        filteredEvents = timelineEvents.filter(e =>
                          e.date.getFullYear() === filterYear
                        );
                      }

                      // Sort by date based on sort order and alternate sides
                      return filteredEvents
                        .sort((a, b) => {
                          return timelineSortOrder === 'newest'
                            ? b.date - a.date
                            : a.date - b.date;
                        })
                        .map((event, idx) => ({ ...event, side: idx % 2 === 0 ? 'left' : 'right' }));
                    })().map((event, idx) => (
                      <div key={event.id} className={`flex items-center gap-8 ${event.side === 'right' ? 'flex-row-reverse' : ''} ${idx > 0 ? '-mt-24' : ''}`}>
                        <div className={`w-5/12 ${event.side === 'right' ? 'text-left' : 'text-right'}`}>
                          <div
                            data-search-id={event.isMemory ? `memories-${event.memory?.id}` : undefined}
                            onClick={() => event.isMemory && setEditingMemory(event.memory)}
                            onDragOver={(e) => { if (event.isMemory) { e.preventDefault(); setDragOverMemoryId(event.memory?.id); }}}
                            onDragLeave={() => setDragOverMemoryId(null)}
                            onDrop={(e) => event.isMemory && handleCardDrop(e, event.memory?.id)}
                            className={`backdrop-blur-sm rounded-2xl p-6 transition group relative ${event.isMemory ? 'cursor-pointer' : ''} ${
                              event.memory?.isSpecial || event.memory?.isFirstTime
                                ? 'special-memory-card'
                                : 'bg-white/10 border-2 border-white/20 hover:border-rose-400/50'
                            } ${dragOverMemoryId === event.memory?.id ? 'ring-4 ring-orange-500 ring-opacity-50' : ''}`}
                          >
                            {/* Upload indicator */}
                            {uploadingToMemoryId === event.memory?.id && (
                              <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center z-10">
                                <Loader className="w-8 h-8 text-orange-500 animate-spin" />
                              </div>
                            )}
                            {/* Drop indicator */}
                            {dragOverMemoryId === event.memory?.id && (
                              <div className="absolute inset-0 bg-orange-500/20 rounded-2xl flex items-center justify-center z-10 pointer-events-none">
                                <div className="text-orange-400 font-semibold">Drop photo here</div>
                              </div>
                            )}
                            {/* Memory highlight indicators */}
                            {event.memory?.isFirstTime && (
                              <div className="absolute -top-2 -right-2 text-2xl">🎉</div>
                            )}
                            {event.memory?.isSpecial && !event.memory?.isFirstTime && (
                              <div className="absolute -top-2 -right-2 text-2xl">🌈</div>
                            )}
                            {/* Edit button for memories */}
                            {event.isMemory && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setEditingMemory(event.memory); }}
                                className={`absolute ${event.side === 'right' ? 'right-3' : 'left-3'} top-3 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition`}
                              >
                                <Pencil className="w-4 h-4 text-white/70" />
                              </button>
                            )}
                            {/* Video or Image if exists */}
                            {(() => {
                              const videos = event.memory?.videos || [];
                              const isLinkImage = event.link && /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(event.link);
                              const imageUrl = (event.memory ? getRandomMemoryImage(event.memory) : event.image) || (isLinkImage ? event.link : null);
                              const imgSettings = event.memory?.imageSettings?.[0] || { x: 50, y: 50, zoom: 100 };

                              // Show video if exists
                              if (videos.length > 0) {
                                return (
                                  <div className="mb-3 -mx-2 -mt-2 overflow-hidden rounded-lg relative group">
                                    <video
                                      src={videos[0]}
                                      className="w-full h-32 object-cover"
                                      muted
                                      playsInline
                                      loop
                                      onMouseEnter={(e) => e.target.play()}
                                      onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                      <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center group-hover:opacity-0 transition">
                                        <span className="text-white text-lg ml-1">▶</span>
                                      </div>
                                    </div>
                                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 rounded text-white text-xs">
                                      🎬 Video
                                    </div>
                                  </div>
                                );
                              }

                              // Fallback to image
                              const allImgs = event.memory ? getMemoryImages(event.memory) : (imageUrl ? [imageUrl] : []);
                              return imageUrl ? (
                                <div className="mb-3 -mx-2 -mt-2 overflow-hidden rounded-lg cursor-pointer" onClick={(e) => { e.stopPropagation(); openLightbox(allImgs, 0); }}>
                                  <img
                                    src={imageUrl}
                                    alt=""
                                    className="w-full h-32 object-cover"
                                    style={{
                                      objectPosition: `${imgSettings.x}% ${imgSettings.y}%`,
                                      transform: `scale(${imgSettings.zoom / 100})`,
                                      transformOrigin: `${imgSettings.x}% ${imgSettings.y}%`
                                    }}
                                  />
                                </div>
                              ) : null;
                            })()}
                            <div className="text-4xl mb-3">{event.icon}</div>
                            <div className="text-rose-400 text-sm font-medium mb-1">{event.month} {event.year}</div>
                            <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                            <p className="text-slate-300">{event.description}</p>
                            {event.location && (
                              <p className="text-slate-400 text-sm mt-2 flex items-center gap-1 justify-center">
                                <MapPin className="w-3 h-3" /> {event.location}
                              </p>
                            )}
                            {event.comment && (
                              <p className="text-slate-400 text-sm mt-2 italic">"{event.comment}"</p>
                            )}
                            {event.link && !/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(event.link) && (
                              <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-rose-400 text-sm mt-2 flex items-center gap-1 hover:underline justify-center">
                                <ExternalLink className="w-3 h-3" /> View more
                              </a>
                            )}
                            {/* Source link for auto-created memories */}
                            {event.memory?.sourceType === 'trip' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const srcTrip = trips.find(t => t.id === event.memory.sourceId);
                                  if (srcTrip) { setSelectedTrip(srcTrip); setActiveSection('events'); }
                                }}
                                className="mt-2 text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 justify-center transition"
                              >
                                ✈️ View Trip →
                              </button>
                            )}
                            {event.memory?.sourceType === 'event' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const srcEvent = partyEvents.find(ev => ev.id === event.memory.sourceId);
                                  if (srcEvent) { setSelectedPartyEvent(srcEvent); setActiveSection('events'); }
                                }}
                                className="mt-2 text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 justify-center transition"
                              >
                                🎉 View Event →
                              </button>
                            )}
                            {event.memory?.autoCreated && (
                              <div className="mt-1 text-[10px] text-white/30 text-center">Auto-created from {event.memory.sourceType}</div>
                            )}
                          </div>
                        </div>
                        <div className="w-2/12 flex justify-center">
                          <div className="w-6 h-6 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full border-4 border-slate-900 z-10 shadow-lg" />
                        </div>
                        <div className="w-5/12" />
                      </div>
                    ))}
                  </div>

                  {/* Add Memory Button */}
                  <div className="mt-12 text-center">
                    <button
                      onClick={() => setShowAddMemoryModal('milestone')}
                      className="flex items-center gap-2 mx-auto px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-full hover:opacity-90 transition shadow-lg"
                    >
                      <Plus className="w-5 h-5" />
                      Add Memory
                    </button>
                  </div>
                </div>
              )}

              {/* Events View */}
              {memoriesView === 'events' && (
                <div className="space-y-8">
                  {/* Event Categories - Dynamic from app data */}
                  {(() => {
                    const today = new Date();

                    // Get past trips (where end date has passed)
                    const pastTrips = trips.filter(trip => {
                      if (!trip.dates?.end) return false;
                      const endDate = parseLocalDate(trip.dates.end);
                      return endDate < today;
                    }).map(trip => ({
                      id: `trip-${trip.id}`,
                      title: `${trip.emoji} ${trip.destination}`,
                      date: new Date(trip.dates.start).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                      location: trip.destination,
                      image: trip.coverImage,
                      isTrip: true
                    }));

                    // Get completed fitness events (races that have passed)
                    const completedFitnessEvents = [];
                    const fitnessEventsData = [
                      { id: 'indy-half-2026', name: 'Indy Half Marathon', date: '2026-05-02', location: 'Indianapolis, IN', emoji: '🏃' },
                      { id: 'gso-half-2026', name: 'Greensboro Half Marathon', date: '2026-11-21', location: 'Greensboro, NC', emoji: '🏃' },
                    ];
                    fitnessEventsData.forEach(event => {
                      const eventDate = parseLocalDate(event.date);
                      if (eventDate < today) {
                        completedFitnessEvents.push({
                          id: `fitness-${event.id}`,
                          title: `${event.emoji} ${event.name}`,
                          date: eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                          location: event.location,
                          isFitness: true
                        });
                      }
                    });

                    // Gather training week photos into Fitness Achievements
                    Object.entries(fitnessTrainingPlans).forEach(([eventId, weeks]) => {
                      const eventInfo = fitnessEvents.find(e => e.id === eventId);
                      (weeks || []).forEach((week, idx) => {
                        if (week.photos && week.photos.length > 0) {
                          completedFitnessEvents.push({
                            id: `fitness-week-${eventId}-${week.id || idx}`,
                            title: `📸 ${eventInfo?.name || 'Training'} - Week ${week.weekNumber || idx + 1}`,
                            date: week.startDate ? formatDate(week.startDate) : '',
                            image: week.photos[0]?.url,
                            images: week.photos.map(p => p.url),
                            isFitness: true,
                            isFitnessWeekPhoto: true,
                          });
                        }
                      });
                    });

                    // Get memories by category
                    const getMemoriesByCategory = (cat) => memories.filter(m => m.category === cat).map(m => ({
                      ...m,
                      images: getMemoryImages(m),
                      isMemory: true,
                      date: m.date ? parseLocalDate(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date'
                    }));

                    // Get past party events
                    const pastPartyEvents = partyEvents.filter(event => {
                      if (!event.date) return false;
                      const eventDate = parseLocalDate(event.date);
                      return eventDate < today;
                    }).map(event => ({
                      id: `party-${event.id}`,
                      title: event.name,
                      emoji: event.emoji,
                      date: event.date ? parseLocalDate(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date',
                      location: event.location,
                      image: (event.images || [])[0],
                      images: event.images || [],
                      isPartyEvent: true,
                      partyEvent: event
                    }));

                    const categories = [
                      {
                        id: 'datenight',
                        category: 'Dates',
                        emoji: '🥂',
                        color: 'from-rose-500/20 to-pink-500/20',
                        borderColor: 'border-rose-500/30',
                        events: getMemoriesByCategory('datenight')
                      },
                      {
                        id: 'travel',
                        category: 'Travel Adventures',
                        emoji: '✈️',
                        color: 'from-teal-500/20 to-cyan-500/20',
                        borderColor: 'border-teal-500/30',
                        events: [...pastTrips, ...getMemoriesByCategory('travel')]
                      },
                      {
                        id: 'fitness',
                        category: 'Fitness Achievements',
                        emoji: '🏆',
                        color: 'from-orange-500/20 to-red-500/20',
                        borderColor: 'border-orange-500/30',
                        events: [...completedFitnessEvents, ...getMemoriesByCategory('fitness')]
                      },
                      {
                        id: 'concert',
                        category: 'Concerts & Shows',
                        emoji: '🎵',
                        color: 'from-purple-500/20 to-indigo-500/20',
                        borderColor: 'border-purple-500/30',
                        events: getMemoriesByCategory('concert')
                      },
                      {
                        id: 'pride',
                        category: 'Pride & Community',
                        emoji: '🏳️‍🌈',
                        color: 'from-amber-500/20 to-orange-500/20',
                        borderColor: 'border-amber-500/30',
                        events: getMemoriesByCategory('pride')
                      },
                      {
                        id: 'karaoke',
                        category: 'Songs & Karaoke',
                        emoji: '🎤',
                        color: 'from-fuchsia-500/20 to-pink-500/20',
                        borderColor: 'border-fuchsia-500/30',
                        events: getMemoriesByCategory('karaoke')
                      },
                      {
                        id: 'parties',
                        category: 'Parties & Gatherings',
                        emoji: '🎉',
                        color: 'from-violet-500/20 to-purple-500/20',
                        borderColor: 'border-violet-500/30',
                        events: pastPartyEvents
                      },
                      {
                        id: 'milestone',
                        category: 'Milestones',
                        emoji: '✨',
                        color: 'from-yellow-500/20 to-amber-500/20',
                        borderColor: 'border-yellow-500/30',
                        events: getMemoriesByCategory('milestone')
                      },
                      {
                        id: 'other',
                        category: 'Other Memories',
                        emoji: '📝',
                        color: 'from-slate-500/20 to-gray-500/20',
                        borderColor: 'border-slate-500/30',
                        events: memories.filter(m => !['datenight','travel','fitness','concert','pride','karaoke','milestone'].includes(m.category)).map(m => ({
                          ...m, images: getMemoryImages(m), isMemory: true,
                          date: m.date ? parseLocalDate(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date'
                        }))
                      },
                    ];

                    return categories.filter(cat => cat.events.length > 0);
                  })().map((cat) => (
                    <div key={cat.id} className={`bg-gradient-to-r ${cat.color} rounded-3xl p-6 border ${cat.borderColor}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">{cat.emoji}</span>
                        <h3 className="text-xl font-bold text-white">{cat.category}</h3>
                        <span className="text-white/50 text-sm">({cat.events.length} memories)</span>
                        {/* Spacer */}
                        <div className="flex-1" />
                        {/* Collapse/Expand Button */}
                        <button
                          onClick={() => setCollapsedMemorySections(prev => ({
                            ...prev,
                            [cat.id]: !prev[cat.id]
                          }))}
                          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-white/70 hover:text-white"
                          title={collapsedMemorySections[cat.id] ? 'Expand section' : 'Collapse section'}
                        >
                          {collapsedMemorySections[cat.id] ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronUp className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {!collapsedMemorySections[cat.id] && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {cat.events.map((event) => (
                          <div
                            key={event.id}
                            data-search-id={event.isMemory ? `memories-${event.id}` : undefined}
                            onClick={() => {
                              if (event.isMemory) setEditingMemory(event);
                              else if (event.isPartyEvent) {
                                setActiveSection('events');
                                setSelectedPartyEvent(event.partyEvent);
                              } else if (event.isFitnessWeekPhoto) {
                                // Navigate to fitness and open the training week edit modal
                                const parts = event.id.replace('fitness-week-', '').split('-');
                                // eventId could contain hyphens, weekId starts with "week-"
                                const weekIdMatch = event.id.match(/week-(\d+)/);
                                if (weekIdMatch) {
                                  const weekId = `week-${weekIdMatch[1]}`;
                                  const eventId = event.id.replace('fitness-week-', '').replace(/-week-\d+$/, '');
                                  const plan = fitnessTrainingPlans[eventId];
                                  const week = plan?.find(w => w.id === weekId);
                                  if (week) {
                                    setActiveSection('fitness');
                                    setFitnessViewMode('training');
                                    const fitEvent = fitnessEvents.find(e => e.id === eventId);
                                    if (fitEvent) setSelectedFitnessEvent(fitEvent);
                                    setEditingTrainingWeek({ eventId, week: { ...week } });
                                  }
                                }
                              }
                            }}
                            onDragOver={(e) => {
                              if (event.isMemory || event.isPartyEvent) {
                                e.preventDefault();
                                if (event.isMemory) setDragOverMemoryId(event.id);
                                else if (event.isPartyEvent) setDragOverEventId(event.partyEvent.id);
                              }
                            }}
                            onDragLeave={() => {
                              setDragOverMemoryId(null);
                              setDragOverEventId(null);
                            }}
                            onDrop={(e) => {
                              if (event.isMemory) handleCardDrop(e, event.id);
                              else if (event.isPartyEvent) handleEventCardDrop(e, event.partyEvent.id);
                            }}
                            className={`rounded-xl p-4 hover:bg-white/20 transition ${(event.isMemory || event.isPartyEvent || event.isFitnessWeekPhoto) ? 'cursor-pointer' : ''} relative group ${
                              event.isSpecial || event.isFirstTime ? 'special-memory-card' : 'bg-white/10'
                            } ${dragOverMemoryId === event.id ? 'ring-4 ring-orange-500 ring-opacity-50' : ''} ${
                              event.isPartyEvent && dragOverEventId === event.partyEvent?.id ? 'ring-4 ring-purple-500 ring-opacity-50' : ''
                            }`}
                          >
                            {/* Upload indicator */}
                            {uploadingToMemoryId === event.id && (
                              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center z-10">
                                <Loader className="w-6 h-6 text-orange-500 animate-spin" />
                              </div>
                            )}
                            {event.isPartyEvent && uploadingToEventId === event.partyEvent?.id && (
                              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center z-10">
                                <Loader className="w-6 h-6 text-purple-500 animate-spin" />
                              </div>
                            )}
                            {/* Drop indicator */}
                            {dragOverMemoryId === event.id && (
                              <div className="absolute inset-0 bg-orange-500/20 rounded-xl flex items-center justify-center z-10 pointer-events-none">
                                <div className="text-orange-400 text-sm font-semibold">Drop photo</div>
                              </div>
                            )}
                            {event.isPartyEvent && dragOverEventId === event.partyEvent?.id && (
                              <div className="absolute inset-0 bg-purple-500/20 rounded-xl flex items-center justify-center z-10 pointer-events-none">
                                <div className="text-purple-400 text-sm font-semibold">Drop photo</div>
                              </div>
                            )}
                            {/* Memory highlight indicators */}
                            {event.isFirstTime && (
                              <div className="absolute -top-1 -right-1 text-lg">🎉</div>
                            )}
                            {event.isSpecial && !event.isFirstTime && (
                              <div className="absolute -top-1 -right-1 text-lg">🌈</div>
                            )}
                            {/* Party event indicator */}
                            {event.isPartyEvent && event.emoji && (
                              <div className="absolute -top-1 -right-1 text-lg">{event.emoji}</div>
                            )}
                            {/* Edit button for memories */}
                            {event.isMemory && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setEditingMemory(event); }}
                                className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition"
                              >
                                <Pencil className="w-3 h-3 text-white/70" />
                              </button>
                            )}
                            {/* Image thumbnail (random from images array, or from link field if it's an image URL) */}
                            {(() => {
                              const isLinkImage = event.link && /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(event.link);
                              const imageUrl = (event.isMemory ? getRandomMemoryImage(event) : event.image) || (isLinkImage ? event.link : null);
                              const imgSettings = event.isMemory && event.imageSettings?.[0] || { x: 50, y: 50, zoom: 100 };
                              const allImgs = event.images || (event.isMemory ? getMemoryImages(event) : (imageUrl ? [imageUrl] : []));
                              return (
                                <div className="mb-2 -mx-2 -mt-2 overflow-hidden rounded-t-lg h-20" onClick={(e) => { if (allImgs.length > 0) { e.stopPropagation(); openLightbox(allImgs, 0); } }}>
                                  {imageUrl ? (
                                    <img
                                      src={imageUrl}
                                      alt=""
                                      className="w-full h-full object-cover cursor-pointer"
                                      style={{
                                        objectPosition: `${imgSettings.x}% ${imgSettings.y}%`,
                                        transform: `scale(${imgSettings.zoom / 100})`,
                                        transformOrigin: `${imgSettings.x}% ${imgSettings.y}%`
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                      <span className="text-2xl opacity-30">📷</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                            <h4 className="font-semibold text-white mb-1">{event.title}</h4>
                            <p className="text-slate-400 text-sm">{event.date}</p>
                            {event.location && (
                              <p className="text-slate-500 text-xs flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </p>
                            )}
                            {event.comment && (
                              <p className="text-slate-400 text-xs mt-2 italic truncate">"{event.comment}"</p>
                            )}
                            {/* Photo count for party events */}
                            {event.isPartyEvent && (event.images || []).length > 0 && (
                              <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                                <Image className="w-3 h-3" />
                                {(event.images || []).length} photos
                              </p>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => setShowAddMemoryModal(cat.id)}
                          className="bg-white/5 rounded-xl p-4 border-2 border-dashed border-white/20 hover:border-white/40 transition flex items-center justify-center gap-2 text-white/50 hover:text-white/70"
                        >
                          <Plus className="w-5 h-5" />
                          Add Memory
                        </button>
                      </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Media View */}
              {memoriesView === 'media' && (() => {
                // Collect all photos from memories
                const memoryPhotos = memories.flatMap(memory => {
                  const images = getMemoryImages(memory);
                  return images.map(img => ({
                    src: img,
                    memory: memory,
                    event: null,
                    title: memory.title,
                    date: memory.date,
                    category: memory.category,
                    type: 'memory'
                  }));
                });

                // Collect all photos from events
                const eventPhotos = partyEvents.flatMap(event => {
                  const images = event.images || [];
                  return images.map(img => ({
                    src: img,
                    memory: null,
                    event: event,
                    title: event.name,
                    date: event.date,
                    category: 'events',
                    type: 'event'
                  }));
                });

                // Combine and sort by date
                const allPhotos = [...memoryPhotos, ...eventPhotos].sort((a, b) => new Date(b.date) - new Date(a.date));

                // Get category counts for albums (including events)
                const categoryAlbums = [
                  { id: 'datenight', name: 'Dates', emoji: '🥂' },
                  { id: 'travel', name: 'Travel', emoji: '✈️' },
                  { id: 'fitness', name: 'Fitness', emoji: '🏆' },
                  { id: 'concert', name: 'Concerts & Shows', emoji: '🎵' },
                  { id: 'pride', name: 'Pride', emoji: '🏳️‍🌈' },
                  { id: 'karaoke', name: 'Songs & Karaoke', emoji: '🎤' },
                  { id: 'milestone', name: 'Milestones', emoji: '⭐' },
                  { id: 'events', name: 'Events & Parties', emoji: '🎉' },
                ].map(cat => ({
                  ...cat,
                  count: allPhotos.filter(p => p.category === cat.id).length
                })).filter(cat => cat.count > 0);

                const memoriesWithPhotos = memories.filter(m => getMemoryImages(m).length > 0).length;
                const eventsWithPhotos = partyEvents.filter(e => (e.images || []).length > 0).length;

                return (
                <div className="space-y-8">
                  {/* Photo count */}
                  <div className="text-center">
                    <p className="text-white/60">
                      {allPhotos.length} photos from {memoriesWithPhotos} memories
                      {eventsWithPhotos > 0 && ` and ${eventsWithPhotos} events`}
                    </p>
                  </div>

                  {/* Photo Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {allPhotos.map((photo, idx) => (
                      <div
                        key={idx}
                        onClick={() => openLightbox(allPhotos.map(p => p.src), idx)}
                        className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
                      >
                        <img
                          src={photo.src}
                          alt={photo.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition">
                          <div className="flex items-center gap-1 mb-1">
                            {photo.type === 'event' && <span className="text-xs bg-purple-500/80 px-1.5 py-0.5 rounded">Event</span>}
                            <p className="text-white font-medium text-sm truncate">{photo.title}</p>
                          </div>
                          <p className="text-white/60 text-xs">{photo.date}</p>
                        </div>
                      </div>
                    ))}
                    {allPhotos.length === 0 && (
                      <div className="col-span-full text-center py-12">
                        <div className="text-6xl mb-4">📷</div>
                        <p className="text-white/60">No photos yet</p>
                        <p className="text-white/40 text-sm mt-1">Add photos to your memories or events to see them here</p>
                      </div>
                    )}
                  </div>

                  {/* Albums by Category */}
                  {categoryAlbums.length > 0 && (
                    <div className="mt-12">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Folder className="w-5 h-5" />
                        Albums by Category
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {categoryAlbums.map((album, idx) => (
                          <div key={idx} className="bg-white/10 rounded-2xl p-4 hover:bg-white/20 transition cursor-pointer group">
                            <div className="text-4xl mb-2">{album.emoji}</div>
                            <h4 className="font-semibold text-white">{album.name}</h4>
                            <p className="text-slate-400 text-sm">{album.count} photo{album.count !== 1 ? 's' : ''}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                );
              })()}
            </div>
  );
};

export default MemoriesSection;

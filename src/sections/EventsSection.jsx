import React from 'react';
import { Bell, Check, CheckSquare, ChevronLeft, ChevronRight, Clock, Edit3, Hotel, Link, Loader, MapPin, Plane, Plus, Share2, Trash2, Upload, UserPlus, Users, X } from 'lucide-react';
import TaskCard from '../components/SharedHub/TaskCard';
import TripDetail from '../components/TripDetail';
import { formatDate, parseLocalDate } from '../utils';

/**
 * EventsSection — extracted verbatim from trip-planner.jsx (Phase 2 refactor,
 * 2026-07-06). State stays in the parent; pure render slice.
 */
const EventsSection = (props) => {
  const {
    DEFAULT_LOGISTICS_NOTE,
    Starburst,
    addLink,
    canEditTrip,
    completeTask,
    convertToAdventure,
    currentUser,
    dragOverEventId,
    editingTrip,
    editingTripDates,
    eventsSortAsc,
    eventsTypeFilter,
    guestEmail,
    guestPermission,
    guestPermissions,
    handleEventCardDrop,
    inviteLinkCopied,
    isGuest,
    isOwner,
    newListEmoji,
    newListItemText,
    newListName,
    newTaskAssignee,
    newTaskText,
    openLightbox,
    partyEvents,
    planningTrips,
    removeItem,
    removeLink,
    savePartyEventsToFirestore,
    saveToFirestore,
    selectedPartyEvent,
    selectedTrip,
    setDragOverEventId,
    setEditingEvent,
    setEditingTrip,
    setEditingTripDates,
    setEventsSortAsc,
    setEventsTypeFilter,
    setGuestEmail,
    setGuestPermission,
    setInviteLinkCopied,
    setMessageCopied,
    setMessageFilter,
    setMessageText,
    setNewListEmoji,
    setNewListItemText,
    setNewListName,
    setNewTaskAssignee,
    setNewTaskText,
    setPartyEvents,
    setSelectedPartyEvent,
    setSelectedTrip,
    setShowAddModal,
    setShowAddTaskModal,
    setShowGuestModal,
    setShowInviteModal,
    setShowLinkModal,
    setShowMessageModal,
    setShowNewTripModal,
    setShowRandomExperience,
    setShowTypeFilterDropdown,
    setSwipeState,
    setTravelViewMode,
    setTripDetails,
    setTrips,
    setWishlist,
    sharedTasks,
    showGuestModal,
    showLinkModal,
    showToast,
    showTypeFilterDropdown,
    sortedTrips,
    startBouncingEmoji,
    swipeState,
    travelViewMode,
    tripDetails,
    updateTripDates,
    uploadPhotoToEvent,
    uploadingToEventId,
    user,
    wishlist,
  } = props;

  return (
            <div>
              {/* Detail Views */}
              {selectedTrip ? (
<TripDetail
              trip={selectedTrip}
              editingTrip={editingTrip}
              setEditingTrip={setEditingTrip}
              editingTripDates={editingTripDates}
              setEditingTripDates={setEditingTripDates}
              setSelectedTrip={setSelectedTrip}
              tripDetails={tripDetails}
              setTripDetails={setTripDetails}
              canEditTrip={canEditTrip}
              removeItem={removeItem}
              removeLink={removeLink}
              addLink={addLink}
              setShowAddModal={setShowAddModal}
              setShowLinkModal={setShowLinkModal}
              setShowGuestModal={setShowGuestModal}
              showLinkModal={showLinkModal}
              showGuestModal={showGuestModal}
              isOwner={isOwner}
              isGuest={isGuest}
              guestPermissions={guestPermissions}
              currentUser={currentUser}
              updateTripDates={updateTripDates}
              showToast={showToast}
              saveToFirestore={saveToFirestore}
              setTrips={setTrips}
              guestEmail={guestEmail}
              setGuestEmail={setGuestEmail}
              guestPermission={guestPermission}
              setGuestPermission={setGuestPermission}
              linkedTasks={sharedTasks.filter(t => t && t.linkedTo && t.linkedTo.section === 'trips' && t.linkedTo.itemId === selectedTrip?.id)}
              onCompleteTask={completeTask}
              onEditTask={(t) => setShowAddTaskModal(t)}
            />
              ) : selectedPartyEvent ? (
                <div>
                  {/* Back Button & Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      onClick={() => setSelectedPartyEvent(null)}
                      className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition"
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <span className="text-4xl">{selectedPartyEvent.emoji}</span>
                        {selectedPartyEvent.name}
                      </h2>
                      <p className="text-slate-400">
                        {selectedPartyEvent.endDate && selectedPartyEvent.endDate !== selectedPartyEvent.date ? (
                          <>
                            {formatDate(selectedPartyEvent.date, { weekday: 'short', month: 'long', day: 'numeric' })}
                            {' – '}
                            {formatDate(selectedPartyEvent.endDate, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                          </>
                        ) : (
                          <>
                            {formatDate(selectedPartyEvent.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                            {!selectedPartyEvent.allDay && selectedPartyEvent.time && ` at ${selectedPartyEvent.time}`}
                            {!selectedPartyEvent.allDay && selectedPartyEvent.endTime && ` - ${selectedPartyEvent.endTime}`}
                            {selectedPartyEvent.allDay && ' · All day'}
                          </>
                        )}
                      </p>
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => setEditingEvent({
                          ...selectedPartyEvent,
                          // Derive UI toggles from saved fields so the form opens in the right mode
                          allDay: selectedPartyEvent.allDay ?? !selectedPartyEvent.time,
                          multiDay: !!(selectedPartyEvent.endDate && selectedPartyEvent.endDate !== selectedPartyEvent.date),
                        })}
                        className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition"
                        title="Edit event"
                      >
                        <Edit3 className="w-5 h-5 text-white" />
                      </button>
                    )}
                  </div>

                  {/* Cover Image */}
                  {selectedPartyEvent.coverImage && (
                    <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden mb-6">
                      <img
                        src={selectedPartyEvent.coverImage}
                        alt={selectedPartyEvent.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  )}

                  {/* Event Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Location Card */}
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
                      <div className="flex items-center gap-2 text-amber-400 mb-2">
                        <MapPin className="w-5 h-5" />
                        <span className="font-semibold">Location</span>
                      </div>
                      <p className="text-white">{selectedPartyEvent.location || 'TBD'}</p>
                      {selectedPartyEvent.entryCode && (
                        <p className="text-slate-400 text-sm mt-1">
                          🔑 {selectedPartyEvent.entryCode}
                        </p>
                      )}
                    </div>

                    {/* Time Card */}
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
                      <div className="flex items-center gap-2 text-purple-400 mb-2">
                        <Clock className="w-5 h-5" />
                        <span className="font-semibold">{selectedPartyEvent.allDay ? 'When' : 'Time'}</span>
                      </div>
                      <p className="text-white">
                        {selectedPartyEvent.allDay
                          ? 'All day'
                          : (selectedPartyEvent.time
                              ? `${selectedPartyEvent.time}${selectedPartyEvent.endTime ? ` – ${selectedPartyEvent.endTime}` : ''}`
                              : 'TBD')}
                      </p>
                      <p className="text-slate-400 text-sm mt-1">
                        {selectedPartyEvent.endDate && selectedPartyEvent.endDate !== selectedPartyEvent.date
                          ? `${formatDate(selectedPartyEvent.date, { month: 'short', day: 'numeric' })} – ${formatDate(selectedPartyEvent.endDate, { month: 'short', day: 'numeric' })}`
                          : formatDate(selectedPartyEvent.date, { weekday: 'long', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedPartyEvent.description && (
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/20 mb-6">
                      <h3 className="text-white font-semibold mb-2">📝 Details</h3>
                      <p className="text-slate-300">{selectedPartyEvent.description}</p>
                    </div>
                  )}

                  {/* Event Photos */}
                  <div
                    className={`bg-white/10 rounded-2xl p-4 border border-white/20 mb-6 transition ${
                      dragOverEventId === selectedPartyEvent.id ? 'border-purple-500 bg-purple-500/10' : ''
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setDragOverEventId(selectedPartyEvent.id); }}
                    onDragLeave={() => setDragOverEventId(null)}
                    onDrop={(e) => handleEventCardDrop(e, selectedPartyEvent.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        <Image className="w-5 h-5 text-purple-400" />
                        Photos ({(selectedPartyEvent.images || []).length})
                      </h3>
                      {uploadingToEventId === selectedPartyEvent.id && (
                        <div className="flex items-center gap-2 text-purple-400">
                          <Loader className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Uploading...</span>
                        </div>
                      )}
                    </div>

                    {/* Photo Grid */}
                    {(selectedPartyEvent.images || []).length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                        {(selectedPartyEvent.images || []).map((img, idx) => (
                          <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden cursor-pointer" onClick={() => openLightbox(selectedPartyEvent.images, idx)}>
                            <img src={img} alt={`Event photo ${idx + 1}`} className="w-full h-full object-cover" />
                            {isOwner && (
                              <button
                                onClick={() => {
                                  const newEvents = partyEvents.map(e =>
                                    e.id === selectedPartyEvent.id
                                      ? { ...e, images: e.images.filter((_, i) => i !== idx) }
                                      : e
                                  );
                                  setPartyEvents(newEvents);
                                  setSelectedPartyEvent(newEvents.find(e => e.id === selectedPartyEvent.id));
                                  savePartyEventsToFirestore(newEvents);
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-center py-4 mb-4">No photos yet - drop images here or use the button below</p>
                    )}

                    {/* Upload Button */}
                    {(isOwner || (selectedPartyEvent.guests || []).some(g => g.email === user?.email && g.permission === 'edit')) && (
                      <label className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl cursor-pointer transition border-2 border-dashed ${
                        uploadingToEventId === selectedPartyEvent.id
                          ? 'bg-white/5 text-white/40 border-white/10'
                          : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/20 hover:border-purple-500'
                      }`}>
                        {uploadingToEventId === selectedPartyEvent.id ? (
                          <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                          <Upload className="w-5 h-5" />
                        )}
                        <span>{uploadingToEventId === selectedPartyEvent.id ? 'Uploading...' : 'Add Photos'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          disabled={uploadingToEventId === selectedPartyEvent.id}
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            files.forEach(file => {
                              if (file.type.startsWith('image/')) {
                                uploadPhotoToEvent(file, selectedPartyEvent.id);
                              }
                            });
                          }}
                        />
                      </label>
                    )}

                    {dragOverEventId === selectedPartyEvent.id && (
                      <div className="text-center text-purple-400 mt-2 text-sm">Drop images here to add</div>
                    )}
                  </div>

                  {/* Linked Tasks Section */}
                  {sharedTasks && Array.isArray(sharedTasks) && sharedTasks.filter(t => t && t.linkedTo && t.linkedTo.section === 'partyEvents' && t.linkedTo.itemId === selectedPartyEvent?.id).length > 0 && (
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/20 mb-6">
                      <div className="flex items-center gap-2 text-teal-400 mb-4">
                        <CheckSquare className="w-5 h-5" />
                        <h3 className="font-semibold">Linked Tasks</h3>
                      </div>
                      <div className="space-y-3">
                        {sharedTasks
                          .filter(t => t && t.linkedTo && t.linkedTo.section === 'partyEvents' && t.linkedTo.itemId === selectedPartyEvent?.id)
                          .map(task => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onNavigateToLinked={() => {}}
                              getLinkedLabel={() => null}
                            />
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Guest List with RSVP */}
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/20 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        <Users className="w-5 h-5 text-pink-400" />
                        Guest List ({(selectedPartyEvent.guests || []).length + 2})
                      </h3>
                      {isOwner && (
                        <div className="text-sm text-slate-400">
                          ✅ {(selectedPartyEvent.guests || []).filter(g => g.rsvp === 'going').length + 2} confirmed
                        </div>
                      )}
                    </div>

                    {/* Hosts */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/30 to-orange-500/30 px-3 py-2 rounded-full border border-amber-500/30">
                        <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm">M</div>
                        <span className="text-white text-sm">Mike</span>
                        <span className="text-xs bg-amber-500/50 text-amber-100 px-2 py-0.5 rounded-full">Host</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/30 to-orange-500/30 px-3 py-2 rounded-full border border-amber-500/30">
                        <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm">A</div>
                        <span className="text-white text-sm">Adam</span>
                        <span className="text-xs bg-amber-500/50 text-amber-100 px-2 py-0.5 rounded-full">Host</span>
                      </div>
                    </div>

                    {/* Invited Guests - With Swipe to Delete */}
                    {(selectedPartyEvent.guests || []).length > 0 && (
                      <div className="space-y-2 mb-4">
                        {(selectedPartyEvent.guests || []).map(guest => {
                          const isSwipingThis = swipeState.id === `guest-${guest.id}` && swipeState.swiping;
                          const swipeOffset = isSwipingThis ? Math.min(0, swipeState.currentX - swipeState.startX) : 0;
                          const deleteGuest = () => {
                            const newEvents = partyEvents.map(ev =>
                              ev.id === selectedPartyEvent.id
                                ? { ...ev, guests: ev.guests.filter(g => g.id !== guest.id) }
                                : ev
                            );
                            setPartyEvents(newEvents);
                            setSelectedPartyEvent(newEvents.find(e => e.id === selectedPartyEvent.id));
                            savePartyEventsToFirestore(newEvents);
                          };

                          return (
                            <div key={guest.id} className="relative overflow-hidden rounded-xl">
                              {/* Delete action background */}
                              <div className="absolute inset-y-0 right-0 w-20 bg-red-500 flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-white" />
                              </div>

                              <div
                                className="relative flex items-center justify-between bg-slate-800 px-3 py-2 rounded-xl"
                                style={{
                                  transform: `translateX(${swipeOffset}px)`,
                                  transition: isSwipingThis ? 'none' : 'transform 0.2s ease-out'
                                }}
                                onTouchStart={(e) => {
                                  if (!isOwner) return;
                                  setSwipeState({
                                    id: `guest-${guest.id}`,
                                    startX: e.touches[0].clientX,
                                    currentX: e.touches[0].clientX,
                                    swiping: true
                                  });
                                }}
                                onTouchMove={(e) => {
                                  if (!isOwner || swipeState.id !== `guest-${guest.id}`) return;
                                  setSwipeState(s => ({ ...s, currentX: e.touches[0].clientX }));
                                }}
                                onTouchEnd={() => {
                                  if (!isOwner || swipeState.id !== `guest-${guest.id}`) return;
                                  if (swipeState.startX - swipeState.currentX > 80) {
                                    deleteGuest();
                                  }
                                  setSwipeState({ id: null, startX: 0, currentX: 0, swiping: false });
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {(guest.email || '?').charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="text-white text-sm">{guest.name || guest.email}</div>
                                    <div className="text-slate-500 text-xs">
                                      {guest.email || guest.phone || ''}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {/* RSVP Status */}
                                  <select
                                    value={guest.rsvp || 'pending'}
                                    onChange={(e) => {
                                      const newEvents = partyEvents.map(ev =>
                                        ev.id === selectedPartyEvent.id
                                          ? {
                                              ...ev,
                                              guests: ev.guests.map(g =>
                                                g.id === guest.id ? { ...g, rsvp: e.target.value } : g
                                              )
                                            }
                                          : ev
                                      );
                                      setPartyEvents(newEvents);
                                      setSelectedPartyEvent(newEvents.find(e => e.id === selectedPartyEvent.id));
                                      savePartyEventsToFirestore(newEvents);
                                    }}
                                    className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer ${
                                      guest.rsvp === 'going' ? 'bg-green-500/30 text-green-300' :
                                      guest.rsvp === 'not-going' ? 'bg-red-500/30 text-red-300' :
                                      guest.rsvp === 'maybe' ? 'bg-yellow-500/30 text-yellow-300' :
                                      'bg-slate-500/30 text-slate-300'
                                    }`}
                                  >
                                    <option value="pending">⏳ Pending</option>
                                    <option value="going">✅ Going</option>
                                    <option value="not-going">❌ Not Going</option>
                                    <option value="maybe">🤔 Maybe</option>
                                  </select>
                                  {/* Desktop delete button */}
                                  {isOwner && (
                                    <button
                                      onClick={deleteGuest}
                                      className="hidden md:block p-1 text-slate-400 hover:text-red-400 transition"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add Guest / Invite */}
                    {isOwner && (
                      <div className="space-y-3">
                        <button
                          onClick={() => setShowInviteModal(selectedPartyEvent)}
                          className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2"
                        >
                          <UserPlus className="w-5 h-5" />
                          Invite Guests
                        </button>

                        <button
                          onClick={() => {
                            setShowMessageModal(selectedPartyEvent);
                            setMessageText(selectedPartyEvent.announcement?.text || DEFAULT_LOGISTICS_NOTE);
                            setMessageFilter('going');
                            setMessageCopied(false);
                          }}
                          className="w-full py-3 bg-gradient-to-r from-blue-500/80 to-indigo-500/80 text-white font-semibold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2"
                        >
                          <Bell className="w-5 h-5" />
                          Message Guests
                        </button>

                        {/* Quick share link for the event */}
                        {(selectedPartyEvent.guests || []).length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {(selectedPartyEvent.guests || []).map(guest => (
                              <button
                                key={guest.id}
                                onClick={async () => {
                                  const link = `${window.location.origin}/event/${selectedPartyEvent.id}?t=${guest.token}`;
                                  try {
                                    await navigator.clipboard.writeText(link);
                                    setInviteLinkCopied(guest.id);
                                    setTimeout(() => setInviteLinkCopied(null), 2000);
                                    showToast(`Link copied for ${guest.name || guest.email}!`, 'success');
                                  } catch {
                                    showToast('Could not copy link', 'error');
                                  }
                                }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition ${
                                  inviteLinkCopied === guest.id
                                    ? 'bg-green-500/30 text-green-300'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                                }`}
                                title={`Copy invite link for ${guest.name || guest.email}`}
                              >
                                {inviteLinkCopied === guest.id ? (
                                  <><Check className="w-3 h-3" /> Copied!</>
                                ) : (
                                  <><Share2 className="w-3 h-3" /> {guest.name || guest.email?.split('@')[0]}</>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Task List */}
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-green-400" />
                        To-Do List
                      </h3>
                      <div className="text-sm text-slate-400">
                        {(selectedPartyEvent.tasks || []).filter(t => t.completed).length}/{(selectedPartyEvent.tasks || []).length} done
                      </div>
                    </div>

                    {/* Task Items - With Swipe to Delete */}
                    <div className="space-y-2 mb-4">
                      {(selectedPartyEvent.tasks || []).map(task => {
                        const isSwipingThis = swipeState.id === `task-${task.id}` && swipeState.swiping;
                        const swipeOffset = isSwipingThis ? Math.min(0, swipeState.currentX - swipeState.startX) : 0;
                        const deleteTask = () => {
                          const newEvents = partyEvents.map(ev =>
                            ev.id === selectedPartyEvent.id
                              ? { ...ev, tasks: ev.tasks.filter(t => t.id !== task.id) }
                              : ev
                          );
                          setPartyEvents(newEvents);
                          setSelectedPartyEvent(newEvents.find(e => e.id === selectedPartyEvent.id));
                          savePartyEventsToFirestore(newEvents);
                        };

                        return (
                          <div key={task.id} className="relative overflow-hidden rounded-xl">
                            {/* Delete action background */}
                            <div className="absolute inset-y-0 right-0 w-20 bg-red-500 flex items-center justify-center">
                              <Trash2 className="w-5 h-5 text-white" />
                            </div>

                            {/* Swipeable content */}
                            <div
                              className={`relative flex items-center gap-3 p-3 rounded-xl transition-colors ${task.completed ? 'bg-green-500/10' : 'bg-slate-800'}`}
                              style={{
                                transform: `translateX(${swipeOffset}px)`,
                                transition: isSwipingThis ? 'none' : 'transform 0.2s ease-out'
                              }}
                              onTouchStart={(e) => {
                                if (!isOwner) return;
                                setSwipeState({
                                  id: `task-${task.id}`,
                                  startX: e.touches[0].clientX,
                                  currentX: e.touches[0].clientX,
                                  swiping: true
                                });
                              }}
                              onTouchMove={(e) => {
                                if (!isOwner || swipeState.id !== `task-${task.id}`) return;
                                setSwipeState(s => ({ ...s, currentX: e.touches[0].clientX }));
                              }}
                              onTouchEnd={() => {
                                if (!isOwner || swipeState.id !== `task-${task.id}`) return;
                                // If swiped more than 80px, delete
                                if (swipeState.startX - swipeState.currentX > 80) {
                                  deleteTask();
                                }
                                setSwipeState({ id: null, startX: 0, currentX: 0, swiping: false });
                              }}
                            >
                              <button
                                onClick={() => {
                                  const newEvents = partyEvents.map(ev =>
                                    ev.id === selectedPartyEvent.id
                                      ? {
                                          ...ev,
                                          tasks: ev.tasks.map(t =>
                                            t.id === task.id ? { ...t, completed: !t.completed } : t
                                          )
                                        }
                                      : ev
                                  );
                                  setPartyEvents(newEvents);
                                  setSelectedPartyEvent(newEvents.find(e => e.id === selectedPartyEvent.id));
                                  savePartyEventsToFirestore(newEvents);
                                }}
                                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition ${
                                  task.completed
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : 'border-slate-500 hover:border-green-500'
                                }`}
                              >
                                {task.completed && <Check className="w-4 h-4" />}
                              </button>
                              <div className="flex-1 min-w-0">
                                <span className={`text-white ${task.completed ? 'line-through opacity-60' : ''}`}>
                                  {task.text}
                                </span>
                                {task.assignee && (
                                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                    task.assignee === 'Mike' ? 'bg-purple-500/30 text-purple-300' :
                                    task.assignee === 'Adam' ? 'bg-blue-500/30 text-blue-300' :
                                    'bg-amber-500/30 text-amber-300'
                                  }`}>
                                    {task.assignee}
                                  </span>
                                )}
                              </div>
                              {/* Desktop delete button (hidden on mobile to favor swipe) */}
                              {isOwner && (
                                <button
                                  onClick={deleteTask}
                                  className="hidden md:block p-1 text-slate-400 hover:text-red-400 transition"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                              {/* Mobile swipe hint */}
                              <span className="md:hidden text-slate-600 text-xs">←</span>
                            </div>
                          </div>
                        );
                      })}
                      {(selectedPartyEvent.tasks || []).length === 0 && (
                        <p className="text-slate-500 text-center py-4">No tasks yet</p>
                      )}
                    </div>

                    {/* Add Task */}
                    {(isOwner || (selectedPartyEvent.guests || []).some(g => g.email === user?.email && g.permission === 'edit')) && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add a task..."
                          value={newTaskText}
                          onChange={(e) => setNewTaskText(e.target.value)}
                          className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-green-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newTaskText.trim()) {
                              const newTask = {
                                id: Date.now(),
                                text: newTaskText.trim(),
                                assignee: newTaskAssignee || null,
                                completed: false,
                                createdBy: currentUser,
                                createdAt: new Date().toISOString()
                              };
                              const newEvents = partyEvents.map(ev =>
                                ev.id === selectedPartyEvent.id
                                  ? { ...ev, tasks: [...(ev.tasks || []), newTask] }
                                  : ev
                              );
                              setPartyEvents(newEvents);
                              setSelectedPartyEvent(newEvents.find(e => e.id === selectedPartyEvent.id));
                              savePartyEventsToFirestore(newEvents);
                              setNewTaskText('');
                              setNewTaskAssignee('');
                            }
                          }}
                        />
                        <select
                          value={newTaskAssignee}
                          onChange={(e) => setNewTaskAssignee(e.target.value)}
                          className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none"
                        >
                          <option value="">Unassigned</option>
                          <option value="Mike">Mike</option>
                          <option value="Adam">Adam</option>
                          {(selectedPartyEvent.guests || []).map(g => (
                            <option key={g.id} value={g.email || g.name || g.id}>{g.name || g.email?.split('@')[0] || 'Guest'}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            if (newTaskText.trim()) {
                              const newTask = {
                                id: Date.now(),
                                text: newTaskText.trim(),
                                assignee: newTaskAssignee || null,
                                completed: false,
                                createdBy: currentUser,
                                createdAt: new Date().toISOString()
                              };
                              const newEvents = partyEvents.map(ev =>
                                ev.id === selectedPartyEvent.id
                                  ? { ...ev, tasks: [...(ev.tasks || []), newTask] }
                                  : ev
                              );
                              setPartyEvents(newEvents);
                              setSelectedPartyEvent(newEvents.find(e => e.id === selectedPartyEvent.id));
                              savePartyEventsToFirestore(newEvents);
                              setNewTaskText('');
                              setNewTaskAssignee('');
                            }
                          }}
                          disabled={!newTaskText.trim()}
                          className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Collaborative Lists */}
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/20 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        📋 Lists
                      </h3>
                    </div>

                    {/* Existing Lists */}
                    {(selectedPartyEvent.lists || []).map(list => (
                      <div key={list.id} className="mb-4 last:mb-0">
                        <h4 className="text-white/80 text-sm font-medium mb-2">{list.emoji} {list.name}</h4>
                        <div className="space-y-1.5">
                          {(list.items || []).map(item => (
                            <div key={item.id} className="flex items-center justify-between bg-slate-800 px-3 py-2 rounded-lg">
                              <span className="text-white text-sm">{item.text}</span>
                              {item.claimedByName ? (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/30 text-green-300">
                                  {item.claimedByName}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-500">unclaimed</span>
                              )}
                            </div>
                          ))}
                          {(list.items || []).length === 0 && (
                            <p className="text-slate-500 text-sm text-center py-2">No items yet</p>
                          )}
                        </div>
                        {/* Add item to this list */}
                        {isOwner && (
                          <div className="flex gap-2 mt-2">
                            <input
                              type="text"
                              placeholder="Add item..."
                              value={newListItemText}
                              onChange={(e) => setNewListItemText(e.target.value)}
                              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && newListItemText.trim()) {
                                  const newItem = { id: Date.now(), text: newListItemText.trim(), claimedBy: null, claimedByName: null };
                                  const updatedLists = (selectedPartyEvent.lists || []).map(l =>
                                    l.id === list.id ? { ...l, items: [...(l.items || []), newItem] } : l
                                  );
                                  const newEvents = partyEvents.map(ev =>
                                    ev.id === selectedPartyEvent.id ? { ...ev, lists: updatedLists } : ev
                                  );
                                  setPartyEvents(newEvents);
                                  setSelectedPartyEvent(newEvents.find(e => e.id === selectedPartyEvent.id));
                                  savePartyEventsToFirestore(newEvents);
                                  setNewListItemText('');
                                }
                              }}
                            />
                            <button
                              onClick={() => {
                                if (newListItemText.trim()) {
                                  const newItem = { id: Date.now(), text: newListItemText.trim(), claimedBy: null, claimedByName: null };
                                  const updatedLists = (selectedPartyEvent.lists || []).map(l =>
                                    l.id === list.id ? { ...l, items: [...(l.items || []), newItem] } : l
                                  );
                                  const newEvents = partyEvents.map(ev =>
                                    ev.id === selectedPartyEvent.id ? { ...ev, lists: updatedLists } : ev
                                  );
                                  setPartyEvents(newEvents);
                                  setSelectedPartyEvent(newEvents.find(e => e.id === selectedPartyEvent.id));
                                  savePartyEventsToFirestore(newEvents);
                                  setNewListItemText('');
                                }
                              }}
                              disabled={!newListItemText.trim()}
                              className="px-3 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition disabled:opacity-50"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add New List */}
                    {isOwner && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-lg hover:bg-white/20 transition"
                            onClick={() => {
                              const listEmojis = ['🍕', '🎁', '🎵', '🍷', '🎮', '📦', '🛒', '✨'];
                              const idx = listEmojis.indexOf(newListEmoji);
                              setNewListEmoji(listEmojis[(idx + 1) % listEmojis.length]);
                            }}
                          >
                            {newListEmoji}
                          </button>
                          <input
                            type="text"
                            placeholder="New list name (e.g., What to Bring)"
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && newListName.trim()) {
                                const newList = { id: Date.now(), name: newListName.trim(), emoji: newListEmoji, items: [] };
                                const updatedLists = [...(selectedPartyEvent.lists || []), newList];
                                const newEvents = partyEvents.map(ev =>
                                  ev.id === selectedPartyEvent.id ? { ...ev, lists: updatedLists } : ev
                                );
                                setPartyEvents(newEvents);
                                setSelectedPartyEvent(newEvents.find(e => e.id === selectedPartyEvent.id));
                                savePartyEventsToFirestore(newEvents);
                                setNewListName('');
                                setNewListEmoji('🍕');
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              if (newListName.trim()) {
                                const newList = { id: Date.now(), name: newListName.trim(), emoji: newListEmoji, items: [] };
                                const updatedLists = [...(selectedPartyEvent.lists || []), newList];
                                const newEvents = partyEvents.map(ev =>
                                  ev.id === selectedPartyEvent.id ? { ...ev, lists: updatedLists } : ev
                                );
                                setPartyEvents(newEvents);
                                setSelectedPartyEvent(newEvents.find(e => e.id === selectedPartyEvent.id));
                                savePartyEventsToFirestore(newEvents);
                                setNewListName('');
                                setNewListEmoji('🍕');
                              }
                            }}
                            disabled={!newListName.trim()}
                            className="px-3 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition disabled:opacity-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* ===== Combined Events/Travel View ===== */}
            {/* Combined Events Submenu — Date sort + Type filter */}
            <div className="flex gap-2 mb-4 items-center sticky top-0 z-20 bg-slate-800/95 backdrop-blur-md py-3 -mx-6 px-6">
              {/* Date sort toggle */}
              <button
                onClick={() => setEventsSortAsc(!eventsSortAsc)}
                className="px-4 py-2 rounded-xl font-medium transition text-sm bg-white/10 text-slate-300 hover:bg-white/20 flex items-center gap-1.5"
              >
                🗓️ <span>Date</span> <span className="text-white/50">{eventsSortAsc ? '↑' : '↓'}</span>
              </button>
              {/* Type filter with dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowTypeFilterDropdown(!showTypeFilterDropdown)}
                  className={`px-4 py-2 rounded-xl font-medium transition text-sm flex items-center gap-1.5 ${
                    eventsTypeFilter
                      ? 'bg-amber-500 text-white shadow-lg'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  {eventsTypeFilter
                    ? { travel: '✈️', parties: '🎉', datenight: '🥂', concert: '🎵', fitness: '🏆', pride: '🏳️‍🌈', karaoke: '🎤' }[eventsTypeFilter]
                    : '🏷️'
                  }
                  <span>Type</span>
                  <span className={`text-xs transition-transform ${showTypeFilterDropdown ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {showTypeFilterDropdown && (
                  <>
                    <div className="fixed inset-0 z-[30]" onClick={() => setShowTypeFilterDropdown(false)} />
                    <div className="absolute top-full left-0 mt-1 z-[31] bg-slate-800/95 backdrop-blur-md border border-white/15 rounded-xl py-1 shadow-2xl min-w-[160px]">
                      {[
                        { id: null, emoji: '📋', label: 'All Types' },
                        { id: 'travel', emoji: '✈️', label: 'Trips' },
                        { id: 'parties', emoji: '🎉', label: 'Parties' },
                        { id: 'datenight', emoji: '🥂', label: 'Dates' },
                        { id: 'concert', emoji: '🎵', label: 'Shows' },
                        { id: 'fitness', emoji: '🏆', label: 'Fitness' },
                        { id: 'pride', emoji: '🏳️‍🌈', label: 'Pride' },
                        { id: 'karaoke', emoji: '🎤', label: 'Karaoke' },
                      ].map(filter => (
                        <button
                          key={filter.id || 'all'}
                          onClick={() => {
                            setEventsTypeFilter(filter.id);
                            setShowTypeFilterDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 flex items-center gap-2 text-sm transition ${
                            eventsTypeFilter === filter.id
                              ? 'text-white bg-amber-500/20 font-semibold'
                              : 'text-white/70 hover:bg-white/5'
                          }`}
                        >
                          <span>{filter.emoji}</span>
                          <span>{filter.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

                  {/* Random Adventure Generator */}
          {travelViewMode === 'random' && (
            <div className="mt-8">
              {/* Mobile Back Button */}
              <button
                onClick={() => setTravelViewMode('main')}
                className="md:hidden flex items-center gap-2 text-teal-400 hover:text-teal-300 mb-4 active:scale-95 transition min-h-[44px]"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium">Back to Adventures</span>
              </button>
              <div className="max-w-2xl mx-auto">
                {/* Random Experience Generator */}
                <div className="bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-red-500/20 rounded-3xl p-8 border border-amber-500/30 text-center mb-8">
                  <div className="text-6xl mb-4">🎲</div>
                  <h2 className="text-2xl font-bold text-white mb-2">Random Adventure Generator</h2>
                  <p className="text-slate-300 mb-6">Let fate decide your next destination!</p>

                  <button
                    onClick={() => setShowRandomExperience(true)}
                    className="px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold text-xl rounded-2xl hover:opacity-90 transition shadow-lg"
                  >
                    🎰 Spin the Wheel!
                  </button>
                </div>

                {/* Experience Categories */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                  {[
                    { emoji: '🏖️', label: 'Beach / Warm', color: 'from-cyan-500/20 to-blue-500/20' },
                    { emoji: '🏔️', label: 'Mountain Escape', color: 'from-emerald-500/20 to-green-500/20' },
                    { emoji: '🏛️', label: 'Cultural', color: 'from-purple-500/20 to-indigo-500/20' },
                    { emoji: '🎢', label: 'Adventure', color: 'from-orange-500/20 to-red-500/20' },
                    { emoji: '🏃', label: 'Fitness / Active', color: 'from-red-500/20 to-orange-500/20' },
                    { emoji: '🧘', label: 'Relaxing / Spa', color: 'from-teal-500/20 to-cyan-500/20' },
                    { emoji: '🍷', label: 'Food & Wine', color: 'from-rose-500/20 to-pink-500/20' },
                    { emoji: '🌆', label: 'City Break', color: 'from-slate-500/20 to-zinc-500/20' },
                    { emoji: '🏕️', label: 'Nature / Outdoors', color: 'from-green-500/20 to-lime-500/20' },
                  ].map((cat, idx) => (
                    <button
                      key={idx}
                      onClick={() => setShowRandomExperience(true)}
                      className={`bg-gradient-to-br ${cat.color} rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-white/30 transition text-center active:scale-95`}
                    >
                      <div className="text-3xl sm:text-4xl mb-2">{cat.emoji}</div>
                      <div className="text-white font-medium text-sm sm:text-base">{cat.label}</div>
                    </button>
                  ))}
                </div>

                {/* Recent Random Picks */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4">💡 How it works</h3>
                  <ul className="space-y-3 text-slate-300">
                    <li className="flex items-start gap-3">
                      <span className="text-teal-400">1.</span>
                      <span>Click "Spin the Wheel" to get a random destination suggestion</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-teal-400">2.</span>
                      <span>Love it? Add it to your adventures or wishlist</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-teal-400">3.</span>
                      <span>Not feeling it? Spin again for a new suggestion</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}


                  {/* Wishlist / Dream Destinations */}
          {travelViewMode === 'wishlist' && (
            <div className="mt-8">
              {/* Mobile Back Button */}
              <button
                onClick={() => setTravelViewMode('main')}
                className="md:hidden flex items-center gap-2 text-teal-400 hover:text-teal-300 mb-4 active:scale-95 transition min-h-[44px]"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium">Back to Adventures</span>
              </button>
              {/* Add to Wishlist Button */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className="text-3xl">🦄</span>
                  Dream Destinations
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-purple-400 to-indigo-400">✨</span>
                </h2>
                {isOwner && (
                  <button
                    onClick={() => setShowNewTripModal('wishlist')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 border border-violet-500/30"
                  >
                    <Plus className="w-4 h-4" />
                    Add Dream
                  </button>
                )}
              </div>

              {wishlist.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlist.map(item => (
                    <div
                      key={item.id}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-purple-500/50 transition"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-purple-400 to-indigo-400" />
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-4xl mb-3">{item.emoji}</div>
                          <h3 className="text-xl font-bold text-white mb-1">{item.destination}</h3>
                          {item.notes && (
                            <p className="text-slate-400 text-sm">{item.notes}</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => convertToAdventure(item)}
                            className="px-3 py-1.5 bg-gradient-to-r from-teal-400 to-purple-400 text-white text-sm font-medium rounded-full hover:opacity-80 transition"
                          >
                            Book it! 🎉
                          </button>
                          {isOwner && (
                            <button
                              onClick={() => {
                                if (confirm(`Remove ${item.destination} from wishlist?`)) {
                                  const newWishlist = wishlist.filter(w => w.id !== item.id);
                                  setWishlist(newWishlist);
                                  saveToFirestore(null, newWishlist, null);
                                }
                              }}
                              className="px-3 py-1.5 bg-white/10 text-slate-300 text-sm rounded-full hover:bg-red-500/20 hover:text-red-300 transition"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                      <Starburst className="absolute -right-4 -bottom-4 w-16 h-16 text-white/5" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10">
                  <div className="text-6xl mb-4">🌟</div>
                  <h3 className="text-xl font-bold text-white mb-2">No dream destinations yet</h3>
                  <p className="text-slate-400 mb-6">Start adding places you'd love to visit!</p>
                  {isOwner && (
                    <button
                      onClick={() => setShowNewTripModal('wishlist')}
                      className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-xl hover:opacity-90 transition"
                    >
                      Add Your First Dream ✨
                    </button>
                  )}
                </div>
              )}

              {/* Inspiration Section */}
              <div className="mt-12">
                <h3 className="text-xl font-bold text-white mb-4">🌈 Need Inspiration?</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { destination: 'Santorini', emoji: '🇬🇷', notes: 'Stunning sunsets' },
                    { destination: 'Kyoto', emoji: '🇯🇵', notes: 'Cherry blossoms' },
                    { destination: 'Reykjavik', emoji: '🇮🇸', notes: 'Northern lights' },
                    { destination: 'Bali', emoji: '🇮🇩', notes: 'Tropical paradise' },
                  ].map((idea, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (isOwner) {
                          const newItem = {
                            id: Date.now(),
                            destination: idea.destination,
                            emoji: idea.emoji,
                            notes: idea.notes,
                            color: 'from-violet-400 to-purple-400',
                            isWishlist: true
                          };
                          const newWishlist = [...wishlist, newItem];
                          setWishlist(newWishlist);
                          saveToFirestore(null, newWishlist, null);
                          showToast(`${idea.destination} added to wishlist!`, 'success');
                        }
                      }}
                      className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-purple-500/50 transition text-left"
                    >
                      <div className="text-2xl mb-1">{idea.emoji}</div>
                      <div className="text-white font-medium">{idea.destination}</div>
                      <div className="text-slate-400 text-xs">{idea.notes}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}


                  {/* Main Combined View - Trips + Events */}
                  {travelViewMode === 'main' && (
                  <>
                  {/* Countdown Banner for Next Event (any type) */}
              {(() => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Gather upcoming trips
            const upcomingTrips = sortedTrips
              .filter(t => parseLocalDate(t.dates.start) > today)
              .map(t => ({
                source: 'trip', type: 'travel', id: t.id, name: t.destination, emoji: t.emoji,
                date: parseLocalDate(t.dates.start), color: t.color,
                guests: t.guests, special: t.special, raw: t,
              }));

            // Gather upcoming party events (multi-day events stay until end date)
            const upcomingEvents = partyEvents
              .filter(e => {
                const ref = (e.endDate && e.endDate !== e.date) ? e.endDate : e.date;
                return parseLocalDate(ref) >= today;
              })
              .map(e => ({
                source: 'event', type: e.eventType || 'parties', id: e.id, name: e.name, emoji: e.emoji,
                date: parseLocalDate(e.date), color: e.color || 'from-amber-400 to-orange-500',
                guests: e.guests, special: null, raw: e,
              }));

            // Combine and sort — soonest first
            const allUpcoming = [...upcomingTrips, ...upcomingEvents].sort((a, b) => a.date - b.date);

            // Apply type filter if set
            const filtered = eventsTypeFilter
              ? allUpcoming.filter(item => item.type === eventsTypeFilter)
              : allUpcoming;

            if (filtered.length === 0) return null;
            const next = filtered[0];
            const daysUntil = Math.ceil((next.date - today) / (1000 * 60 * 60 * 24));
            const isTrip = next.source === 'trip';

            // Trip-specific extras
            const details = isTrip ? (tripDetails[next.id] || { hotels: [], events: [], flights: [] }) : null;
            const tripDuration = isTrip ? Math.ceil((parseLocalDate(next.raw.dates.end) - next.date) / (1000 * 60 * 60 * 24)) + 1 : null;

            return (
              <div
                onClick={() => isTrip ? setSelectedTrip(next.raw) : setSelectedPartyEvent(next.raw)}
                className={`mt-6 bg-gradient-to-r ${next.color} rounded-2xl p-4 md:p-6 relative overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform`}>
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative flex flex-col md:flex-row items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        startBouncingEmoji(next.emoji, rect.left, rect.top);
                      }}
                      className="text-5xl md:text-6xl hover:scale-125 transition-transform cursor-pointer"
                      title="Click me!"
                    >
                      {next.emoji}
                    </button>
                    <div className="text-white">
                      <p className="text-sm md:text-base opacity-80 font-medium">Next Up</p>
                      <h3 className="text-2xl md:text-3xl font-bold">{next.name}</h3>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {isTrip && tripDuration && (
                          <>
                            <span className="text-sm opacity-80">{tripDuration} days</span>
                            <span className="text-sm opacity-60">•</span>
                            <span className="text-sm opacity-80">
                              {formatDate(next.raw.dates.start)} - {formatDate(next.raw.dates.end)}
                            </span>
                          </>
                        )}
                        {!isTrip && (
                          <>
                            <span className="text-sm opacity-80">
                              {formatDate(next.raw.date, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                            {next.raw.time && (
                              <>
                                <span className="text-sm opacity-60">•</span>
                                <span className="text-sm opacity-80">{next.raw.time}</span>
                              </>
                            )}
                            {next.raw.location && (
                              <>
                                <span className="text-sm opacity-60">•</span>
                                <span className="text-sm opacity-80">{next.raw.location}</span>
                              </>
                            )}
                          </>
                        )}
                      </div>

                      {/* Trip-specific details */}
                      {isTrip && details && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {details.hotels && details.hotels.length > 0 && (
                            <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-lg">
                              <Hotel className="w-4 h-4" />
                              <span className="text-sm font-medium">{details.hotels[0].name}</span>
                            </div>
                          )}
                          {details.flights && details.flights.length > 0 && (
                            <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-lg">
                              <Plane className="w-4 h-4" />
                              <span className="text-sm font-medium">{details.flights[0].airline}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Countdown */}
                  <div className="flex items-center gap-3 self-center md:self-start">
                    <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 md:px-6 md:py-3">
                      <div className="text-3xl md:text-5xl font-bold text-white">{daysUntil}</div>
                      <div className="text-xs md:text-sm text-white/80 font-medium">{daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'day to go!' : `days to go!`}</div>
                    </div>
                    <div className="text-4xl md:text-5xl">
                      {daysUntil <= 7 ? '🎉' : daysUntil <= 30 ? '✨' : '🗓️'}
                    </div>
                  </div>
                </div>

                {/* Bottom row */}
                <div className="relative mt-3 flex items-center gap-3 flex-wrap">
                  {next.special && (
                    <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium">
                      {next.special}
                    </span>
                  )}
                  {next.guests && next.guests.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/15 rounded-full text-white text-sm">
                      <Users className="w-3.5 h-3.5" />
                      +{next.guests.length} guest{next.guests.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const text = `${next.emoji} ${daysUntil} days until ${next.name}! ✨`;
                      if (navigator.share) {
                        navigator.share({ title: 'Event Countdown', text });
                      } else {
                        navigator.clipboard.writeText(text);
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-white text-sm font-medium transition"
                  >
                    📤 Share
                  </button>
                </div>
                <Starburst className="absolute -right-8 -bottom-8 w-32 h-32 text-white/10" />
              </div>
            );
          })()}


              {/* ===== Unified Events Grid (all types) ===== */}
          <section className="mt-8 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Normalize trips into unified items
                const tripItems = sortedTrips
                  .filter(t => parseLocalDate(t.dates.start) >= today)
                  .map(t => ({
                    source: 'trip', itemType: 'travel', id: t.id, name: t.destination, emoji: t.emoji,
                    sortDate: parseLocalDate(t.dates.start),
                    dateLabel: `${formatDate(t.dates.start)} - ${formatDate(t.dates.end)}`,
                    color: t.color, guests: t.guests || [], raw: t,
                    images: [], tasks: [],
                  }));

                // Normalize events into unified items
                const eventItems = partyEvents
                  .filter(e => {
                    // Multi-day events should stay visible until their end date
                    const ref = (e.endDate && e.endDate !== e.date) ? e.endDate : e.date;
                    return parseLocalDate(ref) >= today;
                  })
                  .map(e => ({
                    source: 'event', itemType: e.eventType || 'parties', id: e.id, name: e.name, emoji: e.emoji,
                    sortDate: parseLocalDate(e.date),
                    dateLabel: (e.endDate && e.endDate !== e.date)
                      ? `${formatDate(e.date, { month: 'short', day: 'numeric' })} – ${formatDate(e.endDate, { month: 'short', day: 'numeric' })}`
                      : `${formatDate(e.date, { weekday: 'short', month: 'short', day: 'numeric' })}${(!e.allDay && e.time) ? ` • ${e.time}` : (e.allDay ? ' • All day' : '')}`,
                    color: e.color || 'from-amber-400 to-orange-500', guests: e.guests || [], raw: e,
                    images: e.images || [], tasks: e.tasks || [],
                  }));

                // Combine, filter by type, sort
                let allItems = [...tripItems, ...eventItems];
                if (eventsTypeFilter) {
                  allItems = allItems.filter(item => item.itemType === eventsTypeFilter);
                }
                allItems.sort((a, b) => eventsSortAsc ? a.sortDate - b.sortDate : b.sortDate - a.sortDate);

                // Skip the banner item (first item if no filter)
                const bannerId = allItems.length > 0 ? allItems[0].id : null;
                const bannerType = allItems.length > 0 ? allItems[0].itemType : null;
                const gridItems = allItems.slice(1); // skip first (shown in banner)

                if (gridItems.length === 0 && allItems.length <= 1) {
                  return (
                    <div className="col-span-full text-center py-12">
                      <div className="text-6xl mb-4">🎈</div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {allItems.length === 0 ? 'No upcoming events' : 'Only one event coming up!'}
                      </h3>
                      <p className="text-slate-400 mb-4">
                        {isOwner ? 'Create more events with the + button!' : 'Check back soon!'}
                      </p>
                    </div>
                  );
                }

                return gridItems.map(item => {
                  const daysUntil = Math.ceil((item.sortDate - today) / (1000 * 60 * 60 * 24));
                  const isToday = daysUntil === 0;
                  const isTrip = item.source === 'trip';
                  const typeEmoji = { travel: '✈️', parties: '🎉', datenight: '🥂', concert: '🎵', fitness: '🏆', pride: '🏳️‍🌈', karaoke: '🎤' }[item.itemType] || '📅';

                  return (
                    <div
                      key={`${item.source}-${item.id}`}
                      data-search-id={`${item.source}-${item.id}`}
                      onClick={() => isTrip ? setSelectedTrip(item.raw) : setSelectedPartyEvent(item.raw)}
                      className="relative rounded-2xl border border-white/20 cursor-pointer hover:scale-[1.02] transition-all overflow-hidden"
                    >
                      {/* Cover Image */}
                      {(isTrip ? item.raw.coverImage : item.raw.coverImage) ? (
                        <div className="relative h-40">
                          <img
                            src={isTrip ? item.raw.coverImage : item.raw.coverImage}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                          <div className="absolute inset-0 p-5 flex flex-col justify-end">
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-3xl drop-shadow-lg">{item.emoji}</span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                isToday ? 'bg-green-500 text-white' :
                                daysUntil <= 7 ? 'bg-amber-500 text-white' :
                                'bg-white/30 text-white backdrop-blur-sm'
                              }`}>
                                {isToday ? '🎉 Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-white drop-shadow-lg">{item.name}</h3>
                            <p className="text-white/90 text-sm">{item.dateLabel}</p>
                          </div>
                        </div>
                      ) : (
                        <div className={`bg-gradient-to-br ${item.color} p-5`}>
                          {/* Type badge */}
                          <div className="absolute top-3 right-3">
                            <span className="px-2 py-1 bg-black/20 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                              {typeEmoji}
                            </span>
                          </div>

                          <div className="flex items-start justify-between mb-3">
                            <span className="text-4xl">{item.emoji}</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              isToday ? 'bg-green-500 text-white' :
                              daysUntil <= 7 ? 'bg-amber-500 text-white' :
                              'bg-white/20 text-white'
                            }`}>
                              {isToday ? '🎉 Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                            </span>
                          </div>

                          <h3 className="text-xl font-bold text-white mb-1">{item.name}</h3>
                          <p className="text-white/80 text-sm mb-3">{item.dateLabel}</p>

                          {/* Stats row */}
                          <div className="flex items-center gap-4">
                            {item.guests.length > 0 && (
                              <div className="flex items-center gap-1 text-white/70 text-sm">
                                <Users className="w-4 h-4" />
                                <span>{item.guests.length}</span>
                              </div>
                            )}
                            {item.images.length > 0 && (
                              <div className="flex items-center gap-1 text-white/70 text-sm">
                                <Image className="w-4 h-4" />
                                <span>{item.images.length}</span>
                              </div>
                            )}
                            {item.tasks.length > 0 && (
                              <div className="flex items-center gap-1 text-white/70 text-sm">
                                <CheckSquare className="w-4 h-4" />
                                <span>{item.tasks.filter(t => t.completed).length}/{item.tasks.length}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </section>


              {/* In the Works - Planning Section */}
              {(!eventsTypeFilter || eventsTypeFilter === 'travel') && planningTrips.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-2xl">🔨</span>
                In the Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {planningTrips.map(trip => (
                  <div
                    key={trip.id}
                    onClick={() => setEditingTrip(trip)}
                    className={`bg-gradient-to-br ${trip.color} rounded-3xl text-white text-left relative overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-xl border-2 border-dashed border-white/40 cursor-pointer`}
                  >
                    {/* Stripe pattern overlay */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 20px)'
                    }} />

                    {/* Cover Image */}
                    {trip.coverImage && (
                      <div className="h-28 w-full overflow-hidden">
                        <img
                          src={trip.coverImage}
                          alt={trip.destination}
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 h-28 bg-gradient-to-b from-black/20 to-transparent" />
                      </div>
                    )}

                    <div className={`p-6 ${trip.coverImage ? 'pt-4' : ''} relative z-10`}>
                      {/* Planning Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-yellow-500/40 text-yellow-200 text-xs font-bold rounded-full">
                          🔨 Planning
                        </span>
                      </div>

                      <div className="text-4xl mb-3">{trip.emoji}</div>
                      <h3 className="text-xl font-bold leading-tight mb-1">{trip.destination}</h3>
                      <p className="text-white/70 text-sm mb-2">
                        {formatDate(trip.dates.start)} - {formatDate(trip.dates.end)}
                      </p>

                      {/* Theme */}
                      {trip.theme && (
                        <div className="text-sm bg-white/20 px-2 py-1 rounded-lg inline-flex items-center gap-1 mb-3">
                          🎯 {trip.theme}
                        </div>
                      )}

                      {/* Planning Links Count */}
                      {trip.planningLinks && trip.planningLinks.length > 0 && (
                        <div className="text-xs text-white/60 flex items-center gap-1">
                          <Link className="w-3 h-3" />
                          {trip.planningLinks.length} planning link{trip.planningLinks.length !== 1 ? 's' : ''}
                        </div>
                      )}

                      {/* Click to view */}
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-white/60">Click to plan</span>
                        <ChevronRight className="w-4 h-4 text-white/60 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}



              {/* Old Events calendar removed — now in Hub */}

                  </>
                  )}
                </>
              )}
            </div>
  );
};

export default EventsSection;

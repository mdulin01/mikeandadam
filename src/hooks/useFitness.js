import { useState, useCallback } from 'react';

/**
 * useFitness Hook
 * Manages all fitness-related state and operations
 * Handles events, training plans, and workouts
 *
 * NOTE: saveRef, genRef, indyPlanRef, gsoHalfPlanRef are React refs
 * passed from the parent. We read .current at CALL TIME (not render time) to always
 * get the latest function/data, avoiding stale closure issues.
 *
 * The triathlon was removed from mikeandadam (it was Mike-only) and lives in
 * mikesfitness.app. Don't add a triPlanRef back here — keep this app couples-only.
 */

export const useFitness = (saveRef, showToast, genRef, indyPlanRef, gsoHalfPlanRef) => {
  // ========== INITIAL DATA ==========
  // Empty by default — defaults come from trip-planner.jsx defaultFitnessEvents and
  // are merged via setFitnessEvents on first load. Keeping this empty avoids two
  // sources of truth for the seed list.
  const defaultFitnessEvents = [];

  // ========== STATE ==========
  const [fitnessEvents, setFitnessEvents] = useState(defaultFitnessEvents);
  const [fitnessTrainingPlans, setFitnessTrainingPlans] = useState({});
  const [selectedFitnessEvent, setSelectedFitnessEvent] = useState(null);
  const [fitnessViewMode, setFitnessViewMode] = useState('events'); // 'events' | 'training' | 'stats'

  // Fitness modals and editing
  const [showAddFitnessEventModal, setShowAddFitnessEventModal] = useState(false);
  const [editingFitnessEvent, setEditingFitnessEvent] = useState(null);

  // ========== FITNESS EVENT CRUD ==========
  const updateFitnessEvent = useCallback((updatedEvent) => {
    const newEvents = fitnessEvents.map(event =>
      event.id === updatedEvent.id ? updatedEvent : event
    );
    setFitnessEvents(newEvents);
    saveRef.current(newEvents, fitnessTrainingPlans);
  }, [fitnessEvents, fitnessTrainingPlans, saveRef]);

  const deleteFitnessEvent = useCallback((eventId) => {
    const newEvents = fitnessEvents.filter(event => event.id !== eventId);
    const newPlans = { ...fitnessTrainingPlans };
    delete newPlans[eventId];
    setFitnessEvents(newEvents);
    setFitnessTrainingPlans(newPlans);
    saveRef.current(newEvents, newPlans);
  }, [fitnessEvents, fitnessTrainingPlans, saveRef]);

  // ========== TRAINING PLAN OPERATIONS ==========
  // Map event IDs → ref holding the hardcoded plan template. Adding a new race?
  // Add the entry here and pass the ref through trip-planner.jsx → useFitness().
  const planRefByEventId = {
    'indy-half-2026': indyPlanRef,
    'gso-half-2026': gsoHalfPlanRef,
  };

  // Initialize a plan from its hardcoded template if Firestore doesn't have one yet.
  // For events without a hardcoded template, fall back to the generic generator.
  const lazyInitPlan = (eventId) => {
    const ref = planRefByEventId[eventId];
    if (ref?.current?.length) return JSON.parse(JSON.stringify(ref.current));
    const event = fitnessEvents.find(e => e.id === eventId);
    if (event) {
      const today = new Date().toISOString().split('T')[0];
      return genRef.current(today, event.date, eventId);
    }
    return null;
  };

  const updateTrainingWeek = useCallback(async (eventId, weekId, updates) => {
    if (!eventId || !weekId) return;

    // Strip undefined values from updates to avoid Firestore errors
    const cleanUpdates = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) cleanUpdates[key] = value;
    }

    const newPlans = { ...fitnessTrainingPlans };
    if (!newPlans[eventId]) {
      newPlans[eventId] = lazyInitPlan(eventId);
    }

    if (!newPlans[eventId]) return;

    // Find week by id OR weekNumber (for backwards compatibility)
    const weekIdStr = String(weekId);
    const weekIdNum = weekIdStr.includes('week-') ? parseInt(weekIdStr.split('week-')[1]) : null;
    newPlans[eventId] = newPlans[eventId].map(week => {
      const matches = week.id === weekId || (weekIdNum && week.weekNumber === weekIdNum);
      if (matches) {
        return { ...week, ...cleanUpdates, id: weekId };
      }
      return week;
    });

    setFitnessTrainingPlans(newPlans);
    await saveRef.current(null, newPlans);
  }, [fitnessEvents, fitnessTrainingPlans, saveRef, indyPlanRef, gsoHalfPlanRef, genRef]);

  const updateWorkout = useCallback(async (eventId, weekId, workoutType, workoutId, updates) => {
    if (!eventId || !weekId) return;

    const newPlans = { ...fitnessTrainingPlans };
    if (!newPlans[eventId]) {
      newPlans[eventId] = lazyInitPlan(eventId);
      if (!newPlans[eventId]) return; // Can't update non-existent plan
    }

    // Find week by id OR weekNumber (for backwards compatibility)
    const weekIdStr = String(weekId);
    const weekIdNum = weekIdStr.includes('week-') ? parseInt(weekIdStr.split('week-')[1]) : null;
    const findWeek = (w) => w.id === weekId || (weekIdNum && w.weekNumber === weekIdNum);

    newPlans[eventId] = newPlans[eventId].map(week => {
      if (!findWeek(week)) return week;

      const updatedWorkouts = week[workoutType].map(workout =>
        workout.id === workoutId ? { ...workout, ...updates } : workout
      );

      return { ...week, [workoutType]: updatedWorkouts, id: weekId };
    });

    setFitnessTrainingPlans(newPlans);
    await saveRef.current(null, newPlans);
  }, [fitnessTrainingPlans, saveRef, indyPlanRef, gsoHalfPlanRef]);

  const addWorkout = useCallback(async (eventId, weekId, workoutType, workoutData) => {
    if (!eventId || !weekId) return;

    const newPlans = { ...fitnessTrainingPlans };
    if (!newPlans[eventId]) {
      newPlans[eventId] = lazyInitPlan(eventId);
    }

    if (!newPlans[eventId]) return;

    // Find week and add workout
    const weekIdStr = String(weekId);
    const weekIdNum = weekIdStr.includes('week-') ? parseInt(weekIdStr.split('week-')[1]) : null;
    const findWeek = (w) => w.id === weekId || (weekIdNum && w.weekNumber === weekIdNum);

    newPlans[eventId] = newPlans[eventId].map(week => {
      if (!findWeek(week)) return week;

      const newWorkout = { id: Date.now(), ...workoutData };
      const updatedWorkouts = [...(week[workoutType] || []), newWorkout];

      return { ...week, [workoutType]: updatedWorkouts, id: weekId };
    });

    setFitnessTrainingPlans(newPlans);
    await saveRef.current(null, newPlans);
  }, [fitnessEvents, fitnessTrainingPlans, saveRef, indyPlanRef, gsoHalfPlanRef, genRef]);

  const deleteWorkout = useCallback(async (eventId, weekId, workoutType, workoutId) => {
    if (!eventId || !weekId) return;

    const newPlans = { ...fitnessTrainingPlans };

    if (!newPlans[eventId]) return;

    const weekIdStr = String(weekId);
    const weekIdNum = weekIdStr.includes('week-') ? parseInt(weekIdStr.split('week-')[1]) : null;
    const findWeek = (w) => w.id === weekId || (weekIdNum && w.weekNumber === weekIdNum);

    newPlans[eventId] = newPlans[eventId].map(week => {
      if (!findWeek(week)) return week;

      const updatedWorkouts = (week[workoutType] || []).filter(w => w.id !== workoutId);
      return { ...week, [workoutType]: updatedWorkouts, id: weekId };
    });

    setFitnessTrainingPlans(newPlans);
    await saveRef.current(null, newPlans);
  }, [fitnessTrainingPlans, saveRef]);

  // ========== RETURN CONTEXT VALUE ==========
  return {
    // Data
    fitnessEvents,
    fitnessTrainingPlans,
    selectedFitnessEvent,
    fitnessViewMode,

    // Event operations
    updateFitnessEvent,
    deleteFitnessEvent,

    // Training operations
    updateTrainingWeek,
    updateWorkout,
    addWorkout,
    deleteWorkout,

    // Setters
    setFitnessEvents,
    setFitnessTrainingPlans,
    setSelectedFitnessEvent,
    setFitnessViewMode,

    // Modal states
    showAddFitnessEventModal,
    setShowAddFitnessEventModal,
    editingFitnessEvent,
    setEditingFitnessEvent,
  };
};

export default useFitness;

// Fitness seed data + hardcoded training-plan templates.
// Extracted from trip-planner.jsx 2026-07-05 (Phase 2 refactor).

export const defaultFitnessEvents = [
  {
    id: 'indy-half-2026',
    name: 'Indy Half Marathon',
    emoji: '🏃',
    date: '2026-05-02',
    type: 'half-marathon',
    location: 'Indianapolis, IN',
    color: 'from-orange-400 to-red-500',
    status: 'completed',
    finishTime: '2:22',
  },
  {
    id: 'gso-half-2026',
    name: 'Greensboro Half Marathon',
    emoji: '🏃',
    date: '2026-11-21',
    type: 'half-marathon',
    location: 'Greensboro, NC',
    color: 'from-purple-400 to-indigo-500',
    status: 'active',
  },
];

// Hardcoded Indy Half Marathon Training Plan - "Salad, Run, Salad"
export const indyHalfTrainingPlan = [
  { weekNumber: 1, startDate: '2026-01-11', endDate: '2026-01-17', runs: [
    { id: 1, label: 'Short Run', distance: '2 mi', mike: true, adam: true, notes: '' },
    { id: 2, label: 'Medium Run', distance: '3 mi', mike: true, adam: true, notes: '' },
    { id: 3, label: 'Long Run', distance: '4 mi', mike: true, adam: true, notes: '' }
  ], crossTraining: [
    { id: 1, label: 'Cross Train #1', mike: true, adam: true, notes: '' },
    { id: 2, label: 'Cross Train #2', mike: true, adam: true, notes: '' }
  ], totalMiles: 9, weekNotes: '' },
  { weekNumber: 2, startDate: '2026-01-18', endDate: '2026-01-24', runs: [
    { id: 1, label: 'Short Run', distance: '2 mi', mike: true, adam: true, notes: '' },
    { id: 2, label: 'Medium Run', distance: '3 mi', mike: true, adam: true, notes: '' },
    { id: 3, label: 'Long Run', distance: '4 mi', mike: true, adam: true, notes: '' }
  ], crossTraining: [
    { id: 1, label: 'Cross Train #1', mike: true, adam: true, notes: '' },
    { id: 2, label: 'Cross Train #2', mike: true, adam: true, notes: '' }
  ], totalMiles: 9, weekNotes: '' },
  { weekNumber: 3, startDate: '2026-01-25', endDate: '2026-01-31', runs: [
    { id: 1, label: 'Short Run', distance: '2 mi', mike: true, adam: true, notes: '' },
    { id: 2, label: 'Medium Run', distance: '3 mi', mike: true, adam: true, notes: '' },
    { id: 3, label: 'Long Run', distance: '5 mi', mike: true, adam: true, notes: '' }
  ], crossTraining: [
    { id: 1, label: 'Cross Train #1', mike: true, adam: true, notes: '' },
    { id: 2, label: 'Cross Train #2', mike: true, adam: true, notes: '' }
  ], totalMiles: 10, weekNotes: '' },
  { weekNumber: 4, startDate: '2026-02-01', endDate: '2026-02-07', runs: [
    { id: 1, label: 'Short Run', distance: '2 mi', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Medium Run', distance: '3 mi', mike: false, adam: false, notes: '' },
    { id: 3, label: 'Long Run', distance: '6 mi', mike: false, adam: false, notes: '' }
  ], crossTraining: [
    { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
  ], totalMiles: 11, weekNotes: 'SOBER!! 🎯' },
  { weekNumber: 5, startDate: '2026-02-08', endDate: '2026-02-14', runs: [
    { id: 1, label: 'Short Run', distance: '2 mi', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Medium Run', distance: '4 mi', mike: false, adam: false, notes: '' },
    { id: 3, label: 'Long Run', distance: '6 mi', mike: false, adam: false, notes: '' }
  ], crossTraining: [
    { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
  ], totalMiles: 12, weekNotes: '' },
  { weekNumber: 6, startDate: '2026-02-15', endDate: '2026-02-21', runs: [
    { id: 1, label: 'Short Run', distance: '3 mi', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Medium Run', distance: '4 mi', mike: false, adam: false, notes: '' },
    { id: 3, label: 'Long Run', distance: '6 mi', mike: false, adam: false, notes: '' }
  ], crossTraining: [
    { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
  ], totalMiles: 13, weekNotes: '' },
  { weekNumber: 7, startDate: '2026-02-22', endDate: '2026-02-28', runs: [
    { id: 1, label: 'Short Run', distance: '3 mi', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Medium Run', distance: '4 mi', mike: false, adam: false, notes: '' },
    { id: 3, label: 'Long Run', distance: '8 mi', mike: false, adam: false, notes: '' }
  ], crossTraining: [
    { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
  ], totalMiles: 15, weekNotes: '' },
  { weekNumber: 8, startDate: '2026-03-01', endDate: '2026-03-07', runs: [
    { id: 1, label: 'Short Run', distance: '3 mi', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Medium Run', distance: '4 mi', mike: false, adam: false, notes: '' },
    { id: 3, label: 'Long Run', distance: '8 mi', mike: false, adam: false, notes: '' }
  ], crossTraining: [
    { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
  ], totalMiles: 15, weekNotes: '✈️ Mike in Spain (Fri-Sat)' },
  { weekNumber: 9, startDate: '2026-03-08', endDate: '2026-03-14', runs: [
    { id: 1, label: 'Short Run', distance: '4 mi', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Medium Run', distance: '5 mi', mike: false, adam: false, notes: '' },
    { id: 3, label: 'Long Run', distance: '8 mi', mike: false, adam: false, notes: '' }
  ], crossTraining: [
    { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
  ], totalMiles: 17, weekNotes: '✈️ Mike in Spain (all week)' },
  { weekNumber: 10, startDate: '2026-03-15', endDate: '2026-03-21', runs: [
    { id: 1, label: 'Short Run', distance: '3 mi', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Medium Run', distance: '5 mi', mike: false, adam: false, notes: '' },
    { id: 3, label: 'Long Run', distance: '9 mi', mike: false, adam: false, notes: '' }
  ], crossTraining: [
    { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
  ], totalMiles: 17, weekNotes: '🗽 Mike & Adam in NYC (Thurs-Sat)' },
  { weekNumber: 11, startDate: '2026-03-22', endDate: '2026-03-28', runs: [
    { id: 1, label: 'Short Run', distance: '3 mi', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Medium Run', distance: '5 mi', mike: false, adam: false, notes: '' },
    { id: 3, label: 'Long Run', distance: '10 mi', mike: false, adam: false, notes: '' }
  ], crossTraining: [
    { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
  ], totalMiles: 18, weekNotes: '🗽 Mike & Adam in NYC (Sun-Mon)' },
  { weekNumber: 12, startDate: '2026-03-29', endDate: '2026-04-04', runs: [
    { id: 1, label: 'Short Run', distance: '3 mi', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Medium Run', distance: '5 mi', mike: false, adam: false, notes: '' },
    { id: 3, label: 'Long Run', distance: '11 mi', mike: false, adam: false, notes: '' }
  ], crossTraining: [
    { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
  ], totalMiles: 19, weekNotes: '' },
  { weekNumber: 13, startDate: '2026-04-05', endDate: '2026-04-11', runs: [
    { id: 1, label: 'Short Run', distance: '5.5 mi', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Medium Run', distance: '5 mi', mike: false, adam: false, notes: '' },
    { id: 3, label: 'Long Run', distance: '12 mi', mike: false, adam: false, notes: '' }
  ], crossTraining: [
    { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
  ], totalMiles: 22.5, weekNotes: '🏛️ Mike & Adam in DC (Thurs-Sat)' },
  { weekNumber: 14, startDate: '2026-04-12', endDate: '2026-04-18', runs: [
    { id: 1, label: 'Short Run', distance: '5 mi', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Medium Run', distance: '5 mi', mike: false, adam: false, notes: '' },
    { id: 3, label: 'Long Run', distance: '14 mi', mike: false, adam: false, notes: '' }
  ], crossTraining: [
    { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
  ], totalMiles: 24, weekNotes: '🏛️ Mike & Adam in DC (Sun-Mon)' },
  { weekNumber: 15, startDate: '2026-04-19', endDate: '2026-04-25', runs: [
    { id: 1, label: 'Short Run', distance: '3 mi', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Medium Run', distance: '4 mi', mike: false, adam: false, notes: '' },
    { id: 3, label: 'Long Run', distance: '8 mi', mike: false, adam: false, notes: '' }
  ], crossTraining: [
    { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
  ], totalMiles: 15, weekNotes: '📉 Taper Week - Rest up!' },
  { weekNumber: 16, startDate: '2026-04-26', endDate: '2026-05-02', runs: [
    { id: 1, label: 'Short Run', distance: '2 mi', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Medium Run', distance: '3 mi', mike: false, adam: false, notes: '' },
    { id: 3, label: 'Long Run', distance: '13.1 mi', mike: false, adam: false, notes: '' }
  ], crossTraining: [
    { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
  ], totalMiles: 18.1, weekNotes: '🏁 RACE WEEK! You got this! 🎉', isRaceWeek: true }
].map(week => ({ ...week, id: `indy-half-2026-week-${week.weekNumber}` }));

/* eslint-disable */
/* eslint-disable */
// ============================================================
// GREENSBORO HALF MARATHON TRAINING PLAN — 16 weeks, 3 runs/week, 2-week taper
// Race: Saturday 2026-11-21 in Greensboro, NC
// Re-planned 2026-07-05 from Mike's "GSO Half Plan" sheet — 247.1 total miles.
// Weekly notes carry trip/race conflicts (PTown, Mike Holland, Tri, Atlanta, FMX, PS Pride).
// ============================================================
export const gsoHalfTrainingPlan = [
  { weekNumber: 1, startDate: '2026-08-02', endDate: '2026-08-08', runs: [
    { id: 1, label: 'Short Run',  distance: '2 mi', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Medium Run', distance: '3 mi', mike: false, adam: false, notes: '' },
    { id: 3, label: 'Long Run',   distance: '5 mi', mike: false, adam: false, notes: '' }
  ], crossTraining: [
    { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
  ], totalMiles: 10, weekNotes: 'PTown 8/1-8/8' },
  { weekNumber: 2, startDate: '2026-08-09', endDate: '2026-08-15', runs: [
    { id: 1, label: 'Short Run',  distance: '2 mi', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Medium Run', distance: '3 mi', mike: false, adam: false, notes: '' },
    { id: 3, label: 'Long Run',   distance: '5 mi', mike: false, adam: false, notes: '' }
  ], crossTraining: [
    { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
  ], totalMiles: 10, weekNotes: '' },
  { weekNumber: 3, startDate: '2026-08-16', endDate: '2026-08-22', runs: [
    { id: 1, label: 'Short Run',  distance: '2 mi', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Medium Run', distance: '3 mi', mike: false, adam: false, notes: '' },
    { id: 3, label: 'Long Run',   distance: '6 mi', mike: false, adam: false, notes: '' }
  ], crossTraining: [
    { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
  ], totalMiles: 11, weekNotes: '' },
  { weekNumber: 4, startDate: '2026-08-23', endDate: '2026-08-29', runs: [
    { id: 1, label: 'Short Run',  distance: '2 mi', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Medium Run', distance: '4 mi', mike: false, adam: false, notes: '' },
    { id: 3, label: 'Long Run',   distance: '6 mi', mike: false, adam: false, notes: '' }
  ], crossTraining: [
    { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
  ], totalMiles: 12, weekNotes: '' },
  { weekNumber: 5, startDate: '2026-08-30', endDate: '2026-09-05', runs: [
    { id: 1, label: 'Short Run',  distance: '2 mi', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Medium Run', distance: '4 mi', mike: false, adam: false, notes: '' },
    { id: 3, label: 'Long Run',   distance: '7 mi', mike: false, adam: false, notes: '' }
  ], crossTraining: [
    { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
  ], totalMiles: 13, weekNotes: 'Mike Holland 8/30-9/6' },
  { weekNumber: 6, startDate: '2026-09-06', endDate: '2026-09-12', runs: [
    { id: 1, label: 'Short Run',  distance: '3 mi', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Medium Run', distance: '4 mi', mike: false, adam: false, notes: '' },
    { id: 3, label: 'Long Run',   distance: '7 mi', mike: false, adam: false, notes: '' }
  ], crossTraining: [
    { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
  ], totalMiles: 14, weekNotes: 'Mike Holland 8/30-9/6' },
  { weekNumber: 7, startDate: '2026-09-13', endDate: '2026-09-19', runs: [
    { id: 1, label: 'Short Run',  distance: '3 mi', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Medium Run', distance: '5 mi', mike: false, adam: false, notes: '' },
    { id: 3, label: 'Long Run',   distance: '8 mi', mike: false, adam: false, notes: '' }
  ], crossTraining: [
    { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
  ], totalMiles: 16, weekNotes: '' },
  { weekNumber: 8, startDate: '2026-09-20', endDate: '2026-09-26', runs: [
    { id: 1, label: 'Short Run',  distance: '3 mi', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Medium Run', distance: '5 mi', mike: false, adam: false, notes: '' },
    { id: 3, label: 'Long Run',   distance: '8 mi', mike: false, adam: false, notes: '' }
  ], crossTraining: [
    { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
  ], totalMiles: 16, weekNotes: 'Triathlon 9/24-9/27' },
  { weekNumber: 9, startDate: '2026-09-27', endDate: '2026-10-03', runs: [
    { id: 1, label: 'Short Run',  distance: '3 mi', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Medium Run', distance: '5 mi', mike: false, adam: false, notes: '' },
    { id: 3, label: 'Long Run',   distance: '9 mi', mike: false, adam: false, notes: '' }
  ], crossTraining: [
    { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
  ], totalMiles: 17, weekNotes: 'Triathlon 9/24-9/27' },
  { weekNumber: 10, startDate: '2026-10-04', endDate: '2026-10-10', runs: [
    { id: 1, label: 'Short Run',  distance: '3 mi', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Medium Run', distance: '6 mi', mike: false, adam: false, notes: '' },
    { id: 3, label: 'Long Run',   distance: '9 mi', mike: false, adam: false, notes: '' }
  ], crossTraining: [
    { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
  ], totalMiles: 18, weekNotes: 'Atlanta 10/8-10/12' },
  { weekNumber: 11, startDate: '2026-10-11', endDate: '2026-10-17', runs: [
    { id: 1, label: 'Short Run',  distance: '4 mi', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Medium Run', distance: '6 mi', mike: false, adam: false, notes: '' },
    { id: 3, label: 'Long Run',   distance: '10 mi', mike: false, adam: false, notes: '' }
  ], crossTraining: [
    { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
  ], totalMiles: 20, weekNotes: 'Atlanta 10/8-10/12' },
  { weekNumber: 12, startDate: '2026-10-18', endDate: '2026-10-24', runs: [
    { id: 1, label: 'Short Run',  distance: '4 mi', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Medium Run', distance: '6 mi', mike: false, adam: false, notes: '' },
    { id: 3, label: 'Long Run',   distance: '11 mi', mike: false, adam: false, notes: '' }
  ], crossTraining: [
    { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
  ], totalMiles: 21, weekNotes: 'FMX 10/20-10/25?' },
  { weekNumber: 13, startDate: '2026-10-25', endDate: '2026-10-31', runs: [
    { id: 1, label: 'Short Run',  distance: '4 mi', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Medium Run', distance: '6 mi', mike: false, adam: false, notes: '' },
    { id: 3, label: 'Long Run',   distance: '12 mi', mike: false, adam: false, notes: '' }
  ], crossTraining: [
    { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
  ], totalMiles: 22, weekNotes: 'FMX 10/20-10/25? · 🔝 Peak week' },
  { weekNumber: 14, startDate: '2026-11-01', endDate: '2026-11-07', runs: [
    { id: 1, label: 'Short Run',  distance: '3 mi', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Medium Run', distance: '5 mi', mike: false, adam: false, notes: '' },
    { id: 3, label: 'Long Run',   distance: '8 mi', mike: false, adam: false, notes: '' }
  ], crossTraining: [
    { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
  ], totalMiles: 16, weekNotes: 'PS Pride 11/4-11/9 · 📉 Taper Week 1' },
  { weekNumber: 15, startDate: '2026-11-08', endDate: '2026-11-14', runs: [
    { id: 1, label: 'Short Run',  distance: '3 mi', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Medium Run', distance: '4 mi', mike: false, adam: false, notes: '' },
    { id: 3, label: 'Long Run',   distance: '6 mi', mike: false, adam: false, notes: '' }
  ], crossTraining: [
    { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
  ], totalMiles: 13, weekNotes: 'PS Pride 11/4-11/9 · 📉 Taper Week 2' },
  { weekNumber: 16, startDate: '2026-11-15', endDate: '2026-11-21', runs: [
    { id: 1, label: 'Short Run',  distance: '2 mi', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Medium Run', distance: '3 mi', mike: false, adam: false, notes: '' },
    { id: 3, label: 'Long Run',   distance: '13.1 mi', mike: false, adam: false, notes: '🏁 RACE!' }
  ], crossTraining: [
    { id: 1, label: 'Race Day Prep', mike: false, adam: false, notes: '' },
    { id: 2, label: 'Rest', mike: false, adam: false, notes: '' }
  ], totalMiles: 18.1, weekNotes: '🏁 RACE WEEK! Greensboro Half — let\'s do this! 🎉', isRaceWeek: true }
].map(week => ({ ...week, id: `gso-half-2026-week-${week.weekNumber}` }));
/* eslint-enable */

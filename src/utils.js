// utils.js - Utility functions extracted from trip-planner.jsx

import { emojiSuggestions, experienceDatabase, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from './constants';

// Helper to parse date strings without timezone issues
// "2026-03-23" -> Date object for March 23, 2026 in local time
export const parseLocalDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return new Date();

  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date();

  const [year, month, day] = parts.map(Number);

  // Validate parsed values
  if (isNaN(year) || isNaN(month) || isNaN(day)) return new Date();
  if (year < 1900 || year > 2100) return new Date();
  if (month < 1 || month > 12) return new Date();
  if (day < 1 || day > 31) return new Date();

  const date = new Date(year, month - 1, day);

  // Check if Date constructor produced a valid date
  if (isNaN(date.getTime())) return new Date();

  return date;
};

// Format a date string for display
export const formatDate = (dateStr, options = { month: 'short', day: 'numeric' }) => {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('en-US', options);
};

// Validate file size - returns error message or null
export const validateFileSize = (file) => {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is ${MAX_FILE_SIZE_MB}MB.`;
  }
  return null;
};

// Get emoji suggestion based on destination
export const getEmojiSuggestion = (destination) => {
  if (!destination) return '✈️';
  const lower = destination.toLowerCase();
  for (const [keyword, emoji] of Object.entries(emojiSuggestions)) {
    if (lower.includes(keyword)) return emoji;
  }
  return '✈️';
};

// Get random experience from database
export const getRandomExperience = (type, vibes, bougieLevel) => {
  let pool = [];

  if (type === 'any' || type === 'dayTrip') {
    pool = [...pool, ...experienceDatabase.dayTrips.map(e => ({ ...e, type: 'dayTrip', typeLabel: '🚗 Day Trip' }))];
  }
  if (type === 'any' || type === 'train') {
    pool = [...pool, ...experienceDatabase.trainTrips.map(e => ({ ...e, type: 'train', typeLabel: '🚂 Train Trip' }))];
  }
  if (type === 'any' || type === 'cruise') {
    pool = [...pool, ...experienceDatabase.cruises.map(e => ({ ...e, type: 'cruise', typeLabel: '🚢 Cruise' }))];
  }
  if (type === 'any' || type === 'flight') {
    pool = [...pool, ...experienceDatabase.flights.map(e => ({ ...e, type: 'flight', typeLabel: '✈️ Flight' }))];
  }

  // Filter by vibes if any selected
  if (vibes.length > 0) {
    pool = pool.filter(exp => vibes.some(v => exp.vibes?.includes(v)));
  }

  // Filter by bougie level if selected (allow +/- 1 level flexibility)
  if (bougieLevel > 0) {
    pool = pool.filter(exp => exp.bougie && Math.abs(exp.bougie - bougieLevel) <= 1);
  }

  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
};

// Get days in month for calendar
export const getDaysInMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
};

// Calculate days until a date
export const getDaysUntil = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = parseLocalDate(dateStr);
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  return diff;
};

// Check if a date is within a trip's date range
export const isDateInRange = (checkDate, startStr, endStr) => {
  const start = parseLocalDate(startStr);
  const end = parseLocalDate(endStr);
  return checkDate >= start && checkDate <= end;
};

// Format countdown text
export const formatCountdown = (days) => {
  if (days < 0) return 'Past';
  if (days === 0) return 'Today!';
  if (days === 1) return 'Tomorrow!';
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.floor(days / 7)} weeks`;
  return `${Math.floor(days / 30)} months`;
};

// Check if file is HEIC/HEIF format
export const isHeicFile = (file) => {
  return file.type === 'image/heic' ||
         file.type === 'image/heif' ||
         file.name.toLowerCase().endsWith('.heic') ||
         file.name.toLowerCase().endsWith('.heif');
};

// Generate safe filename for storage
export const getSafeFileName = (fileName) => {
  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${timestamp}_${safeName}`;
};

// Get display name for companion
export const getCompanionDisplayName = (companion) => {
  if (!companion) return 'Guest';
  if (companion.firstName && companion.lastName) {
    return `${companion.firstName} ${companion.lastName}`;
  }
  return companion.firstName || companion.name || 'Unknown';
};

// Check if user is an owner
export const checkIsOwner = (email, ownerEmails) => {
  if (!email) return false;
  const lowerEmail = email.toLowerCase();
  return ownerEmails.some(ownerEmail =>
    lowerEmail.includes(ownerEmail.split('@')[0])
  );
};

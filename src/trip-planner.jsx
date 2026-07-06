import React, { useState, useEffect, useRef, useCallback , useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Plane, Hotel, Music, MapPin, Plus, X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Heart, Anchor, Sun, Star, Clock, Users, ExternalLink, Sparkles, Pencil, Check, MoreVertical, Trash2, Palette, Image, ImagePlus, Link, Globe, Loader, LogIn, LogOut, User, UserPlus, Share2, Upload, Folder, Edit3, CheckSquare, RefreshCw, Camera, Search, Bell, BellOff } from 'lucide-react';

// Import constants and utilities
import {
  emojiSuggestions, travelEmojis, tripColors, bougieLabels, travelQuotes,
  achievementDefinitions, eventCategories, defaultPackingItems, experienceDatabase,
  airlines, ownerEmails, months, days, MAX_FILE_SIZE_MB, MAX_FILE_SIZE_BYTES,
  timeHorizons, listCategories, ideaCategories, taskPriorities, socialTypes, habitCategories
} from './constants';
import {
  parseLocalDate, formatDate, validateFileSize, getEmojiSuggestion,
  getRandomExperience, getDaysInMonth, isHeicFile, getSafeFileName,
  getCompanionDisplayName, isTaskDueToday, isTaskDueThisWeek, taskMatchesHorizon, getDomainFromUrl,
  toLocalDateStr
} from './utils';

// Component imports
import AddModal from './components/AddModal';
import LoginScreen from './components/LoginScreen';
import NewTripModal from './components/NewTripModal';
import RandomExperienceModal from './components/RandomExperienceModal';
import LinkModal from './components/LinkModal';
import GuestModal from './components/GuestModal';
import OpenDateModal from './components/OpenDateModal';
import CompanionsModal from './components/CompanionsModal';
import MyProfileModal from './components/MyProfileModal';
import TripDetail from './components/TripDetail';
import BuildInfo from './components/BuildInfo';
import PhotoLightbox from './components/PhotoLightbox';

// Hooks
import { useSharedHub } from './hooks/useSharedHub';
import { useTravel } from './hooks/useTravel';
import { useFitness } from './hooks/useFitness';

// Contexts
import { SharedHubProvider } from './contexts/SharedHubContext';

// Shared Hub imports
import AddTaskModal from './components/SharedHub/AddTaskModal';
import SharedListModal from './components/SharedHub/SharedListModal';
import AddIdeaModal from './components/SharedHub/AddIdeaModal';
import TaskCard from './components/SharedHub/TaskCard';
import ListCard from './components/SharedHub/ListCard';
import IdeaCard from './components/SharedHub/IdeaCard';
import AddSocialModal from './components/SharedHub/AddSocialModal';
import SocialCard from './components/SharedHub/SocialCard';
import GoalCard from './components/SharedHub/GoalCard';
import AddGoalModal from './components/SharedHub/AddGoalModal';
import OdysseyPlanCard from './components/SharedHub/OdysseyPlanCard';
import AddOdysseyPlanModal from './components/SharedHub/AddOdysseyPlanModal';


// Firebase imports
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  collection,
  query,
  orderBy,
  writeBatch,
  updateDoc,
  deleteField
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import heic2any from 'heic2any';

// Import your Firebase config
import { firebaseConfig } from './firebase-config';
import RupertBanner from './components/RupertBanner';
import { memoriesSeed } from './data/memoriesSeed';
import { defaultFitnessEvents, indyHalfTrainingPlan, gsoHalfTrainingPlan } from './data/fitnessData';
import TodayCard from './components/TodayCard';
import NotificationPrefsModal from './components/NotificationPrefsModal';
import MemoriesSection from './sections/MemoriesSection';
import FitnessSection from './sections/FitnessSection';
import HubSection from './sections/HubSection';
import EventsSection from './sections/EventsSection';
import MemoriesFeed from './components/MemoriesFeed';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
let messaging = null;
try {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'Notification' in window) {
    messaging = getMessaging(app);
  }
} catch (e) {
  console.warn('FCM not supported on this device:', e.message);
}
const googleProvider = new GoogleAuthProvider();

// Generate a unique guest token for invitation links
const generateGuestToken = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let token = '';
  for (let i = 0; i < 12; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

// Rainbow gradient for pride flair
const RainbowBar = () => (
  <div className="h-1 w-full bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 via-blue-500 to-purple-500" />
);

// Unicorn emoji component
const Unicorn = ({ className }) => (
  <span className={className}>🦄</span>
);

// Rainbow heart
const RainbowHeart = () => (
  <div className="relative inline-block">
    <Heart className="w-5 h-5 text-pink-400" fill="url(#rainbow-gradient)" />
    <svg width="0" height="0">
      <defs>
        <linearGradient id="rainbow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="20%" stopColor="#f97316" />
          <stop offset="40%" stopColor="#eab308" />
          <stop offset="60%" stopColor="#22c55e" />
          <stop offset="80%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

const defaultTrips = [
  {
    id: 1,
    destination: 'New York City',
    emoji: '🗽',
    dates: { start: '2026-03-19', end: '2026-03-23' },
    color: 'from-indigo-400 to-blue-500',
    accent: 'bg-indigo-400',
    isWishlist: false,
    coverImage: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=400&fit=crop',
    guests: [] // Just Mike & Adam
  },
  {
    id: 2,
    destination: 'Indianapolis',
    emoji: '🏎️',
    dates: { start: '2026-04-30', end: '2026-05-06' },
    color: 'from-teal-400 to-cyan-500',
    accent: 'bg-teal-400',
    isWishlist: false,
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop',
    guests: [
      { id: 1, name: 'Josh', email: 'josh@example.com', role: 'guest', addedBy: 'Mike', relationship: 'Son' },
      { id: 2, name: 'Liam', email: 'liam@example.com', role: 'guest', addedBy: 'Mike', relationship: 'Son' }
    ]
  },
  {
    id: 3,
    destination: 'Provincetown',
    emoji: '🏖️',
    dates: { start: '2026-08-01', end: '2026-08-08' },
    color: 'from-emerald-400 to-teal-500',
    accent: 'bg-emerald-400',
    isWishlist: false,
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop',
    guests: [
      { id: 1, name: 'Rhett', email: 'rhett@example.com', role: 'guest', addedBy: 'Mike', relationship: 'Friend' },
      { id: 2, name: 'Carl', email: 'carl@example.com', role: 'guest', addedBy: 'Mike', relationship: 'Friend' },
      { id: 3, name: 'Frankie', email: 'frankie@example.com', role: 'guest', addedBy: 'Adam', relationship: 'Friend' },
      { id: 4, name: 'Anthony', email: 'anthony@example.com', role: 'guest', addedBy: 'Mike', relationship: 'Friend' },
      { id: 5, name: 'Glen', email: 'glen@example.com', role: 'guest', addedBy: 'Adam', relationship: 'Friend' },
      { id: 6, name: 'Jason', email: 'jason@example.com', role: 'guest', addedBy: 'Mike', relationship: 'Friend' },
      { id: 7, name: 'Rusty', email: 'rusty@example.com', role: 'guest', addedBy: 'Adam', relationship: 'Friend' },
      { id: 8, name: 'Jimmy', email: 'jimmy@example.com', role: 'guest', addedBy: 'Mike', relationship: 'Friend' },
    ]
  },
  {
    id: 4,
    destination: 'London',
    emoji: '🇬🇧',
    dates: { start: '2026-06-13', end: '2026-06-16' },
    color: 'from-violet-400 to-purple-500',
    accent: 'bg-violet-400',
    special: '🎤 Harry Styles Concert!',
    isWishlist: false,
    isPlanning: true, // Trip is in planning stage
    theme: 'Harry Styles Concert',
    expectedDuration: '3-4 days',
    planningLinks: [
      { id: 1, title: 'Harry Styles Wembley Tickets', url: 'https://www.ticketmaster.co.uk', type: 'event' },
      { id: 2, title: 'The Londoner Hotel', url: 'https://www.thelondoner.com', type: 'hotel' },
    ],
    coverImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=400&fit=crop',
    guests: [] // Just Mike & Adam
  }
];

const defaultWishlist = [
  {
    id: 100,
    destination: 'Mykonos',
    emoji: '🇬🇷',
    color: 'from-blue-400 to-cyan-400',
    accent: 'bg-blue-400',
    isWishlist: true,
    notes: 'Pride week in June?'
  },
  {
    id: 101,
    destination: 'Puerto Vallarta',
    emoji: '🌴',
    color: 'from-green-400 to-emerald-500',
    accent: 'bg-green-400',
    isWishlist: true,
    notes: 'Zona Romántica!'
  }
];

// Regular travel companions who have calendar access
const defaultCompanions = [
  { id: 'kate', firstName: 'Kate', lastName: '', email: 'kate@example.com', phone: '', relationship: 'Friend', color: 'from-pink-400 to-rose-500' },
  { id: 'chris', firstName: 'Chris', lastName: '', email: 'chris@example.com', phone: '', relationship: 'Friend', color: 'from-blue-400 to-indigo-500' },
  { id: 'joe', firstName: 'Joe', lastName: 'Dulin', email: 'joe@example.com', phone: '', relationship: 'Brother', color: 'from-green-400 to-emerald-500' },
  { id: 'ryan', firstName: 'Ryan', lastName: '', email: 'ryan@example.com', phone: '', relationship: 'Cousin', color: 'from-amber-400 to-orange-500' },
  { id: 'josh', firstName: 'Josh', lastName: 'Dulin', email: 'josh@example.com', phone: '', relationship: 'Son', color: 'from-purple-400 to-violet-500' },
  { id: 'liam', firstName: 'Liam', lastName: 'Dulin', email: 'liam@example.com', phone: '', relationship: 'Son', color: 'from-cyan-400 to-teal-500' },
];

// Default open for travel dates
const defaultOpenDates = [
  {
    id: 1,
    start: '2026-02-14',
    end: '2026-02-17',
    note: 'Presidents Day Weekend',
    visibleTo: ['all'], // 'all' or array of companion ids
  },
  {
    id: 2,
    start: '2026-05-22',
    end: '2026-05-25',
    note: 'Memorial Day Weekend',
    visibleTo: ['all'],
  },
  {
    id: 3,
    start: '2026-07-03',
    end: '2026-07-05',
    note: '4th of July',
    visibleTo: ['joe', 'ryan', 'josh', 'liam'], // Family only
  },
  {
    id: 4,
    start: '2026-09-05',
    end: '2026-09-07',
    note: 'Labor Day Weekend',
    visibleTo: ['kate', 'chris'], // Friends only
  },
];

const initialTripDetails = {
  1: {
    flights: [
      { id: 1, addedBy: 'Mike', airline: 'Delta', flightNo: 'DL 1247', depart: '8:30 AM', arrive: '11:45 AM', date: 'Mar 19' }
    ],
    hotels: [
      { id: 1, addedBy: 'Mike', name: 'The Standard High Line', address: '848 Washington St', checkIn: 'Mar 19', checkOut: 'Mar 23' }
    ],
    events: [
      { id: 1, addedBy: 'Adam', name: 'Broadway Show - Hadestown', time: '7:00 PM', date: 'Mar 20' },
      { id: 2, addedBy: 'Mike', name: 'Brunch at Cafeteria', time: '11:00 AM', date: 'Mar 21' }
    ],
    links: [
      { id: 1, addedBy: 'Mike', url: 'https://www.standardhotels.com/new-york/properties/high-line', title: 'The Standard High Line', description: 'Iconic hotel in the Meatpacking District with stunning views', image: 'https://picsum.photos/seed/hotel/400/300', category: 'hotel' },
      { id: 2, addedBy: 'Adam', url: 'https://hadestown.com', title: 'Hadestown on Broadway', description: 'Tony Award-winning musical', image: 'https://picsum.photos/seed/theater/400/300', category: 'event' }
    ],
    packingList: [
      { id: 1, item: 'Passport', packed: true, addedBy: 'Mike' },
      { id: 2, item: 'Broadway tickets', packed: false, addedBy: 'Adam' },
    ],
    budget: {
      total: 3500,
      expenses: [
        { id: 1, description: 'Hotel (4 nights)', amount: 1200, paidBy: 'Mike', category: 'lodging' },
        { id: 2, description: 'Flights', amount: 600, paidBy: 'Adam', category: 'transport' },
        { id: 3, description: 'Broadway tickets', amount: 400, paidBy: 'Adam', category: 'entertainment' },
      ]
    },
    photos: [
      { id: 1, url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400', caption: 'NYC Skyline', addedBy: 'Mike' },
    ],
    places: [
      { id: 1, name: 'Cafeteria', type: 'restaurant', address: '119 7th Ave', addedBy: 'Mike', visited: false },
      { id: 2, name: 'The High Line', type: 'activity', address: 'Gansevoort St', addedBy: 'Adam', visited: false },
    ],
    notes: 'Remember to pack warm layers - March in NYC can be chilly! Also check if we need to book the rooftop bar in advance. 💕'
  },
  2: { flights: [], hotels: [], events: [], links: [], packingList: [], budget: { total: 0, expenses: [] }, photos: [], places: [], notes: '' },
  3: { flights: [], hotels: [], events: [], links: [], packingList: [], budget: { total: 0, expenses: [] }, photos: [], places: [], notes: '' },
  4: {
    flights: [],
    hotels: [],
    events: [
      { id: 1, addedBy: 'Adam', name: '🎤 Harry Styles Concert', time: 'TBD', date: 'Jun 14' }
    ],
    links: [],
    packingList: [
      { id: 1, item: 'Concert outfit', packed: false, addedBy: 'Adam' },
      { id: 2, item: 'Rainbow flag', packed: false, addedBy: 'Mike' },
    ],
    budget: { total: 2000, expenses: [] },
    photos: [],
    places: [],
    notes: 'OMG HARRY! 🎤✨'
  }
};

// Starburst SVG component for mid-century flair with pulse animation
const Starburst = ({ className, animated = false }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <style>
      {`
        @keyframes starburst-pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); transform-origin: center; }
          50% { opacity: 0.4; transform: scale(1.1); transform-origin: center; }
        }
        .starburst-animated {
          animation: starburst-pulse 3s ease-in-out infinite;
        }
        @keyframes ray-pulse {
          0%, 100% { stroke-width: 2; }
          50% { stroke-width: 3; }
        }
        .ray-animated {
          animation: ray-pulse 3s ease-in-out infinite;
        }
      `}
    </style>
    <g className={animated ? 'starburst-animated' : ''}>
      {[...Array(12)].map((_, i) => (
        <line
          key={i}
          x1="50" y1="50"
          x2={50 + 45 * Math.cos((i * 30 * Math.PI) / 180)}
          y2={50 + 45 * Math.sin((i * 30 * Math.PI) / 180)}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className={animated ? 'ray-animated' : ''}
          style={animated ? { animationDelay: `${i * 0.1}s` } : {}}
        />
      ))}
      {/* Center circle for pulse effect */}
      {animated && (
        <>
          <circle cx="50" cy="50" r="8" fill="currentColor" opacity="0.3">
            <animate attributeName="r" values="5;12;5" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="50" cy="50" r="4" fill="currentColor" opacity="0.5" />
        </>
      )}
    </g>
  </svg>
);

// Animated Anchor component that drops when clicked
const DroppableAnchor = ({ className }) => {
  const [isDropping, setIsDropping] = useState(false);
  const [hasDropped, setHasDropped] = useState(false);

  const handleClick = () => {
    if (!isDropping && !hasDropped) {
      setIsDropping(true);
      setTimeout(() => {
        setHasDropped(true);
        // Reset after a delay so it can be clicked again
        setTimeout(() => {
          setIsDropping(false);
          setHasDropped(false);
        }, 2000);
      }, 1500);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer transition-all duration-100 hover:scale-110 ${className}`}
      style={{
        transform: isDropping ? 'translateY(500px) rotate(20deg)' : hasDropped ? 'translateY(500px)' : 'translateY(0)',
        transition: isDropping ? 'transform 1.5s cubic-bezier(0.55, 0, 1, 0.45)' : hasDropped ? 'none' : 'transform 0.3s ease-out',
        opacity: hasDropped ? 0 : 1,
      }}
      title="Click to drop anchor! ⚓"
    >
      <Anchor className="w-12 h-12 text-white/20 hover:text-white/40 transition-colors" />
    </div>
  );
};

// Atomic decoration
const AtomicDots = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="absolute w-2 h-2 bg-white rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
      />
    ))}
  </div>
);

// Login Component


export default function TripPlanner() {
  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState(null); // { message: string, type: 'success' | 'error' | 'info' }

  // Track component mount status to prevent state updates after unmount
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // Show toast helper
  const showToast = useCallback((message, type = 'info') => {
    if (!isMountedRef.current) return;
    setToast({ message, type });
    setTimeout(() => {
      if (isMountedRef.current) setToast(null);
    }, 4000);
  }, []);

  // Main section navigation
  // Check URL for deep link to a specific Hub item (?hub=task&id=123)
  const initialDeepLink = (() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hubType = urlParams.get('hub');
    const hubId = urlParams.get('id');
    const validTypes = ['task', 'list', 'idea', 'social', 'habit'];
    if (hubType && validTypes.includes(hubType) && hubId) {
      window.history.replaceState({}, '', window.location.pathname);
      return { type: hubType, id: hubId };
    }
    return null;
  })();

  // Check URL for app mode at initialization - supports multiple app types
  const initialAppMode = (() => {
    if (initialDeepLink) return null; // Deep links always go to Hub
    const urlParams = new URLSearchParams(window.location.search);
    const appParam = urlParams.get('app');
    const validApps = ['fitness', 'travel', 'events', 'memories'];
    if (appParam && validApps.includes(appParam)) {
      return appParam === 'travel' ? 'events' : appParam; // travel now lives under events
    }
    const isStandalone = typeof window !== 'undefined' && (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone ||
      document.referrer.includes('android-app://')
    );
    // Check for any app mode in standalone
    for (const app of validApps) {
      if (isStandalone && window.location.search.includes(app)) {
        return app;
      }
    }
    return null;
  })();

  // URL ↔ section slug mapping (pretty URLs like /hub, /fitness)
  const URL_SECTIONS = { fitness: 'fitness', hub: 'home', events: 'events', memories: 'memories', calendar: 'calendar', apps: 'apps' };
  const SECTION_URLS = Object.fromEntries(Object.entries(URL_SECTIONS).map(([u, s]) => [s, u]));
  const routeParams = useParams();
  const navigateRoute = useNavigate();
  const urlSection = routeParams?.section ? URL_SECTIONS[routeParams.section.toLowerCase()] : null;
  const [activeSection, setActiveSection] = useState(initialAppMode || urlSection || 'home'); // 'home' (hub, default) | 'fitness' | 'events' | 'memories' | 'calendar' | 'apps'

  // Sync URL when activeSection changes (from tab clicks) — skip if in app mode (PWA standalone override)
  useEffect(() => {
    if (initialAppMode) return; // PWA app-mode windows don't mess with URL
    const slug = SECTION_URLS[activeSection];
    if (!slug) return;
    const currentSlug = (routeParams?.section || '').toLowerCase();
    const desiredPath = slug === 'home' && !routeParams?.section ? '/' : '/' + slug;
    // Only navigate if URL is out of sync (prevents loop)
    if (currentSlug !== slug && !(currentSlug === '' && activeSection === 'home')) {
      navigateRoute(desiredPath, { replace: false });
    }
  }, [activeSection]);

  // Sync activeSection when URL changes (back/forward buttons)
  useEffect(() => {
    if (urlSection && urlSection !== activeSection) {
      setActiveSection(urlSection);
    }
  }, [urlSection]);

  // User profile selection
  const [currentUser, setCurrentUser] = useState('Mike');

  // Ref to store saveSharedHub function (defined later in useEffect)
  const saveSharedHubRef = useRef(() => {});
  // Tracks whether the sharedHub Firestore doc has been loaded yet — shared between hook and trip-planner
  const hubDataLoadedRef = useRef(false);

  // ========== SHARED HUB: All state and operations from hook =====
  const sharedHub = useSharedHub(currentUser, saveSharedHubRef.current, showToast, hubDataLoadedRef);
  const {
    sharedTasks, sharedLists, sharedIdeas, sharedSocial, sharedGoals, sharedOdysseyPlans,
    addTask, updateTask, deleteTask, completeTask, highlightTask,
    addList, updateList, deleteList, addListItem, toggleListItem, deleteListItem, highlightList,
    addIdea, updateIdea, deleteIdea, highlightIdea,
    addSocial, updateSocial, deleteSocial, completeSocial, highlightSocial,
    addGoal, updateGoal, deleteGoal, toggleMilestone, highlightGoal,
    addOdysseyPlan, updateOdysseyPlan, deleteOdysseyPlan,
    hubSubView, setHubSubView, hubTaskFilter, setHubTaskFilter, hubTaskSort, setHubTaskSort,
    hubListFilter, setHubListFilter, hubIdeaFilter, setHubIdeaFilter, hubIdeaStatusFilter, setHubIdeaStatusFilter,
    hubSocialFilter, setHubSocialFilter, hubGoalFilter, setHubGoalFilter,
    collapsedSections, toggleDashSection,
    setSharedTasks, setSharedLists, setSharedIdeas, setSharedSocial, setSharedGoals, setSharedOdysseyPlans,
    // Hub modal states (now from context)
    showAddTaskModal, setShowAddTaskModal,
    showSharedListModal, setShowSharedListModal,
    showAddIdeaModal, setShowAddIdeaModal,
    showAddSocialModal, setShowAddSocialModal,
    showAddGoalModal, setShowAddGoalModal,
    showOdysseyPlanModal, setShowOdysseyPlanModal,
  } = sharedHub;

  // Deep link state — opens a specific Hub item when the URL contains ?hub=type&id=itemId
  const [pendingDeepLink, setPendingDeepLink] = useState(initialDeepLink);

  // Week Ahead planner state
  const [weekQuickAddDay, setWeekQuickAddDay] = useState(null); // YYYY-MM-DD of day whose + was tapped
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, +1 = next week, -1 = prev week

  // Refs for dependencies defined later
  const saveToFirestoreRef = useRef(() => {});
  const tripColorsRef = useRef([]);

  // ========== TRAVEL: All state and operations from hook =====
  const travel = useTravel(user, currentUser, saveToFirestoreRef.current, showToast, getEmojiSuggestion, tripColorsRef.current);
  const {
    trips, tripDetails, wishlist,
    addNewTrip, updateTripDates, deleteTrip, updateTripColor, updateTripEmoji, updateTripCoverImage,
    convertToAdventure, addItem: hookAddItem, removeItem: hookRemoveItem, updateItem: hookUpdateItem,
    setTrips, setTripDetails, setWishlist,
    showNewTripModal, setShowNewTripModal,
    showAddModal, setShowAddModal,
  } = travel;

  // Ref for saveFitness (defined later)
  const saveFitnessRef = useRef(() => {});

  // ========== FITNESS: All state and operations from hook =====
  // Note: plan templates (gsoHalf, indyHalf) are defined later in this file.
  // Each gets a ref so useFitness can lazy-init the plan into Firestore on first edit.
  const generateTrainingWeeksRef = useRef(() => []);
  const indyHalfTrainingPlanRef = useRef([]);
  const gsoHalfTrainingPlanRef = useRef([]);

  const fitness = useFitness(saveFitnessRef, showToast, generateTrainingWeeksRef, indyHalfTrainingPlanRef, gsoHalfTrainingPlanRef);
  const {
    fitnessEvents, fitnessTrainingPlans, selectedFitnessEvent, fitnessViewMode,
    updateFitnessEvent, deleteFitnessEvent, updateTrainingWeek, addWorkout, deleteWorkout,
    setFitnessEvents, setFitnessTrainingPlans, setSelectedFitnessEvent, setFitnessViewMode,
    showAddFitnessEventModal, setShowAddFitnessEventModal, editingFitnessEvent, setEditingFitnessEvent,
  } = fitness;

  // Search state
  const [showSearch, setShowSearch] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showNotifyPrefs, setShowNotifyPrefs] = useState(false);
  const [notifyPrefs, setNotifyPrefs] = useState(null); // tripData/notifyPrefs
  const [checkins, setCheckins] = useState([]); // tripData/checkins/entries (weekly couple check-in)
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({ tasks: true, lists: true, ideas: true, social: true, goals: true, travel: true, events: true, fitness: true, memories: true });
  const [searchHighlightId, setSearchHighlightId] = useState(null); // { type, id } - scroll-to target after search nav
  // Shared Google-calendar agenda (tripData/calendar), written each morning by
  // the mikeslife cron-couple-context job from the "Mike & Adam" calendar.
  const [calendarAgenda, setCalendarAgenda] = useState(null);
  const [memoriesView, setMemoriesView] = useState('feed'); // 'feed' | 'timeline' | 'events' | 'media'
  const [collapsedMemorySections, setCollapsedMemorySections] = useState({}); // { sectionId: true/false }
  const [timelineSortOrder, setTimelineSortOrder] = useState('newest'); // 'newest' | 'oldest'
  const [timelineYearFilter, setTimelineYearFilter] = useState('all'); // 'all' | specific year

  // Memories state - imported from memories_data.xlsx
  const [memories, setMemories] = useState(memoriesSeed);
  const [editingMemory, setEditingMemory] = useState(null); // memory object being edited
  const [editingTrip, setEditingTrip] = useState(null); // trip object being edited
  const [editingPartyEvent, setEditingPartyEvent] = useState(null); // event object being edited
  const [editingPhotoIndex, setEditingPhotoIndex] = useState(null); // which photo is being edited for positioning
  const [photoPosition, setPhotoPosition] = useState({ x: 50, y: 50, zoom: 100 }); // x%, y%, zoom%
  const [showPartnershipQuote, setShowPartnershipQuote] = useState(false); // cute quote popup
  const [showAddMemoryModal, setShowAddMemoryModal] = useState(null); // category for new memory
  const [newMemoryData, setNewMemoryData] = useState({
    title: '', date: '', location: '', description: '', image: '', images: [], link: '', comment: ''
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingToMemoryId, setUploadingToMemoryId] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [dragOverMemoryId, setDragOverMemoryId] = useState(null);
  const [uploadingWeekPhotoId, setUploadingWeekPhotoId] = useState(null);
  const [heroPhotoIndex, setHeroPhotoIndex] = useState(0);
  const [dismissedEmojis, setDismissedEmojis] = useState(new Set());

  // Get all images for a memory (backward compatible with old 'image' field)
  const getMemoryImages = (memory) => {
    const images = memory.images || [];
    if (memory.image && !images.includes(memory.image)) {
      return [memory.image, ...images];
    }
    return images;
  };

  // Get a random image for display (deterministic based on memory id + date for consistency)
  const getRandomMemoryImage = (memory) => {
    const images = getMemoryImages(memory);
    if (images.length === 0) return null;
    if (images.length === 1) return images[0];
    // Use memory id as seed for consistent random selection per render
    const seed = memory.id + new Date().toDateString();
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    return images[Math.abs(hash) % images.length];
  };

  // Open photo lightbox
  const openLightbox = useCallback((images, index = 0) => {
    if (images && images.length > 0) setLightbox({ images, index });
  }, []);

  // Get all photos from all memories for hero carousel
  const getAllMemoryPhotos = useCallback(() => {
    return memories.flatMap(memory => getMemoryImages(memory)).filter(Boolean);
  }, [memories]);

  // Hero photo carousel effect
  useEffect(() => {
    const photos = getAllMemoryPhotos();
    if (photos.length <= 1) return;

    const interval = setInterval(() => {
      setHeroPhotoIndex(prev => (prev + 1) % photos.length);
    }, 20000); // Change photo every 20 seconds

    return () => clearInterval(interval);
  }, [getAllMemoryPhotos]);

  // Handle drag and drop for photo/video upload in modals
  const handleDrop = (e, isEdit = false) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      uploadMemoryMedia(file, isEdit);
    }
  };

  // Handle drop directly on a memory card
  const handleCardDrop = async (e, memoryId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverMemoryId(null);
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await uploadPhotoToMemory(file, memoryId);
    }
  };

  // Upload photo and add to a specific memory's images array
  const uploadPhotoToMemory = async (file, memoryId) => {
    if (!file) return;

    // Validate file size
    const sizeError = validateFileSize(file);
    if (sizeError) {
      showToast(sizeError, 'error');
      return;
    }

    setUploadingToMemoryId(memoryId);
    try {
      let fileToUpload = file;
      let fileName = file.name;

      // Downscale + JPEG-normalize (memory-safe HEIC handling — see prepareImageForUpload)
      fileToUpload = await prepareImageForUpload(file);
      fileName = fileToUpload.name;

      const timestamp = Date.now();
      const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageRef = ref(storage, `memories/${timestamp}_${safeName}`);
      await uploadBytes(storageRef, fileToUpload);
      const downloadURL = await getDownloadURL(storageRef);

      // Add to memory's images array (check if still mounted)
      if (!isMountedRef.current) return;
      setMemories(prev => {
        const next = prev.map(m => {
          if (m.id === memoryId) {
            const currentImages = m.images || [];
            // Also migrate old 'image' field if present
            if (m.image && !currentImages.includes(m.image)) {
              return { ...m, images: [m.image, ...currentImages, downloadURL], image: '' };
            }
            return { ...m, images: [...currentImages, downloadURL] };
          }
          return m;
        });
        saveMemoriesToFirestore(next); // was previously never persisted — bug fix
        return next;
      });
    } catch (error) {
      console.error('Upload failed:', error);
      if (isMountedRef.current) showToast('Photo upload failed. Please try again.', 'error');
    } finally {
      if (isMountedRef.current) setUploadingToMemoryId(null);
    }
  };

  // Upload photo to a party event (with HEIC conversion)
  const uploadPhotoToEvent = async (file, eventId) => {
    if (!file) return;

    // Validate file size
    const sizeError = validateFileSize(file);
    if (sizeError) {
      showToast(sizeError, 'error');
      return;
    }

    setUploadingToEventId(eventId);
    try {
      let fileToUpload = file;
      let fileName = file.name;

      // Downscale + JPEG-normalize (memory-safe HEIC handling — see prepareImageForUpload)
      fileToUpload = await prepareImageForUpload(file);
      fileName = fileToUpload.name;

      const timestamp = Date.now();
      const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageRef = ref(storage, `events/${timestamp}_${safeName}`);
      await uploadBytes(storageRef, fileToUpload);
      const downloadURL = await getDownloadURL(storageRef);

      // Check if still mounted before updating state
      if (!isMountedRef.current) return;

      // Add to event's images array
      const newEvents = partyEvents.map(e => {
        if (e.id === eventId) {
          const currentImages = e.images || [];
          return { ...e, images: [...currentImages, downloadURL] };
        }
        return e;
      });
      setPartyEvents(newEvents);

      // Update selected event if viewing it
      if (selectedPartyEvent?.id === eventId) {
        setSelectedPartyEvent(newEvents.find(e => e.id === eventId));
      }

      savePartyEventsToFirestore(newEvents);
    } catch (error) {
      console.error('Event photo upload failed:', error);
      if (isMountedRef.current) showToast('Event photo upload failed. Please try again.', 'error');
    } finally {
      if (isMountedRef.current) setUploadingToEventId(null);
    }
  };

  // Handle drop on event card
  const handleEventCardDrop = async (e, eventId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverEventId(null);
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await uploadPhotoToEvent(file, eventId);
    }
  };

  // Handle event cover image upload in modal — uploads to Firebase Storage
  const handleEventCoverImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeError = validateFileSize(file);
    if (sizeError) { showToast(sizeError, 'error'); return; }

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setEventCoverImagePreview(previewUrl);
    setUploadingEventCoverImage(true);

    try {
      let fileToUpload = file;
      let fileName = file.name;

      // Downscale + JPEG-normalize (memory-safe HEIC handling — see prepareImageForUpload)
      fileToUpload = await prepareImageForUpload(file);
      fileName = fileToUpload.name;

      const timestamp = Date.now();
      const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageRef = ref(storage, `events/covers/${timestamp}_${safeName}`);
      await uploadBytes(storageRef, fileToUpload);
      const downloadURL = await getDownloadURL(storageRef);

      if (!isMountedRef.current) return;

      if (editingEvent) {
        setEditingEvent({ ...editingEvent, coverImage: downloadURL });
      } else {
        setNewEventData(prev => ({ ...prev, coverImage: downloadURL }));
      }
      setUploadingEventCoverImage(false);
    } catch (error) {
      console.error('Error uploading event cover image:', error);
      // Fallback: use preview URL
      if (editingEvent) {
        setEditingEvent({ ...editingEvent, coverImage: previewUrl });
      } else {
        setNewEventData(prev => ({ ...prev, coverImage: previewUrl }));
      }
      setUploadingEventCoverImage(false);
      showToast('Cover image upload failed', 'error');
    }
  };

  const removeEventCoverImage = () => {
    setEventCoverImagePreview(null);
    if (editingEvent) {
      setEditingEvent({ ...editingEvent, coverImage: '' });
    } else {
      setNewEventData({ ...newEventData, coverImage: '' });
    }
    if (eventCoverFileRef.current) eventCoverFileRef.current.value = '';
    if (eventCoverCameraRef.current) eventCoverCameraRef.current.value = '';
  };

  // Handle fitness cover image upload in modal
  const handleFitnessCoverImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setFitnessCoverImagePreview(previewUrl);
    setUploadingFitnessCoverImage(true);

    try {
      // Convert to data URL for storage (works offline, persists in Firestore)
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        if (editingFitnessEvent) {
          setEditingFitnessEvent({ ...editingFitnessEvent, coverImage: dataUrl });
        } else {
          setNewFitnessEventData(prev => ({ ...prev, coverImage: dataUrl }));
        }
        setUploadingFitnessCoverImage(false);
      };
      reader.onerror = () => {
        if (editingFitnessEvent) {
          setEditingFitnessEvent({ ...editingFitnessEvent, coverImage: previewUrl });
        } else {
          setNewFitnessEventData(prev => ({ ...prev, coverImage: previewUrl }));
        }
        setUploadingFitnessCoverImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing fitness cover image:', error);
      if (editingFitnessEvent) {
        setEditingFitnessEvent({ ...editingFitnessEvent, coverImage: previewUrl });
      } else {
        setNewFitnessEventData(prev => ({ ...prev, coverImage: previewUrl }));
      }
      setUploadingFitnessCoverImage(false);
    }
  };

  const removeFitnessCoverImage = () => {
    setFitnessCoverImagePreview(null);
    if (editingFitnessEvent) {
      setEditingFitnessEvent({ ...editingFitnessEvent, coverImage: '' });
    } else {
      setNewFitnessEventData(prev => ({ ...prev, coverImage: '' }));
    }
    if (fitnessCoverFileRef.current) fitnessCoverFileRef.current.value = '';
    if (fitnessCoverCameraRef.current) fitnessCoverCameraRef.current.value = '';
  };

  // ========== FITNESS WEEK PHOTO HELPERS ==========
  // Uses Firebase Storage (same pattern as working memory photo upload)
  const handleWeekPhotoAdd = async (eventId, weekId, existingPhotos, file) => {
    if (!file) return;
    // Accept images even without a proper MIME type (some mobile browsers)
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|heic|heif|bmp)$/i.test(file.name);
    if (!isImage) {
      showToast('Please select an image file', 'error');
      return;
    }

    const sizeError = validateFileSize(file);
    if (sizeError) {
      showToast(sizeError, 'error');
      return;
    }

    setUploadingWeekPhotoId(weekId);
    try {
      let fileToUpload = file;
      let fileName = file.name || 'photo.jpg';

      // Downscale + JPEG-normalize (memory-safe HEIC handling — see prepareImageForUpload)
      fileToUpload = await prepareImageForUpload(file);
      fileName = fileToUpload.name;

      // Upload to Firebase Storage using memories/ prefix (allowed by storage rules)
      const timestamp = Date.now();
      const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageRef = ref(storage, `memories/fitness-${eventId}-${weekId}-${timestamp}_${safeName}`);
      await uploadBytes(storageRef, fileToUpload);
      const downloadURL = await getDownloadURL(storageRef);

      // Save the download URL (not base64) to training week
      const photos = [...(existingPhotos || []), { id: timestamp, url: downloadURL, addedAt: new Date().toISOString() }];
      await updateTrainingWeek(eventId, weekId, { photos });

      // Auto-sync to memories if not already there
      const alreadyInMemories = memories.some(m => m.autoSynced && m.images?.includes(downloadURL));
      if (!alreadyInMemories) {
        const fitEvent = fitnessEvents.find(e => e.id === eventId);
        const plan = fitnessTrainingPlans[eventId];
        const week = plan?.find(w => w.id === weekId);
        const eventName = fitEvent?.name || 'Training';
        const weekNum = week?.weekNumber || '';
        const newMemory = {
          id: `fitness-auto-${timestamp}`,
          category: 'fitness',
          date: week?.startDate || toLocalDateStr(),
          title: `${eventName}${weekNum ? ` - Week ${weekNum}` : ''} Photo`,
          images: [downloadURL],
          autoSynced: true,
          createdAt: new Date().toISOString()
        };
        setMemories(prev => [...prev, newMemory]);
        saveMemoriesToFirestore([...memories, newMemory]);
      }

      showToast('Photo added!', 'success');
    } catch (error) {
      console.error('Fitness week photo upload failed:', error);
      showToast('Photo upload failed: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setUploadingWeekPhotoId(null);
    }
  };

  // ========== RACE DAY (post-event details + photos) ==========
  const updateRaceDay = async (eventId, raceDayUpdates) => {
    const updatedEvents = fitnessEvents.map(e =>
      e.id === eventId ? { ...e, raceDay: { ...(e.raceDay || {}), ...raceDayUpdates } } : e
    );
    setFitnessEvents(updatedEvents);
    if (selectedFitnessEvent?.id === eventId) {
      setSelectedFitnessEvent(updatedEvents.find(e => e.id === eventId));
    }
    await saveFitnessToFirestore(updatedEvents, null);
  };

  const handleRaceDayPhotoAdd = async (eventId, file) => {
    if (!file) return;
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|heic|heif|bmp)$/i.test(file.name);
    if (!isImage) {
      showToast('Please select an image file', 'error');
      return;
    }
    const sizeError = validateFileSize(file);
    if (sizeError) {
      showToast(sizeError, 'error');
      return;
    }
    try {
      let fileToUpload = file;
      let fileName = file.name || 'photo.jpg';
      // Downscale + JPEG-normalize (memory-safe HEIC handling — see prepareImageForUpload)
      fileToUpload = await prepareImageForUpload(file);
      fileName = fileToUpload.name;
      const timestamp = Date.now();
      const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageRef = ref(storage, `memories/race-${eventId}-${timestamp}_${safeName}`);
      await uploadBytes(storageRef, fileToUpload);
      const downloadURL = await getDownloadURL(storageRef);
      const event = fitnessEvents.find(e => e.id === eventId);
      const existing = event?.raceDay?.photos || [];
      const photos = [...existing, { id: timestamp, url: downloadURL, addedAt: new Date().toISOString() }];
      await updateRaceDay(eventId, { photos });
      showToast('Race photo added', 'success');
    } catch (err) {
      console.error('Race photo upload failed:', err);
      showToast('Failed to upload photo', 'error');
    }
  };

  const handleRaceDayPhotoRemove = async (eventId, photoId) => {
    const event = fitnessEvents.find(e => e.id === eventId);
    const existing = event?.raceDay?.photos || [];
    const photos = existing.filter(p => p.id !== photoId);
    await updateRaceDay(eventId, { photos });
  };

  const handleWeekPhotoRemove = async (eventId, weekId, existingPhotos, photoId) => {
    try {
      const photos = (existingPhotos || []).filter(p => p.id !== photoId);
      await updateTrainingWeek(eventId, weekId, { photos });
      showToast('Photo removed', 'success');
    } catch (error) {
      console.error('Failed to remove week photo:', error);
      showToast('Failed to remove photo. Please try again.', 'error');
    }
  };

  // Debounced weekNotes change handler - avoids a Firestore write per keystroke
  const handleWeekNotesChange = useCallback((eventId, weekId, value) => {
    const key = `${eventId}:${weekId}`;
    setWeekNotesLocal(prev => ({ ...prev, [key]: value }));
    if (weekNotesSaveTimer.current) clearTimeout(weekNotesSaveTimer.current);
    weekNotesSaveTimer.current = setTimeout(() => {
      updateTrainingWeek(eventId, weekId, { weekNotes: value });
      setWeekNotesLocal(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }, 800);
  }, [updateTrainingWeek]);

  // ── Memory-safe image preparation (2026-07-05) ──
  // heic2any decodes the FULL-resolution HEIC in JS memory (a 48MP iPhone
  // photo ≈ hundreds of MB decompressed), which crashes mobile Safari PWAs.
  // iOS Safari can decode HEIC natively in an <img>, so: native decode →
  // scaled canvas (max 2048px) → JPEG. heic2any is only the fallback for
  // browsers that can't decode HEIC (desktop Chrome/Firefox).
  const prepareImageForUpload = async (file, maxDim = 2048, quality = 0.85) => {
    const decodeAndScale = async (blob) => {
      const url = URL.createObjectURL(blob);
      try {
        const img = await new Promise((resolve, reject) => {
          const i = new window.Image();
          i.onload = () => resolve(i);
          i.onerror = () => reject(new Error('decode failed'));
          i.src = url;
        });
        const w0 = img.naturalWidth, h0 = img.naturalHeight;
        if (!w0 || !h0) throw new Error('decode produced empty image');
        const scale = Math.min(1, maxDim / Math.max(w0, h0));
        const w = Math.max(1, Math.round(w0 * scale));
        const h = Math.max(1, Math.round(h0 * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const out = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
        if (!out) throw new Error('canvas toBlob failed');
        return out;
      } finally {
        URL.revokeObjectURL(url);
      }
    };

    const isHeic = file.type === 'image/heic' || file.type === 'image/heif' ||
                   /\.(heic|heif)$/i.test(file.name);
    const jpegName = file.name.replace(/\.(heic|heif)$/i, '.jpg').replace(/\.(png|webp|gif)$/i, '.jpg');
    try {
      // Native decode works for JPG/PNG everywhere and HEIC on iOS Safari.
      const blob = await decodeAndScale(file);
      return new File([blob], jpegName, { type: 'image/jpeg' });
    } catch (err) {
      if (isHeic) {
        // Browser can't decode HEIC natively — convert (desktop), then scale.
        const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
        try {
          const blob = await decodeAndScale(converted);
          return new File([blob], jpegName, { type: 'image/jpeg' });
        } catch {
          return new File([converted], jpegName, { type: 'image/jpeg' });
        }
      }
      console.warn('Image downscale failed, uploading original:', err);
      return file;
    }
  };

  // Upload photo/video to Firebase Storage (with HEIC conversion for images) - for modals
  const uploadMemoryMedia = async (file, isEdit = false) => {
    if (!file) return;

    // Check if it's a video file
    const isVideo = file.type.startsWith('video/') ||
                    /\.(mp4|mov|m4v|webm|avi)$/i.test(file.name);

    // Validate file size (more lenient for videos - 50MB)
    const maxSize = isVideo ? 50 * 1024 * 1024 : MAX_FILE_SIZE_BYTES;
    if (file.size > maxSize) {
      showToast(`File too large. Max size: ${isVideo ? '50MB' : MAX_FILE_SIZE_MB + 'MB'}`, 'error');
      return;
    }

    setUploadingPhoto(true);
    try {
      let fileToUpload = file;
      let fileName = file.name;

      // Downscale + JPEG-normalize images (memory-safe HEIC handling).
      if (!isVideo) {
        fileToUpload = await prepareImageForUpload(file);
        fileName = fileToUpload.name;
      }

      const timestamp = Date.now();
      const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const folder = isVideo ? 'videos' : 'memories';
      const storageRef = ref(storage, `${folder}/${timestamp}_${safeName}`);
      await uploadBytes(storageRef, fileToUpload);
      const downloadURL = await getDownloadURL(storageRef);

      // Check if still mounted before updating state
      if (!isMountedRef.current) return;

      if (isEdit) {
        if (isVideo) {
          // Add to videos array
          setEditingMemory(prev => {
            const currentVideos = prev.videos || [];
            return { ...prev, videos: [...currentVideos, downloadURL] };
          });
        } else {
          // Add to images array
          setEditingMemory(prev => {
            const currentImages = prev.images || [];
            const allImages = prev.image && !currentImages.includes(prev.image)
              ? [prev.image, ...currentImages]
              : currentImages;
            return { ...prev, images: [...allImages, downloadURL], image: '' };
          });
        }
      } else {
        if (isVideo) {
          setNewMemoryData(prev => {
            const currentVideos = prev.videos || [];
            return { ...prev, videos: [...currentVideos, downloadURL] };
          });
        } else {
          setNewMemoryData(prev => {
            const currentImages = prev.images || [];
            return { ...prev, images: [...currentImages, downloadURL] };
          });
        }
      }
      showToast(isVideo ? 'Video uploaded!' : 'Photo uploaded!', 'success');
    } catch (error) {
      console.error('Upload failed:', error);
      if (isMountedRef.current) showToast('Upload failed. Please try again.', 'error');
    } finally {
      if (isMountedRef.current) setUploadingPhoto(false);
    }
  };

  // Alias for backward compatibility
  const uploadMemoryPhoto = uploadMemoryMedia;

  // PWA App Mode Detection - Check if running as installed app or with ?app=fitness parameter
  const [isAppMode, setIsAppMode] = useState(() => {
    // Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const appParam = urlParams.get('app');
    // Check if running in standalone mode (installed PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         window.navigator.standalone || // iOS Safari
                         document.referrer.includes('android-app://');
    return appParam === 'fitness' || (isStandalone && window.location.search.includes('fitness'));
  });

  // App state
  const [companions, setCompanions] = useState(defaultCompanions);
  const [openDates, setOpenDates] = useState(defaultOpenDates);
  const [showOpenDateModal, setShowOpenDateModal] = useState(false);
  const [showCompanionsModal, setShowCompanionsModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null); // dateStr for day detail modal
  const [lightbox, setLightbox] = useState(null); // { images: [], index: 0 } for photo lightbox
  const [showTripMenu, setShowTripMenu] = useState(null); // trip id for menu
  const [showColorPicker, setShowColorPicker] = useState(null); // trip id for color picker
  const [showEmojiEditor, setShowEmojiEditor] = useState(null); // trip id for emoji editor
  const [showImageEditor, setShowImageEditor] = useState(null); // trip id for image editor
  const [showLinkModal, setShowLinkModal] = useState(null); // trip id for link modal
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [googleCalendarEvents, setGoogleCalendarEvents] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(null); // Google Calendar event to import
  const [importSettings, setImportSettings] = useState({ type: 'event', color: 'from-blue-400 to-indigo-500', customName: '', eventType: 'parties' });
  const [calendarViewMonth, setCalendarViewMonth] = useState(new Date()); // Month for calendar section view
  const [availableCalendars, setAvailableCalendars] = useState([]); // List of user's calendars
  const [selectedCalendarId, setSelectedCalendarId] = useState('primary'); // Selected calendar to fetch from
  const [showCalendarPicker, setShowCalendarPicker] = useState(false); // Show calendar selection modal
  const [showRandomExperience, setShowRandomExperience] = useState(false);
  const [travelViewMode, setTravelViewMode] = useState('main'); // 'main', 'random', 'wishlist'
  const [easterEggClicks, setEasterEggClicks] = useState(0);
  const [showDisneyMagic, setShowDisneyMagic] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('overview'); // overview, packing, budget, photos, places, notes
  const [showGuestModal, setShowGuestModal] = useState(null); // trip id for guest management
  const [editingTripDates, setEditingTripDates] = useState(null); // { tripId, start, end } for date editing
  const [generatedExperience, setGeneratedExperience] = useState(null);
  const [experienceFilters, setExperienceFilters] = useState({ type: 'any', vibes: [] });
  const [currentCompanion, setCurrentCompanion] = useState(null); // logged-in companion object
  const [showMyProfileModal, setShowMyProfileModal] = useState(false); // companion profile editor
  const [editingTrainingWeek, setEditingTrainingWeek] = useState(null); // { eventId, week } for editing training week
  // Sync editingTrainingWeek photos when fitnessTrainingPlans updates (e.g., after upload from within modal)
  useEffect(() => {
    if (editingTrainingWeek) {
      const plan = fitnessTrainingPlans[editingTrainingWeek.eventId];
      const freshWeek = plan?.find(w => w.id === editingTrainingWeek.week.id);
      if (freshWeek && JSON.stringify(freshWeek.photos) !== JSON.stringify(editingTrainingWeek.week.photos)) {
        setEditingTrainingWeek(prev => prev ? { ...prev, week: { ...prev.week, photos: freshWeek.photos } } : null);
      }
    }
  }, [fitnessTrainingPlans]);
  const [pastWeeksExpanded, setPastWeeksExpanded] = useState(false); // collapse past fitness weeks
  const [weekNotesLocal, setWeekNotesLocal] = useState({}); // { "eventId:weekId": "notes text" } for debounced editing
  const weekNotesSaveTimer = useRef(null);
  const [weekPhotoDrag, setWeekPhotoDrag] = useState(null); // weekId of week being dragged onto
  const [isOwner, setIsOwner] = useState(false); // true if Mike or Adam
  const [bouncingEmoji, setBouncingEmoji] = useState(null); // { emoji, x, y, dx, dy } for bouncing animation

  // Guest state - for users invited to specific trips
  const [isGuest, setIsGuest] = useState(false); // true if user is a trip guest (not owner or companion)
  const [guestTripIds, setGuestTripIds] = useState([]); // array of trip IDs this guest has access to
  const [guestPermissions, setGuestPermissions] = useState({}); // { tripId: 'edit' | 'view' }
  const [guestEmail, setGuestEmail] = useState(''); // for guest modal input
  const [guestPermission, setGuestPermission] = useState('edit'); // for guest modal input

  // ========== UI STATE ==========
  const [showComingSoonMenu, setShowComingSoonMenu] = useState(false); // click-based dropdown
  const [showSectionDropdown, setShowSectionDropdown] = useState(false); // header nav dropdown
  const [showTypeFilterDropdown, setShowTypeFilterDropdown] = useState(false); // events type filter dropdown
  const [showFullMonthCalendar, setShowFullMonthCalendar] = useState(false); // week vs month toggle in Hub
  const [showAddNewMenu, setShowAddNewMenu] = useState(false); // home page add new menu

  // ========== CELEBRATION STATE ==========
  const [confetti, setConfetti] = useState(null); // { type: 'run' | 'week', x?, y? }
  const [weekCelebration, setWeekCelebration] = useState(null); // { weekNumber, eventName }

  // ========== COLOR OPTIONS FOR IMPORT MODAL ==========
  const tripColors = [
    { name: 'Ocean', gradient: 'from-teal-400 to-cyan-500' },
    { name: 'Sunset', gradient: 'from-orange-400 to-red-500' },
    { name: 'Lavender', gradient: 'from-purple-400 to-indigo-500' },
    { name: 'Rose', gradient: 'from-rose-400 to-pink-500' },
    { name: 'Amber', gradient: 'from-amber-400 to-orange-500' },
    { name: 'Emerald', gradient: 'from-green-400 to-emerald-500' },
    { name: 'Sky', gradient: 'from-blue-400 to-indigo-500' },
    { name: 'Coral', gradient: 'from-pink-500 to-purple-500' },
  ];
  tripColorsRef.current = tripColors;

  // Vibration helper - works on mobile devices
  const vibrate = (pattern) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  // Trigger run completion celebration (both completed together)
  const celebrateRunTogether = () => {
    vibrate(200); // Short buzz
    setConfetti({ type: 'run' });
    showToast('High Five! 🙌 You both crushed it!', 'success');
    setTimeout(() => setConfetti(null), 2000);
  };

  // Trigger week completion celebration (both completed all runs)
  const celebrateWeekComplete = (weekNumber, eventName) => {
    vibrate([200, 100, 200, 100, 400]); // Pattern: buzz-pause-buzz-pause-long buzz
    setConfetti({ type: 'week' });
    setWeekCelebration({ weekNumber, eventName });
    setTimeout(() => {
      setConfetti(null);
      setWeekCelebration(null);
    }, 4000);
  };

  // ========== FITNESS SECTION STATE ==========
  // Default fitness events. `status: 'completed'` => race is done; show as memorial.
  // The triathlon (Mike-only) lives in mikesfitness.app, not here.


  // Fitness seed data + training plan templates live in src/data/fitnessData.js

  // The triathlon plan lives in mikesfitness.app — removed from this app entirely.

  // Update refs for training plans (used by fitness hook)
  useEffect(() => {
    indyHalfTrainingPlanRef.current = indyHalfTrainingPlan;
    gsoHalfTrainingPlanRef.current = gsoHalfTrainingPlan;
  }, [indyHalfTrainingPlan, gsoHalfTrainingPlan]);

  // Generate generic training weeks for other events
  const generateTrainingWeeks = (startDate, eventDate, eventId) => {
    const weeks = [];
    const start = parseLocalDate(startDate);
    const end = parseLocalDate(eventDate);

    const firstMonday = new Date(start);
    firstMonday.setDate(start.getDate() - start.getDay() + 1);

    let currentWeek = new Date(firstMonday);
    let weekNumber = 1;

    while (currentWeek < end) {
      const weekStart = new Date(currentWeek);
      const weekEnd = new Date(currentWeek);
      weekEnd.setDate(weekEnd.getDate() + 6);

      weeks.push({
        id: `${eventId}-week-${weekNumber}`,
        weekNumber,
        startDate: toLocalDateStr(weekStart),
        endDate: toLocalDateStr(weekEnd),
        runs: [
          { id: 1, label: 'Short Run', distance: '', mike: false, adam: false, notes: '' },
          { id: 2, label: 'Medium Run', distance: '', mike: false, adam: false, notes: '' },
          { id: 3, label: 'Long Run', distance: '', mike: false, adam: false, notes: '' }
        ],
        crossTraining: [
          { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
          { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
        ],
        weekNotes: ''
      });

      currentWeek.setDate(currentWeek.getDate() + 7);
      weekNumber++;
    }

    // Add 2 recovery weeks after the event
    for (let i = 0; i < 2; i++) {
      const weekStart = new Date(currentWeek);
      const weekEnd = new Date(currentWeek);
      weekEnd.setDate(weekEnd.getDate() + 6);

      weeks.push({
        id: `${eventId}-recovery-${i + 1}`,
        weekNumber: weekNumber + i,
        startDate: toLocalDateStr(weekStart),
        endDate: toLocalDateStr(weekEnd),
        isRecovery: true,
        runs: [
          { id: 1, label: 'Short Run', distance: '', mike: false, adam: false, notes: '' },
          { id: 2, label: 'Medium Run', distance: '', mike: false, adam: false, notes: '' }
        ],
        crossTraining: [
          { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' }
        ],
        weekNotes: 'Recovery Week - Take it easy! 🌟'
      });

      currentWeek.setDate(currentWeek.getDate() + 7);
    }

    return weeks;
  };

  // Update refs for fitness hook dependencies
  useEffect(() => {
    generateTrainingWeeksRef.current = generateTrainingWeeks;
  }, [generateTrainingWeeks]);

  // Fitness state and operations now in useFitness hook
  // Modal form data
  const [newFitnessEventData, setNewFitnessEventData] = useState({
    name: '',
    emoji: '🏃',
    date: '',
    type: 'running', // running, half-marathon, marathon, triathlon, cycling, swimming, other
    url: '',
    trainingWeeks: 12,
    color: 'from-orange-400 to-red-500',
    description: '',
    participants: 'both', // 'mike', 'adam', 'both'
    location: '',
    coverImage: null
  });
  const [fitnessCoverImagePreview, setFitnessCoverImagePreview] = useState(null);
  const [uploadingFitnessCoverImage, setUploadingFitnessCoverImage] = useState(false);
  const fitnessCoverFileRef = useRef(null);
  const fitnessCoverCameraRef = useRef(null);
  // ========== END FITNESS SECTION STATE ==========

  // ========== EVENTS/PARTY SECTION STATE ==========
  const [partyEvents, setPartyEvents] = useState([]);
  const [selectedPartyEvent, setSelectedPartyEvent] = useState(null);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventViewMode, setEventViewMode] = useState('upcoming'); // legacy — kept for compat
  const [eventsSortAsc, setEventsSortAsc] = useState(true); // true = soonest first
  const [eventsTypeFilter, setEventsTypeFilter] = useState(null); // null | 'datenight' | 'travel' | 'fitness' | 'concert' | 'pride' | 'karaoke' | 'parties'
  const [newEventData, setNewEventData] = useState({
    name: '', emoji: '🎉', date: toLocalDateStr(new Date()), endDate: '', time: '18:00', endTime: '22:00',
    location: '', entryCode: '', description: '', color: 'from-amber-400 to-orange-500', tasks: [], eventType: 'parties',
    allDay: false, multiDay: false,
  });
  const [eventGuestEmail, setEventGuestEmail] = useState('');
  const [eventGuestPermission, setEventGuestPermission] = useState('edit');
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [swipeState, setSwipeState] = useState({ id: null, startX: 0, currentX: 0, swiping: false });
  const [uploadingToEventId, setUploadingToEventId] = useState(null);
  const [dragOverEventId, setDragOverEventId] = useState(null);
  const [eventCoverImagePreview, setEventCoverImagePreview] = useState(null);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [showEventEmojiPicker, setShowEventEmojiPicker] = useState(false);
  const [uploadingEventCoverImage, setUploadingEventCoverImage] = useState(false);
  const eventCoverFileRef = useRef(null);
  const eventCoverCameraRef = useRef(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  // ----- Message Guests (send an update / logistics note to RSVPs) -----
  const [showMessageModal, setShowMessageModal] = useState(false); // holds the event being messaged
  const [messageText, setMessageText] = useState('');
  const [messageFilter, setMessageFilter] = useState('today'); // 'today' | 'going' | 'all'
  const [messageSaving, setMessageSaving] = useState(false);
  const [messageCopied, setMessageCopied] = useState(false);
  const DEFAULT_LOGISTICS_NOTE = `Park in the lot outside of the building — the entry to the lot is on Church Street. The front door entry code is #2987. Take the elevator to the First floor — we're in Unit #110. See you soon! 💕`;
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [inviteLinkCopied, setInviteLinkCopied] = useState(null); // guestId whose link was copied
  const [showShareSheet, setShowShareSheet] = useState(null); // event object to share
  const [newListName, setNewListName] = useState('');
  const [newListEmoji, setNewListEmoji] = useState('🍕');
  const [newListItemText, setNewListItemText] = useState('');
  // ========== END EVENTS/PARTY SECTION STATE ==========

  // Use refs for companions and trips to avoid recreating auth listener when they change
  const companionsRef = useRef(companions);
  companionsRef.current = companions;
  const tripsRef = useRef(trips);
  tripsRef.current = trips;

  // Auth effect - listen for auth state changes (runs once, uses ref for companions)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMountedRef.current) return;

      if (firebaseUser) {
        setUser(firebaseUser);
        const userEmail = firebaseUser.email?.toLowerCase();

        // Check if user is an owner (Mike or Adam)
        const isOwnerUser = ownerEmails.some(email => userEmail?.includes(email.split('@')[0]));
        setIsOwner(isOwnerUser);

        if (isOwnerUser) {
          // Owner login
          const displayName = userEmail?.includes('mdulin') ? 'Mike' : 'Adam';
          setCurrentUser(displayName);
          setCurrentCompanion(null);
          setIsGuest(false);
          setGuestTripIds([]);
          setGuestPermissions({});
        } else {
          // Check if user is a companion (use ref to get latest companions)
          const matchedCompanion = companionsRef.current.find(c =>
            c.email?.toLowerCase() === userEmail
          );

          if (matchedCompanion) {
            setCurrentCompanion(matchedCompanion);
            setCurrentUser(matchedCompanion.firstName || matchedCompanion.name);
            setIsGuest(false);
            setGuestTripIds([]);
            setGuestPermissions({});
          } else {
            // Check if user is a trip guest (invited to specific trips)
            const currentTrips = tripsRef.current;
            const invitedTrips = [];
            const permissions = {};

            currentTrips.forEach(trip => {
              const guestMatch = (trip.guests || []).find(g =>
                g.email?.toLowerCase() === userEmail
              );
              if (guestMatch) {
                invitedTrips.push(trip.id);
                permissions[trip.id] = guestMatch.permission || 'view';
              }
            });

            if (invitedTrips.length > 0) {
              // User is a guest on one or more trips
              setIsGuest(true);
              setGuestTripIds(invitedTrips);
              setGuestPermissions(permissions);
              setCurrentUser(firebaseUser.displayName || 'Guest');
              setCurrentCompanion(null);
            } else {
              // Unknown user - no access
              setCurrentUser(firebaseUser.displayName || 'Guest');
              setCurrentCompanion(null);
              setIsGuest(false);
              setGuestTripIds([]);
              setGuestPermissions({});
            }
          }
        }
      } else {
        setUser(null);
        setCurrentCompanion(null);
        setIsOwner(false);
        setIsGuest(false);
        setGuestTripIds([]);
        setGuestPermissions({});
      }
      if (isMountedRef.current) setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []); // Empty dependency - listener created once, uses refs for current data

  // ── Push Notifications Setup ──
  // Check if notifications are already enabled on mount
  useEffect(() => {
    if (user && 'Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, [user]);

  // Listen for foreground messages when enabled
  useEffect(() => {
    if (!messaging || !notificationsEnabled) return;
    const unsub = onMessage(messaging, (payload) => {
      console.log('Foreground push:', payload);
      showToast(payload.data?.body || payload.notification?.body || 'New notification!', 'info');
    });
    return () => unsub();
  }, [notificationsEnabled]);

  const setNotifyPref = async (kind, value) => {
    const me = String(currentUser || 'mike').toLowerCase();
    try {
      await setDoc(doc(db, 'tripData', 'notifyPrefs'), { [me]: { [kind]: value } }, { merge: true });
    } catch (e) {
      console.error('Failed to save notification pref:', e);
      showToast('Could not save preference', 'error');
    }
  };

  const submitCheckin = async (entry) => {
    try {
      await setDoc(doc(db, 'tripData', 'checkins', 'entries', `${entry.week}-${entry.by}`), {
        ...entry,
        createdAt: new Date().toISOString(),
      });
      showToast('Check-in saved 💌', 'success');
    } catch (e) {
      console.error('checkin save failed:', e);
      showToast('Could not save check-in', 'error');
    }
  };

  const enableNotifications = async () => {
    if (!user) return;
    setNotificationsLoading(true);
    try {
      // Check basic support
      if (!('serviceWorker' in navigator) || !('Notification' in window)) {
        showToast('Add this app to your Home Screen first, then enable notifications', 'error');
        setNotificationsLoading(false);
        return;
      }

      // Register the FCM service worker
      const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        showToast('Notification permission denied. Check your browser settings.', 'error');
        setNotificationsLoading(false);
        return;
      }

      // Initialize messaging if not already done
      let msg = messaging;
      if (!msg) {
        try {
          const { getMessaging: getMsgLazy } = await import('firebase/messaging');
          msg = getMsgLazy(app);
        } catch (e) {
          console.error('FCM init failed:', e);
          showToast('Push notifications not supported on this device', 'error');
          setNotificationsLoading(false);
          return;
        }
      }

      // Get FCM token
      const token = await getToken(msg, {
        serviceWorkerRegistration: swReg,
      });

      if (token) {
        // Store token in Firestore under fcmTokens document
        const tokenData = {};
        const userKey = currentUser?.toLowerCase() || 'unknown';
        tokenData[userKey] = token;
        await setDoc(doc(db, 'tripData', 'fcmTokens'), tokenData, { merge: true });

        setNotificationsEnabled(true);
        showToast('Notifications enabled!', 'success');
      } else {
        showToast('Could not get notification token. Try adding the app to your Home Screen first.', 'error');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      showToast('Could not enable notifications: ' + error.message, 'error');
    }
    setNotificationsLoading(false);
  };

  const disableNotifications = () => {
    setNotificationsEnabled(false);
    showToast('Notifications paused', 'info');
  };

  // Re-check guest status when trips change (handles Firestore data loading after initial auth)
  useEffect(() => {
    if (!user || isOwner || currentCompanion) return; // Only check for non-owner, non-companion users

    const userEmail = user.email?.toLowerCase();
    if (!userEmail) return;

    const invitedTrips = [];
    const permissions = {};

    trips.forEach(trip => {
      const guestMatch = (trip.guests || []).find(g =>
        g.email?.toLowerCase() === userEmail
      );
      if (guestMatch) {
        invitedTrips.push(trip.id);
        permissions[trip.id] = guestMatch.permission || 'view';
      }
    });

    // Update guest status if it changed
    if (invitedTrips.length > 0) {
      setIsGuest(true);
      setGuestTripIds(invitedTrips);
      setGuestPermissions(permissions);
    } else if (isGuest) {
      // Was a guest but no longer invited to any trips
      setIsGuest(false);
      setGuestTripIds([]);
      setGuestPermissions({});
    }
  }, [trips, user, isOwner, currentCompanion, isGuest]);

  // Rotate travel quotes every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % travelQuotes.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Bouncing emoji animation - use ref to avoid recreating interval on every state change
  const bouncingEmojiRef = useRef(bouncingEmoji);
  bouncingEmojiRef.current = bouncingEmoji;

  useEffect(() => {
    if (!bouncingEmoji) return;

    const animate = () => {
      setBouncingEmoji(prev => {
        if (!prev) return null;
        let { x, y, dx, dy, emoji, ttl } = prev;

        // Bounce off walls
        if (x <= 0 || x >= window.innerWidth - 60) dx = -dx;
        if (y <= 0 || y >= window.innerHeight - 60) dy = -dy;

        // Update position
        x += dx;
        y += dy;
        ttl -= 1;

        // Stop after time-to-live expires
        if (ttl <= 0) return null;

        return { emoji, x, y, dx, dy, ttl };
      });
    };

    const interval = setInterval(animate, 16); // ~60fps
    return () => clearInterval(interval);
  }, [bouncingEmoji ? 'active' : 'inactive']); // Only restart when emoji becomes active/inactive

  const startBouncingEmoji = (emoji, startX, startY) => {
    // Random direction
    const angle = Math.random() * Math.PI * 2;
    const speed = 8;
    setBouncingEmoji({
      emoji,
      x: startX,
      y: startY,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      ttl: 180 // 3 seconds at 60fps
    });
  };

  // Firestore sync - load and listen for changes
  useEffect(() => {
    if (!user) return;

    setDataLoading(true);

    // Subscribe to trips collection
    const tripsUnsubscribe = onSnapshot(
      doc(db, 'tripData', 'shared'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.trips) setTrips(data.trips);
          if (data.wishlist) setWishlist(data.wishlist);
          if (data.tripDetails) setTripDetails(data.tripDetails);
          // Legacy memories array — only authoritative until migrated to the
          // tripData/shared/memories subcollection (Phase 2).
          if (data.memories && !data.memoriesMigratedAt) setMemories(data.memories);
          if (data.memories?.length && !data.memoriesMigratedAt && !migratingMemoriesRef.current) {
            migratingMemoriesRef.current = true;
            (async () => {
              try {
                let batch = writeBatch(db);
                let pending = 0;
                for (const m of data.memories) {
                  if (m?.id === undefined || m?.id === null) continue;
                  batch.set(doc(db, 'tripData', 'shared', 'memories', String(m.id)), JSON.parse(JSON.stringify(m)));
                  if (++pending >= 400) { await batch.commit(); batch = writeBatch(db); pending = 0; }
                }
                if (pending > 0) await batch.commit();
                await setDoc(doc(db, 'tripData', 'shared'), { memoriesMigratedAt: new Date().toISOString() }, { merge: true });
                console.log('[migration] memories → subcollection done:', data.memories.length);
              } catch (e) {
                console.error('[migration] memories failed (will retry next snapshot):', e);
                migratingMemoriesRef.current = false;
              }
            })();
          }
        }
        setDataLoading(false);
      },
      (error) => {
        console.error('Error loading data:', error);
        setDataLoading(false);
      }
    );

    // Subscribe to fitness collection.
    // Triathlon was removed from this app (lives in mikesfitness now). Defensive
    // filter strips it from persisted state so old Firestore data doesn't resurrect it.
    // Also merges hardcoded defaultFitnessEvents with persisted ones so newly-added
    // events appear immediately even if Firestore has only Indy. Cary 10K was
    // removed 2026-07-05 (skipping the race) — the filter strips it like the tri.
    // Persisted events that EXIST get fields from defaults patched in (status, location)
    // — defaults win for these "structural" fields since they're how we mark archived state.
    const fitnessUnsubscribe = onSnapshot(
      doc(db, 'tripData', 'fitness'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.events) {
            // Strip the legacy triathlon-2026 AND any Mike-only events seeded by
            // mikesfitness (owner: 'mike') — those don't belong in the couples app.
            const filtered = data.events.filter(e => e.id !== 'triathlon-2026' && e.id !== 'cary-10k-2026' && e.owner !== 'mike');
            const defaultsById = new Map(defaultFitnessEvents.map(e => [e.id, e]));
            // Patch persisted events with current defaults for status/location (defaults win).
            const patched = filtered.map(e => {
              const d = defaultsById.get(e.id);
              if (!d) return e;
              return {
                ...e,
                status: d.status ?? e.status,
                location: d.location ?? e.location,
                color: d.color ?? e.color,
                type: d.type ?? e.type,
                finishTime: d.finishTime ?? e.finishTime,
              };
            });
            const persistedIds = new Set(patched.map(e => e.id));
            const missingDefaults = defaultFitnessEvents.filter(e => !persistedIds.has(e.id));
            setFitnessEvents([...patched, ...missingDefaults]);
          }
          if (data.trainingPlans) {
            // Drop orphan plans from persisted state too (tri → mikesfitness; Cary 10K removed).
            const cleanedPlans = { ...data.trainingPlans };
            delete cleanedPlans['triathlon-2026'];
            delete cleanedPlans['cary-10k-2026'];
            // GSO Half re-planned 2026-07-05: purge a stale persisted copy (old plan's
            // week-1 short run was '3 mi'; the new plan's is '2 mi') so the updated
            // template takes effect. Safe — plan doesn't start until 8/2/26.
            const gsoW1 = (cleanedPlans['gso-half-2026'] || []).find(w => w.weekNumber === 1);
            if (gsoW1 && (gsoW1.runs || []).some(r => r.label === 'Short Run' && r.distance === '3 mi')) {
              delete cleanedPlans['gso-half-2026'];
            }
            setFitnessTrainingPlans(cleanedPlans);

            // One-time WRITE-BACK (2026-07-05): the filters above only cleaned
            // local state, so Firestore still carried the removed triathlon +
            // Cary 10K plans/events — and the coupleDigest cloud function reads
            // Firestore raw (it announced "Cary 10K race week"). Persist the
            // cleaned events/plans and seed the current GSO plan so the digest
            // and training triggers see the real schedule.
            const hadOrphans = !!(data.trainingPlans?.['triathlon-2026'] || data.trainingPlans?.['cary-10k-2026'] ||
              (data.events || []).some(e => e.id === 'triathlon-2026' || e.id === 'cary-10k-2026'));
            const needsGso = !cleanedPlans['gso-half-2026'];
            if ((hadOrphans || needsGso) && !fitnessCleanupRef.current) {
              fitnessCleanupRef.current = true;
              const cleanEvents = (data.events || [])
                .filter(e => e.id !== 'triathlon-2026' && e.id !== 'cary-10k-2026' && e.owner !== 'mike');
              const evIds = new Set(cleanEvents.map(e => e.id));
              const fullEvents = [...cleanEvents, ...defaultFitnessEvents.filter(e => !evIds.has(e.id))];
              // Direct updateDoc with deleteField(): setDoc merge DEEP-MERGES map
              // fields, so writing a plans object without the orphan keys never
              // actually removes them from Firestore.
              (async () => {
                try {
                  const updates = {
                    events: JSON.parse(JSON.stringify(fullEvents)),
                    lastUpdated: new Date().toISOString(),
                    updatedBy: 'cleanup', // not mike/adam → trainingActivity trigger stays quiet
                    'trainingPlans.triathlon-2026': deleteField(),
                    'trainingPlans.cary-10k-2026': deleteField(),
                  };
                  if (needsGso) updates['trainingPlans.gso-half-2026'] = JSON.parse(JSON.stringify(gsoHalfTrainingPlan));
                  await updateDoc(doc(db, 'tripData', 'fitness'), updates);
                  console.log('[cleanup] fitness doc cleaned (orphan plans deleted, GSO seeded)', { hadOrphans, needsGso });
                } catch (e) {
                  console.error('[cleanup] fitness write failed (will retry next load):', e);
                  fitnessCleanupRef.current = false;
                }
              })();
            }
          }
        }
      },
      (error) => {
        console.error('Error loading fitness data:', error);
      }
    );

    // Subscribe to party events collection
    const partyEventsUnsubscribe = onSnapshot(
      doc(db, 'tripData', 'partyEvents'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.events) setPartyEvents(data.events);
        }
        // Mark as loaded regardless of whether doc exists — safe to write now
        partyEventsLoadedRef.current = true;
      },
      (error) => {
        console.error('Error loading party events:', error);
      }
    );

    // Subscribe to shared hub (lists, tasks, ideas)
    const hubUnsubscribe = onSnapshot(
      doc(db, 'tripData', 'sharedHub'),
      (docSnap) => {
        const exists = docSnap.exists();
        const data = exists ? docSnap.data() : null;
        console.log('[hubSnapshot] fired', { exists, listsCount: data?.lists?.length, alreadyLoaded: hubDataLoadedRef.current });
        if (exists) {
          if (data.lists) setSharedLists(data.lists);
          // Legacy tasks array — only authoritative until migrated to the
          // tripData/sharedHub/tasks subcollection (Phase 2).
          if (data.tasks && !data.tasksMigratedAt) setSharedTasks(data.tasks);
          if (data.tasks?.length && !data.tasksMigratedAt && !migratingTasksRef.current) {
            migratingTasksRef.current = true;
            (async () => {
              try {
                let batch = writeBatch(db);
                let pending = 0;
                for (const t of data.tasks) {
                  if (t?.id === undefined || t?.id === null) continue;
                  // _migrated tells the taskAssigned cloud trigger to stay quiet
                  batch.set(doc(db, 'tripData', 'sharedHub', 'tasks', String(t.id)), JSON.parse(JSON.stringify({ ...t, _migrated: true })));
                  if (++pending >= 400) { await batch.commit(); batch = writeBatch(db); pending = 0; }
                }
                if (pending > 0) await batch.commit();
                await setDoc(doc(db, 'tripData', 'sharedHub'), { tasksMigratedAt: new Date().toISOString() }, { merge: true });
                console.log('[migration] tasks → subcollection done:', data.tasks.length);
              } catch (e) {
                console.error('[migration] tasks failed (will retry next snapshot):', e);
                migratingTasksRef.current = false;
              }
            })();
          }
          if (data.ideas) setSharedIdeas(data.ideas);
          if (data.social) setSharedSocial(data.social);
          if (data.goals) setSharedGoals(data.goals);
          if (data.odysseyPlans) setSharedOdysseyPlans(data.odysseyPlans);
        }
        hubDataLoadedRef.current = true;
      },
      (error) => {
        console.error('Error loading shared hub data:', error);
      }
    );

    // Weekly couple check-ins (kept forever).
    const checkinsUnsubscribe = onSnapshot(
      collection(db, 'tripData', 'checkins', 'entries'),
      (snap) => setCheckins(snap.docs.map((d) => d.data())),
      (e) => console.error('checkins listener:', e)
    );

    // Per-person notification preferences (read by the Cloud Functions).
    const notifyPrefsUnsubscribe = onSnapshot(
      doc(db, 'tripData', 'notifyPrefs'),
      (snap) => setNotifyPrefs(snap.exists() ? snap.data() : {}),
      (e) => console.error('notifyPrefs listener:', e)
    );

    // Shared calendar agenda written by mikeslife cron-couple-context.
    const calendarUnsubscribe = onSnapshot(
      doc(db, 'tripData', 'calendar'),
      (snap) => setCalendarAgenda(snap.exists() ? snap.data() : null),
      (e) => console.error('calendar agenda listener:', e)
    );

    // ── Subcollection listeners (Phase 2): once these have docs, they own state ──
    const memoriesColUnsubscribe = onSnapshot(
      collection(db, 'tripData', 'shared', 'memories'),
      (snap) => {
        if (snap.empty) return;
        const m = new Map();
        const sorter = (v) => Array.isArray(v) ? v.map(sorter) : (v && typeof v === 'object' ? Object.keys(v).sort().reduce((acc, k) => { acc[k] = sorter(v[k]); return acc; }, {}) : v);
        const items = snap.docs.map((d) => { m.set(d.id, JSON.stringify(sorter(d.data()))); return d.data(); });
        items.sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')) || String(a.id).localeCompare(String(b.id)));
        memoriesSyncRef.current = m;
        setMemories(items);
      },
      (e) => console.error('memories subcollection listener:', e)
    );
    const tasksColUnsubscribe = onSnapshot(
      collection(db, 'tripData', 'sharedHub', 'tasks'),
      (snap) => {
        if (snap.empty) return;
        const m = new Map();
        const sorter = (v) => Array.isArray(v) ? v.map(sorter) : (v && typeof v === 'object' ? Object.keys(v).sort().reduce((acc, k) => { acc[k] = sorter(v[k]); return acc; }, {}) : v);
        const items = snap.docs.map((d) => { m.set(d.id, JSON.stringify(sorter(d.data()))); return d.data(); });
        items.sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')) || String(a.id).localeCompare(String(b.id)));
        tasksSyncRef.current = m;
        setSharedTasks(items);
      },
      (e) => console.error('tasks subcollection listener:', e)
    );

    return () => {
      checkinsUnsubscribe();
      notifyPrefsUnsubscribe();
      calendarUnsubscribe();
      memoriesColUnsubscribe();
      tasksColUnsubscribe();
      tripsUnsubscribe();
      fitnessUnsubscribe();
      partyEventsUnsubscribe();
      hubUnsubscribe();
    };
  }, [user]);

  // Live guest sync: subscribe to each event's own /events/{id} doc so the host
  // sees RSVPs and public self-signups in real time. Guests can only write to
  // these per-event docs (not tripData), so this is the source of truth for the
  // guest list. We merge the fresh guest array back into local state for display.
  const partyEventIdsKey = partyEvents.map((e) => e.id).join(',');
  useEffect(() => {
    if (!user) return;
    const ids = partyEventIdsKey ? partyEventIdsKey.split(',') : [];
    if (ids.length === 0) return;

    const unsubs = ids.map((id) =>
      onSnapshot(doc(db, 'events', String(id)), (snap) => {
        if (!snap.exists()) return;
        const remote = snap.data();
        const remoteGuests = remote.guests || [];
        const mergeGuests = (ev) => {
          if (ev.id !== id) return ev;
          // Skip if unchanged to avoid needless re-renders.
          if (JSON.stringify(ev.guests || []) === JSON.stringify(remoteGuests)) return ev;
          return { ...ev, guests: remoteGuests };
        };
        setPartyEvents((prev) => prev.map(mergeGuests));
        setSelectedPartyEvent((prev) => (prev && prev.id === id ? mergeGuests(prev) : prev));
      }, (err) => console.error('Event guest sync error:', err))
    );

    return () => unsubs.forEach((u) => u());
  }, [user, partyEventIdsKey]);

  // Deep link handler — auto-open a Hub item when ?hub=type&id=itemId is in URL
  useEffect(() => {
    if (!pendingDeepLink || !hubDataLoadedRef.current) return;
    const { type, id } = pendingDeepLink;
    const numId = Number(id);

    const typeMap = {
      task: { data: sharedTasks, tab: 'tasks', open: setShowAddTaskModal },
      list: { data: sharedLists, tab: 'lists', open: setShowSharedListModal },
      idea: { data: sharedIdeas, tab: 'ideas', open: setShowAddIdeaModal },
      social: { data: sharedSocial, tab: 'social', open: setShowAddSocialModal },
      goal: { data: sharedGoals, tab: 'goals', open: setShowAddGoalModal },
    };

    const config = typeMap[type];
    if (!config) { setPendingDeepLink(null); return; }

    const item = config.data.find(i => i.id === numId);
    if (item) {
      setActiveSection('home');
      setHubSubView(config.tab);
      config.open(item);
      setPendingDeepLink(null);
    } else if (config.data.length > 0) {
      // Data loaded but item not found
      showToast('Item not found — it may have been deleted', 'info');
      setActiveSection('home');
      setHubSubView(config.tab);
      setPendingDeepLink(null);
    }
    // If data is still empty, wait for next render (Firebase may still be loading)
  }, [pendingDeepLink, sharedTasks, sharedLists, sharedIdeas, sharedSocial, sharedGoals]);

  // Compute visible open dates based on user role
  const visibleOpenDates = isOwner
    ? openDates // Owners see all dates
    : openDates.filter(od =>
        od.visibleTo.includes('all') ||
        (currentCompanion && od.visibleTo.includes(currentCompanion.id))
      );

  // Compute visible trips based on user role
  const visibleTrips = isOwner || currentCompanion
    ? trips // Owners and companions see all trips
    : isGuest
      ? trips.filter(trip => guestTripIds.includes(trip.id)) // Guests see only invited trips
      : []; // Unknown users see nothing

  // Helper to check if current user can edit a specific trip
  const canEditTrip = (tripId) => {
    if (isOwner) return true;
    if (currentCompanion) return false; // Companions are view-only for now
    if (isGuest) return guestPermissions[tripId] === 'edit';
    return false;
  };

  // Helper to check if current user can delete a trip (owners only)
  const canDeleteTrip = (tripId) => {
    return isOwner;
  };

  // ========== GOOGLE CALENDAR INTEGRATION ==========

  const GOOGLE_CLIENT_ID = '803115812045-l2r8qgijts7rp56shcdt422cl8kjfb62.apps.googleusercontent.com';
  const GOOGLE_API_KEY = 'AIzaSyB4pbBVj7Dryy3C57V2s6L4N_znGEyuib0';
  const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
  const [googleScriptsLoaded, setGoogleScriptsLoaded] = useState(false);

  // Load Google API scripts
  const loadGoogleScripts = () => {
    return new Promise((resolve, reject) => {
      const initGapiClient = () => {
        window.gapi.load('client', async () => {
          try {
            await window.gapi.client.init({
              apiKey: GOOGLE_API_KEY,
            });
            console.log('GAPI client initialized');
            resolve();
          } catch (err) {
            console.error('Failed to init gapi client:', err);
            reject(err);
          }
        });
      };

      if (!window.gapi) {
        // Load GAPI script
        const gapiScript = document.createElement('script');
        gapiScript.src = 'https://apis.google.com/js/api.js';
        gapiScript.onload = initGapiClient;
        gapiScript.onerror = () => reject(new Error('Failed to load GAPI'));
        document.body.appendChild(gapiScript);
      } else if (!window.gapi.client) {
        // GAPI loaded but client not initialized
        initGapiClient();
      } else {
        // Already fully initialized
        resolve();
      }
    });
  };

  // Initialize Google Identity Services
  const initGoogleCalendar = () => {
    return new Promise((resolve, reject) => {
      if (!window.google?.accounts?.oauth2) {
        const gisScript = document.createElement('script');
        gisScript.src = 'https://accounts.google.com/gsi/client';
        gisScript.onload = () => resolve();
        gisScript.onerror = () => reject(new Error('Failed to load Google Identity Services'));
        document.body.appendChild(gisScript);
      } else {
        resolve();
      }
    });
  };

  // Connect to Google Calendar
  const connectGoogleCalendar = async () => {
    setCalendarLoading(true);

    // Check if scripts are pre-loaded (Safari needs this to preserve user gesture)
    if (!googleScriptsLoaded) {
      try {
        // Quick load attempt - may break user gesture chain on Safari
        await loadGoogleScripts();
        await initGoogleCalendar();
      } catch (error) {
        console.error('Error loading Google scripts:', error);
        showToast('Failed to load Google Calendar. Please refresh and try again.', 'error');
        setCalendarLoading(false);
        return;
      }
    }

    try {
      // Create token client - this should happen synchronously after user click
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            console.error('OAuth error:', tokenResponse);
            showToast('Failed to connect to Google Calendar', 'error');
            setCalendarLoading(false);
            return;
          }

          try {
            // Set the access token on gapi client
            window.gapi.client.setToken({ access_token: tokenResponse.access_token });

            // Load the Calendar API discovery doc
            await window.gapi.client.load('https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest');

            // Fetch list of available calendars
            const calendarListResponse = await window.gapi.client.calendar.calendarList.list();
            const calendars = calendarListResponse.result.items || [];
            console.log('Loaded calendars:', calendars);
            setAvailableCalendars(calendars);

            // If multiple calendars, show picker; otherwise use primary
            if (calendars.length > 1) {
              setShowCalendarPicker(true);
              setCalendarLoading(false);
            } else {
              // Only one calendar, use it directly
              setCalendarConnected(true);
              await fetchGoogleCalendarEvents(calendars[0]?.id || 'primary');
              setCalendarLoading(false);
            }
          } catch (err) {
            console.error('Error after OAuth:', err);
            console.error('Error details:', JSON.stringify(err, null, 2));
            showToast('Failed to load calendars: ' + (err.message || err.result?.error?.message || 'Unknown error'), 'error');
            setCalendarLoading(false);
          }
        },
      });

      // Request access token - should work now that scripts are pre-loaded
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      // Provide helpful message for Safari users
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        showToast('Calendar popup may be blocked. Check Safari settings or try on desktop.', 'error');
      } else {
        showToast('Failed to connect to Google Calendar. Please try again.', 'error');
      }
      setCalendarLoading(false);
    }
  };

  // Select a calendar and fetch its events
  const selectCalendar = async (calendarId) => {
    setSelectedCalendarId(calendarId);
    setShowCalendarPicker(false);
    setCalendarConnected(true);
    setCalendarLoading(true);
    await fetchGoogleCalendarEvents(calendarId);
    setCalendarLoading(false);
  };

  // Fetch events from Google Calendar
  const fetchGoogleCalendarEvents = async (calendarId = null) => {
    setCalendarLoading(true);
    try {
      if (!window.gapi?.client?.calendar) {
        throw new Error('Google Calendar API not initialized');
      }

      const calId = calendarId || selectedCalendarId || 'primary';
      const now = new Date();
      const threeMonthsLater = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

      const response = await window.gapi.client.calendar.events.list({
        calendarId: calId,
        timeMin: now.toISOString(),
        timeMax: threeMonthsLater.toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 100,
        orderBy: 'startTime',
      });

      const events = response.result.items.map(event => ({
        id: event.id,
        title: event.summary || 'Untitled Event',
        description: event.description || '',
        location: event.location || '',
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        allDay: !event.start.dateTime,
        source: 'google',
        color: 'from-blue-400 to-indigo-500',
        htmlLink: event.htmlLink,
      }));

      setGoogleCalendarEvents(events);
      showToast(`Loaded ${events.length} events from Google Calendar`, 'success');
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error);
      showToast('Failed to fetch calendar events', 'error');
    } finally {
      setCalendarLoading(false);
    }
  };

  // Import Google Calendar event as trip, event, or memory
  const importGoogleEvent = (googleEvent, settings) => {
    const { type, color, customName } = settings;
    const eventName = customName || googleEvent.title;

    if (type === 'travel') {
      const newTrip = {
        id: `trip-${Date.now()}`,
        destination: eventName,
        emoji: '✈️',
        dates: {
          start: googleEvent.start.split('T')[0],
          end: googleEvent.end.split('T')[0],
        },
        color: color,
        accent: 'bg-teal-500',
        special: googleEvent.description,
        status: 'upcoming',
        guests: [],
        coverImage: '', // Can be added later
      };
      setTrips(prev => [...prev, newTrip]);
      saveToFirestore([...trips, newTrip], wishlist, tripDetails);
      showToast(`Added "${eventName}" as a trip!`, 'success');
    } else if (type === 'event') {
      const eventTypeEmojis = { parties: '🎉', travel: '✈️', datenight: '🥂', concert: '🎵', fitness: '🏆', pride: '🏳️‍🌈', karaoke: '🎤' };
      const newEvent = {
        id: `event-${Date.now()}`,
        name: eventName,
        emoji: eventTypeEmojis[settings.eventType] || '🎉',
        date: googleEvent.start.split('T')[0],
        time: googleEvent.start.includes('T') ? googleEvent.start.split('T')[1].substring(0, 5) : '',
        location: googleEvent.location,
        description: googleEvent.description,
        color: color,
        eventType: settings.eventType || 'parties',
        guests: [],
        tasks: [],
        photos: [],
        coverImage: '',
        isPublic: true,
      };
      setPartyEvents(prev => [...prev, newEvent]);
      savePartyEventsToFirestore([...partyEvents, newEvent]);
      showToast(`Added "${eventName}" as an event!`, 'success');
    } else if (type === 'memory') {
      const newMemory = {
        id: `memory-${Date.now()}`,
        title: eventName,
        date: googleEvent.start.split('T')[0],
        category: 'Milestone',
        description: googleEvent.description,
        location: googleEvent.location,
        photos: [],
        isSpecial: false,
      };
      setMemories(prev => [...prev, newMemory]);
      saveMemoriesToFirestore([...memories, newMemory]);
      showToast(`Added "${eventName}" as a memory!`, 'success');
    }

    setShowImportModal(null);
    // Reset custom name for next import
    setImportSettings(prev => ({ ...prev, customName: '' }));
  };

  // Get all calendar events (trips + events + google)
  const getAllCalendarEvents = () => {
    const allEvents = [];

    // Add trips
    trips.forEach(trip => {
      if (trip.dates?.start) {
        allEvents.push({
          id: trip.id,
          title: `${trip.emoji} ${trip.destination}`,
          start: trip.dates.start,
          end: trip.dates.end,
          type: 'travel',
          color: trip.color || 'from-teal-400 to-cyan-500',
          data: trip,
        });
      }
    });

    // Add party events
    partyEvents.forEach(event => {
      if (event.date) {
        allEvents.push({
          id: event.id,
          title: `${event.emoji || '🎉'} ${event.name || event.title || 'Event'}`,
          start: event.date,
          // Multi-day events span a range; honor any event with an endDate
          end: (event.endDate && event.endDate !== event.date) ? event.endDate : event.date,
          type: 'event',
          color: event.color || 'from-amber-400 to-orange-500',
          data: event,
        });
      }
    });

    // Add Google Calendar events
    googleCalendarEvents.forEach(event => {
      const startDateStr = event.start.split('T')[0];
      let endDateStr = event.end.split('T')[0];

      // For all-day events, Google uses exclusive end dates, so we need to subtract 1 day
      if (event.allDay) {
        const endDate = parseLocalDate(endDateStr);
        endDate.setDate(endDate.getDate() - 1);
        endDateStr = toLocalDateStr(endDate);
      }

      allEvents.push({
        id: event.id,
        title: event.title,
        start: startDateStr,
        end: endDateStr,
        type: 'google',
        color: 'from-blue-400 to-indigo-500',
        data: event,
      });
    });

    return allEvents.sort((a, b) => new Date(a.start) - new Date(b.start));
  };

  // Deep-strip undefined values to prevent Firestore errors
  const stripUndefined = useCallback((obj) => JSON.parse(JSON.stringify(obj)), []);

  // ── Subcollection sync machinery (Phase 2, 2026-07-05) ──
  // Memories live in tripData/shared/memories/{id}; tasks in
  // tripData/sharedHub/tasks/{id}. The old whole-array saves are diff-synced
  // into per-item docs so simultaneous edits by Mike + Adam can't clobber
  // each other, and the parent docs stay small (1MB doc limit).
  const memoriesSyncRef = useRef(new Map()); // id -> stable JSON of last-known doc
  const tasksSyncRef = useRef(new Map());
  const migratingMemoriesRef = useRef(false);
  const migratingTasksRef = useRef(false);
  const fitnessCleanupRef = useRef(false);

  // Stable stringify (sorted keys) so Firestore key reordering doesn't
  // register as a difference.
  const stableJson = useCallback((obj) => {
    const sorter = (v) => {
      if (Array.isArray(v)) return v.map(sorter);
      if (v && typeof v === 'object') {
        return Object.keys(v).sort().reduce((acc, k) => { acc[k] = sorter(v[k]); return acc; }, {});
      }
      return v;
    };
    return JSON.stringify(sorter(obj));
  }, []);

  // Diff-sync an array of {id, ...} items into a 3-segment subcollection.
  // Only writes docs that changed; deletes docs that disappeared.
  const diffSyncCollection = useCallback(async (seg1, seg2, seg3, items, syncRef) => {
    const colRef = collection(db, seg1, seg2, seg3);
    const prev = syncRef.current;
    const next = new Map();
    let batch = writeBatch(db);
    let pending = 0;
    const commit = async () => { if (pending > 0) { await batch.commit(); batch = writeBatch(db); pending = 0; } };
    for (const item of items) {
      if (item?.id === undefined || item?.id === null) continue;
      const id = String(item.id);
      const clean = stripUndefined({ ...item });
      const json = stableJson(clean);
      next.set(id, json);
      if (prev.get(id) !== json) {
        batch.set(doc(colRef, id), clean);
        if (++pending >= 400) await commit();
      }
    }
    for (const id of prev.keys()) {
      if (!next.has(id)) {
        batch.delete(doc(colRef, id));
        if (++pending >= 400) await commit();
      }
    }
    await commit();
    syncRef.current = next;
  }, [stripUndefined, stableJson]);

  // Save to Firestore whenever data changes
  const saveToFirestore = useCallback(async (newTrips, newWishlist, newTripDetails, newMemories) => {
    if (!user) return;

    try {
      const updates = { lastUpdated: new Date().toISOString(), updatedBy: currentUser || 'unknown' };
      if (newTrips !== null && newTrips !== undefined) updates.trips = newTrips;
      if (newWishlist !== null && newWishlist !== undefined) updates.wishlist = newWishlist;
      if (newTripDetails !== null && newTripDetails !== undefined) updates.tripDetails = newTripDetails;
      if (newMemories !== null && newMemories !== undefined) updates.memories = newMemories;
      await setDoc(doc(db, 'tripData', 'shared'), stripUndefined(updates), { merge: true });
      showToast('Changes saved', 'success');
    } catch (error) {
      console.error('Error saving to Firestore:', error);
      showToast('Failed to save changes. Please try again.', 'error');
    }
  }, [user, currentUser, showToast]);

  // Save memories to Firestore
  const saveMemoriesToFirestore = useCallback(async (newMemories) => {
    if (!user) return;
    try {
      // Per-doc diff sync into tripData/shared/memories (Phase 2 model).
      await diffSyncCollection('tripData', 'shared', 'memories', newMemories, memoriesSyncRef);
      await setDoc(doc(db, 'tripData', 'shared'), {
        memoriesMigratedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        updatedBy: currentUser
      }, { merge: true });
    } catch (error) {
      // Fallback: legacy whole-array write (covers the window before the
      // updated Firestore rules that allow subcollections are deployed).
      console.error('Memories subcollection sync failed, falling back to array:', error);
      try {
        await setDoc(doc(db, 'tripData', 'shared'), {
          memories: newMemories,
          lastUpdated: new Date().toISOString(),
          updatedBy: currentUser
        }, { merge: true });
      } catch (e2) {
        console.error('Error saving memories to Firestore:', e2);
        showToast('Failed to save memory. Please try again.', 'error');
      }
    }
  }, [user, currentUser, showToast, diffSyncCollection]);

  // ── Memory reactions + comments (Phase 3 feed) ──
  const reactToMemory = useCallback((memoryId, emoji) => {
    const me = String(currentUser || 'mike').toLowerCase();
    setMemories(prev => {
      const next = prev.map(m => {
        if (m.id !== memoryId) return m;
        const reactions = { ...(m.reactions || {}) };
        if (reactions[me] === emoji) delete reactions[me]; else reactions[me] = emoji;
        return { ...m, reactions };
      });
      saveMemoriesToFirestore(next);
      return next;
    });
  }, [currentUser, saveMemoriesToFirestore]);

  const commentOnMemory = useCallback((memoryId, text) => {
    const trimmed = String(text || '').trim();
    if (!trimmed) return;
    const me = String(currentUser || 'mike').toLowerCase();
    setMemories(prev => {
      const next = prev.map(m => m.id === memoryId
        ? { ...m, comments: [...(m.comments || []), { by: me, at: new Date().toISOString(), text: trimmed }] }
        : m);
      saveMemoriesToFirestore(next);
      return next;
    });
  }, [currentUser, saveMemoriesToFirestore]);

  // ── Hub "Today together" snapshot (Phase 3) ──
  const todaySnapshot = useMemo(() => {
    const today = toLocalDateStr();
    const runsToday = [];
    for (const ev of fitnessEvents) {
      if (ev.status === 'completed') continue;
      const plan = fitnessTrainingPlans[ev.id] ||
        (ev.id === 'indy-half-2026' ? indyHalfTrainingPlan : ev.id === 'gso-half-2026' ? gsoHalfTrainingPlan : null);
      const week = (plan || []).find(w => w.startDate <= today && today <= w.endDate);
      if (!week) continue;
      for (const r of week.runs || []) {
        if (!(r.mike && ('adam' in r ? r.adam : true))) {
          runsToday.push({ event: ev.name, weekNumber: week.weekNumber, label: r.label, distance: r.distance, mike: !!r.mike, adam: !!r.adam });
        }
      }
    }
    const tasksDueToday = sharedTasks.filter(t => t.status !== 'done' &&
      ((t.dueDate && t.dueDate <= today) || t.timeHorizon === 'today'));
    const nextEvent = [...partyEvents].filter(e => e.date && e.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0] || null;
    const nextTrip = [...trips].filter(t => (t.dates?.start || t.start) && (t.dates?.start || t.start) >= today)
      .sort((a, b) => (a.dates?.start || a.start).localeCompare(b.dates?.start || b.start))[0] || null;
    const latestMemory = [...memories].filter(m => m.date).sort((a, b) => String(b.date).localeCompare(String(a.date)))[0] || null;
    return { today, runsToday, tasksDueToday, nextEvent, nextTrip, latestMemory };
  }, [fitnessEvents, fitnessTrainingPlans, sharedTasks, partyEvents, trips, memories]);

  // Save fitness data to Firestore
  const saveFitnessToFirestore = useCallback(async (newEvents, newTrainingPlans) => {
    if (!user) return;

    try {
      const updates = { lastUpdated: new Date().toISOString(), updatedBy: currentUser || 'unknown' };
      if (newEvents !== null && newEvents !== undefined) updates.events = newEvents;
      if (newTrainingPlans !== null && newTrainingPlans !== undefined) updates.trainingPlans = newTrainingPlans;
      await setDoc(doc(db, 'tripData', 'fitness'), stripUndefined(updates), { merge: true });
    } catch (error) {
      console.error('Error saving fitness to Firestore:', error);
      showToast('Failed to save fitness data. Please try again.', 'error');
    }
  }, [user, currentUser, showToast]);

  // Update the ref so the hook can use the actual saveFitnessToFirestore function
  useEffect(() => {
    saveFitnessRef.current = saveFitnessToFirestore;
  }, [saveFitnessToFirestore]);

  // Save a single event to its own Firestore doc (for guest access)
  const saveEventDoc = useCallback(async (event) => {
    if (!event?.id) return;
    try {
      await setDoc(doc(db, 'events', String(event.id)), {
        ...event,
        lastUpdated: new Date().toISOString(),
        updatedBy: currentUser || 'system'
      }, { merge: true });
    } catch (error) {
      console.error('Error saving event doc:', error);
    }
  }, [currentUser]);

  // Save party/social events to Firestore (legacy + individual docs)
  // Guard to prevent save-before-load races (mobile cold-start could otherwise wipe events)
  const partyEventsLoadedRef = useRef(false);

  const savePartyEventsToFirestore = useCallback(async (newEvents) => {
    if (!user) throw new Error('not-authenticated');
    // Don't save until Firebase has loaded the existing events — prevents overwriting with a near-empty array
    if (!partyEventsLoadedRef.current) {
      console.warn('savePartyEventsToFirestore blocked: party events not yet loaded from Firebase');
      showToast('Still syncing — please wait a moment and try again.', 'warning');
      throw new Error('not-loaded');
    }

    try {
      const updates = { lastUpdated: new Date().toISOString(), updatedBy: currentUser || 'unknown' };
      if (newEvents !== null && newEvents !== undefined) updates.events = newEvents;
      await setDoc(doc(db, 'tripData', 'partyEvents'), stripUndefined(updates), { merge: true });

      // Also save each event as its own document for guest access
      if (newEvents) {
        for (const event of newEvents) {
          await saveEventDoc(event);
        }
      }
    } catch (error) {
      console.error('Error saving party events to Firestore:', error);
      showToast('Failed to save event. Please try again.', 'error');
      throw error;
    }
  }, [user, currentUser, showToast, saveEventDoc]);

  // ========== AUTO-CREATE MEMORIES FROM PAST EVENTS ==========
  const autoMemoriesCreatedRef = useRef(false);

  useEffect(() => {
    if (dataLoading || autoMemoriesCreatedRef.current) return;
    if (!trips.length && !partyEvents.length) return;

    const today = new Date();
    const todayStr = toLocalDateStr(today);
    const newMemories = [];

    // Check past trips
    trips.forEach(trip => {
      if (!trip.dates?.end || trip.isPlanning) return;
      if (trip.dates.end >= todayStr) return; // not past yet
      // Check if memory already exists for this trip
      const alreadyExists = memories.some(m => m.sourceId === trip.id && m.sourceType === 'trip');
      if (alreadyExists) return;

      const photos = tripDetails[trip.id]?.photos?.map(p => p.url || p).filter(Boolean) || [];
      const coverImg = trip.coverImage;
      const allImages = coverImg ? [coverImg, ...photos] : photos;

      newMemories.push({
        id: `memory-auto-${trip.id}-${Date.now()}`,
        title: trip.destination,
        date: trip.dates.end,
        category: 'travel',
        icon: trip.emoji || '✈️',
        location: trip.destination,
        description: `Our trip to ${trip.destination}`,
        images: allImages,
        image: allImages[0] || '',
        sourceType: 'trip',
        sourceId: trip.id,
        autoCreated: true,
      });
    });

    // Check past events
    partyEvents.forEach(event => {
      if (!event.date || event.date >= todayStr) return;
      const alreadyExists = memories.some(m => m.sourceId === event.id && m.sourceType === 'event');
      if (alreadyExists) return;

      const eventImages = event.images || [];
      const coverImg = event.coverImage;
      const allImages = coverImg ? [coverImg, ...eventImages] : eventImages;

      newMemories.push({
        id: `memory-auto-${event.id}-${Date.now()}`,
        title: event.name,
        date: event.date,
        category: event.eventType || 'parties',
        icon: event.emoji || '🎉',
        location: event.location || '',
        description: event.description || '',
        images: allImages,
        image: allImages[0] || '',
        sourceType: 'event',
        sourceId: event.id,
        autoCreated: true,
      });
    });

    if (newMemories.length > 0) {
      const updatedMemories = [...memories, ...newMemories];
      setMemories(updatedMemories);
      saveMemoriesToFirestore(updatedMemories);
    }

    autoMemoriesCreatedRef.current = true;
  }, [dataLoading, trips, partyEvents, memories, tripDetails, saveMemoriesToFirestore]);

  // ========== SHARED HUB SAVE & CRUD ==========

  const saveSharedHub = useCallback(async (newLists, newTasks, newIdeas, newSocial, newGoals, newOdysseyPlans) => {
    console.log('[saveSharedHub] called', { hasUser: !!user, isLoaded: hubDataLoadedRef.current, listsCount: newLists?.length });
    if (!user) { console.warn('[saveSharedHub] no user, returning'); return; }
    if (!hubDataLoadedRef.current) {
      console.log('[saveSharedHub] waiting for snapshot...');
      for (let i = 0; i < 200; i++) {
        if (hubDataLoadedRef.current) break;
        await new Promise(r => setTimeout(r, 50));
      }
      if (!hubDataLoadedRef.current) {
        console.warn('[saveSharedHub] snapshot still not loaded after 10s, proceeding');
      } else {
        console.log('[saveSharedHub] snapshot loaded, proceeding');
      }
    }
    try {
      // Only write the fields that were explicitly passed (non-null)
      // This prevents stale closure values from overwriting other fields
      const updates = { lastUpdated: new Date().toISOString(), updatedBy: currentUser || 'unknown' };
      if (newLists !== null && newLists !== undefined) updates.lists = newLists;
      if (newTasks !== null && newTasks !== undefined) {
        try {
          // Per-doc diff sync into tripData/sharedHub/tasks (Phase 2 model).
          await diffSyncCollection('tripData', 'sharedHub', 'tasks', newTasks, tasksSyncRef);
          updates.tasksMigratedAt = new Date().toISOString();
        } catch (e) {
          // Rules not deployed yet? Fall back to the legacy array so nothing is lost.
          console.error('Tasks subcollection sync failed, falling back to array:', e);
          updates.tasks = newTasks;
        }
      }
      if (newIdeas !== null && newIdeas !== undefined) updates.ideas = newIdeas;
      if (newSocial !== null && newSocial !== undefined) updates.social = newSocial;
      if (newGoals !== null && newGoals !== undefined) updates.goals = newGoals;
      if (newOdysseyPlans !== null && newOdysseyPlans !== undefined) updates.odysseyPlans = newOdysseyPlans;
      console.log('[saveSharedHub] writing setDoc', { keys: Object.keys(updates) });
      await setDoc(doc(db, 'tripData', 'sharedHub'), stripUndefined(updates), { merge: true });
      console.log('[saveSharedHub] setDoc complete');
    } catch (error) {
      console.error('[saveSharedHub] setDoc error', error);
      console.error('Error saving shared hub:', error);
      showToast('Failed to save. Please try again.', 'error');
    }
  }, [user, currentUser, showToast, diffSyncCollection]);

  // Update the ref so the hook can use the actual saveSharedHub function
  useEffect(() => {
    saveSharedHubRef.current = saveSharedHub;
  }, [saveSharedHub]);

  // Task CRUD
  // ===== All task/list/idea/social/habit CRUD ops now in useSharedHub hook =====

  const promoteIdeaToTask = (idea) => {
    setShowAddIdeaModal(null);
    setShowAddTaskModal({
      title: idea.title,
      description: idea.description || '',
      linkedTo: { section: 'idea', itemId: idea.id },
      _prefill: true,
    });
    // Mark idea as planned
    updateIdea(idea.id, { status: 'planned' });
  };


  const getEventLabel = (eventId) => {
    if (!eventId) return null;
    const evt = partyEvents.find(e => String(e.id) === String(eventId));
    return evt ? evt.name : null;
  };

  const navigateToEvent = (eventId) => {
    setActiveSection('events');
  };


  // ── Search functions ──
  const getSearchResults = useCallback(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return { tasks: [], lists: [], ideas: [], social: [], goals: [], travel: [], events: [], fitness: [], memories: [] };
    const r = { tasks: [], lists: [], ideas: [], social: [], goals: [], travel: [], events: [], fitness: [], memories: [] };
    if (searchFilters.tasks) {
      r.tasks = sharedTasks.filter(t =>
        t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || t.tags?.some(tg => tg.toLowerCase().includes(q))
      ).slice(0, 8);
    }
    if (searchFilters.lists) {
      r.lists = sharedLists.filter(l =>
        l.name?.toLowerCase().includes(q) || l.items?.some(i => i.text?.toLowerCase().includes(q))
      ).slice(0, 8);
    }
    if (searchFilters.ideas) {
      r.ideas = sharedIdeas.filter(i =>
        i.title?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q) || i.tags?.some(tg => tg.toLowerCase().includes(q))
      ).slice(0, 8);
    }
    if (searchFilters.social) {
      r.social = sharedSocial.filter(s =>
        s.person?.toLowerCase().includes(q) || s.title?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)
      ).slice(0, 8);
    }
    if (searchFilters.goals) {
      r.goals = sharedGoals.filter(g =>
        g.title?.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q) || g.milestones?.some(m => m.text?.toLowerCase().includes(q))
      ).slice(0, 8);
    }
    if (searchFilters.travel) {
      r.travel = trips.filter(t =>
        t.destination?.toLowerCase().includes(q) || t.special?.toLowerCase().includes(q)
      ).slice(0, 8);
    }
    if (searchFilters.events) {
      r.events = partyEvents.filter(e =>
        e.name?.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q)
      ).slice(0, 8);
    }
    if (searchFilters.fitness) {
      r.fitness = fitnessEvents.filter(f =>
        f.name?.toLowerCase().includes(q) || f.type?.toLowerCase().includes(q)
      ).slice(0, 8);
    }
    if (searchFilters.memories) {
      r.memories = memories.filter(m =>
        m.title?.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q) || m.location?.toLowerCase().includes(q)
      ).slice(0, 8);
    }
    return r;
  }, [searchQuery, searchFilters, sharedTasks, sharedLists, sharedIdeas, sharedSocial, sharedGoals, trips, partyEvents, fitnessEvents, memories]);

  const searchResults = searchQuery.trim() ? getSearchResults() : { tasks: [], lists: [], ideas: [], social: [], goals: [], travel: [], events: [], fitness: [], memories: [] };
  const totalSearchResults = Object.values(searchResults).reduce((sum, arr) => sum + arr.length, 0);

  const handleSearchResultClick = (type, itemId) => {
    setShowSearch(false);
    setSearchQuery('');
    setSearchHighlightId({ type, id: itemId });
    if (['tasks', 'lists', 'ideas', 'social', 'goals'].includes(type)) {
      setActiveSection('home');
      setHubSubView(type);
    } else {
      setActiveSection(type === 'travel' ? 'travel' : type === 'events' ? 'events' : type === 'fitness' ? 'fitness' : 'memories');
    }
  };

  // Scroll to and highlight the search result after navigation
  useEffect(() => {
    if (!searchHighlightId) return;
    const timer = setTimeout(() => {
      const el = document.querySelector(`[data-search-id="${searchHighlightId.type}-${searchHighlightId.id}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('search-highlight-pulse');
        setTimeout(() => {
          el.classList.remove('search-highlight-pulse');
          setSearchHighlightId(null);
        }, 2500);
      } else {
        setSearchHighlightId(null);
      }
    }, 300); // delay to let section render
    return () => clearTimeout(timer);
  }, [searchHighlightId, activeSection, hubSubView]);

  // Get linked item label for display
  const getLinkedLabel = (linkedTo) => {
    if (!linkedTo) return null;
    switch (linkedTo.section) {
      case 'travel':
      case 'trips': {
        const trip = trips.find(t => t.id === linkedTo.itemId);
        return trip ? `✈️ ${trip.destination}` : null;
      }
      case 'fitness':
      case 'fitnessEvents': {
        const event = fitnessEvents.find(e => e.id === linkedTo.itemId);
        return event ? `🏃 ${event.name}` : null;
      }
      case 'events':
      case 'partyEvents': {
        const event = partyEvents.find(e => e.id === linkedTo.itemId);
        return event ? `🎉 ${event.name}` : null;
      }
      case 'idea': {
        const idea = sharedIdeas.find(i => i.id === linkedTo.itemId);
        return idea ? `💡 ${idea.title}` : null;
      }
      default: return null;
    }
  };

  // Get linked Hub items (tasks, lists) for a given section card
  const getLinkedHubItems = (section, itemId) => {
    const matchSection = (s) => {
      if (section === 'travel') return s === 'travel' || s === 'trips';
      if (section === 'fitness') return s === 'fitness' || s === 'fitnessEvents';
      if (section === 'events') return s === 'events' || s === 'partyEvents';
      return s === section;
    };
    const linkedTasks = (sharedTasks || []).filter(t => t.linkedTo && matchSection(t.linkedTo.section) && t.linkedTo.itemId === itemId);
    const linkedLists = (sharedLists || []).filter(l => l.linkedTo && matchSection(l.linkedTo.section) && l.linkedTo.itemId === itemId);
    return { linkedTasks, linkedLists };
  };

  // Navigate to a linked section item
  const navigateToLinked = (linkedTo) => {
    if (!linkedTo) return;
    const sectionMap = { travel: 'travel', trips: 'travel', fitness: 'fitness', fitnessEvents: 'fitness', events: 'events', partyEvents: 'events', idea: 'home' };
    const section = sectionMap[linkedTo.section];
    if (section) {
      setActiveSection(section);
      if (section === 'travel') {
        const trip = trips.find(t => t.id === linkedTo.itemId);
        if (trip) setSelectedTrip(trip);
      } else if (section === 'fitness') {
        const event = fitnessEvents.find(e => e.id === linkedTo.itemId);
        if (event) setSelectedFitnessEvent(event);
      } else if (section === 'events') {
        const event = partyEvents.find(e => e.id === linkedTo.itemId);
        if (event) setSelectedPartyEvent(event);
      }
    }
  };

  // Update a workout (run or cross-training)
  const updateWorkout = async (eventId, weekId, workoutType, workoutId, updates) => {
    if (!eventId || !weekId) return;

    const newPlans = { ...fitnessTrainingPlans };

    // Initialize plan from hardcoded template if Firestore doesn't have one yet.
    if (!newPlans[eventId]) {
      const template = (
        eventId === 'indy-half-2026' ? indyHalfTrainingPlan :
        eventId === 'gso-half-2026' ? gsoHalfTrainingPlan :
        null
      );
      if (template) {
        newPlans[eventId] = JSON.parse(JSON.stringify(template));
      } else {
        return; // Can't update non-existent plan
      }
    }

    // Get current workout state before update
    // Find week by id OR weekNumber (for backwards compatibility)
    const weekIdStr = String(weekId);
    const weekIdNum = weekIdStr.includes('week-') ? parseInt(weekIdStr.split('week-')[1]) : null;
    const findWeek = (w) => w.id === weekId || (weekIdNum && w.weekNumber === weekIdNum);

    const currentWeek = newPlans[eventId].find(findWeek);
    const currentWorkout = currentWeek?.[workoutType]?.find(w => w.id === workoutId);
    // For Mike-only plans (no adam field), consider complete when mike is done
    const isMikeOnlyPlan = currentWorkout && !('adam' in currentWorkout);
    const wasCompletedTogether = isMikeOnlyPlan ? currentWorkout?.mike : (currentWorkout?.mike && currentWorkout?.adam);

    // Check if all runs were complete before this update
    const wereAllRunsComplete = currentWeek?.runs?.every(r =>
      ('adam' in r) ? (r.mike && r.adam) : r.mike
    );

    newPlans[eventId] = newPlans[eventId].map(week => {
      if (!findWeek(week)) return week;

      const updatedWorkouts = week[workoutType].map(workout =>
        workout.id === workoutId ? { ...workout, ...updates } : workout
      );

      // Ensure the week has proper id for future lookups
      return { ...week, [workoutType]: updatedWorkouts, id: weekId };
    });

    // Get updated state
    const updatedWeek = newPlans[eventId].find(findWeek);
    const updatedWorkout = updatedWeek?.[workoutType]?.find(w => w.id === workoutId);
    const isNowCompletedTogether = isMikeOnlyPlan ? updatedWorkout?.mike : (updatedWorkout?.mike && updatedWorkout?.adam);

    // Check if all runs are now complete
    const areAllRunsNowComplete = updatedWeek?.runs?.every(r =>
      ('adam' in r) ? (r.mike && r.adam) : r.mike
    );

    setFitnessTrainingPlans(newPlans);
    await saveFitnessToFirestore(null, newPlans);

    // Trigger celebrations (only for runs, not cross-training)
    if (workoutType === 'runs') {
      // Week completion takes priority over single run
      if (!wereAllRunsComplete && areAllRunsNowComplete) {
        const event = fitnessEvents.find(e => e.id === eventId);
        celebrateWeekComplete(updatedWeek.weekNumber, event?.name || 'Training');
      } else if (!wasCompletedTogether && isNowCompletedTogether) {
        // Single run completed together
        celebrateRunTogether();
      }
    }
  };

  // Initialize training plan for an event
  const initializeTrainingPlan = async (eventId) => {
    const event = fitnessEvents.find(e => e.id === eventId);
    if (!event) return;

    // Use hardcoded plan when one exists; deep clone to avoid template mutation.
    let weeks;
    if (eventId === 'indy-half-2026') {
      weeks = JSON.parse(JSON.stringify(indyHalfTrainingPlan));
    } else if (eventId === 'gso-half-2026') {
      weeks = JSON.parse(JSON.stringify(gsoHalfTrainingPlan));
    } else {
      const today = toLocalDateStr();
      weeks = generateTrainingWeeks(today, event.date, eventId);
    }

    const newPlans = { ...fitnessTrainingPlans, [eventId]: weeks };
    setFitnessTrainingPlans(newPlans);
    await saveFitnessToFirestore(null, newPlans);
  };

  // Get the active training plan for an event - uses hardcoded plans as base
  // but merges all changes (completion status, edits, new activities) from Firebase
  const getActiveTrainingPlan = (eventId) => {
    // Helper to merge Firebase data into hardcoded plan
    const mergeWithFirebase = (hardcodedPlan) => {
      const firebasePlan = fitnessTrainingPlans[eventId];
      if (!firebasePlan) return hardcodedPlan.map(w => ({ ...w, id: `week-${w.weekNumber}` }));

      return hardcodedPlan.map(week => {
        const fbWeek = firebasePlan.find(w => w.weekNumber === week.weekNumber);
        if (!fbWeek) return { ...week, id: `week-${week.weekNumber}` };

        // Merge runs - iterate over HARDCODED runs first, then add any extra Firebase runs
        const fbRuns = fbWeek.runs || [];

        // Start with hardcoded runs, merge Firebase data by index/id
        const mergedRuns = week.runs.map((hardcodedRun, idx) => {
          // Find matching Firebase run by id first, then fall back to index
          const fbRun = fbRuns.find(r => r.id === hardcodedRun.id) || fbRuns[idx];

          if (!fbRun) {
            // No Firebase data for this run, use hardcoded
            return { ...hardcodedRun };
          }

          // Merge Firebase values with hardcoded defaults
          // For boolean fields (mike, adam), use Firebase if defined (even if false)
          // For string fields (distance, label), only use Firebase if it has actual content
          const merged = {
            ...hardcodedRun,
            mike: fbRun.mike !== undefined ? fbRun.mike : hardcodedRun.mike,
            distance: fbRun.distance && fbRun.distance.trim() ? fbRun.distance : hardcodedRun.distance,
            label: fbRun.label && fbRun.label.trim() ? fbRun.label : hardcodedRun.label,
            notes: fbRun.notes || hardcodedRun.notes || ''
          };

          // Handle adam field
          if ('adam' in hardcodedRun) {
            merged.adam = fbRun.adam !== undefined ? fbRun.adam : hardcodedRun.adam;
          }

          return merged;
        });

        // Add any extra runs from Firebase that aren't in hardcoded (user-added runs)
        fbRuns.forEach((fbRun, idx) => {
          if (idx >= week.runs.length && !mergedRuns.find(r => r.id === fbRun.id)) {
            mergedRuns.push(fbRun);
          }
        });

        // Same for cross training - iterate over HARDCODED first
        const fbCrossTraining = fbWeek.crossTraining || [];

        const mergedCrossTraining = week.crossTraining.map((hardcodedCT, idx) => {
          const fbCT = fbCrossTraining.find(c => c.id === hardcodedCT.id) || fbCrossTraining[idx];

          if (!fbCT) {
            return { ...hardcodedCT };
          }

          const merged = {
            ...hardcodedCT,
            mike: fbCT.mike !== undefined ? fbCT.mike : hardcodedCT.mike,
            label: fbCT.label && fbCT.label.trim() ? fbCT.label : hardcodedCT.label,
            notes: fbCT.notes || hardcodedCT.notes || ''
          };

          if ('adam' in hardcodedCT) {
            merged.adam = fbCT.adam !== undefined ? fbCT.adam : hardcodedCT.adam;
          }

          return merged;
        });

        // Add any extra cross training from Firebase
        fbCrossTraining.forEach((fbCT, idx) => {
          if (idx >= week.crossTraining.length && !mergedCrossTraining.find(c => c.id === fbCT.id)) {
            mergedCrossTraining.push(fbCT);
          }
        });

        return {
          ...week,
          id: fbWeek.id || `week-${week.weekNumber}`,
          runs: mergedRuns,
          crossTraining: mergedCrossTraining,
          weekNotes: fbWeek.weekNotes || week.weekNotes,
          photos: fbWeek.photos || week.photos || [],
        };
      });
    };

    if (eventId === 'indy-half-2026') {
      return mergeWithFirebase(indyHalfTrainingPlan);
    }
    if (eventId === 'gso-half-2026') {
      return mergeWithFirebase(gsoHalfTrainingPlan);
    }
    return fitnessTrainingPlans[eventId] || [];
  };

  // Handle redirect result on page load (for Safari/iOS compatibility)
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          showToast('Signed in successfully!', 'success');
        }
      })
      .catch((error) => {
        console.error('Redirect result error:', error);
        showToast('Sign in failed. Please try again.', 'error');
      });
  }, [showToast]);

  // Pre-load Google Calendar scripts on mount (for Safari/iOS popup compatibility)
  useEffect(() => {
    const preloadGoogleScripts = async () => {
      try {
        await loadGoogleScripts();
        await initGoogleCalendar();
        setGoogleScriptsLoaded(true);
        console.log('Google scripts pre-loaded');
      } catch (err) {
        console.log('Failed to pre-load Google scripts:', err);
      }
    };
    preloadGoogleScripts();
  }, []);

  // Auth handlers - try popup first, fall back to redirect for Safari/iOS
  const handleLogin = async () => {
    setAuthLoading(true);
    try {
      // Try popup first (works on most browsers)
      await signInWithPopup(auth, googleProvider);
      showToast('Signed in successfully!', 'success');
    } catch (error) {
      // If popup fails (Safari blocks it), use redirect
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectError) {
          console.error('Redirect login error:', redirectError);
          showToast('Sign in failed. Please try again.', 'error');
          setAuthLoading(false);
        }
      } else {
        console.error('Login error:', error);
        showToast('Sign in failed. Please try again.', 'error');
        setAuthLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Sort trips by start date (with null safety) - uses visibleTrips for role-based filtering
  const sortedTrips = [...(visibleTrips || [])].sort((a, b) => {
    const aStart = a?.dates?.start ? parseLocalDate(a.dates.start) : new Date();
    const bStart = b?.dates?.start ? parseLocalDate(b.dates.start) : new Date();
    return aStart - bStart;
  });

  // Separate confirmed adventures from trips in planning
  const confirmedTrips = sortedTrips.filter(t => !t?.isPlanning);
  const planningTrips = sortedTrips.filter(t => t?.isPlanning);

  const isDateInTrip = (day) => {
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return (visibleTrips || []).find(trip => {
      if (!trip?.dates?.start || !trip?.dates?.end) return false;
      const start = parseLocalDate(trip.dates.start);
      const end = parseLocalDate(trip.dates.end);
      return checkDate >= start && checkDate <= end;
    });
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);

  // Skeleton used whenever a trip has no tripDetails entry yet (newly-created trips, converted
  // events, etc.). Without this fallback, [type]: [...tripDetails[tripId][type], …] threw
  // "Cannot read properties of undefined (reading 'flights')" and the Save click looked dead.
  const emptyTripDetails = () => ({ flights: [], hotels: [], events: [], links: [], packingList: [], budget: { total: 0, expenses: [] }, photos: [], notes: [] });

  const addItem = async (tripId, type, item) => {
    if (!canEditTrip(tripId)) {
      showToast('You don\'t have permission to edit this trip', 'error');
      return;
    }
    const existing = tripDetails[tripId] || emptyTripDetails();
    const list = Array.isArray(existing[type]) ? existing[type] : [];
    const newTripDetails = {
      ...tripDetails,
      [tripId]: {
        ...existing,
        [type]: [...list, { ...item, id: Date.now(), addedBy: currentUser }],
      },
    };
    setTripDetails(newTripDetails);
    setShowAddModal(null);
    try {
      await saveToFirestore(null, null, newTripDetails);
    } catch (err) {
      console.error('addItem save failed:', err);
      showToast('Failed to save — please try again', 'error');
      throw err;
    }
  };

  const removeItem = async (tripId, type, itemId) => {
    if (!canEditTrip(tripId)) {
      showToast('You don\'t have permission to edit this trip', 'error');
      return;
    }
    const existing = tripDetails[tripId] || emptyTripDetails();
    const list = Array.isArray(existing[type]) ? existing[type] : [];
    const newTripDetails = {
      ...tripDetails,
      [tripId]: {
        ...existing,
        [type]: list.filter(item => item.id !== itemId),
      },
    };
    setTripDetails(newTripDetails);
    try {
      await saveToFirestore(null, null, newTripDetails);
    } catch (err) {
      console.error('removeItem save failed:', err);
      showToast('Failed to save — please try again', 'error');
    }
  };

  const updateItem = async (tripId, type, itemId, updatedData) => {
    if (!canEditTrip(tripId)) {
      showToast('You don\'t have permission to edit this trip', 'error');
      return;
    }
    const existing = tripDetails[tripId] || emptyTripDetails();
    const list = Array.isArray(existing[type]) ? existing[type] : [];
    const newTripDetails = {
      ...tripDetails,
      [tripId]: {
        ...existing,
        [type]: list.map(item =>
          item.id === itemId ? { ...item, ...updatedData } : item
        ),
      },
    };
    setTripDetails(newTripDetails);
    setShowAddModal(null);
    try {
      await saveToFirestore(null, null, newTripDetails);
    } catch (err) {
      console.error('updateItem save failed:', err);
      showToast('Failed to save — please try again', 'error');
      throw err;
    }
  };

  // Travel operations now in useTravel hook

  const addLink = (tripId, linkData) => {
    // Check if this is a planning trip - if so, add to trip's planningLinks
    const trip = trips.find(t => t.id === tripId);
    if (trip?.isPlanning) {
      const newLink = { id: Date.now(), title: linkData.title, url: linkData.url, type: linkData.category };
      setTrips(prev => prev.map(t =>
        t.id === tripId
          ? { ...t, planningLinks: [...(t.planningLinks || []), newLink] }
          : t
      ));
      return;
    }

    // Otherwise add to tripDetails.links
    const newTripDetails = {
      ...tripDetails,
      [tripId]: {
        ...tripDetails[tripId],
        links: [...(tripDetails[tripId]?.links || []), { ...linkData, id: Date.now(), addedBy: currentUser }]
      }
    };
    setTripDetails(newTripDetails);
    saveToFirestore(null, null, newTripDetails);
  };

  const removeLink = (tripId, linkId) => {
    const newTripDetails = {
      ...tripDetails,
      [tripId]: {
        ...tripDetails[tripId],
        links: tripDetails[tripId].links.filter(link => link.id !== linkId)
      }
    };
    setTripDetails(newTripDetails);
    saveToFirestore(null, null, newTripDetails);
  };

  // Show loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-teal-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your adventures...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return <LoginScreen onLogin={handleLogin} loading={authLoading} />;
  }

  // NewTripModal - moved to ./components/NewTripModal.jsx

  // GuestModal - moved to ./components/GuestModal.jsx

  // CompanionsModal - moved to ./components/CompanionsModal.jsx

  // MyProfileModal - moved to ./components/MyProfileModal.jsx

  // TripDetail - moved to ./components/TripDetail.jsx

  const closeMenus = () => {
    setShowTripMenu(null);
    setShowColorPicker(null);
    setShowEmojiEditor(null);
    setShowImageEditor(null);
  };

  return (
    <div
      className="h-[100dvh] md:h-screen flex flex-col bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 relative"
      onClick={closeMenus}
    >
      {/* Global styles for UI enhancements */}
      <style>{`
        html, body {
          background-color: #1e293b;
          overscroll-behavior: none;
          overflow: hidden;
        }
        @supports (-webkit-touch-callout: none) {
          body {
            min-height: -webkit-fill-available;
          }
        }

        /* Reduced motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Loading skeleton animation */
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        .skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%);
          background-size: 200% 100%;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
          border-radius: 0.5rem;
        }

        /* Standardized form inputs */
        .form-input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 0.75rem;
          color: white;
          font-size: 0.875rem;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .form-input:focus {
          outline: none;
          border-color: rgba(139, 92, 246, 0.5);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }
        .form-input::placeholder {
          color: rgba(148, 163, 184, 0.6);
        }
      `}</style>

      {/* Rainbow top bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-orange-500 via-yellow-400 via-green-500 via-blue-500 to-purple-500" />

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-pulse transition-all ${
          toast.type === 'error' ? 'bg-red-500 text-white' :
          toast.type === 'success' ? 'bg-green-500 text-white' :
          'bg-slate-700 text-white'
        }`}>
          {toast.type === 'error' && <X className="w-4 h-4" />}
          {toast.type === 'success' && <Check className="w-4 h-4" />}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Confetti Animation */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          <style>{`
            @keyframes confetti-fall {
              0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
            @keyframes confetti-fall-slow {
              0% { transform: translateY(-100vh) rotate(0deg) scale(1); opacity: 1; }
              100% { transform: translateY(100vh) rotate(1080deg) scale(0.5); opacity: 0; }
            }
          `}</style>
          {[...Array(confetti.type === 'week' ? 60 : 25)].map((_, i) => {
            // Yellow confetti for single run completion, rainbow for week completion
            const rainbowColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
            const yellowColors = ['#fbbf24', '#f59e0b', '#fcd34d', '#fde68a', '#d97706']; // Shades of yellow/gold
            const colors = confetti.type === 'week' ? rainbowColors : yellowColors;
            const color = colors[i % colors.length];
            const left = Math.random() * 100;
            const delay = Math.random() * (confetti.type === 'week' ? 1 : 0.5);
            const duration = confetti.type === 'week' ? 3 + Math.random() * 2 : 1.5 + Math.random();
            const size = confetti.type === 'week' ? 10 + Math.random() * 10 : 6 + Math.random() * 6;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${left}%`,
                  top: 0,
                  width: size,
                  height: size,
                  backgroundColor: color,
                  borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                  animation: `${confetti.type === 'week' ? 'confetti-fall-slow' : 'confetti-fall'} ${duration}s ease-out ${delay}s forwards`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Week Completion Celebration Overlay */}
      {weekCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-pulse" style={{ animationDuration: '2s' }}>
          <div className="text-center p-8 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-3xl shadow-2xl transform animate-bounce" style={{ animationDuration: '0.5s' }}>
            <div className="text-6xl mb-4">🎉🏃‍♂️🏃‍♂️🎉</div>
            <h2 className="text-4xl font-bold text-white mb-2">Week {weekCelebration.weekNumber} Complete!</h2>
            <p className="text-xl text-white/90 mb-4">{weekCelebration.eventName}</p>
            <div className="flex justify-center gap-4">
              <div className="bg-white/20 px-4 py-2 rounded-full">
                <span className="text-white font-bold">Mike ✓</span>
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-full">
                <span className="text-white font-bold">Adam ✓</span>
              </div>
            </div>
            <p className="text-white/80 mt-4 text-lg">You both crushed it! 💪</p>
          </div>
        </div>
      )}

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute top-1/3 right-1/4 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s' }} />
        <div className="absolute top-3/4 left-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5.5s' }} />

        
        {/* Floating travel emojis with animations */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          @keyframes floatSlow {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(-3deg); }
          }
          @keyframes twinkle {
            0%, 100% { opacity: 0.1; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(1.2); }
          }
          @keyframes shooting {
            0% { transform: translateX(0) translateY(0) rotate(-45deg); opacity: 1; }
            100% { transform: translateX(200px) translateY(200px) rotate(-45deg); opacity: 0; }
          }
          @keyframes borderCircle {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes glowPulse {
            0%, 100% { box-shadow: 0 0 5px rgba(236, 72, 153, 0.5), 0 0 10px rgba(236, 72, 153, 0.3), 0 0 15px rgba(236, 72, 153, 0.2); }
            50% { box-shadow: 0 0 10px rgba(236, 72, 153, 0.8), 0 0 20px rgba(236, 72, 153, 0.5), 0 0 30px rgba(236, 72, 153, 0.3); }
          }
          .special-memory-card {
            position: relative;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 1rem;
            overflow: visible;
          }
          .special-memory-card::before {
            content: '';
            position: absolute;
            top: -3px;
            left: -3px;
            right: -3px;
            bottom: -3px;
            background: linear-gradient(90deg, #ec4899, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6, #ec4899);
            background-size: 300% 300%;
            border-radius: 1.2rem;
            z-index: -1;
            animation: borderCircle 3s linear infinite;
          }
          .special-memory-card::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgb(30 41 59);
            border-radius: 1rem;
            z-index: -1;
          }
          .float { animation: float 6s ease-in-out infinite; }
          .float-slow { animation: floatSlow 8s ease-in-out infinite; }
          .twinkle { animation: twinkle 3s ease-in-out infinite; }
        `}</style>

        
        {/* Hidden Mickey silhouette - visible when Disney magic is activated */}
        {showDisneyMagic && (
          <div className="absolute bottom-10 right-10 opacity-20 transition-opacity duration-1000">
            <div className="relative">
              <div className="w-16 h-16 bg-white rounded-full" />
              <div className="absolute -top-6 -left-4 w-10 h-10 bg-white rounded-full" />
              <div className="absolute -top-6 -right-4 w-10 h-10 bg-white rounded-full" />
            </div>
          </div>
        )}

        {/* Disney magic sparkles when activated */}
        {showDisneyMagic && (
          <>
            <style>{`
              @keyframes disneySparkle {
                0% { opacity: 0; transform: scale(0) rotate(0deg); }
                50% { opacity: 1; transform: scale(1) rotate(180deg); }
                100% { opacity: 0; transform: scale(0) rotate(360deg); }
              }
            `}</style>
            {[...Array(20)].map((_, i) => (
              <span
                key={i}
                className="absolute text-yellow-300"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `disneySparkle 2s ease-out infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                  fontSize: `${12 + Math.random() * 12}px`
                }}
              >
                ✨
              </span>
            ))}
          </>
        )}
      </div>

      {/* Anchor removed for cleaner UI */}

      {/* Header */}
      <header className="relative z-20 pt-safe pb-2 md:pb-4 px-4 md:px-6 shrink-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-2 md:gap-4 relative">
            {/* Left side: Names + Section Title on mobile */}
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              <div className="flex items-center gap-1 md:gap-2 shrink-0">
                <button
                  onClick={() => isOwner && setActiveSection('apps')}
                  className="hover:opacity-90 active:scale-95 cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <svg viewBox="0 0 512 512" className="w-8 h-8 md:w-10 md:h-10 shrink-0">
                    <defs>
                      <linearGradient id="logoSpectrum" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{stopColor:'#2dd4bf'}}/>
                        <stop offset="20%" style={{stopColor:'#22d3ee'}}/>
                        <stop offset="45%" style={{stopColor:'#818cf8'}}/>
                        <stop offset="70%" style={{stopColor:'#c084fc'}}/>
                        <stop offset="100%" style={{stopColor:'#f472b6'}}/>
                      </linearGradient>
                    </defs>
                    <rect x="16" y="16" width="480" height="480" rx="96" fill="#1e293b"/>
                    <rect x="16" y="16" width="480" height="480" rx="96" fill="none" stroke="url(#logoSpectrum)" strokeWidth="14" opacity="0.5"/>
                    <polygon points="56,390 56,130 114,130 150,225 186,130 244,130 244,390 198,390 198,240 160,338 140,338 104,240 104,390" fill="url(#logoSpectrum)" opacity="0.92"/>
                    <polygon points="232,390 320,130 356,130 452,390 402,390 382,328 294,328 274,390" fill="url(#logoSpectrum)" opacity="0.92"/>
                    <polygon points="308,288 368,288 338,218" fill="#1e293b"/>
                  </svg>
                  <span className="hidden md:inline text-sm font-semibold bg-gradient-to-r from-teal-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">
                    Mike & Adam
                  </span>
                </button>
                {/* Hearts icon - clickable */}
                <button
                  onClick={() => setShowPartnershipQuote(true)}
                  className="text-pink-400 hover:text-pink-300 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  title="Our love story"
                >
                  💕
                </button>
              </div>
            </div>

            {/* Mobile section indicator - centered */}
            <div className="md:hidden absolute left-1/2 -translate-x-1/2">
              <button
                onClick={() => setShowSectionDropdown(!showSectionDropdown)}
                className="text-sm font-semibold text-white/80 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/10 transition active:scale-95"
              >
                {activeSection === 'home' && <><span>⚛️</span> Hub</>}
                {activeSection === 'fitness' && <><span>🏃</span> Fitness</>}
                {activeSection === 'events' && <><span>📅</span> Events</>}
                {activeSection === 'memories' && <><span>💝</span> Memories</>}
                <span className={`text-white/40 text-xs ml-0.5 transition-transform ${showSectionDropdown ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {showSectionDropdown && (
                <>
                  <div className="fixed inset-0 z-[60]" onClick={() => setShowSectionDropdown(false)} />
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-[61] bg-slate-800/95 backdrop-blur-md border border-white/15 rounded-xl py-1 shadow-2xl min-w-[140px]">
                    {[
                      { id: 'fitness', emoji: '🏃', label: 'Fitness' },
                      { id: 'home', emoji: '⚛️', label: 'Hub' },
                      { id: 'events', emoji: '📅', label: 'Events' },
                      { id: 'memories', emoji: '💝', label: 'Memories' },
                    ].map(section => (
                      <button
                        key={section.id}
                        onClick={() => {
                          setActiveSection(section.id);
                          if (section.id === 'events') setTravelViewMode('main');
                          if (section.id === 'home') setHubSubView('home');
                          setShowSectionDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 flex items-center gap-2 text-sm transition ${
                          activeSection === section.id
                            ? 'text-white bg-white/10 font-semibold'
                            : 'text-white/70 hover:bg-white/5'
                        }`}
                      >
                        <span>{section.emoji}</span>
                        <span>{section.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Section Title - Centered on desktop, below header on mobile */}
            <div className="absolute left-1/2 transform -translate-x-1/2 text-center hidden md:block">
              {activeSection === 'home' && (
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                    <span>⚛️</span>
                    Hub
                  </h2>
                  <p className="text-xs text-slate-400">Plan adventures, stay healthy, build our future</p>
                </div>
              )}
              {activeSection === 'fitness' && (
                <div>
                  <h2 className="text-xl font-bold text-white">🏃 Fitness Training</h2>
                  <p className="text-xs text-slate-400">Train together, achieve together</p>
                </div>
              )}
              {activeSection === 'events' && (
                <div>
                  <h2 className="text-xl font-bold text-white">📅 Events</h2>
                  <p className="text-xs text-slate-400">Trips, parties & everything in between</p>
                </div>
              )}
              {activeSection === 'memories' && (
                <div>
                  <h2 className="text-xl font-bold text-white">💝 Our Memories</h2>
                  <p className="text-xs text-slate-400">The story of us, one moment at a time</p>
                </div>
              )}
              {activeSection === 'calendar' && (
                <div>
                  <h2 className="text-xl font-bold text-white">📅 Calendar</h2>
                  <p className="text-xs text-slate-400">Our schedule at a glance</p>
                </div>
              )}
              {activeSection === 'apps' && (
                <div>
                  <h2 className="text-xl font-bold text-white">📱 Mini Apps</h2>
                  <p className="text-xs text-slate-400">Add to your home screen</p>
                </div>
              )}
            </div>

            {/* User info - simplified in app mode */}
            {!initialAppMode ? (
              <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
                {/* Search button */}
                <button
                  onClick={() => setShowSearch(true)}
                  className={`flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl transition shadow-lg ${
                    showSearch
                      ? 'bg-gradient-to-br from-purple-400 to-pink-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                  }`}
                  title="Search"
                >
                  <Search className="w-4 h-4 md:w-5 md:h-5" />
                </button>

                {/* Notification bell */}
                {isOwner && (
                  <button
                    onClick={notificationsEnabled ? () => setShowNotifyPrefs(true) : enableNotifications}
                    disabled={notificationsLoading}
                    className={`flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl transition shadow-lg ${
                      notificationsEnabled
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                    }`}
                    title={notificationsEnabled ? 'Notification settings' : 'Enable notifications'}
                  >
                    {notificationsLoading ? (
                      <Loader className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                    ) : notificationsEnabled ? (
                      <Bell className="w-4 h-4 md:w-5 md:h-5" />
                    ) : (
                      <BellOff className="w-4 h-4 md:w-5 md:h-5" />
                    )}
                  </button>
                )}

                {/* User info and logout - simplified on mobile */}
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-2 py-1.5 md:px-4 md:py-2">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" />
                  ) : (
                    <User className="w-5 h-5 text-white/70" />
                  )}
                  <span className="hidden md:inline text-white/70 text-sm">{currentUser}</span>
                  {currentCompanion && (
                    <span className="hidden md:inline text-xs bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full">
                      {currentCompanion.relationship}
                    </span>
                  )}
                  {/* Profile button for companions */}
                  {currentCompanion && (
                    <button
                      onClick={() => setShowMyProfileModal(true)}
                      className="hidden md:block ml-1 p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition"
                      title="Edit my profile"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="hidden md:block ml-2 text-xs text-white/50 hover:text-white transition underline"
                  >
                    log out
                  </button>
                </div>


                {/* Companion badge - hidden on mobile */}
                {currentCompanion && !isOwner && (
                  <div className="hidden md:flex items-center bg-amber-500/20 rounded-full px-3 py-1.5">
                    <span className="text-amber-300 text-sm">👋 Welcome, {currentCompanion.firstName || currentCompanion.name}!</span>
                  </div>
                )}

              </div>
            ) : (
              /* Simplified user switcher for app mode */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => isOwner && setCurrentUser('Mike')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                    currentUser === 'Mike'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  Mike
                </button>
                <button
                  onClick={() => isOwner && setCurrentUser('Adam')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                    currentUser === 'Adam'
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  Adam
                </button>
              </div>
            )}
          </div>

          {/* Sync status indicator */}
          {dataLoading && (
            <div className="mt-4 flex items-center gap-2 text-slate-400 text-sm">
              <Loader className="w-4 h-4 animate-spin" />
              Syncing...
            </div>
          )}

          {/* Section Navigation - Hidden on mobile (we have bottom nav) and in App Mode */}
          {!initialAppMode && (
            <div className="mt-6 hidden md:flex gap-2 flex-wrap items-center justify-center">
              {/* Main navigation buttons */}
              {[
                { id: 'fitness', label: 'Fitness', emoji: '🏃', gradient: 'from-orange-400 to-red-500' },
                { id: 'home', label: 'Hub', emoji: '⚛️', gradient: 'from-pink-500 to-purple-500' },
                { id: 'events', label: 'Events', emoji: '📅', gradient: 'from-amber-400 to-orange-500' },
                { id: 'memories', label: 'Memories', emoji: '💝', gradient: 'from-rose-400 to-pink-500' },
              ].map(section => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    if (section.id === 'events') setTravelViewMode('main');
                    if (section.id === 'home') setHubSubView('home');
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition shadow-lg ${
                    activeSection === section.id
                      ? `bg-gradient-to-r ${section.gradient} text-white`
                      : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <span>{section.emoji}</span>
                  {section.label}
                </button>
              ))}
            </div>
          )}

          {/* App Mode Header - Dynamic title based on app type */}
          {initialAppMode && (
            <div className="mt-4 text-center">
              {initialAppMode === 'fitness' && (
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center gap-2">
                  <span className="text-3xl">🏃</span>
                  Fitness Training
                </h2>
              )}
              {initialAppMode === 'travel' && (
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center justify-center gap-2">
                  <span className="text-3xl">✈️</span>
                  Travel Adventures
                </h2>
              )}
              {initialAppMode === 'events' && (
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center gap-2">
                  <span className="text-3xl">🎉</span>
                  Events
                </h2>
              )}
              {initialAppMode === 'memories' && (
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500 flex items-center justify-center gap-2">
                  <span className="text-3xl">💝</span>
                  Our Memories
                </h2>
              )}
            </div>
          )}

        </div>
      </header>

      {/* Main Content - scrollable area on mobile */}
      <main className="relative z-10 px-6 md:pb-12 flex-1 overflow-y-auto main-mobile-pb" id="main-scroll">
        <div className="max-w-6xl mx-auto">

          {/* Rupert banner — written by mikeslife cron-couple-context (rupert/coupleNote doc) */}
          <RupertBanner db={db} />

          {/* ========== HUB SECTION (formerly Home) ========== */}
          {activeSection === 'home' && (
            <SharedHubProvider value={sharedHub}>
              <HubSection {...{ checkins, submitCheckin, calendarAgenda, collapsedSections, completeSocial, completeTask, currentUser, deleteGoal, deleteIdea, deleteOdysseyPlan, deleteSocial, deleteTask, getEventLabel, getLinkedLabel, highlightGoal, highlightIdea, highlightSocial, highlightTask, hubGoalFilter, hubIdeaFilter, hubListFilter, hubSocialFilter, hubSubView, hubTaskFilter, hubTaskSort, navigateToEvent, navigateToLinked, promoteIdeaToTask, setActiveSection, setHubGoalFilter, setHubIdeaFilter, setHubListFilter, setHubSocialFilter, setHubSubView, setHubTaskFilter, setHubTaskSort, setShowAddGoalModal, setShowAddIdeaModal, setShowAddSocialModal, setShowAddTaskModal, setShowOdysseyPlanModal, setShowSharedListModal, sharedGoals, sharedIdeas, sharedLists, sharedOdysseyPlans, sharedSocial, sharedTasks, taskMatchesHorizon, todaySnapshot, toggleDashSection, toggleMilestone, updateTask }} />
            </SharedHubProvider>
          )}
          {/* ========== END HUB SECTION ========== */}



          {/* ========== FITNESS SECTION ========== */}
          {activeSection === 'fitness' && (
            <FitnessSection {...{ fitnessEvents, fitnessTrainingPlans, fitnessViewMode, getActiveTrainingPlan, handleRaceDayPhotoAdd, handleRaceDayPhotoRemove, handleWeekNotesChange, handleWeekPhotoAdd, handleWeekPhotoRemove, openLightbox, pastWeeksExpanded, selectedFitnessEvent, setEditingFitnessEvent, setEditingTrainingWeek, setFitnessViewMode, setPastWeeksExpanded, setSelectedFitnessEvent, setWeekPhotoDrag, showToast, updateRaceDay, updateWorkout, uploadingWeekPhotoId, weekNotesLocal, weekPhotoDrag }} />
          )}
          {/* ========== END FITNESS SECTION ========== */}

          {/* ========== CALENDAR SECTION ========== */}
          {activeSection === 'calendar' && (
            <div className="mt-8">
              <div className="text-center mb-6">
                <p className="text-slate-400">All our adventures, events, and memories in one place</p>
              </div>

              {/* Google Calendar Connection */}
              <div className="flex flex-col items-center gap-4 mb-8">
                {calendarConnected ? (
                  <>
                    {/* Connected State */}
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-full">
                      <Check className="w-5 h-5 text-emerald-400" />
                      <span className="text-emerald-300 font-medium">Google Calendar Connected</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setCalendarConnected(false);
                          setGoogleCalendarEvents([]);
                          setSelectedCalendarId('primary');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-full transition text-sm"
                      >
                        <X className="w-4 h-4" />
                        Disconnect
                      </button>
                      <button
                        onClick={connectGoogleCalendar}
                        disabled={calendarLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-full transition text-sm disabled:opacity-50"
                      >
                        {calendarLoading ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                        Refresh
                      </button>
                      <button
                        onClick={() => window.open('https://calendar.google.com', '_blank')}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-full transition text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open in Google
                      </button>
                    </div>

                    {/* Event Count */}
                    {googleCalendarEvents.length > 0 && (
                      <p className="text-slate-400 text-sm">
                        {googleCalendarEvents.length} event{googleCalendarEvents.length !== 1 ? 's' : ''} from Google Calendar
                      </p>
                    )}
                  </>
                ) : (
                  /* Not Connected State */
                  <button
                    onClick={connectGoogleCalendar}
                    disabled={calendarLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-full hover:opacity-90 transition shadow-lg disabled:opacity-50"
                  >
                    {calendarLoading ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Globe className="w-5 h-5" />
                        Connect Google Calendar
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Calendar Card */}
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-white">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span className="text-xl font-bold">
                      {months[calendarViewMonth.getMonth()]} {calendarViewMonth.getFullYear()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCalendarViewMonth(new Date(calendarViewMonth.getFullYear(), calendarViewMonth.getMonth() - 1, 1))}
                      className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCalendarViewMonth(new Date())}
                      className="px-3 py-1 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition text-sm"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => setCalendarViewMonth(new Date(calendarViewMonth.getFullYear(), calendarViewMonth.getMonth() + 1, 1))}
                      className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Upcoming Events Cards - Only show app events (trips, party events), not raw Google Calendar events */}
                {(() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const allEvents = getAllCalendarEvents();
                  // Filter out Google Calendar events from banner - only show app-native events
                  const monthEvents = allEvents.filter(event => {
                    if (event.type === 'google') return false; // Don't show Google events in banner
                    const start = parseLocalDate(event.start);
                    const end = parseLocalDate(event.end);
                    return (start.getMonth() === calendarViewMonth.getMonth() && start.getFullYear() === calendarViewMonth.getFullYear()) ||
                           (end.getMonth() === calendarViewMonth.getMonth() && end.getFullYear() === calendarViewMonth.getFullYear());
                  });

                  if (monthEvents.length === 0) return null;

                  return (
                    <div className="mb-6 space-y-3">
                      {monthEvents.slice(0, 5).map(event => {
                        const startDate = parseLocalDate(event.start);
                        const daysUntil = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));
                        const isMultiDay = event.start !== event.end;
                        const endDate = parseLocalDate(event.end);

                        return (
                          <div
                            key={event.id}
                            onClick={() => {
                              if (event.type === 'google') {
                                setImportSettings(prev => ({ ...prev, customName: '' }));
                                setShowImportModal(event.data);
                              } else if (event.type === 'travel') {
                                setActiveSection('travel');
                                setSelectedTrip(event.data);
                              } else if (event.type === 'event') {
                                setActiveSection('events');
                                setSelectedPartyEvent(event.data);
                              }
                            }}
                            className={`bg-gradient-to-r ${event.color} rounded-xl p-4 flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-transform shadow-lg`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{event.type === 'google' ? '📅' : (event.data?.emoji || (event.type === 'travel' ? '✈️' : '🎉'))}</span>
                              <div className="text-white">
                                <div className="font-bold text-lg flex items-center gap-2">
                                  {event.data?.name || event.data?.destination || event.title?.replace(/^[^\s]+ /, '') || 'Event'}
                                  {event.data?.special && <span className="text-lg">💕🌈</span>}
                                </div>
                                <div className="text-sm opacity-90">
                                  {isMultiDay ? (
                                    `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                                  ) : (
                                    `${startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}${event.data?.time ? ` at ${event.data.time}` : ''}`
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-white text-right">
                              {daysUntil > 0 ? (
                                <span className="opacity-90">{daysUntil} days away</span>
                              ) : daysUntil === 0 ? (
                                <span className="font-bold">Today! 🎉</span>
                              ) : (
                                <span className="opacity-70">Past</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {days.map(day => (
                    <div key={day} className="text-center text-slate-400 text-xs font-semibold py-2 uppercase tracking-wide">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 border border-white/10 rounded-xl overflow-hidden">
                  {(() => {
                    const { firstDay, daysInMonth } = getDaysInMonth(calendarViewMonth);
                    const allEvents = getAllCalendarEvents();
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    // Helper to get events on a specific day
                    const getEventsOnDay = (day) => {
                      const checkDate = new Date(calendarViewMonth.getFullYear(), calendarViewMonth.getMonth(), day);
                      checkDate.setHours(0, 0, 0, 0);
                      return allEvents.filter(event => {
                        const start = parseLocalDate(event.start);
                        const end = parseLocalDate(event.end);
                        return checkDate >= start && checkDate <= end;
                      });
                    };

                    return (
                      <>
                        {[...Array(firstDay)].map((_, i) => (
                          <div key={`empty-${i}`} className="h-16 md:h-20 bg-white/5 border-r border-b border-white/5" />
                        ))}
                        {[...Array(daysInMonth)].map((_, i) => {
                          const day = i + 1;
                          const checkDate = new Date(calendarViewMonth.getFullYear(), calendarViewMonth.getMonth(), day);
                          const isToday = checkDate.toDateString() === today.toDateString();
                          const eventsOnDay = getEventsOnDay(day);
                          const hasEvents = eventsOnDay.length > 0;

                          return (
                            <div
                              key={day}
                              onClick={() => {
                                if (eventsOnDay.length === 1) {
                                  const event = eventsOnDay[0];
                                  if (event.type === 'google') {
                                    setImportSettings(prev => ({ ...prev, customName: '' }));
                                    setShowImportModal(event.data);
                                  } else if (event.type === 'travel') {
                                    setActiveSection('travel');
                                    setSelectedTrip(event.data);
                                  } else if (event.type === 'event') {
                                    setActiveSection('events');
                                    setSelectedPartyEvent(event.data);
                                  }
                                }
                              }}
                              className={`h-16 md:h-20 p-1 relative border-r border-b border-white/5 transition-all ${
                                hasEvents ? 'cursor-pointer hover:bg-white/10' : ''
                              } ${isToday ? 'bg-blue-500/20' : 'bg-white/5'}`}
                            >
                              {/* Date number */}
                              <div className={`text-xs font-medium ${
                                isToday ? 'text-blue-400 font-bold' : hasEvents ? 'text-white' : 'text-slate-500'
                              }`}>
                                {day}
                              </div>

                              {/* Event indicators */}
                              {hasEvents && (
                                <div className="absolute inset-1 top-5 flex flex-col items-center justify-center gap-0.5">
                                  {eventsOnDay.slice(0, 2).map((event, idx) => (
                                    <div
                                      key={idx}
                                      className={`w-full h-5 md:h-6 rounded bg-gradient-to-r ${event.color} flex items-center justify-center`}
                                    >
                                      <span className="text-xs md:text-sm">
                                        {event.type === 'google' ? '📅' : (event.data?.emoji || (event.type === 'travel' ? '✈️' : '🎉'))}
                                      </span>
                                    </div>
                                  ))}
                                  {eventsOnDay.length > 2 && (
                                    <div className="text-xs text-slate-400">+{eventsOnDay.length - 2}</div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Google Calendar status */}
              {calendarConnected && googleCalendarEvents.length > 0 && (
                <div className="mt-4 text-center">
                  <p className="text-slate-400 text-sm">
                    🔗 {googleCalendarEvents.length} events synced from Google Calendar
                  </p>
                </div>
              )}
            </div>
          )}
          {/* ========== END CALENDAR SECTION ========== */}

          {/* ========== APPS SECTION ========== */}
          {activeSection === 'apps' && (
            <div className="mt-8">
              <div className="max-w-2xl mx-auto">
                {/* Instructions */}
                <div className="text-center mb-8">
                  <p className="text-slate-300 mb-2">Add any of these mini apps to your iPhone home screen for quick access!</p>
                  <p className="text-slate-400 text-sm">Tap an app, then use the share button and "Add to Home Screen"</p>
                </div>

                {/* Apps Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'home', name: 'Hub', emoji: '⚛️', color: 'from-pink-500 to-purple-500', desc: 'Tasks, lists, habits & more' },
                    { id: 'fitness', name: 'Fitness', emoji: '🏃', color: 'from-orange-400 to-red-500', desc: 'Track workouts & training' },
                    { id: 'travel', name: 'Travel', emoji: '✈️', color: 'from-teal-400 to-cyan-500', desc: 'Plan your adventures' },
                    { id: 'events', name: 'Events', emoji: '🎉', color: 'from-amber-400 to-orange-500', desc: 'Manage parties & gatherings' },
                    { id: 'memories', name: 'Memories', emoji: '💝', color: 'from-rose-400 to-pink-500', desc: 'Cherish special moments' },
                  ].map((app) => (
                    <button
                      key={app.id}
                      onClick={() => {
                        const appUrl = `${window.location.origin}/?app=${app.id}`;
                        if (navigator.share) {
                          navigator.share({
                            title: `Mike & Adam's ${app.name}`,
                            text: `Open ${app.name} app`,
                            url: appUrl
                          });
                        } else {
                          navigator.clipboard.writeText(appUrl);
                          showToast(`${app.name} app link copied! Open in Safari and add to home screen.`, 'success');
                        }
                      }}
                      className="flex flex-col items-center gap-3 p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition active:scale-95"
                    >
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${app.color} flex items-center justify-center text-3xl shadow-lg`}>
                        {app.emoji}
                      </div>
                      <div className="text-center">
                        <h3 className="text-white font-semibold text-lg">{app.name}</h3>
                        <p className="text-slate-400 text-xs mt-1">{app.desc}</p>
                      </div>
                      <div className="flex items-center gap-1 text-purple-400 text-xs">
                        <ExternalLink className="w-3 h-3" />
                        <span>Share / Add to Home</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* How To Instructions */}
                <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <span className="text-lg">📲</span> How to Add to Home Screen
                  </h3>
                  <ol className="space-y-3 text-slate-300 text-sm">
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                      <span>Tap one of the apps above to open the share menu</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                      <span>On iPhone: Tap "Add to Home Screen" in the share sheet</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                      <span>Give it a name and tap "Add" - you'll have a dedicated app icon!</span>
                    </li>
                  </ol>
                </div>

                {/* Back Button */}
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setActiveSection('home')}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition inline-flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* ========== END APPS SECTION ========== */}

          {/* ========== END NUTRITION SECTION ========== */}

          {/* ========== EVENTS SECTION ========== */}
          {activeSection === 'events' && (
            <EventsSection {...{ DEFAULT_LOGISTICS_NOTE, Starburst, addLink, canEditTrip, completeTask, convertToAdventure, currentUser, dragOverEventId, editingTrip, editingTripDates, eventsSortAsc, eventsTypeFilter, guestEmail, guestPermission, guestPermissions, handleEventCardDrop, inviteLinkCopied, isGuest, isOwner, newListEmoji, newListItemText, newListName, newTaskAssignee, newTaskText, openLightbox, partyEvents, planningTrips, removeItem, removeLink, savePartyEventsToFirestore, saveToFirestore, selectedPartyEvent, selectedTrip, setDragOverEventId, setEditingEvent, setEditingTrip, setEditingTripDates, setEventsSortAsc, setEventsTypeFilter, setGuestEmail, setGuestPermission, setInviteLinkCopied, setMessageCopied, setMessageFilter, setMessageText, setNewListEmoji, setNewListItemText, setNewListName, setNewTaskAssignee, setNewTaskText, setPartyEvents, setSelectedPartyEvent, setSelectedTrip, setShowAddModal, setShowAddTaskModal, setShowGuestModal, setShowInviteModal, setShowLinkModal, setShowMessageModal, setShowNewTripModal, setShowRandomExperience, setShowTypeFilterDropdown, setSwipeState, setTravelViewMode, setTripDetails, setTrips, setWishlist, sharedTasks, showGuestModal, showLinkModal, showToast, showTypeFilterDropdown, sortedTrips, startBouncingEmoji, swipeState, travelViewMode, tripDetails, updateTripDates, uploadPhotoToEvent, uploadingToEventId, user, wishlist }} />
          )}
          {/* ========== END EVENTS SECTION ========== */}


          {/* ========== END BUSINESS SECTION ========== */}

          {/* ========== MEMORIES SECTION ========== */}
          {activeSection === 'memories' && (
            <MemoriesSection {...{ collapsedMemorySections, commentOnMemory, currentUser, dragOverEventId, dragOverMemoryId, fitnessEvents, fitnessTrainingPlans, getMemoryImages, getRandomMemoryImage, handleCardDrop, handleEventCardDrop, memories, memoriesView, openLightbox, partyEvents, reactToMemory, setActiveSection, setCollapsedMemorySections, setDragOverEventId, setDragOverMemoryId, setEditingMemory, setEditingTrainingWeek, setFitnessViewMode, setMemoriesView, setSelectedFitnessEvent, setSelectedPartyEvent, setSelectedTrip, setShowAddMemoryModal, setTimelineSortOrder, setTimelineYearFilter, timelineSortOrder, timelineYearFilter, trips, uploadingToEventId, uploadingToMemoryId }} />
          )}
          {/* ========== END MEMORIES SECTION ========== */}

        </div>
      </main>


      {/* New Trip Modal */}
      {showNewTripModal && (
        <NewTripModal
          type={showNewTripModal}
          onClose={() => setShowNewTripModal(null)}
          wishlist={wishlist}
          setWishlist={setWishlist}
          saveToFirestore={saveToFirestore}
          addNewTrip={addNewTrip}
        />
      )}

      {/* Random Experience Modal */}
      {showRandomExperience && (
        <RandomExperienceModal
          onClose={() => setShowRandomExperience(false)}
          wishlist={wishlist}
          setWishlist={setWishlist}
          saveToFirestore={saveToFirestore}
          setShowNewTripModal={setShowNewTripModal}
        />
      )}

      {/* Guest Modal - Top Level */}
      {showGuestModal && !selectedTrip && (() => {
        const trip = trips.find(t => t.id === showGuestModal);
        return trip ? (
          <GuestModal
            trip={trip}
            onClose={() => setShowGuestModal(null)}
            setTrips={setTrips}
            guestEmail={guestEmail}
            setGuestEmail={setGuestEmail}
            guestPermission={guestPermission}
            setGuestPermission={setGuestPermission}
            currentUser={currentUser}
          />
        ) : null;
      })()}

      {/* Open Date Modal */}
      {showOpenDateModal && (
        <OpenDateModal
          onClose={() => setShowOpenDateModal(false)}
          openDates={openDates}
          setOpenDates={setOpenDates}
          companions={companions}
        />
      )}

      {/* Companions Modal */}
      {showCompanionsModal && (
        <CompanionsModal
          onClose={() => setShowCompanionsModal(false)}
          companions={companions}
          setCompanions={setCompanions}
          setOpenDates={setOpenDates}
        />
      )}

      {/* My Profile Modal - For companions */}
      {showMyProfileModal && currentCompanion && (
        <MyProfileModal
          onClose={() => setShowMyProfileModal(false)}
          currentCompanion={currentCompanion}
          setCompanions={setCompanions}
          setCurrentCompanion={setCurrentCompanion}
        />
      )}

      {/* ========== SHARED HUB MODALS ========== */}
      {showAddTaskModal && (
        <AddTaskModal
          onClose={() => setShowAddTaskModal(null)}
          onDelete={(taskId) => { deleteTask(taskId); setShowAddTaskModal(null); }}
          onSave={(task) => {
            if (showAddTaskModal && showAddTaskModal.id) {
              updateTask(showAddTaskModal.id, task);
            } else {
              addTask(task);
            }
            setShowAddTaskModal(null);
          }}
          editTask={typeof showAddTaskModal === 'object' && showAddTaskModal?.id ? showAddTaskModal : (typeof showAddTaskModal === 'object' && showAddTaskModal?._prefill ? showAddTaskModal : null)}
          currentUser={currentUser}
          trips={trips}
          fitnessEvents={fitnessEvents}
          partyEvents={partyEvents}
        />
      )}

      {showSharedListModal && (
        <SharedListModal
          onClose={() => setShowSharedListModal(null)}
          onSave={(list) => {
            if (typeof showSharedListModal === 'object' && showSharedListModal?.id) {
              updateList(showSharedListModal.id, list);
            } else {
              addList(list);
            }
            setShowSharedListModal(null);
          }}
          editList={typeof showSharedListModal === 'object' && showSharedListModal?.id ? showSharedListModal : null}
          currentUser={currentUser}
          trips={trips}
          fitnessEvents={fitnessEvents}
          partyEvents={partyEvents}
          onUpdateItems={(listId, items) => {
            const newLists = sharedLists.map(l => l.id === listId ? { ...l, items } : l);
            setSharedLists(newLists);
            saveSharedHub(newLists, null, null);
          }}
        />
      )}

      {showAddIdeaModal && (
        <AddIdeaModal
          onClose={() => setShowAddIdeaModal(null)}
          onSave={(idea) => {
            if (typeof showAddIdeaModal === 'object' && showAddIdeaModal?.id) {
              updateIdea(showAddIdeaModal.id, idea);
            } else {
              addIdea(idea);
            }
            setShowAddIdeaModal(null);
          }}
          editIdea={typeof showAddIdeaModal === 'object' && showAddIdeaModal?.id ? showAddIdeaModal : null}
          currentUser={currentUser}
          onPromoteToTask={promoteIdeaToTask}
        />
      )}

      {showAddSocialModal && (
        <AddSocialModal
          onClose={() => setShowAddSocialModal(null)}
          onSave={(social) => {
            if (typeof showAddSocialModal === 'object' && showAddSocialModal?.id) {
              updateSocial(showAddSocialModal.id, social);
            } else {
              addSocial(social);
            }
            setShowAddSocialModal(null);
          }}
          editSocial={typeof showAddSocialModal === 'object' && showAddSocialModal?.id ? showAddSocialModal : (typeof showAddSocialModal === 'object' && showAddSocialModal?._prefill ? showAddSocialModal : null)}
          currentUser={currentUser}
          partyEvents={partyEvents}
          onLinkToEvent={navigateToEvent}
        />
      )}

      {showAddGoalModal && (
        <AddGoalModal
          onClose={() => setShowAddGoalModal(null)}
          onSave={(goal) => {
            if (typeof showAddGoalModal === 'object' && showAddGoalModal?.id) {
              updateGoal(showAddGoalModal.id, goal);
            } else {
              addGoal(goal);
            }
            setShowAddGoalModal(null);
          }}
          editGoal={typeof showAddGoalModal === 'object' && showAddGoalModal?.id ? showAddGoalModal : null}
          currentUser={currentUser}
        />
      )}

      {showOdysseyPlanModal && (
        <AddOdysseyPlanModal
          onClose={() => setShowOdysseyPlanModal(null)}
          onSave={(plan) => {
            if (typeof showOdysseyPlanModal === 'object' && showOdysseyPlanModal?.id) {
              updateOdysseyPlan(showOdysseyPlanModal.id, plan);
            } else {
              addOdysseyPlan(plan);
            }
            setShowOdysseyPlanModal(null);
          }}
          editPlan={typeof showOdysseyPlanModal === 'object' && showOdysseyPlanModal?.id ? showOdysseyPlanModal : null}
          currentUser={currentUser}
        />
      )}

      {/* Add/Edit Fitness Event Modal */}
      {(showAddFitnessEventModal || editingFitnessEvent) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-lg max-h-[85dvh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {editingFitnessEvent ? 'Edit Training Event' : 'New Training Event'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddFitnessEventModal(false);
                    setEditingFitnessEvent(null);
                    setNewFitnessEventData({
                      name: '', emoji: '🏃', date: '', type: 'running',
                      url: '', trainingWeeks: 12, color: 'from-orange-400 to-red-500',
                      description: '', participants: 'both', location: '', coverImage: null
                    });
                    setFitnessCoverImagePreview(null);
                  }}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Event Name & Emoji */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-white/70 mb-1">Event Name *</label>
                  <input
                    type="text"
                    value={editingFitnessEvent?.name || newFitnessEventData.name}
                    onChange={(e) => editingFitnessEvent
                      ? setEditingFitnessEvent({ ...editingFitnessEvent, name: e.target.value })
                      : setNewFitnessEventData({ ...newFitnessEventData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                    placeholder="e.g., Chicago Marathon 2027"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Emoji</label>
                  <select
                    value={editingFitnessEvent?.emoji || newFitnessEventData.emoji}
                    onChange={(e) => editingFitnessEvent
                      ? setEditingFitnessEvent({ ...editingFitnessEvent, emoji: e.target.value })
                      : setNewFitnessEventData({ ...newFitnessEventData, emoji: e.target.value })
                    }
                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-xl"
                  >
                    <option value="🏃">🏃 Running</option>
                    <option value="🏊">🏊 Swimming</option>
                    <option value="🚴">🚴 Cycling</option>
                    <option value="🏋️">🏋️ Strength</option>
                    <option value="🎯">🎯 Goal</option>
                    <option value="🏆">🏆 Race</option>
                    <option value="⛰️">⛰️ Trail</option>
                    <option value="🧘">🧘 Yoga</option>
                  </select>
                </div>
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Event Type *</label>
                <select
                  value={editingFitnessEvent?.type || newFitnessEventData.type}
                  onChange={(e) => editingFitnessEvent
                    ? setEditingFitnessEvent({ ...editingFitnessEvent, type: e.target.value })
                    : setNewFitnessEventData({ ...newFitnessEventData, type: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="running">5K / 10K Run</option>
                  <option value="half-marathon">Half Marathon</option>
                  <option value="marathon">Marathon</option>
                  <option value="triathlon">Triathlon</option>
                  <option value="cycling">Cycling Event</option>
                  <option value="swimming">Swimming Event</option>
                  <option value="obstacle">Obstacle Course / Spartan</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Event Date */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Event Date *</label>
                <input
                  type="date"
                  value={editingFitnessEvent?.date || newFitnessEventData.date}
                  onChange={(e) => editingFitnessEvent
                    ? setEditingFitnessEvent({ ...editingFitnessEvent, date: e.target.value })
                    : setNewFitnessEventData({ ...newFitnessEventData, date: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g., Chicago, IL or Course Address"
                  value={editingFitnessEvent?.location || newFitnessEventData.location}
                  onChange={(e) => editingFitnessEvent
                    ? setEditingFitnessEvent({ ...editingFitnessEvent, location: e.target.value })
                    : setNewFitnessEventData({ ...newFitnessEventData, location: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Cover Photo (optional)</label>
                {(editingFitnessEvent?.coverImage || newFitnessEventData.coverImage || fitnessCoverImagePreview) ? (
                  <div className="relative rounded-xl overflow-hidden mb-3">
                    <img
                      src={fitnessCoverImagePreview || (editingFitnessEvent ? editingFitnessEvent.coverImage : newFitnessEventData.coverImage)}
                      alt="Cover preview"
                      className="w-full h-32 object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    {uploadingFitnessCoverImage && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={removeFitnessCoverImage}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-full hover:bg-red-500 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3 mb-3">
                    {/* Camera capture button */}
                    <button
                      type="button"
                      onClick={() => fitnessCoverCameraRef.current?.click()}
                      className="flex-1 flex flex-col items-center gap-2 p-3 border border-dashed border-white/30 rounded-xl hover:border-orange-400 hover:bg-white/5 transition"
                    >
                      <Camera className="w-5 h-5 text-white/50" />
                      <span className="text-xs text-white/50">Take Photo</span>
                    </button>
                    <input
                      ref={fitnessCoverCameraRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFitnessCoverImageSelect}
                      className="hidden"
                    />

                    {/* Gallery upload button */}
                    <button
                      type="button"
                      onClick={() => fitnessCoverFileRef.current?.click()}
                      className="flex-1 flex flex-col items-center gap-2 p-3 border border-dashed border-white/30 rounded-xl hover:border-orange-400 hover:bg-white/5 transition"
                    >
                      <Image className="w-5 h-5 text-white/50" />
                      <span className="text-xs text-white/50">Choose Photo</span>
                    </button>
                    <input
                      ref={fitnessCoverFileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFitnessCoverImageSelect}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Training Duration */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Training Duration (weeks)</label>
                <input
                  type="number"
                  min="4"
                  max="52"
                  value={editingFitnessEvent?.trainingWeeks || newFitnessEventData.trainingWeeks}
                  onChange={(e) => editingFitnessEvent
                    ? setEditingFitnessEvent({ ...editingFitnessEvent, trainingWeeks: parseInt(e.target.value) || 12 })
                    : setNewFitnessEventData({ ...newFitnessEventData, trainingWeeks: parseInt(e.target.value) || 12 })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                />
                <p className="text-white/40 text-xs mt-1">Training will start this many weeks before the event</p>
              </div>

              {/* Participants */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Who's Training?</label>
                <div className="flex gap-2">
                  {[
                    { value: 'both', label: 'Both Mike & Adam' },
                    { value: 'mike', label: 'Mike Only' },
                    { value: 'adam', label: 'Adam Only' }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => editingFitnessEvent
                        ? setEditingFitnessEvent({ ...editingFitnessEvent, participants: opt.value })
                        : setNewFitnessEventData({ ...newFitnessEventData, participants: opt.value })
                      }
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                        (editingFitnessEvent?.participants || newFitnessEventData.participants) === opt.value
                          ? 'bg-orange-500 text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Event URL */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Event URL (optional)</label>
                <input
                  type="url"
                  value={editingFitnessEvent?.url || newFitnessEventData.url}
                  onChange={(e) => editingFitnessEvent
                    ? setEditingFitnessEvent({ ...editingFitnessEvent, url: e.target.value })
                    : setNewFitnessEventData({ ...newFitnessEventData, url: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                  placeholder="https://race-registration.com/event"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Color Theme</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: 'from-orange-400 to-red-500', label: 'Orange/Red' },
                    { value: 'from-blue-400 to-cyan-500', label: 'Blue/Cyan' },
                    { value: 'from-green-400 to-emerald-500', label: 'Green' },
                    { value: 'from-purple-400 to-pink-500', label: 'Purple/Pink' },
                    { value: 'from-yellow-400 to-orange-500', label: 'Yellow/Orange' }
                  ].map(color => (
                    <button
                      key={color.value}
                      onClick={() => editingFitnessEvent
                        ? setEditingFitnessEvent({ ...editingFitnessEvent, color: color.value })
                        : setNewFitnessEventData({ ...newFitnessEventData, color: color.value })
                      }
                      className={`w-10 h-10 rounded-lg bg-gradient-to-r ${color.value} ${
                        (editingFitnessEvent?.color || newFitnessEventData.color) === color.value
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800'
                          : ''
                      }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Notes (optional)</label>
                <textarea
                  value={editingFitnessEvent?.description || newFitnessEventData.description}
                  onChange={(e) => editingFitnessEvent
                    ? setEditingFitnessEvent({ ...editingFitnessEvent, description: e.target.value })
                    : setNewFitnessEventData({ ...newFitnessEventData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 resize-none"
                  rows={2}
                  placeholder="Any notes about this event..."
                />
              </div>

              {/* Invite Guests - Coming Soon */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Invite Guests</label>
                <div className="p-4 bg-white/5 border border-dashed border-white/20 rounded-lg text-center">
                  <UserPlus className="w-6 h-6 text-white/30 mx-auto mb-2" />
                  <p className="text-white/40 text-sm">Guest invitations coming soon!</p>
                  <p className="text-white/30 text-xs mt-1">You'll be able to invite friends to train together</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 flex justify-between">
              {editingFitnessEvent && (
                <button
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete this event?')) {
                      const updatedEvents = fitnessEvents.filter(e => e.id !== editingFitnessEvent.id);
                      setFitnessEvents(updatedEvents);
                      // Also remove the training plan
                      const updatedPlans = { ...fitnessTrainingPlans };
                      delete updatedPlans[editingFitnessEvent.id];
                      setFitnessTrainingPlans(updatedPlans);
                      await saveFitnessToFirestore(updatedEvents, updatedPlans);
                      setEditingFitnessEvent(null);
                      if (selectedFitnessEvent?.id === editingFitnessEvent.id) {
                        setSelectedFitnessEvent(fitnessEvents[0] || null);
                      }
                      showToast('Event deleted', 'success');
                    }
                  }}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
                >
                  Delete Event
                </button>
              )}
              <div className="flex gap-3 ml-auto">
                <button
                  onClick={() => {
                    setShowAddFitnessEventModal(false);
                    setEditingFitnessEvent(null);
                    setNewFitnessEventData({
                      name: '', emoji: '🏃', date: '', type: 'running',
                      url: '', trainingWeeks: 12, color: 'from-orange-400 to-red-500',
                      description: '', participants: 'both', location: '', coverImage: null
                    });
                    setFitnessCoverImagePreview(null);
                  }}
                  className="px-5 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const data = editingFitnessEvent || newFitnessEventData;
                    if (!data.name || !data.date) {
                      showToast('Please fill in event name and date', 'error');
                      return;
                    }

                    if (editingFitnessEvent) {
                      // Update existing event
                      const updatedEvents = fitnessEvents.map(e =>
                        e.id === editingFitnessEvent.id ? editingFitnessEvent : e
                      );
                      setFitnessEvents(updatedEvents);
                      await saveFitnessToFirestore(updatedEvents, fitnessTrainingPlans);
                      showToast('Event updated!', 'success');
                    } else {
                      // Create new event
                      const eventId = `event-${Date.now()}`;
                      const newEvent = {
                        id: eventId,
                        name: data.name,
                        emoji: data.emoji,
                        date: data.date,
                        type: data.type,
                        url: data.url,
                        trainingWeeks: data.trainingWeeks,
                        color: data.color,
                        description: data.description,
                        participants: data.participants,
                        location: data.location || '',
                        coverImage: data.coverImage || null
                      };

                      // Generate training plan based on event date and duration
                      const eventDate = new Date(data.date);
                      const startDate = new Date(eventDate);
                      startDate.setDate(startDate.getDate() - (data.trainingWeeks * 7));
                      const trainingPlan = generateTrainingWeeks(
                        toLocalDateStr(startDate),
                        data.date,
                        eventId
                      );

                      // Mark as Mike-only if applicable
                      if (data.participants === 'mike') {
                        trainingPlan.forEach(week => {
                          week.runs.forEach(run => delete run.adam);
                          week.crossTraining.forEach(ct => delete ct.adam);
                        });
                      } else if (data.participants === 'adam') {
                        trainingPlan.forEach(week => {
                          week.runs.forEach(run => delete run.mike);
                          week.crossTraining.forEach(ct => delete ct.mike);
                        });
                      }

                      const updatedEvents = [...fitnessEvents, newEvent];
                      const updatedPlans = { ...fitnessTrainingPlans, [eventId]: trainingPlan };

                      setFitnessEvents(updatedEvents);
                      setFitnessTrainingPlans(updatedPlans);
                      setSelectedFitnessEvent(newEvent);
                      await saveFitnessToFirestore(updatedEvents, updatedPlans);
                      showToast('Training event created!', 'success');
                    }

                    setShowAddFitnessEventModal(false);
                    setEditingFitnessEvent(null);
                    setNewFitnessEventData({
                      name: '', emoji: '🏃', date: '', type: 'running',
                      url: '', trainingWeeks: 12, color: 'from-orange-400 to-red-500',
                      description: '', participants: 'both', location: '', coverImage: null
                    });
                    setFitnessCoverImagePreview(null);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:opacity-90 transition"
                >
                  {editingFitnessEvent ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Training Week Modal */}
      {editingTrainingWeek && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[85dvh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  Edit Week {editingTrainingWeek.week.weekNumber || getActiveTrainingPlan(editingTrainingWeek.eventId).findIndex(w => w.id === editingTrainingWeek.week.id) + 1}
                </h2>
                <button
                  onClick={() => setEditingTrainingWeek(null)}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-white/60 text-sm mt-1">
                {formatDate(editingTrainingWeek.week.startDate)} - {formatDate(editingTrainingWeek.week.endDate)}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Activities Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-orange-300">🏃 Activities</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        // Triathlon was removed; detect Mike-only plans by missing `adam` field on existing workouts.
                        const isMikeOnly = editingTrainingWeek.runs?.[0] && !('adam' in editingTrainingWeek.runs[0]);
                        const newRun = {
                          id: Date.now(),
                          label: 'Run',
                          distance: '0 mi',
                          mike: false,
                          ...(isMikeOnly ? {} : { adam: false }),
                          notes: ''
                        };
                        setEditingTrainingWeek(prev => ({
                          ...prev,
                          week: {
                            ...prev.week,
                            runs: [...(prev.week.runs || []), newRun]
                          }
                        }));
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-orange-500/20 text-orange-300 rounded-lg text-sm hover:bg-orange-500/30 transition"
                    >
                      <Plus className="w-4 h-4" />
                      Run
                    </button>
                    <button
                      onClick={() => {
                        // Triathlon was removed; detect Mike-only plans by missing `adam` field on existing workouts.
                        const isMikeOnly = editingTrainingWeek.runs?.[0] && !('adam' in editingTrainingWeek.runs[0]);
                        const newSwim = {
                          id: Date.now(),
                          label: '🏊 Swim',
                          distance: '0 yds',
                          mike: false,
                          ...(isMikeOnly ? {} : { adam: false }),
                          notes: ''
                        };
                        setEditingTrainingWeek(prev => ({
                          ...prev,
                          week: {
                            ...prev.week,
                            runs: [...(prev.week.runs || []), newSwim]
                          }
                        }));
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg text-sm hover:bg-blue-500/30 transition"
                    >
                      <Plus className="w-4 h-4" />
                      Swim
                    </button>
                    <button
                      onClick={() => {
                        // Triathlon was removed; detect Mike-only plans by missing `adam` field on existing workouts.
                        const isMikeOnly = editingTrainingWeek.runs?.[0] && !('adam' in editingTrainingWeek.runs[0]);
                        const newBike = {
                          id: Date.now(),
                          label: 'Bike',
                          distance: '0 mi',
                          mike: false,
                          ...(isMikeOnly ? {} : { adam: false }),
                          notes: ''
                        };
                        setEditingTrainingWeek(prev => ({
                          ...prev,
                          week: {
                            ...prev.week,
                            runs: [...(prev.week.runs || []), newBike]
                          }
                        }));
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-300 rounded-lg text-sm hover:bg-green-500/30 transition"
                    >
                      <Plus className="w-4 h-4" />
                      Bike
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {editingTrainingWeek.week.runs?.map((run, idx) => {
                    // Determine if this is a swim based on label
                    const isSwim = run.label?.toLowerCase().includes('swim');
                    const unit = isSwim ? 'yds' : 'mi';
                    // Parse numeric value from distance string (e.g., "450 yds" → 450)
                    const numericDistance = parseFloat(String(run.distance || '0').replace(/[^\d.]/g, '')) || 0;

                    return (
                      <div key={run.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                        <input
                          type="text"
                          value={run.label || ''}
                          onChange={(e) => {
                            const updatedRuns = [...editingTrainingWeek.week.runs];
                            // Update unit when label changes
                            const newIsSwim = e.target.value.toLowerCase().includes('swim');
                            const newUnit = newIsSwim ? 'yds' : 'mi';
                            const currentNum = parseFloat(String(run.distance || '0').replace(/[^\d.]/g, '')) || 0;
                            updatedRuns[idx] = {
                              ...run,
                              label: e.target.value,
                              distance: `${currentNum} ${newUnit}`
                            };
                            setEditingTrainingWeek(prev => ({
                              ...prev,
                              week: { ...prev.week, runs: updatedRuns }
                            }));
                          }}
                          className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                          placeholder="Activity name"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={numericDistance || ''}
                            onChange={(e) => {
                              const updatedRuns = [...editingTrainingWeek.week.runs];
                              updatedRuns[idx] = { ...run, distance: `${e.target.value} ${unit}` };
                              setEditingTrainingWeek(prev => ({
                                ...prev,
                                week: { ...prev.week, runs: updatedRuns }
                              }));
                            }}
                            className="w-20 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm text-center"
                            placeholder="0"
                            step={isSwim ? "25" : "0.1"}
                          />
                          <span className={`text-sm ${isSwim ? 'text-blue-400' : 'text-white/60'}`}>{unit}</span>
                        </div>
                        <button
                          onClick={() => {
                            const updatedRuns = editingTrainingWeek.week.runs.filter((_, i) => i !== idx);
                            setEditingTrainingWeek(prev => ({
                              ...prev,
                              week: { ...prev.week, runs: updatedRuns }
                            }));
                          }}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cross Training Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-red-300">💪 Cross Training</h3>
                  <button
                    onClick={() => {
                      const newCT = {
                        id: Date.now(),
                        label: 'New Cross Training',
                        mike: false,
                        adam: false,
                        notes: ''
                      };
                      setEditingTrainingWeek(prev => ({
                        ...prev,
                        week: {
                          ...prev.week,
                          crossTraining: [...(prev.week.crossTraining || []), newCT]
                        }
                      }));
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-300 rounded-lg text-sm hover:bg-red-500/30 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add Cross Training
                  </button>
                </div>
                <div className="space-y-2">
                  {editingTrainingWeek.week.crossTraining?.map((ct, idx) => (
                    <div key={ct.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                      <input
                        type="text"
                        value={ct.label || ''}
                        onChange={(e) => {
                          const updatedCT = [...editingTrainingWeek.week.crossTraining];
                          updatedCT[idx] = { ...ct, label: e.target.value };
                          setEditingTrainingWeek(prev => ({
                            ...prev,
                            week: { ...prev.week, crossTraining: updatedCT }
                          }));
                        }}
                        className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                        placeholder="Activity name"
                      />
                      <button
                        onClick={() => {
                          const updatedCT = editingTrainingWeek.week.crossTraining.filter((_, i) => i !== idx);
                          setEditingTrainingWeek(prev => ({
                            ...prev,
                            week: { ...prev.week, crossTraining: updatedCT }
                          }));
                        }}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Week Notes */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">📝 Week Notes</h3>
                <textarea
                  value={editingTrainingWeek.week.weekNotes || ''}
                  onChange={(e) => {
                    setEditingTrainingWeek(prev => ({
                      ...prev,
                      week: { ...prev.week, weekNotes: e.target.value }
                    }));
                  }}
                  placeholder="Add notes for this week..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 resize-none"
                  rows={3}
                />
              </div>

              {/* Photos */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">📷 Photos</h3>
                {(editingTrainingWeek.week.photos || []).length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {(editingTrainingWeek.week.photos || []).map((photo, photoIdx) => (
                      <div key={photo.id} className="relative group/photo">
                        <img src={photo.url} alt="" className="w-24 h-24 rounded-xl object-cover border border-white/20 cursor-pointer" onClick={() => openLightbox((editingTrainingWeek.week.photos || []).map(p => p.url), photoIdx)} />
                        <button
                          onClick={() => {
                            setEditingTrainingWeek(prev => ({
                              ...prev,
                              week: { ...prev.week, photos: (prev.week.photos || []).filter(p => p.id !== photo.id) }
                            }));
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition shadow-lg"
                        >
                          <X className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div
                  onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer?.files?.[0]; if (file) handleWeekPhotoAdd(editingTrainingWeek.eventId, editingTrainingWeek.week.id, editingTrainingWeek.week.photos || [], file); }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {uploadingWeekPhotoId === editingTrainingWeek.week.id ? (
                    <div className="flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl border-orange-400 bg-orange-500/10 text-orange-300">
                      <Loader className="w-5 h-5 animate-spin" />
                      <span className="text-sm">Uploading photo...</span>
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition border-white/20 text-white/40 hover:text-white/60 hover:border-white/30">
                      <Upload className="w-5 h-5" />
                      <span className="text-sm">Add Photo</span>
                      <input
                        type="file"
                        accept="image/*,.heic,.heif"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleWeekPhotoAdd(editingTrainingWeek.eventId, editingTrainingWeek.week.id, editingTrainingWeek.week.photos || [], file);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setEditingTrainingWeek(null)}
                className="px-5 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Save the edited week
                  const { eventId, week } = editingTrainingWeek;

                  // Calculate new total miles
                  const totalMiles = week.runs?.reduce((sum, run) => sum + (parseFloat(run.distance) || 0), 0) || 0;

                  // Update the training plan
                  updateTrainingWeek(eventId, week.id || `week-${week.weekNumber}`, {
                    runs: week.runs || [],
                    crossTraining: week.crossTraining || [],
                    weekNotes: week.weekNotes || '',
                    photos: week.photos || [],
                    totalMiles: totalMiles
                  });

                  setEditingTrainingWeek(null);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:opacity-90 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearch && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-[10vh] p-4"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowSearch(false); setSearchQuery(''); } }}
        >
          <div className="bg-slate-800 rounded-2xl w-full max-w-lg max-h-[70vh] overflow-hidden flex flex-col shadow-2xl border border-white/10">
            {/* Search input */}
            <div className="border-b border-white/10 p-3 flex items-center gap-3">
              <Search className="w-5 h-5 text-white/40 shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Search tasks, lists, ideas, social, habits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Escape') { setShowSearch(false); setSearchQuery(''); } }}
                className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-white/40 hover:text-white transition p-1">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter chips */}
            <div className="flex gap-2 flex-wrap px-3 py-2.5 border-b border-white/10">
              {[
                { key: 'tasks', label: 'Tasks', emoji: '✅' },
                { key: 'lists', label: 'Lists', emoji: '📝' },
                { key: 'ideas', label: 'Ideas', emoji: '💡' },
                { key: 'social', label: 'Social', emoji: '👥' },
                { key: 'goals', label: 'Goals', emoji: '🎯' },
                { key: 'travel', label: 'Travel', emoji: '✈️' },
                { key: 'events', label: 'Events', emoji: '🎉' },
                { key: 'fitness', label: 'Fitness', emoji: '🏃' },
                { key: 'memories', label: 'Memories', emoji: '💝' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setSearchFilters(prev => ({ ...prev, [f.key]: !prev[f.key] }))}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                    searchFilters[f.key]
                      ? 'bg-purple-500/25 text-purple-300 border border-purple-400/40'
                      : 'bg-white/5 text-white/40 border border-white/10'
                  }`}
                >
                  {f.emoji} {f.label}
                </button>
              ))}
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {!searchQuery.trim() ? (
                <div className="p-8 text-center text-white/40 text-sm">Type to search across all your data</div>
              ) : totalSearchResults === 0 ? (
                <div className="p-8 text-center text-white/40 text-sm">No results for "{searchQuery}"</div>
              ) : (
                <div className="p-3 space-y-4">
                  {/* Tasks */}
                  {searchResults.tasks.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2 px-1">Tasks ({searchResults.tasks.length})</h4>
                      <div className="space-y-1">
                        {searchResults.tasks.map(t => (
                          <button key={t.id} onClick={() => handleSearchResultClick('tasks', t.id)}
                            className="w-full text-left p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center gap-3">
                            <span className="text-base">✅</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{t.title}</p>
                              {t.description && <p className="text-xs text-white/40 truncate mt-0.5">{t.description}</p>}
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lists */}
                  {searchResults.lists.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2 px-1">Lists ({searchResults.lists.length})</h4>
                      <div className="space-y-1">
                        {searchResults.lists.map(l => (
                          <button key={l.id} onClick={() => handleSearchResultClick('lists', l.id)}
                            className="w-full text-left p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center gap-3">
                            <span className="text-base">{l.emoji || '📝'}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{l.name}</p>
                              <p className="text-xs text-white/40 mt-0.5">{l.items?.length || 0} items{l.items?.some(i => i.text?.toLowerCase().includes(searchQuery.toLowerCase())) ? ' · match in items' : ''}</p>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ideas */}
                  {searchResults.ideas.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2 px-1">Ideas ({searchResults.ideas.length})</h4>
                      <div className="space-y-1">
                        {searchResults.ideas.map(i => (
                          <button key={i.id} onClick={() => handleSearchResultClick('ideas', i.id)}
                            className="w-full text-left p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center gap-3">
                            <span className="text-base">💡</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{i.title}</p>
                              {i.description && <p className="text-xs text-white/40 truncate mt-0.5">{i.description}</p>}
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Social */}
                  {searchResults.social.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2 px-1">Social ({searchResults.social.length})</h4>
                      <div className="space-y-1">
                        {searchResults.social.map(s => (
                          <button key={s.id} onClick={() => handleSearchResultClick('social', s.id)}
                            className="w-full text-left p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center gap-3">
                            <span className="text-base">👥</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{s.person}{s.title ? ` · ${s.title}` : ''}</p>
                              {s.description && <p className="text-xs text-white/40 truncate mt-0.5">{s.description}</p>}
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Goals */}
                  {searchResults.goals.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2 px-1">Goals ({searchResults.goals.length})</h4>
                      <div className="space-y-1">
                        {searchResults.goals.map(g => (
                          <button key={g.id} onClick={() => handleSearchResultClick('goals', g.id)}
                            className="w-full text-left p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center gap-3">
                            <span className="text-base">{g.emoji || '🎯'}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{g.title}</p>
                              {g.description && <p className="text-xs text-white/40 truncate mt-0.5">{g.description}</p>}
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Travel */}
                  {searchResults.travel.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2 px-1">Travel ({searchResults.travel.length})</h4>
                      <div className="space-y-1">
                        {searchResults.travel.map(t => (
                          <button key={t.id} onClick={() => handleSearchResultClick('travel', t.id)}
                            className="w-full text-left p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center gap-3">
                            <span className="text-base">{t.emoji || '✈️'}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{t.destination}</p>
                              <p className="text-xs text-white/40 mt-0.5">{t.dates?.start ? new Date(t.dates.start + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : t.isWishlist ? 'Wishlist' : ''}</p>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Events */}
                  {searchResults.events.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2 px-1">Events ({searchResults.events.length})</h4>
                      <div className="space-y-1">
                        {searchResults.events.map(e => (
                          <button key={e.id} onClick={() => handleSearchResultClick('events', e.id)}
                            className="w-full text-left p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center gap-3">
                            <span className="text-base">{e.emoji || '🎉'}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{e.name}</p>
                              {e.location && <p className="text-xs text-white/40 truncate mt-0.5">{e.location}</p>}
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fitness */}
                  {searchResults.fitness.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2 px-1">Fitness ({searchResults.fitness.length})</h4>
                      <div className="space-y-1">
                        {searchResults.fitness.map(f => (
                          <button key={f.id} onClick={() => handleSearchResultClick('fitness', f.id)}
                            className="w-full text-left p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center gap-3">
                            <span className="text-base">{f.emoji || '🏃'}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{f.name}</p>
                              <p className="text-xs text-white/40 mt-0.5">{f.date ? new Date(f.date + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : f.type}</p>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Memories */}
                  {searchResults.memories.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2 px-1">Memories ({searchResults.memories.length})</h4>
                      <div className="space-y-1">
                        {searchResults.memories.map(m => (
                          <button key={m.id} onClick={() => handleSearchResultClick('memories', m.id)}
                            className="w-full text-left p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center gap-3">
                            <span className="text-base">{m.icon || '💝'}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{m.title}</p>
                              {m.location && <p className="text-xs text-white/40 truncate mt-0.5">{m.location}</p>}
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Partnership Quote Modal - Enhanced with Pride content */}
      {showPartnershipQuote && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowPartnershipQuote(false)}
        >
          <div
            className="relative max-w-lg w-full my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Floating hearts animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute text-2xl animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: `${1.5 + Math.random()}s`
                  }}
                >
                  {['💕', '💖', '💗', '💝', '🌈', '✨', '💜', '💙'][i % 8]}
                </div>
              ))}
            </div>

            {/* Quote card */}
            <div className="relative bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
              {/* Rainbow top border */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 via-blue-500 to-purple-500 rounded-t-3xl" />

              {/* Close button */}
              <button
                onClick={() => setShowPartnershipQuote(false)}
                className="absolute top-4 right-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Embracing Who We Are Section */}
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">🏳️‍🌈</div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Embracing Who We Are
                </h3>
                <p className="text-white/70 text-sm mt-2 max-w-sm mx-auto">
                  Living authentically, celebrating our love, and building a life filled with pride, joy, and adventure.
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="text-white/40 text-xs uppercase tracking-wider">Our Promise</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>

              {/* Quote */}
              <div className="relative">
                <span className="absolute -top-4 -left-2 text-5xl text-pink-500/30">"</span>
                <p className="text-white/90 text-base leading-relaxed pl-6 pr-4 italic">
                  We should create a partnership. We should lift each other up when we are down, encourage each other to grow and learn. We should support each other through successes and failures. We should treat each other with respect, even when we fight (which we will.) We should make up and make out when that does happen. We should create something special just for the two of us and celebrate it.
                </p>
                <span className="absolute -bottom-6 right-0 text-5xl text-purple-500/30">"</span>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-white/10">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex gap-2 text-2xl">
                    {['🏳️‍🌈', '💜', '💙', '💖', '🦄'].map((emoji, i) => (
                      <span
                        key={i}
                        className="hover:scale-125 transition cursor-default"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        {emoji}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-center text-purple-300/60 text-sm mt-3 font-medium">
                  Love is love 💕
                </p>
                <p className="text-white/40 text-xs mt-2 text-center">Click anywhere to close</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Memory Modal */}
      {editingTrip && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-lg max-h-[85dvh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">{editingTrip.emoji}</span>
                  Edit Trip
                </h2>
                <button onClick={() => setEditingTrip(null)} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* Destination */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Destination</label>
                <input type="text" value={editingTrip.destination || ''} onChange={(e) => setEditingTrip(prev => ({ ...prev, destination: e.target.value }))} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40" />
              </div>
              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Start Date</label>
                  <input type="date" value={editingTrip.dates?.start || ''} onChange={(e) => setEditingTrip(prev => ({ ...prev, dates: { ...prev.dates, start: e.target.value } }))} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">End Date</label>
                  <input type="date" value={editingTrip.dates?.end || ''} onChange={(e) => setEditingTrip(prev => ({ ...prev, dates: { ...prev.dates, end: e.target.value } }))} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white" />
                </div>
              </div>
              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Cover Image URL</label>
                <input type="text" value={editingTrip.coverImage || ''} onChange={(e) => setEditingTrip(prev => ({ ...prev, coverImage: e.target.value }))} placeholder="Paste image URL..." className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40" />
                {editingTrip.coverImage && (
                  <img src={editingTrip.coverImage} alt="Cover preview" className="mt-2 w-full h-32 object-cover rounded-lg" />
                )}
              </div>
              {/* Special Note */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Special Note</label>
                <input type="text" value={editingTrip.special || ''} onChange={(e) => setEditingTrip(prev => ({ ...prev, special: e.target.value }))} placeholder="e.g., Harry Styles Concert!" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40" />
              </div>
            </div>
            {/* Footer */}
            <div className="p-6 border-t border-white/10 space-y-3">
              <button onClick={() => { setSelectedTrip(editingTrip); setEditingTrip(null); }} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition flex items-center justify-center gap-2">
                View Full Details <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => {
                const updatedTrips = trips.map(t => t.id === editingTrip.id ? editingTrip : t);
                setTrips(updatedTrips);
                setEditingTrip(null);
                showToast('Trip updated!');
              }} className="w-full py-3 bg-gradient-to-r from-teal-400 to-cyan-500 text-white font-bold rounded-xl hover:opacity-90 transition">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {editingPartyEvent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-lg max-h-[85dvh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">{editingPartyEvent.emoji}</span>
                  Edit Event
                </h2>
                <button onClick={() => setEditingPartyEvent(null)} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Event Name</label>
                <input type="text" value={editingPartyEvent.name || ''} onChange={(e) => setEditingPartyEvent(prev => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Date</label>
                  <input type="date" value={editingPartyEvent.date || ''} onChange={(e) => setEditingPartyEvent(prev => ({ ...prev, date: e.target.value }))} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Time</label>
                  <input type="time" value={editingPartyEvent.time || ''} onChange={(e) => setEditingPartyEvent(prev => ({ ...prev, time: e.target.value }))} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Location</label>
                <input type="text" value={editingPartyEvent.location || ''} onChange={(e) => setEditingPartyEvent(prev => ({ ...prev, location: e.target.value }))} placeholder="Where is it?" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Description</label>
                <textarea value={editingPartyEvent.description || ''} onChange={(e) => setEditingPartyEvent(prev => ({ ...prev, description: e.target.value }))} rows={3} placeholder="Event details..." className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Cover Image URL</label>
                <input type="text" value={editingPartyEvent.coverImage || ''} onChange={(e) => setEditingPartyEvent(prev => ({ ...prev, coverImage: e.target.value }))} placeholder="Paste image URL..." className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40" />
                {editingPartyEvent.coverImage && (
                  <img src={editingPartyEvent.coverImage} alt="Cover preview" className="mt-2 w-full h-32 object-cover rounded-lg" />
                )}
              </div>

              {/* Hub Tasks linked to this event */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-green-400" />
                  Hub Tasks
                </label>
                {(() => {
                  const linked = getLinkedHubItems('events', editingPartyEvent.id);
                  return linked.linkedTasks.length > 0 ? (
                    <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                      {linked.linkedTasks.map(task => (
                        <div key={task.id} className={`flex items-center gap-3 p-2.5 rounded-lg ${task.status === 'done' ? 'bg-green-500/10' : 'bg-white/5'}`}>
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                            task.status === 'done' ? 'bg-green-500 border-green-500 text-white' : 'border-slate-500'
                          }`}>
                            {task.status === 'done' && <Check className="w-3 h-3" />}
                          </div>
                          <span className={`flex-1 text-sm text-white ${task.status === 'done' ? 'line-through opacity-60' : ''}`}>{task.title}</span>
                          {task.assignedTo && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              task.assignedTo === 'Mike' ? 'bg-purple-500/30 text-purple-300' :
                              task.assignedTo === 'Adam' ? 'bg-blue-500/30 text-blue-300' :
                              'bg-amber-500/30 text-amber-300'
                            }`}>{task.assignedTo}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm mb-3">No tasks linked yet</p>
                  );
                })()}
                <button
                  onClick={() => {
                    setEditingPartyEvent(null);
                    setShowAddTaskModal({
                      _prefill: true,
                      linkedTo: { section: 'partyEvents', itemId: editingPartyEvent.id },
                    });
                  }}
                  className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Task in Hub
                </button>
              </div>
            </div>
            <div className="p-6 border-t border-white/10 space-y-3">
              <button onClick={() => { setSelectedPartyEvent(editingPartyEvent); setEditingPartyEvent(null); }} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition flex items-center justify-center gap-2">
                View Full Details <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => {
                const updatedEvents = partyEvents.map(e => e.id === editingPartyEvent.id ? editingPartyEvent : e);
                setPartyEvents(updatedEvents);
                savePartyEventsToFirestore(updatedEvents);
                setEditingPartyEvent(null);
                showToast('Event updated!', 'success');
              }} className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guest Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-lg max-h-[85dvh] overflow-y-auto border border-white/20">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-pink-400" />
                  Invite Guests
                </h2>
                <button onClick={() => { setShowInviteModal(null); setNewGuestName(''); setNewGuestEmail(''); setNewGuestPhone(''); }} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-slate-400 text-sm mt-1">{showInviteModal.emoji} {showInviteModal.name}</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Open RSVP / Public Share Link */}
              {(() => {
                const isPublic = showInviteModal.isPublic !== false;
                const publicLink = `${window.location.origin}/event/${showInviteModal.id}`;
                const formattedDate = showInviteModal.date ? new Date(showInviteModal.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD';
                const formattedTime = showInviteModal.time ? (() => { const [h,m] = showInviteModal.time.split(':'); const hr = parseInt(h); return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`; })() : '';
                const publicMessage = `🏳️‍🌈✨ You're Invited! ✨🏳️‍🌈\n\n🎉 ${showInviteModal.name}\n📅 ${formattedDate}${formattedTime ? ` at ${formattedTime}` : ''}\n📍 ${showInviteModal.location || 'TBD'}\n\n${showInviteModal.description || ''}\n\nTap to RSVP & see who's coming:\n${publicLink}\n\nHosted with love by Mike & Adam 💕`;
                const togglePublic = () => {
                  const next = !isPublic;
                  const newEvents = partyEvents.map(ev =>
                    ev.id === showInviteModal.id ? { ...ev, isPublic: next } : ev
                  );
                  setPartyEvents(newEvents);
                  const updated = newEvents.find(e => e.id === showInviteModal.id);
                  setShowInviteModal(updated);
                  if (selectedPartyEvent?.id === showInviteModal.id) setSelectedPartyEvent(updated);
                  savePartyEventsToFirestore(newEvents);
                  showToast(next ? 'Open RSVP on — anyone with the link can join' : 'Open RSVP off — invite-only', 'success');
                };
                return (
                  <div className="bg-gradient-to-br from-purple-500/15 to-pink-500/15 border border-purple-400/30 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-white font-semibold text-sm flex items-center gap-1.5">🔗 Shareable Link</h3>
                        <p className="text-slate-400 text-xs mt-0.5">Anyone with the link can add themselves & RSVP</p>
                      </div>
                      <button
                        onClick={togglePublic}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${isPublic ? 'bg-green-500' : 'bg-slate-600'}`}
                        aria-label="Toggle open RSVP"
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    {isPublic && (
                      <>
                        <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2">
                          <span className="text-slate-300 text-xs truncate flex-1">{publicLink}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              if (navigator.share) {
                                try { await navigator.share({ title: showInviteModal.name, text: publicMessage, url: publicLink }); } catch {}
                              } else {
                                await navigator.clipboard.writeText(publicMessage);
                                showToast('Invite copied!', 'success');
                              }
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs font-semibold hover:opacity-90 transition"
                          >
                            <Share2 className="w-3.5 h-3.5" /> Share invite
                          </button>
                          <button
                            onClick={async () => { await navigator.clipboard.writeText(publicLink); showToast('Link copied!', 'success'); }}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/10 text-white rounded-lg text-xs font-semibold hover:bg-white/20 transition"
                          >
                            📋 Copy link
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}

              {/* Add New Guest Form */}
              <div className="space-y-3">
                <h3 className="text-white font-semibold text-sm">Add a Guest</h3>
                <input
                  type="text"
                  placeholder="Name *"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-400"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newGuestEmail}
                  onChange={(e) => setNewGuestEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-400"
                />
                <input
                  type="tel"
                  placeholder="Phone (for text invite)"
                  value={newGuestPhone}
                  onChange={(e) => setNewGuestPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-400"
                />
                <button
                  onClick={() => {
                    if (!newGuestName.trim()) { showToast('Name is required', 'error'); return; }
                    const newGuest = {
                      id: Date.now(),
                      name: newGuestName.trim(),
                      email: newGuestEmail.trim() || null,
                      phone: newGuestPhone.trim() || null,
                      token: generateGuestToken(),
                      rsvp: 'pending',
                      plusOne: 0,
                      note: '',
                      permission: 'edit',
                      addedBy: currentUser,
                      addedAt: new Date().toISOString()
                    };
                    const newEvents = partyEvents.map(ev =>
                      ev.id === showInviteModal.id
                        ? { ...ev, guests: [...(ev.guests || []), newGuest] }
                        : ev
                    );
                    setPartyEvents(newEvents);
                    if (selectedPartyEvent?.id === showInviteModal.id) {
                      setSelectedPartyEvent(newEvents.find(e => e.id === showInviteModal.id));
                    }
                    setShowInviteModal(newEvents.find(e => e.id === showInviteModal.id));
                    savePartyEventsToFirestore(newEvents);
                    setNewGuestName('');
                    setNewGuestEmail('');
                    setNewGuestPhone('');
                    showToast(`${newGuest.name} added!`, 'success');
                  }}
                  disabled={!newGuestName.trim()}
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Add Guest
                </button>
              </div>

              {/* Current Guests with Share Links */}
              {(showInviteModal.guests || []).length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold text-sm">Guest List ({(showInviteModal.guests || []).length})</h3>
                    <button
                      onClick={() => {
                        setShowMessageModal(showInviteModal);
                        setMessageText(showInviteModal.announcement?.text || DEFAULT_LOGISTICS_NOTE);
                        setMessageFilter('today');
                        setMessageCopied(false);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-blue-200 rounded-lg text-xs font-medium hover:from-blue-500/40 hover:to-purple-500/40 transition"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      Message guests
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(showInviteModal.guests || []).map(guest => {
                      const inviteLink = `${window.location.origin}/event/${showInviteModal.id}?t=${guest.token}`;
                      const formattedDate = showInviteModal.date ? new Date(showInviteModal.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD';
                      const formattedTime = showInviteModal.time ? (() => { const [h,m] = showInviteModal.time.split(':'); const hr = parseInt(h); return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`; })() : '';
                      const inviteMessage = `🏳️‍🌈✨ You're Invited! ✨🏳️‍🌈\n\n${guest.name}, you're cordially summoned to:\n\n🎉 ${showInviteModal.name}\n📅 ${formattedDate}${formattedTime ? ` at ${formattedTime}` : ''}\n📍 ${showInviteModal.location || 'TBD'}\n\n${showInviteModal.description || ''}\n\nRSVP & see all the details:\n${inviteLink}\n\nHosted with love by Mike & Adam 💕`;
                      const htmlEmailBody = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:500px;margin:0 auto;background:#1e293b;border-radius:16px;overflow:hidden;color:white;"><div style="height:4px;background:linear-gradient(to right,#ef4444,#eab308,#22c55e,#3b82f6,#a855f7);"></div><div style="padding:32px;text-align:center;"><div style="font-size:48px;margin-bottom:12px;">${showInviteModal.emoji || '🎉'}</div><h1 style="color:white;font-size:24px;margin:0 0 4px;">You're Invited!</h1><p style="color:#94a3b8;margin:0 0 24px;">Hey ${guest.name}!</p><h2 style="color:white;font-size:20px;margin:0 0 16px;">${showInviteModal.name}</h2><p style="color:#cbd5e1;margin:4px 0;">📅 ${formattedDate}${formattedTime ? ` at ${formattedTime}` : ''}</p><p style="color:#cbd5e1;margin:4px 0;">📍 ${showInviteModal.location || 'TBD'}</p>${showInviteModal.description ? `<p style="color:#94a3b8;margin:16px 0;font-size:14px;">${showInviteModal.description}</p>` : ''}<a href="${inviteLink}" style="display:inline-block;margin:24px 0;padding:14px 40px;background:linear-gradient(to right,#a855f7,#ec4899);color:white;text-decoration:none;border-radius:12px;font-weight:bold;font-size:16px;">RSVP Now ✨</a><p style="color:#64748b;font-size:12px;margin-top:24px;">Hosted with love by Mike &amp; Adam 💕</p></div></div>`;

                      return (
                        <div key={guest.id} className="bg-white/5 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {(guest.name || '?').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-white text-sm font-medium">{guest.name}</div>
                                <div className="text-slate-500 text-xs">{guest.email || guest.phone || 'No contact info'}</div>
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              guest.rsvp === 'going' ? 'bg-green-500/30 text-green-300' :
                              guest.rsvp === 'maybe' ? 'bg-yellow-500/30 text-yellow-300' :
                              guest.rsvp === 'not-going' ? 'bg-red-500/30 text-red-300' :
                              'bg-slate-500/30 text-slate-300'
                            }`}>
                              {guest.rsvp === 'going' ? '✅ Going' :
                               guest.rsvp === 'maybe' ? '🤔 Maybe' :
                               guest.rsvp === 'not-going' ? '❌ Declined' :
                               '⏳ Pending'}
                            </span>
                          </div>

                          {/* Share buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                if (navigator.share) {
                                  try {
                                    await navigator.share({ title: showInviteModal.name, text: inviteMessage, url: inviteLink });
                                  } catch {}
                                } else {
                                  await navigator.clipboard.writeText(inviteMessage);
                                  showToast('Invite copied!', 'success');
                                }
                              }}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-300 rounded-lg text-xs hover:from-purple-500/40 hover:to-pink-500/40 transition"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              Share
                            </button>
                            {guest.email && (
                              <a
                                href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(guest.email)}&su=${encodeURIComponent(`You're invited: ${showInviteModal.name}`)}&body=${encodeURIComponent(inviteMessage)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-xs hover:bg-blue-500/30 transition"
                              >
                                ✉️ Email
                              </a>
                            )}
                            {guest.phone && (
                              <a
                                href={`sms:${guest.phone}?body=${encodeURIComponent(inviteMessage)}`}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-500/20 text-green-300 rounded-lg text-xs hover:bg-green-500/30 transition"
                              >
                                💬 Text
                              </a>
                            )}
                            <button
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(inviteLink);
                                  setInviteLinkCopied(guest.id);
                                  setTimeout(() => setInviteLinkCopied(null), 2000);
                                } catch {}
                              }}
                              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs transition ${
                                inviteLinkCopied === guest.id
                                  ? 'bg-green-500/30 text-green-300'
                                  : 'bg-white/10 text-white/60 hover:bg-white/20'
                              }`}
                            >
                              {inviteLinkCopied === guest.id ? <><Check className="w-3.5 h-3.5" /> Copied</> : '🔗 Link'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== Message Guests modal (send an update / logistics note) ===== */}
      {showMessageModal && (() => {
        const msgEvent = showMessageModal;
        const isToday = (iso) => {
          if (!iso) return false;
          const d = new Date(iso); const n = new Date();
          return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
        };
        const allGuests = msgEvent.guests || [];
        const recipients = allGuests.filter(g =>
          messageFilter === 'today' ? isToday(g.rsvpAt)
          : messageFilter === 'going' ? g.rsvp === 'going'
          : true
        );
        const recipientEmails = recipients.map(g => g.email).filter(Boolean);
        const recipientPhones = recipients.map(g => g.phone).filter(Boolean);
        const noEmail = recipients.filter(g => !g.email);
        const noContact = recipients.filter(g => !g.email && !g.phone);
        const subject = `Update: ${msgEvent.name}`;
        const gmailUrl = `https://mail.google.com/mail/?view=cm&bcc=${encodeURIComponent(recipientEmails.join(','))}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(messageText)}`;
        const smsUrl = `sms:${recipientPhones.join(',')}?&body=${encodeURIComponent(messageText)}`;
        const filters = [
          { key: 'today', label: "RSVP'd today", count: allGuests.filter(g => isToday(g.rsvpAt)).length },
          { key: 'going', label: 'Everyone going', count: allGuests.filter(g => g.rsvp === 'going').length },
          { key: 'all', label: 'Everyone', count: allGuests.length },
        ];
        const closeMsg = () => { setShowMessageModal(null); setMessageCopied(false); };
        const saveAnnouncement = async () => {
          setMessageSaving(true);
          try {
            const announcement = { text: messageText, updatedAt: new Date().toISOString(), updatedBy: currentUser || 'host' };
            const newEvents = partyEvents.map(ev => ev.id === msgEvent.id ? { ...ev, announcement } : ev);
            setPartyEvents(newEvents);
            const updated = newEvents.find(e => e.id === msgEvent.id);
            if (selectedPartyEvent?.id === msgEvent.id) setSelectedPartyEvent(updated);
            setShowInviteModal(prev => (prev && prev.id === msgEvent.id) ? updated : prev);
            setShowMessageModal(updated);
            await savePartyEventsToFirestore(newEvents);
            showToast('Posted to the event page — guests will see it.', 'success');
          } catch { /* save fn shows its own error toast */ }
          finally { setMessageSaving(false); }
        };
        const removeAnnouncement = async () => {
          setMessageSaving(true);
          try {
            const newEvents = partyEvents.map(ev => ev.id === msgEvent.id ? { ...ev, announcement: null } : ev);
            setPartyEvents(newEvents);
            const updated = newEvents.find(e => e.id === msgEvent.id);
            if (selectedPartyEvent?.id === msgEvent.id) setSelectedPartyEvent(updated);
            setShowInviteModal(prev => (prev && prev.id === msgEvent.id) ? updated : prev);
            setShowMessageModal(updated);
            await savePartyEventsToFirestore(newEvents);
            showToast('Removed from the event page.', 'success');
          } catch { /* save fn shows its own error toast */ }
          finally { setMessageSaving(false); }
        };
        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-2xl w-full max-w-lg max-h-[85dvh] overflow-y-auto">
              <div className="p-6 border-b border-white/10 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2"><Bell className="w-5 h-5" /> Message guests</h2>
                  <p className="text-slate-400 text-sm mt-1">{msgEvent.emoji} {msgEvent.name}</p>
                </div>
                <button onClick={closeMsg} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 space-y-5">
                {/* Recipient filter */}
                <div>
                  <label className="text-white font-semibold text-sm mb-2 block">Who gets this?</label>
                  <div className="grid grid-cols-3 gap-2">
                    {filters.map(f => (
                      <button
                        key={f.key}
                        onClick={() => setMessageFilter(f.key)}
                        className={`px-2 py-2 rounded-lg text-xs font-medium transition border ${
                          messageFilter === f.key
                            ? 'bg-blue-500/30 border-blue-400/50 text-blue-100'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {f.label}
                        <span className="block text-[11px] opacity-70 mt-0.5">{f.count} guest{f.count === 1 ? '' : 's'}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message body */}
                <div>
                  <label className="text-white font-semibold text-sm mb-2 block">Your note</label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    placeholder="Parking, entry instructions, what to bring…"
                  />
                </div>

                {/* Recipient summary */}
                <div className="text-xs text-slate-400 bg-white/5 rounded-lg p-3">
                  Of {recipients.length} selected guest{recipients.length === 1 ? '' : 's'}: <span className="text-white/80 font-medium">{recipientEmails.length}</span> with email, <span className="text-white/80 font-medium">{recipientPhones.length}</span> with phone.
                  {noContact.length > 0 && (
                    <span className="block mt-1">No email or phone for: {noContact.map(g => g.name).join(', ')}. Post it to the event page so they still see it.</span>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <a
                    href={recipientEmails.length ? gmailUrl : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => { if (!recipientEmails.length) e.preventDefault(); }}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition ${
                      recipientEmails.length
                        ? 'bg-blue-500/20 text-blue-200 hover:bg-blue-500/30'
                        : 'bg-white/5 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    ✉️ Email {recipientEmails.length || 'these'} guest{recipientEmails.length === 1 ? '' : 's'} via Gmail
                  </a>
                  <a
                    href={recipientPhones.length ? smsUrl : undefined}
                    onClick={(e) => { if (!recipientPhones.length) e.preventDefault(); }}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition ${
                      recipientPhones.length
                        ? 'bg-green-500/20 text-green-200 hover:bg-green-500/30'
                        : 'bg-white/5 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    💬 Text {recipientPhones.length || 'these'} guest{recipientPhones.length === 1 ? '' : 's'} via SMS
                  </a>
                  <button
                    onClick={saveAnnouncement}
                    disabled={messageSaving || !messageText.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {messageSaving ? <><Loader className="w-4 h-4 animate-spin" /> Saving…</> : '📣 Post to the event page'}
                  </button>
                  <button
                    onClick={async () => { try { await navigator.clipboard.writeText(messageText); setMessageCopied(true); setTimeout(() => setMessageCopied(false), 2000); } catch {} }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm bg-white/5 text-white/70 hover:bg-white/10 transition"
                  >
                    {messageCopied ? <><Check className="w-4 h-4" /> Copied</> : 'Copy note text'}
                  </button>
                  {msgEvent.announcement?.text && (
                    <button
                      onClick={removeAnnouncement}
                      disabled={messageSaving}
                      className="w-full text-center py-1.5 text-xs text-red-300/70 hover:text-red-300 transition disabled:opacity-50"
                    >
                      Remove note from event page
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {editingMemory && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-lg max-h-[85dvh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Edit Memory</h2>
                <button
                  onClick={() => setEditingMemory(null)}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Title</label>
                <input
                  type="text"
                  value={editingMemory.title || ''}
                  onChange={(e) => setEditingMemory(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                  placeholder="Memory title"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Date</label>
                <input
                  type="date"
                  value={editingMemory.date || ''}
                  onChange={(e) => setEditingMemory(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Location</label>
                <input
                  type="text"
                  value={editingMemory.location || ''}
                  onChange={(e) => setEditingMemory(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                  placeholder="Where did this happen?"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Description</label>
                <input
                  type="text"
                  value={editingMemory.description || ''}
                  onChange={(e) => setEditingMemory(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                  placeholder="Short description"
                />
              </div>

              {/* Photos & Videos */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Photos ({getMemoryImages(editingMemory).length}) & Videos ({(editingMemory.videos || []).length})
                </label>
                <div
                  className={`border-2 border-dashed rounded-xl p-4 transition ${
                    dragOver ? 'border-orange-500 bg-orange-500/10' : 'border-white/20'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => handleDrop(e, true)}
                >
                  {/* Existing videos grid */}
                  {(editingMemory.videos || []).length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-white/50 mb-2">🎬 Videos</p>
                      <div className="grid grid-cols-2 gap-2">
                        {(editingMemory.videos || []).map((video, idx) => (
                          <div key={idx} className="relative group aspect-video">
                            <video
                              src={video}
                              className="w-full h-full object-cover rounded-lg"
                              muted
                              playsInline
                              onMouseEnter={(e) => e.target.play()}
                              onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center group-hover:opacity-0 transition">
                                <span className="text-white text-lg ml-1">▶</span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const newVideos = (editingMemory.videos || []).filter((_, i) => i !== idx);
                                setEditingMemory(prev => ({ ...prev, videos: newVideos }));
                              }}
                              className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                              title="Remove video"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Existing images grid */}
                  {getMemoryImages(editingMemory).length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {(editingMemory.videos || []).length > 0 && <p className="text-xs text-white/50 mb-2 col-span-3">📷 Photos</p>}
                      {getMemoryImages(editingMemory).map((img, idx) => {
                        const imgSettings = editingMemory.imageSettings?.[idx] || { x: 50, y: 50, zoom: 100 };
                        return (
                          <div key={idx} className="relative group aspect-square">
                            <div
                              className={`w-full h-full overflow-hidden rounded-lg cursor-pointer ${
                                editingPhotoIndex === idx ? 'ring-2 ring-orange-500' : ''
                              }`}
                              onClick={() => {
                                setEditingPhotoIndex(editingPhotoIndex === idx ? null : idx);
                                setPhotoPosition(imgSettings);
                              }}
                            >
                              <img
                                src={img}
                                alt=""
                                className="w-full h-full object-cover transition-transform"
                                style={{
                                  objectPosition: `${imgSettings.x}% ${imgSettings.y}%`,
                                  transform: `scale(${imgSettings.zoom / 100})`
                                }}
                              />
                            </div>
                            {/* Adjust button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingPhotoIndex(editingPhotoIndex === idx ? null : idx);
                                setPhotoPosition(imgSettings);
                              }}
                              className={`absolute bottom-1 left-1 px-2 py-1 text-xs rounded-full transition ${
                                editingPhotoIndex === idx
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-black/50 text-white/80 opacity-0 group-hover:opacity-100 hover:bg-black/70'
                              }`}
                            >
                              {editingPhotoIndex === idx ? '✓ Editing' : '📐 Adjust'}
                            </button>
                            {/* Delete button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const allImages = getMemoryImages(editingMemory);
                                const newImages = allImages.filter((_, i) => i !== idx);
                                const newSettings = { ...(editingMemory.imageSettings || {}) };
                                delete newSettings[idx];
                                setEditingMemory(prev => ({ ...prev, images: newImages, image: '', imageSettings: newSettings }));
                                if (editingPhotoIndex === idx) setEditingPhotoIndex(null);
                              }}
                              className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                              title="Remove image"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Hint to adjust photos */}
                  {getMemoryImages(editingMemory).length > 0 && editingPhotoIndex === null && (
                    <div className="mb-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg text-center">
                      <p className="text-orange-300 text-sm">
                        💡 Click "Adjust" on any photo to position and zoom it for the card
                      </p>
                    </div>
                  )}

                  {/* Photo Position/Zoom Controls */}
                  {editingPhotoIndex !== null && getMemoryImages(editingMemory)[editingPhotoIndex] && (
                    <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-white/70">📐 Adjust Photo Position</span>
                        <button
                          onClick={() => setEditingPhotoIndex(null)}
                          className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 text-white/60 rounded transition"
                        >
                          Done
                        </button>
                      </div>

                      {/* Horizontal Position */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                          <span>← Left</span>
                          <span>Horizontal: {photoPosition.x}%</span>
                          <span>Right →</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={photoPosition.x}
                          onChange={(e) => {
                            const newX = parseInt(e.target.value);
                            setPhotoPosition(prev => ({ ...prev, x: newX }));
                            setEditingMemory(prev => ({
                              ...prev,
                              imageSettings: {
                                ...(prev.imageSettings || {}),
                                [editingPhotoIndex]: { ...photoPosition, x: newX }
                              }
                            }));
                          }}
                          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                      </div>

                      {/* Vertical Position */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                          <span>↑ Top</span>
                          <span>Vertical: {photoPosition.y}%</span>
                          <span>Bottom ↓</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={photoPosition.y}
                          onChange={(e) => {
                            const newY = parseInt(e.target.value);
                            setPhotoPosition(prev => ({ ...prev, y: newY }));
                            setEditingMemory(prev => ({
                              ...prev,
                              imageSettings: {
                                ...(prev.imageSettings || {}),
                                [editingPhotoIndex]: { ...photoPosition, y: newY }
                              }
                            }));
                          }}
                          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                      </div>

                      {/* Zoom */}
                      <div>
                        <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                          <span>🔍 Zoom Out</span>
                          <span>Zoom: {photoPosition.zoom}%</span>
                          <span>Zoom In 🔍</span>
                        </div>
                        <input
                          type="range"
                          min="100"
                          max="200"
                          value={photoPosition.zoom}
                          onChange={(e) => {
                            const newZoom = parseInt(e.target.value);
                            setPhotoPosition(prev => ({ ...prev, zoom: newZoom }));
                            setEditingMemory(prev => ({
                              ...prev,
                              imageSettings: {
                                ...(prev.imageSettings || {}),
                                [editingPhotoIndex]: { ...photoPosition, zoom: newZoom }
                              }
                            }));
                          }}
                          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                      </div>

                      {/* Reset button */}
                      <button
                        onClick={() => {
                          const defaultPos = { x: 50, y: 50, zoom: 100 };
                          setPhotoPosition(defaultPos);
                          setEditingMemory(prev => ({
                            ...prev,
                            imageSettings: {
                              ...(prev.imageSettings || {}),
                              [editingPhotoIndex]: defaultPos
                            }
                          }));
                        }}
                        className="mt-3 w-full px-3 py-2 bg-white/10 hover:bg-white/20 text-white/70 text-sm rounded-lg transition"
                      >
                        Reset to Center
                      </button>
                    </div>
                  )}

                  {/* Upload area */}
                  <div className="flex gap-2">
                    <label className={`flex-1 px-4 py-3 rounded-lg cursor-pointer flex items-center justify-center gap-2 transition border-2 border-dashed ${
                      uploadingPhoto ? 'bg-white/5 text-white/40 border-white/10' : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/20 hover:border-orange-500'
                    }`}>
                      {uploadingPhoto ? <Loader className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                      <span>{uploadingPhoto ? 'Uploading...' : 'Add Photo/Video'}</span>
                      <input
                        type="file"
                        accept="image/*,.heic,.heif,video/*,.mp4,.mov,.m4v"
                        className="hidden"
                        disabled={uploadingPhoto}
                        onChange={(e) => e.target.files?.[0] && uploadMemoryMedia(e.target.files[0], true)}
                      />
                    </label>
                  </div>
                  <p className="text-center text-white/40 text-xs mt-2">
                    📱 Drag photos/videos from Apple Photos • HEIC auto-converts • Videos up to 50MB
                  </p>
                  {dragOver && (
                    <div className="text-center text-orange-400 mt-2 text-sm font-medium">Drop media here to add</div>
                  )}
                </div>
              </div>

              {/* Card Preview */}
              {getMemoryImages(editingMemory).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Card Preview</label>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="backdrop-blur-sm rounded-2xl overflow-hidden border-2 border-white/20 bg-white/10">
                      {/* Preview Image */}
                      <div className="relative h-32 overflow-hidden">
                        {(() => {
                          const previewIdx = editingPhotoIndex !== null ? editingPhotoIndex : 0;
                          const img = getMemoryImages(editingMemory)[previewIdx];
                          const settings = editingMemory.imageSettings?.[previewIdx] || { x: 50, y: 50, zoom: 100 };
                          return img ? (
                            <img
                              src={img}
                              alt="Preview"
                              className="w-full h-full object-cover"
                              style={{
                                objectPosition: `${settings.x}% ${settings.y}%`,
                                transform: `scale(${settings.zoom / 100})`,
                                transformOrigin: `${settings.x}% ${settings.y}%`
                              }}
                            />
                          ) : null;
                        })()}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-2 left-3 right-3">
                          <div className="text-white font-semibold text-sm truncate">
                            {editingMemory.title || 'Memory Title'}
                          </div>
                          <div className="text-white/70 text-xs">
                            {editingMemory.location || 'Location'}
                          </div>
                        </div>
                      </div>
                      {/* Preview Info */}
                      <div className="p-3">
                        <p className="text-white/60 text-xs line-clamp-2">
                          {editingMemory.description || 'Description will appear here...'}
                        </p>
                      </div>
                    </div>
                    <p className="text-center text-white/30 text-xs mt-2">
                      This is how your memory card will look in the timeline
                    </p>
                  </div>
                </div>
              )}

              {/* Link / Video */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Link (Video URL)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={editingMemory.link || ''}
                    onChange={(e) => setEditingMemory(prev => ({ ...prev, link: e.target.value }))}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                    placeholder="YouTube, Sora, or other video link..."
                  />
                  {editingMemory.link && (
                    <button
                      onClick={() => setEditingMemory(prev => ({ ...prev, link: '' }))}
                      className="px-3 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                      title="Remove link"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Comment / Note</label>
                <textarea
                  value={editingMemory.comment || ''}
                  onChange={(e) => setEditingMemory(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 resize-none"
                  rows={3}
                  placeholder="Any personal notes or comments..."
                />
              </div>

              {/* Icon (for timeline) */}
              {editingMemory.category === 'milestone' && (
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Icon (emoji)</label>
                  <input
                    type="text"
                    value={editingMemory.icon || ''}
                    onChange={(e) => setEditingMemory(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-24 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-center text-2xl"
                    placeholder="✨"
                  />
                </div>
              )}

              {/* Highlight Toggles */}
              <div className="pt-2 space-y-3">
                {/* Extra Special Toggle */}
                <button
                  onClick={() => setEditingMemory(prev => ({ ...prev, isSpecial: !prev.isSpecial }))}
                  className={`w-full p-4 rounded-xl border-2 transition flex items-center justify-center gap-3 ${
                    editingMemory.isSpecial
                      ? 'border-transparent bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 text-white'
                      : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                  style={editingMemory.isSpecial ? {
                    backgroundSize: '200% 200%',
                    animation: 'rainbow-shift 3s ease infinite'
                  } : {}}
                >
                  <span className="text-2xl">🌈</span>
                  <span className="font-semibold">
                    {editingMemory.isSpecial ? 'Extra Special Memory!' : 'Make Extra Special'}
                  </span>
                  {editingMemory.isSpecial && <span className="text-2xl">✨</span>}
                </button>

                {/* First Time Toggle */}
                <button
                  onClick={() => setEditingMemory(prev => ({ ...prev, isFirstTime: !prev.isFirstTime }))}
                  className={`w-full p-4 rounded-xl border-4 transition flex items-center justify-center gap-3 ${
                    editingMemory.isFirstTime
                      ? 'border-transparent text-white'
                      : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                  style={editingMemory.isFirstTime ? {
                    background: 'linear-gradient(#1e293b, #1e293b) padding-box, repeating-linear-gradient(45deg, #ef4444 0px, #ef4444 10px, #f97316 10px, #f97316 20px, #eab308 20px, #eab308 30px, #22c55e 30px, #22c55e 40px, #3b82f6 40px, #3b82f6 50px, #8b5cf6 50px, #8b5cf6 60px) border-box',
                  } : {}}
                >
                  <span className="text-2xl">🎉</span>
                  <span className="font-semibold">
                    {editingMemory.isFirstTime ? 'A First Time Memory!' : 'Mark as First Time'}
                  </span>
                  {editingMemory.isFirstTime && <span className="text-2xl">⭐</span>}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 flex justify-between">
              <button
                onClick={() => {
                  // Delete memory
                  const newMemories = memories.filter(m => m.id !== editingMemory.id);
                  setMemories(newMemories);
                  saveMemoriesToFirestore(newMemories);
                  setEditingMemory(null);
                }}
                className="px-5 py-2.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
              >
                Delete
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditingMemory(null)}
                  className="px-5 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Save memory
                    const newMemories = memories.map(m => m.id === editingMemory.id ? editingMemory : m);
                    setMemories(newMemories);
                    saveMemoriesToFirestore(newMemories);
                    setEditingMemory(null);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-lg hover:opacity-90 transition"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Memory Modal */}
      {showNotifyPrefs && (
        <NotificationPrefsModal
          me={String(currentUser || 'mike').toLowerCase()}
          prefs={notifyPrefs}
          onToggle={setNotifyPref}
          onClose={() => setShowNotifyPrefs(false)}
          onDisable={() => { setShowNotifyPrefs(false); disableNotifications(); }}
        />
      )}

      {showAddMemoryModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-lg max-h-[85dvh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Add New Memory</h2>
                <button
                  onClick={() => {
                    setNewMemoryData({ title: '', date: '', location: '', description: '', image: '', images: [], link: '', comment: '' });
                    setShowAddMemoryModal(null);
                  }}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Category</label>
                <select
                  value={showAddMemoryModal}
                  onChange={(e) => setShowAddMemoryModal(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="milestone">📅 Timeline Milestone</option>
                  <option value="datenight">🥂 Date</option>
                  <option value="travel">✈️ Travel</option>
                  <option value="fitness">🏆 Fitness</option>
                  <option value="concert">🎵 Concert / Show</option>
                  <option value="pride">🏳️‍🌈 Pride / Community</option>
                  <option value="karaoke">🎤 Songs / Karaoke</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Title *</label>
                <input
                  type="text"
                  value={newMemoryData.title}
                  onChange={(e) => setNewMemoryData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                  placeholder="What happened?"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Date *</label>
                <input
                  type="date"
                  value={newMemoryData.date}
                  onChange={(e) => setNewMemoryData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Location</label>
                <input
                  type="text"
                  value={newMemoryData.location}
                  onChange={(e) => setNewMemoryData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                  placeholder="Where?"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Description</label>
                <input
                  type="text"
                  value={newMemoryData.description}
                  onChange={(e) => setNewMemoryData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                  placeholder="Short description"
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Images ({(newMemoryData.images || []).length})
                </label>
                <div
                  className={`border border-dashed rounded-xl p-4 transition ${
                    dragOver ? 'border-rose-500 bg-rose-500/10' : 'border-white/20'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => handleDrop(e, false)}
                >
                  {/* Existing images grid */}
                  {(newMemoryData.images || []).length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {(newMemoryData.images || []).map((img, idx) => (
                        <div key={idx} className="relative group aspect-square">
                          <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                          <button
                            onClick={() => {
                              const newImages = (newMemoryData.images || []).filter((_, i) => i !== idx);
                              setNewMemoryData(prev => ({ ...prev, images: newImages }));
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Camera and Upload buttons */}
                  <div className="flex gap-3">
                    {/* Camera capture button */}
                    <label className={`flex-1 flex flex-col items-center gap-2 p-3 border border-dashed rounded-xl cursor-pointer transition ${
                      uploadingPhoto ? 'border-white/10 bg-white/5 text-white/40' : 'border-white/30 hover:border-rose-400 hover:bg-white/5 text-white/50'
                    }`}>
                      {uploadingPhoto ? <Loader className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                      <span className="text-xs">{uploadingPhoto ? 'Uploading...' : 'Take Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        disabled={uploadingPhoto}
                        onChange={(e) => e.target.files?.[0] && uploadMemoryPhoto(e.target.files[0], false)}
                      />
                    </label>
                    {/* Gallery upload button */}
                    <label className={`flex-1 flex flex-col items-center gap-2 p-3 border border-dashed rounded-xl cursor-pointer transition ${
                      uploadingPhoto ? 'border-white/10 bg-white/5 text-white/40' : 'border-white/30 hover:border-rose-400 hover:bg-white/5 text-white/50'
                    }`}>
                      <Image className="w-5 h-5" />
                      <span className="text-xs">Choose Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingPhoto}
                        onChange={(e) => e.target.files?.[0] && uploadMemoryPhoto(e.target.files[0], false)}
                      />
                    </label>
                    <a
                      href="https://www.icloud.com/photos/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex flex-col items-center gap-2 p-3 border border-dashed border-white/30 rounded-xl hover:border-rose-400 hover:bg-white/5 text-white/50 transition"
                      title="Open iCloud Photos in a new tab — download a photo, then click Choose Photo"
                    >
                      <ExternalLink className="w-5 h-5" />
                      <span className="text-xs">iCloud Photos</span>
                    </a>
                  </div>
                  {dragOver && (
                    <div className="text-center text-rose-400 mt-2 text-sm">Drop image here to add</div>
                  )}
                </div>
              </div>

              {/* Link / Video */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Link (Video URL)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newMemoryData.link}
                    onChange={(e) => setNewMemoryData(prev => ({ ...prev, link: e.target.value }))}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                    placeholder="YouTube, Sora, or other video link..."
                  />
                  {newMemoryData.link && (
                    <button
                      onClick={() => setNewMemoryData(prev => ({ ...prev, link: '' }))}
                      className="px-3 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                      title="Remove link"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Comment</label>
                <textarea
                  value={newMemoryData.comment}
                  onChange={(e) => setNewMemoryData(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 resize-none"
                  rows={2}
                  placeholder="Any notes..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => {
                  setNewMemoryData({ title: '', date: '', location: '', description: '', image: '', images: [], link: '', comment: '' });
                  setShowAddMemoryModal(null);
                }}
                className="px-5 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newMemoryData.title || !newMemoryData.date) {
                    showToast('Title and Date are required', 'error');
                    return;
                  }

                  const newMemory = {
                    id: Date.now(),
                    category: showAddMemoryModal,
                    title: newMemoryData.title,
                    date: newMemoryData.date,
                    location: newMemoryData.location,
                    description: newMemoryData.description,
                    image: '',
                    images: newMemoryData.images || [],
                    link: newMemoryData.link,
                    comment: newMemoryData.comment,
                    icon: '✨'
                  };

                  const newMemories = [...memories, newMemory];
                  setMemories(newMemories);
                  saveMemoriesToFirestore(newMemories);
                  setNewMemoryData({ title: '', date: '', location: '', description: '', image: '', images: [], link: '', comment: '' });
                  setShowAddMemoryModal(null);
                  showToast('Memory added!', 'success');
                }}
                disabled={!newMemoryData.title || !newMemoryData.date}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Memory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bouncing emoji removed for cleaner UI */}

      {/* AddModal - rendered at root level for stability */}
      {showAddModal && (
        <AddModal
          type={showAddModal.type}
          tripId={showAddModal.tripId}
          onClose={() => setShowAddModal(null)}
          addItem={addItem}
          updateItem={updateItem}
          editItem={showAddModal.editItem}
        />
      )}

      {/* Add/Edit Event Modal - rendered at root level for use from any section */}
      {(showAddEventModal || editingEvent) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl max-w-lg w-full shadow-2xl max-h-[85dvh] overflow-y-auto border border-white/20">
            <div className="p-6 border-b border-white/10">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">
                  {editingEvent ? 'Edit Event' : 'New Event'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddEventModal(false);
                    setEditingEvent(null);
                    setEventCoverImagePreview(null);
                    setNewEventData({
                      name: '', emoji: '🎉', date: toLocalDateStr(new Date()), endDate: '', time: '18:00', endTime: '22:00',
                      location: '', entryCode: '', description: '', color: 'from-amber-400 to-orange-500', tasks: [], eventType: 'parties',
                      allDay: false, multiDay: false,
                    });
                  }}
                  className="p-2 hover:bg-white/10 rounded-full transition"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Event Name & Emoji */}
              <div className="flex gap-3">
                <div className="relative">
                  <button
                    type="button"
                    className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center text-3xl hover:bg-white/20 transition border border-white/20"
                    onClick={() => setShowEventEmojiPicker(v => !v)}
                    title="Pick an emoji"
                  >
                    {editingEvent ? editingEvent.emoji : newEventData.emoji}
                  </button>
                  {showEventEmojiPicker && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowEventEmojiPicker(false)} />
                      <div className="absolute top-full left-0 mt-2 z-50 bg-slate-800 border border-white/15 rounded-xl shadow-2xl p-3 w-[280px] max-h-[60vh] overflow-y-auto">
                        {Object.entries(eventCategories).map(([category, emojis]) => (
                          <div key={category} className="mb-3 last:mb-0">
                            <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5 px-1">{category}</div>
                            <div className="grid grid-cols-6 gap-1">
                              {emojis.map(emoji => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => {
                                    if (editingEvent) {
                                      setEditingEvent({ ...editingEvent, emoji });
                                    } else {
                                      setNewEventData({ ...newEventData, emoji });
                                    }
                                    setShowEventEmojiPicker(false);
                                  }}
                                  className={`w-9 h-9 flex items-center justify-center text-xl rounded-lg hover:bg-white/10 transition ${(editingEvent ? editingEvent.emoji : newEventData.emoji) === emoji ? 'bg-amber-500/30 ring-1 ring-amber-400' : ''}`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Event name"
                  value={editingEvent ? editingEvent.name : newEventData.name}
                  onChange={(e) => {
                    if (editingEvent) {
                      setEditingEvent({ ...editingEvent, name: e.target.value });
                    } else {
                      setNewEventData({ ...newEventData, name: e.target.value });
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-sm text-white/50 mb-2">Event Type</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'parties', emoji: '🎉', label: 'Party' },
                    { id: 'travel', emoji: '✈️', label: 'Trip' },
                    { id: 'datenight', emoji: '🥂', label: 'Date' },
                    { id: 'concert', emoji: '🎵', label: 'Show' },
                    { id: 'fitness', emoji: '🏆', label: 'Fitness' },
                    { id: 'pride', emoji: '🏳️‍🌈', label: 'Pride' },
                    { id: 'karaoke', emoji: '🎤', label: 'Karaoke' },
                  ].map(type => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => {
                        if (editingEvent) {
                          setEditingEvent({ ...editingEvent, eventType: type.id });
                        } else {
                          setNewEventData({ ...newEventData, eventType: type.id });
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                        (editingEvent ? editingEvent.eventType : newEventData.eventType) === type.id
                          ? 'bg-amber-500 text-white shadow-lg'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      <span>{type.emoji}</span> {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time — toggles for All Day and Multi-day; travel events always multi-day */}
              {(() => {
                const data = editingEvent || newEventData;
                const updateField = (patch) => {
                  if (editingEvent) setEditingEvent({ ...editingEvent, ...patch });
                  else setNewEventData({ ...newEventData, ...patch });
                };
                const isTravel = data.eventType === 'travel';
                // travel events are inherently multi-day; honor the multiDay flag for everything else
                const showEndDate = isTravel || data.multiDay || !!data.endDate;
                // travel events are inherently all-day at the date level; honor allDay flag elsewhere
                const showTimes = !isTravel && !data.allDay;
                return (
                  <>
                    {/* Toggles row — only for non-travel events */}
                    {!isTravel && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => updateField({ allDay: !data.allDay })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                            data.allDay ? 'bg-amber-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                        >
                          <Sun className="w-3.5 h-3.5" />
                          All Day
                        </button>
                        <button
                          type="button"
                          onClick={() => updateField({ multiDay: !data.multiDay, endDate: !data.multiDay ? (data.endDate || data.date) : '' })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                            data.multiDay || data.endDate ? 'bg-amber-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          Multi-day
                        </button>
                      </div>
                    )}

                    {/* Dates */}
                    <div className={`grid gap-3 ${showEndDate ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      <div>
                        <label className="block text-sm text-white/50 mb-1">{showEndDate ? 'Start Date' : 'Date'}</label>
                        <input
                          type="date"
                          value={data.date || ''}
                          onChange={(e) => updateField({ date: e.target.value })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      {showEndDate && (
                        <div>
                          <label className="block text-sm text-white/50 mb-1">End Date</label>
                          <input
                            type="date"
                            value={data.endDate || ''}
                            min={data.date || undefined}
                            onChange={(e) => updateField({ endDate: e.target.value })}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      )}
                    </div>

                    {/* Times — only when not all-day and not a travel event */}
                    {showTimes && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-white/50 mb-1">Start Time</label>
                          <input
                            type="time"
                            value={data.time || ''}
                            onChange={(e) => updateField({ time: e.target.value })}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/50 mb-1">End Time <span className="text-white/30">(optional)</span></label>
                          <input
                            type="time"
                            value={data.endTime || ''}
                            onChange={(e) => updateField({ endTime: e.target.value })}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Location */}
              <div>
                <label className="block text-sm text-white/50 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="Address or location name"
                  value={editingEvent ? editingEvent.location : newEventData.location}
                  onChange={(e) => {
                    if (editingEvent) {
                      setEditingEvent({ ...editingEvent, location: e.target.value });
                    } else {
                      setNewEventData({ ...newEventData, location: e.target.value });
                    }
                  }}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-white/50 mb-1">Description</label>
                <textarea
                  placeholder="What's this event about?"
                  value={editingEvent ? editingEvent.description : newEventData.description}
                  onChange={(e) => {
                    if (editingEvent) {
                      setEditingEvent({ ...editingEvent, description: e.target.value });
                    } else {
                      setNewEventData({ ...newEventData, description: e.target.value });
                    }
                  }}
                  rows={2}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm text-white/50 mb-2">Theme Color</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'from-purple-400 to-pink-500',
                    'from-blue-400 to-cyan-500',
                    'from-green-400 to-emerald-500',
                    'from-amber-400 to-orange-500',
                    'from-red-400 to-pink-500',
                    'from-indigo-400 to-purple-500',
                  ].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        if (editingEvent) {
                          setEditingEvent({ ...editingEvent, color });
                        } else {
                          setNewEventData({ ...newEventData, color });
                        }
                      }}
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} border-2 transition ${
                        (editingEvent ? editingEvent.color : newEventData.color) === color
                          ? 'border-white scale-110'
                          : 'border-transparent hover:border-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm text-white/50 mb-2">Cover Photo (optional)</label>
                {(editingEvent?.coverImage || newEventData.coverImage || eventCoverImagePreview) ? (
                  <div className="relative rounded-xl overflow-hidden">
                    <img
                      src={eventCoverImagePreview || (editingEvent ? editingEvent.coverImage : newEventData.coverImage)}
                      alt="Cover preview"
                      className="w-full h-32 object-cover"
                    />
                    {uploadingEventCoverImage && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={removeEventCoverImage}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-full hover:bg-red-500 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => eventCoverCameraRef.current?.click()}
                        className="flex-1 flex flex-col items-center gap-2 p-3 border border-dashed border-white/30 rounded-xl hover:border-amber-400 hover:bg-white/5 transition"
                      >
                        <Camera className="w-5 h-5 text-white/50" />
                        <span className="text-xs text-white/50">Take Photo</span>
                      </button>
                      <input
                        ref={eventCoverCameraRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleEventCoverImageSelect}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => eventCoverFileRef.current?.click()}
                        className="flex-1 flex flex-col items-center gap-2 p-3 border border-dashed border-white/30 rounded-xl hover:border-amber-400 hover:bg-white/5 transition"
                      >
                        <Image className="w-5 h-5 text-white/50" />
                        <span className="text-xs text-white/50">Choose Photo</span>
                      </button>
                      <input
                        ref={eventCoverFileRef}
                        type="file"
                        accept="image/*"
                        onChange={handleEventCoverImageSelect}
                        className="hidden"
                      />
                      <a
                        href="https://www.icloud.com/photos/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex flex-col items-center gap-2 p-3 border border-dashed border-white/30 rounded-xl hover:border-amber-400 hover:bg-white/5 transition"
                        title="Open iCloud Photos in a new tab — download a photo, then click Choose Photo"
                      >
                        <ExternalLink className="w-5 h-5 text-white/50" />
                        <span className="text-xs text-white/50">iCloud Photos</span>
                      </a>
                    </div>
                    <p className="text-[11px] text-white/40 mt-2">Tip: you can also drag a photo straight from the macOS Photos app onto the event after saving.</p>
                  </>
                )}
              </div>

              {/* Hub Tasks linked to this event */}
              {editingEvent && (
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-green-400" />
                    Hub Tasks
                  </label>
                  {(() => {
                    const linked = getLinkedHubItems('events', editingEvent.id);
                    return linked.linkedTasks.length > 0 ? (
                      <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                        {linked.linkedTasks.map(task => (
                          <div key={task.id} className={`flex items-center gap-3 p-2.5 rounded-lg ${task.status === 'done' ? 'bg-green-500/10' : 'bg-white/5'}`}>
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                              task.status === 'done' ? 'bg-green-500 border-green-500 text-white' : 'border-slate-500'
                            }`}>
                              {task.status === 'done' && <Check className="w-3 h-3" />}
                            </div>
                            <span className={`flex-1 text-sm text-white ${task.status === 'done' ? 'line-through opacity-60' : ''}`}>{task.title}</span>
                            {task.assignedTo && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                task.assignedTo === 'Mike' ? 'bg-purple-500/30 text-purple-300' :
                                task.assignedTo === 'Adam' ? 'bg-blue-500/30 text-blue-300' :
                                'bg-amber-500/30 text-amber-300'
                              }`}>{task.assignedTo}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm mb-3">No tasks linked yet</p>
                    );
                  })()}
                  <button
                    onClick={() => {
                      const eventId = editingEvent.id;
                      setEditingEvent(null);
                      setShowAddEventModal(false);
                      setShowAddTaskModal({
                        _prefill: true,
                        linkedTo: { section: 'partyEvents', itemId: eventId },
                      });
                    }}
                    className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition flex items-center justify-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Task in Hub
                  </button>
                </div>
              )}

              {/* Invite Guests */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Invite Guests</label>
                {editingEvent ? (
                  <button
                    type="button"
                    onClick={() => {
                      const evt = editingEvent;
                      setShowAddEventModal(false);
                      setEditingEvent(null);
                      setShowInviteModal(evt);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-pink-500/30 to-purple-500/30 text-pink-300 rounded-xl hover:from-pink-500/40 hover:to-purple-500/40 transition flex items-center justify-center gap-2 border border-pink-500/20"
                  >
                    <UserPlus className="w-5 h-5" />
                    Manage Guests ({(editingEvent.guests || []).length})
                  </button>
                ) : (
                  <p className="text-slate-500 text-sm text-center py-3 bg-white/5 rounded-xl border border-dashed border-white/20">
                    Save the event first, then invite guests
                  </p>
                )}
              </div>
            </div>

            {/* Convert to Trip — only for travel-type events with both dates set */}
            {editingEvent && editingEvent.eventType === 'travel' && editingEvent.date && (
              <div className="px-6 pb-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm('Convert this event into a Trip? You\'ll get full trip planning (flights, hotels, packing list, budget, itinerary). The event will be replaced.')) return;
                    const evt = editingEvent;
                    // Build the new trip object directly (mirrors useTravel.addNewTrip schema)
                    const colorSet = tripColors[Math.floor(Math.random() * tripColors.length)];
                    const newTripId = `trip-${Date.now()}`;
                    const newTrip = {
                      id: newTripId,
                      destination: evt.name,
                      emoji: evt.emoji || '✈️',
                      dates: { start: evt.date, end: evt.endDate || evt.date },
                      ...colorSet,
                      isWishlist: false,
                      notes: evt.description || '',
                      special: '',
                      guests: evt.guests || [],
                      coverImage: evt.coverImage || '',
                    };
                    const newTrips = [...trips, newTrip];
                    const newTripDetails = {
                      ...tripDetails,
                      [newTripId]: { flights: [], hotels: [], events: [], links: [], packingList: [], budget: { total: 0, expenses: [] }, photos: [], notes: [] },
                    };
                    const remaining = partyEvents.filter(e => e.id !== evt.id);
                    try {
                      // Save trip FIRST and AWAIT — without this the page can reload before the write commits
                      await saveToFirestore(newTrips, null, newTripDetails);
                      setTrips(newTrips);
                      setTripDetails(newTripDetails);
                      // Then remove the source event
                      await savePartyEventsToFirestore(remaining);
                      setPartyEvents(remaining);
                      setEditingEvent(null);
                      setSelectedPartyEvent(null);
                      setShowAddEventModal(false);
                      // Drop the user straight into the new trip
                      setSelectedTrip(newTrip);
                      showToast('Converted to Trip!', 'success');
                    } catch (err) {
                      console.error('Convert to Trip failed:', err);
                      showToast('Convert failed — please try again', 'error');
                    }
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-teal-500/30 to-cyan-500/30 text-teal-200 rounded-xl hover:from-teal-500/40 hover:to-cyan-500/40 transition flex items-center justify-center gap-2 border border-teal-500/30"
                >
                  <Plane className="w-4 h-4" />
                  Convert to Trip (flights, hotels, itinerary)
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="p-6 border-t border-white/10 flex justify-between">
              {editingEvent && (
                <button
                  onClick={() => {
                    if (confirm('Delete this event?')) {
                      const newEvents = partyEvents.filter(e => e.id !== editingEvent.id);
                      setPartyEvents(newEvents);
                      savePartyEventsToFirestore(newEvents);
                      setEditingEvent(null);
                      setSelectedPartyEvent(null);
                      showToast('Event deleted', 'success');
                    }
                  }}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
                >
                  Delete Event
                </button>
              )}
              <div className="flex gap-3 ml-auto">
                <button
                  onClick={() => {
                    setShowAddEventModal(false);
                    setEditingEvent(null);
                    setEventCoverImagePreview(null);
                    setNewEventData({
                      name: '', emoji: '🎉', date: toLocalDateStr(new Date()), endDate: '', time: '18:00', endTime: '22:00',
                      location: '', entryCode: '', description: '', color: 'from-amber-400 to-orange-500', tasks: [], eventType: 'parties',
                      allDay: false, multiDay: false,
                    });
                  }}
                  className="px-5 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (isSavingEvent) return; // prevent double-tap
                    setIsSavingEvent(true);
                    // Normalize event before save: drop times when allDay, drop endDate when not multi-day
                    const normalize = (evt) => {
                      const isTravel = evt.eventType === 'travel';
                      const isMulti = isTravel || evt.multiDay || (evt.endDate && evt.endDate !== evt.date);
                      return {
                        ...evt,
                        time: (evt.allDay && !isTravel) ? '' : (evt.time || ''),
                        endTime: (evt.allDay && !isTravel) ? '' : (evt.endTime || ''),
                        endDate: isMulti ? (evt.endDate || evt.date) : '',
                      };
                    };
                    try {
                      if (editingEvent) {
                        const cleaned = normalize(editingEvent);
                        const newEvents = partyEvents.map(e =>
                          e.id === editingEvent.id ? { ...cleaned, updatedAt: new Date().toISOString() } : e
                        );
                        await savePartyEventsToFirestore(newEvents);
                        setPartyEvents(newEvents);
                        setSelectedPartyEvent(newEvents.find(e => e.id === editingEvent.id));
                        setEditingEvent(null);
                        setEventCoverImagePreview(null);
                        showToast('Event updated!', 'success');
                      } else {
                        const newEvent = {
                          ...normalize(newEventData),
                          id: `event-${Date.now()}`,
                          guests: [],
                          tasks: [],
                          isPublic: true,
                          createdBy: currentUser,
                          createdAt: new Date().toISOString()
                        };
                        const newEvents = [...partyEvents, newEvent];
                        await savePartyEventsToFirestore(newEvents);
                        setPartyEvents(newEvents);
                        setShowAddEventModal(false);
                        setEventCoverImagePreview(null);
                        setNewEventData({
                          name: '', emoji: '🎉', date: toLocalDateStr(new Date()), endDate: '', time: '18:00', endTime: '22:00',
                          location: '', entryCode: '', description: '', color: 'from-amber-400 to-orange-500', tasks: [], eventType: 'parties',
                          allDay: false, multiDay: false,
                        });
                        showToast('Event created!', 'success');
                      }
                    } catch (err) {
                      console.error('Event save failed:', err);
                    } finally {
                      setIsSavingEvent(false);
                    }
                  }}
                  disabled={isSavingEvent || !(editingEvent ? editingEvent.name && editingEvent.date : newEventData.name && newEventData.date)}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingEvent ? 'Saving…' : (editingEvent ? 'Save Changes' : 'Create Event')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Picker Modal */}
      {showCalendarPicker && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md max-h-[85dvh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Select Calendar</h2>
                <button
                  onClick={() => setShowCalendarPicker(false)}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-slate-400 text-sm mt-2">Choose which calendar to sync</p>
            </div>

            <div className="p-4 space-y-2">
              {availableCalendars.map(calendar => (
                <button
                  key={calendar.id}
                  onClick={() => selectCalendar(calendar.id)}
                  className={`w-full p-4 rounded-xl border-2 transition flex items-center gap-3 ${
                    selectedCalendarId === calendar.id
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-white/20 bg-white/5 hover:border-white/40'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: calendar.backgroundColor || '#4285f4' }}
                  />
                  <div className="text-left flex-1">
                    <div className="text-white font-medium">{calendar.summary}</div>
                    {calendar.description && (
                      <div className="text-slate-400 text-sm truncate">{calendar.description}</div>
                    )}
                  </div>
                  {calendar.primary && (
                    <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-1 rounded-full">Primary</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Google Calendar Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md max-h-[85dvh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Import Event</h2>
                <button
                  onClick={() => setShowImportModal(null)}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Event Name - Editable */}
              <div className="mb-6">
                <label className="text-white/70 text-sm font-medium mb-2 block">Event name:</label>
                <input
                  type="text"
                  value={importSettings.customName || showImportModal.title}
                  onChange={(e) => setImportSettings(prev => ({ ...prev, customName: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                  placeholder="Event name"
                />
              </div>

              {/* Event Details */}
              <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
                <div className="text-slate-400 text-sm space-y-1">
                  <p>📅 {(() => {
                    const startDate = parseLocalDate(showImportModal.start.split('T')[0]);
                    // For all-day events, Google uses exclusive end dates, so subtract 1 day
                    const endDateRaw = showImportModal.end.split('T')[0];
                    let endDate = parseLocalDate(endDateRaw);
                    if (showImportModal.allDay && endDate > startDate) {
                      endDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // Subtract 1 day
                    }
                    const isSameDay = startDate.toDateString() === endDate.toDateString();
                    if (isSameDay) {
                      return startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
                    } else {
                      return `${startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}`;
                    }
                  })()}</p>
                  {showImportModal.location && <p>📍 {showImportModal.location}</p>}
                  {showImportModal.description && <p className="text-slate-500 truncate">📝 {showImportModal.description}</p>}
                </div>
              </div>

              {/* Import Type Selection */}
              <div className="mb-6">
                <label className="text-white/70 text-sm font-medium mb-3 block">Import as:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'travel', emoji: '✈️', label: 'Trip', gradient: 'from-teal-400 to-cyan-500' },
                    { type: 'event', emoji: '🎉', label: 'Event', gradient: 'from-amber-400 to-orange-500' },
                    { type: 'memory', emoji: '💝', label: 'Memory', gradient: 'from-rose-400 to-pink-500' },
                  ].map(option => (
                    <button
                      key={option.type}
                      onClick={() => setImportSettings(prev => ({ ...prev, type: option.type, color: option.gradient }))}
                      className={`p-3 rounded-xl border-2 transition ${
                        importSettings.type === option.type
                          ? `border-white bg-gradient-to-r ${option.gradient} text-white`
                          : 'border-white/20 bg-white/5 text-white/70 hover:border-white/40'
                      }`}
                    >
                      <div className="text-2xl mb-1">{option.emoji}</div>
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Event Type Selection - only when importing as Event */}
              {importSettings.type === 'event' && (
                <div className="mb-6">
                  <label className="text-white/70 text-sm font-medium mb-3 block">Event type:</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'parties', emoji: '🎉', label: 'Party' },
                      { id: 'datenight', emoji: '🥂', label: 'Date' },
                      { id: 'concert', emoji: '🎵', label: 'Show' },
                      { id: 'fitness', emoji: '🏆', label: 'Fitness' },
                      { id: 'pride', emoji: '🏳️‍🌈', label: 'Pride' },
                      { id: 'karaoke', emoji: '🎤', label: 'Karaoke' },
                    ].map(type => (
                      <button
                        key={type.id}
                        onClick={() => setImportSettings(prev => ({ ...prev, eventType: type.id }))}
                        className={`px-3 py-2 rounded-xl border transition text-sm ${
                          importSettings.eventType === type.id
                            ? 'border-white bg-white/15 text-white font-semibold'
                            : 'border-white/20 bg-white/5 text-white/60 hover:border-white/40'
                        }`}
                      >
                        {type.emoji} {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              <div className="mb-6">
                <label className="text-white/70 text-sm font-medium mb-3 block">Color theme:</label>
                <div className="flex flex-wrap gap-2">
                  {tripColors.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => setImportSettings(prev => ({ ...prev, color: color.gradient }))}
                      className={`w-10 h-10 rounded-full bg-gradient-to-r ${color.gradient} border-2 transition ${
                        importSettings.color === color.gradient ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowImportModal(null)}
                  className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => importGoogleEvent(showImportModal, importSettings)}
                  className={`flex-1 px-4 py-3 bg-gradient-to-r ${importSettings.color} text-white font-semibold rounded-xl hover:opacity-90 transition`}
                >
                  Import as {importSettings.type === 'travel' ? 'Trip' : importSettings.type === 'event' ? 'Event' : 'Memory'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Day Detail Modal */}
      {/* Photo Lightbox */}
      {lightbox && (
        <PhotoLightbox
          images={lightbox.images}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}

      {selectedCalendarDay && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end md:items-center justify-center" onClick={() => setSelectedCalendarDay(null)}>
          <div className="bg-slate-800 rounded-t-2xl md:rounded-2xl w-full max-w-md max-h-[80dvh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">
                  {(() => {
                    const d = parseLocalDate(selectedCalendarDay);
                    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
                  })()}
                </h2>
                <button onClick={() => setSelectedCalendarDay(null)} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {/* Trips on this day */}
              {trips.filter(t => t.dates?.start && t.dates?.end && selectedCalendarDay >= t.dates.start && selectedCalendarDay <= t.dates.end).map(trip => (
                <button key={trip.id} onClick={() => { setSelectedTrip(trip); setActiveSection('events'); setSelectedCalendarDay(null); }}
                  className="w-full flex items-center gap-3 p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl hover:bg-teal-500/20 transition text-left">
                  <span className="text-2xl">{trip.emoji || '✈️'}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-white truncate">{trip.destination}</div>
                    <div className="text-[10px] text-teal-300">{trip.dates.start} → {trip.dates.end}</div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />
                </button>
              ))}

              {/* Events on this day */}
              {partyEvents.filter(e => e.date === selectedCalendarDay).map(event => (
                <button key={event.id} onClick={() => { setSelectedPartyEvent(event); setActiveSection('events'); setSelectedCalendarDay(null); }}
                  className="w-full flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl hover:bg-amber-500/20 transition text-left">
                  <span className="text-2xl">{event.emoji || '🎉'}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-white truncate">{event.name}</div>
                    <div className="text-[10px] text-amber-300">{event.time ? `${event.time}` : 'All day'}{event.location ? ` · ${event.location}` : ''}</div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                </button>
              ))}

              {/* Google Calendar events on this day */}
              {(googleCalendarEvents || []).filter(e => {
                const s = e.start?.split('T')[0];
                const en = e.end?.split('T')[0] || s;
                return s && selectedCalendarDay >= s && selectedCalendarDay <= en;
              }).map(event => (
                <div key={event.id} className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <span className="text-2xl">📅</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-white truncate">{event.title}</div>
                    <div className="text-[10px] text-blue-300">
                      {event.allDay ? 'All day' : new Date(event.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      {event.location ? ` · ${event.location}` : ''}
                    </div>
                  </div>
                  <button onClick={() => { setImportSettings(prev => ({ ...prev, customName: '' })); setShowImportModal(event); setSelectedCalendarDay(null); }}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium px-2 py-1 rounded-lg hover:bg-blue-500/10 transition shrink-0">
                    Import
                  </button>
                </div>
              ))}

              {/* Tasks due this day */}
              {sharedTasks.filter(t => t.dueDate === selectedCalendarDay).map(task => (
                <button key={task.id} onClick={() => { updateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' }); }}
                  className={`w-full flex items-center gap-3 p-3 ${task.status === 'done' ? 'bg-green-500/5 border-green-500/10' : 'bg-green-500/10 border-green-500/20'} border rounded-xl hover:bg-green-500/20 transition text-left`}>
                  <span className="text-2xl">{task.status === 'done' ? '☑️' : '✅'}</span>
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm font-semibold truncate ${task.status === 'done' ? 'text-white/40 line-through' : 'text-white'}`}>{task.title}</div>
                    <div className="text-[10px] text-green-300">Task · {task.assignee || 'Unassigned'}</div>
                  </div>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${task.status === 'done' ? 'bg-green-400/40' : 'bg-green-400'}`} />
                </button>
              ))}

              {/* Social on this day */}
              {sharedSocial.filter(s => s.date === selectedCalendarDay).map(social => (
                <button key={social.id} onClick={() => { updateSocial(social.id, { status: social.status === 'done' ? 'todo' : 'done' }); }}
                  className={`w-full flex items-center gap-3 p-3 ${social.status === 'done' ? 'bg-pink-500/5 border-pink-500/10' : 'bg-pink-500/10 border-pink-500/20'} border rounded-xl hover:bg-pink-500/20 transition text-left`}>
                  <span className="text-2xl">{social.status === 'done' ? '☑️' : '👥'}</span>
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm font-semibold truncate ${social.status === 'done' ? 'text-white/40 line-through' : 'text-white'}`}>{social.person}</div>
                    <div className="text-[10px] text-pink-300">{social.type || 'Social'}</div>
                  </div>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${social.status === 'done' ? 'bg-pink-400/40' : 'bg-pink-400'}`} />
                </button>
              ))}

              {/* Fitness on this day */}
              {Object.entries(fitnessTrainingPlans || {}).flatMap(([eventId, weeks]) => {
                if (!Array.isArray(weeks)) return [];
                return weeks.flatMap(week =>
                  [...(week.runs || []), ...(week.crossTraining || [])].filter(w => w.date === selectedCalendarDay).map(workout => ({
                    ...workout, eventId, key: `${eventId}-${workout.date}-${workout.type || workout.activity || 'workout'}`
                  }))
                );
              }).map(workout => (
                <div key={workout.key} className="flex items-center gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                  <span className="text-2xl">🏃</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-white truncate">{workout.type || workout.activity || 'Workout'}</div>
                    <div className="text-[10px] text-orange-300">{workout.distance ? `${workout.distance} mi` : ''}{workout.duration ? ` · ${workout.duration}` : ''}</div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                </div>
              ))}

              {/* Empty state */}
              {(() => {
                const dayTrips = trips.filter(t => t.dates?.start && t.dates?.end && selectedCalendarDay >= t.dates.start && selectedCalendarDay <= t.dates.end);
                const dayEvents = partyEvents.filter(e => e.date === selectedCalendarDay);
                const dayGcal = (googleCalendarEvents || []).filter(e => { const s = e.start?.split('T')[0]; const en = e.end?.split('T')[0] || s; return s && selectedCalendarDay >= s && selectedCalendarDay <= en; });
                const dayTasks = sharedTasks.filter(t => t.status !== 'done' && t.dueDate === selectedCalendarDay);
                const daySocial = sharedSocial.filter(s => s.status !== 'done' && s.date === selectedCalendarDay);
                const total = dayTrips.length + dayEvents.length + dayGcal.length + dayTasks.length + daySocial.length;
                return total === 0 ? (
                  <div className="text-center py-6 text-white/40">
                    <div className="text-3xl mb-2">📭</div>
                    <p className="text-sm">Nothing scheduled</p>
                  </div>
                ) : null;
              })()}

              {/* Add buttons */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setShowAddTaskModal({ _prefill: true, dueDate: selectedCalendarDay });
                      setSelectedCalendarDay(null);
                    }}
                    className="py-2.5 bg-green-500/15 border border-green-500/25 rounded-xl text-xs font-semibold text-green-300 hover:bg-green-500/25 transition active:scale-[0.98] flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Task
                  </button>
                  <button
                    onClick={() => {
                      setNewEventData(prev => ({ ...prev, date: selectedCalendarDay, name: '', emoji: '🎉', time: '18:00', endTime: '22:00', location: '', description: '', eventType: 'parties' }));
                      setShowAddEventModal(true);
                      setSelectedCalendarDay(null);
                    }}
                    className="py-2.5 bg-amber-500/15 border border-amber-500/25 rounded-xl text-xs font-semibold text-amber-300 hover:bg-amber-500/25 transition active:scale-[0.98] flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Event
                  </button>
                  <button
                    onClick={() => {
                      setShowAddSocialModal({ _prefill: true, date: selectedCalendarDay });
                      setSelectedCalendarDay(null);
                    }}
                    className="py-2.5 bg-pink-500/15 border border-pink-500/25 rounded-xl text-xs font-semibold text-pink-300 hover:bg-pink-500/25 transition active:scale-[0.98] flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Social
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Styles for Rainbow Effects */}
      <style>{`
        @keyframes rainbow-border {
          0% { background-position: 100% 100%, 0% 50%; }
          100% { background-position: 100% 100%, 200% 50%; }
        }
        @keyframes rainbow-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Desktop FAB - Top left, only on desktop */}
      {isOwner && !initialAppMode && !showAddMemoryModal && !editingMemory && !editingTrip && !editingPartyEvent && !showOpenDateModal && !showCompanionsModal && !showAddModal && !showNewTripModal && !showLinkModal && !showImportModal && !showGuestModal && !showMyProfileModal && !showAddFitnessEventModal && !editingFitnessEvent && !showAddEventModal && !editingEvent && !editingTrainingWeek && !showAddTaskModal && !showSharedListModal && !showAddIdeaModal && !showAddSocialModal && !showAddGoalModal && !showOdysseyPlanModal && (
        <div className="hidden md:block fixed top-24 left-6 z-[90]">
          {showAddNewMenu && (
            <>
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[89]" onClick={() => setShowAddNewMenu(false)} />
              <div className="absolute top-16 left-0 z-[91] bg-slate-800/95 backdrop-blur-md border border-white/15 rounded-2xl p-4 shadow-2xl w-[240px]"
                style={{ animation: 'fabGridIn 0.15s ease-out both' }}>
                {/* Randomizer bar */}
                <button
                  onClick={() => { setShowAddNewMenu(false); setShowRandomExperience(true); }}
                  className="w-full mb-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/30 to-orange-500/30 border border-amber-500/30 hover:from-amber-500/40 hover:to-orange-500/40 transition active:scale-95 flex items-center justify-center gap-2"
                  style={{ animation: 'fabItemIn 0.12s ease-out 0s both' }}
                >
                  <span className="text-lg">🎲</span>
                  <span className="text-sm font-semibold text-amber-200">Randomizer</span>
                </button>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { action: () => setShowAddTaskModal('create'), icon: '✅', label: 'Task', gradient: 'from-blue-400 to-indigo-500' },
                    { action: () => setShowSharedListModal('create'), icon: '🛒', label: 'List', gradient: 'from-emerald-400 to-teal-500' },
                    { action: () => setShowAddIdeaModal('create'), icon: '💡', label: 'Idea', gradient: 'from-yellow-400 to-amber-500' },
                    { action: () => setShowNewTripModal('new'), icon: '✈️', label: 'Trip', gradient: 'from-teal-400 to-cyan-500' },
                    { action: () => setShowAddEventModal(true), icon: '🎉', label: 'Event', gradient: 'from-amber-400 to-orange-500' },
                    { action: () => setShowAddMemoryModal('milestone'), icon: '💝', label: 'Memory', gradient: 'from-rose-400 to-pink-500' },
                  ].map((item, idx) => (
                    <button key={item.label} onClick={() => { setShowAddNewMenu(false); item.action(); }} className="flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl hover:bg-white/10 transition active:scale-95" style={{ animation: `fabItemIn 0.12s ease-out ${idx * 0.02}s both` }}>
                      <span className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-xl shadow-md`}>{item.icon}</span>
                      <span className="text-[11px] text-white/70 font-medium leading-tight">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <style>{`
                @keyframes fabGridIn { from { opacity: 0; transform: scale(0.9) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                @keyframes fabItemIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
              `}</style>
            </>
          )}
          <button onClick={() => setShowAddNewMenu(!showAddNewMenu)} className={`w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 active:scale-90 ${showAddNewMenu ? 'bg-gradient-to-r from-pink-500 to-rose-500 rotate-45' : 'bg-gradient-to-r from-purple-500 to-violet-600 hover:shadow-purple-500/30'}`} style={{ boxShadow: showAddNewMenu ? '0 8px 32px rgba(236, 72, 153, 0.4)' : '0 8px 32px rgba(139, 92, 246, 0.4)' }}>
            <Plus className="w-6 h-6 text-white transition-transform duration-200" />
          </button>
        </div>
      )}

      {/* Mobile Bottom Navigation with integrated FAB */}
      {!initialAppMode && !showAddMemoryModal && !editingMemory && !editingTrip && !editingPartyEvent && !showOpenDateModal && !showCompanionsModal && !showAddModal && !showNewTripModal && !showLinkModal && !showImportModal && !showGuestModal && !showMyProfileModal && !showAddFitnessEventModal && !editingFitnessEvent && !showAddEventModal && !editingEvent && !editingTrainingWeek && !showAddTaskModal && !showSharedListModal && !showAddIdeaModal && !showAddSocialModal && !showAddGoalModal && !showOdysseyPlanModal && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100]" style={{ transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}>
          {/* FAB Menu Popup - anchored to center of nav */}
          {showAddNewMenu && isOwner && (
            <>
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99]" onClick={() => setShowAddNewMenu(false)} />
              <div className="absolute bottom-full left-1/2 mb-[24px] z-[101] bg-slate-800/95 backdrop-blur-md border border-white/15 rounded-2xl p-4 shadow-2xl w-[240px]"
                style={{ animation: 'fabGridUp 0.2s cubic-bezier(0.16,1,0.3,1) both', transformOrigin: 'bottom center' }}>
                {/* Randomizer bar */}
                <button
                  onClick={() => { setShowAddNewMenu(false); setShowRandomExperience(true); }}
                  className="w-full mb-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/30 to-orange-500/30 border border-amber-500/30 hover:from-amber-500/40 hover:to-orange-500/40 transition active:scale-95 flex items-center justify-center gap-2"
                  style={{ animation: 'fabItemUp 0.25s cubic-bezier(0.16,1,0.3,1) 0s both' }}
                >
                  <span className="text-lg">🎲</span>
                  <span className="text-sm font-semibold text-amber-200">Randomizer</span>
                </button>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { action: () => setShowAddTaskModal('create'), icon: '✅', label: 'Task', gradient: 'from-blue-400 to-indigo-500' },
                    { action: () => setShowSharedListModal('create'), icon: '🛒', label: 'List', gradient: 'from-emerald-400 to-teal-500' },
                    { action: () => setShowAddIdeaModal('create'), icon: '💡', label: 'Idea', gradient: 'from-yellow-400 to-amber-500' },
                    { action: () => setShowNewTripModal('new'), icon: '✈️', label: 'Trip', gradient: 'from-teal-400 to-cyan-500' },
                    { action: () => setShowAddEventModal(true), icon: '🎉', label: 'Event', gradient: 'from-amber-400 to-orange-500' },
                    { action: () => setShowAddMemoryModal('milestone'), icon: '💝', label: 'Memory', gradient: 'from-rose-400 to-pink-500' },
                  ].map((item, idx) => {
                    const row = Math.floor(idx / 3);
                    const delay = (1 - row) * 0.04 + (idx % 3) * 0.015;
                    return (
                      <button key={item.label} onClick={() => { setShowAddNewMenu(false); item.action(); }} className="flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl hover:bg-white/10 transition active:scale-95" style={{ animation: `fabItemUp 0.25s cubic-bezier(0.16,1,0.3,1) ${delay}s both` }}>
                        <span className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-xl shadow-md`}>{item.icon}</span>
                        <span className="text-[11px] text-white/70 font-medium leading-tight">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <style>{`
                @keyframes fabGridUp { from { opacity: 0; transform: translateX(-50%) scaleY(0.3) scaleX(0.8) translateY(20px); } to { opacity: 1; transform: translateX(-50%) scaleY(1) scaleX(1) translateY(0); } }
                @keyframes fabItemUp { from { opacity: 0; transform: translateY(12px) scale(0.7); } to { opacity: 1; transform: translateY(0) scale(1); } }
              `}</style>
            </>
          )}
          {/* Nav bar background */}
          <div className="relative bg-slate-900 border-t border-white/10" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            {/* Atlas is the visual bridge between FAB and nav — no splash needed */}
            {/* Raised FAB button - centered, overlapping top of nav */}
            {isOwner && (
              <button
                onClick={() => setShowAddNewMenu(!showAddNewMenu)}
                className={`absolute left-1/2 -translate-x-1/2 -top-3 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 z-[101] ${
                  showAddNewMenu
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 rotate-45'
                    : 'bg-gradient-to-r from-purple-500 to-violet-600'
                }`}
                style={{
                  width: '3rem', height: '3rem',
                  boxShadow: showAddNewMenu
                    ? '0 4px 30px rgba(236, 72, 153, 0.7), 0 0 0 4px rgba(236, 72, 153, 0.12), 0 8px 16px rgba(0,0,0,0.4)'
                    : '0 4px 30px rgba(139, 92, 246, 0.7), 0 0 0 4px rgba(139, 92, 246, 0.12), 0 8px 16px rgba(0,0,0,0.4)',
                }}
              >
                <Plus className="w-6 h-6 text-white transition-transform duration-200" />
              </button>
            )}
            {/* Tab buttons — 4 items: Fitness, Hub, [FAB gap], Events, Memories */}
            <div className="flex items-end justify-around px-1 pt-1 pb-1">
              {[
                { id: 'fitness', label: 'Fitness', emoji: '🏃', gradient: 'from-orange-400 to-red-500' },
                { id: 'home', label: 'Hub', emoji: '⚛️', gradient: 'from-pink-500 to-purple-500' },
                { id: 'events', label: 'Events', emoji: '📅', gradient: 'from-amber-400 to-orange-500' },
                { id: 'memories', label: 'Memories', emoji: '💝', gradient: 'from-rose-400 to-pink-500' },
              ].map((section, idx) => (
                <React.Fragment key={section.id}>
                  {/* FAB spacer between Fitness (idx 1) and Events (idx 2) */}
                  {idx === 2 && isOwner && <div className="min-w-[56px]" />}
                  <button
                    onClick={() => {
                      setActiveSection(section.id);
                      if (section.id === 'events') setTravelViewMode('main');
                      if (section.id === 'home') setHubSubView('home');
                      setShowComingSoonMenu(false);
                    }}
                    className={`relative flex flex-col items-center justify-center py-1.5 rounded-xl transition-all active:scale-95 min-w-[52px]`}
                  >
                    <span className={`text-lg mb-0.5 transition-transform ${activeSection === section.id ? 'scale-110' : ''}`}>
                      {section.emoji}
                    </span>
                    <span className={`text-[10px] font-medium transition-colors ${activeSection === section.id ? 'text-white' : 'text-white/40'}`}>
                      {section.label}
                    </span>
                    {activeSection === section.id && (
                      <div className={`absolute -bottom-0.5 w-6 h-0.5 rounded-full bg-gradient-to-r ${section.gradient}`} />
                    )}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Build info footer */}
      <div className="w-full text-center py-3 pb-24 md:pb-3">
        <BuildInfo />
      </div>

      {/* Bottom rainbow bar - hidden on mobile when bottom nav is showing */}
      <div className={`h-1.5 w-full bg-gradient-to-r from-red-500 via-orange-500 via-yellow-400 via-green-500 via-blue-500 to-purple-500 ${!initialAppMode ? 'hidden md:block' : ''}`} />
    </div>
  );
}

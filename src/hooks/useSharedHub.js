import { useState, useCallback, useRef } from 'react';

/**
 * useSharedHub Hook
 * Manages all SharedHub data and operations in one place
 * Returns an object with state and callbacks ready to pass to SharedHubProvider
 */

export const useSharedHub = (currentUser, saveSharedHub, showToast, isLoadedRef) => {
  // Keep a ref to saveSharedHub so callbacks always use the latest version
  // without needing it in their dependency arrays (avoids stale closure bugs)
  const saveRef = useRef(saveSharedHub);
  saveRef.current = saveSharedHub;

  // Guard that blocks CRUD before the sharedHub Firestore doc has loaded.
  // Without this, any add/update/delete fired during cold-start would write the
  // stale empty state to the server, and the incoming snapshot would overwrite
  // the user's new item — the infamous "I added it and it disappeared" bug.
  const ensureHubLoaded = (actionLabel) => {
    if (isLoadedRef && isLoadedRef.current) return true;
    showToast(`Still syncing — try ${actionLabel} again in a moment.`, 'warning');
    return false;
  };

  // ========== STATE ==========
  const [sharedTasks, setSharedTasks] = useState([]);
  const [sharedLists, setSharedLists] = useState([]);
  const [sharedIdeas, setSharedIdeas] = useState([]);
  const [sharedSocial, setSharedSocial] = useState([]);
  const [sharedGoals, setSharedGoals] = useState([]);
  const [sharedOdysseyPlans, setSharedOdysseyPlans] = useState([]);

  // Hub UI state
  const [hubSubView, setHubSubView] = useState('home');
  const [hubTaskFilter, setHubTaskFilter] = useState('today');
  const [hubTaskSort, setHubTaskSort] = useState('date');
  const [hubListFilter, setHubListFilter] = useState('all');
  const [hubIdeaFilter, setHubIdeaFilter] = useState('all');
  const [hubIdeaStatusFilter, setHubIdeaStatusFilter] = useState('all');
  const [hubSocialFilter, setHubSocialFilter] = useState('all');
  const [hubGoalFilter, setHubGoalFilter] = useState('all');
  const [collapsedSections, setCollapsedSections] = useState({});

  // Hub modal states (for card editing/creation)
  const [showAddTaskModal, setShowAddTaskModal] = useState(null); // null | 'create' | task object (edit)
  const [showSharedListModal, setShowSharedListModal] = useState(null); // null | 'create' | list object (edit)
  const [showAddIdeaModal, setShowAddIdeaModal] = useState(null); // null | 'create' | idea object (edit)
  const [showAddSocialModal, setShowAddSocialModal] = useState(null); // null | 'create' | social object (edit)
  const [showAddGoalModal, setShowAddGoalModal] = useState(null); // null | 'create' | goal object (edit)
  const [showOdysseyPlanModal, setShowOdysseyPlanModal] = useState(null); // null | 'create' | plan object (edit)

  // ========== TASK CRUD ==========
  const addTask = useCallback((task) => {
    if (!ensureHubLoaded('adding the task')) return;
    const newTasks = [...sharedTasks, task];
    setSharedTasks(newTasks);
    saveRef.current(null, newTasks, null);
    showToast('Task added', 'success');
  }, [sharedTasks, showToast]);

  const updateTask = useCallback((taskId, updates) => {
    if (!ensureHubLoaded('editing the task')) return;
    const newTasks = sharedTasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
    setSharedTasks(newTasks);
    saveRef.current(null, newTasks, null);
  }, [sharedTasks]);

  const deleteTask = useCallback((taskId) => {
    if (!ensureHubLoaded('removing the task')) return;
    const newTasks = sharedTasks.filter(t => t.id !== taskId);
    setSharedTasks(newTasks);
    saveRef.current(null, newTasks, null);
    showToast('Task removed', 'info');
  }, [sharedTasks, showToast]);

  const completeTask = useCallback((taskId) => {
    if (!ensureHubLoaded('completing the task')) return;
    const task = sharedTasks.find(t => t.id === taskId);
    if (!task) return;
    const newStatus = task.status === 'done' ? 'pending' : 'done';
    const newTasks = sharedTasks.map(t => t.id === taskId ? {
      ...t,
      status: newStatus,
      completedBy: newStatus === 'done' ? currentUser : null,
      completedAt: newStatus === 'done' ? new Date().toISOString() : null,
    } : t);
    setSharedTasks(newTasks);
    saveRef.current(null, newTasks, null);
  }, [sharedTasks, currentUser]);

  const highlightTask = useCallback((taskId) => {
    if (!ensureHubLoaded('highlighting the task')) return;
    const newTasks = sharedTasks.map(t => t.id === taskId ? { ...t, highlighted: !t.highlighted } : t);
    setSharedTasks(newTasks);
    saveRef.current(null, newTasks, null);
  }, [sharedTasks]);

  // ========== LIST CRUD ==========
  const addList = useCallback((list) => {
    if (!ensureHubLoaded('adding the list')) return;
    const newLists = [...sharedLists, list];
    setSharedLists(newLists);
    saveRef.current(newLists, null, null);
    showToast('List created', 'success');
  }, [sharedLists, showToast]);

  const updateList = useCallback((listId, updates) => {
    if (!ensureHubLoaded('editing the list')) return;
    const newLists = sharedLists.map(l => l.id === listId ? { ...l, ...updates } : l);
    setSharedLists(newLists);
    saveRef.current(newLists, null, null);
  }, [sharedLists]);

  const deleteList = useCallback((listId) => {
    if (!ensureHubLoaded('removing the list')) return;
    const newLists = sharedLists.filter(l => l.id !== listId);
    setSharedLists(newLists);
    saveRef.current(newLists, null, null);
    showToast('List removed', 'info');
  }, [sharedLists, showToast]);

  const addListItem = useCallback((listId, item) => {
    if (!ensureHubLoaded('adding the item')) return;
    const newLists = sharedLists.map(l => l.id === listId ? { ...l, items: [...(l.items || []), item] } : l);
    setSharedLists(newLists);
    saveRef.current(newLists, null, null);
  }, [sharedLists]);

  const toggleListItem = useCallback((listId, itemId) => {
    if (!ensureHubLoaded('toggling the item')) return;
    const newLists = sharedLists.map(l => {
      if (l.id !== listId) return l;
      return {
        ...l,
        items: l.items.map(i => i.id === itemId ? {
          ...i,
          checked: !i.checked,
          checkedBy: !i.checked ? currentUser : null,
          checkedAt: !i.checked ? new Date().toISOString() : null,
        } : i)
      };
    });
    setSharedLists(newLists);
    saveRef.current(newLists, null, null);
  }, [sharedLists, currentUser]);

  const deleteListItem = useCallback((listId, itemId) => {
    if (!ensureHubLoaded('removing the item')) return;
    const newLists = sharedLists.map(l => {
      if (l.id !== listId) return l;
      return { ...l, items: l.items.filter(i => i.id !== itemId) };
    });
    setSharedLists(newLists);
    saveRef.current(newLists, null, null);
  }, [sharedLists]);

  const highlightList = useCallback((listId) => {
    if (!ensureHubLoaded('highlighting the list')) return;
    const newLists = sharedLists.map(l => l.id === listId ? { ...l, highlighted: !l.highlighted } : l);
    setSharedLists(newLists);
    saveRef.current(newLists, null, null);
  }, [sharedLists]);

  // ========== IDEA CRUD ==========
  const addIdea = useCallback((idea) => {
    if (!ensureHubLoaded('adding the idea')) return;
    const newIdeas = [...sharedIdeas, idea];
    setSharedIdeas(newIdeas);
    saveRef.current(null, null, newIdeas);
    showToast('Idea saved', 'success');
  }, [sharedIdeas, showToast]);

  const updateIdea = useCallback((ideaId, updates) => {
    if (!ensureHubLoaded('editing the idea')) return;
    const newIdeas = sharedIdeas.map(i => i.id === ideaId ? { ...i, ...updates } : i);
    setSharedIdeas(newIdeas);
    saveRef.current(null, null, newIdeas);
  }, [sharedIdeas]);

  const deleteIdea = useCallback((ideaId) => {
    if (!ensureHubLoaded('removing the idea')) return;
    const newIdeas = sharedIdeas.filter(i => i.id !== ideaId);
    setSharedIdeas(newIdeas);
    saveRef.current(null, null, newIdeas);
    showToast('Idea removed', 'info');
  }, [sharedIdeas, showToast]);

  const highlightIdea = useCallback((ideaId) => {
    if (!ensureHubLoaded('highlighting the idea')) return;
    const newIdeas = sharedIdeas.map(i => i.id === ideaId ? { ...i, highlighted: !i.highlighted } : i);
    setSharedIdeas(newIdeas);
    saveRef.current(null, null, newIdeas);
  }, [sharedIdeas]);

  // ========== SOCIAL CRUD ==========
  const addSocial = useCallback((social) => {
    if (!ensureHubLoaded('adding the social')) return;
    const newSocial = [...sharedSocial, social];
    setSharedSocial(newSocial);
    saveRef.current(null, null, null, newSocial);
    showToast('Social planned', 'success');
  }, [sharedSocial, showToast]);

  const updateSocial = useCallback((socialId, updates) => {
    if (!ensureHubLoaded('editing the social')) return;
    const newSocial = sharedSocial.map(s => s.id === socialId ? { ...s, ...updates } : s);
    setSharedSocial(newSocial);
    saveRef.current(null, null, null, newSocial);
  }, [sharedSocial]);

  const deleteSocial = useCallback((socialId) => {
    if (!ensureHubLoaded('removing the social')) return;
    const newSocial = sharedSocial.filter(s => s.id !== socialId);
    setSharedSocial(newSocial);
    saveRef.current(null, null, null, newSocial);
    showToast('Social removed', 'info');
  }, [sharedSocial, showToast]);

  const completeSocial = useCallback((socialId) => {
    const item = sharedSocial.find(s => s.id === socialId);
    if (!item) return;
    const newStatus = item.status === 'done' ? 'planned' : 'done';
    updateSocial(socialId, { status: newStatus });
    if (newStatus === 'done') showToast('Nice! Social done', 'success');
  }, [sharedSocial, updateSocial, showToast]);

  const highlightSocial = useCallback((socialId) => {
    const newSocial = sharedSocial.map(s => s.id === socialId ? { ...s, highlighted: !s.highlighted } : s);
    setSharedSocial(newSocial);
    saveRef.current(null, null, null, newSocial);
  }, [sharedSocial]);

  // ========== GOAL CRUD ==========
  const addGoal = useCallback((goal) => {
    if (!ensureHubLoaded('adding the goal')) return;
    const newGoals = [...sharedGoals, goal];
    setSharedGoals(newGoals);
    saveRef.current(null, null, null, null, newGoals);
    showToast('Goal added', 'success');
  }, [sharedGoals, showToast]);

  const updateGoal = useCallback((goalId, updates) => {
    if (!ensureHubLoaded('editing the goal')) return;
    const newGoals = sharedGoals.map(g => g.id === goalId ? { ...g, ...updates } : g);
    setSharedGoals(newGoals);
    saveRef.current(null, null, null, null, newGoals);
  }, [sharedGoals]);

  const deleteGoal = useCallback((goalId) => {
    if (!ensureHubLoaded('removing the goal')) return;
    const newGoals = sharedGoals.filter(g => g.id !== goalId);
    setSharedGoals(newGoals);
    saveRef.current(null, null, null, null, newGoals);
    showToast('Goal removed', 'info');
  }, [sharedGoals, showToast]);

  const toggleMilestone = useCallback((goalId, milestoneId) => {
    if (!ensureHubLoaded('toggling the milestone')) return;
    const newGoals = sharedGoals.map(g => {
      if (g.id !== goalId) return g;
      const newMilestones = (g.milestones || []).map(m => {
        if (m.id !== milestoneId) return m;
        return {
          ...m,
          completed: !m.completed,
          completedAt: !m.completed ? new Date().toISOString() : null,
        };
      });
      return { ...g, milestones: newMilestones };
    });
    setSharedGoals(newGoals);
    saveRef.current(null, null, null, null, newGoals);
  }, [sharedGoals]);

  const highlightGoal = useCallback((goalId) => {
    if (!ensureHubLoaded('highlighting the goal')) return;
    const newGoals = sharedGoals.map(g => g.id === goalId ? { ...g, highlighted: !g.highlighted } : g);
    setSharedGoals(newGoals);
    saveRef.current(null, null, null, null, newGoals);
  }, [sharedGoals]);

  // ========== ODYSSEY PLAN CRUD ==========
  const addOdysseyPlan = useCallback((plan) => {
    if (!ensureHubLoaded('adding the plan')) return;
    const newPlans = [...sharedOdysseyPlans, plan];
    setSharedOdysseyPlans(newPlans);
    saveRef.current(null, null, null, null, null, newPlans);
    showToast('Odyssey Plan created', 'success');
  }, [sharedOdysseyPlans, showToast]);

  const updateOdysseyPlan = useCallback((planId, updates) => {
    if (!ensureHubLoaded('editing the plan')) return;
    const newPlans = sharedOdysseyPlans.map(p => p.id === planId ? { ...p, ...updates } : p);
    setSharedOdysseyPlans(newPlans);
    saveRef.current(null, null, null, null, null, newPlans);
  }, [sharedOdysseyPlans]);

  const deleteOdysseyPlan = useCallback((planId) => {
    if (!ensureHubLoaded('removing the plan')) return;
    const newPlans = sharedOdysseyPlans.filter(p => p.id !== planId);
    setSharedOdysseyPlans(newPlans);
    saveRef.current(null, null, null, null, null, newPlans);
    showToast('Odyssey Plan removed', 'info');
  }, [sharedOdysseyPlans, showToast]);

  // ========== UI HELPERS ==========
  const toggleDashSection = useCallback((section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // ========== RETURN CONTEXT VALUE ==========
  return {
    // Data
    sharedTasks,
    sharedLists,
    sharedIdeas,
    sharedSocial,
    sharedGoals,
    sharedOdysseyPlans,

    // Task operations
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    highlightTask,

    // List operations
    addList,
    updateList,
    deleteList,
    addListItem,
    toggleListItem,
    deleteListItem,
    highlightList,

    // Idea operations
    addIdea,
    updateIdea,
    deleteIdea,
    highlightIdea,

    // Social operations
    addSocial,
    updateSocial,
    deleteSocial,
    completeSocial,
    highlightSocial,

    // Goal operations
    addGoal,
    updateGoal,
    deleteGoal,
    toggleMilestone,
    highlightGoal,

    // Odyssey Plan operations
    addOdysseyPlan,
    updateOdysseyPlan,
    deleteOdysseyPlan,

    // UI state
    hubSubView,
    setHubSubView,
    hubTaskFilter,
    setHubTaskFilter,
    hubTaskSort,
    setHubTaskSort,
    hubListFilter,
    setHubListFilter,
    hubIdeaFilter,
    setHubIdeaFilter,
    hubIdeaStatusFilter,
    setHubIdeaStatusFilter,
    hubSocialFilter,
    setHubSocialFilter,
    hubGoalFilter,
    setHubGoalFilter,
    collapsedSections,
    toggleDashSection,

    // Setters for loading data from Firebase
    setSharedTasks,
    setSharedLists,
    setSharedIdeas,
    setSharedSocial,
    setSharedGoals,
    setSharedOdysseyPlans,

    // Modal states
    showAddTaskModal,
    setShowAddTaskModal,
    showSharedListModal,
    setShowSharedListModal,
    showAddIdeaModal,
    setShowAddIdeaModal,
    showAddSocialModal,
    setShowAddSocialModal,
    showAddGoalModal,
    setShowAddGoalModal,
    showOdysseyPlanModal,
    setShowOdysseyPlanModal,

    // Utilities
    showToast,
  };
};

export default useSharedHub;

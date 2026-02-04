import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  // User Progress
  journeyProgress: {
    currentWeek: 3,
    completedWeeks: ['week1', 'week2'],
    startDate: null,
  },

  // Prayer
  prayer: {
    streak: 7,
    todayCompleted: false,
    totalMinutes: 0,
    prayerWatchSignups: [],
  },

  // Devotional
  devotional: {
    lastRead: null,
    bookmarked: [],
  },

  // Community
  community: {
    testimonies: [],
    groups: [],
    discussions: [],
  },

  // User Preferences
  preferences: {
    notifications: true,
    dailyDevotionalTime: '07:00',
    prayerReminderTime: '21:00',
  },
};

function appReducer(state, action) {
  switch (action.type) {
    case 'COMPLETE_WEEK':
      return {
        ...state,
        journeyProgress: {
          ...state.journeyProgress,
          completedWeeks: [
            ...state.journeyProgress.completedWeeks,
            action.payload,
          ],
          currentWeek: state.journeyProgress.currentWeek + 1,
        },
      };

    case 'LOG_PRAYER':
      return {
        ...state,
        prayer: {
          ...state.prayer,
          todayCompleted: true,
          streak: state.prayer.streak + 1,
          totalMinutes: state.prayer.totalMinutes + action.payload,
        },
      };

    case 'BOOKMARK_DEVOTIONAL':
      return {
        ...state,
        devotional: {
          ...state.devotional,
          bookmarked: [...state.devotional.bookmarked, action.payload],
        },
      };

    case 'SUBMIT_TESTIMONY':
      return {
        ...state,
        community: {
          ...state.community,
          testimonies: [action.payload, ...state.community.testimonies],
        },
      };

    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload,
        },
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;

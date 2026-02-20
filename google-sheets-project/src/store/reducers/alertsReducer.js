import { actionTypes } from "../actionTypes";

const initialState = {
  alerts: [],
  notifications: [],
  unreadCount: 0,
};

const alertsReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SHOW_ALERT:
      const newAlert = {
        id: Date.now(),
        type: action.payload.type || "info",
        title: action.payload.title,
        message: action.payload.message,
        timestamp: new Date().toISOString(),
        read: false,
      };

      return {
        ...state,
        alerts: [...state.alerts, newAlert],
        notifications: [...state.notifications, newAlert],
        unreadCount: state.unreadCount + 1,
      };

    case actionTypes.HIDE_ALERT:
      return {
        ...state,
        alerts: state.alerts.filter((alert) => alert.id !== action.payload.id),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };

    case actionTypes.CLEAR_ALL_ALERTS:
      return {
        ...state,
        alerts: [],
        notifications: [],
        unreadCount: 0,
      };

    default:
      return state;
  }
};

export default alertsReducer;

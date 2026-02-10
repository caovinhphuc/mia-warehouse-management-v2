import { actionTypes } from "../actionTypes";

const initialState = {
  activeTab: "overview",
  data: {
    overview: {
      totalSheets: 0,
      totalFiles: 0,
      lastSync: null,
      systemHealth: "healthy",
    },
    analytics: {
      charts: [],
      metrics: {},
      trends: [],
    },
    alerts: {
      unread: 0,
      recent: [],
    },
  },
  loading: false,
  error: null,
  lastUpdated: null,
};

const dashboardReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.FETCH_DASHBOARD_DATA:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actionTypes.UPDATE_DASHBOARD_DATA:
      return {
        ...state,
        data: {
          ...state.data,
          ...action.payload,
        },
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
      };

    case actionTypes.SET_ACTIVE_TAB:
      return {
        ...state,
        activeTab: action.payload,
      };

    default:
      return state;
  }
};

export default dashboardReducer;

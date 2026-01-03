import { actionTypes } from "../actionTypes";

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
  serviceAccount: {
    email: null,
    projectId: null,
    isConfigured: false,
  },
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.LOGIN_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        sessionId: action.payload.sessionId,
        serviceAccount: {
          ...state.serviceAccount,
          email: action.payload.serviceAccount?.email,
          projectId: action.payload.serviceAccount?.projectId,
          isConfigured: true,
        },
        loading: false,
        error: null,
      };

    case actionTypes.LOGIN_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: action.payload,
      };

    case actionTypes.LOGOUT:
      return {
        ...initialState,
      };

    default:
      return state;
  }
};

export default authReducer;

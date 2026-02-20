import { actionTypes } from "../actionTypes";
import { logoutUser } from "../../services/securityService";
import { persistor } from "../store";

/**
 * Logout action - clears Redux state and persisted storage
 */
export const logout = (logoutAll = false) => {
  return async (dispatch, getState) => {
    try {
      // Get sessionId from state or localStorage
      const state = getState();
      const sessionId =
        state.auth?.sessionId || localStorage.getItem("sessionId");

      // Call logout API
      await logoutUser(sessionId, logoutAll);

      // Clear Redux state
      dispatch({
        type: actionTypes.LOGOUT,
      });

      // Purge persisted state
      await persistor.purge();

      // Clear all localStorage items related to auth
      localStorage.removeItem("authToken");
      localStorage.removeItem("token");
      localStorage.removeItem("sessionId");

      // Clear sessionStorage
      sessionStorage.clear();

      return { success: true };
    } catch (error) {
      console.error("Logout action error:", error);

      // Even if API fails, clear local state
      dispatch({
        type: actionTypes.LOGOUT,
      });

      await persistor.purge();
      localStorage.removeItem("authToken");
      localStorage.removeItem("token");
      localStorage.removeItem("sessionId");
      sessionStorage.clear();

      throw error;
    }
  };
};

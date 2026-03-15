import { createStore, applyMiddleware, combineReducers } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
// Import thunk as named export from redux-thunk (version 3.x uses named exports)
import { thunk } from "redux-thunk";

// Import reducers
import authReducer from "./reducers/authReducer";
import sheetsReducer from "./reducers/sheetsReducer";
import driveReducer from "./reducers/driveReducer";
import dashboardReducer from "./reducers/dashboardReducer";
import alertsReducer from "./reducers/alertsReducer";

// Persist config
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "dashboard"], // Only persist these reducers
};

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  sheets: sheetsReducer,
  drive: driveReducer,
  dashboard: dashboardReducer,
  alerts: alertsReducer,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
export const store = createStore(persistedReducer, applyMiddleware(thunk));

// Create persistor
export const persistor = persistStore(store);

export default store;

import { actionTypes } from "../actionTypes";

const initialState = {
  sheets: [],
  currentSheet: null,
  sheetData: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

const sheetsReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.FETCH_SHEETS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actionTypes.FETCH_SHEETS_SUCCESS:
      return {
        ...state,
        sheets: action.payload.sheets,
        currentSheet: action.payload.currentSheet,
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
      };

    case actionTypes.FETCH_SHEETS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case actionTypes.UPDATE_SHEET_DATA:
      return {
        ...state,
        sheetData: action.payload.data,
        lastUpdated: new Date().toISOString(),
      };

    default:
      return state;
  }
};

export default sheetsReducer;

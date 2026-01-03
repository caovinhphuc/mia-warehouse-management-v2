import { actionTypes } from "../actionTypes";

const initialState = {
  files: [],
  folders: [],
  currentFolder: null,
  loading: false,
  error: null,
  uploadProgress: 0,
  lastUpdated: null,
};

const driveReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.FETCH_FILES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actionTypes.FETCH_FILES_SUCCESS:
      return {
        ...state,
        files: action.payload.files,
        folders: action.payload.folders,
        currentFolder: action.payload.currentFolder,
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
      };

    case actionTypes.FETCH_FILES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case actionTypes.UPLOAD_FILE_REQUEST:
      return {
        ...state,
        uploadProgress: 0,
        error: null,
      };

    case actionTypes.UPLOAD_FILE_SUCCESS:
      return {
        ...state,
        files: [...state.files, action.payload.file],
        uploadProgress: 100,
        lastUpdated: new Date().toISOString(),
      };

    case actionTypes.UPLOAD_FILE_FAILURE:
      return {
        ...state,
        uploadProgress: 0,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default driveReducer;

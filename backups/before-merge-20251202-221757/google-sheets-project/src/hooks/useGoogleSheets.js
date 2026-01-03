import { useState, useCallback } from "react";
import { googleSheetsApiService } from "../services/googleSheetsApi";

export const useGoogleSheets = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);

  const readSheet = useCallback(async (range = "A1:Z1000", sheetId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await googleSheetsApiService.readSheet(range, sheetId);
      setData(result.data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const writeSheet = useCallback(async (range, values, sheetId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await googleSheetsApiService.writeSheet(
        range,
        values,
        sheetId,
      );
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const appendToSheet = useCallback(async (range, values, sheetId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await googleSheetsApiService.appendToSheet(
        range,
        values,
        sheetId,
      );
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    readSheet,
    writeSheet,
    appendToSheet,
    clearError,
  };
};

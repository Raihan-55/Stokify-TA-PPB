import React, { createContext, useContext, useState, useCallback } from "react";
import Loader from "../components/Loader";

const LoadingContext = createContext({ showLoading: () => {}, hideLoading: () => {}, loading: false });

export function LoadingProvider({ children }) {
  const [loading, setLoading] = useState(false);

  const showLoading = useCallback(() => setLoading(true), []);
  const hideLoading = useCallback(() => setLoading(false), []);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading, loading }}>
      {loading && <Loader />}
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}

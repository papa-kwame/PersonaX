import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for optimized state management to prevent excessive re-renders
 * @param {*} initialState - Initial state value
 * @param {Object} options - Configuration options
 * @returns {Array} [state, setState, isUpdating]
 */
export const useOptimizedState = (initialState, options = {}) => {
  const { 
    debounceMs = 0, 
    deepCompare = false,
    onUpdate = null 
  } = options;

  const [state, setState] = useState(initialState);
  const [isUpdating, setIsUpdating] = useState(false);
  const timeoutRef = useRef(null);
  const previousStateRef = useRef(initialState);

  // Deep comparison function
  const isEqual = useCallback((a, b) => {
    if (!deepCompare) return a === b;
    return JSON.stringify(a) === JSON.stringify(b);
  }, [deepCompare]);

  // Optimized setState function
  const optimizedSetState = useCallback((newState) => {
    const actualNewState = typeof newState === 'function' ? newState(state) : newState;
    
    // Skip update if state hasn't changed
    if (isEqual(actualNewState, state)) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const updateState = () => {
      setIsUpdating(true);
      setState(actualNewState);
      previousStateRef.current = actualNewState;
      
      if (onUpdate) {
        onUpdate(actualNewState, previousStateRef.current);
      }
      
      // Reset updating flag after a brief delay
      setTimeout(() => setIsUpdating(false), 50);
    };

    if (debounceMs > 0) {
      timeoutRef.current = setTimeout(updateState, debounceMs);
    } else {
      updateState();
    }
  }, [state, isEqual, debounceMs, onUpdate]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, optimizedSetState, isUpdating];
};

/**
 * Hook for managing API state with loading, error, and data states
 * @param {Function} apiCall - API function to call
 * @param {Array} dependencies - Dependencies for the API call
 * @returns {Object} { data, loading, error, refetch }
 */
export const useApiState = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      if (isMountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

/**
 * Hook for debounced values to prevent excessive API calls
 * @param {*} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {*} Debounced value
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for memoized callbacks to prevent unnecessary re-renders
 * @param {Function} callback - Callback function
 * @param {Array} dependencies - Dependencies array
 * @returns {Function} Memoized callback
 */
export const useStableCallback = (callback, dependencies = []) => {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((...args) => {
    return callbackRef.current(...args);
  }, dependencies);
};

import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook for monitoring component performance and detecting memory leaks
 * @param {string} componentName - Name of the component for logging
 * @param {Object} options - Configuration options
 */
export const usePerformanceMonitor = (componentName, options = {}) => {
  const {
    logRenderTime = false,
    logMemoryUsage = false,
    warnOnSlowRender = true,
    slowRenderThreshold = 16, // 16ms = 60fps
    trackReRenders = true
  } = options;

  const renderCountRef = useRef(0);
  const renderStartTimeRef = useRef(0);
  const lastRenderTimeRef = useRef(0);
  const mountTimeRef = useRef(Date.now());

  // Track render performance
  useEffect(() => {
    renderCountRef.current += 1;
    renderStartTimeRef.current = performance.now();
    
    if (logRenderTime || trackReRenders) {
      const renderTime = performance.now() - renderStartTimeRef.current;
      lastRenderTimeRef.current = renderTime;
      
      if (logRenderTime) {
        console.log(`[${componentName}] Render time: ${renderTime.toFixed(2)}ms`);
      }
      
      if (warnOnSlowRender && renderTime > slowRenderThreshold) {
        console.warn(`[${componentName}] Slow render detected: ${renderTime.toFixed(2)}ms (threshold: ${slowRenderThreshold}ms)`);
      }
    }
  });

  // Track memory usage
  useEffect(() => {
    if (logMemoryUsage && performance.memory) {
      const memory = performance.memory;
      console.log(`[${componentName}] Memory usage:`, {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
      });
    }
  });

  // Component lifecycle tracking
  useEffect(() => {
    const mountTime = Date.now() - mountTimeRef.current;
    return () => {
      const totalLifetime = Date.now() - mountTimeRef.current;
      console.log(`[${componentName}] Component unmounted after ${totalLifetime}ms (${renderCountRef.current} renders)`);
    };
  }, [componentName]);

  // Return performance metrics
  return {
    renderCount: renderCountRef.current,
    lastRenderTime: lastRenderTimeRef.current,
    isSlowRender: lastRenderTimeRef.current > slowRenderThreshold
  };
};

/**
 * Hook for detecting memory leaks in components
 * @param {string} componentName - Name of the component
 * @returns {Object} Memory leak detection utilities
 */
export const useMemoryLeakDetector = (componentName) => {
  const timersRef = useRef(new Set());
  const intervalsRef = useRef(new Set());
  const eventListenersRef = useRef(new Set());
  const subscriptionsRef = useRef(new Set());

  // Track timers
  const trackTimer = useCallback((timerId) => {
    timersRef.current.add(timerId);
    return timerId;
  }, []);

  // Track intervals
  const trackInterval = useCallback((intervalId) => {
    intervalsRef.current.add(intervalId);
    return intervalId;
  }, []);

  // Track event listeners
  const trackEventListener = useCallback((element, event, handler) => {
    const key = `${element}-${event}`;
    eventListenersRef.current.add(key);
    return key;
  }, []);

  // Track subscriptions
  const trackSubscription = useCallback((subscription) => {
    subscriptionsRef.current.add(subscription);
    return subscription;
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    // Clear all timers
    timersRef.current.forEach(timerId => {
      clearTimeout(timerId);
    });
    timersRef.current.clear();

    // Clear all intervals
    intervalsRef.current.forEach(intervalId => {
      clearInterval(intervalId);
    });
    intervalsRef.current.clear();

    // Remove event listeners (this is a simplified version)
    eventListenersRef.current.clear();

    // Unsubscribe from subscriptions
    subscriptionsRef.current.forEach(subscription => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    });
    subscriptionsRef.current.clear();

    console.log(`[${componentName}] Cleanup completed`);
  }, [componentName]);

  // Auto cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    trackTimer,
    trackInterval,
    trackEventListener,
    trackSubscription,
    cleanup
  };
};

/**
 * Hook for optimizing expensive calculations
 * @param {Function} calculation - Expensive calculation function
 * @param {Array} dependencies - Dependencies for the calculation
 * @param {Object} options - Configuration options
 * @returns {*} Memoized result
 */
export const useExpensiveCalculation = (calculation, dependencies, options = {}) => {
  const {
    cacheSize = 10,
    enableLogging = false
  } = options;

  const cacheRef = useRef(new Map());
  const lastDepsRef = useRef(dependencies);

  return useCallback(() => {
    const depsKey = JSON.stringify(dependencies);
    
    // Check cache first
    if (cacheRef.current.has(depsKey)) {
      if (enableLogging) {
        console.log(`[${componentName}] Cache hit for calculation`);
      }
      return cacheRef.current.get(depsKey);
    }

    // Perform calculation
    const startTime = performance.now();
    const result = calculation();
    const endTime = performance.now();

    if (enableLogging) {
      console.log(`[${componentName}] Calculation completed in ${(endTime - startTime).toFixed(2)}ms`);
    }

    // Cache result
    if (cacheRef.current.size >= cacheSize) {
      const firstKey = cacheRef.current.keys().next().value;
      cacheRef.current.delete(firstKey);
    }
    cacheRef.current.set(depsKey, result);

    lastDepsRef.current = dependencies;
    return result;
  }, dependencies);
};

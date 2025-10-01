import React, { memo, useMemo, useCallback } from 'react';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';

/**
 * Higher-order component for performance optimization
 * Wraps components with memoization and performance monitoring
 */
const PerformanceWrapper = memo(({ 
  children, 
  componentName, 
  enableMonitoring = false,
  memoizeProps = true 
}) => {
  // Performance monitoring
  if (enableMonitoring) {
    usePerformanceMonitor(componentName, { 
      logRenderTime: false, 
      trackReRenders: true,
      warnOnSlowRender: true 
    });
  }

  return children;
});

PerformanceWrapper.displayName = 'PerformanceWrapper';

/**
 * Hook for creating memoized components with performance optimization
 */
export const useMemoizedComponent = (Component, dependencies = []) => {
  return useMemo(() => {
    return memo(Component);
  }, dependencies);
};

/**
 * Hook for creating stable callbacks to prevent unnecessary re-renders
 */
export const useStableCallbacks = (callbacks) => {
  const stableCallbacks = {};
  
  Object.keys(callbacks).forEach(key => {
    stableCallbacks[key] = useCallback(callbacks[key], []);
  });
  
  return stableCallbacks;
};

/**
 * Component for lazy loading with error boundaries
 */
export const LazyComponent = ({ 
  importFunction, 
  fallback = null, 
  errorFallback = null 
}) => {
  const LazyComponent = React.lazy(importFunction);
  
  return (
    <React.Suspense fallback={fallback}>
      <ErrorBoundary fallback={errorFallback}>
        <LazyComponent />
      </ErrorBoundary>
    </React.Suspense>
  );
};

/**
 * Error boundary for lazy loaded components
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          color: '#dc2626',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <h3>Something went wrong</h3>
          <p>Failed to load component. Please refresh the page.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook for debouncing expensive operations
 */
export const useDebouncedCallback = (callback, delay) => {
  const timeoutRef = React.useRef();
  
  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

/**
 * Hook for throttling expensive operations
 */
export const useThrottledCallback = (callback, delay) => {
  const lastCallRef = React.useRef(0);
  
  return useCallback((...args) => {
    const now = Date.now();
    
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now;
      callback(...args);
    }
  }, [callback, delay]);
};

export default PerformanceWrapper;

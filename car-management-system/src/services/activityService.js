import api from './api';

class ActivityService {
  constructor() {
    this.pingInterval = null;
    this.pingIntervalMs = 2 * 60 * 1000; // 2 minutes
    this.isActive = false;
    this.currentPage = window.location.pathname;
  }

  startActivityTracking() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.pingActivity();
    
    // Set up periodic pinging
    this.pingInterval = setInterval(() => {
      this.pingActivity();
    }, this.pingIntervalMs);

    // Add event listeners for user activity
    this.addActivityListeners();
    
    // Track page navigation
    this.trackPageNavigation();
  }

  stopActivityTracking() {
    this.isActive = false;
    
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    this.removeActivityListeners();
  }

  async pingActivity() {
    try {
      const authData = localStorage.getItem('authData');
      if (!authData) {
        this.stopActivityTracking();
        return;
      }

      const { userId } = JSON.parse(authData);
      if (!userId) {
        this.stopActivityTracking();
        return;
      }

      await api.post('/api/Auth/activity/ping', { userId });
    } catch (error) {
      console.error('Failed to ping activity:', error);
      // If unauthorized, stop tracking
      if (error.response?.status === 401) {
        this.stopActivityTracking();
      }
    }
  }

  addActivityListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, this.handleUserActivity.bind(this), { passive: true });
    });
  }

  removeActivityListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.removeEventListener(event, this.handleUserActivity.bind(this));
    });
  }

  handleUserActivity() {
    // Debounce the activity handler to avoid too many pings
    if (this.activityTimeout) {
      clearTimeout(this.activityTimeout);
    }
    
    this.activityTimeout = setTimeout(() => {
      this.pingActivity();
    }, 1000); // Wait 1 second after last activity before pinging
  }

  trackPageNavigation() {
    // Track initial page load
    this.logPageView();
    
    // Track navigation changes
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.currentPage = window.location.pathname;
      this.logPageView();
    };
    
    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      this.currentPage = window.location.pathname;
      this.logPageView();
    };
    
    // Track popstate events
    window.addEventListener('popstate', () => {
      this.currentPage = window.location.pathname;
      this.logPageView();
    });
  }

  async logPageView() {
    try {
      await this.logActivity('PageView', 'Navigation', `Viewed page: ${this.currentPage}`, null, null, {
        pageUrl: this.currentPage,
        referrer: document.referrer,
        userAgent: navigator.userAgent
      });
    } catch (error) {
      console.error('Failed to log page view:', error);
    }
  }

  async logActivity(activityType, module, description, entityType = null, entityId = null, details = null) {
    try {
      const authData = localStorage.getItem('authData');
      if (!authData) return;

      const { userId } = JSON.parse(authData);
      if (!userId) return;

      await api.post('/api/UserActivity/log', {
        userId,
        activityType,
        module,
        description,
        entityType,
        entityId,
        details: {
          ...details,
          timestamp: new Date().toISOString(),
          pageUrl: this.currentPage,
          userAgent: navigator.userAgent
        }
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  // Convenience methods for common activities
  async logLogin() {
    await this.logActivity('Login', 'Authentication', 'User logged in successfully');
  }

  async logLogout() {
    await this.logActivity('Logout', 'Authentication', 'User logged out');
  }

  async logCreate(module, entityType, entityId, details = null) {
    await this.logActivity('Create', module, `Created new ${entityType}`, entityType, entityId, details);
  }

  async logUpdate(module, entityType, entityId, details = null) {
    await this.logActivity('Update', module, `Updated ${entityType}`, entityType, entityId, details);
  }

  async logDelete(module, entityType, entityId, details = null) {
    await this.logActivity('Delete', module, `Deleted ${entityType}`, entityType, entityId, details);
  }

  async logView(module, entityType, entityId, details = null) {
    await this.logActivity('View', module, `Viewed ${entityType}`, entityType, entityId, details);
  }

  async logSearch(module, searchTerm, resultsCount) {
    await this.logActivity('Search', module, `Searched for: ${searchTerm}`, null, null, {
      searchTerm,
      resultsCount,
      timestamp: new Date().toISOString()
    });
  }

  async logExport(module, exportType, recordCount) {
    await this.logActivity('Export', module, `Exported ${exportType}`, null, null, {
      exportType,
      recordCount,
      timestamp: new Date().toISOString()
    });
  }

  async logout() {
    try {
      const authData = localStorage.getItem('authData');
      if (authData) {
        const { userId } = JSON.parse(authData);
        if (userId) {
          await this.logLogout(); // Log logout before clearing token
          await api.post('/api/Auth/logout', { userId });
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.stopActivityTracking();
      localStorage.removeItem('authData');
    }
  }
}

export default new ActivityService(); 
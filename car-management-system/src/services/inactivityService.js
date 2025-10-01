class InactivityService {
  constructor() {
    this.inactivityTimer = null;
    this.warningTimer = null;
    this.countdownTimer = null;
    this.countdown = 30;
    this.isWarningActive = false;
    this.callbacks = {
      onInactivityWarning: null,
      onLogout: null,
      onStayLoggedIn: null
    };
    
    // Configuration
    this.INACTIVITY_THRESHOLD = 15 * 60 * 1000; // 15 seconds in milliseconds (for testing)
    this.WARNING_COUNTDOWN = 30; // 30 seconds countdown
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    // List of events that indicate user activity
    const activityEvents = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Throttle the activity handler to avoid excessive calls
    let activityTimeout;
    const throttledActivityHandler = () => {
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(() => {
        this.resetInactivityTimer();
      }, 1000); // Only reset timer once per second max
    };

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, throttledActivityHandler, true);
    });

    // Also listen for visibility change (tab switching)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.resetInactivityTimer();
      }
    });
  }

  start() {
    this.resetInactivityTimer();
  }

  stop() {
    this.clearAllTimers();
  }

  resetInactivityTimer() {
    // Clear existing timers
    this.clearAllTimers();
    
    // Reset warning state
    this.isWarningActive = false;
    this.countdown = this.WARNING_COUNTDOWN;

    // Start new inactivity timer
    this.inactivityTimer = setTimeout(() => {
      this.showInactivityWarning();
    }, this.INACTIVITY_THRESHOLD);
  }

  showInactivityWarning() {
    this.isWarningActive = true;
    
    // Notify callback that warning should be shown
    if (this.callbacks.onInactivityWarning) {
      this.callbacks.onInactivityWarning();
    }

    // Start countdown timer
    this.startCountdown();
  }

  startCountdown() {
    this.countdownTimer = setInterval(() => {
      this.countdown--;
      
      // Update countdown in callback if provided
      if (this.callbacks.onInactivityWarning) {
        this.callbacks.onInactivityWarning(this.countdown);
      }

      if (this.countdown <= 0) {
        this.performLogout();
      }
    }, 1000);
  }

  performLogout() {
    this.clearAllTimers();
    this.isWarningActive = false;
    
    if (this.callbacks.onLogout) {
      this.callbacks.onLogout();
    }
  }

  stayLoggedIn() {
    this.clearAllTimers();
    this.isWarningActive = false;
    this.countdown = this.WARNING_COUNTDOWN;
    
    // Reset the inactivity timer
    this.resetInactivityTimer();
    
    if (this.callbacks.onStayLoggedIn) {
      this.callbacks.onStayLoggedIn();
    }
  }

  clearAllTimers() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
    
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }

  // Set callback functions
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Get current state
  getState() {
    return {
      isWarningActive: this.isWarningActive,
      countdown: this.countdown,
      timeUntilWarning: this.inactivityTimer ? this.INACTIVITY_THRESHOLD : 0
    };
  }

  // Update configuration
  updateConfig(config) {
    if (config.inactivityThreshold) {
      this.INACTIVITY_THRESHOLD = config.inactivityThreshold * 60 * 1000; // Convert minutes to milliseconds
    }
    if (config.warningCountdown) {
      this.WARNING_COUNTDOWN = config.warningCountdown;
      this.countdown = config.warningCountdown;
    }
  }
}

// Create singleton instance
const inactivityService = new InactivityService();

export default inactivityService;

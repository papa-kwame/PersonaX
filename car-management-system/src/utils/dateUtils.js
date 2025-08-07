import { format, parseISO } from 'date-fns';

// Custom date formatting for day/month/year format
export const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    
    if (includeTime) {
      // Format: DD/MM/YYYY HH:MM (e.g., "15/07/2025 14:30")
      return format(date, 'dd/MM/yyyy HH:mm');
    } else {
      // Format: DD/MM/YYYY (e.g., "15/07/2025")
      return format(date, 'dd/MM/yyyy');
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

// Format for display with month name: DD MMM YYYY (e.g., "15 Jul 2025")
export const formatDateDisplay = (dateString, includeTime = false) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    
    if (includeTime) {
      // Format: DD MMM YYYY HH:MM (e.g., "15 Jul 2025 14:30")
      return format(date, 'dd MMM yyyy HH:mm');
    } else {
      // Format: DD MMM YYYY (e.g., "15 Jul 2025")
      return format(date, 'dd MMM yyyy');
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

// Format for short display: DD/MM (e.g., "15/07")
export const formatDateShort = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return format(date, 'dd/MM');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

// Format for month and year: MMM YYYY (e.g., "Jul 2025")
export const formatMonthYear = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return format(date, 'MMM yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

// Format for time only: HH:MM (e.g., "14:30")
export const formatTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return format(date, 'HH:mm');
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid Time';
  }
};

// Safe format function that handles various date inputs
export const safeFormat = (dateString, formatType = 'default') => {
  if (!dateString) return 'N/A';
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    
    switch (formatType) {
      case 'short':
        return formatDateShort(dateString);
      case 'display':
        return formatDateDisplay(dateString);
      case 'display-time':
        return formatDateDisplay(dateString, true);
      case 'month-year':
        return formatMonthYear(dateString);
      case 'time':
        return formatTime(dateString);
      case 'default':
      default:
        return formatDate(dateString);
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}; 
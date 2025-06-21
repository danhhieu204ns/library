import dayjs from 'dayjs';
import 'dayjs/locale/vi';

// Set locale to Vietnamese
dayjs.locale('vi');

/**
 * Format a date with the given format
 * @param {Date|string} date - The date to format
 * @param {string} format - The format string (e.g., 'YYYY-MM-DD')
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  return dayjs(date).format(format);
};

/**
 * Get the start date (Monday) of the week containing the given date
 * Ensures consistency with backend implementation
 * @param {Date|string} date - Any date within the week
 * @returns {Date} - The Monday of that week
 */
export const getWeekStartDate = (date) => {
  const d = dayjs(date);
  const day = d.day(); // 0 is Sunday, 1 is Monday, etc.
  
  // Adjust: if it's Sunday (0), go back 6 days to get to Monday
  // Otherwise, go back (day - 1) days to get to Monday
  const daysToSubtract = day === 0 ? 6 : day - 1;
  
  return d.subtract(daysToSubtract, 'day').startOf('day').toDate();
};

/**
 * Get an array of Date objects for all days in the week
 * @param {Date|string} weekStartDate - The start date of the week (Monday)
 * @returns {Date[]} - Array of 7 Date objects from Monday to Sunday
 */
export const getWeekDates = (weekStartDate) => {
  const start = dayjs(weekStartDate).startOf('day');
  const dates = [];
  
  for (let i = 0; i < 7; i++) {
    dates.push(start.add(i, 'day').toDate());
  }
  
  return dates;
};

/**
 * Get a formatted time slot string (e.g., "7:00 - 10:30")
 * @param {string} timeSlot - The time slot identifier
 * @returns {string} - Formatted time slot
 */
export const formatTimeSlot = (timeSlot) => {
  // Just return the timeSlot string as is, or format if needed
  return timeSlot;
};

/**
 * Check if a date is in the past
 * @param {Date|string} date - The date to check
 * @returns {boolean} - True if the date is in the past
 */
export const isDateInPast = (date) => {
  return dayjs(date).isBefore(dayjs(), 'day');
};

/**
 * Check if a date is today
 * @param {Date|string} date - The date to check
 * @returns {boolean} - True if the date is today
 */
export const isToday = (date) => {
  return dayjs(date).isSame(dayjs(), 'day');
};

/**
 * Get the current week as a string (YYYY-MM-DD of Monday)
 * @returns {string} - The current week string
 */
export const getCurrentWeekString = () => {
  return formatDate(getWeekStartDate(new Date()));
};

/**
 * Get the start date (Monday) of next week
 * @returns {Date} - The Monday of next week
 */
export const getNextWeekStartDate = () => {
  const today = dayjs();
  // Add 7 days to today and get the Monday of that week
  return getWeekStartDate(today.add(7, 'day').toDate());
};

/**
 * Get the end date (Sunday) of next week
 * @returns {Date} - The Sunday of next week
 */
export const getNextWeekEndDate = () => {
  const nextWeekStart = getNextWeekStartDate();
  // Add 6 days to next Monday to get to Sunday
  return dayjs(nextWeekStart).add(6, 'day').endOf('day').toDate();
};

/**
 * Check if a date is within next week (Monday to Sunday)
 * @param {Date|string} date - The date to check
 * @returns {boolean} - True if the date is within next week
 */
export const isDateInNextWeek = (date) => {
  const nextWeekStart = getNextWeekStartDate();
  const nextWeekEnd = getNextWeekEndDate();
  const checkDate = dayjs(date).startOf('day');
  
  return checkDate.isAfter(dayjs(nextWeekStart).subtract(1, 'day')) && 
         checkDate.isBefore(dayjs(nextWeekEnd).add(1, 'day'));
};

export default {
  formatDate,
  getWeekStartDate,
  getWeekDates,
  formatTimeSlot,
  isDateInPast,
  isToday,
  getCurrentWeekString,
  getNextWeekStartDate,
  getNextWeekEndDate,
  isDateInNextWeek
};

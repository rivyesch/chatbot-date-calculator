/**
 * Vercel Serverless Function: Meal Prep Date Calculator
 * Endpoint: /api/calculate-meal-prep-dates
 */

// Singapore Public Holidays 2026 (Official MOM dates)
const SG_PUBLIC_HOLIDAYS = [
    '2026-01-01', // New Year's Day (Thu)
    '2026-02-17', // Chinese New Year (Tue)
    '2026-02-18', // Chinese New Year (Wed)
    '2026-03-21', // Hari Raya Puasa (Sat) - subject to confirmation
    '2026-04-03', // Good Friday (Fri)
    '2026-05-01', // Labour Day (Fri)
    '2026-05-27', // Hari Raya Haji (Wed) - subject to confirmation
    '2026-05-31', // Vesak Day (Sun)
    '2026-06-01', // Vesak Day observed (Mon)
    '2026-08-09', // National Day (Sun)
    '2026-08-10', // National Day observed (Mon)
    '2026-11-08', // Deepavali (Sun)
    '2026-11-09', // Deepavali observed (Mon)
    '2026-12-25', // Christmas Day (Fri)
  ];
  
  /**
   * Helper: Check if date is Sunday
   */
  function isSunday(date) {
    return date.getDay() === 0;
  }
  
  /**
   * Helper: Check if date is SG public holiday
   */
  function isPublicHoliday(date) {
    const dateString = date.toISOString().split('T')[0];
    return SG_PUBLIC_HOLIDAYS.includes(dateString);
  }
  
  /**
   * Helper: Format date as YYYY-MM-DD
   */
  function formatDate(date) {
    return date.toISOString().split('T')[0];
  }
  
  /**
   * Helper: Parse date string to Date object
   */
  function parseDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date format: ${dateString}`);
    }
    return date;
  }
  
  /**
   * Helper: Add days to a date
   */
  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
  
  /**
   * Helper: Generate date range excluding Sundays and public holidays
   */
  function generateAvailableDates(startDate, endDate) {
    const dates = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
  
    while (current <= end) {
      if (!isSunday(current) && !isPublicHoliday(current)) {
        dates.push({
          date: formatDate(current),
          dayOfWeek: current.toLocaleDateString('en-US', { weekday: 'long' }),
          displayDate: current.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        });
      }
      current.setDate(current.getDate() + 1);
    }
  
    return dates;
  }
  
  /**
   * Calculate Program Start Date (PSD) options
   */
  function calculateProgramStartDate(signupDate) {
    const signup = parseDate(signupDate);
    const earliestPSD = addDays(signup, 7);
  
    return {
      earliestDate: formatDate(earliestPSD),
      rule: "Must be at least 7 days after sign-up",
      noRestrictions: true,
      message: `You can start your program any day from ${earliestPSD.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })} onwards (including weekends and holidays).`
    };
  }
  
  /**
   * Calculate Delivery 1 (D1) available dates
   */
  function calculateDelivery1Dates(signupDate, programStartDate) {
    const signup = parseDate(signupDate);
    const psd = parseDate(programStartDate);
  
    const earliestD1 = addDays(signup, 4);
    const latestD1 = addDays(psd, -1);
  
    // Validation
    if (earliestD1 > latestD1) {
      return {
        error: true,
        message: `No available delivery dates. Program start date must be at least ${
          4 + 1
        } days after sign-up to allow for delivery.`,
        earliestPossible: formatDate(earliestD1),
        latestPossible: formatDate(latestD1)
      };
    }
  
    const availableDates = generateAvailableDates(earliestD1, latestD1);
  
    return {
      availableDates,
      count: availableDates.length,
      window: {
        earliest: formatDate(earliestD1),
        latest: formatDate(latestD1)
      },
      rules: {
        excludeSundays: true,
        excludePublicHolidays: true,
        minimumProcessingDays: 4
      },
      message: availableDates.length > 0
        ? `${availableDates.length} delivery dates available between ${earliestD1.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })} and ${latestD1.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })} (excluding Sundays and public holidays).`
        : "No available delivery dates in this window."
    };
  }
  
  /**
   * Calculate Delivery 2 (D2) available dates
   */
  function calculateDelivery2Dates(delivery1Date, programStartDate, cheatDays = 0) {
    const d1 = parseDate(delivery1Date);
    const psd = parseDate(programStartDate);
  
    // Validate cheatDays
    if (cheatDays < 0 || cheatDays > 30) {
      return {
        error: true,
        message: "cheatDays must be between 0 and 30"
      };
    }
  
    // Calculate Day 6 date
    const day6Date = addDays(psd, 5 + cheatDays);
    const latestD2 = addDays(day6Date, -1);
  
    // Validation
    if (d1 > latestD2) {
      return {
        error: true,
        message: `No available delivery dates. Delivery 2 must arrive before Day 6 (${formatDate(day6Date)}).`,
        delivery1Date: formatDate(d1),
        day6Date: formatDate(day6Date),
        latestPossible: formatDate(latestD2)
      };
    }
  
    const availableDates = generateAvailableDates(d1, latestD2);
  
    return {
      availableDates,
      count: availableDates.length,
      window: {
        earliest: formatDate(d1),
        latest: formatDate(latestD2)
      },
      day6Date: formatDate(day6Date),
      cheatDaysApplied: cheatDays,
      rules: {
        excludeSundays: true,
        excludePublicHolidays: true,
        mustArriveBeforeDay6: true
      },
      message: availableDates.length > 0
        ? `${availableDates.length} delivery dates available between ${d1.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })} and ${latestD2.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })} (excluding Sundays and public holidays).`
        : "No available delivery dates in this window."
    };
  }
  
  /**
   * Main calculation function
   */
  function calculateMealPrepDates(input) {
    try {
      // Default signupDate to today if not provided
      const signupDate = input.signupDate || formatDate(new Date());
      const calculation = input.calculation || 'all';
  
      const result = {
        input: {
          signupDate,
          programStartDate: input.programStartDate || null,
          delivery1Date: input.delivery1Date || null,
          cheatDays: input.cheatDays || 0,
          calculation
        },
        calculations: {}
      };
  
      // Calculate Program Start Date
      if (calculation === 'all' || calculation === 'psd') {
        result.calculations.programStartDate = calculateProgramStartDate(signupDate);
      }
  
      // Calculate Delivery 1
      if ((calculation === 'all' || calculation === 'd1') && input.programStartDate) {
        result.calculations.delivery1 = calculateDelivery1Dates(
          signupDate,
          input.programStartDate
        );
      }
  
      // Calculate Delivery 2
      if ((calculation === 'all' || calculation === 'd2') && input.delivery1Date && input.programStartDate) {
        result.calculations.delivery2 = calculateDelivery2Dates(
          input.delivery1Date,
          input.programStartDate,
          input.cheatDays || 0
        );
      }
  
      result.success = true;
      result.timestamp = new Date().toISOString();
  
      return result;
  
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Vercel Serverless Function Handler
   * This is the entry point for the API endpoint
   */
  export default function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
  
    // Handle OPTIONS preflight request
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
  
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed. Please use POST.',
        timestamp: new Date().toISOString()
      });
    }
  
    // Calculate dates
    const result = calculateMealPrepDates(req.body);
  
    // Return appropriate status code
    const statusCode = result.success ? 200 : 400;
    return res.status(statusCode).json(result);
  }
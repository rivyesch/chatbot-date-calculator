/**

 * Meal Prep Date Calculator

 * Calculates valid program start dates and delivery windows based on business rules

 */

 

// Singapore Public Holidays 2026 (extend as needed)

const SG_PUBLIC_HOLIDAYS = [
  
    // 2026
  
    '2026-01-01', // New Year's Day
  
    '2026-02-17', // Chinese New Year
  
    '2026-02-18', // Chinese New Year
  
    '2026-03-21', // Hari Raya Puasa

    '2026-04-03', // Good Friday
  
    '2026-05-01', // Labour Day
  
    '2026-05-27', // Hari Raya Haji
  
    '2026-05-31', // Vesak Day

    '2026-06-01', // Vesak Day
    
    '2026-08-09', // National Day (observed)

    '2026-08-10', // National Day (observed)
  
    '2026-11-08', // Deepavali
  
    '2026-11-09', // Deepavali

    '2026-12-25', // Christmas Day
  
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
  
   *
  
   * Rules:
  
   * - Must be at least 7 days after sign-up date
  
   * - No upper limit
  
   * - No exclusions (can be any day including Sundays and holidays)
  
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
  
   *
  
   * Rules:
  
   * - Earliest: signupDate + 4 days
  
   * - Latest: programStartDate - 1 day
  
   * - Exclude: Sundays
  
   * - Exclude: Singapore public holidays
  
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
  
   *
  
   * Rules:
  
   * - Earliest: delivery1Date (can be same day)
  
   * - Latest: (programStartDate + 5 + cheatDays) - 1 day
  
   * - Day 6 calculation: PSD + 5 + cheatDays
  
   * - Exclude: Sundays
  
   * - Exclude: Singapore public holidays
  
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
  
   * Main function: Calculate all dates for meal prep program
  
   *
  
   * @param {Object} input - Input parameters
  
   * @param {string} input.signupDate - Sign-up date in YYYY-MM-DD format (defaults to today)
  
   * @param {string} [input.programStartDate] - Desired program start date in YYYY-MM-DD format
  
   * @param {string} [input.delivery1Date] - Selected delivery 1 date in YYYY-MM-DD format
  
   * @param {number} [input.cheatDays=0] - Number of cheat days (0-30)
  
   * @param {string} [input.calculation] - Specific calculation to perform: "psd", "d1", "d2", or "all"
  
   *
  
   * @returns {Object} Calculated date information
  
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
  
   
  
  // Export for use as module
  
  if (typeof module !== 'undefined' && module.exports) {
  
    module.exports = {
  
      calculateMealPrepDates,
  
      calculateProgramStartDate,
  
      calculateDelivery1Dates,
  
      calculateDelivery2Dates
  
    };
  
  }
  
   
  
  // Example usage and tests
  
  if (require.main === module) {
  
    console.log('=== Meal Prep Date Calculator Examples ===\n');
  
   
  
    // Example 1: Calculate all dates step by step
  
    console.log('Example 1: Full calculation flow');
  
    const today = '2026-01-09';
  
    const step1 = calculateMealPrepDates({
  
      signupDate: today,
  
      calculation: 'psd'
  
    });
  
    console.log(JSON.stringify(step1, null, 2));
  
   
  
    console.log('\n---\n');
  
   
  
    // Example 2: Calculate D1 options
  
    console.log('Example 2: Delivery 1 options');
  
    const step2 = calculateMealPrepDates({
  
      signupDate: today,
  
      programStartDate: '2026-01-20',
  
      calculation: 'd1'
  
    });
  
    console.log(JSON.stringify(step2, null, 2));
  
   
  
    console.log('\n---\n');
  
   
  
    // Example 3: Calculate D2 options with cheat days
  
    console.log('Example 3: Delivery 2 options with cheat days');
  
    const step3 = calculateMealPrepDates({
  
      signupDate: today,
  
      programStartDate: '2026-01-20',
  
      delivery1Date: '2026-01-15',
  
      cheatDays: 2,
  
      calculation: 'd2'
  
    });
  
    console.log(JSON.stringify(step3, null, 2));
  
   
  
    console.log('\n---\n');
  
   
  
    // Example 4: Calculate everything at once
  
    console.log('Example 4: All calculations');
  
    const step4 = calculateMealPrepDates({
  
      signupDate: today,
  
      programStartDate: '2026-01-20',
  
      delivery1Date: '2026-01-15',
  
      cheatDays: 1,
  
      calculation: 'all'
  
    });
  
    console.log(JSON.stringify(step4, null, 2));
  
  }
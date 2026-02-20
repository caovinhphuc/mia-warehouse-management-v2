import moment from "moment";

// Date formatting utilities
export const formatDate = (date, format = "DD/MM/YYYY") => {
  if (!date) return "";
  return moment(date).format(format);
};

export const formatDateTime = (date, format = "DD/MM/YYYY HH:mm") => {
  if (!date) return "";
  return moment(date).format(format);
};

export const formatTime = (date, format = "HH:mm") => {
  if (!date) return "";
  return moment(date).format(format);
};

// Vietnamese date formats
export const formatDateVN = (date) => {
  return formatDate(date, "DD/MM/YYYY");
};

export const formatDateTimeVN = (date) => {
  return formatDateTime(date, "DD/MM/YYYY HH:mm");
};

export const formatTimeVN = (date) => {
  return formatTime(date, "HH:mm:ss");
};

// Relative time
export const getRelativeTime = (date) => {
  if (!date) return "";
  return moment(date).fromNow();
};

// Date validation
export const isValidDate = (date) => {
  return moment(date).isValid();
};

// Date comparison
export const isToday = (date) => {
  return moment(date).isSame(moment(), "day");
};

export const isYesterday = (date) => {
  return moment(date).isSame(moment().subtract(1, "day"), "day");
};

export const isThisWeek = (date) => {
  return moment(date).isSame(moment(), "week");
};

export const isThisMonth = (date) => {
  return moment(date).isSame(moment(), "month");
};

export const isThisYear = (date) => {
  return moment(date).isSame(moment(), "year");
};

// Date ranges
export const getDateRange = (type) => {
  const now = moment();

  switch (type) {
    case "today":
      return {
        start: now.startOf("day").toDate(),
        end: now.endOf("day").toDate(),
      };
    case "yesterday":
      return {
        start: now.subtract(1, "day").startOf("day").toDate(),
        end: now.endOf("day").toDate(),
      };
    case "thisWeek":
      return {
        start: now.startOf("week").toDate(),
        end: now.endOf("week").toDate(),
      };
    case "lastWeek":
      return {
        start: now.subtract(1, "week").startOf("week").toDate(),
        end: now.endOf("week").toDate(),
      };
    case "thisMonth":
      return {
        start: now.startOf("month").toDate(),
        end: now.endOf("month").toDate(),
      };
    case "lastMonth":
      return {
        start: now.subtract(1, "month").startOf("month").toDate(),
        end: now.endOf("month").toDate(),
      };
    case "thisYear":
      return {
        start: now.startOf("year").toDate(),
        end: now.endOf("year").toDate(),
      };
    case "lastYear":
      return {
        start: now.subtract(1, "year").startOf("year").toDate(),
        end: now.endOf("year").toDate(),
      };
    default:
      return {
        start: now.startOf("day").toDate(),
        end: now.endOf("day").toDate(),
      };
  }
};

// Date manipulation
export const addDays = (date, days) => {
  return moment(date).add(days, "days").toDate();
};

export const subtractDays = (date, days) => {
  return moment(date).subtract(days, "days").toDate();
};

export const addMonths = (date, months) => {
  return moment(date).add(months, "months").toDate();
};

export const subtractMonths = (date, months) => {
  return moment(date).subtract(months, "months").toDate();
};

export const addYears = (date, years) => {
  return moment(date).add(years, "years").toDate();
};

export const subtractYears = (date, years) => {
  return moment(date).subtract(years, "years").toDate();
};

// Date parsing for Google Sheets
export const parseSheetDate = (dateString) => {
  if (!dateString) return null;

  // Handle various date formats from Google Sheets
  const formats = [
    "DD/MM/YYYY",
    "MM/DD/YYYY",
    "YYYY-MM-DD",
    "DD-MM-YYYY",
    "MM-DD-YYYY",
    "DD/MM/YYYY HH:mm",
    "MM/DD/YYYY HH:mm",
    "YYYY-MM-DD HH:mm:ss",
  ];

  for (const format of formats) {
    const parsed = moment(dateString, format, true);
    if (parsed.isValid()) {
      return parsed.toDate();
    }
  }

  // Fallback to automatic parsing
  return moment(dateString).isValid() ? moment(dateString).toDate() : null;
};

// Format date for Google Sheets
export const formatForSheet = (date, includeTime = false) => {
  if (!date) return "";

  const format = includeTime ? "DD/MM/YYYY HH:mm" : "DD/MM/YYYY";
  return moment(date).format(format);
};

// Get current timestamp for Google Sheets
export const getCurrentTimestamp = () => {
  return moment().format("DD/MM/YYYY HH:mm:ss");
};

// Date range picker helpers
export const getDateRangeOptions = () => {
  return [
    { value: "today", label: "Hôm nay" },
    { value: "yesterday", label: "Hôm qua" },
    { value: "thisWeek", label: "Tuần này" },
    { value: "lastWeek", label: "Tuần trước" },
    { value: "thisMonth", label: "Tháng này" },
    { value: "lastMonth", label: "Tháng trước" },
    { value: "thisYear", label: "Năm nay" },
    { value: "lastYear", label: "Năm trước" },
    { value: "custom", label: "Tùy chọn" },
  ];
};

// Weekday names in Vietnamese
export const getWeekdayNames = () => {
  return [
    "Chủ nhật",
    "Thứ hai",
    "Thứ ba",
    "Thứ tư",
    "Thứ năm",
    "Thứ sáu",
    "Thứ bảy",
  ];
};

// Month names in Vietnamese
export const getMonthNames = () => {
  return [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];
};

// Get Vietnamese weekday name
export const getWeekdayNameVN = (date) => {
  const weekdays = getWeekdayNames();
  return weekdays[moment(date).day()];
};

// Get Vietnamese month name
export const getMonthNameVN = (date) => {
  const months = getMonthNames();
  return months[moment(date).month()];
};

// Age calculation
export const calculateAge = (birthDate) => {
  return moment().diff(moment(birthDate), "years");
};

// Business days calculation (excluding weekends)
export const getBusinessDays = (startDate, endDate) => {
  let count = 0;
  let current = moment(startDate);
  const end = moment(endDate);

  while (current.isSameOrBefore(end)) {
    if (current.day() !== 0 && current.day() !== 6) {
      count++;
    }
    current = current.add(1, "day");
  }

  return count;
};

// Get start and end of different periods
export const getPeriodBounds = (date, period = "month") => {
  const momentDate = moment(date);

  switch (period) {
    case "day":
      return {
        start: momentDate.startOf("day").toDate(),
        end: momentDate.endOf("day").toDate(),
      };
    case "week":
      return {
        start: momentDate.startOf("week").toDate(),
        end: momentDate.endOf("week").toDate(),
      };
    case "month":
      return {
        start: momentDate.startOf("month").toDate(),
        end: momentDate.endOf("month").toDate(),
      };
    case "quarter":
      return {
        start: momentDate.startOf("quarter").toDate(),
        end: momentDate.endOf("quarter").toDate(),
      };
    case "year":
      return {
        start: momentDate.startOf("year").toDate(),
        end: momentDate.endOf("year").toDate(),
      };
    default:
      return {
        start: momentDate.startOf("day").toDate(),
        end: momentDate.endOf("day").toDate(),
      };
  }
};

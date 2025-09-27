// Safe localStorage utilities with error handling

export const safeGetItem = (key: string): string | null => {
  try {
    const item = localStorage.getItem(key);
    // Handle cases where localStorage returns "undefined" or "null" as strings
    if (item === 'undefined' || item === 'null') {
      localStorage.removeItem(key);
      return null;
    }
    return item;
  } catch (error) {
    console.error(`Error getting item from localStorage for key "${key}":`, error);
    return null;
  }
};

export const safeSetItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error setting item in localStorage for key "${key}":`, error);
    return false;
  }
};

export const safeRemoveItem = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing item from localStorage for key "${key}":`, error);
    return false;
  }
};

export const safeParseJSON = <T>(jsonString: string): T | null => {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
};

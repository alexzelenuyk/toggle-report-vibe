import axios from 'axios';

/**
 * Converts API errors into user-friendly, humorous messages with
 * explanations and suggestions for how to fix the issue.
 */
export function getFriendlyErrorMessage(error: unknown): string {
  // Handle Axios API errors
  if (axios.isAxiosError(error) && error.response) {
    const status = error.response.status;
    
    switch (status) {
      case 400:
        return "Oops! Your request had a bad case of the 400s. 🤒 The Toggl API didn't understand what you were asking for. Check your workspace ID and date format.";
      
      case 401:
        return "Authentication failed! 🕵️‍♂️ Looks like your API token is having an identity crisis. Double-check your token or generate a fresh one from your Toggl Profile settings.";
      
      case 403:
        return "Access denied! 🚫 Toggl is giving you the cold shoulder. Make sure you have permission to access this workspace and your API token has the right privileges.";
      
      case 404:
        return "We searched high and low, but the Toggl workspace wasn't found. 🔍 Double-check your workspace ID - it should be the number in your Toggl URL after 'track.toggl.com/'.";
      
      case 429:
        return "Whoa there, speed racer! 🏎️ You've hit the Toggl API rate limit. Take a coffee break ☕ and try again in a few minutes.";
      
      case 500:
      case 502:
      case 503:
      case 504:
        return "It's not you, it's Toggl! 💔 Their servers are having a moment. Maybe they need a hug? Try again later when they've had time to compose themselves.";
      
      default:
        return `Toggl API error (${status}): ${error.response.statusText}. Maybe the stars ✨ aren't aligned for report generation right now.`;
    }
  }
  
  // Handle specific known errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('no time entries found')) {
      return "Your Toggl account is as empty as my coffee cup on Monday morning! ☕ No time entries were found for this period. Try a different date range or check if you've tracked time in this workspace.";
    }
    
    if (message.includes('network error') || message.includes('timeout')) {
      return "Internet connection taking a siesta? 😴 There was a network error connecting to Toggl. Check your internet connection and try again.";
    }
    
    if (message.includes('all fields are required')) {
      return "Missing information! 📝 Like a cake without sugar, your form is missing essential ingredients. Please fill in all required fields.";
    }
    
    if (message.includes('workspace')) {
      return "Workspace ID confusion! 🤔 The workspace ID is the number in your Toggl URL (like 1234567 in track.toggl.com/1234567/). Check your Toggl workspace and try again.";
    }
    
    if (message.includes('date')) {
      return "Date drama! 📅 There's something fishy about your date selection. Make sure your start date is before your end date and you're not trying to peek into the future.";
    }
    
    // Return the original error message if it doesn't match any of our patterns
    return error.message;
  }
  
  // Generic error message
  return "Something went wrong, but I'm too confused to know what! 🙃 Please try again or check your inputs.";
}
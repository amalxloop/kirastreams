/**
 * Guest user management utility
 * Creates and persists a unique guest user ID in localStorage
 */

const GUEST_USER_KEY = "kira_guest_user_id";

export function getGuestUserId(): string {
  if (typeof window === "undefined") {
    return "guest-ssr";
  }

  let guestId = localStorage.getItem(GUEST_USER_KEY);
  
  if (!guestId) {
    // Generate a unique guest ID
    guestId = `guest-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(GUEST_USER_KEY, guestId);
  }
  
  return guestId;
}

export function clearGuestUserId(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(GUEST_USER_KEY);
  }
}

/**
 * Get the current user ID - either authenticated user or guest
 */
export function getCurrentUserId(authenticatedUserId?: string | null): string {
  return authenticatedUserId || getGuestUserId();
}

export const isSameOrigin = (referrerUrl: URL | string) => {
  try {
    if (!referrerUrl) return false
    const referrerHostname = new URL(referrerUrl).hostname
    // Use window.location.hostname to compare against your current domain
    return referrerHostname === window.location.hostname
  } catch (e) {
    // Handle cases where referrerUrl is not a valid URL (e.g., direct access)
    return false
  }
}

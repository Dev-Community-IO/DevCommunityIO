/**
 * Get version information from environment variables injected at build time
 * Format: tag-commits-commithash (e.g., "v2.0.0_beta-1-gcdea180")
 * Falls back to commit hash if tag not available
 */
export function getVersion(): string {
  // Try to get version from Vite env (injected at build time)
  const version = import.meta.env.VITE_APP_VERSION;
  
  if (version) {
    return version;
  }

  // Fallback: try to get from git describe if available
  // This would be set during build process
  return 'dev';
}

/**
 * Get commit hash from environment variables
 */
export function getCommitHash(): string {
  const commitHash = import.meta.env.VITE_APP_COMMIT_HASH;
  return commitHash || 'unknown';
}

/**
 * Get git tag from environment variables
 */
export function getGitTag(): string | null {
  const tag = import.meta.env.VITE_APP_GIT_TAG;
  return tag || null;
}


declare global {
  interface Window {
    grecaptcha?: {
      ready(callback: () => void): void;
      execute(siteKey: string, options: { action: string }): Promise<string>;
    };
    __RECAPTCHA_SITE_KEY__?: string;
  }
}

const RECAPTCHA_SCRIPT_ID = 'google-recaptcha-script';

let loadPromise: Promise<typeof window.grecaptcha | null> | null = null;

function resolveSiteKey(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const envSiteKey = import.meta.env?.VITE_RECAPTCHA_SITE_KEY;
  if (envSiteKey) {
    return envSiteKey;
  }

  if (window.__RECAPTCHA_SITE_KEY__) {
    return window.__RECAPTCHA_SITE_KEY__;
  }

  console.warn('[reCAPTCHA] Site key not configured');
  return null;
}

async function loadRecaptcha(): Promise<typeof window.grecaptcha | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  if (window.grecaptcha) {
    return window.grecaptcha;
  }

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const siteKey = resolveSiteKey();
      if (!siteKey) {
        resolve(null);
        return;
      }

      const existingScript = document.getElementById(RECAPTCHA_SCRIPT_ID) as HTMLScriptElement | null;
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          if (window.grecaptcha) {
            window.grecaptcha.ready(() => resolve(window.grecaptcha!));
          } else {
            resolve(null);
          }
        });
        existingScript.addEventListener('error', () => reject(new Error('reCAPTCHA script failed to load')));
        return;
      }

      const script = document.createElement('script');
      script.id = RECAPTCHA_SCRIPT_ID;
      script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.grecaptcha) {
          window.grecaptcha.ready(() => resolve(window.grecaptcha!));
        } else {
          resolve(null);
        }
      };
      script.onerror = () => reject(new Error('reCAPTCHA script failed to load'));

      document.head.appendChild(script);
    }).catch((error) => {
      loadPromise = null;
      throw error;
    });
  }

  return loadPromise;
}

export async function executeRecaptcha(action: string): Promise<string | null> {
  const siteKey = resolveSiteKey();
  if (!siteKey) {
    return null;
  }

  try {
    const recaptcha = await loadRecaptcha();
    if (!recaptcha) {
      return null;
    }

    return recaptcha.execute(siteKey, { action });
  } catch (error) {
    console.error('[reCAPTCHA] Execution failed', error);
    return null;
  }
}



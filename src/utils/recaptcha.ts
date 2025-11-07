const RECAPTCHA_SCRIPT_ID = 'google-recaptcha-script';

type RecaptchaClient = {
  ready(callback: () => void): void;
  execute(siteKey: string, options: { action: string }): Promise<string>;
};

declare global {
  interface Window {
    grecaptcha?: RecaptchaClient;
    __RECAPTCHA_SITE_KEY__?: string;
  }
}

let loadPromise: Promise<RecaptchaClient | null> | null = null;

function resolveSiteKey(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const envSiteKey = import.meta.env?.VITE_RECAPTCHA_SITE_KEY;
  if (envSiteKey) {
    console.debug('[reCAPTCHA] Using site key from VITE_RECAPTCHA_SITE_KEY env.');
    return envSiteKey;
  }

  if (window.__RECAPTCHA_SITE_KEY__) {
    console.debug('[reCAPTCHA] Using site key provided at runtime on window.__RECAPTCHA_SITE_KEY__.');
    return window.__RECAPTCHA_SITE_KEY__;
  }

  console.warn('[reCAPTCHA] Site key not configured');
  return null;
}

async function loadRecaptcha(): Promise<RecaptchaClient | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  if (window.grecaptcha) {
    return window.grecaptcha;
  }

  if (!loadPromise) {
    const promise = new Promise<RecaptchaClient | null>((resolve, reject) => {
      const siteKey = resolveSiteKey();
      if (!siteKey) {
        resolve(null);
        return;
      }

      const existingScript = document.getElementById(RECAPTCHA_SCRIPT_ID) as HTMLScriptElement | null;
      if (existingScript) {
        console.debug('[reCAPTCHA] Script tag already present, waiting for load event.');
        existingScript.addEventListener('load', () => {
          if (window.grecaptcha) {
            console.debug('[reCAPTCHA] Script loaded, grecaptcha available.');
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
        console.debug('[reCAPTCHA] Script loaded successfully.');
        if (window.grecaptcha) {
          console.debug('[reCAPTCHA] grecaptcha detected, waiting for ready callback.');
          window.grecaptcha.ready(() => resolve(window.grecaptcha!));
        } else {
          resolve(null);
        }
      };
      script.onerror = () => reject(new Error('reCAPTCHA script failed to load'));

      console.debug('[reCAPTCHA] Injecting script tag.');
      document.head.appendChild(script);
    });

    loadPromise = promise.catch((error) => {
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
      console.warn('[reCAPTCHA] grecaptcha not available after script load.');
      return null;
    }

    console.debug('[reCAPTCHA] Executing action', action);
    const token = await recaptcha.execute(siteKey, { action });
    console.debug('[reCAPTCHA] Token generated with length', token?.length ?? 0);
    return token;
  } catch (error) {
    console.error('[reCAPTCHA] Execution failed', error);
    return null;
  }
}



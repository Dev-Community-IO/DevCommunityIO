/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_RECAPTCHA_SITE_KEY?: string;
    readonly VITE_SAFROCHAIN_CHAIN_ID?: string;
    readonly VITE_SAFROCHAIN_RPC?: string;
    readonly VITE_SAFROCHAIN_REST?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public UPI ID, not a secret. See src/components/donation/config.ts. */
  readonly VITE_UPI_ID?: string
  /** Public contact number for donations above the UPI limit. Not a secret. */
  readonly VITE_PHONE_NUMBER?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

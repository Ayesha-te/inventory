const DEFAULT_API_BASE_URL = 'https://clumsy-virgie-aamzaabdul-f5d0773e.koyeb.app';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const stripApiSuffix = (value: string) => trimTrailingSlash(value).replace(/\/api$/, '');

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const configuredApiUrl = import.meta.env.VITE_API_URL;

export const API_BASE_URL = stripApiSuffix(
  configuredApiBaseUrl || configuredApiUrl || DEFAULT_API_BASE_URL
);

export const API_ROOT_URL = `${API_BASE_URL}/api`;

export const ADMIN_PANEL_URL =
  import.meta.env.VITE_ADMIN_PANEL_URL || 'http://localhost:5174';

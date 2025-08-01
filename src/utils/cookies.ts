import { TVHConfig } from '../types';

const COOKIE_NAME = 'titanos-tvh-config';
const COOKIE_EXPIRY_DAYS = 30;

export const saveTVHConfig = (config: TVHConfig): void => {
  try {
    const configJson = JSON.stringify(config);
    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + (COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000));
    
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(configJson)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
  } catch (error) {
    console.error('Failed to save TVH config to cookie:', error);
  }
};

export const loadTVHConfig = (): TVHConfig | null => {
  try {
    const cookies = document.cookie.split(';');
    const configCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${COOKIE_NAME}=`)
    );
    
    if (!configCookie) {
      return null;
    }
    
    const configValue = configCookie.split('=')[1];
    if (!configValue) {
      return null;
    }
    
    const decodedValue = decodeURIComponent(configValue);
    const config = JSON.parse(decodedValue) as TVHConfig;
    
    // Validate that the config has required fields
    if (config.host && config.port && typeof config.port === 'number') {
      return config;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to load TVH config from cookie:', error);
    return null;
  }
};

export const clearTVHConfig = (): void => {
  try {
    document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  } catch (error) {
    console.error('Failed to clear TVH config cookie:', error);
  }
};

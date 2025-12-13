
export const getAiConfig = () => {
  // Safe environment variable access for various build systems (Vite, Next, CRA)
  const getEnvVar = (key: string) => {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      // @ts-ignore
      return process.env[key];
    }
    return '';
  };

  const apiKey = 
    getEnvVar('VITE_OPENROUTER_API_KEY') || 
    getEnvVar('REACT_APP_OPENROUTER_API_KEY') ||
    getEnvVar('NEXT_PUBLIC_OPENROUTER_API_KEY') ||
    getEnvVar('OPENROUTER_API_KEY');

  const model = 
    getEnvVar('VITE_AI_MODEL') || 
    getEnvVar('REACT_APP_AI_MODEL') ||
    getEnvVar('NEXT_PUBLIC_AI_MODEL') ||
    getEnvVar('AI_MODEL') ||
    'amazon/nova-2-lite-v1:free'; // Default fallback

  return { apiKey, model };
};

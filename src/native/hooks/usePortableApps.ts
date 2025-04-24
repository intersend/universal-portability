/**
 * React Native optimized version of the usePortableApps hook
 */
import { useState, useEffect } from 'react';
import { PortableApp, FilterConfig } from '../../types';

const API_URL = 'https://api.intersend.io/v1/intersend/interspace/apps';
const API_KEY = 'Yeu1WVC1qOCYVOaVsusFlgal5m1i7e8B8duMJsix8WxnDauvo70cZ8soQfGqrfwyw69PsjUidM8FQBTUSfSAYx2COVD1a0elJXGKccv4D9eYx6f4U4vPhRAbvVFbhD6P';

/**
 * Hook to fetch portable apps with optional filtering, optimized for React Native
 * @param config - Optional filter configuration
 */
export const usePortableApps = (config?: FilterConfig) => {
  const [apps, setApps] = useState<PortableApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true);
        const headers: Record<string, string> = {
          'x-api-key': API_KEY || '',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        };
        
        const response = await fetch(API_URL, {
          headers,
          method: 'GET'
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch apps: ${response.status}`);
        }

        const data: PortableApp[] = await response.json();
        
        // Apply filters based on config
        const filteredApps = filterApps(data, config);
        setApps(filteredApps);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        console.error('Error fetching portable apps:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, [config]);

  return { apps, loading, error };
};

/**
 * Helper function to filter apps based on config
 * @param apps - Array of apps to filter
 * @param config - Filter configuration
 */
const filterApps = (apps: PortableApp[], config?: FilterConfig): PortableApp[] => {
  if (!config) return apps;

  // Handle string input (single category or wallet)
  if (typeof config === 'string') {
    // Check if it's a special keyword
    if (config === 'popular') {
      // Implement popular apps logic here
      return apps.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).slice(0, 10);
    }

    // Otherwise treat as category or wallet name
    return apps.filter(app => 
      app.category.includes(config) || 
      app.developer === config
    );
  }

  // Handle array input (multiple app names)
  if (Array.isArray(config)) {
    return apps.filter(app => 
      config.includes(app.slug) || 
      config.includes(app.name.toLowerCase())
    );
  }

  // Handle object config
  switch (config.type) {
    case 'category':
      return apps.filter(app => 
        typeof config.value === 'string' 
          ? app.category.includes(config.value)
          : config.value.some(cat => app.category.includes(cat))
      );

    case 'wallet':
      return apps.filter(app => 
        typeof config.value === 'string'
          ? app.developer === config.value
          : config.value.includes(app.developer)
      );

    case 'popular':
      // Implement your popularity logic here
      return apps.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).slice(0, Number(config.value) || 10);

    case 'apps':
      return apps.filter(app => 
        typeof config.value === 'string'
          ? app.slug === config.value || app.name.toLowerCase() === config.value.toLowerCase()
          : config.value.includes(app.slug) || config.value.some(name => 
              app.name.toLowerCase() === name.toLowerCase()
            )
      );

    default:
      return apps;
  }
};

export default usePortableApps;

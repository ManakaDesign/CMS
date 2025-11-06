import { useState, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T = any>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setState({ data: null, loading: true, error: null });

    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
      return { data, error: null };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      return { data: null, error: errorMessage };
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Hook for multiple API calls
export function useMultiApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeAll = useCallback(async <T extends any[]>(
    apiCalls: Array<() => Promise<any>>
  ): Promise<{ data: T | null; error: string | null }> => {
    setLoading(true);
    setError(null);

    try {
      const results = await Promise.all(apiCalls.map((call) => call()));
      setLoading(false);
      return { data: results as T, error: null };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      setLoading(false);
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  }, []);

  return { loading, error, executeAll };
}

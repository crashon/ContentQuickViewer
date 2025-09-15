import { useCallback, useState } from 'react';
import { useToast } from './use-toast';

interface RetryConfig {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

const defaultConfig: Required<RetryConfig> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
};

export function useRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = {}
) {
  const mergedConfig = { ...defaultConfig, ...config };
  const [attempts, setAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const { toast } = useToast();

  const calculateDelay = useCallback((attempt: number) => {
    const delay = mergedConfig.initialDelay * Math.pow(mergedConfig.backoffFactor, attempt);
    return Math.min(delay, mergedConfig.maxDelay);
  }, [mergedConfig]);

  const execute = useCallback(async (): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 0; attempt < mergedConfig.maxAttempts; attempt++) {
      try {
        if (attempt > 0) {
          setIsRetrying(true);
          const delay = calculateDelay(attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const result = await operation();
        setAttempts(0);
        setIsRetrying(false);
        return result;
      } catch (error) {
        lastError = error as Error;
        setAttempts(attempt + 1);

        if (attempt < mergedConfig.maxAttempts - 1) {
          toast({
            title: 'Operation failed',
            description: `Retrying in ${calculateDelay(attempt) / 1000} seconds...`,
            variant: 'warning',
          });
        }
      }
    }

    setIsRetrying(false);
    toast({
      title: 'Operation failed',
      description: 'Maximum retry attempts reached',
      variant: 'destructive',
    });

    throw lastError!;
  }, [operation, mergedConfig, calculateDelay, toast]);

  return {
    execute,
    attempts,
    isRetrying,
    reset: () => {
      setAttempts(0);
      setIsRetrying(false);
    },
  };
}
import { useMemo, useRef } from 'react';
import isEqual from 'lodash/isEqual';

/**
 * Custom hook that memoizes a value and only updates when the value changes deeply
 * This helps prevent unnecessary re-renders by maintaining referential equality
 * 
 * @param value The value to memoize
 * @returns The memoized value with stable reference
 */
export function useMemoizedValue<T>(value: T): T {
  const ref = useRef<T>(value);
  
  return useMemo(() => {
    // Only update the ref if the deep value has changed
    if (!isEqual(value, ref.current)) {
      ref.current = value;
    }
    return ref.current;
  }, [value]);
}

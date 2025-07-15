import { useMemo, useRef } from 'react';
import isEqual from 'lodash/isEqual';

/**
 * Shallow equality comparison utility
 */
function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }
  
  return true;
}

/**
 * Custom hook that memoizes a value and only updates when the value changes
 * This helps prevent unnecessary re-renders by maintaining referential equality
 *
 * @param value The value to memoize
 * @param shallow Whether to use shallow comparison instead of deep equality (default: false)
 * @returns The memoized value with stable reference
 */
export function useMemoizedValue<T>(value: T, shallow = false): T {
  const ref = useRef<T>(value);
  
  return useMemo(() => {
    // Use shallow comparison for better performance when appropriate
    const hasChanged = shallow
      ? !shallowEqual(value, ref.current)
      : !isEqual(value, ref.current);
      
    if (hasChanged) {
      ref.current = value;
    }
    return ref.current;
  }, [value, shallow]);
}

/**
 * Selective memoization for specific object properties
 * Only updates when specified keys change
 */
export function useMemoizedKeys<T extends Record<string, any>>(
  value: T,
  keys: (keyof T)[]
): T {
  const ref = useRef<T>(value);
  
  return useMemo(() => {
    if (!ref.current) {
      ref.current = value;
      return ref.current;
    }
    
    // Check if any of the specified keys have changed
    const hasKeyChanged = keys.some(key => value[key] !== ref.current[key]);
    
    if (hasKeyChanged) {
      ref.current = value;
    }
    return ref.current;
  }, [value, keys]);
}

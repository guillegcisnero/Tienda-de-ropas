import { useState, useEffect } from 'react';

/**
 * Hook para aplazar la actualización de un valor hasta que transcurran `delay` ms
 * Evita re-renders masivos por pulsación de teclas en inputs de búsqueda
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

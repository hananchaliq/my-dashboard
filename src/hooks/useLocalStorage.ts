"use client";

import { useState, useEffect, useCallback } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
   // Read initial state
   const readValue = useCallback((): T => {
      if (typeof window === "undefined") {
         return initialValue;
      }
      try {
         const item = window.localStorage.getItem(key);
         return item ? (JSON.parse(item) as T) : initialValue;
      } catch (error) {
         console.warn(`Error reading localStorage key "${key}":`, error);
         return initialValue;
      }
   }, [key, initialValue]);

   const [storedValue, setStoredValue] = useState<T>(readValue);

   // Return a wrapped version of useState's setter function that ...
   // ... persists the new value to localStorage and dispatches a custom event.
   const setValue = useCallback(
      (value: T | ((val: T) => T)) => {
         if (typeof window === "undefined") {
            console.warn(`Tried setting localStorage key "${key}" even though window is not defined`);
            return;
         }

         try {
            const newValue = value instanceof Function ? value(storedValue) : value;
            window.localStorage.setItem(key, JSON.stringify(newValue));
            setStoredValue(newValue);

            // Dispatch custom event agar tab/komponen saat ini langsung re-render real-time
            window.dispatchEvent(
               new CustomEvent("local-storage-update", {
                  detail: { key, value: newValue },
               })
            );
         } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
         }
      },
      [key, storedValue]
   );

   useEffect(() => {
      setStoredValue(readValue());

      const handleCustomEvent = (event: Event) => {
         const customEvent = event as CustomEvent<{ key: string; value: T }>;
         if (customEvent.detail && customEvent.detail.key === key) {
            setStoredValue(customEvent.detail.value);
         }
      };

      const handleStorageEvent = (event: StorageEvent) => {
         if (event.key === key && event.newValue) {
            setStoredValue(JSON.parse(event.newValue));
         }
      };

      // Listen event internal & external
      window.addEventListener("local-storage-update", handleCustomEvent);
      window.addEventListener("storage", handleStorageEvent);

      return () => {
         window.removeEventListener("local-storage-update", handleCustomEvent);
         window.removeEventListener("storage", handleStorageEvent);
      };
   }, [key, readValue]);

   return [storedValue, setValue] as const;
}

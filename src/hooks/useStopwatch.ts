import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Stopwatch ringan berbasis requestAnimationFrame.
 * Mengembalikan elapsed (ms) + kontrol. Otomatis mulai bila `autoStart`.
 */
export function useStopwatch(autoStart = true) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(autoStart);
  const startRef = useRef<number>(0);
  const baseRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!running) return;
    startRef.current = performance.now();
    const tick = () => {
      setElapsed(baseRef.current + (performance.now() - startRef.current));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running]);

  const stop = useCallback(() => {
    setRunning((r) => {
      if (r) baseRef.current += performance.now() - startRef.current;
      return false;
    });
  }, []);

  const start = useCallback(() => setRunning(true), []);

  const reset = useCallback(() => {
    baseRef.current = 0;
    setElapsed(0);
  }, []);

  return { elapsed, running, start, stop, reset };
}

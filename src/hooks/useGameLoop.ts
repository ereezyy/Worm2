import { useEffect, useRef } from 'react';

// Custom hook for game loop
export const useGameLoop = (
  callback: () => void,
  fps: number,
  isActive: boolean,
  dependencies: any[] = []
) => {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const frameInterval = 1000 / fps;
  
  useEffect(() => {
    if (!isActive) return;
    
    const animate = (time: number) => {
      if (previousTimeRef.current === undefined) {
        previousTimeRef.current = time;
      }
      
      const deltaTime = time - previousTimeRef.current;
      
      if (deltaTime >= frameInterval) {
        callback();
        previousTimeRef.current = time;
      }
      
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, frameInterval, ...dependencies]);
  
  return {
    stop: () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    },
    resume: () => {
      if (!isActive || requestRef.current) return;
      previousTimeRef.current = undefined;
      requestRef.current = requestAnimationFrame((time) => {
        previousTimeRef.current = time;
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
        }
        requestRef.current = requestAnimationFrame((time) => {
          const deltaTime = time - (previousTimeRef.current || time);
          if (deltaTime >= frameInterval) {
            callback();
            previousTimeRef.current = time;
          }
          if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
          }
          requestRef.current = requestAnimationFrame((time) => {
            animate(time);
          });
        });
      });
    }
  };
  
  function animate(time: number) {
    if (previousTimeRef.current === undefined) {
      previousTimeRef.current = time;
    }
    
    const deltaTime = time - previousTimeRef.current;
    
    if (deltaTime >= frameInterval) {
      callback();
      previousTimeRef.current = time;
    }
    
    requestRef.current = requestAnimationFrame(animate);
  }
};
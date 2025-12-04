import { useEffect, useRef, useState } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  mainSelector?: string;
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  mainSelector = 'main',
}: UsePullToRefreshOptions) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startYRef = useRef(0);
  const mainRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const main = document.querySelector(mainSelector) as HTMLElement;
    if (!main) return;

    mainRef.current = main;

    const handleTouchStart = (e: TouchEvent) => {
      // Solo iniciar si estamos al tope del scroll
      if (main.scrollTop === 0) {
        startYRef.current = e.touches[0].clientY;
        setPullDistance(0);
      } else {
        startYRef.current = -1; // Marcar como inválido
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startYRef.current === -1 || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startYRef.current;

      if (distance > 0) {
        e.preventDefault();
        setPullDistance(distance);
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance > threshold && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
      }
      startYRef.current = 0;
    };

    main.addEventListener('touchstart', handleTouchStart, false);
    main.addEventListener('touchmove', handleTouchMove, { passive: false });
    main.addEventListener('touchend', handleTouchEnd, false);

    return () => {
      main.removeEventListener('touchstart', handleTouchStart);
      main.removeEventListener('touchmove', handleTouchMove);
      main.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, threshold, isRefreshing, pullDistance, mainSelector]);

  return { isRefreshing, pullDistance };
};

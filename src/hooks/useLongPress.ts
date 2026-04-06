import { useRef, useCallback } from "react";

interface LongPressResult {
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onTouchMove: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

/**
 * Long-press hook — fires callback after 400ms hold or immediate right-click.
 * Passes { x, y } coordinates for positioning a context menu.
 */
export function useLongPress(
  callback: (coords: { x: number; y: number }) => void,
  delay = 400,
): LongPressResult {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return; // left-click only
      const { clientX: x, clientY: y } = e;
      clear();
      timerRef.current = setTimeout(() => {
        callback({ x, y });
      }, delay);
    },
    [callback, delay, clear],
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      const { clientX: x, clientY: y } = touch;
      clear();
      timerRef.current = setTimeout(() => {
        callback({ x, y });
      }, delay);
    },
    [callback, delay, clear],
  );

  const onContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      clear();
      callback({ x: e.clientX, y: e.clientY });
    },
    [callback, clear],
  );

  return {
    onMouseDown,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart,
    onTouchEnd: clear,
    onTouchMove: clear,
    onContextMenu,
  };
}

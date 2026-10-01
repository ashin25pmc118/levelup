import { useRef, MouseEvent, WheelEvent } from 'react';

/**
 * Hook to enable smooth mouse drag-to-scroll and mouse-wheel horizontal scrolling
 * for horizontal containers on desktop browsers.
 */
export function useDragScroll<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const hasMoved = useRef(false);

  const onMouseDown = (e: MouseEvent) => {
    if (!ref.current) return;
    isDown.current = true;
    hasMoved.current = false;
    startX.current = e.pageX - ref.current.offsetLeft;
    scrollLeft.current = ref.current.scrollLeft;
  };

  const onMouseLeave = () => {
    isDown.current = false;
    if (ref.current) {
      ref.current.style.cursor = '';
      ref.current.style.userSelect = '';
    }
  };

  const onMouseUp = () => {
    isDown.current = false;
    if (ref.current) {
      ref.current.style.cursor = '';
      ref.current.style.userSelect = '';
    }
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDown.current || !ref.current) return;
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    
    // Only capture drag if moved more than 5px (avoids blocking simple button clicks)
    if (Math.abs(walk) > 5) {
      hasMoved.current = true;
      e.preventDefault();
      ref.current.style.cursor = 'grabbing';
      ref.current.style.userSelect = 'none';
      ref.current.scrollLeft = scrollLeft.current - walk;
    }
  };

  const onWheel = (e: WheelEvent) => {
    if (!ref.current || e.deltaY === 0) return;
    // Map vertical mouse wheel rotation to horizontal scroll
    if (ref.current.scrollWidth > ref.current.clientWidth) {
      ref.current.scrollLeft += e.deltaY;
    }
  };

  const scrollBy = (amount: number) => {
    if (ref.current) {
      ref.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return {
    ref,
    dragProps: {
      onMouseDown,
      onMouseLeave,
      onMouseUp,
      onMouseMove,
      onWheel
    },
    hasMoved,
    scrollBy
  };
}

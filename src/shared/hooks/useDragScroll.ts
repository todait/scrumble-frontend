'use client';

import { useCallback, useRef, useState } from 'react';

interface UseDragScrollReturn {
  scrollRef: React.RefObject<HTMLDivElement>;
  isDragging: boolean;
  dragHandlers: {
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseLeave: () => void;
    onMouseUp: () => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onClick: (e: React.MouseEvent) => void;
  };
  dragDistance: number;
}

interface UseDragScrollOptions {
  dragThreshold?: number; // Default 5px
  scrollSpeed?: number;   // Default 2
}

export function useDragScroll(options: UseDragScrollOptions = {}): UseDragScrollReturn {
  const { dragThreshold = 5, scrollSpeed = 2 } = options;
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    setDragDistance(0); // Reset drag distance
    scrollRef.current.style.cursor = 'grabbing';
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    setDragDistance(0);
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab';
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab';
    }
    // Keep drag distance for click detection
    // Reset after a small delay to allow click event to fire first
    setTimeout(() => setDragDistance(0), 50);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * scrollSpeed;
    const currentDragDistance = Math.abs(x - startX);
    setDragDistance(currentDragDistance);
    scrollRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft, scrollSpeed]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Prevent click if dragged more than threshold
    if (dragDistance > dragThreshold) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, [dragDistance, dragThreshold]);

  return {
    scrollRef,
    isDragging,
    dragHandlers: {
      onMouseDown: handleMouseDown,
      onMouseLeave: handleMouseLeave,
      onMouseUp: handleMouseUp,
      onMouseMove: handleMouseMove,
      onClick: handleClick,
    },
    dragDistance,
  };
}
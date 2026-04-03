'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [laggingPosition, setLaggingPosition] = useState({ x: 0, y: 0 });
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [isHoveringCard, setIsHoveringCard] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Smooth lag configuration
  const lagRef = useRef({ x: 0, y: 0 });
  const requestRef = useRef<number>(0);

  useEffect(() => {
    // Hidden on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // If we just became visible, snap the lagging cursor
      if (!isVisible && e.clientX > 0 && e.clientY > 0) {
        setIsVisible(true);
        lagRef.current = { x: e.clientX, y: e.clientY };
        setLaggingPosition({ x: e.clientX, y: e.clientY });
      }

      // Check hover states
      const target = e.target as HTMLElement;
      
      // Check for interactive elements
      const isInteractive = !!target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer');
      setIsHoveringInteractive(isInteractive);

      // Check for cards
      const isCard = !!target.closest('.card, .hover-card');
      setIsHoveringCard(isCard);
    };

    const updateLaggingCursor = () => {
      // Lerp
      lagRef.current.x += (mousePosition.x - lagRef.current.x) * 0.15;
      lagRef.current.y += (mousePosition.y - lagRef.current.y) * 0.15;
      
      setLaggingPosition({
        x: lagRef.current.x,
        y: lagRef.current.y,
      });

      requestRef.current = requestAnimationFrame(updateLaggingCursor);
    };

    window.addEventListener('mousemove', onMouseMove);
    requestRef.current = requestAnimationFrame(updateLaggingCursor);

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [mousePosition.x, mousePosition.y, isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Small dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[9999]"
        style={{
          backgroundColor: 'var(--cyan)',
          mixBlendMode: 'difference',
          transform: `translate(${mousePosition.x - 4}px, ${mousePosition.y - 4}px)`,
        }}
        animate={{
          opacity: isHoveringInteractive ? 0 : 1,
          scale: isHoveringInteractive ? 0 : 1,
        }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      />
      
      {/* Lagging ring */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9998]"
        style={{
          border: '1px solid var(--cyan)',
          transform: `translate(${laggingPosition.x - 16}px, ${laggingPosition.y - 16}px)`,
          width: 32,
          height: 32,
        }}
        animate={{
          width: isHoveringInteractive ? 48 : 32,
          height: isHoveringInteractive ? 48 : 32,
          x: isHoveringInteractive ? laggingPosition.x - 24 : laggingPosition.x - 16,
          y: isHoveringInteractive ? laggingPosition.y - 24 : laggingPosition.y - 16,
          opacity: isHoveringInteractive ? 1 : 0.4,
          backgroundColor: isHoveringCard && !isHoveringInteractive ? 'rgba(34,211,238,0.05)' : 'transparent',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      />
    </>
  );
}

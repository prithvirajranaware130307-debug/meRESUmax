import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isFineDevice, setIsFineDevice] = useState(false);

  useEffect(() => {
    // Check if device supports fine pointer (mouse/trackpad) and prefers-reduced-motion is false
    const fineQuery = window.matchMedia('(pointer: fine)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!fineQuery.matches || motionQuery.matches) {
      setIsFineDevice(false);
      return;
    }

    setIsFineDevice(true);

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = Boolean(
          target.closest('a, button, input, select, textarea, [role="button"], .liquid-glass-interactive, [data-interactive="true"]')
        );
        setIsPointer(isInteractive);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  if (!isFineDevice || !isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* Outer ambient glow ring */}
      <div
        className="fixed top-0 left-0 w-8 h-8 -ml-4 -mt-4 rounded-full border border-brand-cyan/40 bg-brand-cyan/10 transition-transform duration-150 ease-out will-change-transform shadow-glow-sm"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${isPointer ? 1.6 : 1})`,
        }}
      />
      {/* Center pinpoint */}
      <div
        className="fixed top-0 left-0 w-1.5 h-1.5 -ml-[3px] -mt-[3px] rounded-full bg-white will-change-transform"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        }}
      />
    </div>
  );
};

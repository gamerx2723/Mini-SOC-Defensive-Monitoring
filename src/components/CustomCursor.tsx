import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailingPosition, setTrailingPosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);
    const handleMouseLeave = () => setIsVisible(false);

    // Update hover target detection
    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('[role="button"]') ||
        target.closest('.interactive-target')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousemove', handleElementHover);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Smooth trailing animation loop
    const followCursor = () => {
      setTrailingPosition(prev => {
        const dx = position.x - prev.x;
        const dy = position.y - prev.y;
        return {
          x: prev.x + dx * 0.18,
          y: prev.y + dy * 0.18
        };
      });
      animationFrameId = requestAnimationFrame(followCursor);
    };

    animationFrameId = requestAnimationFrame(followCursor);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousemove', handleElementHover);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [position, isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Center Precise Dot */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full transition-transform duration-75 ease-out"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%) scale(${isClicked ? 0.7 : isHovering ? 1.4 : 1})`,
          width: '6px',
          height: '6px',
          backgroundColor: '#d4af37',
          boxShadow: '0 0 10px #d4af37, 0 0 20px rgba(212, 175, 55, 0.6)'
        }}
      />

      {/* Trailing Outer Ring */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full transition-all duration-150 ease-out"
        style={{
          transform: `translate3d(${trailingPosition.x}px, ${trailingPosition.y}px, 0) translate(-50%, -50%) scale(${
            isClicked ? 0.85 : isHovering ? 1.65 : 1
          })`,
          width: isHovering ? '44px' : '28px',
          height: isHovering ? '44px' : '28px',
          border: isHovering ? '1.5px solid rgba(212, 175, 55, 0.85)' : '1px solid rgba(226, 232, 240, 0.45)',
          backgroundColor: isHovering ? 'rgba(212, 175, 55, 0.08)' : 'rgba(255, 255, 255, 0.02)',
          boxShadow: isHovering
            ? '0 0 18px rgba(212, 175, 55, 0.3), inset 0 0 10px rgba(212, 175, 55, 0.15)'
            : '0 0 10px rgba(255, 255, 255, 0.1)',
          backdropFilter: isHovering ? 'blur(1px)' : 'none'
        }}
      />
    </>
  );
};

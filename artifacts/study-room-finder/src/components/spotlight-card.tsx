import { type CSSProperties, type HTMLAttributes, type ReactNode, useState } from 'react';

// ReactBits Spotlight Card pattern: https://reactbits.dev/components/spotlight-card
type SpotlightCardProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode };

export function SpotlightCard({ children, className = '', onMouseMove, style, ...props }: SpotlightCardProps) {
  const [spot, setSpot] = useState({ x: '50%', y: '50%' });

  return (
    <div
      {...props}
      className={`spotlight-card ${className}`}
      style={{ ...style, '--spot-x': spot.x, '--spot-y': spot.y } as CSSProperties}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setSpot({
          x: `${event.clientX - rect.left}px`,
          y: `${event.clientY - rect.top}px`,
        });
        onMouseMove?.(event);
      }}
    >
      {children}
    </div>
  );
}
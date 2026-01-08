import { useEffect, useRef, useState } from "react";

interface ConnectionProps {
  containerRef: React.RefObject<HTMLDivElement>;
  card1Ref: React.RefObject<HTMLDivElement>;
  card2Ref: React.RefObject<HTMLDivElement>;
  card3Ref: React.RefObject<HTMLDivElement>;
}

const WorkflowConnections = ({ containerRef, card1Ref, card2Ref, card3Ref }: ConnectionProps) => {
  const [paths, setPaths] = useState<{ d: string; id: string }[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const calculatePaths = () => {
      if (!containerRef.current || !card1Ref.current || !card2Ref.current || !card3Ref.current) {
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const card1Rect = card1Ref.current.getBoundingClientRect();
      const card2Rect = card2Ref.current.getBoundingClientRect();
      const card3Rect = card3Ref.current.getBoundingClientRect();

      // Calculate connection points (right side of card1 to left side of card2)
      const x1 = card1Rect.right - containerRect.left;
      const y1 = card1Rect.top + card1Rect.height / 2 - containerRect.top;

      const x2 = card2Rect.left - containerRect.left;
      const y2 = card2Rect.top + card2Rect.height / 2 - containerRect.top;

      // Connection from card2 to card3
      const x3 = card2Rect.right - containerRect.left;
      const y3 = card2Rect.top + card2Rect.height / 2 - containerRect.top;

      const x4 = card3Rect.left - containerRect.left;
      const y4 = card3Rect.top + card3Rect.height / 2 - containerRect.top;

      // Create Bezier curves (n8n style)
      const controlOffset1 = Math.abs(x2 - x1) * 0.5;
      const controlOffset2 = Math.abs(x4 - x3) * 0.5;

      const path1 = `M ${x1} ${y1} C ${x1 + controlOffset1} ${y1}, ${x2 - controlOffset1} ${y2}, ${x2} ${y2}`;
      const path2 = `M ${x3} ${y3} C ${x3 + controlOffset2} ${y3}, ${x4 - controlOffset2} ${y4}, ${x4} ${y4}`;

      setPaths([
        { d: path1, id: "connection-1" },
        { d: path2, id: "connection-2" },
      ]);
    };

    calculatePaths();
    window.addEventListener("resize", calculatePaths);
    
    // Recalculate after animations complete
    const timeout = setTimeout(calculatePaths, 1000);

    return () => {
      window.removeEventListener("resize", calculatePaths);
      clearTimeout(timeout);
    };
  }, [containerRef, card1Ref, card2Ref, card3Ref]);

  if (paths.length === 0) return null;

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ overflow: "visible" }}
    >
      <defs>
        {/* Glow filter for connection lines */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Gradient for particles */}
        <radialGradient id="particle-gradient">
          <stop offset="0%" stopColor="hsl(145, 100%, 50%)" stopOpacity="1" />
          <stop offset="100%" stopColor="hsl(145, 100%, 39%)" stopOpacity="0.5" />
        </radialGradient>
      </defs>

      {paths.map((path, index) => (
        <g key={path.id}>
          {/* Background line (darker) */}
          <path
            d={path.d}
            fill="none"
            stroke="hsl(var(--connection-line))"
            strokeWidth="2"
            strokeLinecap="round"
            className="opacity-40"
          />

          {/* Animated dashed line */}
          <path
            d={path.d}
            fill="none"
            stroke="hsl(var(--n8n-green))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="5 5"
            className="opacity-60"
            style={{
              animation: "connection-dash 1s linear infinite",
            }}
          />

          {/* Particles flowing along the path */}
          {[0, 1, 2].map((particleIndex) => (
            <circle
              key={`particle-${path.id}-${particleIndex}`}
              r="4"
              fill="url(#particle-gradient)"
              filter="url(#glow)"
              className="animate-pulse-glow"
            >
              <animateMotion
                dur="3s"
                repeatCount="indefinite"
                begin={`${particleIndex * 1}s`}
                path={path.d}
              />
            </circle>
          ))}

          {/* Connection point circles at the ends */}
          <circle
            cx={path.d.split(" ")[1]}
            cy={path.d.split(" ")[2]}
            r="5"
            fill="hsl(var(--background))"
            stroke="hsl(var(--n8n-green))"
            strokeWidth="2"
          />
          <circle
            cx={path.d.split(" ").slice(-2)[0]}
            cy={path.d.split(" ").slice(-1)[0]}
            r="5"
            fill="hsl(var(--background))"
            stroke="hsl(var(--n8n-green))"
            strokeWidth="2"
          />
        </g>
      ))}
    </svg>
  );
};

export default WorkflowConnections;

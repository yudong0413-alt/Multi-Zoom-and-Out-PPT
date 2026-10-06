import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CropRect, SlideStepData } from '../utils/cropUtils';
import { Crosshair, Move, Maximize2, Sparkles } from 'lucide-react';

interface FocusCanvasProps {
  imageSrc: string;
  imageNaturalWidth: number;
  imageNaturalHeight: number;
  focalPoint: { x: number; y: number }; // 0..1 normalized
  onFocalPointChange: (point: { x: number; y: number }) => void;
  slideSteps: SlideStepData[];
  selectedStepIndex: number;
  onSelectStepIndex: (index: number) => void;
  imageName?: string;
}

export const FocusCanvas: React.FC<FocusCanvasProps> = ({
  imageSrc,
  imageNaturalWidth,
  imageNaturalHeight,
  focalPoint,
  onFocalPointChange,
  slideSteps,
  selectedStepIndex,
  onSelectStepIndex,
  imageName,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // ResizeObserver to fit image proportionally within container
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute displayed image dimensions & offset within container (letterbox center)
  const imageAspect = imageNaturalWidth / (imageNaturalHeight || 1);
  const containerAspect =
    containerSize.width / (containerSize.height || 1) || 16 / 9;

  let displayWidth = containerSize.width;
  let displayHeight = containerSize.height;
  let offsetX = 0;
  let offsetY = 0;

  if (containerSize.width > 0 && containerSize.height > 0) {
    if (imageAspect > containerAspect) {
      // Wider than container: constrained by width
      displayWidth = containerSize.width;
      displayHeight = displayWidth / imageAspect;
      offsetY = (containerSize.height - displayHeight) / 2;
    } else {
      // Taller than container: constrained by height
      displayHeight = containerSize.height;
      displayWidth = displayHeight * imageAspect;
      offsetX = (containerSize.width - displayWidth) / 2;
    }
  }

  // Convert pointer event to normalized image coordinates (0..1)
  const handlePointerCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current || displayWidth <= 0 || displayHeight <= 0) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = clientX - rect.left - offsetX;
      const clickY = clientY - rect.top - offsetY;

      const normX = Math.max(0, Math.min(1, clickX / displayWidth));
      const normY = Math.max(0, Math.min(1, clickY / displayHeight));

      onFocalPointChange({ x: normX, y: normY });
    },
    [displayWidth, displayHeight, offsetX, offsetY, onFocalPointChange]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    handlePointerCoords(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    handlePointerCoords(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
  };

  // Preset focal point helpers
  const setQuickFocus = (nx: number, ny: number) => {
    onFocalPointChange({ x: nx, y: ny });
  };

  // Convert crop rect in image pixels to screen pixels in this canvas
  const scale = displayWidth / (imageNaturalWidth || 1);

  return (
    <div className="flex flex-col h-full bg-neutral-900/80 rounded-2xl border border-neutral-800/80 overflow-hidden shadow-2xl backdrop-blur-sm">
      {/* Canvas Header / Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-neutral-800 bg-neutral-900/90 text-xs">
        <div className="flex items-center gap-2 text-neutral-300 font-medium">
          <Crosshair className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            {imageName ? (
              <>
                <strong className="text-white">[{imageName}]</strong> 기준점 지정: 이미지를 클릭하세요
              </>
            ) : (
              '이미지를 클릭하거나 드래그하여 최초 포커스 지점을 지정하세요'
            )}
          </span>
        </div>

        {/* Quick presets */}
        <div className="flex items-center gap-1.5 bg-neutral-950/70 p-1 rounded-lg border border-neutral-800">
          <span className="text-neutral-500 text-[11px] px-2 font-mono">빠른 초점:</span>
          <button
            onClick={() => setQuickFocus(0.5, 0.5)}
            className="px-2 py-1 text-[11px] font-medium rounded text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            중앙 (50%)
          </button>
          <button
            onClick={() => setQuickFocus(0.5, 0.28)}
            className="px-2 py-1 text-[11px] font-medium rounded text-indigo-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            상단 (28%)
          </button>
          <button
            onClick={() => setQuickFocus(0.35, 0.45)}
            className="px-2 py-1 text-[11px] font-medium rounded text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            좌측 (35%)
          </button>
          <button
            onClick={() => setQuickFocus(0.65, 0.45)}
            className="px-2 py-1 text-[11px] font-medium rounded text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            우측 (65%)
          </button>
        </div>
      </div>

      {/* Main interactive viewport */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => setIsDragging(false)}
        className="relative flex-1 w-full min-h-[380px] lg:min-h-[500px] bg-neutral-950 cursor-crosshair select-none overflow-hidden touch-none"
      >
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Displayed Image */}
        {displayWidth > 0 && displayHeight > 0 && (
          <div
            className="absolute pointer-events-none transition-transform duration-75"
            style={{
              left: `${offsetX}px`,
              top: `${offsetY}px`,
              width: `${displayWidth}px`,
              height: `${displayHeight}px`,
            }}
          >
            <img
              src={imageSrc}
              alt="Source Canvas Target"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover shadow-2xl rounded-sm"
              draggable={false}
            />

            {/* Concentric Step Crop Boxes overlay */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
              viewBox={`0 0 ${imageNaturalWidth} ${imageNaturalHeight}`}
            >
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#6366f1" floodOpacity="0.8" />
                </filter>
              </defs>

              {slideSteps.map((step, idx) => {
                const isSelected = selectedStepIndex === idx;
                const isFirst = idx === 0;
                const isLast = idx === slideSteps.length - 1;

                // Color gradient from vibrant indigo (first/deepest) to cyan/neutral (full view)
                let strokeColor = 'rgba(147, 197, 253, 0.45)';
                let strokeWidth = 1.5;
                let strokeDash = '4 4';

                if (isSelected) {
                  strokeColor = '#a855f7';
                  strokeWidth = 2.8;
                  strokeDash = 'none';
                } else if (isFirst) {
                  strokeColor = '#6366f1';
                  strokeWidth = 2.4;
                  strokeDash = 'none';
                } else if (isLast) {
                  strokeColor = '#38bdf8';
                  strokeWidth = 2.0;
                  strokeDash = '6 3';
                }

                return (
                  <g key={`step-box-${idx}`}>
                    {/* Crop boundary rectangle */}
                    <rect
                      x={step.cropRect.x}
                      y={step.cropRect.y}
                      width={step.cropRect.width}
                      height={step.cropRect.height}
                      fill={isSelected ? 'rgba(168, 85, 247, 0.08)' : 'none'}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={strokeDash}
                      className="transition-all duration-150"
                    />

                    {/* Step label pill at top-left of each box */}
                    <rect
                      x={step.cropRect.x + 4}
                      y={step.cropRect.y + 4}
                      width={64}
                      height={18}
                      rx={3}
                      fill="rgba(15, 23, 42, 0.85)"
                      stroke={strokeColor}
                      strokeWidth={1}
                    />
                    <text
                      x={step.cropRect.x + 8}
                      y={step.cropRect.y + 16}
                      fill="#ffffff"
                      fontSize="10"
                      fontFamily="system-ui, sans-serif"
                      fontWeight="600"
                    >
                      Step {idx + 1} ({step.zoomLevel}x)
                    </text>
                  </g>
                );
              })}

              {/* Pinpoint Focal Reticle on the image */}
              <g
                transform={`translate(${focalPoint.x * imageNaturalWidth}, ${focalPoint.y * imageNaturalHeight})`}
              >
                {/* Outer pulsing ring */}
                <circle
                  r="16"
                  fill="rgba(99, 102, 241, 0.25)"
                  stroke="#818cf8"
                  strokeWidth="2"
                  className="animate-ping"
                />
                <circle
                  r="12"
                  fill="rgba(99, 102, 241, 0.4)"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                {/* Center dot */}
                <circle r="3.5" fill="#ffffff" />
                {/* Crosshair lines */}
                <line x1="-22" y1="0" x2="-8" y2="0" stroke="#ffffff" strokeWidth="1.5" />
                <line x1="8" y1="0" x2="22" y2="0" stroke="#ffffff" strokeWidth="1.5" />
                <line x1="0" y1="-22" x2="0" y2="-8" stroke="#ffffff" strokeWidth="1.5" />
                <line x1="0" y1="8" x2="0" y2="22" stroke="#ffffff" strokeWidth="1.5" />
              </g>
            </svg>

            {/* Focal Point Floating HUD Coordinate badge */}
            <div
              className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-12 bg-neutral-900/90 text-white text-[10px] font-mono font-medium px-2.5 py-1 rounded-md border border-neutral-700 shadow-xl backdrop-blur-md flex items-center gap-1.5 whitespace-nowrap"
              style={{
                left: `${focalPoint.x * displayWidth}px`,
                top: `${focalPoint.y * displayHeight}px`,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span>
                Focal: {Math.round(focalPoint.x * 100)}%, {Math.round(focalPoint.y * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Dragging instruction overlay hint */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-neutral-400 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-neutral-900/80 px-2.5 py-1 rounded-md border border-neutral-800/80 backdrop-blur-sm">
            <Move className="w-3.5 h-3.5 text-neutral-400" />
            <span>원하는 피사체 위치를 클릭하면 줌아웃 기준점이 즉시 변경됩니다</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-neutral-900/80 px-2.5 py-1 rounded-md border border-neutral-800/80 backdrop-blur-sm font-mono text-neutral-400">
            <span>원본 해상도: {imageNaturalWidth} × {imageNaturalHeight}px</span>
          </div>
        </div>
      </div>

      {/* Step Selector Ribbon below canvas */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-t border-neutral-800/90 bg-neutral-950/60 overflow-x-auto text-xs">
        <span className="text-neutral-400 font-medium whitespace-nowrap shrink-0 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          단계 선택:
        </span>
        <div className="flex items-center gap-1.5">
          {slideSteps.map((step, idx) => {
            const isSelected = selectedStepIndex === idx;
            return (
              <button
                key={`step-btn-${idx}`}
                onClick={() => onSelectStepIndex(idx)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-900/30'
                    : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                <span>슬라이드 {idx + 1}</span>
                <span className="text-[10px] opacity-75 font-mono">({step.zoomLevel}x)</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

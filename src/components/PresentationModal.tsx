import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FlattenedSlideItem } from '../types';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize,
  Minimize,
  Download,
} from 'lucide-react';

interface PresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  slides: FlattenedSlideItem[];
  initialIndex?: number;
  onExportPptx: () => void;
  isExporting: boolean;
  backgroundColor: string;
}

export const PresentationModal: React.FC<PresentationModalProps> = ({
  isOpen,
  onClose,
  slides,
  initialIndex = 0,
  onExportPptx,
  isExporting,
  backgroundColor,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playInterval, setPlayInterval] = useState(2.0); // seconds
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsPlaying(false);
    }
  }, [isOpen, initialIndex]);

  // Autoplay timer
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= slides.length - 1) {
          setIsPlaying(false); // Stop at the end of the presentation
          return prev;
        }
        return prev + 1;
      });
    }, playInterval * 1000);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying, playInterval, slides.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(slides.length - 1, prev + 1));
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen || slides.length === 0) return null;

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-black/95 text-white select-none backdrop-blur-md"
    >
      {/* Top Header Controls */}
      <div className="flex items-center justify-between px-6 py-4 bg-neutral-900/60 border-b border-neutral-800/80 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-wide text-white">
              슬라이드 쇼 시뮬레이터 (단일 통합 프레젠테이션)
            </span>
            <span className="bg-neutral-800 px-2 py-0.5 rounded text-xs font-mono text-indigo-400">
              {currentIndex + 1} / {slides.length}
            </span>
          </div>

          {currentSlide.totalImages > 1 && (
            <>
              <span className="text-neutral-500">·</span>
              <span className="text-xs text-amber-300 font-mono">
                [이미지 {currentSlide.imageIndex + 1}/{currentSlide.totalImages}] {currentSlide.imageName}
              </span>
            </>
          )}

          <span className="text-neutral-500">·</span>
          <span className="text-xs text-neutral-300 font-mono">
            배율: {currentSlide.zoomLevel}x
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Autoplay interval */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400 bg-neutral-800/70 px-2.5 py-1 rounded-lg border border-neutral-700/60">
            <span>재생 간격:</span>
            <select
              value={playInterval}
              onChange={(e) => setPlayInterval(Number(e.target.value))}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value={1.2} className="bg-neutral-900">1.2초</option>
              <option value={2.0} className="bg-neutral-900">2.0초</option>
              <option value={3.0} className="bg-neutral-900">3.0초</option>
              <option value={4.5} className="bg-neutral-900">4.5초</option>
            </select>
          </div>

          {/* PPT Export shortcut */}
          <button
            onClick={onExportPptx}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">통합 PPT 다운로드</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="전체 화면 (F)"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="닫기 (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Slide Presentation Stage (16:9 Cinema Canvas) */}
      <div
        className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden"
        style={{ backgroundColor }}
      >
        <div className="relative w-full max-w-6xl aspect-video rounded-xl overflow-hidden shadow-2xl border border-neutral-800 flex items-center justify-center bg-black">
          {currentSlide.dataUrl && (
            <img
              key={currentSlide.id}
              src={currentSlide.dataUrl}
              alt={currentSlide.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-all duration-500 ease-out animate-fadeIn"
            />
          )}

          {/* Overlay Title at bottom of slide */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 flex flex-col gap-1 pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-indigo-600 text-[11px] font-mono font-bold text-white uppercase tracking-wider">
                Slide {currentIndex + 1} of {slides.length}
              </span>
              {currentSlide.totalImages > 1 && (
                <span className="px-2 py-0.5 rounded bg-neutral-800/90 text-[11px] font-medium text-amber-300">
                  {currentSlide.imageName} (Step {currentSlide.stepIndex + 1}/{currentSlide.totalStepsInImage})
                </span>
              )}
              <span className="text-sm font-bold text-white tracking-wide">
                {currentSlide.title}
              </span>
            </div>
            <p className="text-xs text-neutral-300 max-w-2xl">
              {currentSlide.subtitle}
            </p>
          </div>
        </div>

        {/* Previous & Next overlay arrows */}
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 disabled:opacity-20 text-white transition-all shadow-xl border border-neutral-700/60 cursor-pointer disabled:cursor-not-allowed"
          title="이전 슬라이드 (←)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === slides.length - 1}
          className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 disabled:opacity-20 text-white transition-all shadow-xl border border-neutral-700/60 cursor-pointer disabled:cursor-not-allowed"
          title="다음 슬라이드 (→)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Control Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-neutral-900/70 border-t border-neutral-800/80 z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>일시정지</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                <span>자동 재생 (스페이스바)</span>
              </>
            )}
          </button>
        </div>

        {/* Thumbnail scrubber */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-xl px-2">
          {slides.map((s, idx) => (
            <button
              key={`scrub-${s.id}`}
              onClick={() => {
                setCurrentIndex(idx);
                setIsPlaying(false);
              }}
              className={`h-8 aspect-video rounded overflow-hidden border transition-all shrink-0 cursor-pointer ${
                currentIndex === idx
                  ? 'border-indigo-400 ring-2 ring-indigo-500/50 scale-105'
                  : 'border-neutral-800 opacity-60 hover:opacity-100'
              }`}
              title={`슬라이드 ${idx + 1}: ${s.imageName} (${s.zoomLevel}x)`}
            >
              {s.dataUrl && (
                <img
                  src={s.dataUrl}
                  alt={`썸네일 ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          ))}
        </div>

        <div className="text-xs text-neutral-400 font-mono hidden md:block">
          키보드 좌우 화살표(←/→) 또는 스페이스바로 조작 가능
        </div>
      </div>
    </div>
  );
};

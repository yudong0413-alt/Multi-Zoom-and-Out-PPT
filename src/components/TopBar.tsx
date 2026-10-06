import React from 'react';
import { Download, Play, HelpCircle, Layers, Images } from 'lucide-react';

interface TopBarProps {
  onExportPptx: () => void;
  isExporting: boolean;
  onOpenSlideshow: () => void;
  onOpenHelp: () => void;
  totalImages: number;
  totalSlides: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  onExportPptx,
  isExporting,
  onOpenSlideshow,
  onOpenHelp,
  totalImages,
  totalSlides,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Layers className="w-4 h-4" />
            </div>
            <a
              href="/"
              className="text-base font-bold tracking-tight text-white hover:text-neutral-200 transition-colors"
            >
              ZoomOut PPT
            </a>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-normal">
              다중 이미지 줌아웃 PPT 생성기
            </span>
            <span className="bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 text-[11px] font-mono px-2 py-0.5 rounded-full">
              {totalImages}개 이미지 · {totalSlides}장 (1개 PPTX)
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-400">
          <a
            href="#deck-section"
            className="hover:text-white transition-colors"
          >
            1. 이미지 덱 ({totalImages}개)
          </a>
          <a
            href="#canvas-section"
            className="hover:text-white transition-colors"
          >
            2. 포커스 지정
          </a>
          <a
            href="#settings-section"
            className="hover:text-white transition-colors"
          >
            3. 공통 배율 설정
          </a>
          <a
            href="#preview-section"
            className="hover:text-white transition-colors"
          >
            4. 전체 미리보기 ({totalSlides}장)
          </a>
          <button
            onClick={onOpenHelp}
            className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
            <span>도움말</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenSlideshow}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-850 hover:bg-neutral-800 text-xs font-medium text-neutral-200 hover:text-white border border-neutral-700/80 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>슬라이드 쇼</span>
          </button>

          <button
            onClick={onExportPptx}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>
              {isExporting ? 'PPTX 생성 중...' : `통합 PPT 다운로드 (${totalSlides}장)`}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

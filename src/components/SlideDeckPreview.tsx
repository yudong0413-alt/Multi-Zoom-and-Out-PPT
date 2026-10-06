import React, { useState } from 'react';
import { FlattenedSlideItem } from '../types';
import { Download, Eye, Layers, CheckCircle2, Images } from 'lucide-react';

interface SlideDeckPreviewProps {
  slides: FlattenedSlideItem[];
  selectedGlobalIndex: number;
  onSelectGlobalIndex: (index: number) => void;
  onDownloadSingleSlide: (index: number) => void;
  onOpenSlideshow: (startIndex?: number) => void;
}

export const SlideDeckPreview: React.FC<SlideDeckPreviewProps> = ({
  slides,
  selectedGlobalIndex,
  onSelectGlobalIndex,
  onDownloadSingleSlide,
  onOpenSlideshow,
}) => {
  const [filterImageId, setFilterImageId] = useState<string>('all');

  // Unique list of images for tab filter
  const uniqueImages = Array.from(
    new Map(slides.map((s) => [s.imageId, { id: s.imageId, name: s.imageName, index: s.imageIndex }])).values()
  );

  const displayedSlides =
    filterImageId === 'all'
      ? slides
      : slides.filter((s) => s.imageId === filterImageId);

  return (
    <div className="bg-neutral-900/80 rounded-2xl border border-neutral-800/80 p-5 shadow-2xl backdrop-blur-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide">
            전체 슬라이드 미리보기 (총 {slides.length}개 슬라이드 · 1개 PPTX)
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span>16:9 와이드스크린 (1920×1080)</span>
          <span className="text-neutral-600">·</span>
          <span>모든 이미지가 단일 PPT에 순서대로 포함</span>
        </div>
      </div>

      {/* Image Filter Tabs (if more than 1 image) */}
      {uniqueImages.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-neutral-500 font-medium shrink-0 flex items-center gap-1">
            <Images className="w-3.5 h-3.5 text-neutral-400" />
            보기 필터:
          </span>
          <button
            onClick={() => setFilterImageId('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
              filterImageId === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            전체 통합 보기 ({slides.length}장)
          </button>
          {uniqueImages.map((u) => {
            const count = slides.filter((s) => s.imageId === u.id).length;
            const isSelected = filterImageId === u.id;
            return (
              <button
                key={u.id}
                onClick={() => setFilterImageId(u.id)}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                #{u.index + 1}. {u.name} ({count}장)
              </button>
            );
          })}
        </div>
      )}

      {/* Grid of Slide Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedSlides.map((slide) => {
          const isSelected = selectedGlobalIndex === slide.globalSlideIndex;

          return (
            <div
              key={slide.id}
              onClick={() => onSelectGlobalIndex(slide.globalSlideIndex)}
              className={`group relative flex flex-col rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-neutral-800/90 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-950/40'
                  : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/70'
              }`}
            >
              {/* 16:9 Thumbnail Container */}
              <div className="relative aspect-video w-full bg-neutral-950 overflow-hidden">
                {slide.dataUrl ? (
                  <img
                    src={slide.dataUrl}
                    alt={slide.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs">
                    렌더링 중...
                  </div>
                )}

                {/* Badge: Global slide number & Step number */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-neutral-950/85 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px] font-mono font-medium text-white border border-neutral-700/60 shadow">
                  <span className="text-indigo-400 font-bold">
                    #{slide.globalSlideIndex + 1}
                  </span>
                  <span className="text-neutral-500">·</span>
                  <span className="text-neutral-300">
                    Step {slide.stepIndex + 1}
                  </span>
                  <span className="text-neutral-500">·</span>
                  <span>{slide.zoomLevel}x</span>
                </div>

                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded-full shadow">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* Hover overlay with quick actions */}
                <div className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectGlobalIndex(slide.globalSlideIndex);
                      onOpenSlideshow(slide.globalSlideIndex);
                    }}
                    className="p-1.5 bg-neutral-900/90 text-white rounded-lg hover:bg-indigo-600 transition-colors shadow border border-neutral-700 cursor-pointer"
                    title="이 슬라이드부터 슬라이드쇼 재생"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownloadSingleSlide(slide.globalSlideIndex);
                    }}
                    className="p-1.5 bg-neutral-900/90 text-white rounded-lg hover:bg-indigo-600 transition-colors shadow border border-neutral-700 cursor-pointer"
                    title="이 슬라이드 PNG 저장"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card Meta details */}
              <div className="p-3 flex flex-col justify-between flex-1 gap-1.5">
                <div>
                  {slide.totalImages > 1 && (
                    <div className="text-[10px] font-mono text-indigo-400 font-semibold mb-0.5 truncate">
                      이미지 #{slide.imageIndex + 1} : {slide.imageName}
                    </div>
                  )}
                  <h4 className="text-xs font-semibold text-neutral-200 line-clamp-1">
                    {slide.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400 line-clamp-1">
                    {slide.subtitle}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-neutral-800/80 text-[10px] text-neutral-500 font-mono">
                  <span>
                    크롭: {slide.cropRect.width} × {slide.cropRect.height}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownloadSingleSlide(slide.globalSlideIndex);
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-sans hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>PNG</span>
                    <Download className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

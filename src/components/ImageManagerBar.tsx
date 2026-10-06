import React, { useRef } from 'react';
import { ImageItem } from '../types';
import {
  Images,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Sparkles,
  Layers,
  FileCheck2,
} from 'lucide-react';
import { SAMPLE_PRESETS, SampleImagePreset } from '../utils/sampleImages';

interface ImageManagerBarProps {
  images: ImageItem[];
  activeImageId: string;
  onSelectActiveImage: (id: string) => void;
  onAddFiles: (files: FileList | File[]) => void;
  onAddPreset: (preset: SampleImagePreset) => void;
  onAddAllPresets: () => void;
  onRemoveImage: (id: string) => void;
  onMoveImage: (index: number, direction: 'left' | 'right') => void;
  slideCountPerImage: number;
}

export const ImageManagerBar: React.FC<ImageManagerBarProps> = ({
  images,
  activeImageId,
  onSelectActiveImage,
  onAddFiles,
  onAddPreset,
  onAddAllPresets,
  onRemoveImage,
  onMoveImage,
  slideCountPerImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSlides = images.length * slideCountPerImage;

  return (
    <div className="bg-neutral-900/90 rounded-2xl border border-neutral-800/80 p-4 shadow-xl backdrop-blur-md space-y-3.5">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-center text-indigo-400">
            <Images className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">
                프레젠테이션 이미지 덱 ({images.length}개)
              </h2>
              <span className="bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-[11px] font-mono px-2 py-0.5 rounded-full">
                총 {totalSlides}개 슬라이드 (1개 PPTX)
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              각 이미지를 클릭해 포커스를 설정하세요 · PPT 다운로드 시 순서대로 1개의 파일에 모두 포함됩니다
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onAddFiles(e.target.files);
                e.target.value = '';
              }
            }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>이미지 추가 (복수 선택)</span>
          </button>

          <button
            onClick={onAddAllPresets}
            title="에버랜드, 봄꽃, 천문대 샘플 3종 일괄 추가"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-xs font-medium text-neutral-200 border border-neutral-700/80 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">샘플 3종 일괄 추가</span>
          </button>
        </div>
      </div>

      {/* Horizontal Image Cards Ribbon */}
      <div className="flex items-stretch gap-3 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
        {images.map((img, idx) => {
          const isActive = img.id === activeImageId;

          return (
            <div
              key={img.id}
              onClick={() => onSelectActiveImage(img.id)}
              className={`group relative flex flex-col w-52 shrink-0 rounded-xl overflow-hidden border transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-neutral-850 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-950/50'
                  : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60'
              }`}
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full bg-neutral-950 overflow-hidden">
                <img
                  src={img.src}
                  alt={img.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                />

                {/* Number & order badge */}
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-mono text-white border border-neutral-700">
                  <span className="text-indigo-400 font-bold">#{idx + 1}</span>
                  <span className="text-neutral-500">·</span>
                  <span>{slideCountPerImage}장</span>
                </div>

                {/* Active marker */}
                {isActive && (
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-indigo-600 text-white px-1.5 py-0.5 rounded text-[10px] font-semibold shadow">
                    <Crosshair className="w-3 h-3" />
                    <span>편집 중</span>
                  </div>
                )}

                {/* Reticle coordinate hint on thumbnail */}
                <div
                  className="absolute w-3 h-3 rounded-full border-2 border-white bg-indigo-500/80 -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow"
                  style={{
                    left: `${img.focalPoint.x * 100}%`,
                    top: `${img.focalPoint.y * 100}%`,
                  }}
                  title="지정된 포커스 위치"
                />
              </div>

              {/* Info & Reorder Controls */}
              <div className="p-2.5 flex flex-col justify-between flex-1 gap-1.5">
                <div>
                  <h4 className="text-xs font-semibold text-neutral-200 truncate" title={img.name}>
                    {img.name}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono mt-0.5">
                    <span>{img.width}×{img.height}</span>
                    <span className="text-indigo-300">
                      초점: {Math.round(img.focalPoint.x * 100)}%, {Math.round(img.focalPoint.y * 100)}%
                    </span>
                  </div>
                </div>

                {/* Card footer controls: Move left, Move right, Delete */}
                <div className="flex items-center justify-between pt-1.5 border-t border-neutral-800 text-neutral-400">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveImage(idx, 'left');
                      }}
                      disabled={idx === 0}
                      className="p-1 hover:text-white hover:bg-neutral-800 rounded disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                      title="순서 앞으로 이동 (PPT에서 먼저 나옴)"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveImage(idx, 'right');
                      }}
                      disabled={idx === images.length - 1}
                      className="p-1 hover:text-white hover:bg-neutral-800 rounded disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                      title="순서 뒤로 이동 (PPT에서 나중에 나옴)"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {images.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveImage(img.id);
                      }}
                      className="p-1 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded transition-colors cursor-pointer"
                      title="이 이미지 제거"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Add more button as end card */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-36 shrink-0 rounded-xl border border-dashed border-neutral-800 hover:border-indigo-500 hover:bg-neutral-900/80 p-4 flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-neutral-200 transition-all cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-center">이미지 추가</span>
        </button>
      </div>

      {/* Helper note */}
      <div className="flex items-center gap-2 text-[11px] text-neutral-400 bg-neutral-950/60 px-3 py-1.5 rounded-lg border border-neutral-800/60">
        <FileCheck2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>
          <strong>한 개의 PPTX 파일로 생성:</strong> 이미지 #{1}번부터 #{images.length}번까지 각 {slideCountPerImage}단계씩 차례대로 연결되어 총 {totalSlides}장의 단일 프레젠테이션 파일로 내보내집니다.
        </span>
      </div>
    </div>
  );
};

import React from 'react';
import { EasingType, ZoomDirection } from '../utils/cropUtils';
import {
  Sliders,
  ZoomIn,
  ZoomOut,
  Layers,
  Sparkles,
  FileText,
  Palette,
  Download,
  Play,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

interface SettingsPanelProps {
  totalImages: number;
  slideCount: number;
  onSlideCountChange: (count: number) => void;
  initialZoom: number;
  onInitialZoomChange: (zoom: number) => void;
  easing: EasingType;
  onEasingChange: (easing: EasingType) => void;
  direction: ZoomDirection;
  onDirectionChange: (direction: ZoomDirection) => void;
  includeTitles: boolean;
  onIncludeTitlesChange: (include: boolean) => void;
  includeStepBadges: boolean;
  onIncludeStepBadgesChange: (include: boolean) => void;
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
  fileName: string;
  onFileNameChange: (name: string) => void;
  onExportPptx: () => void;
  isExporting: boolean;
  exportProgress: { percent: number; message: string };
  onOpenSlideshow: () => void;
  onResetDefaults: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  totalImages,
  slideCount,
  onSlideCountChange,
  initialZoom,
  onInitialZoomChange,
  easing,
  onEasingChange,
  direction,
  onDirectionChange,
  includeTitles,
  onIncludeTitlesChange,
  includeStepBadges,
  onIncludeStepBadgesChange,
  backgroundColor,
  onBackgroundColorChange,
  fileName,
  onFileNameChange,
  onExportPptx,
  isExporting,
  exportProgress,
  onOpenSlideshow,
  onResetDefaults,
}) => {
  const totalSlides = totalImages * slideCount;

  return (
    <div className="flex flex-col gap-5 bg-neutral-900/80 rounded-2xl border border-neutral-800/80 p-5 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide">
            공통 줌아웃 & 슬라이드 설정
          </h2>
        </div>
        <button
          onClick={onResetDefaults}
          title="기본값으로 초기화"
          className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>초기화</span>
        </button>
      </div>

      {/* Global Setting Banner */}
      <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/50 space-y-1 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-indigo-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>전체 이미지 일괄 적용</span>
        </div>
        <p className="text-[11px] text-neutral-300 leading-relaxed">
          이 패널의 설정값은 등록된 {totalImages}개 이미지 전체에 동일하게 적용되며, 생성 시 <strong>1개의 통합 PPTX 파일 ({totalSlides}개 슬라이드)</strong>로 완성됩니다.
        </p>
      </div>

      {/* 1. 슬라이드 개수 (단계 수) 설정 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-1.5 font-medium text-neutral-200">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>이미지당 슬라이드 단계</span>
          </label>
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="font-semibold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60 tabular-nums">
              장당 {slideCount}단계
            </span>
            <span className="text-neutral-400 text-[11px]">
              (총 {totalSlides}장)
            </span>
          </div>
        </div>
        <input
          type="range"
          min={2}
          max={10}
          step={1}
          value={slideCount}
          onChange={(e) => onSlideCountChange(Number(e.target.value))}
          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <div className="flex justify-between text-[10px] text-neutral-500 font-mono px-0.5">
          <span>2단계 (간결)</span>
          <span>4단계 (기본 권장)</span>
          <span>10단계 (초정밀)</span>
        </div>
      </div>

      {/* 2. 첫 슬라이드 확대 배율 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-1.5 font-medium text-neutral-200">
            <ZoomIn className="w-3.5 h-3.5 text-indigo-400" />
            <span>초기 확대 배율 (공통)</span>
          </label>
          <span className="font-mono font-semibold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60 tabular-nums">
            {initialZoom.toFixed(1)}x
          </span>
        </div>
        <input
          type="range"
          min={2.0}
          max={10.0}
          step={0.5}
          value={initialZoom}
          onChange={(e) => onInitialZoomChange(Number(e.target.value))}
          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <div className="flex justify-between text-[10px] text-neutral-500 font-mono px-0.5">
          <span>2.0x (약한 확대)</span>
          <span>5.0x (표준)</span>
          <span>10.0x (초근접)</span>
        </div>
      </div>

      {/* 3. 진행 방향 (줌아웃 vs 줌인) */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-neutral-200">
          진행 순서 (공통)
        </label>
        <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
          <button
            onClick={() => onDirectionChange('zoomOut')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              direction === 'zoomOut'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ZoomOut className="w-3.5 h-3.5" />
            <span>줌아웃 (세부 ➔ 전체)</span>
          </button>
          <button
            onClick={() => onDirectionChange('zoomIn')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              direction === 'zoomIn'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span>줌인 (전체 ➔ 세부)</span>
          </button>
        </div>
      </div>

      {/* 4. 감속 및 변화 곡선 (Easing) */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-200">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>전개 완급 조절 (Easing)</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'easeOut', label: '자연스러운 감속', desc: '초반에 넓게 확장' },
            { id: 'exponential', label: '극적 확장 (지수)', desc: '끝에서 확 커짐' },
            { id: 'linear', label: '균등 분할', desc: '일정한 간격 배율' },
            { id: 'smooth', label: '부드러운 곡선', desc: 'S자형 완만 전환' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onEasingChange(item.id as EasingType)}
              className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                easing === item.id
                  ? 'bg-neutral-800 border-indigo-500 text-white'
                  : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:bg-neutral-850 hover:text-neutral-200'
              }`}
            >
              <div className="text-xs font-medium">{item.label}</div>
              <div className="text-[10px] text-neutral-500">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 5. 프레젠테이션 디자인 옵션 */}
      <div className="space-y-3 pt-2 border-t border-neutral-800">
        <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-200">
          <Palette className="w-3.5 h-3.5 text-indigo-400" />
          <span>슬라이드 배경 및 오버레이</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-neutral-400">슬라이드 배경색</span>
          <div className="flex items-center gap-1.5">
            {[
              { color: '#000000', label: '블랙' },
              { color: '#0f172a', label: '슬레이트' },
              { color: '#ffffff', label: '화이트' },
            ].map((c) => (
              <button
                key={c.color}
                onClick={() => onBackgroundColorChange(c.color)}
                title={c.label}
                className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                  backgroundColor.toLowerCase() === c.color.toLowerCase()
                    ? 'border-indigo-500 scale-110 shadow'
                    : 'border-neutral-700 hover:scale-105'
                }`}
                style={{ backgroundColor: c.color }}
              />
            ))}
          </div>
        </div>

        {/* Checkbox Options */}
        <div className="space-y-2 pt-1 text-xs">
          <label className="flex items-center gap-2 text-neutral-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeTitles}
              onChange={(e) => onIncludeTitlesChange(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-700 bg-neutral-950 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span>슬라이드 하단에 이미지명 및 단계 설명 텍스트 포함</span>
          </label>

          <label className="flex items-center gap-2 text-neutral-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeStepBadges}
              onChange={(e) => onIncludeStepBadgesChange(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-700 bg-neutral-950 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span>상단 모서리에 배율 배지 ([슬라이드 #/총수] 배율) 포함</span>
          </label>
        </div>

        {/* PPT 파일 이름 */}
        <div className="space-y-1 pt-1">
          <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-300">
            <FileText className="w-3.5 h-3.5 text-neutral-400" />
            <span>통합 PPT 파일 이름</span>
          </label>
          <div className="flex items-center bg-neutral-950 rounded-xl border border-neutral-800 px-3 py-1.5 text-xs text-neutral-200 focus-within:border-indigo-500">
            <input
              type="text"
              value={fileName}
              onChange={(e) => onFileNameChange(e.target.value)}
              placeholder="presentation_zoomout"
              className="w-full bg-transparent focus:outline-none text-white text-xs"
            />
            <span className="text-neutral-500 font-mono text-[11px]">.pptx</span>
          </div>
        </div>
      </div>

      {/* 6. Primary Action Buttons */}
      <div className="pt-2 space-y-2.5">
        <button
          onClick={onExportPptx}
          disabled={isExporting}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>
            {isExporting
              ? '단일 PPTX 패키징 중...'
              : `1개 통합 PPT 다운로드 (${totalImages}개 이미지 · 총 ${totalSlides}장)`}
          </span>
        </button>

        {isExporting && (
          <div className="space-y-1">
            <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-500 h-full transition-all duration-300"
                style={{ width: `${exportProgress.percent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-neutral-400">
              <span className="truncate max-w-[220px]">{exportProgress.message}</span>
              <span className="font-mono">{exportProgress.percent}%</span>
            </div>
          </div>
        )}

        <button
          onClick={onOpenSlideshow}
          className="w-full py-2.5 px-4 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white font-medium text-xs rounded-xl border border-neutral-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
          <span>전체 통합 슬라이드 쇼 ({totalSlides}장 연속 재생)</span>
        </button>
      </div>
    </div>
  );
};

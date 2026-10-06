import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, Layers, Plus } from 'lucide-react';
import { SAMPLE_PRESETS, SampleImagePreset } from '../utils/sampleImages';

export interface LoadedImagePayload {
  dataUrl: string;
  width: number;
  height: number;
  name: string;
  preset?: SampleImagePreset;
}

interface ImageDropzoneProps {
  onImagesLoaded: (images: LoadedImagePayload[]) => void;
  onAddPreset: (preset: SampleImagePreset) => void;
  onAddAllPresets: () => void;
  totalImagesCount: number;
  currentImageName?: string;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  onImagesLoaded,
  onAddPreset,
  onAddAllPresets,
  totalImagesCount,
  currentImageName,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    const imageFiles = fileList.filter((f) => f.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      setErrorMessage('이미지 파일(PNG, JPG, WEBP 등)만 업로드할 수 있습니다.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const loadedImages: LoadedImagePayload[] = await Promise.all(
        imageFiles.map(
          (file) =>
            new Promise<LoadedImagePayload>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                const img = new Image();
                img.onload = () => {
                  resolve({
                    dataUrl,
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    name: file.name,
                  });
                };
                img.onerror = () => reject(new Error('이미지 로딩 실패'));
                img.src = dataUrl;
              };
              reader.onerror = () => reject(new Error('파일 읽기 실패'));
              reader.readAsDataURL(file);
            })
        )
      );

      onImagesLoaded(loadedImages);
    } catch (err) {
      console.error(err);
      setErrorMessage('일부 이미지를 불러오는 중 문제가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Upload Zone (Supports Multi-File) */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group rounded-2xl border-2 border-dashed p-6 sm:p-7 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-indigo-400 bg-indigo-950/30 scale-[1.01]'
            : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/50 hover:bg-neutral-900/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              processFiles(e.target.files);
              e.target.value = '';
            }
          }}
        />

        <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-950/40">
          <UploadCloud className="w-6 h-6" />
        </div>

        <h3 className="text-sm font-semibold text-neutral-200 mb-1 flex items-center gap-1.5">
          <span>여러 장의 이미지를 동시에 드래그하거나 클릭하여 추가하세요</span>
          <span className="text-xs text-indigo-400 font-mono font-normal">
            (복수 선택 지원)
          </span>
        </h3>
        <p className="text-xs text-neutral-400 max-w-md">
          여러 파일을 한 번에 선택해 추가할 수 있습니다. 모든 이미지는 설정값에 따라 줌아웃 슬라이드로 변환되어 단일 PPTX 파일에 순서대로 포함됩니다.
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {totalImagesCount > 0 && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-800 text-[11px] text-neutral-300 font-mono">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>현재 등록된 이미지: {totalImagesCount}장</span>
            </div>
          )}
          {currentImageName && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-800/80 text-[11px] text-neutral-400 font-mono">
              <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />
              <span>포커스 편집 대상: {currentImageName}</span>
            </div>
          )}
        </div>

        {isProcessing && (
          <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm rounded-2xl flex items-center justify-center text-xs font-semibold text-indigo-300">
            이미지 다중 로드 및 처리 중...
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs text-center">
          {errorMessage}
        </div>
      )}

      {/* Quick Test Samples */}
      <div className="bg-neutral-900/60 rounded-xl border border-neutral-800/80 p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>샘플 프리셋으로 다중 이미지 즉시 테스트</span>
          </div>
          <button
            onClick={onAddAllPresets}
            className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>샘플 3종 한 번에 모두 추가하기</span>
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onAddPreset(preset)}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-indigo-500/60 hover:bg-neutral-900 transition-all text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0 overflow-hidden border border-neutral-700/60">
                <ImageIcon className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-neutral-200 group-hover:text-white truncate">
                    {preset.name}
                  </div>
                  <span className="text-[10px] text-indigo-400 shrink-0 ml-1">+추가</span>
                </div>
                <div className="text-[11px] text-neutral-400 truncate">
                  {preset.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

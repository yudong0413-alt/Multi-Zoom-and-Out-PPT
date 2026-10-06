/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ImageItem, FlattenedSlideItem } from './types';
import { SAMPLE_PRESETS, SampleImagePreset } from './utils/sampleImages';
import {
  calculateZoomSteps,
  renderSlideImage,
  EasingType,
  ZoomDirection,
} from './utils/cropUtils';
import { exportToPptx } from './utils/pptxExport';
import { TopBar } from './components/TopBar';
import { ImageManagerBar } from './components/ImageManagerBar';
import { FocusCanvas } from './components/FocusCanvas';
import { SettingsPanel } from './components/SettingsPanel';
import { SlideDeckPreview } from './components/SlideDeckPreview';
import { ImageDropzone, LoadedImagePayload } from './components/ImageDropzone';
import { PresentationModal } from './components/PresentationModal';
import { HelpModal } from './components/HelpModal';
import {
  Sparkles,
  Info,
  CheckCircle2,
  FileDown,
  ArrowUpRight,
  Layers,
  Images,
} from 'lucide-react';

export default function App() {
  // Multiple Images State
  const [images, setImages] = useState<ImageItem[]>([]);
  const [activeImageId, setActiveImageId] = useState<string>('');

  // Global Settings applied uniformly to all images
  const [slideCount, setSlideCount] = useState<number>(4);
  const [initialZoom, setInitialZoom] = useState<number>(5.0);
  const [easing, setEasing] = useState<EasingType>('easeOut');
  const [direction, setDirection] = useState<ZoomDirection>('zoomOut');
  const [includeTitles, setIncludeTitles] = useState<boolean>(false);
  const [includeStepBadges, setIncludeStepBadges] = useState<boolean>(false);
  const [backgroundColor, setBackgroundColor] = useState<string>('#000000');
  const [fileName, setFileName] = useState<string>('zoomout_presentation');

  // Preview & Navigation State
  const [selectedGlobalIndex, setSelectedGlobalIndex] = useState<number>(0);
  const [selectedStepIndexInActive, setSelectedStepIndexInActive] = useState<number>(0);

  // Export & Modal State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<{
    percent: number;
    message: string;
  }>({ percent: 0, message: '' });
  const [isSlideshowOpen, setIsSlideshowOpen] = useState<boolean>(false);
  const [slideshowStartIndex, setSlideshowStartIndex] = useState<number>(0);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cached HTMLImageElements to speed up re-renders without decoding
  const imageElementsCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // Show toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Initialize with the first sample preset (Everland Four Seasons Garden) on first load
  useEffect(() => {
    const defaultPreset = SAMPLE_PRESETS[0];
    const dataUrl = defaultPreset.generator();
    const img = new Image();
    img.onload = () => {
      const initialId = 'img_default_everland';
      imageElementsCache.current.set(initialId, img);
      const initialItem: ImageItem = {
        id: initialId,
        name: defaultPreset.name,
        src: dataUrl,
        width: img.naturalWidth,
        height: img.naturalHeight,
        focalPoint: defaultPreset.focalPoint,
        steps: [],
      };
      setImages([initialItem]);
      setActiveImageId(initialId);
    };
    img.src = dataUrl;
  }, []);

  // Currently active image for focal-point editing on FocusCanvas
  const activeImage = useMemo(() => {
    return images.find((img) => img.id === activeImageId) || images[0] || null;
  }, [images, activeImageId]);

  // Recalculate zoom steps & render canvas slide frames across ALL images whenever settings or images change
  useEffect(() => {
    if (images.length === 0) return;

    let isCancelled = false;

    // 1. Calculate bounding boxes for all images synchronously
    const imagesWithCalculatedSteps = images.map((img) => {
      const steps = calculateZoomSteps({
        imageWidth: img.width,
        imageHeight: img.height,
        focalPoint: img.focalPoint,
        slideCount,
        initialZoom,
        easing,
        direction,
      });

      // Preserve existing rendered dataUrls if bounding boxes match
      const stepsWithPreservedDataUrls = steps.map((step, idx) => {
        const existingStep = img.steps?.[idx];
        const sameCrop =
          existingStep &&
          existingStep.cropRect.x === step.cropRect.x &&
          existingStep.cropRect.y === step.cropRect.y &&
          existingStep.cropRect.width === step.cropRect.width &&
          existingStep.cropRect.height === step.cropRect.height &&
          existingStep.dataUrl;

        return {
          ...step,
          dataUrl: sameCrop ? existingStep.dataUrl : undefined,
        };
      });

      return {
        ...img,
        steps: stepsWithPreservedDataUrls,
      };
    });

    // Check if any step needs re-rendering
    const needsRender = imagesWithCalculatedSteps.some((img) =>
      img.steps.some((s) => !s.dataUrl)
    );

    if (!needsRender) {
      // If all dataUrls are already valid, update state only if steps actually changed
      const anyDiff = images.some((img, i) => {
        const nextImg = imagesWithCalculatedSteps[i];
        return (
          img.steps?.length !== nextImg.steps.length ||
          img.steps?.[0]?.zoomLevel !== nextImg.steps[0]?.zoomLevel
        );
      });
      if (anyDiff) {
        setImages(imagesWithCalculatedSteps);
      }
      return;
    }

    // Set initial bounding boxes immediately
    setImages(imagesWithCalculatedSteps);

    // 2. Asynchronously render missing slide images in background
    const renderAllImages = async () => {
      const updatedImages = await Promise.all(
        imagesWithCalculatedSteps.map(async (img) => {
          let htmlImg = imageElementsCache.current.get(img.id);
          if (!htmlImg) {
            htmlImg = new Image();
            htmlImg.src = img.src;
            await new Promise((res) => {
              htmlImg!.onload = res;
            });
            imageElementsCache.current.set(img.id, htmlImg);
          }

          const renderedSteps = await Promise.all(
            img.steps.map(async (step) => {
              if (step.dataUrl) return step;
              const dataUrl = await renderSlideImage(
                htmlImg!,
                step.cropRect,
                1920,
                1080
              );
              return {
                ...step,
                dataUrl,
              };
            })
          );

          return {
            ...img,
            steps: renderedSteps,
          };
        })
      );

      if (!isCancelled) {
        setImages(updatedImages);
      }
    };

    renderAllImages().catch((err) => {
      console.error('Failed rendering slide previews:', err);
    });

    return () => {
      isCancelled = true;
    };
  }, [
    images.map((i) => `${i.id}_${i.focalPoint.x.toFixed(3)}_${i.focalPoint.y.toFixed(3)}_${i.src.slice(0, 30)}`).join('|'),
    slideCount,
    initialZoom,
    easing,
    direction,
  ]);

  // Flattened slide items: combines all steps across all images in presentation order
  const flattenedSlides: FlattenedSlideItem[] = useMemo(() => {
    const result: FlattenedSlideItem[] = [];
    let globalIndex = 0;
    const totalGlobalSlides = images.reduce(
      (acc, img) => acc + (img.steps?.length || 0),
      0
    );

    images.forEach((img, imgIndex) => {
      (img.steps || []).forEach((step, stepIndex) => {
        result.push({
          id: `${img.id}-step-${stepIndex}`,
          imageId: img.id,
          imageName: img.name,
          imageIndex: imgIndex,
          totalImages: images.length,
          stepIndex,
          totalStepsInImage: img.steps.length,
          globalSlideIndex: globalIndex,
          totalGlobalSlides,
          zoomLevel: step.zoomLevel,
          cropRect: step.cropRect,
          title: step.title,
          subtitle: step.subtitle,
          dataUrl: step.dataUrl,
        });
        globalIndex++;
      });
    });

    return result;
  }, [images]);

  // Handle Focal Point Change for the active image
  const handleFocalPointChange = useCallback(
    (newPoint: { x: number; y: number }) => {
      if (!activeImage) return;
      setImages((prev) =>
        prev.map((img) =>
          img.id === activeImage.id ? { ...img, focalPoint: newPoint } : img
        )
      );
    },
    [activeImage]
  );

  // Add multiple uploaded files (from Dropzone or File Picker)
  const handleAddFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileList.length === 0) return;

    try {
      const newItems: ImageItem[] = [];

      for (const file of fileList) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = reject;
          el.src = dataUrl;
        });

        const id = `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        imageElementsCache.current.set(id, img);

        newItems.push({
          id,
          name: file.name.replace(/\.[^/.]+$/, ''),
          src: dataUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
          focalPoint: { x: 0.5, y: 0.5 },
          steps: [],
        });
      }

      setImages((prev) => [...prev, ...newItems]);
      if (newItems.length > 0) {
        setActiveImageId(newItems[0].id);
      }
      showToast(`${newItems.length}장의 이미지가 덱에 추가되었습니다.`);
    } catch (err) {
      console.error(err);
      showToast('이미지 파일을 불러오는 중 오류가 발생했습니다.');
    }
  };

  // Add a sample preset to the image deck
  const handleAddPreset = (preset: SampleImagePreset) => {
    const dataUrl = preset.generator();
    const img = new Image();
    img.onload = () => {
      const id = `img_preset_${Date.now()}_${preset.id}`;
      imageElementsCache.current.set(id, img);
      const newItem: ImageItem = {
        id,
        name: preset.name,
        src: dataUrl,
        width: img.naturalWidth,
        height: img.naturalHeight,
        focalPoint: preset.focalPoint,
        steps: [],
      };
      setImages((prev) => [...prev, newItem]);
      setActiveImageId(id);
      showToast(`'${preset.name}' 샘플이 덱에 추가되었습니다.`);
    };
    img.src = dataUrl;
  };

  // Add all 3 sample presets to the image deck in one click
  const handleAddAllPresets = () => {
    const newItems: ImageItem[] = [];

    SAMPLE_PRESETS.forEach((preset, pIdx) => {
      const dataUrl = preset.generator();
      const img = new Image();
      img.onload = () => {
        const id = `img_preset_${Date.now()}_${pIdx}_${preset.id}`;
        imageElementsCache.current.set(id, img);
        newItems.push({
          id,
          name: preset.name,
          src: dataUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
          focalPoint: preset.focalPoint,
          steps: [],
        });
        if (newItems.length === SAMPLE_PRESETS.length) {
          setImages((prev) => [...prev, ...newItems]);
          showToast('샘플 3종이 덱에 모두 추가되었습니다.');
        }
      };
      img.src = dataUrl;
    });
  };

  // Move image order in the presentation (determines sequence in PPTX)
  const handleMoveImage = (index: number, dir: 'left' | 'right') => {
    setImages((prev) => {
      const targetIdx = dir === 'left' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(targetIdx, 0, moved);
      return next;
    });
  };

  // Remove an image from the deck
  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((img) => img.id !== id);
      if (activeImageId === id && next.length > 0) {
        setActiveImageId(next[0].id);
      }
      return next;
    });
    showToast('이미지가 덱에서 제거되었습니다.');
  };

  // Reset global settings to defaults
  const handleResetDefaults = () => {
    setSlideCount(4);
    setInitialZoom(5.0);
    setEasing('easeOut');
    setDirection('zoomOut');
    setIncludeTitles(false);
    setIncludeStepBadges(false);
    setBackgroundColor('#000000');
    showToast('모든 설정이 기본값으로 초기화되었습니다.');
  };

  // Export all flattened slides into ONE single merged PPTX presentation
  const handleExportPptx = async () => {
    if (flattenedSlides.length === 0 || isExporting) return;

    try {
      setIsExporting(true);
      await exportToPptx(flattenedSlides, {
        fileName: fileName.trim() || 'zoomout_presentation',
        presentationTitle: `${images.length}개 이미지 줌아웃 통합 프레젠테이션`,
        includeTitles,
        includeStepBadges,
        backgroundColor,
        onProgress: (percent, message) => {
          setExportProgress({ percent, message });
        },
      });

      showToast(
        `총 ${flattenedSlides.length}개 슬라이드가 포함된 단일 PPTX 파일이 성공적으로 다운로드되었습니다!`
      );
    } catch (error) {
      console.error('PPTX export error:', error);
      showToast('PPT 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsExporting(false);
    }
  };

  // Download a single slide as PNG
  const handleDownloadSingleSlide = (globalIndex: number) => {
    const slide = flattenedSlides[globalIndex];
    if (!slide?.dataUrl) return;

    const link = document.createElement('a');
    link.download = `slide_${globalIndex + 1}_${slide.imageName}_zoom_${slide.zoomLevel}x.jpg`;
    link.href = slide.dataUrl;
    link.click();
    showToast(`슬라이드 ${globalIndex + 1} 이미지가 저장되었습니다.`);
  };

  // Open slideshow at a specific index
  const handleOpenSlideshow = (startIndex = 0) => {
    setSlideshowStartIndex(startIndex);
    setIsSlideshowOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Bar with brand, navigation & quick export */}
      <TopBar
        onExportPptx={handleExportPptx}
        isExporting={isExporting}
        onOpenSlideshow={() => handleOpenSlideshow(0)}
        onOpenHelp={() => setIsHelpOpen(true)}
        totalImages={images.length}
        totalSlides={flattenedSlides.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-7">
        {/* Intro Hero Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800/80 pb-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-950/70 border border-indigo-800/60 text-indigo-300 text-[11px] font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>다중 이미지 동시 처리 · 단일 16:9 PPTX 통합 파일 생성</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              점진적 줌아웃(Zoom-out) PPT 일괄 생성기
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              여러 장의 이미지를 동시에 업로드하고, 공통 설정(슬라이드 수, 배율, 감속 곡선)을 한 번에 적용하여 <strong>1개의 통합된 16:9 PPTX 파일</strong>로 다운로드하세요.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenSlideshow(0)}
              className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-xs font-semibold text-neutral-200 hover:text-white border border-neutral-800 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>통합 슬라이드 쇼 ({flattenedSlides.length}장)</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
            </button>
            <button
              onClick={handleExportPptx}
              disabled={isExporting}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              <span>{isExporting ? '패키징 중...' : '통합 PPT 즉시 다운로드'}</span>
            </button>
          </div>
        </div>

        {/* Section 1: Multi-Image Deck Bar (List of uploaded images & sequence control) */}
        <section id="deck-section">
          <ImageManagerBar
            images={images}
            activeImageId={activeImageId}
            onSelectActiveImage={setActiveImageId}
            onAddFiles={handleAddFiles}
            onAddPreset={handleAddPreset}
            onAddAllPresets={handleAddAllPresets}
            onRemoveImage={handleRemoveImage}
            onMoveImage={handleMoveImage}
            slideCountPerImage={slideCount}
          />
        </section>

        {/* Section 2: Workspace (Canvas Viewport + Global Settings Panel) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="canvas-section">
          {/* Left Column: Interactive Focus Canvas Viewport for Active Image */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            {activeImage && (
              <FocusCanvas
                imageSrc={activeImage.src}
                imageNaturalWidth={activeImage.width}
                imageNaturalHeight={activeImage.height}
                focalPoint={activeImage.focalPoint}
                onFocalPointChange={handleFocalPointChange}
                slideSteps={activeImage.steps || []}
                selectedStepIndex={selectedStepIndexInActive}
                onSelectStepIndex={setSelectedStepIndexInActive}
                imageName={activeImage.name}
              />
            )}

            {/* Image Multi-Upload Dropzone */}
            <ImageDropzone
              onImagesLoaded={(loaded) => {
                const newItems: ImageItem[] = loaded.map((l) => {
                  const id = `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
                  return {
                    id,
                    name: l.name,
                    src: l.dataUrl,
                    width: l.width,
                    height: l.height,
                    focalPoint: l.preset ? l.preset.focalPoint : { x: 0.5, y: 0.5 },
                    steps: [],
                  };
                });
                setImages((prev) => [...prev, ...newItems]);
                if (newItems.length > 0) {
                  setActiveImageId(newItems[0].id);
                }
                showToast(`${newItems.length}장의 이미지가 추가되었습니다.`);
              }}
              onAddPreset={handleAddPreset}
              onAddAllPresets={handleAddAllPresets}
              totalImagesCount={images.length}
              currentImageName={activeImage?.name}
            />
          </div>

          {/* Right Column: Global Settings Panel (applied uniformly to all images) */}
          <div className="lg:col-span-4" id="settings-section">
            <div className="sticky top-20">
              <SettingsPanel
                totalImages={images.length}
                slideCount={slideCount}
                onSlideCountChange={setSlideCount}
                initialZoom={initialZoom}
                onInitialZoomChange={setInitialZoom}
                easing={easing}
                onEasingChange={setEasing}
                direction={direction}
                onDirectionChange={setDirection}
                includeTitles={includeTitles}
                onIncludeTitlesChange={setIncludeTitles}
                includeStepBadges={includeStepBadges}
                onIncludeStepBadgesChange={setIncludeStepBadges}
                backgroundColor={backgroundColor}
                onBackgroundColorChange={setBackgroundColor}
                fileName={fileName}
                onFileNameChange={setFileName}
                onExportPptx={handleExportPptx}
                isExporting={isExporting}
                exportProgress={exportProgress}
                onOpenSlideshow={() => handleOpenSlideshow(0)}
                onResetDefaults={handleResetDefaults}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Slide Deck Preview Grid (All Slides sequentially or by Image) */}
        <section id="preview-section" className="pt-2">
          <SlideDeckPreview
            slides={flattenedSlides}
            selectedGlobalIndex={selectedGlobalIndex}
            onSelectGlobalIndex={setSelectedGlobalIndex}
            onDownloadSingleSlide={handleDownloadSingleSlide}
            onOpenSlideshow={handleOpenSlideshow}
          />
        </section>

        {/* Feature Highlights & Guide Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-900 text-xs">
          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/60 space-y-1.5">
            <div className="font-semibold text-neutral-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>단일 PPTX 통합 내보내기</span>
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              여러 이미지를 구분하여 여러 파일로 쪼개지 않고, 1개의 완성된 파워포인트(.pptx) 파일 안에 순서대로 완벽히 담아냅니다.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/60 space-y-1.5">
            <div className="font-semibold text-neutral-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>전체 이미지 일괄 공통 설정</span>
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              슬라이드 수, 배율, 감속 곡선, 배경색 설정이 모든 이미지에 동일하게 적용되어 통일감 있는 발표 슬라이드가 구성됩니다.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/60 space-y-1.5">
            <div className="font-semibold text-neutral-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>연속 슬라이드 쇼 시뮬레이터</span>
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              이미지 1에서 시작해 마지막 이미지까지 연속으로 전환되는 풀스크린 시뮬레이터로 실제 발표 리허설을 진행할 수 있습니다.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-850 bg-neutral-950 mt-12 py-6 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>ZoomOut PPT Generator · 다중 이미지 일괄 처리 16:9 프레젠테이션</span>
          <div className="flex items-center gap-4 text-neutral-400">
            <button
              onClick={() => setIsHelpOpen(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              사용 가이드
            </button>
            <button
              onClick={() => handleOpenSlideshow(0)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              슬라이드 쇼
            </button>
            <button
              onClick={handleExportPptx}
              className="hover:text-white transition-colors cursor-pointer"
            >
              통합 PPT 다운로드
            </button>
          </div>
        </div>
      </footer>

      {/* Presentation Fullscreen Modal */}
      <PresentationModal
        isOpen={isSlideshowOpen}
        onClose={() => setIsSlideshowOpen(false)}
        slides={flattenedSlides}
        initialIndex={slideshowStartIndex}
        onExportPptx={handleExportPptx}
        isExporting={isExporting}
        backgroundColor={backgroundColor}
      />

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-neutral-900/95 border border-neutral-700 text-white text-xs font-medium rounded-xl shadow-2xl backdrop-blur-md animate-fadeIn">
          <Info className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

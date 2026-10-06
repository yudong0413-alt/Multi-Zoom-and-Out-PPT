/**
 * Crop and zoom calculations for generating progressive 16:9 slides.
 */

export type EasingType = 'easeOut' | 'linear' | 'exponential' | 'smooth';
export type ZoomDirection = 'zoomOut' | 'zoomIn';

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SlideStepData {
  stepIndex: number;
  totalSteps: number;
  zoomLevel: number; // e.g. 4.5x down to 1.0x
  cropRect: CropRect;
  normalizedRect: {
    x: number; // 0..1
    y: number; // 0..1
    width: number;
    height: number;
  };
  title: string;
  subtitle: string;
  dataUrl?: string; // high-res canvas render
}

export function applyEasing(t: number, easing: EasingType): number {
  const clamped = Math.max(0, Math.min(1, t));
  switch (easing) {
    case 'linear':
      return clamped;
    case 'easeOut':
      return 1 - Math.pow(1 - clamped, 2.2);
    case 'exponential':
      return Math.pow(clamped, 2.2);
    case 'smooth':
      return clamped * clamped * (3 - 2 * clamped);
    default:
      return clamped;
  }
}

/**
 * Calculates the bounding boxes for all progressive zoom steps.
 */
export function calculateZoomSteps({
  imageWidth,
  imageHeight,
  focalPoint, // normalized 0..1 coordinates
  slideCount,
  initialZoom, // e.g. 4.0 = 4x magnification
  easing = 'easeOut',
  direction = 'zoomOut',
  targetAspectRatio = 16 / 9,
}: {
  imageWidth: number;
  imageHeight: number;
  focalPoint: { x: number; y: number };
  slideCount: number;
  initialZoom: number;
  easing?: EasingType;
  direction?: ZoomDirection;
  targetAspectRatio?: number;
}): SlideStepData[] {
  if (slideCount < 2) slideCount = 2;
  const imageAspect = imageWidth / imageHeight;

  // Compute maximum 16:9 box that fits inside or frames the full image
  let maxCropW: number;
  let maxCropH: number;

  if (imageAspect >= targetAspectRatio) {
    // Image is wider than 16:9, bounded by height
    maxCropH = imageHeight;
    maxCropW = imageHeight * targetAspectRatio;
  } else {
    // Image is taller than 16:9, bounded by width
    maxCropW = imageWidth;
    maxCropH = imageWidth / targetAspectRatio;
  }

  // Final / Full image centered crop
  const finalCenterX = imageWidth / 2;
  const finalCenterY = imageHeight / 2;

  // Initial zoomed-in box size
  const minCropW = Math.max(30, maxCropW / initialZoom);
  const minCropH = minCropW / targetAspectRatio;

  // Initial center based on focal point
  const initialCenterX = focalPoint.x * imageWidth;
  const initialCenterY = focalPoint.y * imageHeight;

  const steps: SlideStepData[] = [];

  for (let i = 0; i < slideCount; i++) {
    // Progress t from 0 (most zoomed in) to 1 (full view)
    const rawT = slideCount === 1 ? 0 : i / (slideCount - 1);
    const easedT = applyEasing(rawT, easing);

    // Box dimensions at progress easedT
    const currentW = minCropW + (maxCropW - minCropW) * easedT;
    const currentH = minCropH + (maxCropH - minCropH) * easedT;

    // Center transitions smoothly from focal point to full center
    const targetCenterX = initialCenterX + (finalCenterX - initialCenterX) * easedT;
    const targetCenterY = initialCenterY + (finalCenterY - initialCenterY) * easedT;

    // Calculate top-left (x, y) with boundary clamping so box stays inside the image
    let x = targetCenterX - currentW / 2;
    let y = targetCenterY - currentH / 2;

    if (x < 0) x = 0;
    if (x + currentW > imageWidth) x = Math.max(0, imageWidth - currentW);

    if (y < 0) y = 0;
    if (y + currentH > imageHeight) y = Math.max(0, imageHeight - currentH);

    const zoomRatio = maxCropW / currentW;

    // Titles
    let title = '';
    let subtitle = '';
    if (direction === 'zoomOut') {
      if (i === 0) {
        title = `Step 1: 핵심 단서 (${zoomRatio.toFixed(1)}x 확대)`;
        subtitle = '최초 포커스 영역의 정밀한 세부 디테일';
      } else if (i === slideCount - 1) {
        title = `Step ${i + 1}: 전체 풍경 공개 (1.0x 전체)`;
        subtitle = '모든 맥락이 드러나는 원본 전체 뷰';
      } else {
        title = `Step ${i + 1}: 점진적 확장 (${zoomRatio.toFixed(1)}x)`;
        subtitle = '주변 환경과 연결되는 중간 단계';
      }
    } else {
      if (i === 0) {
        title = `Step 1: 전체 조망 (1.0x 전체)`;
        subtitle = '넓은 시야에서 시작하는 도입부';
      } else if (i === slideCount - 1) {
        title = `Step ${i + 1}: 핵심 포커스 도달 (${zoomRatio.toFixed(1)}x)`;
        subtitle = '결정적인 세부 디테일 발견';
      } else {
        title = `Step ${i + 1}: 집중 추적 (${zoomRatio.toFixed(1)}x)`;
        subtitle = '중심으로 좁혀 들어가는 단계';
      }
    }

    steps.push({
      stepIndex: i,
      totalSteps: slideCount,
      zoomLevel: Number(zoomRatio.toFixed(2)),
      cropRect: {
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(currentW),
        height: Math.round(currentH),
      },
      normalizedRect: {
        x: x / imageWidth,
        y: y / imageHeight,
        width: currentW / imageWidth,
        height: currentH / imageHeight,
      },
      title,
      subtitle,
    });
  }

  // If direction is zoomIn, reverse the progression order
  if (direction === 'zoomIn') {
    steps.reverse();
    // re-assign stepIndex and step numbers
    return steps.map((s, idx) => ({
      ...s,
      stepIndex: idx,
      title: s.title.replace(/Step \d+:/, `Step ${idx + 1}:`),
    }));
  }

  return steps;
}

/**
 * Renders high-resolution cropped image for a slide using HTML5 Canvas.
 */
export async function renderSlideImage(
  img: HTMLImageElement,
  crop: CropRect,
  outputWidth = 1920,
  outputHeight = 1080
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    img,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outputWidth,
    outputHeight
  );

  return canvas.toDataURL('image/jpeg', 0.94);
}

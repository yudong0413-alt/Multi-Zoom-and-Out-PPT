import pptxgen from 'pptxgenjs';
import { FlattenedSlideItem } from '../types';

export interface PptxExportOptions {
  fileName?: string;
  presentationTitle?: string;
  includeTitles?: boolean;
  includeStepBadges?: boolean;
  backgroundColor?: string;
  onProgress?: (progress: number, message: string) => void;
}

export async function exportToPptx(
  slides: FlattenedSlideItem[],
  options: PptxExportOptions = {}
): Promise<void> {
  const {
    fileName = 'ZoomOut_Presentation',
    presentationTitle = 'Zoom-out Presentation',
    includeTitles = false,
    includeStepBadges = false,
    backgroundColor = '#000000',
    onProgress,
  } = options;

  onProgress?.(5, 'PowerPoint 프레젠테이션 초기화 중...');

  const pres = new pptxgen();

  // 16:9 Widescreen Layout (10 x 5.625 inches)
  pres.layout = 'LAYOUT_16x9';
  pres.title = presentationTitle;
  pres.author = 'ZoomOut PPT Generator';
  pres.company = 'AI Studio App';

  // Format background color for pptxgen (remove # if present)
  const cleanBgColor = backgroundColor.replace('#', '').toUpperCase();

  const total = slides.length;

  for (let i = 0; i < total; i++) {
    const slideItem = slides[i];
    const progressPercent = Math.round(10 + ((i + 1) / total) * 80);
    const imgInfo =
      slideItem.totalImages > 1
        ? `[이미지 ${slideItem.imageIndex + 1}/${slideItem.totalImages}] `
        : '';
    onProgress?.(
      progressPercent,
      `슬라이드 ${i + 1}/${total} 생성 중: ${imgInfo}(Step ${slideItem.stepIndex + 1}, ${slideItem.zoomLevel}x)...`
    );

    const slide = pres.addSlide();
    slide.background = { color: cleanBgColor };

    if (slideItem.dataUrl) {
      // Add cropped image full bleed to fill the 16:9 slide
      slide.addImage({
        data: slideItem.dataUrl,
        x: 0,
        y: 0,
        w: '100%',
        h: '100%',
      });
    }

    // Optional Step indicator badge
    if (includeStepBadges) {
      const badgeText =
        slideItem.totalImages > 1
          ? `[${i + 1}/${total}] ${slideItem.imageName.slice(0, 15)} (${slideItem.stepIndex + 1}/${slideItem.totalStepsInImage}) · ${slideItem.zoomLevel}x`
          : `[${i + 1}/${total}] ZOOM: ${slideItem.zoomLevel}x`;

      slide.addText(badgeText, {
        x: 0.4,
        y: 0.35,
        w: slideItem.totalImages > 1 ? 4.2 : 2.4,
        h: 0.35,
        fontSize: 10,
        fontFace: 'Helvetica',
        bold: true,
        color: 'FFFFFF',
        fill: { color: '000000', transparency: 30 },
        align: 'center',
        valign: 'middle',
        rectRadius: 0.05,
      });
    }

    // Optional Title / Subtitle overlay at bottom
    if (includeTitles && slideItem.title) {
      const titlePrefix =
        slideItem.totalImages > 1 ? `[${slideItem.imageName}] ` : '';
      slide.addText(
        [
          {
            text: `${titlePrefix}${slideItem.title}\n`,
            options: { fontSize: 18, bold: true, color: 'FFFFFF' },
          },
          {
            text: slideItem.subtitle || '',
            options: { fontSize: 12, color: 'D1D5DB' },
          },
        ],
        {
          x: 0.8,
          y: 4.4,
          w: 8.4,
          h: 0.9,
          fontFace: 'Helvetica',
          fill: { color: '000000', transparency: 25 },
          align: 'left',
          valign: 'middle',
          margin: [8, 12, 8, 12],
          rectRadius: 0.05,
        }
      );
    }
  }

  onProgress?.(95, '단일 PPTX 파일 패키징 및 다운로드 준비 중...');

  const finalFileName = fileName.endsWith('.pptx')
    ? fileName
    : `${fileName}.pptx`;
  await pres.writeFile({ fileName: finalFileName });

  onProgress?.(100, '다운로드 완료!');
}

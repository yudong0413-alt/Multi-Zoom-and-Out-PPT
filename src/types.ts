import { SlideStepData, CropRect } from './utils/cropUtils';

export interface ImageItem {
  id: string;
  name: string;
  src: string;
  width: number;
  height: number;
  focalPoint: { x: number; y: number };
  steps: SlideStepData[];
  isRendering?: boolean;
}

export interface FlattenedSlideItem {
  id: string;
  imageId: string;
  imageName: string;
  imageIndex: number;
  totalImages: number;
  stepIndex: number;
  totalStepsInImage: number;
  globalSlideIndex: number;
  totalGlobalSlides: number;
  zoomLevel: number;
  cropRect: CropRect;
  title: string;
  subtitle: string;
  dataUrl?: string;
}

import React from 'react';
import { X, ZoomOut, Sparkles, Check, Lightbulb } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 text-white space-y-5">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <ZoomOut className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold">점진적 줌아웃(Zoom-out) PPT 활용법</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-neutral-300 leading-relaxed">
          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-indigo-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>'줌아웃' 프레젠테이션이란?</span>
            </div>
            <p>
              슬라이드를 넘길 때마다 화면이 점진적으로 확대에서 전체 화면으로 멀어지며,
              청중의 시선을 하나의 작은 단서(디테일)에서 전체적인 맥락과 스토리로 자연스럽게 이끄는
              스토리텔링 기법입니다.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-neutral-100 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>다중 이미지 처리 & 단일 PPTX 생성 안내</span>
            </h4>
            <ul className="space-y-1.5 pl-1 text-neutral-400">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong className="text-neutral-200">여러 장 일괄 업로드:</strong> 여러 장의 사진을 한 번에 드래그하거나 선택하여 덱에 추가할 수 있습니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong className="text-neutral-200">공통 일괄 설정:</strong> 슬라이드 수, 배율, 완급 조절(Easing) 등은 모든 이미지에 동일하게 적용됩니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong className="text-neutral-200">단일 통합 PPT 파일:</strong> 각 이미지가 분리되지 않고, 이미지 순서대로 1개의 완성된 .pptx 파일로 생성됩니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong className="text-neutral-200">순서 변경 & 개별 초점:</strong> 덱 바에서 화살표로 발표 순서를 바꾸거나, 캔버스에서 각 이미지의 초점을 자유롭게 조정할 수 있습니다.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-neutral-100">조작 팁</h4>
            <p className="text-neutral-400">
              이미지 위에서 원하는 지점을 클릭하면 실시간으로 16:9 크롭 상자들이 계산됩니다.
              슬라이드 쇼 시뮬레이터에서 스페이스바를 눌러 실제 발표 느낌을 미리 체험한 후,
              [PPT 다운로드] 버튼을 누르면 완성된 16:9 .pptx 파일이 즉시 저장됩니다.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};

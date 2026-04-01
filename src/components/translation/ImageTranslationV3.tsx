import { useState } from 'react';
import {
  Wand2,
  ImageIcon,
  Languages,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import sonicEnImg from '../../assets/sonic_en.png';
import TranslationEditorModal, {
  type TextStyle as AppliedStyle,
  layerToStyle,
} from './TranslationEditorModal';

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImageTranslationV3() {
  const navigate = useNavigate();
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [appliedStyle,  setAppliedStyle]  = useState<AppliedStyle | null>(null);
  const [showSuccess,   setShowSuccess]   = useState(false);

  function handleApply(style: AppliedStyle) {
    setAppliedStyle(style);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3500);
  }

  const hasTranslation = appliedStyle !== null;

  return (
    <div className="min-h-screen bg-[#0e0e0f] text-white flex flex-col">

      {/* ── Top Bar ───────────────────────────────────────────────────────── */}
      <header className="shrink-0 h-14 flex items-center gap-3 px-6 border-b border-[#2a2a2a] bg-[#111111]">
        <button
          className="flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-white transition-colors"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <div className="w-px h-4 bg-[#2a2a2a]" />
        <Languages size={15} className="text-[#335fff]" />
        <span className="text-sm font-semibold text-white">Image Translation</span>
        <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-[#335fff]/20 text-[#335fff] rounded uppercase tracking-wider">
          v3
        </span>
      </header>

      {/* ── Page Body ─────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 gap-8">

        {/* ── Title block ─────────────────────────────────────────────── */}
        <div className="text-center max-w-xl">
          <h1 className="text-2xl font-bold text-white mb-2">Translate Your Image</h1>
          <p className="text-sm text-[#6b7280] leading-relaxed">
            Open the editor to adjust the translated text's position, size, color,
            and alignment directly on the image.
          </p>
        </div>

        {/* ── Two-card layout ─────────────────────────────────────────── */}
        <div className="flex items-start gap-6 w-full max-w-4xl">

          {/* Source Image card */}
          <div className="flex-1 bg-[#1b1b1c] border border-[#2a2a2a] rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <ImageIcon size={13} className="text-[#6b7280]" />
              <span className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">
                Source Image
              </span>
              <span className="ml-auto px-2 py-0.5 text-[10px] bg-[#2a2a2a] text-[#6b7280] rounded">
                EN
              </span>
            </div>
            <div className="rounded-lg overflow-hidden bg-[#0b0b0b] flex items-center justify-center min-h-[240px]">
              <img
                src={sonicEnImg}
                alt="Source image"
                className="w-full h-full object-contain"
                draggable={false}
              />
            </div>
            <p className="text-xs text-[#4b5563] text-center">Original · English</p>
          </div>

          {/* Divider arrow */}
          <div className="flex flex-col items-center gap-2 pt-20 shrink-0">
            <div className="w-8 h-8 rounded-full bg-[#1b1b1c] border border-[#2a2a2a] flex items-center justify-center">
              <Wand2 size={14} className="text-[#335fff]" />
            </div>
            <div className="w-px h-12 bg-[#2a2a2a]" />
          </div>

          {/* Translated Image card */}
          <div className="flex-1 bg-[#1b1b1c] border border-[#2a2a2a] rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <ImageIcon size={13} className="text-[#6b7280]" />
              <span className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">
                Translated Image
              </span>
              <span className="ml-auto px-2 py-0.5 text-[10px] bg-[#2a2a2a] text-[#6b7280] rounded">
                JA
              </span>
            </div>

            {hasTranslation && appliedStyle ? (
              /* Show translated preview — all layers */
              <div className="rounded-lg overflow-hidden bg-[#0b0b0b] flex items-center justify-center min-h-[240px] relative">
                <img
                  src={sonicEnImg}
                  alt="Translated image"
                  className="w-full h-full object-contain"
                  draggable={false}
                />
                {appliedStyle.layers.map(layer => (
                  <div
                    key={layer.id}
                    className="absolute pointer-events-none px-2 py-0.5 rounded whitespace-nowrap min-w-max"
                    style={layerToStyle(layer)}
                  >
                    {layer.text}
                  </div>
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="rounded-lg bg-[#0b0b0b] border border-dashed border-[#2a2a2a] flex flex-col items-center justify-center min-h-[240px] gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1b1b1c] border border-[#2a2a2a] flex items-center justify-center">
                  <Wand2 size={18} className="text-[#335fff]" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-[#9ca3af]">No translation yet</p>
                  <p className="text-xs text-[#4b5563] mt-1">
                    Click "Translate Image" to get started
                  </p>
                </div>
              </div>
            )}

            {hasTranslation && appliedStyle ? (
              <p className="text-xs text-[#4b5563] text-center">
                Edited · {appliedStyle.layers.length} layer{appliedStyle.layers.length !== 1 ? 's' : ''} · Japanese
              </p>
            ) : (
              <p className="text-xs text-[#4b5563] text-center">Pending · Japanese</p>
            )}
          </div>
        </div>

        {/* ── Action row ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 px-5 py-2.5 bg-[#335fff] hover:bg-[#4470ff] text-sm font-semibold text-white rounded-lg transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            <Wand2 size={15} />
            {hasTranslation ? 'Re-edit Translation' : 'Translate Image'}
          </button>

          {hasTranslation && (
            <button
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1b1b1c] hover:bg-[#222] border border-[#2a2a2a] text-sm font-medium text-[#9ca3af] hover:text-white rounded-lg transition-colors"
              onClick={() => setAppliedStyle(null)}
            >
              Reset
            </button>
          )}
        </div>

      </main>

      {/* ── Success Toast ─────────────────────────────────────────────────── */}
      {showSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2.5 bg-[#1b1b1c] border border-[#2a2a2a] rounded-full shadow-xl text-sm text-white">
          <CheckCircle2 size={15} className="text-[#22c55e]" />
          Translation applied successfully
        </div>
      )}

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      <TranslationEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={handleApply}
      />

    </div>
  );
}

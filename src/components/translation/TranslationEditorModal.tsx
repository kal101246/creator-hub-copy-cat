import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  EyeOff,
  Plus,
  Trash2,
} from 'lucide-react';
import sonicEnImg from '../../assets/sonic_en.png';

// ─── Types ────────────────────────────────────────────────────────────────────

type TextAlign = 'left' | 'center' | 'right';

export interface TextLayer {
  id: string;
  text: string;
  x: number;            // 0-100 % within the canvas ref
  y: number;
  fontSize: number;
  strokeWidth: number;
  letterSpacing: number;
  textAlign: TextAlign;
  customStyle: React.CSSProperties;
  activePresetId: string;
}

export interface TextStyle {
  layers: TextLayer[];
}

interface TranslationEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (style: TextStyle) => void;
}

// ─── Style presets ────────────────────────────────────────────────────────────

interface StylePreset {
  id: string;
  label: string;
  description: string;
  style: React.CSSProperties;
  strokeWidth: number;
  letterSpacing: number;
}

const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'default',
    label: 'Default',
    description: 'Clean white text',
    strokeWidth: 0,
    letterSpacing: 0,
    style: {
      color: '#ffffff',
      fontWeight: '700',
      textShadow: 'none',
      WebkitTextStroke: '0px #000000',
    },
  },
  {
    id: 'sonic-style',
    label: 'Sonic Style',
    description: 'Yellow + blue stroke',
    strokeWidth: 4,
    letterSpacing: -2,
    style: {
      color: '#FDE047',
      fontWeight: '900',
      WebkitTextStroke: '4px #1D4ED8',
      textShadow:
        '-2px -2px 0 #FFF, 2px -2px 0 #FFF, -2px 2px 0 #FFF, 2px 2px 0 #FFF, 0px 4px 8px rgba(0,0,0,0.5)',
    },
  },
  {
    id: 'meme-impact',
    label: 'Meme Impact',
    description: 'Heavy black outline',
    strokeWidth: 3,
    letterSpacing: 0,
    style: {
      color: '#ffffff',
      fontWeight: '900',
      WebkitTextStroke: '3px #000000',
      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    },
  },
  {
    id: 'neon-glow',
    label: 'Neon Glow',
    description: 'Pink with glow',
    strokeWidth: 0,
    letterSpacing: 2,
    style: {
      color: '#f472b6',
      fontWeight: '700',
      WebkitTextStroke: '0px #000000',
      textShadow:
        '0 0 8px #f472b6, 0 0 16px #f472b6, 0 0 32px #ec4899, 0 0 64px #ec4899',
    },
  },
  {
    id: 'speed-simulator',
    label: 'Speed Sim',
    description: 'Red block italic — Speed Simulator style',
    // letterSpacing drives the slider; don't put it in style (layerToStyle would override it)
    strokeWidth: 0,
    letterSpacing: 2,
    style: {
      color: 'white',
      fontStyle: 'italic',
      fontWeight: '900',
      textTransform: 'uppercase',
      backgroundColor: '#d92c20',
      padding: '4px 16px',
      border: '2px solid white',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
      display: 'inline-block',
      textShadow: 'none',
      WebkitTextStroke: '0px transparent',
    },
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const BG_SWATCHES = ['transparent', '#000000', '#111111cc', '#1a1a2ecc', '#ffffffcc', '#facc15cc'];
const LAYER_COLORS = ['#60a5fa', '#f472b6', '#4ade80', '#facc15', '#f87171', '#a78bfa'];

// Stable ID for the first default layer — avoids a chicken-and-egg useState problem
const INITIAL_LAYER_ID = 'layer-0';

let _layerSeq = 1;
function genId() { return `layer-${Date.now()}-${_layerSeq++}`; }
function layerColor(idx: number) { return LAYER_COLORS[idx % LAYER_COLORS.length]; }

// ─── Exported style helper (also used by ImageTranslationV3 preview) ──────────

export function layerToStyle(layer: TextLayer): React.CSSProperties {
  return {
    top:        `${layer.y}%`,
    left:       `${layer.x}%`,
    transform:  'translate(-50%, -50%)',
    fontSize:   `${layer.fontSize}px`,
    textAlign:  layer.textAlign,
    fontFamily: 'system-ui, sans-serif',
    lineHeight:  1.2,
    width:      'max-content',
    // spread preset/custom CSS (color, fontWeight, textShadow, WebkitTextStroke color…)
    ...layer.customStyle,
    // longhand overrides the width embedded in the WebkitTextStroke shorthand
    WebkitTextStrokeWidth: `${layer.strokeWidth}px`,
    letterSpacing:         `${layer.letterSpacing}px`,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CheckerSwatch() {
  return (
    <span
      className="block w-full h-full rounded"
      style={{ background: 'repeating-conic-gradient(#888 0% 25%, #bbb 0% 50%) 0 0 / 8px 8px' }}
    />
  );
}

function makeLayer(overrides: Partial<TextLayer> = {}): TextLayer {
  const def = STYLE_PRESETS[0];
  return {
    id:            genId(),
    text:          'New Text',
    x:             50,
    y:             50,
    fontSize:      36,
    strokeWidth:   def.strokeWidth,
    letterSpacing: def.letterSpacing,
    textAlign:     'center',
    customStyle:   def.style,
    activePresetId:'default',
    ...overrides,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TranslationEditorModal({
  isOpen,
  onClose,
  onApply,
}: TranslationEditorModalProps) {

  // ── Layers ────────────────────────────────────────────────────────────────
  const sonicPreset = STYLE_PRESETS[1]; // 'sonic-style'

  const [textLayers, setTextLayers] = useState<TextLayer[]>(() => [{
    id:            INITIAL_LAYER_ID,
    text:          'ソニック',
    x:             50,
    y:             35,
    fontSize:      56,
    strokeWidth:   sonicPreset.strokeWidth,
    letterSpacing: sonicPreset.letterSpacing,
    textAlign:     'center',
    customStyle:   sonicPreset.style,
    activePresetId:'sonic-style',
  }]);

  const [selectedLayerId, setSelectedLayerId] = useState<string>(INITIAL_LAYER_ID);
  const [showOriginal,    setShowOriginal]    = useState(true);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const canvasRef  = useRef<HTMLDivElement>(null);
  const dragRef    = useRef<{
    layerId:      string;
    startMouseX:  number;
    startMouseY:  number;
    startX:       number;
    startY:       number;
  } | null>(null);
  const textColorInputRef = useRef<HTMLInputElement>(null);
  const bgColorInputRef   = useRef<HTMLInputElement>(null);

  // ── Derived ───────────────────────────────────────────────────────────────
  const selectedLayer    = textLayers.find(l => l.id === selectedLayerId) ?? null;
  const currentTextColor = (selectedLayer?.customStyle.color as string | undefined) ?? '#ffffff';
  const currentBgColor   = (selectedLayer?.customStyle.backgroundColor as string | undefined) ?? 'transparent';

  // ── Layer helpers ─────────────────────────────────────────────────────────
  function updateLayer(id: string, patch: Partial<TextLayer>) {
    setTextLayers(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));
  }

  function updateSelected(patch: Partial<TextLayer>) {
    if (selectedLayerId) updateLayer(selectedLayerId, patch);
  }

  function addLayer() {
    const layer = makeLayer({ y: Math.min(85, 50 + textLayers.length * 12) });
    setTextLayers(prev => [...prev, layer]);
    setSelectedLayerId(layer.id);
  }

  function removeLayer(id: string) {
    if (textLayers.length <= 1) return;
    const remaining = textLayers.filter(l => l.id !== id);
    setTextLayers(remaining);
    if (selectedLayerId === id) setSelectedLayerId(remaining[0].id);
  }

  // ── Preset + colour helpers ───────────────────────────────────────────────
  function applyPreset(preset: StylePreset) {
    updateSelected({
      customStyle:   preset.style,
      strokeWidth:   preset.strokeWidth,
      letterSpacing: preset.letterSpacing,
      activePresetId:preset.id,
    });
  }

  function handleTextColorChange(color: string) {
    if (!selectedLayer) return;
    updateSelected({ customStyle: { ...selectedLayer.customStyle, color }, activePresetId: '' });
  }

  function handleBgColorChange(bg: string) {
    if (!selectedLayer) return;
    updateSelected({
      customStyle: {
        ...selectedLayer.customStyle,
        backgroundColor: bg === 'transparent' ? undefined : bg,
      },
    });
  }

  // ── Per-layer drag ────────────────────────────────────────────────────────
  function handleLayerMouseDown(e: React.MouseEvent<HTMLDivElement>, layer: TextLayer) {
    e.preventDefault();
    e.stopPropagation();
    setSelectedLayerId(layer.id);

    dragRef.current = {
      layerId:     layer.id,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startX:      layer.x,
      startY:      layer.y,
    };

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const dx = ((ev.clientX - dragRef.current.startMouseX) / rect.width)  * 100;
      const dy = ((ev.clientY - dragRef.current.startMouseY) / rect.height) * 100;
      updateLayer(dragRef.current.layerId, {
        x: Math.max(0, Math.min(100, dragRef.current.startX + dx)),
        y: Math.max(0, Math.min(100, dragRef.current.startY + dy)),
      });
    };

    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
  }

  // ── Apply ─────────────────────────────────────────────────────────────────
  function handleApply() {
    onApply?.({ layers: textLayers });
    onClose();
  }

  if (!isOpen) return null;

  // ── Render ────────────────────────────────────────────────────────────────
  const modal = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8"
        onClick={onClose}
      >
        {/* Modal container */}
        <div
          className="w-full max-w-6xl h-[80vh] bg-[#111111] border border-[#2a2a2a] rounded-2xl overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="v3EditTitle"
        >

          {/* ── Header ──────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-4 px-6 py-4 border-b border-[#2a2a2a] shrink-0">
            <div className="flex-1 min-w-0">
              <h2 id="v3EditTitle" className="text-sm font-semibold text-white leading-snug">
                Edit Translated Text
              </h2>
              <p className="text-xs text-[#6b7280] mt-0.5">
                Add layers · click to select · drag to reposition
              </p>
            </div>

            {/* Show Original toggle */}
            <button
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                showOriginal
                  ? 'bg-[#1a1a1a] border-[#3a3a3a] text-[#d1d5db] hover:border-[#555]'
                  : 'bg-[#0b0b0b] border-[#2a2a2a] text-[#4b5563] hover:border-[#3a3a3a] hover:text-[#9ca3af]'
              }`}
              onClick={() => setShowOriginal(p => !p)}
              aria-pressed={showOriginal}
            >
              {showOriginal ? <Eye size={13} /> : <EyeOff size={13} />}
              <span>Show Original</span>
              <span className={`w-7 h-4 rounded-full flex items-center transition-colors shrink-0 ${showOriginal ? 'bg-[#335fff]' : 'bg-[#2a2a2a]'}`}>
                <span className={`w-3 h-3 rounded-full bg-white shadow transition-transform mx-0.5 ${showOriginal ? 'translate-x-3' : 'translate-x-0'}`} />
              </span>
            </button>

            {/* Close */}
            <button
              className="w-7 h-7 flex items-center justify-center rounded-lg text-[#6b7280] hover:text-white hover:bg-[#2a2a2a] transition-colors shrink-0"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={15} />
            </button>
          </div>

          {/* ── Body ──────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-3 flex-1 min-h-0">

            {/* ── Left: Image Canvas (col-span-2) ─────────────────────────── */}
            <div className="col-span-2 bg-black relative flex items-center justify-center p-8 border-r border-[#2a2a2a] overflow-hidden">

              {/* Canvas ref — layer positions are % of this element's size */}
              <div className="relative inline-block overflow-visible" ref={canvasRef}>
                {/* Source image */}
                <img
                  src={sonicEnImg}
                  alt="Source"
                  className={`max-h-[60vh] max-w-full rounded-lg block transition-opacity duration-300 ${
                    showOriginal ? 'opacity-100' : 'opacity-10'
                  }`}
                  draggable={false}
                />

                {/* Render every text layer */}
                {textLayers.map(layer => {
                  const isSelected = layer.id === selectedLayerId;
                  return (
                    <div
                      key={layer.id}
                      className={`absolute select-none whitespace-nowrap min-w-max px-2 py-0.5 rounded cursor-grab active:cursor-grabbing transition-[box-shadow] ${
                        isSelected
                          ? 'ring-2 ring-[#335fff] ring-offset-1 ring-offset-black/30'
                          : 'ring-0 hover:ring-1 hover:ring-[#335fff]/40'
                      }`}
                      style={layerToStyle(layer)}
                      onMouseDown={e => handleLayerMouseDown(e, layer)}
                      title={isSelected ? 'Drag to reposition' : 'Click to select · drag to move'}
                    >
                      {layer.text || '\u00A0'}
                    </div>
                  );
                })}
              </div>

              <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-[#4b5563] pointer-events-none">
                {textLayers.length > 1 ? 'Click a layer to select · drag to reposition' : 'Drag text to reposition'}
              </p>
            </div>

            {/* ── Right: Controls panel (col-span-1) ──────────────────────── */}
            <div className="col-span-1 bg-[#111111] flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

                {/* ── Layer list ──────────────────────────────────────────── */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">
                      Layers
                    </label>
                    <button
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-[#335fff]/10 text-[#335fff] hover:bg-[#335fff]/20 border border-[#335fff]/20 transition-colors"
                      onClick={addLayer}
                    >
                      <Plus size={11} />
                      Add Layer
                    </button>
                  </div>

                  <div className="flex flex-col gap-1">
                    {textLayers.map((layer, idx) => {
                      const isSelected = layer.id === selectedLayerId;
                      return (
                        <div
                          key={layer.id}
                          className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#335fff]/15 border border-[#335fff]/30'
                              : 'bg-[#1a1a1a] border border-transparent hover:border-[#2a2a2a]'
                          }`}
                          onClick={() => setSelectedLayerId(layer.id)}
                        >
                          {/* Color dot */}
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: layerColor(idx) }}
                          />

                          {/* Text label */}
                          <span className={`flex-1 text-xs truncate ${isSelected ? 'text-white font-medium' : 'text-[#9ca3af]'}`}>
                            {layer.text || 'Empty'}
                          </span>

                          {/* Size badge */}
                          <span className="text-[10px] text-[#4b5563] tabular-nums shrink-0">
                            {layer.fontSize}px
                          </span>

                          {/* Delete (only when >1 layer) */}
                          {textLayers.length > 1 && (
                            <button
                              className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded text-[#6b7280] hover:text-[#f87171] hover:bg-[#f87171]/10 transition-all shrink-0"
                              onClick={e => { e.stopPropagation(); removeLayer(layer.id); }}
                              aria-label="Delete layer"
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-[#2a2a2a]" />

                {/* ── Per-layer controls ───────────────────────────────────── */}
                {selectedLayer ? (
                  <>

                    {/* Translated Text */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">
                        Translated Text
                      </label>
                      <textarea
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#4b5563] resize-none focus:outline-none focus:border-[#335fff] transition-colors"
                        value={selectedLayer.text}
                        onChange={e => updateSelected({ text: e.target.value })}
                        rows={2}
                        placeholder="Enter translated text…"
                      />
                    </div>

                    {/* Style Presets */}
                    <div className="flex flex-col gap-2.5">
                      <label className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">
                        Style Presets
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {STYLE_PRESETS.map(preset => {
                          const isActive = selectedLayer.activePresetId === preset.id;
                          return (
                            <button
                              key={preset.id}
                              onClick={() => applyPreset(preset)}
                              className={`relative flex flex-col items-center justify-center gap-1.5 rounded-xl p-3 border-2 transition-all ${
                                isActive
                                  ? 'border-[#335fff] bg-[#335fff]/10'
                                  : 'border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#444] hover:bg-[#202020]'
                              }`}
                              title={preset.description}
                            >
                              <span
                                className="leading-none select-none"
                                style={{ fontFamily: 'system-ui, sans-serif', ...preset.style, fontSize: '22px' }}
                              >
                                Aa
                              </span>
                              <span className="text-[11px] font-medium text-[#9ca3af] leading-tight">
                                {preset.label}
                              </span>
                              {isActive && (
                                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-[#335fff] flex items-center justify-center">
                                  <svg viewBox="0 0 10 10" className="w-2 h-2">
                                    <path d="M1.5 5 L4 7.5 L8.5 2.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Font Size */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">
                          Font Size
                        </label>
                        <span className="text-xs font-semibold text-white tabular-nums">
                          {selectedLayer.fontSize}px
                        </span>
                      </div>
                      <input
                        type="range" min={12} max={256}
                        value={selectedLayer.fontSize}
                        onChange={e => updateSelected({ fontSize: Number(e.target.value) })}
                        className="w-full h-1.5 appearance-none rounded-full bg-[#2a2a2a] accent-[#335fff] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-[#4b5563]">
                        <span>12</span><span>256</span>
                      </div>
                    </div>

                    {/* Text Spacing & Outline */}
                    <div className="flex flex-col gap-4">
                      <label className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">
                        Text Spacing &amp; Outline
                      </label>

                      {/* Stroke Width */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#6b7280]">Stroke Width</span>
                          <span className="text-xs font-semibold text-white tabular-nums">
                            {selectedLayer.strokeWidth}px
                          </span>
                        </div>
                        <input
                          type="range" min={0} max={20} step={1}
                          value={selectedLayer.strokeWidth}
                          onChange={e => updateSelected({ strokeWidth: Number(e.target.value) })}
                          className="w-full h-1.5 appearance-none rounded-full bg-[#2a2a2a] accent-[#335fff] cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-[#4b5563]">
                          <span>0</span><span>20</span>
                        </div>
                      </div>

                      {/* Kerning */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#6b7280]">Kerning</span>
                          <span className="text-xs font-semibold text-white tabular-nums">
                            {selectedLayer.letterSpacing}px
                          </span>
                        </div>
                        <input
                          type="range" min={-10} max={50} step={1}
                          value={selectedLayer.letterSpacing}
                          onChange={e => updateSelected({ letterSpacing: Number(e.target.value) })}
                          className="w-full h-1.5 appearance-none rounded-full bg-[#2a2a2a] accent-[#335fff] cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-[#4b5563]">
                          <span>-10</span><span>50</span>
                        </div>
                      </div>
                    </div>

                    {/* Text Color */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">
                        Text Color
                        {selectedLayer.activePresetId === '' && (
                          <span className="ml-2 normal-case text-[#4b5563]">(custom)</span>
                        )}
                      </label>
                      <div className="flex items-center gap-2 flex-wrap">
                        {['#ffffff', '#111111', '#FDE047', '#f472b6', '#60a5fa', '#4ade80'].map(c => (
                          <button
                            key={c}
                            className={`w-7 h-7 rounded-full border-2 transition-all ${
                              currentTextColor === c && selectedLayer.activePresetId === ''
                                ? 'border-[#335fff] scale-110'
                                : 'border-[#2a2a2a] hover:border-[#444]'
                            }`}
                            style={{ backgroundColor: c }}
                            onClick={() => handleTextColorChange(c)}
                            aria-label={`Text color ${c}`}
                          />
                        ))}
                        <button
                          className="w-7 h-7 rounded-full border-2 border-dashed border-[#444] hover:border-[#666] overflow-hidden transition-colors"
                          onClick={() => textColorInputRef.current?.click()}
                          title="Custom color"
                        >
                          <span className="block w-full h-full rounded-full" style={{ backgroundColor: currentTextColor }} />
                        </button>
                        <input
                          ref={textColorInputRef}
                          type="color"
                          value={/^#[0-9A-Fa-f]{6}$/.test(currentTextColor) ? currentTextColor : '#ffffff'}
                          onChange={e => handleTextColorChange(e.target.value)}
                          className="sr-only"
                          tabIndex={-1}
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-5 h-5 rounded border border-[#2a2a2a] shrink-0" style={{ backgroundColor: currentTextColor }} />
                        <input
                          type="text"
                          value={currentTextColor.toUpperCase()}
                          onChange={e => { const v = e.target.value; if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) handleTextColorChange(v); }}
                          className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-[#335fff] transition-colors"
                          maxLength={7}
                          spellCheck={false}
                        />
                      </div>
                    </div>

                    {/* Background Color */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">
                        Background Color
                      </label>
                      <div className="flex items-center gap-2 flex-wrap">
                        {BG_SWATCHES.map(c => (
                          <button
                            key={c}
                            className={`w-7 h-7 rounded border-2 transition-all overflow-hidden ${
                              currentBgColor === c || (c === 'transparent' && !selectedLayer.customStyle.backgroundColor)
                                ? 'border-[#335fff] scale-110'
                                : 'border-[#2a2a2a] hover:border-[#444]'
                            }`}
                            style={{ backgroundColor: c === 'transparent' ? undefined : c }}
                            onClick={() => handleBgColorChange(c)}
                            aria-label={c === 'transparent' ? 'Transparent' : `Background ${c}`}
                          >
                            {c === 'transparent' && <CheckerSwatch />}
                          </button>
                        ))}
                        <button
                          className="w-7 h-7 rounded border-2 border-dashed border-[#444] hover:border-[#666] overflow-hidden transition-colors"
                          onClick={() => bgColorInputRef.current?.click()}
                          title="Custom color"
                        >
                          <span
                            className="block w-full h-full"
                            style={{
                              backgroundColor:
                                currentBgColor !== 'transparent' && !BG_SWATCHES.includes(currentBgColor)
                                  ? currentBgColor : 'transparent',
                            }}
                          />
                        </button>
                        <input
                          ref={bgColorInputRef}
                          type="color"
                          value={currentBgColor && currentBgColor !== 'transparent' ? currentBgColor.slice(0, 7) : '#000000'}
                          onChange={e => handleBgColorChange(e.target.value)}
                          className="sr-only"
                          tabIndex={-1}
                        />
                      </div>
                    </div>

                    {/* Text Alignment */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">
                        Text Alignment
                      </label>
                      <div className="flex items-center gap-1 p-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
                        {(
                          [
                            { value: 'left'   as const, Icon: AlignLeft,   label: 'Align left'   },
                            { value: 'center' as const, Icon: AlignCenter, label: 'Align center' },
                            { value: 'right'  as const, Icon: AlignRight,  label: 'Align right'  },
                          ] as const
                        ).map(({ value, Icon, label }) => (
                          <button
                            key={value}
                            className={`flex-1 flex items-center justify-center py-1.5 rounded-md transition-all ${
                              selectedLayer.textAlign === value
                                ? 'bg-[#335fff] text-white'
                                : 'text-[#6b7280] hover:text-white hover:bg-[#2a2a2a]'
                            }`}
                            onClick={() => updateSelected({ textAlign: value })}
                            aria-label={label}
                          >
                            <Icon size={14} />
                          </button>
                        ))}
                      </div>
                    </div>

                  </>
                ) : (
                  /* No selection */
                  <div className="flex-1 flex items-center justify-center py-8">
                    <p className="text-xs text-[#4b5563] text-center leading-relaxed">
                      Select a layer above<br />to edit its style
                    </p>
                  </div>
                )}

              </div>{/* end scrollable */}

              {/* Sticky footer */}
              <div className="shrink-0 px-5 py-4 border-t border-[#2a2a2a] bg-[#111111] flex items-center gap-3">
                <button
                  className="flex-1 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-sm font-medium text-[#9ca3af] hover:text-white hover:border-[#444] transition-colors"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 py-2.5 rounded-lg bg-[#335fff] hover:bg-[#4470ff] text-sm font-semibold text-white transition-colors"
                  onClick={handleApply}
                >
                  Apply Translation
                </button>
              </div>

            </div>{/* end right column */}
          </div>{/* end body grid */}
        </div>{/* end modal container */}
      </div>{/* end backdrop */}
    </>
  );

  return createPortal(modal, document.body);
}

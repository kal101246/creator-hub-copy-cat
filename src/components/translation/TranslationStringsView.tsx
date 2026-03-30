import { Fragment, useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  SlidersHorizontal,
  Bell,
  AlignLeft,
  Check,
  Clock,
  Loader2,
  Trash2,
  Upload,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowLeft,
  X,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  CheckCircle2,
  MoreHorizontal,
  RefreshCw,
  FileEdit,
  ImageUp,
} from 'lucide-react';
import IconRail from '../shared/IconRail';
import styles from './TranslationStringsView.module.css';
import avatarImg from '../../assets/avatar.png';
import sonicEnImg from '../../assets/sonic_en.png';
import sonicJaImg from '../../assets/sonic_ja.png';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNow(): string {
  const d = new Date();
  const month = d.toLocaleString('en-US', { month: 'short' });
  const day = d.getDate();
  const year = d.getFullYear();
  const hours = d.getHours();
  const mins = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${month} ${day}, ${year} | ${h12}:${mins} ${ampm}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = 'Information' | 'Strings' | 'Images' | 'Products';

interface GlossaryTermDef {
  term: string;
  ruleText: string;
  notes: string;
}

/** Universal item that all three tabs can funnel into the shared editor pane */
interface TranslatableItem {
  id: string;
  label: string;       // short display label used in the middle list
  text: string;        // full source text shown in "Text to Translate"
  maxLength: number;   // char limit for the translation textarea
  key?: string;
  location?: string;
  context?: string | null;
  example?: string | null;
  history: { user: string; translation: string; date: string }[];
}

// ─── Glossary terms ───────────────────────────────────────────────────────────

const GLOSSARY_TERM_DEFS: GlossaryTermDef[] = [
  { term: 'Spike',   ruleText: 'is translated to "カケル"', notes: 'Main character; his name needs to be translated differently in Japanese.' },
  { term: 'Amazing', ruleText: 'is translated to "すごい"', notes: 'Very common phrase; we want to keep it consistent whenever it shows.' },
  { term: 'Blue',    ruleText: 'Do not translate',          notes: "Important NPC's name; don't confuse it with the color blue." },
  { term: 'Sony',    ruleText: 'Do not translate',          notes: "IP Holder; a well known brand name that shouldn't be translated." },
];

const SORTED_GLOSSARY_DEFS = [...GLOSSARY_TERM_DEFS].sort((a, b) => b.term.length - a.term.length);

function highlightGlossaryTerms(
  text: string,
  onEnter: (e: React.MouseEvent<HTMLSpanElement>, def: GlossaryTermDef) => void,
  onLeave: () => void,
): React.ReactNode {
  if (!text || SORTED_GLOSSARY_DEFS.length === 0) return text;
  const escapedTerms = SORTED_GLOSSARY_DEFS.map((d) => d.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) => {
    const def = SORTED_GLOSSARY_DEFS.find((d) => d.term.toLowerCase() === part.toLowerCase());
    if (def) {
      return (
        <span key={i} className={styles.glossaryTerm} onMouseEnter={(e) => onEnter(e, def)} onMouseLeave={onLeave}>
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

// ─── Strings tab data ─────────────────────────────────────────────────────────

interface StringEntry {
  id: string;
  text: string;
  status: 'complete' | 'pending';
  key: string;
  location: string;
  context: string | null;
  example: string | null;
  history: { user: string; translation: string; date: string }[];
}

const ALL_STRINGS: StringEntry[] = [
  { id: 's1',  text: 'Spike',                                                                             status: 'complete', key: 'Character.Spike.Name',            location: 'Workspace.Characters.Spike.NameTag',                             context: null,                                                      example: null,        history: [{ user: 'kal101246', translation: 'スパイク',           date: 'Aug 7, 2025 | 11:11 AM' }] },
  { id: 's2',  text: "No! No! Don't spike the ball to me!",                                               status: 'pending',  key: 'Dialogue.Spike.BallProtest',      location: 'Workspace.Dialogue.SpikeNPC.Line01',                             context: null,                                                      example: null,        history: [] },
  { id: 's3',  text: 'Nailed it!',                                                                        status: 'pending',  key: 'UI.Victory.NailedIt',             location: 'Workspace.UI.VictoryScreen.Label',                               context: 'Shown on the victory screen when the player succeeds',    example: null,        history: [] },
  { id: 's4',  text: "I know, but this is the reality of Spike's dilemma. Don't you know?",               status: 'pending',  key: 'Dialogue.Spike.Dilemma',          location: 'Workspace.Dialogue.SpikeNPC.Line02',                             context: null,                                                      example: null,        history: [] },
  { id: 's5',  text: "You do realize you can't let the Ape Escape from this Spike's cell right?",         status: 'pending',  key: 'Dialogue.Guard.Cell',             location: 'Workspace.Dialogue.GuardNPC.Line05',                             context: null,                                                      example: null,        history: [] },
  { id: 's6',  text: '♪♪ Ha! Spike will find you! ♪♪',                                                   status: 'pending',  key: 'Billboard.AdText',                location: 'Workspace.Billboards.Billboard.Board.SurfaceGui.AdText',         context: null,                                                      example: null,        history: [{ user: 'kal101246', translation: '尝试在工作室中使用生长工具', date: 'Aug 7, 2025 | 11:11 AM' }] },
  { id: 's7',  text: 'Welcome to the arena!',                                                             status: 'complete', key: 'UI.Arena.Welcome',                location: 'Workspace.UI.ArenaScreen.WelcomeLabel',                          context: null,                                                      example: null,        history: [{ user: 'kal101246', translation: 'アリーナへようこそ！', date: 'Aug 5, 2025 | 9:30 AM'  }] },
  { id: 's8',  text: 'Game Over',                                                                         status: 'complete', key: 'UI.GameOver',                     location: 'Workspace.UI.GameOverScreen.Title',                               context: 'Shown when the player loses all lives',                   example: 'Game Over', history: [{ user: 'kal101246', translation: 'ゲームオーバー',    date: 'Aug 3, 2025 | 2:14 PM'  }] },
  { id: 's9',  text: 'Press start to continue…',                                                          status: 'pending',  key: 'UI.TitleScreen.PressStart',       location: 'Workspace.UI.TitleScreen.PressStartLabel',                       context: null,                                                      example: null,        history: [] },
  { id: 's10', text: "Amazing! You've escaped the cell!",                                                 status: 'pending',  key: 'Dialogue.Guard.Escape',           location: 'Workspace.Dialogue.GuardNPC.Line07',                             context: 'Plays when the player escapes for the first time',        example: null,        history: [] },
];

// ─── Information tab data ─────────────────────────────────────────────────────

const INFO_ITEMS: TranslatableItem[] = [
  {
    id: 'info-name',   label: 'Name',
    text: 'The Great Escape Monkey Game',
    maxLength: 50,
    key: 'GameInfo.Name',        location: 'MarketplacePage.GameTitle',
    context: 'The game title displayed on the Roblox game page and in search results', example: null, history: [],
  },
  {
    id: 'info-desc',   label: 'Description',
    text: 'This is your very first Roblox creation. Check it out, then make it your own with Roblox Studio!',
    maxLength: 1000,
    key: 'GameInfo.Description', location: 'MarketplacePage.Description',
    context: 'Shown on the game page and in discovery surfaces', example: null, history: [],
  },
  {
    id: 'info-icon',   label: 'Icon',
    text: 'Icon',
    maxLength: 200,
    key: 'GameInfo.Icon',        location: 'MarketplacePage.Icon',
    context: 'Alt text for the game icon image', example: null, history: [],
  },
  {
    id: 'info-thumb',  label: 'Thumbnails',
    text: 'Thumbnails',
    maxLength: 200,
    key: 'GameInfo.Thumbnails',  location: 'MarketplacePage.ThumbnailGallery',
    context: 'Alt text for game thumbnail images in the gallery', example: null, history: [],
  },
];

// ─── Mock thumbnail assets ────────────────────────────────────────────────────

interface MockThumbnail {
  id: string;
  assetId: string;
  status: 'approved' | 'pending';
  /** CSS gradient used as a colour placeholder (no real image asset needed) */
  gradient: string;
}

const MOCK_THUMBNAILS: MockThumbnail[] = [
  { id: 'th1', assetId: '16336780754', status: 'approved', gradient: 'linear-gradient(135deg,#1e2a4a,#2e4a7a)' },
  { id: 'th2', assetId: '16336780755', status: 'approved', gradient: 'linear-gradient(135deg,#2a1e3a,#5a2e7a)' },
  { id: 'th3', assetId: '16336780756', status: 'approved', gradient: 'linear-gradient(135deg,#1a2e2a,#2a5e4a)' },
];

// ─── Images tab data ──────────────────────────────────────────────────────────

interface ImageEntry {
  id: string;
  filename: string;
  sourceDesc: string;
  translatedDesc: string;
  context: string;
  example: string;
  key: string;
  location: string;
  history: { user: string; translation: string; date: string }[];
  /** CSS gradient for placeholder thumbnails (not used when hasRealImages is true) */
  thumbGradient: string;
  /** True when we have actual imported image assets to display */
  hasRealImages: boolean;
}

const IMAGE_ITEMS: ImageEntry[] = [
  {
    id: 'img-1',
    filename: 'sonic_game_title.jpg',
    sourceDesc: 'SONIC SPEED SIMULATOR',
    translatedDesc: 'ソニック スピードシミュレータ',
    context: 'No context available',
    example: 'No example available',
    key: 'No key available',
    location: 'Workspace.Billboards.Billboard.Board.SurfaceGui.AdText',
    history: [{ user: 'Automatic Translation', translation: 'game title in ui', date: 'Oct 3, 2025 | 11:11 AM' }],
    thumbGradient: '',
    hasRealImages: true,
  },
  {
    id: 'img-2',
    filename: 'sonic_loading_screen.jpg',
    sourceDesc: 'Loading Screen Image',
    translatedDesc: 'ローディング画面',
    context: 'No context available',
    example: 'No example available',
    key: 'No key available',
    location: 'Workspace.UI.LoadingScreen.Background',
    history: [{ user: 'Automatic Translation', translation: 'loading screen background', date: 'Oct 3, 2025 | 11:11 AM' }],
    thumbGradient: 'linear-gradient(135deg,#1a4a2e 0%,#2e8a4f 50%,#1a3a2e 100%)',
    hasRealImages: false,
  },
  {
    id: 'img-3',
    filename: 'pizza_ad.jpg',
    sourceDesc: 'Pizza Advertisement',
    translatedDesc: 'ピザ広告',
    context: 'No context available',
    example: 'No example available',
    key: 'No key available',
    location: 'Workspace.Billboards.PizzaAd.Board.SurfaceGui',
    history: [{ user: 'Automatic Translation', translation: 'pizza advertisement banner', date: 'Oct 3, 2025 | 11:11 AM' }],
    thumbGradient: 'linear-gradient(135deg,#c0392b 0%,#e67e22 60%,#c0392b 100%)',
    hasRealImages: false,
  },
  {
    id: 'img-4',
    filename: 'on_off_sign.png',
    sourceDesc: 'ON/OFF Sign',
    translatedDesc: 'オン/オフ サイン',
    context: 'No context available',
    example: 'No example available',
    key: 'No key available',
    location: 'Workspace.Signs.OnOffSign.SurfaceGui',
    history: [{ user: 'Automatic Translation', translation: 'on/off indicator sign', date: 'Oct 3, 2025 | 11:11 AM' }],
    thumbGradient: 'linear-gradient(135deg,#2c3e50 0%,#7f8c8d 50%,#2c3e50 100%)',
    hasRealImages: false,
  },
  {
    id: 'img-5',
    filename: 'lorem_ipsum_name.png',
    sourceDesc: 'Lorem Ipsum Name',
    translatedDesc: 'ロレム イプスム',
    context: 'No context available',
    example: 'No example available',
    key: 'No key available',
    location: 'Workspace.UI.NameTag.SurfaceGui',
    history: [{ user: 'Automatic Translation', translation: 'placeholder name text', date: 'Oct 3, 2025 | 11:11 AM' }],
    thumbGradient: 'linear-gradient(135deg,#1a1a1a 0%,#2c2c2c 100%)',
    hasRealImages: false,
  },
];

// ─── Products tab data ────────────────────────────────────────────────────────

interface ProductGroup {
  id: string;
  name: string;
  /** Default status used before any drafts exist */
  defaultStatus: 'loading' | 'pending';
  fields: TranslatableItem[];
}

const PRODUCT_GROUPS: ProductGroup[] = [
  {
    id: 'dp1', name: 'Super Jump Power-up', defaultStatus: 'loading',
    fields: [
      { id: 'dp1-name', label: 'Name',        text: 'Super Jump Power-up',                                                        maxLength: 50,   key: 'DeveloperProduct.SuperJump.Name',        location: 'MarketplacePage.DeveloperProduct.SuperJump.Name',        context: null, example: null, history: [] },
      { id: 'dp1-desc', label: 'Description', text: 'Double your jump height for 30 seconds. Great for reaching high platforms!', maxLength: 1000, key: 'DeveloperProduct.SuperJump.Description', location: 'MarketplacePage.DeveloperProduct.SuperJump.Description', context: null, example: null, history: [] },
      { id: 'dp1-icon', label: 'Icon',        text: 'Super Jump Power-up',                                                        maxLength: 50,   key: 'DeveloperProduct.SuperJump.Icon',        location: 'MarketplacePage.DeveloperProduct.SuperJump.Icon',        context: null, example: null, history: [] },
    ],
  },
  {
    id: 'dp2', name: 'Banana Magnet', defaultStatus: 'pending',
    fields: [
      { id: 'dp2-name', label: 'Name',        text: 'Banana Magnet',                                                                            maxLength: 50,   key: 'DeveloperProduct.BananaMagnet.Name',        location: 'MarketplacePage.DeveloperProduct.BananaMagnet.Name',        context: null, example: null, history: [] },
      { id: 'dp2-desc', label: 'Description', text: 'Automatically collect nearby bananas within a 20-stud radius for 60 seconds.',             maxLength: 1000, key: 'DeveloperProduct.BananaMagnet.Description', location: 'MarketplacePage.DeveloperProduct.BananaMagnet.Description', context: null, example: null, history: [] },
    ],
  },
  {
    id: 'dp3', name: 'Infinite Health Unlock', defaultStatus: 'pending',
    fields: [
      { id: 'dp3-name', label: 'Name',        text: 'Infinite Health Unlock',                                                                    maxLength: 50,   key: 'DeveloperProduct.InfiniteHealth.Name',        location: 'MarketplacePage.DeveloperProduct.InfiniteHealth.Name',        context: null, example: null, history: [] },
      { id: 'dp3-desc', label: 'Description', text: 'Unlock infinite health for your character. You cannot take damage while this is active.',   maxLength: 1000, key: 'DeveloperProduct.InfiniteHealth.Description', location: 'MarketplacePage.DeveloperProduct.InfiniteHealth.Description', context: null, example: null, history: [] },
    ],
  },
];

const ALL_PRODUCT_FIELDS = PRODUCT_GROUPS.flatMap((g) => g.fields);

// ─── Other constants ──────────────────────────────────────────────────────────

const LANGUAGES = ['French', 'German', 'Italian', 'Japanese', 'Spanish'];
const TABS: TabId[] = ['Information', 'Strings', 'Images', 'Products'];
const CURRENT_USER = 'kal101246';

interface GlossaryTipState { def: GlossaryTermDef; top: number; left: number; }
interface StatusTipState   { label: string; bottom: number; centeredAt: number; }

/**
 * Pre-fill draftTexts from existing string history entries so translations
 * are visible on first load. s6 gets the design-specified Japanese default.
 */
function buildInitialDrafts(): Record<string, string> {
  const map: Record<string, string> = {};
  ALL_STRINGS.forEach((s) => {
    if (s.history.length > 0) {
      map[`${s.id}:Japanese`] = s.history[s.history.length - 1].translation;
    }
  });
  map['s6:Japanese'] = '♪♪ ハ! カケルがお前を見つけ出す! ♪♪';
  return map;
}

// ─── Feedback modal constants ──────────────────────────────────────────────────
const DOWNVOTE_OPTIONS = [
  'Fonts do not match',
  'Text is not readable',
  'Poor translation quality',
  'Poor image quality',
] as const;

const UPVOTE_OPTIONS = [
  'Font match is excellent',
  'Text is very clear',
  'Translation quality is natural',
  'Image fidelity is preserved',
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function TranslationStringsView() {
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') ?? '';
  const urlTab    = searchParams.get('tab')    ?? '';

  // ── Tab & language ────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    if (urlTab === 'information') return 'Information';
    if (urlTab === 'images')      return 'Images';
    if (urlTab === 'products')    return 'Products';
    return 'Strings';
  });
  const [selectedLang, setSelectedLang] = useState('Japanese');

  // ── Per-tab selection ─────────────────────────────────────────────────────
  const [localSearch, setLocalSearch]   = useState(urlSearch);
  const [selectedId,  setSelectedId]    = useState<string | null>(() => {
    if (urlSearch) {
      const match = ALL_STRINGS.find((s) => s.text.toLowerCase().includes(urlSearch.toLowerCase()));
      return match?.id ?? 's1';
    }
    return 's1';
  });
  const [selectedInfoId,          setSelectedInfoId]          = useState<string>('info-name');
  const [selectedProductFieldId,  setSelectedProductFieldId]  = useState<string | null>(null);
  const [productFilter,           setProductFilter]           = useState<string>('all');
  /** Tracks which thumbnail is selected in the Thumbnails editor */
  const [selectedThumbnailId,     setSelectedThumbnailId]     = useState<string>(MOCK_THUMBNAILS[0]?.id ?? '');
  /** Images tab: selected image asset */
  const [selectedImageId,         setSelectedImageId]         = useState<string>(IMAGE_ITEMS[0].id);
  /** Images tab: per-image "Use Translated Image" toggle state */
  const [useTranslatedImageMap,   setUseTranslatedImageMap]   = useState<Record<string, boolean>>({ 'img-1': true });

  // ── Feedback modal ────────────────────────────────────────────────────────
  const [feedbackOpen,    setFeedbackOpen]    = useState(false);
  const [feedbackVote,    setFeedbackVote]    = useState<'up' | 'down'>('down');
  const [feedbackChecks,  setFeedbackChecks]  = useState<Set<string>>(new Set());
  const [feedbackDetails, setFeedbackDetails] = useState('');
  const [feedbackToast,   setFeedbackToast]   = useState(false);

  function openFeedback() {
    setFeedbackVote('down');
    setFeedbackChecks(new Set());
    setFeedbackDetails('');
    setFeedbackOpen(true);
  }

  function handleFeedbackSubmit() {
    setFeedbackOpen(false);
    setFeedbackToast(true);
    setTimeout(() => setFeedbackToast(false), 3500);
  }

  function toggleFeedbackCheck(opt: string) {
    setFeedbackChecks((prev) => {
      const next = new Set(prev);
      if (next.has(opt)) next.delete(opt); else next.add(opt);
      return next;
    });
  }

  // ── Image actions V2 (feature flag) ──────────────────────────────────────
  const navigate = useNavigate();

  /** Master flag: false = V1 (MessageSquare trigger), true = V2 (ellipsis menu) */
  const [imgFlowV2,      setImgFlowV2]      = useState(false);
  /** Flag modal ([ key) */
  const [imgFlagOpen,    setImgFlagOpen]    = useState(false);
  const [imgFlagPos,     setImgFlagPos]     = useState({ x: 100, y: 140 });
  const imgFlagDragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  /** Ellipsis popover */
  const [imgMenuOpen,    setImgMenuOpen]    = useState(false);
  const [imgMenuPos,     setImgMenuPos]     = useState({ x: 0, y: 0 });
  /** Regenerating state */
  const [imgRegenerating, setImgRegenerating] = useState(false);
  /** Deleted state — clears the translated image slot */
  const [imgDeleted,     setImgDeleted]     = useState(false);
  /** Delete confirmation modal */
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  /** Action toasts (regenerate / delete) */
  const [imgActionToast, setImgActionToast] = useState('');
  const imgToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // '[' key — open flag modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '[' && !e.metaKey && !e.ctrlKey) setImgFlagOpen(p => !p);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Draggable flag modal
  function onImgFlagDragStart(e: React.MouseEvent) {
    const { clientX, clientY } = e;
    imgFlagDragRef.current = { startX: clientX, startY: clientY, origX: imgFlagPos.x, origY: imgFlagPos.y };
    const onMove = (ev: MouseEvent) => {
      if (!imgFlagDragRef.current) return;
      setImgFlagPos({
        x: imgFlagDragRef.current.origX + ev.clientX - imgFlagDragRef.current.startX,
        y: imgFlagDragRef.current.origY + ev.clientY - imgFlagDragRef.current.startY,
      });
    };
    const onUp = () => {
      imgFlagDragRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  function showImgToast(msg: string) {
    setImgActionToast(msg);
    if (imgToastTimer.current) clearTimeout(imgToastTimer.current);
    imgToastTimer.current = setTimeout(() => setImgActionToast(''), 3500);
  }

  function openImgMenu(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setImgMenuPos({ x: rect.right - 220, y: rect.bottom + 6 });
    setImgMenuOpen(true);
  }

  /** Upload flow */
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const [imgUploading, setImgUploading] = useState(false);

  /** Edit Image Text modal */
  const [editTextOpen,    setEditTextOpen]    = useState(false);
  const [editText,        setEditText]        = useState('ピザ');
  const [editTextPos,     setEditTextPos]     = useState({ x: 0, y: 0 });
  const [editTextSize,    setEditTextSize]    = useState(36);
  const [editFontFamily,  setEditFontFamily]  = useState('sans-serif');
  const [editTextStretch, setEditTextStretch] = useState(100);
  const [editTextColor,   setEditTextColor]   = useState('#000000');
  const [editTextOpacity, setEditTextOpacity] = useState(100);
  /** Extended editor state */
  const [editSelected,    setEditSelected]    = useState(false);
  const [editFontWeight,  setEditFontWeight]  = useState('700');
  const [editItalic,      setEditItalic]      = useState(false);
  const [editAllCaps,     setEditAllCaps]     = useState(false);
  const [editHistory,     setEditHistory]     = useState<Array<{ x: number; y: number }>>([]);
  /** Collapsible property section states */
  const [editSecContent,    setEditSecContent]    = useState(true);
  const [editSecTransform,  setEditSecTransform]  = useState(true);
  const [editSecText,       setEditSecText]       = useState(true);
  const [editSecAppearance, setEditSecAppearance] = useState(true);
  /** Refs for drag + hidden color input + canvas size */
  const editDragRef    = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
  const colorInputRef  = useRef<HTMLInputElement | null>(null);
  const editCanvasRef  = useRef<HTMLDivElement | null>(null);
  const editTextPosRef = useRef({ x: 0, y: 0 });

  // Keep posRef in sync so keyboard handler always sees latest position
  useEffect(() => { editTextPosRef.current = editTextPos; }, [editTextPos]);

  // Keyboard shortcuts for the Edit Text modal (Arrow nudge + Ctrl+Z undo)
  useEffect(() => {
    if (!editTextOpen) return;
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'TEXTAREA' || tag === 'INPUT') return;
      const nudge = e.shiftKey ? 10 : 1;
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setEditHistory(prev => [...prev.slice(-19), editTextPosRef.current]);
          setEditTextPos(prev => ({ ...prev, x: prev.x - nudge }));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setEditHistory(prev => [...prev.slice(-19), editTextPosRef.current]);
          setEditTextPos(prev => ({ ...prev, x: prev.x + nudge }));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setEditHistory(prev => [...prev.slice(-19), editTextPosRef.current]);
          setEditTextPos(prev => ({ ...prev, y: prev.y - nudge }));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setEditHistory(prev => [...prev.slice(-19), editTextPosRef.current]);
          setEditTextPos(prev => ({ ...prev, y: prev.y + nudge }));
          break;
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setEditHistory(prev => {
              if (prev.length === 0) return prev;
              const next = [...prev];
              const last = next.pop()!;
              setEditTextPos(last);
              return next;
            });
          }
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editTextOpen]);

  function handleRegenerate() {
    setImgMenuOpen(false);
    setImgRegenerating(true);
    const ms = 5000 + Math.random() * 2000;
    setTimeout(() => {
      setImgRegenerating(false);
      showImgToast('Image Regenerated. Reviewing...');
    }, ms);
  }

  function handleUploadNew() {
    setImgMenuOpen(false);
    uploadInputRef.current?.click();
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    setImgUploading(true);
    setTimeout(() => {
      setImgUploading(false);
      showImgToast('New image uploaded. Processing...');
    }, 3000);
    // Reset so the same file can be picked again if needed
    e.target.value = '';
  }

  function handleEditImageText() {
    setImgMenuOpen(false);
    setEditText('Sonic');
    setEditTextPos({ x: 0, y: 0 });
    setEditTextSize(36);
    setEditFontFamily('sans-serif');
    setEditTextStretch(100);
    setEditTextColor('#000000');
    setEditTextOpacity(100);
    setEditSelected(false);
    setEditFontWeight('700');
    setEditItalic(false);
    setEditAllCaps(false);
    setEditHistory([]);
    setEditTextOpen(true);
  }

  /** Snap text to a named alignment position using live canvas dimensions */
  function snapToAlign(h: 'left' | 'center' | 'right', v: 'top' | 'middle' | 'bottom') {
    const el = editCanvasRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const pad = 28;
    const x = h === 'left' ? -(width / 2 - pad) : h === 'right' ? width / 2 - pad : 0;
    const y = v === 'top' ? -(height / 2 - pad) : v === 'bottom' ? height / 2 - pad : 0;
    setEditHistory(prev => [...prev.slice(-19), editTextPosRef.current]);
    setEditTextPos({ x, y });
  }

  function handleSaveTranslation() {
    setEditTextOpen(false);
    showImgToast('Text styling saved. Generating updated image...');
  }

  /** WYSIWYG drag — mousedown on the canvas text overlay */
  function handleTextMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setEditSelected(true);
    // Push current position to history before drag begins
    setEditHistory(prev => [...prev.slice(-19), editTextPosRef.current]);
    editDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: editTextPos.x,
      startPosY: editTextPos.y,
    };

    const onMove = (ev: MouseEvent) => {
      if (!editDragRef.current) return;
      document.body.style.cursor = 'grabbing';
      setEditTextPos({
        x: editDragRef.current.startPosX + ev.clientX - editDragRef.current.startX,
        y: editDragRef.current.startPosY + ev.clientY - editDragRef.current.startY,
      });
    };

    const onUp = () => {
      editDragRef.current = null;
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  function handleDeleteConfirm() {
    setDeleteModalOpen(false);
    setImgDeleted(true);
    showImgToast('Image deleted. Restoring source language...');
  }

  // ── Translation draft & history ───────────────────────────────────────────
  const [draftTexts,   setDraftTexts]   = useState<Record<string, string>>(buildInitialDrafts);
  const [savedHistory, setSavedHistory] = useState<Record<string, { translation: string; date: string; user: string }[]>>({});

  const [showToast, setShowToast] = useState(false);
  const [toastMsg,  setToastMsg]  = useState('');

  // ── Tooltip states ────────────────────────────────────────────────────────
  const [glossaryTip, setGlossaryTip] = useState<GlossaryTipState | null>(null);
  const [statusTip,   setStatusTip]   = useState<StatusTipState   | null>(null);

  // ── Derived: current TranslatableItem regardless of active tab ────────────
  const selectedItem: TranslatableItem | null = (() => {
    if (activeTab === 'Strings') {
      const s = ALL_STRINGS.find((x) => x.id === selectedId) ?? null;
      if (!s) return null;
      return { id: s.id, label: s.text, text: s.text, maxLength: 800, key: s.key, location: s.location, context: s.context, example: s.example, history: s.history };
    }
    if (activeTab === 'Information') {
      return INFO_ITEMS.find((x) => x.id === selectedInfoId) ?? null;
    }
    if (activeTab === 'Products') {
      return ALL_PRODUCT_FIELDS.find((x) => x.id === selectedProductFieldId) ?? null;
    }
    return null;
  })();

  const saveKey = (() => {
    if (!selectedItem) return '';
    // Thumbnails: each thumbnail gets its own alt-text per language
    if (activeTab === 'Information' && selectedInfoId === 'info-thumb') {
      return `thumb-${selectedThumbnailId}:${selectedLang}`;
    }
    return `${selectedItem.id}:${selectedLang}`;
  })();
  const maxLen     = selectedItem?.maxLength ?? 800;
  const currentText = saveKey ? (draftTexts[saveKey] ?? '') : '';
  const canSave    = currentText.trim().length > 0;

  const sessionSaves    = saveKey ? (savedHistory[saveKey] ?? []) : [];
  const effectiveHistory = selectedItem ? [...selectedItem.history, ...sessionSaves] : [];

  // ── Status helpers ────────────────────────────────────────────────────────

  /** Strings tab: falls back to entry.status so pre-existing complete entries stay green */
  const effectiveStringStatus = (entry: StringEntry): 'complete' | 'pending' => {
    const k = `${entry.id}:${selectedLang}`;
    if ((draftTexts[k] ?? '').trim()) return 'complete';
    return entry.status;
  };

  /** Info / Products tabs: purely draft-based */
  const effectiveItemStatus = (itemId: string): 'complete' | 'pending' => {
    // Thumbnails: complete if ANY thumbnail has a saved alt text
    if (itemId === 'info-thumb') {
      const anyDone = MOCK_THUMBNAILS.some(
        (t) => (draftTexts[`thumb-${t.id}:${selectedLang}`] ?? '').trim(),
      );
      return anyDone ? 'complete' : 'pending';
    }
    const k = `${itemId}:${selectedLang}`;
    return (draftTexts[k] ?? '').trim() ? 'complete' : 'pending';
  };

  /** Product group: loading = partially done, complete = all done */
  const groupEffectiveStatus = (group: ProductGroup): 'complete' | 'loading' | 'pending' => {
    const done = group.fields.filter((f) => (draftTexts[`${f.id}:${selectedLang}`] ?? '').trim()).length;
    if (done === group.fields.length) return 'complete';
    if (done > 0) return 'loading';
    return group.defaultStatus;
  };

  // ── Filtered list data ────────────────────────────────────────────────────
  const query          = localSearch.trim().toLowerCase();
  const filteredStrings = query ? ALL_STRINGS.filter((s) => s.text.toLowerCase().includes(query)) : ALL_STRINGS;
  const filteredGroups  = productFilter === 'all' ? PRODUCT_GROUPS : PRODUCT_GROUPS.filter((g) => g.id === productFilter);

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleTextChange = useCallback((value: string) => {
    if (!saveKey) return;
    setDraftTexts((prev) => ({ ...prev, [saveKey]: value }));
  }, [saveKey]);

  const handleSave = useCallback(() => {
    if (!saveKey || !currentText.trim()) return;
    const newEntry = { translation: currentText, date: formatNow(), user: CURRENT_USER };
    setSavedHistory((prev) => ({ ...prev, [saveKey]: [...(prev[saveKey] ?? []), newEntry] }));
    setToastMsg(`${selectedLang} translation saved.`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, [saveKey, currentText, selectedLang]);

  // ── Tooltip handlers ──────────────────────────────────────────────────────

  const handleGlossaryEnter = (e: React.MouseEvent<HTMLSpanElement>, def: GlossaryTermDef) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setGlossaryTip({ def, top: rect.bottom + 8, left: rect.left - 23 });
  };
  const handleGlossaryLeave = () => setGlossaryTip(null);

  const handleStatusEnter = (e: React.MouseEvent<HTMLSpanElement>, label: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setStatusTip({ label, bottom: window.innerHeight - rect.top + 6, centeredAt: rect.left + rect.width / 2 });
  };
  const handleStatusLeave = () => setStatusTip(null);

  // ── Portal overlays ───────────────────────────────────────────────────────

  const glossaryPortal = glossaryTip ? createPortal(
    <div className={styles.glossaryTooltip} style={{ top: glossaryTip.top, left: glossaryTip.left }}>
      <div className={styles.glossaryTooltipCaret} />
      <div className={styles.glossaryTooltipInner}>
        <div className={styles.glossaryTooltipTitle}>
          <span className={styles.glossaryTooltipTerm}>{glossaryTip.def.term}</span>
          <span className={styles.glossaryTooltipRule}>{glossaryTip.def.ruleText}</span>
        </div>
        <p className={styles.glossaryTooltipNotes}>{glossaryTip.def.notes}</p>
      </div>
    </div>,
    document.body,
  ) : null;

  const statusPortal = statusTip ? createPortal(
    <div className={styles.statusTooltip} style={{ bottom: statusTip.bottom, left: statusTip.centeredAt }}>
      {statusTip.label}
      <div className={styles.statusTooltipCaret} />
    </div>,
    document.body,
  ) : null;

  // ── Icon & Thumbnail editor helpers ──────────────────────────────────────

  /** Shared save + history section used by icon/thumbnail editors */
  function renderAltTextSaveSection(label: string, placeholder: string) {
    return (
      <>
        <div className={styles.editorSection}>
          <div className={`${styles.fieldLabel} ${styles.fieldLabelEmphasis}`}>{label}</div>
          <textarea
            className={styles.translationTextarea}
            placeholder={placeholder}
            maxLength={maxLen}
            value={currentText}
            onChange={(e) => handleTextChange(e.target.value)}
          />
          <div className={styles.helperText}>{maxLen - currentText.length} characters left</div>
          <div className={styles.actionRow}>
            <div />
            <div className={styles.actionBtns}>
              <button className={styles.btnCancel} onClick={() => handleTextChange('')}>Cancel</button>
              <button
                className={`${styles.btnSave} ${!canSave ? styles.btnSaveDisabled : ''}`}
                onClick={handleSave}
                disabled={!canSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>

        <div className={styles.historySection}>
          <div className={styles.sectionTitle}>Translation History</div>
          {effectiveHistory.length === 0 ? (
            <div className={styles.historyEmpty}>No translation history available</div>
          ) : (
            effectiveHistory.map((h, i) => (
              <div key={i} className={styles.historyEntry}>
                <div className={styles.historyLeft}>
                  <div className={styles.historyUser}>{h.user}</div>
                  <div className={styles.historyTranslation}>{h.translation}</div>
                </div>
                <div className={styles.historyDate}>{h.date}</div>
              </div>
            ))
          )}
        </div>
      </>
    );
  }

  /** Editor pane content for the Icon info item */
  function renderIconEditor() {
    return (
      <>
        <div className={styles.editorSection}>
          <div className={styles.fieldLabel}><span>Game Icon</span></div>
          <div className={styles.iconEditorArea}>
            {/* Placeholder preview */}
            <div className={styles.iconPreview}>
              <div className={styles.iconPreviewPlaceholder} />
            </div>
            <div className={styles.iconPreviewRight}>
              <div className={styles.iconPreviewBtns}>
                <button className={styles.btnSecondary}>
                  <Upload size={13} />
                  Upload
                </button>
                <button className={styles.btnSecondary}>
                  Remove
                </button>
              </div>
              <div className={styles.fileRequirements}>
                <div className={styles.fileReqRow}>
                  <span className={styles.fileReqLabel}>Acceptable files:</span>
                  <span className={styles.fileReqValue}>.jpg, .png, .bmp, .tga</span>
                </div>
                <div className={styles.fileReqRow}>
                  <span className={styles.fileReqLabel}>Resolution:</span>
                  <span className={styles.fileReqValue}>Min 512 × 512 px</span>
                </div>
                <div className={styles.fileReqRow}>
                  <span className={styles.fileReqLabel}>Max size:</span>
                  <span className={styles.fileReqValue}>4 MB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {renderAltTextSaveSection(`${selectedLang} Alt Text:`, 'Type alt text translation for this icon')}
      </>
    );
  }

  /** Editor pane content for the Thumbnails info item */
  function renderThumbnailsEditor() {
    return (
      <>
        <div className={styles.editorSection}>
          <button className={styles.btnSecondary} style={{ marginBottom: 12 }}>
            <Upload size={13} />
            Upload Thumbnails
          </button>

          <div className={styles.thumbGrid}>
            {MOCK_THUMBNAILS.map((thumb) => {
              const isActive = thumb.id === selectedThumbnailId;
              return (
                <div
                  key={thumb.id}
                  className={`${styles.thumbCard} ${isActive ? styles.thumbCardActive : ''}`}
                  onClick={() => setSelectedThumbnailId(thumb.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedThumbnailId(thumb.id)}
                >
                  <div className={styles.thumbImgPlaceholder} style={{ background: thumb.gradient }} />
                  <div className={styles.thumbInfo}>
                    <span className={styles.thumbId}>{thumb.assetId}</span>
                    <span className={styles.thumbStatusApproved}>Approved</span>
                  </div>
                  <button
                    className={styles.thumbDeleteBtn}
                    aria-label={`Remove thumbnail ${thumb.assetId}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        {renderAltTextSaveSection(`${selectedLang} Alt Text:`, 'Type alt text translation for this thumbnail')}
      </>
    );
  }

  /** Top-level editor pane: branches for Images/Icon/Thumbnails, falls through to standard */
  function renderEditorContent() {
    if (activeTab === 'Images') return renderImagesEditor();
    if (selectedItem === null) {
      return <div className={styles.editorEmpty}>Select an item to begin translating</div>;
    }
    if (activeTab === 'Information' && selectedInfoId === 'info-icon')  return renderIconEditor();
    if (activeTab === 'Information' && selectedInfoId === 'info-thumb') return renderThumbnailsEditor();

    // ── Standard translation editor ───────────────────────────────────────
    return (
      <>
        {/* Source text */}
        <div className={styles.editorSection}>
          <div className={styles.fieldLabel}>
            <span>Text to Translate:</span>
            <button className={styles.iconBtn} aria-label="Delete item"><Trash2 size={14} /></button>
          </div>
          <div className={styles.sourceText}>
            {highlightGlossaryTerms(selectedItem.text, handleGlossaryEnter, handleGlossaryLeave)}
          </div>
        </div>

        {/* Translation input */}
        <div className={styles.editorSection}>
          <div className={`${styles.fieldLabel} ${styles.fieldLabelEmphasis}`}>
            {selectedLang} Translation:
          </div>
          <textarea
            className={styles.translationTextarea}
            placeholder="Type your translation here"
            maxLength={maxLen}
            value={currentText}
            onChange={(e) => handleTextChange(e.target.value)}
          />
          <div className={styles.helperText}>{maxLen - currentText.length} characters left</div>
          <div className={styles.actionRow}>
            <div className={styles.toggleRow}>
              <div className={styles.toggleTrack}><div className={styles.toggleKnob} /></div>
              <span className={styles.toggleLabel}>Lock translation from automatic updates</span>
            </div>
            <div className={styles.actionBtns}>
              <button className={styles.btnCancel} onClick={() => handleTextChange('')}>Cancel</button>
              <button
                className={`${styles.btnSave} ${!canSave ? styles.btnSaveDisabled : ''}`}
                onClick={handleSave}
                disabled={!canSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* More Information */}
        <div className={styles.infoSection}>
          <div className={styles.sectionTitle}>More Information</div>
          {[
            { key: 'Context',  value: selectedItem.context  ?? 'None Available' },
            { key: 'Example',  value: selectedItem.example  ?? 'None Available' },
            { key: 'Key',      value: selectedItem.key      ?? '' },
            { key: 'Location', value: selectedItem.location ?? '' },
          ].map(({ key, value }) => (
            <div key={key} className={styles.infoRow}>
              <span className={styles.infoKey}>{key}</span>
              <span className={`${styles.infoValue} ${(key === 'Key' || key === 'Location') ? styles.infoValueMono : ''}`}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Translation History */}
        <div className={styles.historySection}>
          <div className={styles.sectionTitle}>Translation History</div>
          {effectiveHistory.length === 0 ? (
            <div className={styles.historyEmpty}>No translation history available</div>
          ) : (
            effectiveHistory.map((h, i) => (
              <div key={i} className={styles.historyEntry}>
                <div className={styles.historyLeft}>
                  <div className={styles.historyUser}>{h.user}</div>
                  <div className={styles.historyTranslation}>{h.translation}</div>
                </div>
                <div className={styles.historyDate}>{h.date}</div>
              </div>
            ))
          )}
        </div>
      </>
    );
  }

  // ── Middle pane (swaps per tab) ───────────────────────────────────────────

  // ── Images middle pane ───────────────────────────────────────────────────
  function renderImagesMiddlePane() {
    return (
      <div className={styles.stringsPane}>
        <div className={styles.stringsPaneHeader}>
          <span className={styles.stringsPaneTitle}>Images</span>
          <div className={styles.stringsPaneActions}>
            <button className={styles.stringsActionBtn} aria-label="Filter">
              <SlidersHorizontal size={14} />
            </button>
            <button className={styles.stringsActionBtn} aria-label="Search">
              <Search size={14} />
            </button>
          </div>
        </div>
        <div className={styles.stringsList}>
          {IMAGE_ITEMS.map((img) => (
            <div
              key={img.id}
              className={`${styles.imgItem} ${img.id === selectedImageId ? styles.stringItemActive : ''}`}
              onClick={() => setSelectedImageId(img.id)}
            >
              {img.hasRealImages ? (
                <img src={sonicEnImg} alt="" className={styles.imgThumb} />
              ) : (
                <div className={styles.imgThumbPlaceholder} style={{ background: img.thumbGradient }} />
              )}
              <span className={`${styles.imgFilename} ${img.id === selectedImageId ? styles.stringItemTextActive : ''}`}>
                {img.filename}
              </span>
              <span className={styles.imgCheckIcon}>
                <Check size={14} className={styles.iconCheck} />
              </span>
            </div>
          ))}
        </div>
        <div className={styles.stringsPagination}>
          <span>1–{IMAGE_ITEMS.length} of {IMAGE_ITEMS.length}</span>
          <div className={styles.paginationControls}>
            <button className={styles.paginationBtn} aria-label="First page"><ChevronsLeft size={12} /></button>
            <button className={styles.paginationBtn} aria-label="Previous page"><ChevronLeft size={12} /></button>
            <button className={styles.paginationBtn} aria-label="Next page"><ChevronRight size={12} /></button>
            <button className={styles.paginationBtn} aria-label="Last page"><ChevronsRight size={12} /></button>
          </div>
        </div>
      </div>
    );
  }

  // ── Images editor (comparison view) ──────────────────────────────────────
  function renderImagesEditor() {
    const img = IMAGE_ITEMS.find((i) => i.id === selectedImageId) ?? IMAGE_ITEMS[0];
    const useTranslated = useTranslatedImageMap[img.id] ?? false;

    function toggleUseTranslated() {
      setUseTranslatedImageMap((prev) => ({ ...prev, [img.id]: !prev[img.id] }));
    }

    return (
      <>
        {/* Use Translated Image header */}
        <div className={styles.editorSection}>
          <div className={styles.imgEditorHeader}>
            <span className={styles.imgEditorToggleLabel}>Use Translated Image</span>
            <button
              role="switch"
              aria-checked={useTranslated}
              className={`${styles.bigToggle} ${useTranslated ? styles.bigToggleOn : ''}`}
              onClick={toggleUseTranslated}
            >
              <span className={`${styles.bigToggleKnob} ${useTranslated ? styles.bigToggleKnobOn : ''}`}>
                {useTranslated && <Check size={10} strokeWidth={3} />}
              </span>
            </button>
          </div>

          {/* Source + Translated image cards side by side */}
          <div className={styles.imgCompareRow}>
            {/* Source card */}
            <div className={styles.imgCompareCard}>
              <div className={styles.imgCheckerboard}>
                {img.hasRealImages
                  ? <img src={sonicEnImg} alt="Source" className={styles.imgCardImg} />
                  : <div className={styles.imgCardPlaceholder} style={{ background: img.thumbGradient }} />}
              </div>
              <div className={styles.imgCardFooter}>
                <div>
                  <div className={styles.imgCardLabel}>Source Image</div>
                  <div className={styles.imgCardDesc}>{img.sourceDesc}</div>
                </div>
              </div>
            </div>
            {/* Translated card — V1: click image → feedback; V2: ellipsis menu */}
            <div className={styles.imgCompareCard}>
              <div
                className={`${styles.imgCheckerboard} ${!imgFlowV2 && !imgRegenerating && !imgUploading && !imgDeleted ? styles.imgCheckerboardClickable : ''} ${(imgRegenerating || imgUploading) ? styles.imgCheckerboardLoading : ''}`}
                onClick={!imgFlowV2 && !imgRegenerating && !imgUploading && !imgDeleted ? openFeedback : undefined}
                role={!imgFlowV2 && !imgRegenerating && !imgUploading && !imgDeleted ? 'button' : undefined}
                tabIndex={!imgFlowV2 && !imgRegenerating && !imgUploading && !imgDeleted ? 0 : undefined}
                aria-label={!imgFlowV2 ? 'Give feedback on translated image' : undefined}
                onKeyDown={!imgFlowV2 ? (e) => e.key === 'Enter' && openFeedback() : undefined}
              >
                {(imgRegenerating || imgUploading) ? (
                  <div className={styles.imgRegenOverlay}>
                    {imgUploading
                      ? <ImageUp size={28} className={styles.imgRegenSpinner} style={{ animation: 'none' }} />
                      : <RefreshCw size={28} className={styles.imgRegenSpinner} />}
                    <span className={styles.imgRegenText}>{imgUploading ? 'Uploading…' : 'Regenerating…'}</span>
                  </div>
                ) : imgDeleted ? (
                  <div className={styles.imgDeletedPlaceholder}>
                    <span>No translated image</span>
                  </div>
                ) : img.hasRealImages ? (
                  <img src={sonicJaImg} alt="Translated" className={styles.imgCardImg} />
                ) : (
                  <div className={styles.imgCardPlaceholder} style={{ background: img.thumbGradient, opacity: 0.7 }} />
                )}
                {/* V1 hover hint only */}
                {!imgFlowV2 && !imgRegenerating && !imgUploading && !imgDeleted && (
                  <div className={styles.imgFeedbackHint} aria-hidden="true">
                    <MessageSquare size={18} />
                    <span>Give Feedback</span>
                  </div>
                )}
              </div>
              <div className={styles.imgCardFooter}>
                <div>
                  <div className={styles.imgCardLabel}>
                    Translated Image{imgDeleted ? ' (Deleted)' : ''}
                  </div>
                  <div className={styles.imgCardDesc}>{img.translatedDesc}</div>
                </div>
                {/* V1: MessageSquare feedback icon | V2: ellipsis menu */}
                {!imgFlowV2 ? (
                  <button className={styles.iconBtn} aria-label="Give feedback" onClick={openFeedback}>
                    <MessageSquare size={14} />
                  </button>
                ) : (
                  <button className={styles.iconBtn} aria-label="More options" onClick={openImgMenu}>
                    <MoreHorizontal size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* More Information */}
        <div className={styles.infoSection}>
          <div className={styles.sectionTitle}>More Information</div>
          {([
            { key: 'Context',  value: img.context },
            { key: 'Example',  value: img.example },
            { key: 'Key',      value: img.key },
            { key: 'Location', value: img.location },
          ] as { key: string; value: string }[]).map(({ key, value }) => (
            <div key={key} className={styles.infoRow}>
              <span className={styles.infoKey}>{key}</span>
              <span className={`${styles.infoValue} ${(key === 'Key' || key === 'Location') ? styles.infoValueMono : ''}`}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Translation History */}
        <div className={styles.historySection}>
          <div className={styles.sectionTitle}>Translation History</div>
          {img.history.length === 0 ? (
            <div className={styles.historyEmpty}>No translation history available</div>
          ) : img.history.map((h, i) => (
            <div key={i} className={styles.historyEntry}>
              {img.hasRealImages && (
                <img src={sonicJaImg} alt="" className={styles.historyThumb} />
              )}
              <div className={styles.historyLeft}>
                <div className={styles.historyUser}>{h.user}</div>
                <div className={styles.historyTranslation}>{h.translation}</div>
              </div>
              <div className={styles.historyDate}>{h.date}</div>
            </div>
          ))}
        </div>
      </>
    );
  }

  function renderMiddlePane() {
    // ── Images ──
    if (activeTab === 'Images') return renderImagesMiddlePane();

    // ── Information ──
    if (activeTab === 'Information') {
      return (
        <div className={styles.stringsPane}>
          <div className={styles.stringsPaneHeader}>
            <span className={styles.stringsPaneTitle}>Information</span>
          </div>
          <div className={styles.stringsList}>
            {INFO_ITEMS.map((item) => {
              const status = effectiveItemStatus(item.id);
              return (
                <div
                  key={item.id}
                  className={`${styles.stringItem} ${item.id === selectedInfoId ? styles.stringItemActive : ''}`}
                  onClick={() => setSelectedInfoId(item.id)}
                >
                  <span className={`${styles.stringItemText} ${item.id === selectedInfoId ? styles.stringItemTextActive : ''}`}>
                    {item.label}
                  </span>
                  <span
                    className={styles.stringItemStatus}
                    onMouseEnter={(e) => handleStatusEnter(e, status === 'complete' ? 'Translated' : 'Pending translation')}
                    onMouseLeave={handleStatusLeave}
                    role="img"
                    aria-label={status === 'complete' ? 'Translated' : 'Pending translation'}
                  >
                    {status === 'complete'
                      ? <Check size={14} className={styles.iconCheck} />
                      : <Clock size={14} className={styles.iconPending} />}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // ── Products ──
    if (activeTab === 'Products') {
      const totalFields = filteredGroups.reduce((n, g) => n + g.fields.length, 0);
      return (
        <div className={styles.stringsPane}>
          <div className={styles.stringsPaneHeader}>
            <span className={styles.stringsPaneTitle}>Products</span>
            <div className={styles.stringsPaneActions}>
              <button className={styles.stringsActionBtn} aria-label="Filter">
                <SlidersHorizontal size={14} />
              </button>
            </div>
          </div>

          {/* Show All dropdown */}
          <div className={styles.productFilterRow}>
            <div className={styles.productFilterWrap}>
              <select
                className={styles.productFilterSelect}
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
              >
                <option value="all">Show All</option>
                {PRODUCT_GROUPS.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className={styles.productFilterChevron} />
            </div>
          </div>

          <div className={styles.stringsList}>
            {filteredGroups.map((group) => {
              const gStatus = groupEffectiveStatus(group);
              return (
                <Fragment key={group.id}>
                  {/* Product group header row */}
                  <div className={styles.productGroupHeader}>
                    <span className={styles.productGroupName}>{group.name}</span>
                    <span
                      className={styles.stringItemStatus}
                      onMouseEnter={(e) => handleStatusEnter(e,
                        gStatus === 'complete' ? 'Fully translated' :
                        gStatus === 'loading'  ? 'Partially translated' :
                        'Pending translation'
                      )}
                      onMouseLeave={handleStatusLeave}
                      role="img"
                      aria-label={gStatus}
                    >
                      {gStatus === 'complete' ? <Check   size={14} className={styles.iconCheck} />   :
                       gStatus === 'loading'  ? <Loader2 size={14} className={styles.iconLoading} /> :
                                                <Clock   size={14} className={styles.iconPending} />}
                    </span>
                  </div>

                  {/* Field rows — indented */}
                  {group.fields.map((field) => {
                    const fStatus = effectiveItemStatus(field.id);
                    return (
                      <div
                        key={field.id}
                        className={`${styles.productField} ${field.id === selectedProductFieldId ? styles.stringItemActive : ''}`}
                        onClick={() => setSelectedProductFieldId(field.id)}
                      >
                        <span className={`${styles.productFieldLabel} ${field.id === selectedProductFieldId ? styles.stringItemTextActive : ''}`}>
                          {field.label}
                        </span>
                        <span
                          className={styles.stringItemStatus}
                          onMouseEnter={(e) => handleStatusEnter(e, fStatus === 'complete' ? 'Translated' : 'Pending translation')}
                          onMouseLeave={handleStatusLeave}
                          role="img"
                          aria-label={fStatus === 'complete' ? 'Translated' : 'Pending translation'}
                        >
                          {fStatus === 'complete'
                            ? <Check size={14} className={styles.iconCheck} />
                            : <Clock size={14} className={styles.iconPending} />}
                        </span>
                      </div>
                    );
                  })}
                </Fragment>
              );
            })}
          </div>

          <div className={styles.stringsPagination}>
            <span>1–{totalFields} of {ALL_PRODUCT_FIELDS.length}</span>
            <div className={styles.paginationControls}>
              <button className={styles.paginationBtn} aria-label="First page">   <ChevronsLeft  size={12} /></button>
              <button className={styles.paginationBtn} aria-label="Previous page"><ChevronLeft   size={12} /></button>
              <button className={styles.paginationBtn} aria-label="Next page">    <ChevronRight  size={12} /></button>
              <button className={styles.paginationBtn} aria-label="Last page">    <ChevronsRight size={12} /></button>
            </div>
          </div>
        </div>
      );
    }

    // ── Strings (default) ──
    return (
      <div className={styles.stringsPane}>
        <div className={styles.stringsPaneHeader}>
          <span className={styles.stringsPaneTitle}>Strings</span>
          <div className={styles.stringsPaneActions}>
            <button className={styles.stringsActionBtn} aria-label="Add string"><Plus            size={14} /></button>
            <button className={styles.stringsActionBtn} aria-label="Filter">    <SlidersHorizontal size={14} /></button>
            <button className={styles.stringsActionBtn} aria-label="Search">    <Search          size={14} /></button>
          </div>
        </div>

        <div className={styles.stringsSearchRow}>
          <label className={styles.stringsSearchWrap}>
            <Search size={12} className={styles.stringsSearchIcon} />
            <input
              className={styles.stringsSearchInput}
              type="text"
              placeholder="Search strings…"
              value={localSearch}
              onChange={(e) => { setLocalSearch(e.target.value); setSelectedId(null); }}
            />
          </label>
        </div>

        <div className={styles.stringsList}>
          {filteredStrings.length === 0 ? (
            <div className={styles.stringsEmpty}>No strings match &ldquo;{localSearch}&rdquo;</div>
          ) : (
            filteredStrings.map((entry) => (
              <div
                key={entry.id}
                className={`${styles.stringItem} ${entry.id === selectedId ? styles.stringItemActive : ''}`}
                onClick={() => setSelectedId(entry.id)}
              >
                <span className={`${styles.stringItemText} ${entry.id === selectedId ? styles.stringItemTextActive : ''}`}>
                  {highlightGlossaryTerms(entry.text, handleGlossaryEnter, handleGlossaryLeave)}
                </span>
                <span
                  className={styles.stringItemStatus}
                  onMouseEnter={(e) => handleStatusEnter(e, effectiveStringStatus(entry) === 'complete' ? 'Translated' : 'Pending translation')}
                  onMouseLeave={handleStatusLeave}
                  aria-label={effectiveStringStatus(entry) === 'complete' ? 'Translated' : 'Pending translation'}
                  role="img"
                >
                  {effectiveStringStatus(entry) === 'complete'
                    ? <Check size={14} className={styles.iconCheck} />
                    : <Clock size={14} className={styles.iconPending} />}
                </span>
              </div>
            ))
          )}
        </div>

        <div className={styles.stringsPagination}>
          <span>1–{filteredStrings.length} of {ALL_STRINGS.length}</span>
          <div className={styles.paginationControls}>
            <button className={styles.paginationBtn} aria-label="First page">   <ChevronsLeft  size={12} /></button>
            <button className={styles.paginationBtn} aria-label="Previous page"><ChevronLeft   size={12} /></button>
            <button className={styles.paginationBtn} aria-label="Next page">    <ChevronRight  size={12} /></button>
            <button className={styles.paginationBtn} aria-label="Last page">    <ChevronsRight size={12} /></button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
    <div className={styles.shell}>

      {/* ── App Bar ──────────────────────────────────────────────── */}
      <div className={styles.appBar}>
        <div className={styles.trafficLights}>
          <span className={`${styles.tl} ${styles.tlClose}`} />
          <span className={`${styles.tl} ${styles.tlMin}`} />
          <span className={`${styles.tl} ${styles.tlMax}`} />
        </div>
        <span className={styles.appBarTitle}>Creator Hub</span>
      </div>

      {/* ── Viewport ─────────────────────────────────────────────── */}
      <div className={styles.viewport}>

        {/* ── Sidebar: icon rail + language panel ────────────────── */}
        <div className={styles.sidebar}>
          <IconRail />

          <div className={styles.langPanel}>
            <div className={styles.langBack}>
              <ArrowLeft size={14} />
              <Link to="/localization" className={styles.langBackLink}>Back</Link>
            </div>
            <div className={styles.langDivider} />
            <div className={styles.langList}>
              {LANGUAGES.map((lang) => (
                <div
                  key={lang}
                  className={`${styles.langItem} ${lang === selectedLang ? styles.langItemActive : ''}`}
                  onClick={() => setSelectedLang(lang)}
                >
                  {lang}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Primary pane ─────────────────────────────────────── */}
        <div className={styles.primaryPane}>

          {/* Header bar */}
          <div className={styles.headerBar}>
            <div className={styles.headerLeading}>
              <button className={styles.headerMenuBtn} aria-label="Menu">
                <AlignLeft size={18} />
              </button>
              <nav className={styles.breadcrumb}>
                <Link to="/" className={styles.breadcrumbItem}>Create</Link>
                <span className={styles.breadcrumbSep}>/</span>
                <span className={styles.breadcrumbItem}>The Great Escape Monkey Game</span>
                <span className={styles.breadcrumbSep}>/</span>
                <span className={styles.breadcrumbItem}>Localization</span>
                <span className={styles.breadcrumbSep}>/</span>
                <span className={`${styles.breadcrumbItem} ${styles.breadcrumbActive}`}>Translation</span>
              </nav>
            </div>
            <div className={styles.headerTrailing}>
              <button className={styles.headerIconBtn} aria-label="Search">
                <Search size={18} />
              </button>
              <button className={styles.headerIconBtn} aria-label="Notifications">
                <Bell size={18} />
                <span className={styles.headerBadge}>9</span>
              </button>
              <img src={avatarImg} alt="User avatar" className={styles.avatar} />
            </div>
          </div>

          {/* Page title + tabs */}
          <div className={styles.pageHeader}>
            <div className={styles.titleRow}>
              <h1 className={styles.pageTitle}>Translate</h1>
            </div>
            <div className={styles.tabBar}>
              {TABS.map((tab) => (
                <button
                  key={tab}
                  className={`${styles.tab} ${tab === activeTab ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Body: middle pane (swaps per tab) + shared editor */}
          <div className={styles.body}>
            {renderMiddlePane()}

            {/* ── Shared editor pane ─────────────────────────────── */}
            <div className={styles.editorPane}>
              {renderEditorContent()}
            </div>
          </div>
        </div>
      </div>

      {/* ── Portals ─────────────────────────────────────────────── */}
      {glossaryPortal}
      {statusPortal}

      {/* ── Snackbar toast ──────────────────────────────────────── */}
      {showToast && <div className={styles.snackbar}>{toastMsg}</div>}

      {/* Hidden file input for Upload New Image */}
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/png,image/jpeg"
        className={styles.hiddenFileInput}
        onChange={handleFileSelected}
      />
    </div>

    {/* ── Feedback Modal ──────────────────────────────────────────────────── */}
    {feedbackOpen && createPortal(
      <>
        <div className={styles.feedbackBackdrop} onClick={() => setFeedbackOpen(false)} />
        <div className={styles.feedbackModal} role="dialog" aria-modal="true" aria-labelledby="fbTitle">

          {/* Header */}
          <div className={styles.feedbackHeader}>
            <span id="fbTitle" className={styles.feedbackTitle}>Give Roblox Feedback</span>
            <button className={styles.feedbackCloseBtn} onClick={() => setFeedbackOpen(false)} aria-label="Close">
              <X size={16} />
            </button>
          </div>

          {/* Thumbs row */}
          <div className={styles.feedbackVoteRow}>
            <button
              className={`${styles.feedbackVoteBtn} ${feedbackVote === 'up' ? styles.feedbackVoteBtnActive : ''}`}
              onClick={() => { setFeedbackVote('up'); setFeedbackChecks(new Set()); }}
              aria-pressed={feedbackVote === 'up'}
            >
              <ThumbsUp size={18} />
            </button>
            <button
              className={`${styles.feedbackVoteBtn} ${feedbackVote === 'down' ? styles.feedbackVoteBtnActive : ''}`}
              onClick={() => { setFeedbackVote('down'); setFeedbackChecks(new Set()); }}
              aria-pressed={feedbackVote === 'down'}
            >
              <ThumbsDown size={18} />
            </button>
          </div>

          {/* Body */}
          <div className={styles.feedbackBody}>
            <p className={styles.feedbackQuestion}>
              {feedbackVote === 'down'
                ? 'What is the problem with the translated image? *'
                : 'What went well with the translated image?'}
            </p>

            <div className={styles.feedbackOptions}>
              {(feedbackVote === 'down' ? DOWNVOTE_OPTIONS : UPVOTE_OPTIONS).map((opt) => (
                <label key={opt} className={styles.feedbackOption}>
                  <span
                    className={`${styles.feedbackCheckbox} ${feedbackChecks.has(opt) ? styles.feedbackCheckboxChecked : ''}`}
                    aria-hidden="true"
                  >
                    {feedbackChecks.has(opt) && <Check size={11} strokeWidth={3} />}
                  </span>
                  <input
                    type="checkbox"
                    className={styles.feedbackCheckboxInput}
                    checked={feedbackChecks.has(opt)}
                    onChange={() => toggleFeedbackCheck(opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>

            <div className={styles.feedbackAdditionalWrap}>
              <label className={styles.feedbackAdditionalLabel}>Additional details</label>
              <textarea
                className={styles.feedbackTextarea}
                placeholder="Take a moment to share more about what could be better"
                value={feedbackDetails}
                onChange={(e) => setFeedbackDetails(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className={styles.feedbackFooter}>
            <button className={styles.feedbackCancelBtn} onClick={() => setFeedbackOpen(false)}>
              Cancel
            </button>
            <button className={styles.feedbackSubmitBtn} onClick={handleFeedbackSubmit}>
              Submit
            </button>
          </div>

        </div>
      </>,
      document.body
    )}

    {/* ── Feedback Toast ───────────────────────────────────────────────────── */}
    {feedbackToast && createPortal(
      <div className={styles.feedbackToast}>
        <CheckCircle2 size={15} className={styles.feedbackToastIcon} />
        <span>Feedback submitted successfully. Thank you!</span>
      </div>,
      document.body
    )}

    {/* ── Ellipsis Popover (V2) ────────────────────────────────────────────── */}
    {imgMenuOpen && createPortal(
      <>
        <div className={styles.imgMenuBackdrop} onClick={() => setImgMenuOpen(false)} />
        <div className={styles.imgMenu} style={{ left: imgMenuPos.x, top: imgMenuPos.y }}>
          <button className={styles.imgMenuItem} onClick={handleRegenerate}>
            <RefreshCw size={14} className={styles.imgMenuIcon} />
            Regenerate Image
          </button>
          <button
            className={`${styles.imgMenuItem} ${styles.imgMenuItemFeedback}`}
            onClick={() => { setImgMenuOpen(false); openFeedback(); }}
          >
            <MessageSquare size={14} className={styles.imgMenuIcon} />
            Give Feedback
          </button>
          <button className={styles.imgMenuItem} onClick={handleEditImageText}>
            <FileEdit size={14} className={styles.imgMenuIcon} />
            Edit Image Text
          </button>
          <button className={styles.imgMenuItem} onClick={handleUploadNew}>
            <ImageUp size={14} className={styles.imgMenuIcon} />
            Upload New Image
          </button>
          <div className={styles.imgMenuDivider} />
          <button
            className={`${styles.imgMenuItem} ${styles.imgMenuItemDanger}`}
            onClick={() => { setImgMenuOpen(false); setDeleteModalOpen(true); }}
          >
            <Trash2 size={14} className={styles.imgMenuIcon} />
            Delete Image
          </button>
        </div>
      </>,
      document.body
    )}

    {/* ── Delete Confirmation Modal ────────────────────────────────────────── */}
    {deleteModalOpen && createPortal(
      <>
        <div className={styles.feedbackBackdrop} onClick={() => setDeleteModalOpen(false)} />
        <div className={styles.feedbackModal} role="dialog" aria-modal="true" aria-labelledby="delTitle">
          <div className={styles.feedbackHeader}>
            <span id="delTitle" className={styles.feedbackTitle}>Delete Translated Image?</span>
            <button className={styles.feedbackCloseBtn} onClick={() => setDeleteModalOpen(false)} aria-label="Close">
              <X size={16} />
            </button>
          </div>
          <div className={styles.deleteModalBody}>
            <p className={styles.deleteModalText}>
              This will permanently remove the current Japanese translation image for{' '}
              <strong>"Pizza Ad"</strong>. This action cannot be undone.
            </p>
          </div>
          <div className={styles.feedbackFooter}>
            <button className={styles.feedbackCancelBtn} onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </button>
            <button className={styles.deleteConfirmBtn} onClick={handleDeleteConfirm}>
              Delete
            </button>
          </div>
        </div>
      </>,
      document.body
    )}

    {/* ── Image Action Toast ───────────────────────────────────────────────── */}
    {imgActionToast && createPortal(
      <div className={styles.feedbackToast}>
        <CheckCircle2 size={15} className={styles.feedbackToastIcon} />
        <span>{imgActionToast}</span>
      </div>,
      document.body
    )}

    {/* ── Edit Image Text Modal ───────────────────────────────────────────── */}
    {editTextOpen && createPortal(
      <>
        <div className={styles.feedbackBackdrop} onClick={() => setEditTextOpen(false)} />
        <div className={styles.editModal} role="dialog" aria-modal="true" aria-labelledby="editTitle">

          {/* Header */}
          <div className={styles.editModalHeader}>
            <div className={styles.editModalHeaderLeft}>
              <span id="editTitle" className={styles.editModalTitle}>Edit Translated Text</span>
              <span className={styles.editModalSubtitle}>
                Drag to move · Arrow keys nudge 1px · ⇧ 10px · ⌘Z undo
              </span>
            </div>
            <button className={styles.feedbackCloseBtn} onClick={() => setEditTextOpen(false)} aria-label="Close">
              <X size={16} />
            </button>
          </div>

          {/* Body: canvas stage + properties panel */}
          <div className={styles.editModalBody}>

            {/* ── Left: Canvas Stage ── */}
            <div className={styles.editStage} onClick={() => setEditSelected(false)}>
              <div
                ref={editCanvasRef}
                className={styles.editCanvas}
                onClick={(e) => e.stopPropagation()}
              >
                <img src={sonicEnImg} alt="Source" className={styles.editCanvasBg} />
                <div
                  className={`${styles.editCanvasText} ${editSelected ? styles.editCanvasTextSelected : ''}`}
                  style={{
                    transform: `translate(calc(-50% + ${editTextPos.x}px), calc(-50% + ${editTextPos.y}px)) scaleX(${editTextStretch / 100})`,
                    fontSize: editTextSize,
                    fontFamily: editFontFamily,
                    fontWeight: editFontWeight,
                    fontStyle: editItalic ? 'italic' : 'normal',
                    color: editTextColor,
                    opacity: editTextOpacity / 100,
                  }}
                  onMouseDown={handleTextMouseDown}
                  onClick={(e) => { e.stopPropagation(); setEditSelected(true); }}
                  title="Click to select · Drag to reposition"
                >
                  {(editAllCaps ? editText.toUpperCase() : editText) || '\u00A0'}
                </div>
              </div>
              <p className={styles.editStageHint}>Click text to select · Drag to move</p>
            </div>

            {/* ── Right: Properties Panel ── */}
            <div className={styles.editPropsPanel}>

              {/* ── Section: Content */}
              <div className={styles.editPropSection}>
                <button className={styles.editPropHeader} onClick={() => setEditSecContent(p => !p)}>
                  <ChevronRight size={11} className={`${styles.editPropChevron} ${editSecContent ? styles.editPropChevronOpen : ''}`} />
                  <span>Content</span>
                </button>
                {editSecContent && (
                  <div className={styles.editPropBody}>
                    <textarea
                      className={styles.editPropTextarea}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={2}
                      placeholder="Enter translation…"
                    />
                  </div>
                )}
              </div>

              {/* ── Section: Transform */}
              <div className={styles.editPropSection}>
                <button className={styles.editPropHeader} onClick={() => setEditSecTransform(p => !p)}>
                  <ChevronRight size={11} className={`${styles.editPropChevron} ${editSecTransform ? styles.editPropChevronOpen : ''}`} />
                  <span>Transform</span>
                </button>
                {editSecTransform && (
                  <div className={styles.editPropBody}>
                    {/* 3×3 alignment grid */}
                    <div className={styles.editAlignLabel}>Alignment</div>
                    <div className={styles.editAlignGrid}>
                      {(['top', 'middle', 'bottom'] as const).flatMap(v =>
                        (['left', 'center', 'right'] as const).map(h => (
                          <button
                            key={`${v}-${h}`}
                            className={styles.editAlignBtn}
                            onClick={() => snapToAlign(h, v)}
                            title={`${v === 'middle' ? 'Middle' : v.charAt(0).toUpperCase() + v.slice(1)} ${h.charAt(0).toUpperCase() + h.slice(1)}`}
                            aria-label={`Snap ${v} ${h}`}
                          >
                            <span className={styles.editAlignDot} data-vpos={v} data-hpos={h} />
                          </button>
                        ))
                      )}
                    </div>

                    {/* Size row */}
                    <div className={styles.editPropRow}>
                      <span className={styles.editPropLabel}>Size</span>
                      <div className={styles.editSliderWithInput}>
                        <input
                          type="range" min={14} max={72} value={editTextSize}
                          onChange={(e) => setEditTextSize(Number(e.target.value))}
                          className={styles.editSlider}
                        />
                        <input
                          type="number" min={14} max={72} value={editTextSize}
                          onChange={(e) => setEditTextSize(Math.max(14, Math.min(72, Number(e.target.value))))}
                          className={styles.editNumInput}
                        />
                        <span className={styles.editPropUnit}>px</span>
                      </div>
                    </div>

                    {/* Stretch row */}
                    <div className={styles.editPropRow}>
                      <span className={styles.editPropLabel}>Stretch</span>
                      <div className={styles.editSliderWithInput}>
                        <input
                          type="range" min={80} max={120} value={editTextStretch}
                          onChange={(e) => setEditTextStretch(Number(e.target.value))}
                          className={styles.editSlider}
                        />
                        <input
                          type="number" min={80} max={120} value={editTextStretch}
                          onChange={(e) => setEditTextStretch(Math.max(80, Math.min(120, Number(e.target.value))))}
                          className={styles.editNumInput}
                        />
                        <span className={styles.editPropUnit}>%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Section: Text */}
              <div className={styles.editPropSection}>
                <button className={styles.editPropHeader} onClick={() => setEditSecText(p => !p)}>
                  <ChevronRight size={11} className={`${styles.editPropChevron} ${editSecText ? styles.editPropChevronOpen : ''}`} />
                  <span>Text</span>
                </button>
                {editSecText && (
                  <div className={styles.editPropBody}>
                    {/* Font Family + Weight on same row */}
                    <div className={styles.editFontRow}>
                      <select
                        value={editFontFamily}
                        onChange={(e) => setEditFontFamily(e.target.value)}
                        className={styles.editPropSelect}
                      >
                        <option value="sans-serif">Rubik</option>
                        <option value="'Noto Sans JP', sans-serif">Noto Sans JP</option>
                        <option value="'MS Gothic', monospace">MS Gothic</option>
                      </select>
                      <select
                        value={editFontWeight}
                        onChange={(e) => setEditFontWeight(e.target.value)}
                        className={`${styles.editPropSelect} ${styles.editPropSelectSm}`}
                      >
                        <option value="400">Regular</option>
                        <option value="500">Medium</option>
                        <option value="700">Bold</option>
                        <option value="900">Black</option>
                      </select>
                    </div>

                    {/* Format toggles: B I TT */}
                    <div className={styles.editFormatRow}>
                      <button
                        className={`${styles.editFormatBtn} ${Number(editFontWeight) >= 700 ? styles.editFormatBtnActive : ''}`}
                        onClick={() => setEditFontWeight(p => Number(p) >= 700 ? '400' : '700')}
                        title="Bold"
                        style={{ fontWeight: 700 }}
                      >B</button>
                      <button
                        className={`${styles.editFormatBtn} ${editItalic ? styles.editFormatBtnActive : ''}`}
                        onClick={() => setEditItalic(p => !p)}
                        title="Italic"
                        style={{ fontStyle: 'italic' }}
                      >I</button>
                      <button
                        className={`${styles.editFormatBtn} ${editAllCaps ? styles.editFormatBtnActive : ''}`}
                        onClick={() => setEditAllCaps(p => !p)}
                        title="All Caps"
                        style={{ fontSize: 10, letterSpacing: '0.04em' }}
                      >TT</button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Section: Appearance */}
              <div className={styles.editPropSection}>
                <button className={styles.editPropHeader} onClick={() => setEditSecAppearance(p => !p)}>
                  <ChevronRight size={11} className={`${styles.editPropChevron} ${editSecAppearance ? styles.editPropChevronOpen : ''}`} />
                  <span>Appearance</span>
                </button>
                {editSecAppearance && (
                  <div className={styles.editPropBody}>
                    <div className={styles.editPropRow}>
                      <span className={styles.editPropLabel}>Fill</span>
                      <div className={styles.editFillRow}>
                        {/* Circular color swatch */}
                        <button
                          className={styles.editColorCircle}
                          style={{ background: editTextColor }}
                          onClick={() => colorInputRef.current?.click()}
                          title="Pick color"
                          aria-label="Pick text color"
                        />
                        <input
                          ref={colorInputRef}
                          type="color"
                          value={editTextColor}
                          onChange={(e) => setEditTextColor(e.target.value)}
                          className={styles.editColorInput}
                          tabIndex={-1}
                        />
                        {/* Editable hex input */}
                        <input
                          type="text"
                          value={editTextColor.toUpperCase()}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setEditTextColor(v);
                          }}
                          className={styles.editHexInput}
                          maxLength={7}
                          spellCheck={false}
                        />
                        {/* Opacity number input */}
                        <input
                          type="number" min={0} max={100}
                          value={editTextOpacity}
                          onChange={(e) => setEditTextOpacity(Math.max(0, Math.min(100, Number(e.target.value))))}
                          className={styles.editOpacityInput}
                        />
                        <span className={styles.editPropUnit}>%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className={styles.editModalFooter}>
            <button className={styles.feedbackCancelBtn} onClick={() => setEditTextOpen(false)}>
              Cancel
            </button>
            <button className={styles.feedbackSubmitBtn} onClick={handleSaveTranslation}>
              Save Translation
            </button>
          </div>

        </div>
      </>,
      document.body
    )}

    {/* ── Feature Flag Modal ([ key) ───────────────────────────────────────── */}
    {imgFlagOpen && createPortal(
      <div
        className={styles.imgFlagModal}
        style={{ left: imgFlagPos.x, top: imgFlagPos.y }}
      >
        <div className={styles.imgFlagHeader} onMouseDown={onImgFlagDragStart}>
          <span className={styles.imgFlagTitle}>⚑ Feature Flags</span>
          <button className={styles.imgFlagClose} onClick={() => setImgFlagOpen(false)} aria-label="Close">
            <X size={13} />
          </button>
        </div>
        <p className={styles.imgFlagSubtext}>
          Override feature flags locally. Drag around. Only visible to Roblox employees.
        </p>
        <div className={styles.imgFlagGroup}>
          <div className={styles.imgFlagRow}>
            <div className={styles.imgFlagInfo}>
              <code className={styles.imgFlagName}>imageTranslationFlowV2</code>
              <span className={styles.imgFlagDesc}>
                Enables ellipsis menu with Regenerate, Give Feedback, Edit, Upload, Delete actions
              </span>
            </div>
            <button
              className={`${styles.imgFlagToggle} ${imgFlowV2 ? styles.imgFlagToggleOn : ''}`}
              onClick={() => setImgFlowV2(p => !p)}
              role="switch"
              aria-checked={imgFlowV2}
            >
              <span className={styles.imgFlagKnob} />
            </button>
          </div>
        </div>
      </div>,
      document.body
    )}

    </>
  );
}

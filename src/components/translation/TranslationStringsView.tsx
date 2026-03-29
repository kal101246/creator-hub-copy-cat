import { Fragment, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, Link } from 'react-router-dom';
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
            {/* Translated card */}
            <div className={styles.imgCompareCard}>
              <div className={styles.imgCheckerboard}>
                {img.hasRealImages
                  ? <img src={sonicJaImg} alt="Translated" className={styles.imgCardImg} />
                  : <div className={styles.imgCardPlaceholder} style={{ background: img.thumbGradient, opacity: 0.7 }} />}
              </div>
              <div className={styles.imgCardFooter}>
                <div>
                  <div className={styles.imgCardLabel}>Translated Image</div>
                  <div className={styles.imgCardDesc}>{img.translatedDesc}</div>
                </div>
                <button className={styles.iconBtn} aria-label="Download translated image">
                  <Download size={14} />
                </button>
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
    </div>
  );
}

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LocalizationSettings from '../settings/LocalizationSettings';
import {
  ChevronRight,
  ChevronDown,
  Search,
  Bell,
  AlignLeft,
  SlidersHorizontal,
  MoreHorizontal,
  Plus,
  Info,
} from 'lucide-react';
import type { GlossaryFlowState, GlossaryFlowActions } from '../../hooks/useGlossaryFlow';
import GlossaryTable from './GlossaryTable';
import CreateRulePanel from './CreateRulePanel';
import DeleteRuleModal from './DeleteRuleModal';
import IconRail from '../shared/IconRail';
import styles from './GlossaryView.module.css';
import avatarImg from '../../assets/avatar.png';
import translateIcon from '../../assets/translate_icon.svg';
import translateFrame from '../../assets/translate_frame.svg';

const TABS = [
  'Languages',
  'Glossary',
  'Translators',
  'Reports',
  'Settings',
  'Table Management',
] as const;

type TabName = (typeof TABS)[number];

// ── Languages tab mock data ───────────────────────────────────────────────────

interface LangEntry {
  id: string;
  name: string;
  completion: number;
  autoStrings: 'on' | 'off' | 'na';
  autoInfo: 'on' | 'off' | 'na';
}

const LANGUAGES: LangEntry[] = [
  { id: 'zh-cn', name: 'Chinese (Simplified)',  completion: 100, autoStrings: 'on',  autoInfo: 'on' },
  { id: 'zh-tw', name: 'Chinese (Traditional)', completion: 2,   autoStrings: 'on',  autoInfo: 'on' },
  { id: 'nl',    name: 'Dutch',                 completion: 0,   autoStrings: 'na',  autoInfo: 'na' },
  { id: 'et',    name: 'Estonian',              completion: 0,   autoStrings: 'na',  autoInfo: 'na' },
  { id: 'fr',    name: 'French',                completion: 100, autoStrings: 'on',  autoInfo: 'on' },
  { id: 'de',    name: 'German',                completion: 100, autoStrings: 'on',  autoInfo: 'on' },
  { id: 'id',    name: 'Indonesian',            completion: 100, autoStrings: 'on',  autoInfo: 'on' },
  { id: 'it',    name: 'Italian',               completion: 100, autoStrings: 'on',  autoInfo: 'on' },
  { id: 'ja',    name: 'Japanese',              completion: 100, autoStrings: 'on',  autoInfo: 'on' },
  { id: 'ko',    name: 'Korean',                completion: 100, autoStrings: 'on',  autoInfo: 'on' },
  { id: 'pl',    name: 'Polish',                completion: 100, autoStrings: 'on',  autoInfo: 'on' },
  { id: 'pt',    name: 'Portuguese',            completion: 100, autoStrings: 'on',  autoInfo: 'on' },
  { id: 'ru',    name: 'Russian',               completion: 100, autoStrings: 'on',  autoInfo: 'on' },
  { id: 'es',    name: 'Spanish',               completion: 100, autoStrings: 'on',  autoInfo: 'on' },
  { id: 'th',    name: 'Thai',                  completion: 84,  autoStrings: 'off', autoInfo: 'on' },
  { id: 'tr',    name: 'Turkish',               completion: 100, autoStrings: 'on',  autoInfo: 'on' },
  { id: 'vi',    name: 'Vietnamese',            completion: 100, autoStrings: 'on',  autoInfo: 'on' },
];

// ── SVG circular progress ring ────────────────────────────────────────────────

function ProgressRing({ pct, size = 64 }: { pct: number; size?: number }) {
  const r = size / 2 - 6;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="rgba(208,217,251,0.1)"
        strokeWidth="5"
      />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="5"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <text
        x={cx} y={cy + 5}
        textAnchor="middle"
        fill="var(--content-emphasis)"
        fontSize="13"
        fontWeight="700"
        fontFamily="inherit"
      >
        {pct}%
      </text>
    </svg>
  );
}

interface NavGroup {
  label: string;
  hasChildren?: boolean;
  expanded?: boolean;
  children?: string[];
  path?: string;
}

const INITIAL_NAV_GROUPS: NavGroup[] = [
  { label: 'Overview', path: '/experience/overview' },
  { label: 'Configure', hasChildren: true },
  { label: 'Analytics', hasChildren: true },
  { label: 'Monetization', hasChildren: true },
  { label: 'Monitoring', hasChildren: true },
  { label: 'Activity History' },
  {
    label: 'Audience',
    hasChildren: true,
    expanded: true,
    children: [
      'Feedback',
      'Access Settings',
      'Communication Settings',
      'Maturity & Compliance',
      'Localization',
    ],
  },
  { label: 'Engagement', hasChildren: true },
  { label: 'Moderation', hasChildren: true },
  { label: 'Promotion', hasChildren: true },
];

type Props = Pick<
  GlossaryFlowState,
  'isPanelOpen' | 'isEditing' | 'rules' | 'showSuccessToast' | 'draftRule' | 'isDeleteModalOpen'
> &
  Pick<
    GlossaryFlowActions,
    | 'openPanel'
    | 'closePanel'
    | 'updateDraft'
    | 'submitRule'
    | 'editRule'
    | 'openDeleteModal'
    | 'closeDeleteModal'
    | 'deleteRule'
  >;

export default function GlossaryView({
  openPanel,
  isPanelOpen,
  isEditing,
  closePanel,
  draftRule,
  updateDraft,
  submitRule,
  editRule,
  openDeleteModal,
  closeDeleteModal,
  deleteRule,
  rules,
  showSuccessToast,
  isDeleteModalOpen,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabName>('Languages');
  const navigate = useNavigate();

  // ── Nav accordion state ────────────────────────────────────────
  const [navGroups, setNavGroups] = useState<NavGroup[]>(INITIAL_NAV_GROUPS);
  const toggleGroup = useCallback((label: string) => {
    setNavGroups(prev =>
      prev.map(g => g.label === label ? { ...g, expanded: !g.expanded } : g)
    );
  }, []);

  // ── Languages tab state ────────────────────────────────────────
  const [sourceLang, setSourceLang] = useState('en');
  const [selectedLang, setSelectedLang] = useState<string | null>(null);

  // ── Translators tab state ──────────────────────────────────────
  const [transView, setTransView] = useState<'Users' | 'Groups'>('Users');

  // ── Reports tab state ──────────────────────────────────────────
  const [reportRange, setReportRange] = useState('');

  // ── Translators mock data ──────────────────────────────────────
  const MOCK_TRANSLATORS = [
    { id: '1', name: 'Caelestene', handle: '@caelestene_rblx', initials: 'CE', color: '#6d28d9' },
    { id: '2', name: 'kal101246',  handle: '@kal101246',        initials: 'KA', color: '#1d4ed8' },
  ];

  const hasRules = rules.length > 0;
  const filteredRules = searchQuery
    ? rules.filter(
        (r) =>
          r.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.translatedTerm.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : rules;

  return (
    <div className={styles.shell}>
      {/* ── App Bar ──────────────────────────────────────────── */}
      <div className={styles.appBar}>
        <div className={styles.trafficLights}>
          <span className={`${styles.tl} ${styles.tlClose}`} />
          <span className={`${styles.tl} ${styles.tlMin}`} />
          <span className={`${styles.tl} ${styles.tlMax}`} />
        </div>
        <span className={styles.appBarTitle}>Creator Hub</span>
        <div aria-hidden="true" />
      </div>

      {/* ── Viewport ─────────────────────────────────────────── */}
      <div className={styles.viewport}>
        {/* ── Sidebar ──────────────────────────────────────── */}
        <div className={styles.sidebar}>
          {/* Shared icon rail */}
          <IconRail />

          {/* Nav Tree */}
          <div className={styles.navTree}>
            <div className={styles.navBack} onClick={() => navigate('/experience/overview')}>
              <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} />
              Back
            </div>
            <div className={styles.navBody}>
              {navGroups.map((group) => (
                <div key={group.label}>
                  <div
                    className={styles.navItem}
                    onClick={() => {
                      if (group.path) navigate(group.path);
                      else if (group.hasChildren) toggleGroup(group.label);
                    }}
                  >
                    <span>{group.label}</span>
                    {group.hasChildren && (
                      <ChevronRight
                        size={14}
                        className={`${styles.navChevron} ${group.expanded ? styles.navChevronOpen : ''}`}
                      />
                    )}
                  </div>
                  {group.expanded && group.children && (
                    <div className={styles.navChildList}>
                      {group.children.map((child) => (
                        <div
                          key={child}
                          className={`${styles.navChild} ${child === 'Localization' ? styles.navChildActive : ''}`}
                        >
                          {child}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Primary Pane ─────────────────────────────────── */}
        <div className={styles.primaryPane}>
          {/* Header Bar */}
          <div className={styles.headerBar}>
            <div className={styles.headerLeading}>
              <button className={styles.headerMenuBtn}>
                <AlignLeft size={18} />
              </button>
              <nav className={styles.breadcrumb}>
                <span className={styles.breadcrumbItem}>Create</span>
                <span className={styles.breadcrumbSep}>/</span>
                <span className={styles.breadcrumbItem}>
                  The Great Escape Monkey Game
                  <ChevronDown size={14} />
                </span>
                <span className={styles.breadcrumbSep}>/</span>
                <span className={`${styles.breadcrumbItem} ${styles.breadcrumbActive}`}>
                  Localization
                </span>
              </nav>
            </div>
            <div className={styles.headerTrailing}>
              <button className={styles.headerIconBtn}>
                <Search size={18} />
              </button>
              <button className={styles.headerIconBtn}>
                <Bell size={18} />
                <span className={styles.headerBadge}>9</span>
              </button>
              <img src={avatarImg} alt="User avatar" className={styles.avatar} />
            </div>
          </div>

          {/* Scrollable content */}
          <div className={styles.content}>
            {/* Page Header — titleRow + tabs only; border-bottom sits under tabs */}
            <div className={styles.pageHeader}>
              <div className={styles.titleRow}>
                <h1 className={styles.pageTitle}>Localization</h1>
                <button className={styles.translateBtn} onClick={() => navigate('/translate?tab=information')}>Translate</button>
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

            {/* Filter row — only on Glossary tab when rules exist */}
            {activeTab === 'Glossary' && hasRules && (
              <div className={styles.filterRow}>
                <div className={styles.filterLeft}>
                  <label className={styles.searchWrap}>
                    <Search size={14} className={styles.searchIcon} />
                    <input
                      className={styles.searchInput}
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </label>
                  <button className={styles.filterBtn}>
                    <SlidersHorizontal size={14} />
                    Filter
                  </button>
                </div>
                <div className={styles.filterRight}>
                  <button className={styles.btnStandard} onClick={openPanel}>
                    Create Rule
                  </button>
                  <button className={styles.btnStandard}>Upload .csv</button>
                  <button className={styles.filterOverflowBtn}>
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Body — per-tab content */}
            {activeTab === 'Languages' ? (
              /* ─── Languages ────────────────────────────────────── */
              <div className={styles.tabContent}>

                {/* ── Quota Visualization ─────────────────────────── */}
                <div className={styles.quotaSection}>
                  <h3 className={styles.quotaSectionTitle}>Automatic Translation Quotas</h3>
                  <div className={styles.quotaCards}>
                    <div className={styles.quotaCard}>
                      <ProgressRing pct={0} size={60} />
                      <div className={styles.quotaInfo}>
                        <span className={styles.quotaValue}>0/2.8M</span>
                        <span className={styles.quotaLabel}>Initial Quota</span>
                      </div>
                    </div>
                    <div className={styles.quotaCard}>
                      <ProgressRing pct={0} size={60} />
                      <div className={styles.quotaInfo}>
                        <span className={styles.quotaValue}>0/550K</span>
                        <span className={styles.quotaLabel}>Monthly Quota</span>
                      </div>
                    </div>
                  </div>
                  <p className={styles.quotaCaption}>
                    Your monthly quota renews on: 4/1/2026{' '}
                    <a href="#" className={styles.quotaLink}>Learn More</a>
                  </p>
                </div>

                {/* ── Source Language ─────────────────────────────── */}
                <div className={styles.sourceLangSection}>
                  <div className={styles.sourceLangLabelRow}>
                    <span className={styles.sourceLangLabel}>Source Language</span>
                    <button className={styles.infoIconBtn} aria-label="About source language" type="button">
                      <Info size={14} />
                    </button>
                  </div>
                  <div className={styles.sourceLangSelectWrap}>
                    <select
                      className={styles.sourceLangSelect}
                      value={sourceLang}
                      onChange={(e) => setSourceLang(e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="ja">Japanese</option>
                      <option value="es">Spanish</option>
                    </select>
                    <ChevronDown size={14} className={styles.sourceLangChevron} />
                  </div>
                  <span className={styles.sourceLangHint}>Select Source Language</span>
                </div>

                {/* ── Supported Languages ─────────────────────────── */}
                <div className={styles.langSection}>
                  <div className={styles.langSectionHeader}>
                    <span className={styles.langSectionTitle}>Supported Languages</span>
                    <button className={styles.addLangBtn}>
                      Add Language
                      <Plus size={13} />
                    </button>
                  </div>

                  <div className={styles.langList}>
                    {LANGUAGES.map((lang) => (
                      <div
                        key={lang.id}
                        className={`${styles.langRow} ${selectedLang === lang.id ? styles.langRowActive : ''}`}
                        onClick={() => setSelectedLang(lang.id === selectedLang ? null : lang.id)}
                      >
                        {/* Left: name + completion */}
                        <div className={styles.langLeft}>
                          <span className={styles.langName}>{lang.name}</span>
                          <span className={`${styles.langPct} ${lang.completion === 100 ? styles.langPctFull : ''}`}>
                            {lang.completion}% Complete
                          </span>
                        </div>

                        {/* Right: auto translation status */}
                        <div className={styles.langRight}>
                          {lang.autoStrings === 'na' ? (
                            <span className={styles.autoNA}>Auto Translation: Not Available</span>
                          ) : (
                            <div className={styles.autoBlock}>
                              <div className={styles.autoRow}>
                                <span className={styles.autoRowLabel}>Auto Translation:</span>
                              </div>
                              <div className={styles.autoRow}>
                                <span className={styles.autoRowLabel}>Experience Strings &amp; Products:</span>
                                <span className={lang.autoStrings === 'on' ? styles.autoOn : styles.autoOff}>
                                  {lang.autoStrings === 'on' ? 'On' : 'Off'}
                                </span>
                              </div>
                              <div className={styles.autoRow}>
                                <span className={styles.autoRowLabel}>Experience Information:</span>
                                <span className={lang.autoInfo === 'on' ? styles.autoOn : styles.autoOff}>
                                  {lang.autoInfo === 'on' ? 'On' : 'Off'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Three-dot menu */}
                        <button
                          className={styles.rowMenuBtn}
                          aria-label="More options"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : activeTab === 'Settings' ? (
              <LocalizationSettings />
            ) : activeTab === 'Translators' ? (
              /* ─── Translators ─────────────────────────────────── */
              <div className={styles.tabContent}>
                <div className={styles.translatorsToolbar}>
                  {/* Pill toggle */}
                  <div className={styles.pillGroup}>
                    {(['Users', 'Groups'] as const).map((v) => (
                      <button
                        key={v}
                        className={`${styles.pillBtn} ${transView === v ? styles.pillBtnActive : ''}`}
                        onClick={() => setTransView(v)}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  {/* Actions */}
                  <div className={styles.translatorsActions}>
                    <button className={styles.btnStandard}>Share link</button>
                    <button className={styles.inviteLink}>
                      <Plus size={14} />
                      Invite Translators
                    </button>
                  </div>
                </div>
                <div className={styles.tabDivider} />
                <div className={styles.translatorList}>
                  {MOCK_TRANSLATORS.map((t) => (
                    <div key={t.id} className={styles.translatorRow}>
                      <div
                        className={styles.translatorAvatar}
                        style={{ background: t.color }}
                        aria-hidden="true"
                      >
                        {t.initials}
                      </div>
                      <div className={styles.translatorInfo}>
                        <span className={styles.translatorName}>{t.name}</span>
                        <span className={styles.translatorHandle}>{t.handle}</span>
                      </div>
                      <button className={styles.rowMenuBtn} aria-label="More options">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : activeTab === 'Reports' ? (
              /* ─── Reports ──────────────────────────────────────── */
              <div className={styles.tabContent}>
                <h2 className={styles.reportsHeading}>
                  Download translation contribution reports
                </h2>
                <div className={styles.reportsForm}>
                  <div className={styles.selectWrap}>
                    <select
                      className={styles.selectInput}
                      value={reportRange}
                      onChange={(e) => setReportRange(e.target.value)}
                      aria-label="Select date range"
                    >
                      <option value="">Select Date Range</option>
                      <option value="7">Last 7 days</option>
                      <option value="30">Last 30 days</option>
                      <option value="90">Last 90 days</option>
                      <option value="365">Last year</option>
                    </select>
                    <ChevronDown size={14} className={styles.selectChevron} />
                  </div>
                  <button
                    className={styles.btnPrimary}
                    disabled={!reportRange}
                    aria-disabled={!reportRange}
                  >
                    Download
                  </button>
                </div>
              </div>
            ) : activeTab === 'Table Management' ? (
              /* ─── Table Management ─────────────────────────────── */
              <div className={styles.tabContent}>
                {/* Row 1 — Upload */}
                <div className={styles.tableManagementRow}>
                  <div className={styles.tableManagementInfo}>
                    <h3 className={styles.tableManagementTitle}>Upload table</h3>
                    <p className={styles.tableManagementDesc}>
                      Upload a CSV file to add or update translation entries in bulk.
                      Existing entries that match a key will be overwritten.
                    </p>
                  </div>
                  <button className={styles.btnStandard}>Upload CSV</button>
                </div>
                <div className={styles.tabDivider} />
                {/* Row 2 — Download */}
                <div className={styles.tableManagementRow}>
                  <div className={styles.tableManagementInfo}>
                    <h3 className={styles.tableManagementTitle}>Download table</h3>
                    <p className={styles.tableManagementDesc}>
                      Export all current translations as a CSV file for offline editing
                      or backup.
                    </p>
                  </div>
                  <button className={styles.btnGhost}>Download CSV</button>
                </div>
                <div className={styles.tabDivider} />
                {/* Row 3 — Delete */}
                <div className={styles.tableManagementRow}>
                  <div className={styles.tableManagementInfo}>
                    <h3 className={`${styles.tableManagementTitle} ${styles.tableManagementTitleDanger}`}>
                      Delete table
                    </h3>
                    <p className={styles.tableManagementDesc}>
                      Permanently delete all translation entries. This action cannot be
                      undone and will remove all translations across every language.
                    </p>
                  </div>
                  <button className={styles.btnDanger}>Delete Table</button>
                </div>
              </div>
            ) : hasRules ? (
              <div className={styles.bodyTable}>
                <GlossaryTable
                  rules={filteredRules}
                  onEditRule={editRule}
                  onDeleteRule={openDeleteModal}
                />
              </div>
            ) : (
              <div className={styles.body}>
                <div className={styles.emptyState}>
                  <div className={styles.emptyIconWrap}>
                    <div className={styles.iconCardBg} />
                    <img src={translateFrame} alt="" className={styles.iconFrame} />
                    <img src={translateIcon} alt="" className={styles.iconSymbol} />
                  </div>
                  <div className={styles.emptyText}>
                    <h2 className={styles.emptyHeading}>
                      Improve translations with the glossary
                    </h2>
                    <p className={styles.emptyBody}>
                      Create rules for frequently used terms in your experience and provide
                      notes on how to translate them.{' '}
                      <a href="#" className={styles.emptyLink}>
                        Learn More
                      </a>
                    </p>
                  </div>
                  <div className={styles.emptyActions}>
                    <button className={styles.btnStandard} onClick={openPanel}>
                      Create Rule
                    </button>
                    <button className={styles.btnStandard}>Upload .csv</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Slide-in panel ───────────────────────────────────────── */}
      <CreateRulePanel
        isPanelOpen={isPanelOpen}
        isEditing={isEditing}
        closePanel={closePanel}
        draftRule={draftRule}
        updateDraft={updateDraft}
        submitRule={submitRule}
      />

      {/* ── Delete confirmation modal ─────────────────────────────── */}
      {isDeleteModalOpen && (
        <DeleteRuleModal
          closeDeleteModal={closeDeleteModal}
          deleteRule={deleteRule}
        />
      )}

      {/* ── Success toast ─────────────────────────────────────────── */}
      {showSuccessToast && (
        <div className={styles.toast}>
          <span className={styles.toastText}>
            {isEditing ? 'Translation rule updated' : 'Created translation rule'}
          </span>
        </div>
      )}
    </div>
  );
}

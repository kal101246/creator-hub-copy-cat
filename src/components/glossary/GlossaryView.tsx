import {
  ChevronRight,
  ChevronDown,
  Search,
  Bell,
  AlignLeft,
  Home,
  Video,
  User,
  ShoppingBag,
  Activity,
  MessageSquare,
  Gamepad2,
  BarChart2,
  Megaphone,
  LayoutGrid,
} from 'lucide-react';
import type { GlossaryFlowState, GlossaryFlowActions } from '../../hooks/useGlossaryFlow';
import GlossaryTable from './GlossaryTable';
import CreateRulePanel from './CreateRulePanel';
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

const ACTIVE_TAB = 'Glossary';

const ICON_RAIL_ITEMS = [Home, Video, User, ShoppingBag, Activity, MessageSquare, Gamepad2, BarChart2, Megaphone];

interface NavGroup {
  label: string;
  hasChildren?: boolean;
  expanded?: boolean;
  children?: string[];
}

const NAV_GROUPS: NavGroup[] = [
  { label: 'Overview', hasChildren: true },
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

type Props = Pick<GlossaryFlowState, 'isPanelOpen' | 'rules' | 'showSuccessToast' | 'draftRule'> &
  Pick<GlossaryFlowActions, 'openPanel' | 'closePanel' | 'updateDraft'>;

export default function GlossaryView({ openPanel, isPanelOpen, closePanel, draftRule, updateDraft }: Props) {
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
      </div>

      {/* ── Viewport ─────────────────────────────────────────── */}
      <div className={styles.viewport}>
        {/* ── Sidebar ──────────────────────────────────────── */}
        <div className={styles.sidebar}>
          {/* Icon Rail */}
          <div className={styles.iconRail}>
            <div className={styles.iconRailTop}>
              {ICON_RAIL_ITEMS.map((Icon, i) => (
                <button key={i} className={styles.iconRailBtn}>
                  <Icon size={18} />
                </button>
              ))}
            </div>
            <div className={styles.iconRailBottom}>
              <button className={styles.iconRailBtn}>
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>

          {/* Nav Tree */}
          <div className={styles.navTree}>
            <div className={styles.navBack}>
              <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} />
              Back
            </div>
            <div className={styles.navBody}>
              {NAV_GROUPS.map((group) => (
                <div key={group.label}>
                  <div className={styles.navItem}>
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
            {/* Page Header */}
            <div className={styles.pageHeader}>
              <div className={styles.titleRow}>
                <h1 className={styles.pageTitle}>Localization</h1>
                <button className={styles.translateBtn}>Translate</button>
              </div>
              <div className={styles.tabBar}>
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    className={`${styles.tab} ${tab === ACTIVE_TAB ? styles.tabActive : ''}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className={styles.body}>
              <div className={styles.emptyState}>
                <div className={styles.emptyIconWrap}>
                  {/* Layer 1 – dark rotated card background */}
                  <div className={styles.iconCardBg} />
                  {/* Layer 2 – tilted border frame (rotation baked into SVG path) */}
                  <img src={translateFrame} alt="" className={styles.iconFrame} />
                  {/* Layer 3 – translate symbol centered on top */}
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
          </div>
        </div>
      </div>

      {/* Scaffolded sub-components (UI not yet built) */}
      <GlossaryTable />
      <CreateRulePanel
        isPanelOpen={isPanelOpen}
        closePanel={closePanel}
        draftRule={draftRule}
        updateDraft={updateDraft}
      />
    </div>
  );
}

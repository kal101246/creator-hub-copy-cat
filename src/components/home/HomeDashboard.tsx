import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  ChevronDown,
  ChevronRight,
  TriangleAlert,
  Download,
  MoreHorizontal,
  Heart,
  MessageSquare,
  X,
  Zap,
  Pencil,
  AlignLeft,
  Home,
  Folder,
  BookOpen,
  ShoppingBag,
  MessageCircle,
  BellRing,
  DollarSign,
  BarChart2,
  Megaphone,
  LayoutGrid,
  Globe,
  ChevronsRight,
  ChevronsLeft,
  type LucideIcon,
} from 'lucide-react';
import styles from './HomeDashboard.module.css';
import IconRail from '../shared/IconRail';
import avatarImg from '../../assets/avatar.png';
import heroImg from '../../assets/home_hero.png';
import learnCagingImg from '../../assets/learn_caging.png';
import learnNocodeImg from '../../assets/learn_nocode.png';
import learnModulesImg from '../../assets/learn_modules.png';

// ─── Static data ───────────────────────────────────────────────────────────────

const EXPERIENCE_STATS = [
  { label: 'Daily active users', value: '--' },
  { label: 'D1 retention',       value: '--' },
  { label: 'Daily revenue',      value: '--' },
  { label: 'Avg. playtime',      value: '--' },
];

const LEARN_CARDS = [
  {
    id: 'l1',
    title: 'Caging',
    desc: 'Control how accessories fit onto your avatar character mesh',
    img: learnCagingImg,
  },
  {
    id: 'l2',
    title: 'No code required',
    desc: 'Build interactive experiences without writing any code at all',
    img: learnNocodeImg,
  },
  {
    id: 'l3',
    title: 'Module scripts',
    desc: 'Organize your Lua code into reusable, modular components',
    img: learnModulesImg,
  },
];

interface UpdateEntry {
  id: string;
  title: string;
  likes: string;
  comments: string;
  tags: string[];
  thumb: string | null;
}

const UPDATES: UpdateEntry[] = [
  {
    id: 'u1',
    title: 'Custom formula for terrain generation',
    likes: '82.5k', comments: '47',
    tags: [],
    thumb: 'https://www.figma.com/api/mcp/asset/a6f079f8-4d1d-469f-bd91-01823e0ebb01',
  },
  {
    id: 'u2',
    title: 'Creator Roadmap: 2025 End of Year Recap',
    likes: '74.9k', comments: '58',
    tags: ['#studio', '#monetization'],
    thumb: null,
  },
  {
    id: 'u3',
    title: 'Making Avatar Rendering More Performant',
    likes: '91.3k', comments: '36',
    tags: [],
    thumb: 'https://www.figma.com/api/mcp/asset/1a6ab5af-25d8-4be5-8804-cc9a5c022152',
  },
  {
    id: 'u4',
    title: 'Logitech Device Issues with Roblox Studio',
    likes: '88.6k', comments: '54',
    tags: ['#studio', '#monetization'],
    thumb: null,
  },
  {
    id: 'u5',
    title: 'Apply to attend RDC 2026',
    likes: '72.4k', comments: '11',
    tags: [],
    thumb: null,
  },
  {
    id: 'u6',
    title: 'Introducing new tools to manage your game community',
    likes: '97.8k', comments: '22',
    tags: ['#studio', '#monetization'],
    thumb: 'https://www.figma.com/api/mcp/asset/03af7d5a-f2fb-4c48-9531-5a61a088463e',
  },
];

interface NavEntry {
  icon: LucideIcon;
  label: string;
  path?: string;
  active?: boolean;
}

const TOP_NAV: NavEntry[] = [
  { icon: Home,          label: 'Home',      path: '/home', active: true },
  { icon: Folder,        label: 'Creations', path: '/experience/overview' },
  { icon: BookOpen,      label: 'Learn' },
  { icon: ShoppingBag,   label: 'Store' },
  { icon: MessageCircle, label: 'Forum' },
  { icon: BellRing,      label: 'Updates' },
];

const MID_NAV: NavEntry[] = [
  { icon: DollarSign, label: 'Finances' },
  { icon: BarChart2,  label: 'Analytics' },
  { icon: Megaphone,  label: 'Ads' },
  { icon: LayoutGrid, label: 'All tools' },
];

const FOOTER_NAV: NavEntry[] = [
  { icon: Globe,   label: 'Roblox.com' },
  { icon: Pencil,  label: 'Studio' },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function HomeDashboard() {
  const navigate = useNavigate();
  const [isUpdatesOpen, setIsUpdatesOpen] = useState(true);

  return (
    <div className={styles.shell}>

      {/* ── App Bar ──────────────────────────────────────────────────── */}
      <div className={styles.appBar}>
        <div className={styles.trafficLights}>
          <span className={`${styles.tl} ${styles.tlClose}`} />
          <span className={`${styles.tl} ${styles.tlMin}`} />
          <span className={`${styles.tl} ${styles.tlMax}`} />
        </div>
        <span className={styles.appBarTitle}>Creator Hub</span>
        <div />
      </div>

      {/* ── Viewport ─────────────────────────────────────────────────── */}
      <div className={styles.viewport}>

        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <aside className={styles.sidebar}>

          {/* Slim icon rail — shared component, identical to Experience Overview & Localization */}
          <IconRail />

          {/* Nav tree — Creator Hub global navigation */}
          <div className={styles.navTree}>

            {/* Game / profile switcher — nav tree header */}
            <button className={styles.navGameHeader}>
              <div className={styles.navGameIcon} aria-hidden="true">🌿</div>
              <span className={styles.navGameName}>the great escape monkey game.</span>
              <ChevronDown size={13} className={styles.navGameChevron} />
            </button>

            {/* Top nav group */}
            <nav className={styles.navBody}>
              {TOP_NAV.map(({ icon: Icon, label, path, active }) => (
                <button
                  key={label}
                  className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                  onClick={() => path && navigate(path)}
                >
                  <Icon size={15} className={styles.navItemIcon} />
                  <span className={styles.navItemLabel}>{label}</span>
                </button>
              ))}
            </nav>

            <div className={styles.navDivider} />

            {/* Middle nav group */}
            <nav className={styles.navBody}>
              {MID_NAV.map(({ icon: Icon, label }) => (
                <button key={label} className={styles.navItem}>
                  <Icon size={15} className={styles.navItemIcon} />
                  <span className={styles.navItemLabel}>{label}</span>
                </button>
              ))}
            </nav>

            {/* Footer items pinned to bottom */}
            <div className={styles.navSpacer} />
            <div className={styles.navDivider} />
            <nav className={styles.navBody} style={{ paddingBottom: 8 }}>
              {FOOTER_NAV.map(({ icon: Icon, label }) => (
                <button key={label} className={styles.navItem}>
                  <Icon size={15} className={styles.navItemIcon} />
                  <span className={styles.navItemLabel}>{label}</span>
                </button>
              ))}
            </nav>

          </div>

        </aside>

        {/* ── Primary Pane ──────────────────────────────────────────── */}
        <div className={styles.primaryPane}>

          {/* Header bar */}
          <div className={styles.headerBar}>
            <div className={styles.headerLeading}>
              <button className={styles.headerMenuBtn} aria-label="Toggle sidebar">
                <AlignLeft size={18} />
              </button>
              <nav className={styles.breadcrumb}>
                <span className={`${styles.breadcrumbItem} ${styles.breadcrumbActive}`}>
                  Home
                </span>
              </nav>
            </div>
            <div className={styles.headerTrailing}>
              <button className={styles.headerIconBtn}><Search size={18} /></button>
              <button className={styles.headerIconBtn}>
                <Bell size={18} />
                <span className={styles.headerBadge}>9</span>
              </button>
              <img src={avatarImg} alt="Avatar" className={styles.avatar} />
            </div>
          </div>

          {/* Scrollable body */}
          <div className={styles.contentOuter}>
            <div className={styles.contentLayout}>

              {/* ── Main column ──────────────────────────────────── */}
              <div className={styles.mainCol}>

                {/* System messages alert */}
                <div className={styles.alertBar}>
                  <TriangleAlert size={14} className={styles.alertIcon} />
                  <span className={styles.alertText}>
                    <strong>System messages:</strong> Roblox Studio update 661 is now available.{' '}
                    <a href="#" className={styles.alertLink}>View release notes</a>
                  </span>
                  <button className={styles.alertClose} aria-label="Dismiss"><X size={14} /></button>
                </div>

                {/* Hero banner */}
                <div className={styles.heroBanner}>
                  <img src={heroImg} alt="" className={styles.heroImg} />
                  <div className={styles.heroGradient} />
                  <div className={styles.heroContent}>
                    <div className={styles.heroTextBlock}>
                      <h1 className={styles.heroTitle}>
                        Create your first experience in Studio
                      </h1>
                      <p className={styles.heroBody}>
                        Use our free all-in-one creation engine to build anything you can imagine
                      </p>
                    </div>
                    <button className={styles.heroBtn}>
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                  <button className={styles.heroCloseBtn} aria-label="Dismiss banner">
                    <X size={14} />
                  </button>
                </div>

                {/* Experiences section */}
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Experiences</h2>
                    <div className={styles.sectionActions}>
                      <button className={styles.sectionIconBtn} aria-label="Edit">
                        <Pencil size={15} />
                      </button>
                      <button className={styles.viewAllBtn}>View all</button>
                    </div>
                  </div>
                  <div className={styles.experiencesGrid}>

                    {/* Tyler's Starter Place tile */}
                    <div
                      className={styles.expTile}
                      onClick={() => navigate('/experience/overview')}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className={styles.expTileHeader}>
                        <div className={styles.expTileLeading}>
                          <div className={styles.expTileIcon} aria-hidden="true">🌿</div>
                          <h3 className={styles.expTileName}>The Great Escape Monkey Game</h3>
                        </div>
                        <button className={styles.expTileMenu} aria-label="More options">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                      <div className={styles.expTileBody}>
                        <div className={styles.statPrimary}>
                          <span className={styles.statPrimaryLabel}>Concurrent users</span>
                          <span className={styles.statPrimaryValue}>3</span>
                        </div>
                        <div className={styles.statList}>
                          {EXPERIENCE_STATS.map((s) => (
                            <div key={s.label} className={styles.statRow}>
                              <span className={styles.statLabel}>{s.label}</span>
                              <span className={styles.statValue}>{s.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className={styles.expTileFooter}>
                        <div className={styles.expTileFooterInner}>
                          <div className={styles.footerLeading}>
                            <Zap size={16} className={styles.footerIcon} fill="currentColor" />
                            <div>
                              <div className={styles.footerTitle}>Try sponsored ads</div>
                              <div className={styles.footerDesc}>
                                Promote your experiences to audiences that would enjoy it
                              </div>
                            </div>
                          </div>
                          <ChevronRight size={16} className={styles.footerChevron} />
                        </div>
                      </div>
                    </div>

                    {/* Add to watchlist tile */}
                    <div className={styles.watchlistTile}>
                      <button className={styles.watchlistClose} aria-label="Close"><X size={14} /></button>
                      <div className={styles.watchlistInner}>
                        <div className={styles.watchlistIllustration} aria-hidden="true">🎮</div>
                        <div className={styles.watchlistText}>
                          <h3 className={styles.watchlistTitle}>Add to watchlist</h3>
                          <p className={styles.watchlistDesc}>
                            Monitor performance and user engagement
                          </p>
                        </div>
                        <button className={styles.addExpBtn}>Add experiences</button>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Learn section */}
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Learn</h2>
                    <button className={styles.viewAllBtn}>View all</button>
                  </div>
                  <div className={styles.learnGrid}>
                    {LEARN_CARDS.map((card) => (
                      <div key={card.id} className={styles.learnCard}>
                        <img
                          src={card.img}
                          alt={card.title}
                          className={styles.learnThumb}
                        />
                        <div className={styles.learnCardBody}>
                          <span className={styles.learnTag}>Tutorial</span>
                          <h3 className={styles.learnTitle}>{card.title}</h3>
                          <p className={styles.learnDesc}>{card.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* ── Updates Drawer ───────────────────────────────── */}
              <div className={`${styles.updatesDrawer} ${isUpdatesOpen ? '' : styles.updatesDrawerClosed}`}>
                <div className={styles.updatesDrawerInner}>

                  {/* Drawer header: title + close toggle */}
                  <div className={styles.updatesHeader}>
                    <h2 className={styles.updatesTitle}>Updates</h2>
                    <button
                      className={styles.updatesToggleBtn}
                      onClick={() => setIsUpdatesOpen(false)}
                      aria-label="Close updates panel"
                    >
                      <ChevronsRight size={16} />
                    </button>
                  </div>

                  <div className={styles.updatesWidget}>
                    {/* Filter bar (sticky inside widget) */}
                    <div className={styles.updatesFilterBar}>
                      <div className={styles.updatesChip}>
                        Featured <ChevronDown size={10} />
                      </div>
                      <button className={styles.updatesViewAll}>View all</button>
                    </div>
                    {/* Feed rows */}
                    {UPDATES.map((entry) => (
                      <div key={entry.id} className={styles.updateRow}>
                        <div className={styles.updateContent}>
                          <p className={styles.updateTitle}>{entry.title}</p>
                          <div className={styles.updateMeta}>
                            <div className={styles.updateStats}>
                              <span className={styles.updateStat}>
                                <Heart size={11} /> {entry.likes}
                              </span>
                              <span className={styles.updateStat}>
                                <MessageSquare size={11} /> {entry.comments}
                              </span>
                            </div>
                            {entry.tags.length > 0 && (
                              <div className={styles.updateTags}>
                                {entry.tags.map((t) => (
                                  <span key={t} className={styles.updateTag}>{t}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        {entry.thumb && (
                          <img src={entry.thumb} alt="" className={styles.updateThumb} />
                        )}
                      </div>
                    ))}
                  </div>

                </div>
              </div>

              {/* Floating reveal tab — appears when drawer is closed */}
              <button
                className={`${styles.updatesRevealTab} ${isUpdatesOpen ? '' : styles.updatesRevealTabVisible}`}
                onClick={() => setIsUpdatesOpen(true)}
                aria-label="Open updates panel"
              >
                <ChevronsLeft size={14} />
                <span className={styles.updatesRevealLabel}>Updates</span>
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

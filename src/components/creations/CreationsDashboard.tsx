import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, Folder, BookOpen, ShoppingBag, MessageCircle, BellRing,
  DollarSign, BarChart2, Megaphone, LayoutGrid, Globe, Pencil,
  ChevronDown, PanelLeftClose, AlertTriangle, ExternalLink,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import styles from './CreationsDashboard.module.css';
import tiltSvg from '../../assets/tilt.svg';
import avatarImg from '../../assets/avatar.png';

// ─── Nav data (mirrors HomeDashboard exactly) ──────────────────────────────

interface NavEntry { icon: LucideIcon; label: string; path?: string; badge?: string; }

const TOP_NAV: NavEntry[] = [
  { icon: Home,          label: 'Home',      path: '/home' },
  { icon: Folder,        label: 'Creations', path: '/creations' },
  { icon: BookOpen,      label: 'Learn' },
  { icon: ShoppingBag,   label: 'Store' },
  { icon: MessageCircle, label: 'Forum' },
  { icon: BellRing,      label: 'Updates', badge: 'New' },
];
const MID_NAV:   NavEntry[] = [
  { icon: DollarSign, label: 'Finances' },
  { icon: BarChart2,  label: 'Analytics' },
  { icon: Megaphone,  label: 'Ads' },
];
const TOOLS_NAV: NavEntry[] = [{ icon: LayoutGrid, label: 'All tools' }];
const FOOTER_NAV: NavEntry[] = [
  { icon: Globe,  label: 'Roblox.com' },
  { icon: Pencil, label: 'Studio' },
];

// ─── Experience mock data ──────────────────────────────────────────────────

type Visibility = 'Private' | 'Public';

interface Experience {
  id: string;
  title: string;
  thumbnail: string;
  visibility: Visibility;
}

const EXPERIENCES: Experience[] = [
  { id: 'exp-1', title: 'The Great Escape Monkey Game', thumbnail: 'https://placehold.co/128x128/1a1b20/444?text=🐒',  visibility: 'Public'  },
  { id: 'exp-2', title: "Tyler's Starter Place",         thumbnail: 'https://placehold.co/128x128/1a1b20/444?text=🏠',  visibility: 'Private' },
  { id: 'exp-3', title: 'Neon Race Track',               thumbnail: 'https://placehold.co/128x128/1a1b20/444?text=🏎️', visibility: 'Public'  },
  { id: 'exp-4', title: 'Zombie Siege 2025',             thumbnail: 'https://placehold.co/128x128/1a1b20/444?text=🧟', visibility: 'Private' },
  { id: 'exp-5', title: 'Sky Islands',                   thumbnail: 'https://placehold.co/128x128/1a1b20/444?text=☁️', visibility: 'Public'  },
  { id: 'exp-6', title: 'City Roleplay',                 thumbnail: 'https://placehold.co/128x128/1a1b20/444?text=🌆', visibility: 'Private' },
  { id: 'exp-7', title: 'Dungeon Crawler Pro',           thumbnail: 'https://placehold.co/128x128/1a1b20/444?text=⚔️', visibility: 'Public'  },
  { id: 'exp-8', title: 'Farming Simulator',             thumbnail: 'https://placehold.co/128x128/1a1b20/444?text=🌾', visibility: 'Private' },
  { id: 'exp-9', title: 'Laser Tag Arena',               thumbnail: 'https://placehold.co/128x128/1a1b20/444?text=🔫', visibility: 'Public'  },
  { id: 'exp-10', title: 'Underwater Adventure',        thumbnail: 'https://placehold.co/128x128/1a1b20/444?text=🐠', visibility: 'Private' },
  { id: 'exp-11', title: 'Speed Run Paradise',          thumbnail: 'https://placehold.co/128x128/1a1b20/444?text=🏃', visibility: 'Public'  },
  { id: 'exp-12', title: 'Dragon Tamer',                thumbnail: 'https://placehold.co/128x128/1a1b20/444?text=🐉', visibility: 'Private' },
];

// ─── Component ─────────────────────────────────────────────────────────────

export default function CreationsDashboard() {
  const navigate = useNavigate();

  // Tab & filter state
  const [activeTab, setActiveTab] = useState<'experiences' | 'sharelinks' | 'avatar' | 'dev'>('experiences');
  const [filterGroup, setFilterGroup] = useState<'mine' | 'shared'>('mine');
  const [showPublic,   setShowPublic]   = useState(true);
  const [showImpacted, setShowImpacted] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const TABS = [
    { id: 'experiences', label: 'Experiences' },
    { id: 'sharelinks',  label: 'Share Links' },
    { id: 'avatar',      label: 'Avatar Items' },
    { id: 'dev',         label: 'Development Items' },
  ] as const;

  return (
    <div className={styles.shell}>
      <div className={styles.viewport}>

        {/* ── Sidebar (identical to HomeDashboard) ────────────────── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarLogoRow}>
            <img src={tiltSvg} alt="Roblox" className={styles.sidebarLogoMark} />
            <span className={styles.sidebarLogoText}>CREATOR</span>
          </div>

          <button className={styles.navContextSelector}>
            <img src={avatarImg} alt="kal101246" className={styles.navContextAvatarImg} />
            <span className={styles.navContextName}>kal101246</span>
            <ChevronDown size={12} className={styles.navContextChevron} />
          </button>

          <div className={styles.navTree}>
            <nav className={styles.navBody}>
              {TOP_NAV.map(({ icon: Icon, label, path, badge }) => (
                <button
                  key={label}
                  className={`${styles.navItem} ${path === '/creations' ? styles.navItemActive : ''}`}
                  onClick={() => path && navigate(path)}
                >
                  <Icon size={16} className={styles.navItemIcon} />
                  <span className={styles.navItemLabel}>{label}</span>
                  {badge && <span className={styles.navItemBadge}>{badge}</span>}
                </button>
              ))}
            </nav>
            <div className={styles.navDivider} />
            <nav className={styles.navBody}>
              {MID_NAV.map(({ icon: Icon, label }) => (
                <button key={label} className={styles.navItem}>
                  <Icon size={16} className={styles.navItemIcon} />
                  <span className={styles.navItemLabel}>{label}</span>
                </button>
              ))}
            </nav>
            <div className={styles.navDivider} />
            <nav className={styles.navBody}>
              {TOOLS_NAV.map(({ icon: Icon, label }) => (
                <button key={label} className={styles.navItem}>
                  <Icon size={16} className={styles.navItemIcon} />
                  <span className={styles.navItemLabel}>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className={styles.sidebarFooter}>
            {FOOTER_NAV.map(({ icon: Icon, label }) => (
              <button key={label} className={styles.navItem}>
                <Icon size={16} className={styles.navItemIcon} />
                <span className={styles.navItemLabel}>{label}</span>
              </button>
            ))}
            <button className={styles.sidebarCollapseBtn} aria-label="Collapse sidebar">
              <PanelLeftClose size={16} />
            </button>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────── */}
        <main className={styles.main}>

          {/* ── Page header ───────────────────────────────────────── */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Creations</h1>
          </div>

          {/* ── Tab bar ───────────────────────────────────────────── */}
          <div className={styles.tabBar}>
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Sub-filter row ────────────────────────────────────── */}
          <div className={styles.filterRow}>
            {/* Left: ownership pills */}
            <div className={styles.filterPills}>
              <button
                className={`${styles.pill} ${filterGroup === 'mine' ? styles.pillActive : ''}`}
                onClick={() => setFilterGroup('mine')}
              >
                My Experiences
              </button>
              <button
                className={`${styles.pill} ${filterGroup === 'shared' ? styles.pillActive : ''}`}
                onClick={() => setFilterGroup('shared')}
              >
                Shared With Me
              </button>
            </div>

            {/* Right: show toggles + sort */}
            <div className={styles.filterRight}>
              <span className={styles.filterLabel}>Show:</span>

              <label className={styles.toggleLabel}>
                <span
                  className={`${styles.toggleSwitch} ${showPublic ? styles.toggleOn : ''}`}
                  onClick={() => setShowPublic(v => !v)}
                  role="switch"
                  aria-checked={showPublic}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setShowPublic(v => !v)}
                >
                  <span className={styles.toggleThumb} />
                </span>
                Public
              </label>

              <label className={styles.toggleLabel}>
                <span
                  className={`${styles.toggleSwitch} ${showImpacted ? styles.toggleOn : ''}`}
                  onClick={() => setShowImpacted(v => !v)}
                  role="switch"
                  aria-checked={showImpacted}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setShowImpacted(v => !v)}
                >
                  <span className={styles.toggleThumb} />
                </span>
                Impacted
              </label>

              <label className={styles.toggleLabel}>
                <span
                  className={`${styles.toggleSwitch} ${showArchived ? styles.toggleOn : ''}`}
                  onClick={() => setShowArchived(v => !v)}
                  role="switch"
                  aria-checked={showArchived}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setShowArchived(v => !v)}
                >
                  <span className={styles.toggleThumb} />
                </span>
                Archived
              </label>

              <div className={styles.sortWrap}>
                <span className={styles.filterLabel}>Sort by:</span>
                <select className={styles.sortSelect} defaultValue="updated">
                  <option value="updated">Last Updated Date</option>
                  <option value="created">Created Date</option>
                  <option value="name">Name</option>
                </select>
                <ChevronDown size={13} className={styles.sortChevron} />
              </div>
            </div>
          </div>

          <div className={styles.content}>

            {/* ── Impacted collaboration banner ──────────────────── */}
            {!bannerDismissed && (
              <div className={styles.alertBanner}>
                <AlertTriangle size={16} className={styles.alertIcon} />
                <p className={styles.alertText}>
                  <strong>Collaboration in some experiences may be impacted.</strong>{' '}
                  Select 'Impacted' to view experiences where collaborators need to be added as Trusted Connections.
                </p>
                <div className={styles.alertActions}>
                  <button className={styles.alertBtn}>Add Trusted Connections</button>
                  <button
                    className={styles.alertDismiss}
                    aria-label="Dismiss"
                    onClick={() => setBannerDismissed(true)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* ── Create Experience CTA ─────────────────────────── */}
            <div className={styles.ctaRow}>
              <button
                className={styles.createBtn}
                onClick={() => navigate('/experience/overview')}
              >
                <ExternalLink size={14} />
                Create Experience
              </button>
            </div>

            {/* ── Experience grid ───────────────────────────────── */}
            <div className={styles.expGrid}>
              {EXPERIENCES.map((exp) => (
                <div
                  key={exp.id}
                  className={styles.expCard}
                  onClick={() => navigate('/experience/overview')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate('/experience/overview')}
                  aria-label={`Open ${exp.title}`}
                >
                  {/* Square thumbnail */}
                  <div className={styles.expThumbWrap}>
                    <img src={exp.thumbnail} alt={exp.title} className={styles.expThumb} />
                  </div>

                  {/* Visibility badge */}
                  <div className={styles.expBadge}>
                    {exp.visibility === 'Public' && (
                      <Globe size={9} className={styles.expBadgeIcon} />
                    )}
                    {exp.visibility}
                  </div>

                  {/* Title */}
                  <span className={styles.expTitle}>{exp.title}</span>
                </div>
              ))}
            </div>

          </div>{/* end .content */}
        </main>
      </div>
    </div>
  );
}

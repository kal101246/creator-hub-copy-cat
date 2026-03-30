import { useState, useEffect, useRef } from 'react';
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
  Package,
  TrendingUp,
  Calendar,
  PlusCircle,
  Store,
  Play,
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

interface ExploreCard { id: string; title: string; desc: string; icon: LucideIcon; }
const EXPLORE_CARDS: ExploreCard[] = [
  { id: 'ex1', icon: Package,    title: 'Create an Avatar Item',                   desc: 'Create Avatar items and publish it to Marketplace' },
  { id: 'ex2', icon: PlusCircle, title: 'Add community content to your Experience', desc: "Check out what's trending on the Creator Store" },
  { id: 'ex3', icon: TrendingUp, title: "Understand what's popular with users",     desc: 'Look at the top Experiences built to get inspiration' },
  { id: 'ex4', icon: BookOpen,   title: 'Learn from the Roblox staff',              desc: 'Gain knowledge and expertise directly from Roblox' },
];

interface SpotlightEntry { id: string; name: string; desc: string; color: string; }
const SPOTLIGHT: SpotlightEntry[] = [
  { id: 'sp1', name: 'Alo Yoga',          color: '#e879f9', desc: 'Jessica is the designer behind imaginative environments like in Alo Yoga' },
  { id: 'sp2', name: 'The Survival Game', color: '#fb923c', desc: 'The Gamers are the family-owned studio behind hits like The Survival Game' },
  { id: 'sp3', name: 'Jailbreak',         color: '#a78bfa', desc: 'Alex shares first-hand experience while creating their experience, Jailbreak' },
  { id: 'sp4', name: '@Jaszea3',          color: '#34d399', desc: 'Jasmine is the artist behind some of the most popular avatar items on Marketplace' },
  { id: 'sp5', name: '@YouFoundSam',      color: '#60a5fa', desc: 'Sam shares how they got a start in game development with Roblox' },
];

interface UpdateEntry {
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

  // ── Banner visibility ─────────────────────────────────────────────────
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  // ── Feature flag override system ───────────────────────────────────────
  const [flagMenuOpen, setFlagMenuOpen] = useState(false);
  const [useV1, setUseV1] = useState(true);    // Elastic push/pull
  const [useV2, setUseV2] = useState(false);   // Overlay layer
  const [groupExpanded, setGroupExpanded] = useState(true);
  const [flagPos, setFlagPos] = useState({ x: 80, y: 120 });
  const flagDragRef = useRef<{
    startX: number; startY: number; origX: number; origY: number;
  } | null>(null);

  // Press [ to toggle the feature flag menu
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '[' && !e.metaKey && !e.ctrlKey) setFlagMenuOpen(p => !p);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  function onFlagDragStart(e: React.MouseEvent) {
    const { clientX, clientY } = e;
    flagDragRef.current = {
      startX: clientX, startY: clientY, origX: flagPos.x, origY: flagPos.y,
    };
    const onMove = (ev: MouseEvent) => {
      if (!flagDragRef.current) return;
      setFlagPos({
        x: flagDragRef.current.origX + ev.clientX - flagDragRef.current.startX,
        y: flagDragRef.current.origY + ev.clientY - flagDragRef.current.startY,
      });
    };
    const onUp = () => {
      flagDragRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  // Mutually exclusive activation helpers
  function activateV1() { setUseV1(true);  setUseV2(false); }
  function activateV2() { setUseV2(true);  setUseV1(false); }
  function resetFlags()  { setUseV1(true);  setUseV2(false); }

  return (
    <>
    <div
      className={styles.shell}
    >

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

                {/* System messages alert — dismissible */}
                <div className={`${styles.alertBarWrap} ${!isBannerVisible ? styles.alertBarWrapHidden : ''}`}>
                  <div className={styles.alertBar}>
                    <TriangleAlert size={14} className={styles.alertIcon} />
                    <span className={styles.alertText}>
                      <strong>System messages:</strong> Roblox Studio update 661 is now available.{' '}
                      <a href="#" className={styles.alertLink}>View release notes</a>
                    </span>
                    <button
                      className={styles.alertClose}
                      aria-label="Dismiss"
                      onClick={() => setIsBannerVisible(false)}
                    >
                      <X size={14} />
                    </button>
                  </div>
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

                {/* ── Explore Creator Hub ───────────────────────────── */}
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Explore Creator Hub</h2>
                  </div>
                  <div className={styles.exploreGrid}>
                    {EXPLORE_CARDS.map(({ id, icon: Icon, title, desc }) => (
                      <button key={id} className={styles.exploreCard}>
                        <div className={styles.exploreCardIcon}>
                          <Icon size={18} />
                        </div>
                        <h3 className={styles.exploreCardTitle}>{title}</h3>
                        <p className={styles.exploreCardDesc}>{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Promo row ─────────────────────────────────────── */}
                <div className={styles.promoRow}>
                  {/* Build on Roblox */}
                  <div className={styles.promoCard}>
                    <div className={styles.promoCardContent}>
                      <h3 className={styles.promoCardTitle}>Build on Roblox and reach millions</h3>
                      <p className={styles.promoCardDesc}>
                        Two new programs to help you turn your vision into a launch-ready game
                        with mentoring support, hands-on seminars, and a direct line into the Roblox team
                      </p>
                      <button className={styles.promoBtn}>Learn more</button>
                    </div>
                    <div className={styles.promoCardImgWrap}>
                      <div className={styles.promoCardImgPlaceholder} aria-hidden="true">
                        🎮
                      </div>
                    </div>
                  </div>

                  {/* Browse the Store */}
                  <div className={styles.promoCard}>
                    <div className={styles.promoCardContent}>
                      <h3 className={styles.promoCardTitle}>Browse the Store</h3>
                      <p className={styles.promoCardDesc}>
                        Find models, scripts, and plugins made by other creators
                      </p>
                      <button className={styles.promoBtn}>
                        <Store size={14} />
                        View Items
                      </button>
                    </div>
                    <div className={styles.promoCardImgWrap}>
                      <div className={styles.promoCardImgPlaceholder} aria-hidden="true">
                        🛒
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Community section ─────────────────────────────── */}
                <div className={styles.communitySection}>

                  {/* Left: text + links */}
                  <div className={styles.communityLeft}>
                    <h2 className={styles.communityTitle}>You're part of the community</h2>
                    <p className={styles.communityDesc}>
                      Our community of award-winning studios and self-taught creators all started here, just for you.
                    </p>
                    <div className={styles.communityLinks}>
                      <a href="#" className={styles.communityLink}>
                        <MessageCircle size={14} />
                        Join the Community Forum
                      </a>
                      <a href="#" className={styles.communityLink}>
                        <Calendar size={14} />
                        View Community Events
                      </a>
                    </div>
                  </div>

                  {/* Center: video player */}
                  <div className={styles.communityVideo}>
                    <div className={styles.videoPlayer}>
                      <div className={styles.videoPlayerBg} aria-hidden="true" />
                      <div className={styles.videoPlayOverlay}>
                        <div className={styles.videoPlayBtn} aria-label="Play video">
                          {/* YouTube-style red play button */}
                          <svg width="64" height="44" viewBox="0 0 64 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="64" height="44" rx="10" fill="#FF0000"/>
                            <path d="M27 14L45 22L27 30V14Z" fill="white"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: spotlight list */}
                  <div className={styles.spotlightList}>
                    {SPOTLIGHT.map((item) => (
                      <div key={item.id} className={styles.spotlightItem}>
                        <div
                          className={styles.spotlightAvatar}
                          style={{ background: item.color }}
                          aria-hidden="true"
                        >
                          {item.name[0]}
                        </div>
                        <div className={styles.spotlightContent}>
                          <span className={styles.spotlightName}>{item.name}</span>
                          <p className={styles.spotlightDesc}>{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

                {/* ── Global Footer ──────────────────────────────────── */}
                <footer className={styles.pageFooter}>
                  <div className={styles.footerLeft}>
                    <span className={styles.footerCopy}>©2026 Roblox Corporation. All rights reserved.</span>
                    <nav className={styles.footerLinks}>
                      {['Terms', 'Privacy', 'Accessibility', 'Support', 'Your Privacy Choices'].map((l) => (
                        <a key={l} href="#" className={styles.footerLink}>{l}</a>
                      ))}
                    </nav>
                  </div>
                  <div className={styles.footerRight}>
                    <div className={styles.footerSocials}>
                      {/* X / Twitter */}
                      <a href="#" className={styles.footerSocialBtn} aria-label="X / Twitter">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.858L1.79 2.25H8.02l4.264 5.637 5.96-5.637Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      </a>
                      {/* Facebook */}
                      <a href="#" className={styles.footerSocialBtn} aria-label="Facebook">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073C24 5.406 18.627 0 12 0S0 5.406 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.026 1.79-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.884v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
                      </a>
                      {/* LinkedIn */}
                      <a href="#" className={styles.footerSocialBtn} aria-label="LinkedIn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      </a>
                      {/* Instagram */}
                      <a href="#" className={styles.footerSocialBtn} aria-label="Instagram">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                      </a>
                      {/* YouTube */}
                      <a href="#" className={styles.footerSocialBtn} aria-label="YouTube">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                      </a>
                    </div>
                    <button className={styles.footerLangBtn}>
                      <Globe size={13} />
                      English
                    </button>
                  </div>
                </footer>

              </div>{/* end .mainCol */}

              {/* ── V1: Elastic flex drawer ─────────────────────── */}
              {useV1 && (
                <div className={`${styles.updatesDrawer} ${isUpdatesOpen ? '' : styles.updatesDrawerClosed}`}>
                  <div className={styles.updatesDrawerInner}>
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
                      <div className={styles.updatesFilterBar}>
                        <div className={styles.updatesChip}>
                          Featured <ChevronDown size={10} />
                        </div>
                        <button className={styles.updatesViewAll}>View all</button>
                      </div>
                      {UPDATES.map((entry) => (
                        <div key={entry.id} className={styles.updateRow}>
                          <div className={styles.updateContent}>
                            <p className={styles.updateTitle}>{entry.title}</p>
                            <div className={styles.updateMeta}>
                              <div className={styles.updateStats}>
                                <span className={styles.updateStat}><Heart size={11} /> {entry.likes}</span>
                                <span className={styles.updateStat}><MessageSquare size={11} /> {entry.comments}</span>
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
                          {entry.thumb && <img src={entry.thumb} alt="" className={styles.updateThumb} />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Floating reveal tab — visible in both modes when drawer is closed */}
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

    </div>{/* end .shell */}

    {/* ── V2: overlay drawer — OUTSIDE shell so position:fixed stays viewport-relative */}
    {useV2 && (
      <>
        {/* Backdrop dim for V2 */}
        <div
          className={`${styles.overlayBackdrop} ${isUpdatesOpen ? styles.overlayBackdropVisible : ''}`}
          onClick={() => setIsUpdatesOpen(false)}
        />
        {/* Fixed overlay drawer */}
        <div className={`${styles.updatesDrawerOverlay} ${isUpdatesOpen ? '' : styles.updatesDrawerOverlayHidden}`}>
          <div className={styles.updatesDrawerInner}>
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
            <div className={`${styles.updatesWidget} ${styles.updatesWidgetOverlay}`}>
              <div className={styles.updatesFilterBar}>
                <div className={styles.updatesChip}>Featured <ChevronDown size={10} /></div>
                <button className={styles.updatesViewAll}>View all</button>
              </div>
              {UPDATES.map((entry) => (
                <div key={entry.id} className={styles.updateRow}>
                  <div className={styles.updateContent}>
                    <p className={styles.updateTitle}>{entry.title}</p>
                    <div className={styles.updateMeta}>
                      <div className={styles.updateStats}>
                        <span className={styles.updateStat}><Heart size={11} /> {entry.likes}</span>
                        <span className={styles.updateStat}><MessageSquare size={11} /> {entry.comments}</span>
                      </div>
                      {entry.tags.length > 0 && (
                        <div className={styles.updateTags}>
                          {entry.tags.map((t) => <span key={t} className={styles.updateTag}>{t}</span>)}
                        </div>
                      )}
                    </div>
                  </div>
                  {entry.thumb && <img src={entry.thumb} alt="" className={styles.updateThumb} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    )}

    {/* ── Feature Flag Override modal ([ key) — OUTSIDE shell ────────── */}
    {flagMenuOpen && (
      <div
        className={styles.flagModal}
        style={{ left: flagPos.x, top: flagPos.y }}
      >
        {/* Draggable header with Reset button */}
        <div className={styles.flagModalHeader} onMouseDown={onFlagDragStart}>
          <span className={styles.flagModalTitle}>⚑ Feature Flags</span>
          <div className={styles.flagModalHeaderActions}>
            <button className={styles.flagModalReset} onClick={resetFlags} title="Reset to default (V1 Elastic)">
              Reset
            </button>
            <button className={styles.flagModalClose} onClick={() => setFlagMenuOpen(false)} aria-label="Close">
              <X size={13} />
            </button>
          </div>
        </div>
        <p className={styles.flagModalSubtext}>
          Override feature flags locally. Drag around. Only visible to Roblox employees.
        </p>

        {/* ── Collapsible group: Home Dashboard Updates ── */}
        <div className={styles.flagGroup}>
          <button
            className={styles.flagGroupHeader}
            onClick={() => setGroupExpanded(p => !p)}
          >
            <ChevronRight
              size={13}
              className={`${styles.flagGroupChevron} ${groupExpanded ? styles.flagGroupChevronOpen : ''}`}
            />
            <span className={styles.flagGroupLabel}>Home Dashboard Layout</span>
          </button>

          {groupExpanded && (
            <div className={styles.flagGroupChildren}>

              {/* Flag 1 — V1 Elastic */}
              <div className={styles.flagToggleRow}>
                <div className={styles.flagToggleInfo}>
                  <code className={styles.flagToggleName}>useElasticDashboard_V1</code>
                  <span className={styles.flagToggleDesc}>
                    Main content shrinks/grows as Updates opens/closes
                  </span>
                </div>
                <button
                  className={`${styles.flagToggle} ${useV1 ? styles.flagToggleOn : ''}`}
                  onClick={activateV1}
                  role="switch"
                  aria-checked={useV1}
                >
                  <span className={styles.flagToggleKnob} />
                </button>
              </div>

              {/* Flag 2 — V2 Overlay */}
              <div className={styles.flagToggleRow}>
                <div className={styles.flagToggleInfo}>
                  <code className={styles.flagToggleName}>useOverlayUpdates_V2</code>
                  <span className={styles.flagToggleDesc}>
                    Main content stays 100% width; Updates slides over as a layer
                  </span>
                </div>
                <button
                  className={`${styles.flagToggle} ${useV2 ? styles.flagToggleOn : ''}`}
                  onClick={activateV2}
                  role="switch"
                  aria-checked={useV2}
                >
                  <span className={styles.flagToggleKnob} />
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    )}

    </>
  );
}

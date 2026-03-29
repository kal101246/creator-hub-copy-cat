import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlignLeft,
  Bell,
  ChevronDown,
  ChevronRight,
  Search,
  Flag,
  ThumbsUp,
  Users,
  Download,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import IconRail from '../shared/IconRail';
import styles from './ExperienceOverview.module.css';
import avatarImg from '../../assets/avatar.png';

// ─── Nav data ─────────────────────────────────────────────────────────────────

interface NavGroup {
  label: string;
  hasChildren?: boolean;
  expanded?: boolean;
  children?: { label: string; path?: string; active?: boolean }[];
  active?: boolean;
}

const INITIAL_NAV: NavGroup[] = [
  { label: 'Overview', active: true },
  { label: 'Configure',      hasChildren: true, expanded: false, children: [] },
  { label: 'Analytics',      hasChildren: true, expanded: false, children: [] },
  { label: 'Monetization',   hasChildren: true, expanded: false, children: [] },
  { label: 'Monitoring',     hasChildren: true, expanded: false, children: [] },
  { label: 'Activity History' },
  {
    label: 'Audience',
    hasChildren: true,
    expanded: true,
    children: [
      { label: 'Feedback' },
      { label: 'Access Settings' },
      { label: 'Communication Settings' },
      { label: 'Maturity & Compliance' },
      { label: 'Localization', path: '/localization' },
    ],
  },
  { label: 'Engagement', hasChildren: true, expanded: false, children: [] },
  { label: 'Moderation' },
  { label: 'Promotion',  hasChildren: true, expanded: false, children: [] },
];

// ─── Analytics data ────────────────────────────────────────────────────────────

const METRICS = [
  { label: 'Day 1 retention',    value: '24.5%' },
  { label: 'New users',          value: '47'    },
  { label: 'Average playtime',   value: '2.3 min' },
  { label: 'Daily active users', value: '31'    },
  { label: 'Daily revenue',      value: '0'     },
];

const CHART_DATA = [
  { date: 'Mar 20', Total: 12, Other: 4  },
  { date: 'Mar 21', Total: 19, Other: 7  },
  { date: 'Mar 22', Total: 15, Other: 5  },
  { date: 'Mar 23', Total: 28, Other: 9  },
  { date: 'Mar 24', Total: 24, Other: 8  },
  { date: 'Mar 25', Total: 36, Other: 12 },
  { date: 'Mar 26', Total: 42, Other: 14 },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExperienceOverview() {
  const navigate = useNavigate();
  const [navGroups, setNavGroups] = useState<NavGroup[]>(INITIAL_NAV);

  const toggleGroup = (label: string) => {
    setNavGroups((prev) =>
      prev.map((g) =>
        g.label === label ? { ...g, expanded: !g.expanded } : g,
      ),
    );
  };

  return (
    <div className={styles.shell}>

      {/* ── App Bar ───────────────────────────────────────────────── */}
      <div className={styles.appBar}>
        <div className={styles.trafficLights}>
          <span className={`${styles.tl} ${styles.tlClose}`} />
          <span className={`${styles.tl} ${styles.tlMin}`} />
          <span className={`${styles.tl} ${styles.tlMax}`} />
        </div>
        <span className={styles.appBarTitle}>Creator Hub</span>
        <div aria-hidden="true" />
      </div>

      {/* ── Viewport ──────────────────────────────────────────────── */}
      <div className={styles.viewport}>

        {/* ── Sidebar: icon rail (72px) + nav tree (216px) ─────── */}
        <div className={styles.sidebar}>

          {/* Shared slim icon rail — identical to Glossary page */}
          <IconRail />

          {/* Contextual nav tree */}
          <div className={styles.navTree}>

            {/* Back button */}
            <div
              className={styles.navBack}
              onClick={() => navigate('/home')}
            >
              <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} />
              Back
            </div>

            {/* Nav items */}
            <div className={styles.navBody}>
              {navGroups.map((group) => (
                <div key={group.label}>
                  <div
                    className={`${styles.navItem} ${group.active ? styles.navItemActive : ''}`}
                    onClick={() => group.hasChildren && toggleGroup(group.label)}
                  >
                    <span>{group.label}</span>
                    {group.hasChildren && (
                      <ChevronRight
                        size={14}
                        className={`${styles.navChevron} ${group.expanded ? styles.navChevronOpen : ''}`}
                      />
                    )}
                  </div>

                  {group.expanded && group.children && group.children.length > 0 && (
                    <div className={styles.navChildList}>
                      {group.children.map((child) => (
                        <div
                          key={child.label}
                          className={styles.navChild}
                          onClick={() => child.path && navigate(child.path)}
                        >
                          {child.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Primary Pane ──────────────────────────────────────── */}
        <div className={styles.primaryPane}>

          {/* Header bar — exact match to Glossary */}
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
                  Overview
                </span>
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
              <img src={avatarImg} alt="Avatar" className={styles.avatar} />
            </div>
          </div>

          {/* Scrollable body */}
          <div className={styles.body}>
            <div className={styles.content}>

              {/* Page title row */}
              <div className={styles.pageTitleRow}>
                <h1 className={styles.pageTitle}>Analytics Overview</h1>
                <button className={styles.flagBtn} aria-label="Flag">
                  <Flag size={14} />
                </button>
              </div>

              {/* Hero card */}
              <div className={styles.heroCard}>
                <div className={styles.heroThumb}>
                  <span aria-hidden="true">🌿</span>
                </div>
                <div className={styles.heroInfo}>
                  <h2 className={styles.heroTitle}>
                    The Great Escape Monkey Game
                  </h2>
                  <p className={styles.heroMeta}>Updated 3/25/2026, 12:50:05 AM</p>
                  <div className={styles.heroStats}>
                    <span className={styles.heroStat}><ThumbsUp size={14} /> 0</span>
                    <span className={styles.heroStat}><Users size={14} /> 0</span>
                    <span className={styles.heroStat}>1 Visits</span>
                  </div>
                  <div className={styles.heroActions}>
                    <button className={styles.btnPrimary}>Edit in Studio</button>
                    <button className={styles.btnOutline}>View on Roblox</button>
                  </div>
                </div>
              </div>

              {/* Analytics snapshot card */}
              <div className={styles.snapshotCard}>

                <div className={styles.snapshotHeader}>
                  <div className={styles.snapshotLeft}>
                    <span className={styles.snapshotTitle}>
                      Snapshot of 7-day moving averages
                    </span>
                    <span className={styles.snapshotDot} />
                  </div>
                  <div className={styles.snapshotRight}>
                    <button className={styles.btnGhost}>Explore</button>
                    <button className={styles.btnIcon} aria-label="Download">
                      <Download size={14} />
                    </button>
                    <div className={styles.dateRangeWrap}>
                      <span className={styles.dateRangeLabel}>Date Range</span>
                      <button className={styles.dateRangeBtn}>
                        Last 7 days <ChevronDown size={13} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className={styles.metricsRow}>
                  {METRICS.map((m) => (
                    <div key={m.label} className={styles.metricItem}>
                      <span className={styles.metricLabel}>{m.label}</span>
                      <span className={styles.metricValue}>{m.value}</span>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <div className={styles.chartWrap}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={CHART_DATA}
                      margin={{ top: 16, right: 24, left: 0, bottom: 8 }}
                    >
                      <CartesianGrid
                        strokeDasharray="4 4"
                        stroke="rgba(208,217,251,0.07)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        stroke="rgba(208,217,251,0.15)"
                        tick={{ fill: '#bcbec8', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="rgba(208,217,251,0.15)"
                        tick={{ fill: '#bcbec8', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        width={32}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#1c1e24',
                          border: '1px solid rgba(208,217,251,0.12)',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: '#f7f7f8',
                        }}
                        cursor={{ stroke: 'rgba(208,217,251,0.12)', strokeWidth: 1 }}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{
                          fontSize: '12px',
                          color: '#d5d7dd',
                          paddingTop: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Total"
                        stroke="#0064e0"
                        strokeWidth={2}
                        dot={{ fill: '#0064e0', r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Other"
                        stroke="#00c853"
                        strokeWidth={2}
                        dot={{ fill: '#00c853', r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

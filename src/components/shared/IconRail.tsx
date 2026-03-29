import { Home, Video, User, ShoppingBag, Activity, MessageSquare, Gamepad2, BarChart2, Megaphone, LayoutGrid, type LucideIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import tiltSvg from '../../assets/tilt.svg';
import styles from './IconRail.module.css';

interface IconItem {
  Icon: LucideIcon;
  label: string;
  path?: string;
}

const TOP_ICONS: IconItem[] = [
  { Icon: Home,         label: 'Home',        path: '/home' },
  { Icon: Video,        label: 'Video' },
  { Icon: User,         label: 'Profile' },
  { Icon: ShoppingBag,  label: 'Shop' },
  { Icon: Activity,     label: 'Activity' },
  { Icon: MessageSquare,label: 'Messages' },
  { Icon: Gamepad2,     label: 'Games' },
  { Icon: BarChart2,    label: 'Analytics' },
  { Icon: Megaphone,    label: 'Promote' },
];

export default function IconRail() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className={styles.rail}>
      <div className={styles.top}>
        {/* Official tilt.svg logo — navigates to /home */}
        <button
          className={styles.logo}
          onClick={() => navigate('/home')}
          aria-label="Creator Hub Home"
        >
          <img src={tiltSvg} alt="Roblox" className={styles.logoImg} />
        </button>
        <div className={styles.divider} />
        {TOP_ICONS.map(({ Icon, label, path }) => (
          <button
            key={label}
            className={`${styles.btn} ${isActive(path) ? styles.btnActive : ''}`}
            onClick={() => path && navigate(path)}
            aria-label={label}
          >
            <Icon size={18} />
          </button>
        ))}
      </div>
      <div className={styles.bottom}>
        <button className={styles.btn} aria-label="Grid">
          <LayoutGrid size={18} />
        </button>
      </div>
    </div>
  );
}

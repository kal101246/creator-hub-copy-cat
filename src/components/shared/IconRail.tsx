import { Home, Video, User, ShoppingBag, Activity, MessageSquare, Gamepad2, BarChart2, Megaphone, LayoutGrid } from 'lucide-react';
import tiltSvg from '../../assets/tilt.svg';
import styles from './IconRail.module.css';

const TOP_ICONS = [Home, Video, User, ShoppingBag, Activity, MessageSquare, Gamepad2, BarChart2, Megaphone];

export default function IconRail() {
  return (
    <div className={styles.rail}>
      <div className={styles.top}>
        {/* Official tilt.svg logo */}
        <div className={styles.logo}>
          <img src={tiltSvg} alt="Roblox" className={styles.logoImg} />
        </div>
        <div className={styles.divider} />
        {TOP_ICONS.map((Icon, i) => (
          <button key={i} className={styles.btn} aria-label={Icon.displayName ?? 'nav'}>
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

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Leaf, Globe } from 'lucide-react';
import styles from './LocalizationSettings.module.css';

// ─── Sub-component: Toggle switch ─────────────────────────────────────────────

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  id?: string;
}

function ToggleSwitch({ checked, onChange, id }: ToggleSwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      id={id}
      className={`${styles.toggleSwitch} ${checked ? styles.toggleOn : ''}`}
      onClick={onChange}
    >
      <span className={`${styles.toggleKnob} ${checked ? styles.toggleKnobOn : ''}`}>
        {checked && <Check size={10} strokeWidth={3} />}
      </span>
    </button>
  );
}

// ─── Sub-component: Toggle row ────────────────────────────────────────────────

interface ToggleRowProps {
  checked: boolean;
  onChange: () => void;
  hint: React.ReactNode;
}

function ToggleRow({ checked, onChange, hint }: ToggleRowProps) {
  return (
    <div className={styles.toggleRow}>
      <p className={styles.toggleHintText}>{hint}</p>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
  );
}

// ─── Dropdown options ─────────────────────────────────────────────────────────

const CLEAR_DURATIONS = ['24 hours', '48 hours', '72 hours', '1 week'] as const;
type ClearDuration = (typeof CLEAR_DURATIONS)[number];

// ─── Social icon links ────────────────────────────────────────────────────────

/** Simple inline SVG icons for brand logos (lucide-react doesn't ship brand icons) */
const XIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L2.118 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
  </svg>
);
const FbIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
const LiIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);
const IgIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);
const YtIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const SOCIALS = [
  { label: 'X / Twitter', Icon: XIcon },
  { label: 'Facebook',    Icon: FbIcon },
  { label: 'LinkedIn',    Icon: LiIcon },
  { label: 'Instagram',   Icon: IgIcon },
  { label: 'YouTube',     Icon: YtIcon },
] as const;

// ─── Main component ───────────────────────────────────────────────────────────

export default function LocalizationSettings() {
  // ── Toggle states ──────────────────────────────────────────────────────────
  const [captureStrings, setCaptureStrings] = useState(true);
  const [removeStale,    setRemoveStale]    = useState(true);
  const [captureImages,  setCaptureImages]  = useState(false);
  const [useTranslated,  setUseTranslated]  = useState(true);

  // ── Clear section ──────────────────────────────────────────────────────────
  const [clearDuration,  setClearDuration]  = useState<ClearDuration>('24 hours');
  const [clearModalOpen, setClearModalOpen] = useState(false);

  function handleClearConfirm() {
    setClearModalOpen(false);
    // Future: dispatch clear action to backend
  }

  return (
    <div className={styles.settingsBody}>
      <div className={styles.settingsSections}>

        {/* ── Section 1: Automatic text capture ──────────────────────────── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Automatic text capture</h3>
          <div className={styles.sectionToggles}>
            <ToggleRow
              checked={captureStrings}
              onChange={() => setCaptureStrings((v) => !v)}
              hint={
                <>
                  Capture strings from game UI while users play. It may take up to a few days for
                  strings to be added to your localization table. To add text immediately, use the{' '}
                  <a href="#" className={styles.link}>Studio text capture tool</a>.
                </>
              }
            />
            <ToggleRow
              checked={removeStale}
              onChange={() => setRemoveStale((v) => !v)}
              hint="Allow Roblox to remove stale entries from your localization table. Entries with manually edited translations will not be impacted."
            />
          </div>
        </div>

        <div className={styles.divider} />

        {/* ── Section 2: Automatic image capture ─────────────────────────── */}
        <div className={styles.section}>
          <div className={styles.sectionTitleRow}>
            <h3 className={styles.sectionTitle}>Automatic image capture</h3>
            <span className={styles.betaBadge}>
              <Leaf size={12} />
              Beta Feature
            </span>
          </div>
          <div className={styles.sectionToggles}>
            <ToggleRow
              checked={captureImages}
              onChange={() => setCaptureImages((v) => !v)}
              hint={
                <>
                  Capture images from game UI while users play. It may take up to a few days for
                  images to be added to your localization table. To add images immediately, use the{' '}
                  <a href="#" className={styles.link}>Studio text capture tool</a>.
                </>
              }
            />
          </div>
        </div>

        <div className={styles.divider} />

        {/* ── Section 3: Use translated content ──────────────────────────── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Use translated content</h3>
          <div className={styles.sectionToggles}>
            <ToggleRow
              checked={useTranslated}
              onChange={() => setUseTranslated((v) => !v)}
              hint="Enable translated content in experience"
            />
          </div>
        </div>

        <div className={styles.divider} />

        {/* ── Section 4: Clear unmodified auto-captured entries ───────────── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Clear unmodified auto-captured entries</h3>
          <div className={styles.clearRow}>
            {/* Dropdown + helper text */}
            <div className={styles.clearDropdownWrap}>
              <div className={styles.clearDropdownContainer}>
                <select
                  className={styles.clearDropdownSelect}
                  value={clearDuration}
                  onChange={(e) => setClearDuration(e.target.value as ClearDuration)}
                  aria-label="Clear duration"
                >
                  {CLEAR_DURATIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <ChevronDown size={16} className={styles.clearDropdownChevron} />
              </div>
              <p className={styles.clearHelperText}>
                Roblox will clear all unmodified entries that have been automatically captured.
                If you have you edited an entry or translation, that entry will not be cleared.
              </p>
            </div>

            {/* Clear action button */}
            <button className={styles.clearBtn} onClick={() => setClearModalOpen(true)}>
              Clear
            </button>
          </div>
        </div>

        <div className={styles.divider} />

      </div>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerLeft}>
          <span className={styles.footerCopy}>© 2025 Roblox Corporation.</span>
          <nav className={styles.footerLinks} aria-label="Legal links">
            <a href="#" className={styles.footerLink}>Terms</a>
            <span className={styles.footerDot} aria-hidden>·</span>
            <a href="#" className={styles.footerLink}>Privacy</a>
            <span className={styles.footerDot} aria-hidden>·</span>
            <a href="#" className={styles.footerLink}>Accessibility</a>
            <span className={styles.footerDot} aria-hidden>·</span>
            <a href="#" className={styles.footerLink}>Support</a>
          </nav>
        </div>

        <div className={styles.footerRight}>
          <div className={styles.footerSocials}>
            {SOCIALS.map(({ label, Icon }) => (
              <a key={label} href="#" aria-label={label} className={styles.footerSocialBtn}>
                <Icon />
              </a>
            ))}
          </div>
          <a href="#" className={styles.footerLang}>
            <Globe size={14} />
            English
          </a>
        </div>
      </footer>

      {/* ── Clear confirmation modal (portal) ───────────────────────────────── */}
      {clearModalOpen && createPortal(
        <div
          className={styles.modalBackdrop}
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-modal-title"
          onClick={() => setClearModalOpen(false)}
        >
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h2 id="clear-modal-title" className={styles.modalTitle}>Clear entries?</h2>
            <p className={styles.modalBody}>
              Are you sure you want to clear all unmodified auto-captured entries from the
              last <strong>{clearDuration}</strong>? This cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.modalCancelBtn} onClick={() => setClearModalOpen(false)}>
                Cancel
              </button>
              <button className={styles.modalConfirmBtn} onClick={handleClearConfirm}>
                Clear entries
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

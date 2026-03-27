import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { GlossaryFlowState, GlossaryFlowActions } from '../../hooks/useGlossaryFlow';
import styles from './CreateRulePanel.module.css';

type Props = Pick<GlossaryFlowState, 'isPanelOpen'> &
  Pick<GlossaryFlowActions, 'closePanel'>;

export default function CreateRulePanel({ isPanelOpen, closePanel }: Props) {
  // isRendered keeps the DOM node alive during the exit animation.
  // isOpen drives the CSS transition classes.
  const [isRendered, setIsRendered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isPanelOpen) {
      setIsRendered(true);
      // Two rAFs guarantee the element is painted before the transition starts
      const id = requestAnimationFrame(() =>
        requestAnimationFrame(() => setIsOpen(true)),
      );
      return () => cancelAnimationFrame(id);
    } else {
      setIsOpen(false);
      // Wait for the exit animation to finish before unmounting
      const timer = setTimeout(() => setIsRendered(false), 420);
      return () => clearTimeout(timer);
    }
  }, [isPanelOpen]);

  // Dismiss on Escape key
  useEffect(() => {
    if (!isRendered) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isRendered, closePanel]);

  if (!isRendered) return null;

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}>
      {/* Semi-transparent backdrop — click to dismiss */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ''}`}
        onClick={closePanel}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <div
        className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Create rule"
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Create rule</h2>
          <button
            className={styles.closeBtn}
            onClick={closePanel}
            aria-label="Close panel"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Body — form fields will be added in the next step */}
        <div className={styles.body} />

        {/* Footer actions */}
        <div className={styles.actions}>
          <div className={styles.actionsDivider} />
          <div className={styles.actionsRow}>
            <button className={styles.btnSave}>Save</button>
            <button className={styles.btnCancel} onClick={closePanel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

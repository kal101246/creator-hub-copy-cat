import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal } from 'lucide-react';
import type { GlossaryRule } from '../../types/glossary';
import styles from './GlossaryTable.module.css';

// ─── Tooltip rule summary text ────────────────────────────────────────────────

function getTooltipRuleText(rule: GlossaryRule): string {
  if (!rule.translate) return 'is never translated';
  if (rule.translatedTerm) return `is translated to "${rule.translatedTerm}"`;
  return 'is translated';
}

// ─── Translation rule (table column text) ────────────────────────────────────

function TranslationRule({ rule }: { rule: GlossaryRule }) {
  const langs =
    rule.targetLanguages.length > 0 ? rule.targetLanguages.join(', ') : 'All Languages';

  if (!rule.translate) {
    return <span className={styles.ruleText}>is never translated in {langs}</span>;
  }
  if (rule.translatedTerm) {
    return (
      <span className={styles.ruleText}>
        is translated to{' '}
        <span className={styles.ruleTextBold}>{rule.translatedTerm}</span>
        {' '}in {langs}
      </span>
    );
  }
  return <span className={styles.ruleText}>is translated in {langs}</span>;
}

// ─── Details pills ────────────────────────────────────────────────────────────

function DetailsPills({ rule }: { rule: GlossaryRule }) {
  const pills: string[] = [];
  if (rule.exactMatch) pills.push('Exact match');
  if (rule.partOfSpeech) {
    pills.push(rule.partOfSpeech.charAt(0).toUpperCase() + rule.partOfSpeech.slice(1));
  }
  if (pills.length === 0) return <span className={styles.ruleText}>—</span>;
  return (
    <div className={styles.pillGroup}>
      {pills.map((p) => (
        <span key={p} className={styles.pill}>{p}</span>
      ))}
    </div>
  );
}

// ─── Row overflow menu (portalled to <body>) ──────────────────────────────────

interface MenuPos {
  top: number;
  right: number;
}

interface OverflowMenuProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function OverflowMenu({ isOpen, onOpen, onClose, onEdit, onDelete }: OverflowMenuProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<MenuPos | null>(null);

  // Compute fixed position from button's bounding rect when opening
  const openMenu = useCallback(() => {
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      setMenuPos({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
    onOpen();
  }, [onOpen]);

  // Close on click outside (both button and portal menu)
  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      const target = e.target as Node;
      if (!btnRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        onClose();
      }
    },
    [onClose],
  );

  // Close on scroll or resize to avoid stale position
  const handleScrollOrResize = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, handleMouseDown, handleScrollOrResize]);

  const menu =
    isOpen && menuPos
      ? createPortal(
          <div
            ref={menuRef}
            className={styles.menu}
            role="menu"
            style={{ top: menuPos.top, right: menuPos.right }}
          >
            <button
              className={styles.menuItem}
              role="menuitem"
              onClick={() => { onEdit(); onClose(); }}
            >
              Edit rule
            </button>
            <button className={styles.menuItem} role="menuitem">
              <span>View translation table</span>
              <span className={styles.menuItemSub}>filtered by this term</span>
            </button>
            <button
              className={`${styles.menuItem} ${styles.menuItemDanger}`}
              role="menuitem"
              onClick={() => { onDelete(); onClose(); }}
            >
              Delete
            </button>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={btnRef}
        className={`${styles.overflowBtn} ${isOpen ? styles.overflowBtnActive : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          isOpen ? onClose() : openMenu();
        }}
        aria-label="More options"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <MoreHorizontal size={16} />
      </button>
      {menu}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  rules: GlossaryRule[];
  onEditRule: (ruleId: string) => void;
  onDeleteRule: (ruleId: string) => void;
}

export default function GlossaryTable({ rules, onEditRule, onDeleteRule }: Props) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <div className={styles.table}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div className={`${styles.headerCell} ${styles.colTerm}`}>Term</div>
        <div className={`${styles.headerCell} ${styles.colRule}`}>Translation rule</div>
        <div className={`${styles.headerCell} ${styles.colDetails}`}>Details</div>
        <div className={`${styles.headerCell} ${styles.colNotes}`}>Notes</div>
        <div className={`${styles.headerCell} ${styles.colActions}`} />
      </div>

      {/* Rows */}
      {rules.length === 0 ? (
        <div className={styles.emptyRow}>No rules yet.</div>
      ) : (
        rules.map((rule) => (
          <div key={rule.id} className={styles.dataRow}>

            {/* Term + hover tooltip */}
            <div className={`${styles.cell} ${styles.colTerm}`}>
              <div className={styles.termCellInner}>
                <span className={styles.termText}>{rule.term || '—'}</span>
                <div className={styles.tooltip}>
                  <div className={styles.tooltipCaret} />
                  <div className={styles.tooltipInner}>
                    <div className={styles.tooltipTitle}>
                      <span className={styles.tooltipTerm}>{rule.term}</span>
                      <span className={styles.tooltipRule}>{getTooltipRuleText(rule)}</span>
                    </div>
                    {rule.notes && (
                      <p className={styles.tooltipNotes}>{rule.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Translation rule */}
            <div className={`${styles.cell} ${styles.colRule}`}>
              <TranslationRule rule={rule} />
            </div>

            {/* Details */}
            <div className={`${styles.cell} ${styles.colDetails}`}>
              <DetailsPills rule={rule} />
            </div>

            {/* Notes */}
            <div className={`${styles.cell} ${styles.colNotes}`}>
              <p className={styles.notesText}>{rule.notes || '—'}</p>
            </div>

            {/* Overflow menu */}
            <div className={`${styles.cell} ${styles.colActions}`}>
              <OverflowMenu
                isOpen={openMenuId === rule.id}
                onOpen={() => setOpenMenuId(rule.id)}
                onClose={() => setOpenMenuId(null)}
                onEdit={() => onEditRule(rule.id)}
                onDelete={() => onDeleteRule(rule.id)}
              />
            </div>

          </div>
        ))
      )}
    </div>
  );
}

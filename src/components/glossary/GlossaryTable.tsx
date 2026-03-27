import { MoreHorizontal } from 'lucide-react';
import type { GlossaryRule } from '../../types/glossary';
import styles from './GlossaryTable.module.css';

// ─── Translation rule sentence ────────────────────────────────────────────────

function TranslationRule({ rule }: { rule: GlossaryRule }) {
  const langs =
    rule.targetLanguages.length > 0
      ? rule.targetLanguages.join(', ')
      : 'All Languages';

  if (!rule.translate) {
    return (
      <span className={styles.ruleText}>
        is never translated in {langs}
      </span>
    );
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

  return (
    <span className={styles.ruleText}>
      is translated in {langs}
    </span>
  );
}

// ─── Details pills ────────────────────────────────────────────────────────────

function DetailsPills({ rule }: { rule: GlossaryRule }) {
  const pills: string[] = [];
  if (rule.exactMatch) pills.push('Exact match');
  if (rule.partOfSpeech) {
    const label = rule.partOfSpeech.charAt(0).toUpperCase() + rule.partOfSpeech.slice(1);
    pills.push(label);
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

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  rules: GlossaryRule[];
}

export default function GlossaryTable({ rules }: Props) {
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
            {/* Term */}
            <div className={`${styles.cell} ${styles.colTerm}`}>
              <span className={styles.termText}>{rule.term || '—'}</span>
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
              <button className={styles.overflowBtn} aria-label="More options">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

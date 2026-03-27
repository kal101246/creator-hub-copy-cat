import { useEffect, useState, useRef } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import type { GlossaryFlowState, GlossaryFlowActions } from '../../hooks/useGlossaryFlow';
import type { PartOfSpeech } from '../../types/glossary';
import styles from './CreateRulePanel.module.css';

// ─── Constants ────────────────────────────────────────────────────────────────

const LANGUAGES = [
  'Japanese',
  'French',
  'Italian',
  'German',
  'Spanish',
  'Portuguese',
  'Korean',
  'Chinese (Simplified)',
  'Chinese (Traditional)',
  'Arabic',
  'Russian',
  'Dutch',
  'Polish',
  'Turkish',
];

const PARTS_OF_SPEECH: PartOfSpeech[] = [
  'noun',
  'verb',
  'adjective',
  'adverb',
  'pronoun',
  'preposition',
  'conjunction',
  'interjection',
  'proper noun',
];

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Target Languages multi-select ────────────────────────────────────────────

interface TargetLanguagesFieldProps {
  value: string[];
  onChange: (langs: string[]) => void;
}

function TargetLanguagesField({ value, onChange }: TargetLanguagesFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const toggle = (lang: string) =>
    onChange(
      value.includes(lang) ? value.filter((l) => l !== lang) : [...value, lang],
    );

  return (
    <div ref={ref} className={styles.multiSelectContainer}>
      <div
        className={`${styles.multiSelectField} ${isOpen ? styles.multiSelectFieldOpen : ''}`}
        onClick={() => setIsOpen((o) => !o)}
      >
        <div className={styles.chipsRow}>
          {value.length === 0 && (
            <span className={styles.placeholder}>Select an option</span>
          )}
          {value.map((lang) => (
            <span key={lang} className={styles.chip}>
              {lang}
              <button
                className={styles.chipRemove}
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(lang);
                }}
                aria-label={`Remove ${lang}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className={styles.multiSelectTrailing}>
          {value.length > 0 && (
            <button
              className={styles.clearBtn}
              onClick={(e) => {
                e.stopPropagation();
                onChange([]);
              }}
            >
              Clear
            </button>
          )}
          <ChevronDown size={16} color="var(--content-default)" />
        </div>
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          {LANGUAGES.map((lang) => (
            <div
              key={lang}
              className={`${styles.dropdownItem} ${value.includes(lang) ? styles.dropdownItemSelected : ''}`}
              onClick={() => toggle(lang)}
            >
              {lang}
              {value.includes(lang) && <Check size={14} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

type Props = Pick<GlossaryFlowState, 'isPanelOpen' | 'draftRule'> &
  Pick<GlossaryFlowActions, 'closePanel' | 'updateDraft' | 'submitRule'>;

export default function CreateRulePanel({
  isPanelOpen,
  closePanel,
  draftRule,
  updateDraft,
  submitRule,
}: Props) {
  const [isRendered, setIsRendered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Mount/unmount with entry + exit animation
  useEffect(() => {
    if (isPanelOpen) {
      setIsRendered(true);
      const id = requestAnimationFrame(() =>
        requestAnimationFrame(() => setIsOpen(true)),
      );
      return () => cancelAnimationFrame(id);
    } else {
      setIsOpen(false);
      const timer = setTimeout(() => setIsRendered(false), 420);
      return () => clearTimeout(timer);
    }
  }, [isPanelOpen]);

  // Dismiss on Escape
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
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ''}`}
        onClick={closePanel}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Create rule"
      >
        {/* ── Header ───────────────────────────────────────────── */}
        <div className={styles.header}>
          <h2 className={styles.title}>Create rule</h2>
          <button className={styles.closeBtn} onClick={closePanel} aria-label="Close panel">
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* ── Scrollable body ──────────────────────────────────── */}
        <div className={styles.body}>
          <div className={styles.formContent}>

            {/* Term */}
            <div className={styles.fieldGroup}>
              <div className={styles.fieldLabel}>
                <span>Term</span>
                <span className={styles.required}>*</span>
              </div>
              <input
                className={styles.textInput}
                type="text"
                placeholder="Placeholder"
                value={draftRule.term}
                onChange={(e) => updateDraft({ term: e.target.value })}
              />
              <p className={styles.helperText}>
                You can add synonyms by separating them with commas (e.g. term1, term2).
              </p>
            </div>

            {/* Exact match */}
            <div className={styles.toggleRow}>
              <button
                role="switch"
                aria-checked={draftRule.exactMatch}
                className={`${styles.toggleTrack} ${draftRule.exactMatch ? styles.toggleOn : ''}`}
                onClick={() => updateDraft({ exactMatch: !draftRule.exactMatch })}
              >
                <span className={styles.toggleThumb} />
              </button>
              <span className={styles.toggleLabel}>Exact match</span>
            </div>

            {/* Translate */}
            <div className={styles.toggleRow}>
              <button
                role="switch"
                aria-checked={draftRule.translate}
                className={`${styles.toggleTrack} ${draftRule.translate ? styles.toggleOn : ''}`}
                onClick={() => updateDraft({ translate: !draftRule.translate })}
              >
                <span className={styles.toggleThumb} />
              </button>
              <span className={styles.toggleLabel}>Translate</span>
            </div>

            {/* Target languages */}
            <div className={styles.fieldGroup}>
              <div className={styles.fieldLabel}>
                <span>Target languages</span>
                <span className={styles.required}>*</span>
              </div>
              <TargetLanguagesField
                value={draftRule.targetLanguages}
                onChange={(langs) => updateDraft({ targetLanguages: langs })}
              />
            </div>

            {/* Translated term — only shown when Translate is ON */}
            {draftRule.translate && (
              <div className={styles.fieldGroup}>
                <div className={styles.fieldLabel}>
                  <span>Translated term</span>
                  <span className={styles.required}>*</span>
                </div>
                <input
                  className={styles.textInput}
                  type="text"
                  placeholder="Placeholder"
                  value={draftRule.translatedTerm}
                  onChange={(e) => updateDraft({ translatedTerm: e.target.value })}
                />
              </div>
            )}

            {/* Part of speech */}
            <div className={styles.fieldGroup}>
              <div className={styles.fieldLabel}>
                <span>Part of speech</span>
              </div>
              <div className={styles.selectWrapper}>
                <select
                  className={styles.selectInput}
                  value={draftRule.partOfSpeech ?? ''}
                  onChange={(e) =>
                    updateDraft({
                      partOfSpeech: (e.target.value as PartOfSpeech) || null,
                    })
                  }
                >
                  <option value="">Select an option</option>
                  {PARTS_OF_SPEECH.map((pos) => (
                    <option key={pos} value={pos}>
                      {capitalize(pos)}
                    </option>
                  ))}
                </select>
                <span className={styles.selectChevron}>
                  <ChevronDown size={16} />
                </span>
              </div>
            </div>

            {/* Notes */}
            <div className={styles.fieldGroup}>
              <div className={styles.fieldLabel}>
                <span>Notes</span>
              </div>
              <textarea
                className={styles.textarea}
                placeholder="Describe your rule"
                value={draftRule.notes}
                onChange={(e) => updateDraft({ notes: e.target.value })}
              />
            </div>

          </div>
        </div>

        {/* ── Footer actions ───────────────────────────────────── */}
        <div className={styles.actions}>
          <div className={styles.actionsDivider} />
          <div className={styles.actionsRow}>
            <button className={styles.btnSave} onClick={submitRule}>Save</button>
            <button className={styles.btnCancel} onClick={closePanel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

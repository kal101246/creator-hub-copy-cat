import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { GlossaryFlowActions } from '../../hooks/useGlossaryFlow';
import styles from './DeleteRuleModal.module.css';

type Props = Pick<GlossaryFlowActions, 'closeDeleteModal' | 'deleteRule'>;

export default function DeleteRuleModal({ closeDeleteModal, deleteRule }: Props) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDeleteModal();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeDeleteModal]);

  const handleDelete = () => {
    deleteRule();
  };

  return createPortal(
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) closeDeleteModal(); }}
    >
      <div className={styles.dialog}>
        <h2 id="delete-modal-title" className={styles.title}>Delete rule?</h2>
        <p className={styles.body}>
          This action cannot be undone. The rule will be permanently removed from the glossary.
        </p>
        <div className={styles.actions}>
          <button className={styles.btnCancel} onClick={closeDeleteModal}>
            Cancel
          </button>
          <button className={styles.btnDelete} onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

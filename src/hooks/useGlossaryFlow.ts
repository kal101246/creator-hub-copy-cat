import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { GlossaryRule, CreateRuleDraft } from '../types/glossary';
import { DRAFT_DEFAULTS } from '../types/glossary';

export interface GlossaryFlowState {
  isPanelOpen: boolean;
  draftRule: CreateRuleDraft;
  rules: GlossaryRule[];
  showSuccessToast: boolean;
}

export interface GlossaryFlowActions {
  openPanel: () => void;
  closePanel: () => void;
  updateDraft: (patch: Partial<CreateRuleDraft>) => void;
  submitRule: () => void;
  dismissToast: () => void;
}

export function useGlossaryFlow(): GlossaryFlowState & GlossaryFlowActions {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [draftRule, setDraftRule] = useState<CreateRuleDraft>(DRAFT_DEFAULTS);
  const [rules, setRules] = useState<GlossaryRule[]>([]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const openPanel = useCallback(() => {
    setDraftRule(DRAFT_DEFAULTS);
    setIsPanelOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  const updateDraft = useCallback((patch: Partial<CreateRuleDraft>) => {
    setDraftRule((prev) => ({ ...prev, ...patch }));
  }, []);

  const submitRule = useCallback(() => {
    const newRule: GlossaryRule = { id: uuidv4(), ...draftRule };
    setRules((prev) => [...prev, newRule]);
    setIsPanelOpen(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  }, [draftRule]);

  const dismissToast = useCallback(() => {
    setShowSuccessToast(false);
  }, []);

  return {
    isPanelOpen,
    draftRule,
    rules,
    showSuccessToast,
    openPanel,
    closePanel,
    updateDraft,
    submitRule,
    dismissToast,
  };
}

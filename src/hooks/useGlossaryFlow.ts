import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { GlossaryRule, CreateRuleDraft } from '../types/glossary';
import { DRAFT_DEFAULTS } from '../types/glossary';

export interface GlossaryFlowState {
  isPanelOpen: boolean;
  isEditing: boolean;
  draftRule: CreateRuleDraft;
  rules: GlossaryRule[];
  showSuccessToast: boolean;
  isDeleteModalOpen: boolean;
}

export interface GlossaryFlowActions {
  openPanel: () => void;
  closePanel: () => void;
  updateDraft: (patch: Partial<CreateRuleDraft>) => void;
  submitRule: () => void;
  editRule: (ruleId: string) => void;
  openDeleteModal: (ruleId: string) => void;
  closeDeleteModal: () => void;
  deleteRule: () => void;
  dismissToast: () => void;
}

// ─── Seed data (matches Figma mockups) ───────────────────────────────────────

const SEED_RULES: GlossaryRule[] = [
  {
    id: 'seed-1',
    term: 'Spike',
    exactMatch: true,
    translate: true,
    targetLanguages: ['Japanese'],
    translatedTerm: 'カケル',
    partOfSpeech: 'proper noun',
    notes: 'Main character; his name needs to be translated differently in Japanese.',
  },
  {
    id: 'seed-2',
    term: 'Spike',
    exactMatch: true,
    translate: true,
    targetLanguages: ['French', 'Italian', 'German'],
    translatedTerm: 'Kakeru',
    partOfSpeech: 'proper noun',
    notes: 'His name in Europe is different than his name in US and Japan.',
  },
  {
    id: 'seed-3',
    term: 'Amazing, Great, Wonderful',
    exactMatch: false,
    translate: true,
    targetLanguages: ['Japanese'],
    translatedTerm: 'すごい',
    partOfSpeech: 'adjective',
    notes: 'Very common phrase; we want to keep it consistent whenever it shows.',
  },
  {
    id: 'seed-4',
    term: 'Blue',
    exactMatch: true,
    translate: false,
    targetLanguages: [],
    translatedTerm: '',
    partOfSpeech: 'proper noun',
    notes: "Important NPC's name; we don't want to confuse it with the color blue.",
  },
  {
    id: 'seed-5',
    term: 'Sony',
    exactMatch: false,
    translate: false,
    targetLanguages: [],
    translatedTerm: '',
    partOfSpeech: 'proper noun',
    notes: "IP Holder; a well known brand name that shouldn't be translated ever.",
  },
];

export function useGlossaryFlow(): GlossaryFlowState & GlossaryFlowActions {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editRuleId, setEditRuleId] = useState<string | null>(null);
  const [draftRule, setDraftRule] = useState<CreateRuleDraft>(DRAFT_DEFAULTS);
  const [rules, setRules] = useState<GlossaryRule[]>(SEED_RULES);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // ── Panel ───────────────────────────────────────────────────────────────────

  const openPanel = useCallback(() => {
    setDraftRule(DRAFT_DEFAULTS);
    setEditRuleId(null);
    setIsPanelOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
    setEditRuleId(null);
  }, []);

  // ── Draft ───────────────────────────────────────────────────────────────────

  const updateDraft = useCallback((patch: Partial<CreateRuleDraft>) => {
    setDraftRule((prev) => ({ ...prev, ...patch }));
  }, []);

  // ── Create / update ─────────────────────────────────────────────────────────

  const submitRule = useCallback(() => {
    if (editRuleId) {
      setRules((prev) =>
        prev.map((r) => (r.id === editRuleId ? { ...r, ...draftRule } : r)),
      );
      setEditRuleId(null);
    } else {
      const newRule: GlossaryRule = { id: uuidv4(), ...draftRule };
      setRules((prev) => [...prev, newRule]);
    }
    setIsPanelOpen(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  }, [draftRule, editRuleId]);

  // ── Edit ────────────────────────────────────────────────────────────────────

  const editRule = useCallback(
    (ruleId: string) => {
      const rule = rules.find((r) => r.id === ruleId);
      if (!rule) return;
      const { id: _id, ...draft } = rule;
      setDraftRule(draft);
      setEditRuleId(ruleId);
      setIsPanelOpen(true);
    },
    [rules],
  );

  // ── Delete ──────────────────────────────────────────────────────────────────

  const openDeleteModal = useCallback((ruleId: string) => {
    setDeleteTargetId(ruleId);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteTargetId(null);
  }, []);

  const deleteRule = useCallback(() => {
    if (!deleteTargetId) return;
    setRules((prev) => prev.filter((r) => r.id !== deleteTargetId));
    setDeleteTargetId(null);
  }, [deleteTargetId]);

  // ── Toast ───────────────────────────────────────────────────────────────────

  const dismissToast = useCallback(() => {
    setShowSuccessToast(false);
  }, []);

  return {
    isPanelOpen,
    isEditing: editRuleId !== null,
    draftRule,
    rules,
    showSuccessToast,
    isDeleteModalOpen: deleteTargetId !== null,
    openPanel,
    closePanel,
    updateDraft,
    submitRule,
    editRule,
    openDeleteModal,
    closeDeleteModal,
    deleteRule,
    dismissToast,
  };
}

export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'pronoun'
  | 'preposition'
  | 'conjunction'
  | 'interjection'
  | 'proper noun';

export interface GlossaryRule {
  id: string;
  term: string;
  exactMatch: boolean;
  translate: boolean;
  targetLanguages: string[];
  translatedTerm: string;
  partOfSpeech: PartOfSpeech | null;
  notes: string;
}

export type CreateRuleDraft = Omit<GlossaryRule, 'id'>;

export const DRAFT_DEFAULTS: CreateRuleDraft = {
  term: '',
  exactMatch: false,
  translate: false,
  targetLanguages: [],
  translatedTerm: '',
  partOfSpeech: null,
  notes: '',
};

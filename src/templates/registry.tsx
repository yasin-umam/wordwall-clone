import type { ComponentType } from 'react';
import type { ContentShape, TemplateType } from '@/types';
import type { TemplateProps } from './types';
import { QuizTemplate } from './QuizTemplate';
import { MatchUpTemplate } from './MatchUpTemplate';
import { AnagramTemplate } from './AnagramTemplate';
import { OpenBoxTemplate } from './OpenBoxTemplate';
import { WheelTemplate } from './WheelTemplate';
import { FlashCardsTemplate } from './FlashCardsTemplate';

export interface TemplateMeta {
  type: TemplateType;
  name: string;
  description: string;
  icon: string;
  /** Shape konten yang dikonsumsi (untuk kompatibilitas Switch Template). */
  shape: ContentShape;
  component: ComponentType<TemplateProps>;
}

/**
 * REGISTRY TEMPLATE — satu-satunya tempat template didaftarkan.
 * Menambah template baru = buat komponen lalu tambahkan entry di sini.
 * Editor, play mode, dan switch-template membaca dari registry ini.
 */
export const TEMPLATES: Record<TemplateType, TemplateMeta> = {
  quiz: {
    type: 'quiz',
    name: 'Quiz',
    description: 'Pilih jawaban benar dari beberapa opsi. Skor + timer.',
    icon: '❓',
    shape: 'items',
    component: QuizTemplate,
  },
  match_up: {
    type: 'match_up',
    name: 'Match Up',
    description: 'Tarik & jodohkan pasangan kiri–kanan.',
    icon: '🔗',
    shape: 'pairs',
    component: MatchUpTemplate,
  },
  anagram: {
    type: 'anagram',
    name: 'Anagram',
    description: 'Susun huruf acak menjadi kata yang benar.',
    icon: '🔤',
    shape: 'words',
    component: AnagramTemplate,
  },
  open_box: {
    type: 'open_box',
    name: 'Open the Box',
    description: 'Klik kotak untuk membuka item acak.',
    icon: '🎁',
    shape: 'items',
    component: OpenBoxTemplate,
  },
  wheel: {
    type: 'wheel',
    name: 'Random Wheel',
    description: 'Putar roda untuk memilih item secara acak.',
    icon: '🎡',
    shape: 'items',
    component: WheelTemplate,
  },
  flashcards: {
    type: 'flashcards',
    name: 'Flash Cards',
    description: 'Balik kartu dua sisi, navigasi maju/mundur.',
    icon: '🃏',
    shape: 'pairs',
    component: FlashCardsTemplate,
  },
};

export const TEMPLATE_LIST: TemplateMeta[] = Object.values(TEMPLATES);

export function getTemplate(type: TemplateType): TemplateMeta {
  return TEMPLATES[type];
}

import { TEMPLATE_SHAPE } from '@/lib/contentEngine';
import type { ActivityContent, TemplateType } from '@/types';
import { ItemsEditor } from './ItemsEditor';
import { PairsEditor } from './PairsEditor';
import { WordsEditor } from './WordsEditor';

/**
 * EDITOR KONTEN UNIVERSAL — memilih sub-editor sesuai shape template.
 * Inti tetap sama berapa pun template; menambah template tak mengubah editor.
 */
export function ContentEditor({
  template,
  content,
  onChange,
}: {
  template: TemplateType;
  content: ActivityContent;
  onChange: (c: ActivityContent) => void;
}) {
  const shape = TEMPLATE_SHAPE[template];

  if (shape === 'items') {
    return <ItemsEditor content={content} onChange={onChange} needsOptions={template === 'quiz'} />;
  }
  if (shape === 'pairs') {
    return (
      <PairsEditor
        content={content}
        onChange={onChange}
        leftLabel={template === 'flashcards' ? 'Depan' : 'Kiri'}
        rightLabel={template === 'flashcards' ? 'Belakang' : 'Kanan'}
      />
    );
  }
  return <WordsEditor content={content} onChange={onChange} />;
}

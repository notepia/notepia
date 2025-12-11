import { FC, useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Search, FileText, Check, Plus, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { extractTextFromTipTapJSON } from '@/utils/tiptap';

interface Note {
  id: string;
  content: string;
  created_at?: string;
}

interface NotePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: Note[];
  selectedNoteId?: string;
  onSelect: (noteId: string) => void;
  onCreateNote?: () => void;
  isCreatingNote?: boolean;
}

const NotePickerDialog: FC<NotePickerDialogProps> = ({
  open,
  onOpenChange,
  notes,
  selectedNoteId,
  onSelect,
  onCreateNote,
  isCreatingNote = false,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSelectedNoteId, setTempSelectedNoteId] = useState<string | undefined>(selectedNoteId);

  useEffect(() => {
    if (open) {
      setTempSelectedNoteId(selectedNoteId);
      setSearchQuery('');
    }
  }, [open, selectedNoteId]);

  const filteredNotes = notes.filter((note) => {
    if (!searchQuery.trim()) return true;
    const noteText = extractTextFromTipTapJSON(note.content || '').toLowerCase();
    return noteText.includes(searchQuery.toLowerCase());
  });

  const handleConfirm = () => {
    if (tempSelectedNoteId) {
      onSelect(tempSelectedNoteId);
      onOpenChange(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-800 rounded-lg shadow-xl p-6 w-[90vw] max-w-[600px] z-50 max-h-[85vh] flex flex-col">
          <Dialog.Title className="text-xl font-semibold mb-4">
            {t('widgets.config.selectNote')}
          </Dialog.Title>

          {/* Create Note Button */}
          {onCreateNote && (
            <button
              type="button"
              onClick={onCreateNote}
              disabled={isCreatingNote}
              className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCreatingNote ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  <span className="text-sm font-medium">{t('common.creating')}</span>
                </>
              ) : (
                <>
                  <Plus size={18} />
                  <span className="text-sm font-medium">{t('notes.createNew')}</span>
                </>
              )}
            </button>
          )}

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('views.searchNotes')}
                className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-neutral-600 bg-white dark:bg-neutral-800"
              />
            </div>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto border dark:border-neutral-600 rounded-lg">
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => {
                const noteText = note.content
                  ? extractTextFromTipTapJSON(note.content).slice(0, 80)
                  : t('notes.untitled');
                const isSelected = tempSelectedNoteId === note.id;

                return (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => setTempSelectedNoteId(note.id)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-neutral-700 border-b dark:border-neutral-700 last:border-b-0 transition-colors flex items-center justify-between ${
                      isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText
                        size={18}
                        className={isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}
                      />
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-sm truncate ${
                            isSelected ? 'text-blue-600 dark:text-blue-400 font-medium' : ''
                          }`}
                        >
                          {noteText}
                        </div>
                        {note.created_at && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {new Date(note.created_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Check size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <FileText size={48} className="mb-4 text-gray-300 dark:text-gray-600" />
                <p>{searchQuery.trim() ? t('views.noNotesFound') : t('widgets.config.selectNotePlaceholder')}</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close asChild>
              <button className="px-4 py-2 border dark:border-neutral-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                {t('common.cancel')}
              </button>
            </Dialog.Close>
            <button
              onClick={handleConfirm}
              disabled={!tempSelectedNoteId}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common.save')}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default NotePickerDialog;

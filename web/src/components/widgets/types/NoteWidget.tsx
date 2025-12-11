import { FC, useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Loader2, ExternalLink, User, Check, Loader, FileText } from 'lucide-react';
import { getNote, getNotes, updateNote, createNote } from '@/api/note';
import useCurrentWorkspaceId from '@/hooks/use-currentworkspace-id';
import { NoteWidgetConfig } from '@/types/widget';
import Widget from '@/components/widgets/Widget';
import Editor from '@/components/editor/Editor';
import { registerWidget, WidgetProps, WidgetConfigFormProps } from '../widgetRegistry';
import { useToastStore } from '@/stores/toast';
import NotePickerDialog from '../NotePickerDialog';

interface NoteWidgetProps extends WidgetProps {
  config: NoteWidgetConfig;
}

const NoteWidget: FC<NoteWidgetProps> = ({ config }) => {
  const { t } = useTranslation();
  const workspaceId = useCurrentWorkspaceId();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const { data: note, isLoading, error } = useQuery({
    queryKey: ['note', workspaceId, config.noteId],
    queryFn: () => getNote(workspaceId, config.noteId),
    enabled: !!workspaceId && !!config.noteId,
  });

  const updateNoteMutation = useMutation({
    mutationFn: (data: { content: string }) => {
      return updateNote(workspaceId, {
        id: config.noteId,
        content: data.content,
      });
    },
    onSuccess: () => {
      setSaveStatus('saved');
      queryClient.invalidateQueries({ queryKey: ['note', workspaceId, config.noteId] });
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
    onError: () => {
      setSaveStatus('idle');
    },
  });

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const handleNoteChange = useCallback((data: { content: string }) => {
    // Clear existing timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    setSaveStatus('saving');

    // Set new debounced save timer (1 second delay)
    saveTimerRef.current = setTimeout(() => {
      updateNoteMutation.mutate(data);
    }, 1000);
  }, [updateNoteMutation]);

  if (!config.noteId) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
        {t('widgets.noNoteSelected')}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-500" size={24} />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
        {t('widgets.noteNotFound')}
      </div>
    );
  }

  const handleOpenNote = () => {
    navigate(`/workspaces/${workspaceId}/notes/${config.noteId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Widget withPadding={false}>
      <div className="h-full flex flex-col overflow-auto p-4">
        {/* Metadata */}
        {config.showMetadata && (
          <div className='flex justify-between'>
            <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
              {note.created_at && (
                <div className="flex items-center gap-1">
                  <span>{formatDate(note.created_at)}</span>
                </div>
              )}
              {note.created_by && (
                <div className="flex items-center gap-1">
                  <User size={12} />
                  <span>{note.created_by}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Save Status Indicator */}
              {saveStatus === 'saving' && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Loader className="animate-spin" size={12} />
                  <span>{t('widgets.saving')}</span>
                </div>
              )}
              {saveStatus === 'saved' && (
                <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <Check size={12} />
                  <span>{t('widgets.saved')}</span>
                </div>
              )}

              <button
                onClick={handleOpenNote}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex-shrink-0"
                title={t('widgets.openNote')}
              >
                <ExternalLink size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Note Header */}
        <div className=" flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {note.title && (
              <div className="text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
                {note.title}
              </div>
            )}
          </div>
        </div>

        {/* Note Content - Editable Editor */}
        {note.content && (
          <div className="flex-1 overflow-auto">
            <Editor note={note} onChange={handleNoteChange} />
          </div>
        )}

        {!note.content && (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            {t('widgets.emptyNote')}
          </div>
        )}
      </div>
    </Widget>
  );
};

// Configuration Form Component
export const NoteWidgetConfigForm: FC<WidgetConfigFormProps<NoteWidgetConfig>> = ({
  config,
  onChange,
}) => {
  const { t } = useTranslation();
  const workspaceId = useCurrentWorkspaceId();
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();
  const [showNotePickerDialog, setShowNotePickerDialog] = useState(false);

  const { data: notes = [] } = useQuery({
    queryKey: ['notes', workspaceId, 'widget-config'],
    queryFn: () => getNotes(workspaceId, 1, 100, ''),
    enabled: !!workspaceId,
  });

  const createNoteMutation = useMutation({
    mutationFn: () => {
      // Create an empty note with minimal content
      const emptyContent = JSON.stringify({
        type: 'doc',
        content: [{ type: 'paragraph' }]
      });
      return createNote(workspaceId, {
        content: emptyContent,
        visibility: 'workspace',
      });
    },
    onSuccess: (newNote) => {
      queryClient.invalidateQueries({ queryKey: ['notes', workspaceId, 'widget-config'] });
      addToast({ type: 'success', title: t('notes.createSuccess') });
      // Automatically select the newly created note
      onChange({ ...config, noteId: newNote.id });
    },
    onError: () => {
      addToast({ type: 'error', title: t('notes.createError') });
    },
  });

  const handleCreateNote = () => {
    createNoteMutation.mutate();
  };

  const handleNoteSelect = (noteId: string) => {
    onChange({ ...config, noteId });
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="space-y-2">
          {/* Single Action Button */}
          <button
            type="button"
            onClick={() => setShowNotePickerDialog(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border rounded-lg"
          >
            <FileText size={18} />
            <span className="text-sm font-medium">
              {config.noteId ? t('widgets.config.changeNote') : t('widgets.config.selectNote')}
            </span>
          </button>

          {/* Note Picker Dialog */}
          <NotePickerDialog
            open={showNotePickerDialog}
            onOpenChange={setShowNotePickerDialog}
            notes={notes}
            selectedNoteId={config.noteId}
            onSelect={handleNoteSelect}
            onCreateNote={handleCreateNote}
            isCreatingNote={createNoteMutation.isPending}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showMetadata"
          checked={config.showMetadata}
          onChange={(e) => onChange({ ...config, showMetadata: e.target.checked })}
        />
        <label htmlFor="showMetadata" className="text-sm">{t('widgets.config.showMetadata')}</label>
      </div>
    </div>
  );
};

// Register widget
registerWidget({
  type: 'note',
  label: 'widgets.types.note',
  description: 'widgets.types.noteDesc',
  defaultConfig: {
    noteId: '',
    showMetadata: true,
  },
  Component: NoteWidget,
  ConfigForm: NoteWidgetConfigForm,
});

export default NoteWidget;
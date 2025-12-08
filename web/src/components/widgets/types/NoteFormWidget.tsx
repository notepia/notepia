import { FC, useCallback, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import { createNote, NoteData } from '@/api/note';
import useCurrentWorkspaceId from '@/hooks/use-currentworkspace-id';
import { useToastStore } from '@/stores/toast';
import { NoteFormWidgetConfig } from '@/types/widget';
import Widget from '@/components/widgets/Widget';
import { registerWidget, WidgetProps, WidgetConfigFormProps } from '../widgetRegistry';
import Editor from '@/components/editor/Editor';

interface NoteFormWidgetProps extends WidgetProps {
  config: NoteFormWidgetConfig;
}

const NoteFormWidget: FC<NoteFormWidgetProps> = ({ config }) => {
  const { t } = useTranslation();
  const workspaceId = useCurrentWorkspaceId();
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();
  const initContent = JSON.stringify({
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: ""
          }
        ]
      }
    ]
  })

  const [note, setNote] = useState<NoteData>({
    content: initContent
  });

  const createMutation = useMutation({
    mutationFn: () => {
      return createNote(workspaceId, {
        visibility: 'workspace',
        ...note
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', workspaceId] });
      addToast({ type: 'success', title: t('notes.createSuccess') });
    },
    onError: () => {
      addToast({ type: 'error', title: t('notes.createError') });
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  const handleNoteChange = (data: { content: string }) => {
    setNote({ content: data.content })
  };

  return (
    <Widget>
      <div className='h-full flex flex-col'>
        <div className='flex-1 overflow-visible'>
          <Editor
            note={note}
            canDrag={false}
            onChange={handleNoteChange}
          />
        </div>
        <button
          disabled={createMutation.isPending}
          onClick={handleSave}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={16} />
          {createMutation.isPending ? t('common.saving') : t('notes.quickCreate')}
        </button>
      </div>
    </Widget>
  );
};

// Configuration Form Component
export const NoteFormWidgetConfigForm: FC<WidgetConfigFormProps<NoteFormWidgetConfig>> = ({
  config,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">{t('widgets.config.placeholder')}</label>
        <input
          type="text"
          value={config.placeholder || ''}
          onChange={(e) => onChange({ ...config, placeholder: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border dark:border-neutral-600 bg-white dark:bg-neutral-800"
          placeholder={t('widgets.config.placeholderHint')}
        />
      </div>
    </div>
  );
};

// Register widget
registerWidget({
  type: 'note_form',
  label: 'widgets.types.noteForm',
  description: 'widgets.types.noteFormDesc',
  defaultConfig: {},
  Component: NoteFormWidget,
  ConfigForm: NoteFormWidgetConfigForm,
});

export default NoteFormWidget;
import { FC, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import { createNote } from '@/api/note';
import useCurrentWorkspaceId from '@/hooks/use-currentworkspace-id';
import { useToastStore } from '@/stores/toast';
import { NoteFormWidgetConfig } from '@/types/widget';
import Widget from '@/components/widgets/Widget';
import { registerWidget, WidgetProps, WidgetConfigFormProps } from '../widgetRegistry';

interface NoteFormWidgetProps extends WidgetProps {
  config: NoteFormWidgetConfig;
}

const NoteFormWidget: FC<NoteFormWidgetProps> = ({ config }) => {
  const { t } = useTranslation();
  const workspaceId = useCurrentWorkspaceId();
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const [title, setTitle] = useState(config.defaultTitle || '');
  const [content, setContent] = useState('');

  const createMutation = useMutation({
    mutationFn: () => {
      const tiptapContent = JSON.stringify({
        type: "doc",
        content: content.trim() ? [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: content
              }
            ]
          }
        ] : []
      });

      return createNote(workspaceId, {
        title,
        content: tiptapContent,
        visibility: 'workspace',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', workspaceId] });
      setTitle(config.defaultTitle || '');
      setContent('');
      addToast({ type: 'success', title: t('notes.createSuccess') });
    },
    onError: () => {
      addToast({ type: 'error', title: t('notes.createError') });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      createMutation.mutate();
    }
  };

  return (
    <Widget>
      <form onSubmit={handleSubmit} className="h-full flex flex-col gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('notes.titlePlaceholder')}
          className="px-3 py-2 rounded-lg border dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={config.placeholder || t('notes.contentPlaceholder')}
          className="flex-1 px-3 py-2 rounded-lg border dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm resize-none min-h-[80px]"
        />
        <button
          type="submit"
          disabled={!content.trim() || createMutation.isPending}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={16} />
          {createMutation.isPending ? t('common.saving') : t('notes.quickCreate')}
        </button>
      </form>
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
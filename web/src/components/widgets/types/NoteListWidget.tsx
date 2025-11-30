import { FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { getNotes } from '@/api/note';
import useCurrentWorkspaceId from '@/hooks/use-currentworkspace-id';
import { NoteListWidgetConfig } from '@/types/widget';
import Widget from '@/components/widgets/Widget';
import FullNote from '@/components/fullnote/FullNote';
import { registerWidget, WidgetProps, WidgetConfigFormProps } from '../widgetRegistry';

interface NoteListWidgetProps extends WidgetProps {
  config: NoteListWidgetConfig;
}

const NoteListWidget: FC<NoteListWidgetProps> = ({ config }) => {
  const { t } = useTranslation();
  const workspaceId = useCurrentWorkspaceId();
  const navigate = useNavigate();

  const { data: allNotes = [], isLoading } = useQuery({
    queryKey: ['notes', workspaceId, 'widget', config],
    queryFn: () => getNotes(workspaceId, 1, config.limit || 10, config.filter?.query || ''),
    enabled: !!workspaceId,
  });

  // Apply filters
  let notes = allNotes;
  if (config.filter?.visibility) {
    notes = notes.filter((n: any) => n.visibility === config.filter?.visibility);
  }

  // Apply sorting
  if (config.sortBy) {
    notes = [...notes].sort((a: any, b: any) => {
      const aVal = a[config.sortBy!];
      const bVal = b[config.sortBy!];
      if (config.sortOrder === 'asc') {
        return aVal < bVal ? -1 : 1;
      }
      return aVal > bVal ? -1 : 1;
    });
  }

  // Limit results
  notes = notes.slice(0, config.limit || 10);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-500" size={24} />
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
        {t('widgets.noNotes')}
      </div>
    );
  }

  const handleNoteClick = (noteId: string) => {
    navigate(`/workspaces/${workspaceId}/notes/${noteId}`);
  };

  return (
    <Widget>
      <div className="h-full flex flex-col gap-2 overflow-auto">
        {notes.map((note: any) => (
          <div
            key={note.id}
            onClick={() => handleNoteClick(note.id)}
            className="p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                {note.content && (
                  <div className="text-xs text-gray-500 truncate mt-1">
                    <FullNote note={note} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Widget>
  );
};

// Configuration Form Component
export const NoteListWidgetConfigForm: FC<WidgetConfigFormProps<NoteListWidgetConfig>> = ({
  config,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">{t('widgets.config.limit')}</label>
        <input
          type="number"
          value={config.limit}
          onChange={(e) => onChange({ ...config, limit: parseInt(e.target.value) || 5 })}
          min={1}
          max={20}
          className="w-full px-3 py-2 rounded-lg border dark:border-neutral-600 bg-white dark:bg-neutral-800"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">{t('widgets.config.sortBy')}</label>
        <select
          value={config.sortBy}
          onChange={(e) => onChange({ ...config, sortBy: e.target.value as any })}
          className="w-full px-3 py-2 rounded-lg border dark:border-neutral-600 bg-white dark:bg-neutral-800"
        >
          <option value="created_at">{t('widgets.config.createdAt')}</option>
          <option value="updated_at">{t('widgets.config.updatedAt')}</option>
          <option value="title">{t('widgets.config.title')}</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">{t('widgets.config.sortOrder')}</label>
        <select
          value={config.sortOrder}
          onChange={(e) => onChange({ ...config, sortOrder: e.target.value as any })}
          className="w-full px-3 py-2 rounded-lg border dark:border-neutral-600 bg-white dark:bg-neutral-800"
        >
          <option value="desc">{t('widgets.config.newest')}</option>
          <option value="asc">{t('widgets.config.oldest')}</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">{t('widgets.config.filterVisibility')}</label>
        <select
          value={config.filter?.visibility || ''}
          onChange={(e) =>
            onChange({
              ...config,
              filter: { ...config.filter, visibility: e.target.value as any || undefined },
            })
          }
          className="w-full px-3 py-2 rounded-lg border dark:border-neutral-600 bg-white dark:bg-neutral-800"
        >
          <option value="">{t('widgets.config.all')}</option>
          <option value="private">{t('visibility.private')}</option>
          <option value="workspace">{t('visibility.workspace')}</option>
          <option value="public">{t('visibility.public')}</option>
        </select>
      </div>
    </div>
  );
};

// Register widget
registerWidget({
  type: 'note_list',
  label: 'widgets.types.noteList',
  description: 'widgets.types.noteListDesc',
  defaultConfig: {
    limit: 5,
    sortBy: 'created_at',
    sortOrder: 'desc',
  },
  Component: NoteListWidget,
  ConfigForm: NoteListWidgetConfigForm,
});

export default NoteListWidget;
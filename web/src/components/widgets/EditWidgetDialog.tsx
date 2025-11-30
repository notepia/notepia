import { FC, useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { updateWidget, WidgetData } from '@/api/widget';
import useCurrentWorkspaceId from '@/hooks/use-currentworkspace-id';
import { useToastStore } from '@/stores/toast';
import { parseWidgetConfig, stringifyWidgetConfig } from '@/types/widget';
import { getWidget } from './widgetRegistry';

interface EditWidgetDialogProps {
  widget: WidgetData;
  isOpen: boolean;
  onClose: () => void;
}

const EditWidgetDialog: FC<EditWidgetDialogProps> = ({ widget, isOpen, onClose }) => {
  const { t } = useTranslation();
  const workspaceId = useCurrentWorkspaceId();
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const [config, setConfig] = useState<any>({});

  // Initialize config from widget
  useEffect(() => {
    const widgetModule = getWidget(widget.type);
    if (!widgetModule) return;

    const parsedConfig = parseWidgetConfig({ ...widget, config: widget.config || '{}' } as any);
    setConfig({ ...widgetModule.defaultConfig, ...parsedConfig });
  }, [widget]);

  const updateMutation = useMutation({
    mutationFn: () => {
      return updateWidget(workspaceId, {
        id: widget.id!,
        type: widget.type,
        config: stringifyWidgetConfig(config),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widgets', workspaceId] });
      addToast({ type: 'success', title: t('widgets.updateSuccess') });
      onClose();
    },
    onError: () => {
      addToast({ type: 'error', title: t('widgets.updateError') });
    },
  });

  const handleSave = () => {
    updateMutation.mutate();
  };

  const renderConfigForm = () => {
    const widgetModule = getWidget(widget.type);
    if (!widgetModule || !widgetModule.ConfigForm) return null;

    const ConfigFormComponent = widgetModule.ConfigForm;
    return <ConfigFormComponent config={config} onChange={setConfig} />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">{t('widgets.editWidget')}</div>
          <button onClick={onClose} className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {renderConfigForm()}

          <div className="flex gap-2 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border dark:border-neutral-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {t('actions.cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {updateMutation.isPending ? t('common.saving') : t('actions.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditWidgetDialog;
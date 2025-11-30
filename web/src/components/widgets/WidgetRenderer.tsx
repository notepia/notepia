import { FC } from 'react';
import { GripVertical, Edit2, Trash2 } from 'lucide-react';
import { WidgetData } from '@/api/widget';
import { WidgetType, parseWidgetConfig } from '@/types/widget';
import { getWidget } from './widgetRegistry';

interface WidgetRendererProps {
  widget: WidgetData;
  isEditMode: boolean;
  canDragResize: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const WidgetRenderer: FC<WidgetRendererProps> = ({
  widget,
  isEditMode,
  canDragResize,
  onEdit,
  onDelete,
}) => {
  const renderWidgetContent = () => {
    const widgetType = widget.type as WidgetType;
    const config: any = parseWidgetConfig({ ...widget, config: widget.config || '{}' } as any);

    // Get widget from registry
    const widgetModule = getWidget(widgetType);

    if (!widgetModule) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          Unknown widget type: {widgetType}
        </div>
      );
    }

    const WidgetComponent = widgetModule.Component;
    return <WidgetComponent config={config} />;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Widget Header - Only show in edit mode */}
      {isEditMode && (
        <div className="flex items-center justify-between px-3 py-2 border-b dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
          <div className="flex items-center gap-2">
            {canDragResize && (
              <div className="widget-drag-handle cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <GripVertical size={16} />
              </div>
            )}
            <span className="font-medium text-sm truncate">{widget.type}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              title="Edit"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={onDelete}
              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 text-gray-500 hover:text-red-600"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Widget Content */}
      <div className="flex-1 overflow-auto">{renderWidgetContent()}</div>
    </div>
  );
};

export default WidgetRenderer;
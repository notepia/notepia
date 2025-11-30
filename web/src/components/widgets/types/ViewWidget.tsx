import { FC, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { getView, getViewObjects, getViews } from '@/api/view';
import useCurrentWorkspaceId from '@/hooks/use-currentworkspace-id';
import { ViewWidgetConfig } from '@/types/widget';
import { MapMarkerData, CalendarSlotData, ViewObject } from '@/types/view';
import MiniMapView from '@/components/notedetailsidebar/MiniMapView';
import MiniCalendarView from '@/components/notedetailsidebar/MiniCalendarView';
import Widget from '@/components/widgets/Widget';
import { registerWidget, WidgetProps, WidgetConfigFormProps } from '../widgetRegistry';

interface ViewWidgetProps extends WidgetProps {
  config: ViewWidgetConfig;
}

const ViewWidget: FC<ViewWidgetProps> = ({ config }) => {
  const { t } = useTranslation();
  const workspaceId = useCurrentWorkspaceId();

  const { data: view, isLoading: isLoadingView } = useQuery({
    queryKey: ['view', workspaceId, config.viewId],
    queryFn: () => getView(workspaceId, config.viewId),
    enabled: !!workspaceId && !!config.viewId,
  });

  const { data: objects = [] } = useQuery({
    queryKey: ['view-objects', workspaceId, config.viewId],
    queryFn: () => getViewObjects(workspaceId, config.viewId, 1, 100),
    enabled: !!workspaceId && !!config.viewId,
  });

  // Parse markers from view objects for map view
  const markers = useMemo(() => {
    if (view?.type !== 'map') return [];
    return objects
      .filter((obj: ViewObject) => obj.type === 'map_marker')
      .map((obj: ViewObject) => {
        try {
          return JSON.parse(obj.data) as MapMarkerData;
        } catch {
          return null;
        }
      })
      .filter((m): m is MapMarkerData => m !== null);
  }, [objects, view?.type]);

  // Parse slots from view objects for calendar view
  const slots = useMemo(() => {
    if (view?.type !== 'calendar') return [];
    return objects
      .filter((obj: ViewObject) => obj.type === 'calendar_slot')
      .map((obj: ViewObject) => {
        try {
          return JSON.parse(obj.data) as CalendarSlotData;
        } catch {
          // If data is a direct date string
          return { date: obj.data } as CalendarSlotData;
        }
      })
      .filter((s): s is CalendarSlotData => s !== null && !!s.date);
  }, [objects, view?.type]);

  if (!config.viewId) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
        {t('widgets.noViewSelected')}
      </div>
    );
  }

  if (isLoadingView) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-500" size={24} />
      </div>
    );
  }

  if (!view) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
        {t('widgets.viewNotFound')}
      </div>
    );
  }

  return (
    <Widget withPadding={false}>

      <div className="h-full flex flex-col">
        {view.type === 'map' ? (
          <MiniMapView
            markers={markers}
            viewObjects={objects}
            viewId={config.viewId}
            workspaceId={workspaceId}
          />
        ) : (
          <MiniCalendarView
            slots={slots}
            viewObjects={objects}
            viewId={config.viewId}
            workspaceId={workspaceId}
          />
        )}
      </div>
    </Widget>
  );
};

// Configuration Form Component
export const ViewWidgetConfigForm: FC<WidgetConfigFormProps<ViewWidgetConfig>> = ({
  config,
  onChange,
}) => {
  const { t } = useTranslation();
  const workspaceId = useCurrentWorkspaceId();

  const { data: views = [] } = useQuery({
    queryKey: ['views', workspaceId],
    queryFn: () => getViews(workspaceId),
    enabled: !!workspaceId,
  });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">{t('widgets.config.selectView')}</label>
        <select
          value={config.viewId}
          onChange={(e) => onChange({ ...config, viewId: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border dark:border-neutral-600 bg-white dark:bg-neutral-800"
        >
          <option value="">{t('widgets.config.selectViewPlaceholder')}</option>
          {views.map((view: any) => (
            <option key={view.id} value={view.id}>
              {view.name} ({view.type})
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showControls"
          checked={config.showControls}
          onChange={(e) => onChange({ ...config, showControls: e.target.checked })}
        />
        <label htmlFor="showControls" className="text-sm">{t('widgets.config.showControls')}</label>
      </div>
    </div>
  );
};

// Register widget
registerWidget({
  type: 'view',
  label: 'widgets.types.view',
  description: 'widgets.types.viewDesc',
  defaultConfig: {
    viewId: '',
    showControls: true,
  },
  Component: ViewWidget,
  ConfigForm: ViewWidgetConfigForm,
});

export default ViewWidget;
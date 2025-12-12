import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'lucide-react';
import { LinkWidgetConfig } from '@/types/widget';
import Widget from '@/components/widgets/Widget';
import { registerWidget, WidgetProps, WidgetConfigFormProps } from '../widgetRegistry';

interface LinkWidgetProps extends WidgetProps {
  config: LinkWidgetConfig;
}

const LinkWidget: FC<LinkWidgetProps> = ({ config }) => {
  const { t } = useTranslation();

  // Handle empty or invalid URLs
  if (!config.url) {
    return (
      <Widget>
        <div className="h-full flex items-center justify-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t('widgets.config.noUrlProvided')}
          </div>
        </div>
      </Widget>
    );
  }

  const displayText = config.name || config.url;

  return (
    <Widget>
      <div className="h-full flex items-center">
        <a
          href={config.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          <ExternalLink className=' shrink-0' size={20} />
          <span className="font-medium truncate">{displayText}</span>
        </a>
      </div>
    </Widget>
  );
};

// Configuration Form Component
export const LinkWidgetConfigForm: FC<WidgetConfigFormProps<LinkWidgetConfig>> = ({
  config,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('widgets.config.url')} *
        </label>
        <input
          type="url"
          value={config.url || ''}
          onChange={(e) => onChange({ ...config, url: e.target.value })}
          placeholder="https://example.com"
          className="w-full px-3 py-2 rounded-lg border dark:border-neutral-600 bg-white dark:bg-neutral-800"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('widgets.config.linkName')}
        </label>
        <input
          type="text"
          value={config.name || ''}
          onChange={(e) => onChange({ ...config, name: e.target.value })}
          placeholder={t('widgets.config.linkNamePlaceholder')}
          className="w-full px-3 py-2 rounded-lg border dark:border-neutral-600 bg-white dark:bg-neutral-800"
        />
      </div>
    </div>
  );
};

// Register widget
registerWidget({
  type: 'link',
  label: 'widgets.types.link',
  description: 'widgets.types.linkDesc',
  defaultConfig: {
    url: 'https://example.com',
  },
  Component: LinkWidget,
  ConfigForm: LinkWidgetConfigForm,
  minWidth: 2,
  minHeight: 1,
});

export default LinkWidget;

import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Video as VideoIcon, FolderOpen, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { VideoWidgetConfig } from '@/types/widget';
import { FileInfo, listFiles } from '@/api/file';
import useCurrentWorkspaceId from '@/hooks/use-currentworkspace-id';
import Widget from '@/components/widgets/Widget';
import { registerWidget, WidgetProps, WidgetConfigFormProps } from '../widgetRegistry';
import MultiFilePickerDialog from '../MultiFilePickerDialog';

interface VideoWidgetProps extends WidgetProps {
  config: VideoWidgetConfig;
}

const VideoWidget: FC<VideoWidgetProps> = ({ config }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  const videoUrls = config.videoUrls || [];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + videoUrls.length) % videoUrls.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % videoUrls.length);
  };

  const getCurrentFileName = () => {
    if (videoUrls.length === 0) return '';
    const url = videoUrls[currentIndex];
    const parts = url.split('/');
    return decodeURIComponent(parts[parts.length - 1]);
  };

  if (videoUrls.length === 0) {
    return (
      <Widget withPadding={false}>
        <div className="h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 text-sm">
          <VideoIcon size={48} className="mb-4" />
          <p>{t('widgets.video.noVideo')}</p>
        </div>
      </Widget>
    );
  }

  return (
    <Widget withPadding={false}>
      <div className="relative w-full h-full bg-gray-100 dark:bg-neutral-900">
        {/* Video Display */}
        <div className="w-full h-full flex flex-col">
          <video
            key={videoUrls[currentIndex]}
            src={videoUrls[currentIndex]}
            controls
            className="flex-1 w-full h-full object-contain"
          >
            {t('widgets.video.notSupported')}
          </video>

          {/* Video Info */}
          <div className="px-3 py-2 bg-gray-50 dark:bg-neutral-800 border-t dark:border-neutral-700">
            <p className="text-xs text-gray-700 dark:text-gray-300 truncate">
              {getCurrentFileName()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {currentIndex + 1} / {videoUrls.length}
            </p>
          </div>
        </div>

        {/* Navigation Buttons - Only show if more than one video */}
        {videoUrls.length > 1 && (
          <div className="absolute top-2 right-2 flex gap-1 z-10">
            <button
              onClick={handlePrevious}
              className="p-1.5 rounded-lg bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-all"
              aria-label={t('widgets.video.previous')}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-all"
              aria-label={t('widgets.video.next')}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </Widget>
  );
};

// Configuration Form Component
export const VideoWidgetConfigForm: FC<WidgetConfigFormProps<VideoWidgetConfig>> = ({
  config,
  onChange,
}) => {
  const { t } = useTranslation();
  const workspaceId = useCurrentWorkspaceId();
  const [filePickerOpen, setFilePickerOpen] = useState(false);

  const handleSelectFiles = (files: FileInfo[]) => {
    const fileUrls = files.map(file => `/api/v1/workspaces/${workspaceId}/files/${file.name}`);
    const currentUrls = config.videoUrls || [];
    onChange({
      ...config,
      videoUrls: [...currentUrls, ...fileUrls]
    });
  };

  const handleRemoveUrl = (index: number) => {
    const currentUrls = config.videoUrls || [];
    onChange({
      ...config,
      videoUrls: currentUrls.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-4">
      {/* Video URLs */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('widgets.video.config.videoFiles')}
        </label>
        <div className="mb-2">
          <button
            type="button"
            onClick={() => setFilePickerOpen(true)}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
          >
            <FolderOpen size={18} />
            {t('widgets.video.config.selectFromFiles')}
          </button>
        </div>

        {/* Display added video files */}
        {(config.videoUrls || []).length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {(config.videoUrls || []).map((url, index) => {
              const fileName = decodeURIComponent(url.split('/').pop() || '');
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg"
                >
                  <VideoIcon size={20} className="text-purple-500 flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {fileName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('widgets.video.config.videoNumber', { number: index + 1 })}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveUrl(index)}
                    className="flex-shrink-0 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                  >
                    <X size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* File Picker Dialog */}
      <MultiFilePickerDialog
        open={filePickerOpen}
        onOpenChange={setFilePickerOpen}
        workspaceId={workspaceId}
        listFiles={listFiles}
        onSelect={handleSelectFiles}
        fileExtensions=".mp4,.webm,.ogg,.mov,.avi,.mkv"
        title={t('widgets.video.config.selectVideoFiles')}
        emptyMessage={t('widgets.video.config.noVideoFiles')}
      />
    </div>
  );
};

// Register widget
registerWidget({
  type: 'video',
  label: 'widgets.types.video',
  description: 'widgets.types.videoDesc',
  defaultConfig: {
    videoUrls: [],
  },
  Component: VideoWidget,
  ConfigForm: VideoWidgetConfigForm,
});

export default VideoWidget;

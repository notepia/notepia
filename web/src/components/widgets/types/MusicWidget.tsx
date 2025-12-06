import { FC, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause, SkipForward, SkipBack, Music as MusicIcon, FolderOpen, X } from 'lucide-react';
import { MusicWidgetConfig } from '@/types/widget';
import { FileInfo, listFiles } from '@/api/file';
import useCurrentWorkspaceId from '@/hooks/use-currentworkspace-id';
import Widget from '@/components/widgets/Widget';
import { registerWidget, WidgetProps, WidgetConfigFormProps } from '../widgetRegistry';
import MultiFilePickerDialog from '../MultiFilePickerDialog';

interface MusicWidgetProps extends WidgetProps {
  config: MusicWidgetConfig;
}

const MusicWidget: FC<MusicWidgetProps> = ({ config }) => {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioUrls = config.audioUrls || [];

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    const newIndex = (currentIndex - 1 + audioUrls.length) % audioUrls.length;
    setCurrentIndex(newIndex);
    setIsPlaying(false);
  };

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % audioUrls.length;
    setCurrentIndex(newIndex);
    setIsPlaying(false);
  };

  const handleEnded = () => {
    // Auto play next track
    if (currentIndex < audioUrls.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const getCurrentFileName = () => {
    if (audioUrls.length === 0) return '';
    const url = audioUrls[currentIndex];
    const parts = url.split('/');
    return decodeURIComponent(parts[parts.length - 1]);
  };

  if (audioUrls.length === 0) {
    return (
      <Widget>
        <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
          <MusicIcon size={48} className="mb-4" />
          <p>{t('widgets.music.noAudio')}</p>
        </div>
      </Widget>
    );
  }

  return (
    <Widget>
      <div className="h-full flex flex-col justify-between">
        {/* Audio element */}
        <audio
          ref={audioRef}
          src={audioUrls[currentIndex]}
          onEnded={handleEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Track info */}
        <div className="flex-1 flex flex-col items-center justify-center mb-4">
          <MusicIcon size={64} className="text-blue-500 mb-4" />
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 text-center px-4">
            {getCurrentFileName()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {currentIndex + 1} / {audioUrls.length}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handlePrevious}
            disabled={audioUrls.length <= 1}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t('widgets.music.previous')}
          >
            <SkipBack size={20} />
          </button>

          <button
            onClick={handlePlayPause}
            className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
            aria-label={isPlaying ? t('widgets.music.pause') : t('widgets.music.play')}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>

          <button
            onClick={handleNext}
            disabled={audioUrls.length <= 1}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t('widgets.music.next')}
          >
            <SkipForward size={20} />
          </button>
        </div>
      </div>
    </Widget>
  );
};

// Configuration Form Component
export const MusicWidgetConfigForm: FC<WidgetConfigFormProps<MusicWidgetConfig>> = ({
  config,
  onChange,
}) => {
  const { t } = useTranslation();
  const workspaceId = useCurrentWorkspaceId();
  const [filePickerOpen, setFilePickerOpen] = useState(false);

  const handleSelectFiles = (files: FileInfo[]) => {
    const fileUrls = files.map(file => `/api/v1/workspaces/${workspaceId}/files/${file.name}`);
    const currentUrls = config.audioUrls || [];
    onChange({
      ...config,
      audioUrls: [...currentUrls, ...fileUrls]
    });
  };

  const handleRemoveUrl = (index: number) => {
    const currentUrls = config.audioUrls || [];
    onChange({
      ...config,
      audioUrls: currentUrls.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-4">
      {/* Audio URLs */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('widgets.music.config.audioFiles')}
        </label>
        <div className="mb-2">
          <button
            type="button"
            onClick={() => setFilePickerOpen(true)}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
          >
            <FolderOpen size={18} />
            {t('widgets.music.config.selectFromFiles')}
          </button>
        </div>

        {/* Display added audio files */}
        {(config.audioUrls || []).length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {(config.audioUrls || []).map((url, index) => {
              const fileName = decodeURIComponent(url.split('/').pop() || '');
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg"
                >
                  <MusicIcon size={20} className="text-blue-500 flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {fileName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('widgets.music.config.trackNumber', { number: index + 1 })}
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
        fileExtensions=".mp3,.wav,.ogg,.m4a,.flac,.aac"
        title={t('widgets.music.config.selectAudioFiles')}
        emptyMessage={t('widgets.music.config.noAudioFiles')}
      />
    </div>
  );
};

// Register widget
registerWidget({
  type: 'music',
  label: 'widgets.types.music',
  description: 'widgets.types.musicDesc',
  defaultConfig: {
    audioUrls: [],
  },
  Component: MusicWidget,
  ConfigForm: MusicWidgetConfigForm,
});

export default MusicWidget;

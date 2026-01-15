import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tool } from './WhiteboardToolbar';

interface WhiteboardToolPropertiesProps {
    currentTool: Tool;
    currentColor: string;
    setCurrentColor: (color: string) => void;
    currentStrokeWidth: number;
    setCurrentStrokeWidth: (width: number) => void;
    onClear?: () => void;
    isPublic?: boolean;
}

const WhiteboardToolProperties = ({
    currentTool,
    currentColor,
    setCurrentColor,
    currentStrokeWidth,
    setCurrentStrokeWidth,
    onClear,
    isPublic = false
}: WhiteboardToolPropertiesProps) => {
    const { t } = useTranslation();

    const strokeWidths = [1, 2, 4, 6, 8];
    const commonColors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

    const showColorPicker = currentTool === 'pen' || currentTool === 'rectangle' || currentTool === 'circle' || currentTool === 'line' || currentTool === 'text';
    const showStrokeWidth = currentTool === 'pen' || currentTool === 'rectangle' || currentTool === 'circle' || currentTool === 'line';

    if (isPublic || (!showColorPicker && !showStrokeWidth && !onClear)) {
        return null;
    }

    return (
        <div className="absolute top-4 left-4 bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-3 z-10 border border-neutral-200 dark:border-neutral-700">
            <div className="flex flex-col gap-3">
                {/* Color picker */}
                {showColorPicker && (
                    <div className="flex flex-col gap-1">
                        <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                            {t('whiteboard.color') || 'Color'}
                        </div>
                        <div className="flex flex-col gap-1">
                            {commonColors.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setCurrentColor(color)}
                                    className={`w-6 h-6 rounded border-2 transition-all ${currentColor === color
                                        ? 'border-primary scale-110'
                                        : 'border-neutral-300 dark:border-neutral-600 hover:scale-105'
                                        }`}
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                            <input
                                type="color"
                                value={currentColor}
                                onChange={(e) => setCurrentColor(e.target.value)}
                                className="w-6 h-6 rounded border-2 border-neutral-300 dark:border-neutral-600 cursor-pointer"
                                title={t('whiteboard.customColor') || 'Custom Color'}
                            />
                        </div>
                    </div>
                )}

                {/* Stroke width */}
                {showStrokeWidth && (
                    <div className="flex flex-col gap-1">
                        <div className="flex flex-col gap-1">
                            {strokeWidths.map((width) => (
                                <button
                                    key={width}
                                    onClick={() => setCurrentStrokeWidth(width)}
                                    className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${currentStrokeWidth === width
                                        ? 'bg-primary text-white'
                                        : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                                        }`}
                                    title={`${width}px`}
                                >
                                    <div
                                        className="rounded-full bg-current"
                                        style={{ width: `${width * 2}px`, height: `${width * 2}px` }}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Clear button */}
                {onClear && (
                    <button
                        onClick={onClear}
                        className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors text-sm font-medium"
                    >
                        <Trash2 size={16} /></button>
                )}
            </div>
        </div>
    );
};

export default WhiteboardToolProperties;

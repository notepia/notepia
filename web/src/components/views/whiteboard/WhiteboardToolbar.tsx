import { Pen, Square, Circle, Minus, Type, FileText, Hand, Eraser } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type Tool = 'select' | 'pen' | 'eraser' | 'rectangle' | 'circle' | 'line' | 'text' | 'note';

interface WhiteboardToolbarProps {
    currentTool: Tool;
    setCurrentTool: (tool: Tool) => void;
    isPublic?: boolean;
}

const WhiteboardToolbar = ({
    currentTool,
    setCurrentTool,
    isPublic = false
}: WhiteboardToolbarProps) => {
    const { t } = useTranslation();

    const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
        { id: 'select', icon: <Hand size={18} />, label: t('whiteboard.select') || 'Select' },
        { id: 'pen', icon: <Pen size={18} />, label: t('whiteboard.pen') || 'Pen' },
        { id: 'eraser', icon: <Eraser size={18} />, label: t('whiteboard.eraser') || 'Eraser' },
        { id: 'rectangle', icon: <Square size={18} />, label: t('whiteboard.rectangle') || 'Rectangle' },
        { id: 'circle', icon: <Circle size={18} />, label: t('whiteboard.circle') || 'Circle' },
        { id: 'line', icon: <Minus size={18} />, label: t('whiteboard.line') || 'Line' },
        { id: 'text', icon: <Type size={18} />, label: t('whiteboard.text') || 'Text' },
        { id: 'note', icon: <FileText size={18} />, label: t('whiteboard.note') || 'Note' },
    ];

    if (isPublic) {
        return null;
    }

    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-2 z-10 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-1">
                {tools.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={() => setCurrentTool(tool.id)}
                        className={`p-2 rounded transition-colors ${
                            currentTool === tool.id
                                ? 'bg-primary text-white'
                                : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                        }`}
                        title={tool.label}
                    >
                        {tool.icon}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default WhiteboardToolbar;

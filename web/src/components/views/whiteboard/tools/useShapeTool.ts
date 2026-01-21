import { useState, useCallback } from 'react';
import { WhiteboardShapeData } from '../../../../types/view';
import { CanvasObject, Point, Tool, generateId } from './types';

interface UseShapeToolOptions {
    currentColor: string;
    currentStrokeWidth: number;
    setCanvasObjects: React.Dispatch<React.SetStateAction<Map<string, CanvasObject>>>;
    sendUpdate: (update: any) => void;
}

interface UseShapeToolReturn {
    startPoint: Point | null;
    currentPoint: Point | null;
    isDrawing: boolean;
    startDrawing: (pos: Point) => void;
    continueDrawing: (pos: Point) => void;
    finishDrawing: (tool: Tool) => void;
    renderPreview: (ctx: CanvasRenderingContext2D, tool: Tool) => void;
}

export const useShapeTool = ({
    currentColor,
    currentStrokeWidth,
    setCanvasObjects,
    sendUpdate
}: UseShapeToolOptions): UseShapeToolReturn => {
    const [startPoint, setStartPoint] = useState<Point | null>(null);
    const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const startDrawing = useCallback((pos: Point) => {
        setIsDrawing(true);
        setStartPoint(pos);
        setCurrentPoint(pos);
    }, []);

    const continueDrawing = useCallback((pos: Point) => {
        if (isDrawing) {
            setCurrentPoint(pos);
        }
    }, [isDrawing]);

    const finishDrawing = useCallback((tool: Tool) => {
        if (startPoint && currentPoint) {
            const shapeType = tool as 'rectangle' | 'circle' | 'line';
            const shapeData: WhiteboardShapeData = {
                type: shapeType,
                position: startPoint,
                dimensions: {
                    width: currentPoint.x - startPoint.x,
                    height: currentPoint.y - startPoint.y
                },
                color: currentColor,
                strokeWidth: currentStrokeWidth,
                filled: false
            };
            const id = generateId();
            const newObject: CanvasObject = {
                id,
                type: 'shape',
                data: shapeData
            };

            setCanvasObjects(prev => new Map(prev).set(id, newObject));
            sendUpdate({ type: 'add_canvas_object', object: newObject });
        }

        setIsDrawing(false);
        setStartPoint(null);
        setCurrentPoint(null);
    }, [startPoint, currentPoint, currentColor, currentStrokeWidth, setCanvasObjects, sendUpdate]);

    const renderPreview = useCallback((ctx: CanvasRenderingContext2D, tool: Tool) => {
        if (!isDrawing || !startPoint || !currentPoint) return;

        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentStrokeWidth;

        if (tool === 'rectangle') {
            const width = currentPoint.x - startPoint.x;
            const height = currentPoint.y - startPoint.y;
            ctx.strokeRect(startPoint.x, startPoint.y, width, height);
        } else if (tool === 'circle') {
            const radius = Math.sqrt(
                Math.pow(currentPoint.x - startPoint.x, 2) +
                Math.pow(currentPoint.y - startPoint.y, 2)
            );
            ctx.beginPath();
            ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
        } else if (tool === 'line') {
            ctx.beginPath();
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineTo(currentPoint.x, currentPoint.y);
            ctx.stroke();
        }
    }, [isDrawing, startPoint, currentPoint, currentColor, currentStrokeWidth]);

    return {
        startPoint,
        currentPoint,
        isDrawing,
        startDrawing,
        continueDrawing,
        finishDrawing,
        renderPreview
    };
};

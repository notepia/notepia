import { useState, useCallback } from 'react';
import { WhiteboardStrokeData } from '../../../../types/view';
import { CanvasObject, Point, generateId } from './types';

interface UsePenToolOptions {
    currentColor: string;
    currentStrokeWidth: number;
    setCanvasObjects: React.Dispatch<React.SetStateAction<Map<string, CanvasObject>>>;
    sendUpdate: (update: any) => void;
}

interface UsePenToolReturn {
    currentPoints: Point[];
    isDrawing: boolean;
    startDrawing: (pos: Point) => void;
    continueDrawing: (pos: Point) => void;
    finishDrawing: () => void;
    renderPreview: (ctx: CanvasRenderingContext2D) => void;
}

export const usePenTool = ({
    currentColor,
    currentStrokeWidth,
    setCanvasObjects,
    sendUpdate
}: UsePenToolOptions): UsePenToolReturn => {
    const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);

    const startDrawing = useCallback((pos: Point) => {
        setIsDrawing(true);
        setCurrentPoints([pos]);
    }, []);

    const continueDrawing = useCallback((pos: Point) => {
        if (isDrawing) {
            setCurrentPoints(prev => [...prev, pos]);
        }
    }, [isDrawing]);

    const finishDrawing = useCallback(() => {
        if (currentPoints.length > 1) {
            const strokeData: WhiteboardStrokeData = {
                points: currentPoints,
                color: currentColor,
                width: currentStrokeWidth
            };
            const id = generateId();
            const newObject: CanvasObject = {
                id,
                type: 'stroke',
                data: strokeData
            };

            setCanvasObjects(prev => new Map(prev).set(id, newObject));
            sendUpdate({ type: 'add_canvas_object', object: newObject });
        }

        setIsDrawing(false);
        setCurrentPoints([]);
    }, [currentPoints, currentColor, currentStrokeWidth, setCanvasObjects, sendUpdate]);

    const renderPreview = useCallback((ctx: CanvasRenderingContext2D) => {
        if (!isDrawing || currentPoints.length === 0) return;

        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentStrokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
        for (let i = 1; i < currentPoints.length; i++) {
            ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
        }
        ctx.stroke();
    }, [isDrawing, currentPoints, currentColor, currentStrokeWidth]);

    return {
        currentPoints,
        isDrawing,
        startDrawing,
        continueDrawing,
        finishDrawing,
        renderPreview
    };
};

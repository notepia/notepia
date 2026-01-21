import { useState, useCallback } from 'react';
import { CanvasObject, WhiteboardObject } from './types';

interface UseEraserToolOptions {
    canvasObjects: Map<string, CanvasObject>;
    setCanvasObjects: React.Dispatch<React.SetStateAction<Map<string, CanvasObject>>>;
    viewObjects: Map<string, WhiteboardObject>;
    setViewObjects: React.Dispatch<React.SetStateAction<Map<string, WhiteboardObject>>>;
    sendUpdate: (update: any) => void;
}

interface UseEraserToolReturn {
    isErasing: boolean;
    startErasing: () => void;
    eraseObject: (objId: string) => void;
    finishErasing: () => void;
}

export const useEraserTool = ({
    canvasObjects,
    setCanvasObjects,
    viewObjects,
    setViewObjects,
    sendUpdate
}: UseEraserToolOptions): UseEraserToolReturn => {
    const [isErasing, setIsErasing] = useState(false);

    const startErasing = useCallback(() => {
        setIsErasing(true);
    }, []);

    const eraseObject = useCallback((objId: string) => {
        const canvasObj = canvasObjects.get(objId);
        const viewObj = viewObjects.get(objId);

        if (canvasObj) {
            setCanvasObjects(prev => {
                const newMap = new Map(prev);
                newMap.delete(objId);
                return newMap;
            });
            sendUpdate({ type: 'delete_canvas_object', id: objId });
        } else if (viewObj) {
            setViewObjects(prev => {
                const newMap = new Map(prev);
                newMap.delete(objId);
                return newMap;
            });
            sendUpdate({ type: 'delete_view_object', id: objId });
        }
    }, [canvasObjects, viewObjects, setCanvasObjects, setViewObjects, sendUpdate]);

    const finishErasing = useCallback(() => {
        setIsErasing(false);
    }, []);

    return {
        isErasing,
        startErasing,
        eraseObject,
        finishErasing
    };
};

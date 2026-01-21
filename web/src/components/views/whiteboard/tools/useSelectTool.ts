import { useState, useCallback } from 'react';
import { WhiteboardStrokeData, WhiteboardShapeData, WhiteboardTextData } from '../../../../types/view';
import { CanvasObject, WhiteboardObject, Point, Bounds, ResizeHandle } from './types';
import { getObjectBounds } from '../objects/bounds';

interface UseSelectToolOptions {
    canvasObjects: Map<string, CanvasObject>;
    setCanvasObjects: React.Dispatch<React.SetStateAction<Map<string, CanvasObject>>>;
    viewObjects: Map<string, WhiteboardObject>;
    setViewObjects: React.Dispatch<React.SetStateAction<Map<string, WhiteboardObject>>>;
    selectedObjectId: string | null;
    setSelectedObjectId: React.Dispatch<React.SetStateAction<string | null>>;
    sendUpdate: (update: any) => void;
    ctx?: CanvasRenderingContext2D | null;
}

interface UseSelectToolReturn {
    isDragging: boolean;
    isResizing: boolean;
    resizeHandle: ResizeHandle | null;
    dragOffset: Point | null;
    startDragging: (objectId: string, pos: Point) => void;
    startResizing: (objectId: string, handle: ResizeHandle, pos: Point, bounds: Bounds) => void;
    updateDrag: (pos: Point) => void;
    updateResize: (pos: Point) => void;
    finishDragOrResize: () => void;
    selectObject: (objectId: string | null) => void;
}

export const useSelectTool = ({
    canvasObjects,
    setCanvasObjects,
    viewObjects,
    setViewObjects,
    selectedObjectId,
    setSelectedObjectId,
    sendUpdate,
    ctx
}: UseSelectToolOptions): UseSelectToolReturn => {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
    const [dragOffset, setDragOffset] = useState<Point | null>(null);
    const [resizeStartBounds, setResizeStartBounds] = useState<Bounds | null>(null);
    const [resizeStartData, setResizeStartData] = useState<any>(null);

    const selectObject = useCallback((objectId: string | null) => {
        setSelectedObjectId(objectId);
    }, [setSelectedObjectId]);

    const startDragging = useCallback((objectId: string, pos: Point) => {
        setSelectedObjectId(objectId);
        setIsDragging(true);

        // Calculate drag offset based on object type
        let objPos: Point = { x: 0, y: 0 };

        const canvasObj = canvasObjects.get(objectId);
        if (canvasObj) {
            if (canvasObj.type === 'stroke') {
                const data = canvasObj.data as WhiteboardStrokeData;
                const minX = Math.min(...data.points.map(p => p.x));
                const minY = Math.min(...data.points.map(p => p.y));
                objPos = { x: minX, y: minY };
            } else if (canvasObj.type === 'shape') {
                const data = canvasObj.data as WhiteboardShapeData;
                objPos = data.position;
            }
        } else {
            const viewObj = viewObjects.get(objectId);
            if (viewObj && viewObj.data) {
                objPos = viewObj.data.position || { x: 0, y: 0 };
            }
        }

        setDragOffset({
            x: pos.x - objPos.x,
            y: pos.y - objPos.y
        });
    }, [canvasObjects, viewObjects, setSelectedObjectId]);

    const startResizing = useCallback((objectId: string, handle: ResizeHandle, pos: Point, bounds: Bounds) => {
        setSelectedObjectId(objectId);
        setIsResizing(true);
        setResizeHandle(handle);
        setResizeStartBounds({ ...bounds });
        setDragOffset({ x: pos.x, y: pos.y });

        // Store original object data for accurate resizing
        const canvasObj = canvasObjects.get(objectId);
        const viewObj = viewObjects.get(objectId);
        if (canvasObj) {
            setResizeStartData(JSON.parse(JSON.stringify(canvasObj.data)));
        } else if (viewObj) {
            setResizeStartData(JSON.parse(JSON.stringify(viewObj.data)));
        }
    }, [setSelectedObjectId, canvasObjects, viewObjects]);

    const updateDrag = useCallback((pos: Point) => {
        if (!isDragging || !selectedObjectId || !dragOffset) return;

        const newPos: Point = {
            x: pos.x - dragOffset.x,
            y: pos.y - dragOffset.y
        };

        const canvasObj = canvasObjects.get(selectedObjectId);
        const viewObj = viewObjects.get(selectedObjectId);

        if (canvasObj) {
            const updatedObj = { ...canvasObj };

            if (updatedObj.type === 'stroke') {
                const data = updatedObj.data as WhiteboardStrokeData;
                const minX = Math.min(...data.points.map(p => p.x));
                const minY = Math.min(...data.points.map(p => p.y));
                const dx = newPos.x - minX;
                const dy = newPos.y - minY;

                updatedObj.data = {
                    ...data,
                    points: data.points.map(p => ({ x: p.x + dx, y: p.y + dy }))
                };
            } else if (updatedObj.type === 'shape') {
                const data = updatedObj.data as WhiteboardShapeData;
                updatedObj.data = {
                    ...data,
                    position: newPos
                };
            }

            setCanvasObjects(prev => new Map(prev).set(selectedObjectId, updatedObj));
        } else if (viewObj) {
            const updatedObj = { ...viewObj };
            updatedObj.data = {
                ...updatedObj.data,
                position: newPos
            };
            setViewObjects(prev => new Map(prev).set(selectedObjectId, updatedObj));
        }
    }, [isDragging, selectedObjectId, dragOffset, canvasObjects, viewObjects, setCanvasObjects, setViewObjects]);

    const updateResize = useCallback((pos: Point) => {
        if (!isResizing || !selectedObjectId || !resizeHandle || !resizeStartBounds || !resizeStartData) return;

        const minSize = 20;

        // Calculate anchor point (the opposite corner that stays fixed)
        let anchorX: number, anchorY: number;
        switch (resizeHandle) {
            case 'se': anchorX = resizeStartBounds.x; anchorY = resizeStartBounds.y; break;
            case 'sw': anchorX = resizeStartBounds.x + resizeStartBounds.width; anchorY = resizeStartBounds.y; break;
            case 'ne': anchorX = resizeStartBounds.x; anchorY = resizeStartBounds.y + resizeStartBounds.height; break;
            case 'nw': anchorX = resizeStartBounds.x + resizeStartBounds.width; anchorY = resizeStartBounds.y + resizeStartBounds.height; break;
        }

        // Calculate new bounds
        let newX: number, newY: number, newWidth: number, newHeight: number;
        switch (resizeHandle) {
            case 'se':
                newWidth = Math.max(minSize, pos.x - anchorX);
                newHeight = Math.max(minSize, pos.y - anchorY);
                newX = anchorX; newY = anchorY;
                break;
            case 'sw':
                newWidth = Math.max(minSize, anchorX - pos.x);
                newHeight = Math.max(minSize, pos.y - anchorY);
                newX = anchorX - newWidth; newY = anchorY;
                break;
            case 'ne':
                newWidth = Math.max(minSize, pos.x - anchorX);
                newHeight = Math.max(minSize, anchorY - pos.y);
                newX = anchorX; newY = anchorY - newHeight;
                break;
            case 'nw':
                newWidth = Math.max(minSize, anchorX - pos.x);
                newHeight = Math.max(minSize, anchorY - pos.y);
                newX = anchorX - newWidth; newY = anchorY - newHeight;
                break;
        }

        const origWidth = Math.max(1, resizeStartBounds.width);
        const origHeight = Math.max(1, resizeStartBounds.height);
        const scaleX = newWidth / origWidth;
        const scaleY = newHeight / origHeight;

        // Check canvas objects
        const canvasObj = canvasObjects.get(selectedObjectId);
        if (canvasObj) {
            const updatedObj = { ...canvasObj };
            const origData = resizeStartData;

            if (canvasObj.type === 'stroke') {
                const strokeData = origData as WhiteboardStrokeData;
                updatedObj.data = {
                    ...strokeData,
                    points: strokeData.points.map(p => ({
                        x: newX + ((p.x - resizeStartBounds.x) / origWidth) * newWidth,
                        y: newY + ((p.y - resizeStartBounds.y) / origHeight) * newHeight
                    }))
                };
            } else if (canvasObj.type === 'shape') {
                const shapeData = origData as WhiteboardShapeData;

                if (shapeData.type === 'rectangle') {
                    updatedObj.data = {
                        ...shapeData,
                        position: { x: newX, y: newY },
                        dimensions: { width: newWidth, height: newHeight }
                    };
                } else if (shapeData.type === 'circle') {
                    // Circle: position is center, dimensions determine radius
                    // New center should be at the center of the new bounds
                    const newCenterX = newX + newWidth / 2;
                    const newCenterY = newY + newHeight / 2;
                    // New radius is half of the smaller dimension to fit in bounds
                    const newRadius = Math.min(newWidth, newHeight) / 2;

                    updatedObj.data = {
                        ...shapeData,
                        position: { x: newCenterX, y: newCenterY },
                        dimensions: {
                            width: newRadius,
                            height: 0
                        }
                    };
                } else if (shapeData.type === 'line') {
                    // Line: position is start point, dimensions is offset to end point
                    // Use original data for accurate calculation
                    const origStartX = shapeData.position.x;
                    const origStartY = shapeData.position.y;
                    const origEndX = shapeData.position.x + shapeData.dimensions.width;
                    const origEndY = shapeData.position.y + shapeData.dimensions.height;

                    // Map both points from original bounds to new bounds
                    const relStartX = (origStartX - resizeStartBounds.x) / origWidth;
                    const relStartY = (origStartY - resizeStartBounds.y) / origHeight;
                    const relEndX = (origEndX - resizeStartBounds.x) / origWidth;
                    const relEndY = (origEndY - resizeStartBounds.y) / origHeight;

                    const newStartX = newX + relStartX * newWidth;
                    const newStartY = newY + relStartY * newHeight;
                    const newEndX = newX + relEndX * newWidth;
                    const newEndY = newY + relEndY * newHeight;

                    updatedObj.data = {
                        ...shapeData,
                        position: { x: newStartX, y: newStartY },
                        dimensions: {
                            width: newEndX - newStartX,
                            height: newEndY - newStartY
                        }
                    };
                }
            }

            setCanvasObjects(prev => new Map(prev).set(selectedObjectId, updatedObj));
        }

        // Check view objects
        const viewObj = viewObjects.get(selectedObjectId);
        if (viewObj) {
            const updatedObj = { ...viewObj };
            const origData = resizeStartData;

            if (viewObj.type === 'whiteboard_text') {
                const textData = origData as WhiteboardTextData;
                const origFontSize = textData.fontSize || 16;
                const newFontSize = Math.max(8, Math.round(origFontSize * scaleY));

                updatedObj.data = {
                    ...textData,
                    fontSize: newFontSize,
                    position: { x: newX, y: newY + newHeight }
                };
            } else {
                updatedObj.data = {
                    ...origData,
                    width: newWidth,
                    height: newHeight,
                    position: { x: newX, y: newY }
                };
            }
            setViewObjects(prev => new Map(prev).set(selectedObjectId, updatedObj));
        }
    }, [isResizing, selectedObjectId, resizeHandle, resizeStartBounds, resizeStartData, canvasObjects, viewObjects, setCanvasObjects, setViewObjects]);

    const finishDragOrResize = useCallback(() => {
        if ((isDragging || isResizing) && selectedObjectId) {
            const canvasObj = canvasObjects.get(selectedObjectId);
            const viewObj = viewObjects.get(selectedObjectId);

            if (canvasObj) {
                sendUpdate({ type: 'update_canvas_object', object: canvasObj });
            } else if (viewObj) {
                sendUpdate({ type: 'update_view_object', object: viewObj });
            }
        }

        setIsDragging(false);
        setIsResizing(false);
        setResizeHandle(null);
        setResizeStartBounds(null);
        setResizeStartData(null);
        setDragOffset(null);
    }, [isDragging, isResizing, selectedObjectId, canvasObjects, viewObjects, sendUpdate]);

    return {
        isDragging,
        isResizing,
        resizeHandle,
        dragOffset,
        startDragging,
        startResizing,
        updateDrag,
        updateResize,
        finishDragOrResize,
        selectObject
    };
};

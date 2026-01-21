import { useState, useCallback } from 'react';
import { Viewport, Point } from '../tools/types';

interface UseViewportOptions {
    initialViewport?: Viewport;
}

interface UseViewportReturn {
    viewport: Viewport;
    setViewport: React.Dispatch<React.SetStateAction<Viewport>>;
    isPanning: boolean;
    setIsPanning: React.Dispatch<React.SetStateAction<boolean>>;
    lastPanPoint: Point | null;
    setLastPanPoint: React.Dispatch<React.SetStateAction<Point | null>>;
    isSpacePressed: boolean;
    setIsSpacePressed: React.Dispatch<React.SetStateAction<boolean>>;
    screenToCanvas: (screenX: number, screenY: number, canvasRect: DOMRect) => Point;
    handleZoomIn: () => void;
    handleZoomOut: () => void;
    handleResetZoom: () => void;
    handlePanMove: (clientX: number, clientY: number) => void;
    handleWheelZoom: (deltaY: number, mouseX: number, mouseY: number) => void;
}

export const useViewport = (options: UseViewportOptions = {}): UseViewportReturn => {
    const [viewport, setViewport] = useState<Viewport>(options.initialViewport || { x: 0, y: 0, zoom: 1 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastPanPoint, setLastPanPoint] = useState<Point | null>(null);
    const [isSpacePressed, setIsSpacePressed] = useState(false);

    const screenToCanvas = useCallback((screenX: number, screenY: number, canvasRect: DOMRect): Point => {
        return {
            x: (screenX - canvasRect.left - viewport.x) / viewport.zoom,
            y: (screenY - canvasRect.top - viewport.y) / viewport.zoom
        };
    }, [viewport]);

    const handleZoomIn = useCallback(() => {
        setViewport(prev => ({ ...prev, zoom: Math.min(5, prev.zoom * 1.2) }));
    }, []);

    const handleZoomOut = useCallback(() => {
        setViewport(prev => ({ ...prev, zoom: Math.max(0.1, prev.zoom / 1.2) }));
    }, []);

    const handleResetZoom = useCallback(() => {
        setViewport({ x: 0, y: 0, zoom: 1 });
    }, []);

    const handlePanMove = useCallback((clientX: number, clientY: number) => {
        if (lastPanPoint) {
            const dx = clientX - lastPanPoint.x;
            const dy = clientY - lastPanPoint.y;
            setViewport(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
            setLastPanPoint({ x: clientX, y: clientY });
        }
    }, [lastPanPoint]);

    const handleWheelZoom = useCallback((deltaY: number, mouseX: number, mouseY: number) => {
        const delta = deltaY * -0.001;
        setViewport(prev => {
            const newZoom = Math.max(0.1, Math.min(5, prev.zoom + delta));
            const scale = newZoom / prev.zoom;
            return {
                ...prev,
                zoom: newZoom,
                x: mouseX - (mouseX - prev.x) * scale,
                y: mouseY - (mouseY - prev.y) * scale
            };
        });
    }, []);

    return {
        viewport,
        setViewport,
        isPanning,
        setIsPanning,
        lastPanPoint,
        setLastPanPoint,
        isSpacePressed,
        setIsSpacePressed,
        screenToCanvas,
        handleZoomIn,
        handleZoomOut,
        handleResetZoom,
        handlePanMove,
        handleWheelZoom
    };
};

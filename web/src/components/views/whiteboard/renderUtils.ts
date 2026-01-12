import { WhiteboardStrokeData, WhiteboardShapeData, WhiteboardTextData } from '../../../types/view';

export const renderStroke = (
    ctx: CanvasRenderingContext2D,
    data: WhiteboardStrokeData,
    isSelected: boolean,
    viewport: { x: number; y: number; zoom: number }
) => {
    if (!data.points || data.points.length === 0) return;

    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(data.points[0].x, data.points[0].y);
    for (let i = 1; i < data.points.length; i++) {
        ctx.lineTo(data.points[i].x, data.points[i].y);
    }
    ctx.stroke();

    if (isSelected) {
        const minX = Math.min(...data.points.map(p => p.x));
        const maxX = Math.max(...data.points.map(p => p.x));
        const minY = Math.min(...data.points.map(p => p.y));
        const maxY = Math.max(...data.points.map(p => p.y));
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2 / viewport.zoom;
        ctx.setLineDash([5 / viewport.zoom, 5 / viewport.zoom]);
        ctx.strokeRect(minX - 5, minY - 5, maxX - minX + 10, maxY - minY + 10);
        ctx.setLineDash([]);
    }
};

export const renderShape = (
    ctx: CanvasRenderingContext2D,
    data: WhiteboardShapeData,
    isSelected: boolean,
    viewport: { x: number; y: number; zoom: number }
) => {
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.strokeWidth;

    if (data.type === 'rectangle') {
        if (data.filled) {
            ctx.fillStyle = data.color;
            ctx.fillRect(data.position.x, data.position.y, data.dimensions.width, data.dimensions.height);
        }
        ctx.strokeRect(data.position.x, data.position.y, data.dimensions.width, data.dimensions.height);
    } else if (data.type === 'circle') {
        const radius = Math.sqrt(Math.pow(data.dimensions.width, 2) + Math.pow(data.dimensions.height, 2));
        ctx.beginPath();
        ctx.arc(data.position.x, data.position.y, radius, 0, 2 * Math.PI);
        if (data.filled) {
            ctx.fillStyle = data.color;
            ctx.fill();
        }
        ctx.stroke();
    } else if (data.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(data.position.x, data.position.y);
        ctx.lineTo(data.position.x + data.dimensions.width, data.position.y + data.dimensions.height);
        ctx.stroke();
    }

    if (isSelected) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2 / viewport.zoom;
        ctx.setLineDash([5 / viewport.zoom, 5 / viewport.zoom]);
        if (data.type === 'rectangle') {
            ctx.strokeRect(data.position.x - 5, data.position.y - 5, data.dimensions.width + 10, data.dimensions.height + 10);
        } else if (data.type === 'circle') {
            const radius = Math.sqrt(Math.pow(data.dimensions.width, 2) + Math.pow(data.dimensions.height, 2));
            ctx.beginPath();
            ctx.arc(data.position.x, data.position.y, radius + 5, 0, 2 * Math.PI);
            ctx.stroke();
        }
        ctx.setLineDash([]);
    }
};

export const renderText = (
    ctx: CanvasRenderingContext2D,
    data: WhiteboardTextData,
    isSelected: boolean,
    viewport: { x: number; y: number; zoom: number }
) => {
    ctx.fillStyle = data.color;
    ctx.font = `${data.fontSize}px sans-serif`;
    ctx.fillText(data.text, data.position.x, data.position.y);

    if (isSelected) {
        const metrics = ctx.measureText(data.text);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2 / viewport.zoom;
        ctx.setLineDash([5 / viewport.zoom, 5 / viewport.zoom]);
        ctx.strokeRect(data.position.x - 5, data.position.y - data.fontSize - 5, metrics.width + 10, data.fontSize + 10);
        ctx.setLineDash([]);
    }
};

export const renderNoteOrView = (
    ctx: CanvasRenderingContext2D,
    data: any,
    obj: any,
    isSelected: boolean,
    viewport: { x: number; y: number; zoom: number }
) => {
    const width = data.width || 250;
    const height = data.height || 200;

    // Background
    ctx.fillStyle = obj.type === 'whiteboard_note' ? '#fef9c3' : '#ffffff';
    ctx.fillRect(data.position.x, data.position.y, width, height);

    // Border
    ctx.strokeStyle = obj.type === 'whiteboard_note' ? '#eab308' : '#e0e0e0';
    ctx.lineWidth = 2;
    ctx.strokeRect(data.position.x, data.position.y, width, height);

    // Selection highlight
    if (isSelected) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3 / viewport.zoom;
        ctx.setLineDash([5 / viewport.zoom, 5 / viewport.zoom]);
        ctx.strokeRect(data.position.x - 5, data.position.y - 5, width + 10, height + 10);
        ctx.setLineDash([]);

        // Draw resize handles for notes and views
        if (obj.type === 'whiteboard_note' || obj.type === 'whiteboard_view') {
            const handleSize = 8 / viewport.zoom;
            ctx.fillStyle = '#3b82f6';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2 / viewport.zoom;

            // Four corner handles
            const corners = [
                { x: data.position.x, y: data.position.y }, // Northwest
                { x: data.position.x + width, y: data.position.y }, // Northeast
                { x: data.position.x, y: data.position.y + height }, // Southwest
                { x: data.position.x + width, y: data.position.y + height }, // Southeast
            ];

            corners.forEach(corner => {
                ctx.fillRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
                ctx.strokeRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
            });
        }
    }
};

export const renderGrid = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    viewport: { x: number; y: number; zoom: number }
) => {
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1 / viewport.zoom;
    const gridSize = 50;
    const startX = Math.floor(-viewport.x / viewport.zoom / gridSize) * gridSize;
    const startY = Math.floor(-viewport.y / viewport.zoom / gridSize) * gridSize;
    const endX = Math.ceil((canvas.width - viewport.x) / viewport.zoom / gridSize) * gridSize;
    const endY = Math.ceil((canvas.height - viewport.y) / viewport.zoom / gridSize) * gridSize;

    for (let x = startX; x <= endX; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
    }
    for (let y = startY; y <= endY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
    }
};

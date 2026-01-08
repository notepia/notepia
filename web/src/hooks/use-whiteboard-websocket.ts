import { useEffect, useRef, useState, useCallback } from 'react';

interface UseWhiteboardWebSocketOptions {
    viewId: string;
    workspaceId: string;
    enabled: boolean;
}

interface CanvasObject {
    id: string;
    type: 'stroke' | 'shape';
    data: any;
}

interface ViewObject {
    id: string;
    type: string;
    name: string;
    data: any;
}

interface WhiteboardMessage {
    type: 'sync' | 'add_canvas_object' | 'update_canvas_object' | 'delete_canvas_object' | 'add_view_object' | 'update_view_object' | 'delete_view_object' | 'clear_all' | 'init';
    canvas_objects?: Record<string, CanvasObject>;
    view_objects?: Record<string, ViewObject>;
    object?: CanvasObject | ViewObject;
    id?: string;
}

export function useWhiteboardWebSocket(options: UseWhiteboardWebSocketOptions) {
    const { viewId, workspaceId, enabled } = options;

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(1);
    const [canvasObjects, setCanvasObjects] = useState<Map<string, CanvasObject> | null>(null);
    const [viewObjects, setViewObjects] = useState<Map<string, ViewObject> | null>(null);

    const connect = useCallback(() => {
        if (!enabled || !viewId || !workspaceId) return;

        // Build WebSocket URL - cookie authentication will be handled automatically
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/views/${viewId}`;

        try {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('Whiteboard WebSocket connected');
                setIsConnected(true);
            };

            ws.onmessage = (event) => {
                try {
                    const message: WhiteboardMessage = JSON.parse(event.data);

                    switch (message.type) {
                        case 'init':
                            // Initial state from server
                            if (message.canvas_objects) {
                                setCanvasObjects(new Map(Object.entries(message.canvas_objects)));
                            }
                            if (message.view_objects) {
                                setViewObjects(new Map(Object.entries(message.view_objects)));
                            }
                            break;

                        case 'add_canvas_object':
                        case 'update_canvas_object':
                            if (message.object) {
                                setCanvasObjects(prev => {
                                    const newMap = new Map(prev || []);
                                    newMap.set(message.object!.id, message.object as CanvasObject);
                                    return newMap;
                                });
                            }
                            break;

                        case 'delete_canvas_object':
                            if (message.id) {
                                setCanvasObjects(prev => {
                                    const newMap = new Map(prev || []);
                                    newMap.delete(message.id!);
                                    return newMap;
                                });
                            }
                            break;

                        case 'add_view_object':
                        case 'update_view_object':
                            if (message.object) {
                                setViewObjects(prev => {
                                    const newMap = new Map(prev || []);
                                    newMap.set(message.object!.id, message.object as ViewObject);
                                    return newMap;
                                });
                            }
                            break;

                        case 'delete_view_object':
                            if (message.id) {
                                setViewObjects(prev => {
                                    const newMap = new Map(prev || []);
                                    newMap.delete(message.id!);
                                    return newMap;
                                });
                            }
                            break;

                        case 'clear_all':
                            setCanvasObjects(new Map());
                            setViewObjects(new Map());
                            break;
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                setIsConnected(false);
            };

            ws.onclose = () => {
                console.log('WebSocket closed');
                setIsConnected(false);
                wsRef.current = null;

                // Attempt to reconnect after 3 seconds
                if (enabled) {
                    reconnectTimeoutRef.current = setTimeout(() => {
                        console.log('Attempting to reconnect...');
                        connect();
                    }, 3000);
                }
            };
        } catch (error) {
            console.error('Failed to create WebSocket:', error);
        }
    }, [enabled, viewId, workspaceId]);

    const sendUpdate = useCallback((message: Partial<WhiteboardMessage>) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        }
    }, []);

    useEffect(() => {
        if (enabled) {
            connect();
        }

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [enabled, connect]);

    return {
        sendUpdate,
        isConnected,
        onlineUsers,
        canvasObjects,
        viewObjects
    };
}

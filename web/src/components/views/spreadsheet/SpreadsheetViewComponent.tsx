import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Workbook, WorkbookInstance } from '@fortune-sheet/react';
import '@fortune-sheet/react/dist/index.css';
import { useTranslation } from 'react-i18next';
import { SpreadsheetSheetData, SpreadsheetOp } from '../../../types/view';
import { useSpreadsheetWebSocket } from '../../../hooks/use-spreadsheet-websocket';

// Use any for fortune-sheet internal types since they're not fully exported
type Sheet = any;
type Op = any;

interface SpreadsheetViewComponentProps {
    view?: {
        id: string;
        data: string;
    };
    isPublic?: boolean;
    workspaceId?: string;
    viewId?: string;
    initialSheets?: SpreadsheetSheetData[];
    disableWebSocket?: boolean;
}

const SpreadsheetViewComponent = ({
    view,
    isPublic = false,
    workspaceId,
    viewId,
    initialSheets,
    disableWebSocket = false
}: SpreadsheetViewComponentProps) => {
    const { t } = useTranslation();
    const workbookRef = useRef<WorkbookInstance | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse initial sheets from view.data
    const parsedInitialSheets = React.useMemo(() => {
        if (initialSheets && initialSheets.length > 0) {
            return initialSheets;
        }
        if (view?.data) {
            try {
                const parsed = JSON.parse(view.data);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed as SpreadsheetSheetData[];
                }
            } catch (e) {
                console.warn('Failed to parse view.data:', e);
            }
        }
        // Default empty sheet
        return [{
            id: 'sheet1',
            name: 'Sheet1',
            order: 0,
            row: 100,
            column: 26,
            celldata: []
        }] as SpreadsheetSheetData[];
    }, [view?.data, initialSheets]);

    // WebSocket connection
    const {
        sendOps,
        isConnected,
        sheets: remoteSheets,
        pendingOps,
        clearPendingOps
    } = useSpreadsheetWebSocket({
        viewId: viewId || '',
        workspaceId: workspaceId || '',
        enabled: !disableWebSocket && !!viewId && (isPublic || !!workspaceId),
        isPublic: isPublic,
        skipInitialFetch: isPublic && !!initialSheets,
    });

    // Local sheets state - use Sheet[] for fortune-sheet compatibility
    const [localSheets, setLocalSheets] = useState<Sheet[]>(parsedInitialSheets as unknown as Sheet[]);
    const [isReady, setIsReady] = useState(false);

    // Monitor container size
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const updateSize = () => {
            const { width, height } = container.getBoundingClientRect();
            if (width > 0 && height > 0) {
                setIsReady(true);
            }
        };

        const resizeObserver = new ResizeObserver(() => {
            updateSize();
        });

        resizeObserver.observe(container);
        // Initial size check with a small delay to ensure layout is ready
        setTimeout(updateSize, 100);

        return () => resizeObserver.disconnect();
    }, []);

    // Sync remote data to local
    useEffect(() => {
        if (remoteSheets && remoteSheets.length > 0) {
            setLocalSheets(remoteSheets as unknown as Sheet[]);
        }
    }, [remoteSheets]);

    // Handle pending ops from other clients
    useEffect(() => {
        if (pendingOps.length > 0 && workbookRef.current) {
            pendingOps.forEach(op => {
                try {
                    // Cast to Op[] for fortune-sheet compatibility
                    workbookRef.current?.applyOp([op as unknown as Op]);
                } catch (e) {
                    console.error('Failed to apply op:', e);
                }
            });
            clearPendingOps();
        }
    }, [pendingOps, clearPendingOps]);

    // Handle local operations (send to server)
    const handleOp = useCallback((ops: Op[]) => {
        if (!isPublic && ops.length > 0) {
            // Cast to SpreadsheetOp[] for our WebSocket protocol
            sendOps(ops as unknown as SpreadsheetOp[]);
        }
    }, [isPublic, sendOps]);

    // Update local sheets when parsedInitialSheets changes (for initial load)
    useEffect(() => {
        if (parsedInitialSheets && parsedInitialSheets.length > 0 && localSheets.length === 0) {
            setLocalSheets(parsedInitialSheets as unknown as Sheet[]);
        }
    }, [parsedInitialSheets]);

    return (
        <div ref={containerRef} className="relative w-full h-full bg-white dark:bg-neutral-900">
            {/* Loading state */}
            {!isReady && (
                <div className="absolute inset-0 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center z-20">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-neutral-300 border-t-primary rounded-full animate-spin" />
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                            {t('spreadsheet.loading') || 'Loading spreadsheet...'}
                        </span>
                    </div>
                </div>
            )}

            {/* Connection status indicator */}
            {!isPublic && !disableWebSocket && isReady && (
                <div className="absolute top-2 right-2 z-10 bg-white dark:bg-neutral-800 rounded-lg shadow-md px-3 py-2 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                        isConnected ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">
                        {isConnected
                            ? t('spreadsheet.connected') || 'Connected'
                            : t('spreadsheet.disconnected') || 'Disconnected'}
                    </span>
                </div>
            )}

            {/* FortuneSheet Workbook */}
            {isReady && (
                <div style={{ width: '100%', height: '100%' }}>
                    <Workbook
                        ref={workbookRef}
                        data={localSheets}
                        onChange={(data) => setLocalSheets(data)}
                        onOp={handleOp}
                        showToolbar={!isPublic}
                        showFormulaBar={!isPublic}
                        showSheetTabs={true}
                        row={100}
                        column={26}
                        allowEdit={!isPublic}
                    />
                </div>
            )}
        </div>
    );
};

export default SpreadsheetViewComponent;

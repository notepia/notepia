import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import useCurrentWorkspaceId from "@/hooks/use-currentworkspace-id"
import { useEffect, useState, FC } from "react"
import { getNote, NoteData } from "@/api/note"
import { useTranslation } from "react-i18next"
import NoteDetailView from "@/components/notedetail/NoteDetailView"
import NoteDetailSidebar from "@/components/notedetailsidebar/NoteDetailSidebar"
import { TwoColumn, TwoColumnMain, TwoColumnSidebar, useTwoColumn } from "@/components/twocolumn"
import { EllipsisIcon } from "lucide-react"
import { useNoteWebSocket } from "@/hooks/use-note-websocket"

const NoteDetailPage = () => {
    const [note, setNote] = useState<NoteData | null>(null)
    const currentWorkspaceId = useCurrentWorkspaceId()
    const { noteId } = useParams()
    const { t } = useTranslation()

    // Connect to WebSocket for real-time collaboration
    const {
        isConnected,
        noteData: wsNoteData,
        hasYjsSnapshot,
        title: wsTitle,
        content: wsContent,
        activeUsers,
        sendUpdateTitle,
        yDoc,
        yText
    } = useNoteWebSocket({
        noteId: noteId || '',
        workspaceId: currentWorkspaceId || '',
        enabled: !!noteId && !!currentWorkspaceId
    })

    // Only fetch from REST API if note is NOT initialized (no Y.js snapshot)
    // Once Y.js snapshot exists, use WebSocket data only
    const { data: fetchedNote } = useQuery({
        queryKey: ['note', currentWorkspaceId, noteId],
        queryFn: () => getNote(currentWorkspaceId, noteId!),
        enabled: !!noteId && !!currentWorkspaceId && hasYjsSnapshot === false,
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: true,
    })

    useEffect(() => {
        if (hasYjsSnapshot && wsNoteData) {
            // Note is initialized - use WebSocket data
            setNote(wsNoteData)
            console.log('[NoteDetailPage] Using WebSocket note data (Y.js initialized)')
        } else if (!hasYjsSnapshot && fetchedNote) {
            // Note is not initialized - use REST API data
            setNote(fetchedNote)
            console.log('[NoteDetailPage] Using REST API note data (not initialized)')
        }
    }, [hasYjsSnapshot, wsNoteData, fetchedNote])

    return (
        <TwoColumn>
            <NoteDetailContent
                note={note}
                t={t}
                wsTitle={wsTitle}
                wsContent={wsContent}
                activeUsers={activeUsers}
                isConnected={isConnected}
                onTitleChange={sendUpdateTitle}
                yDoc={yDoc}
                yText={yText}
            />
        </TwoColumn>
    )
}

interface NoteDetailContentProps {
    note: NoteData | null
    t: any
    wsTitle: string
    wsContent: string
    activeUsers: Array<{ id: string; name: string }>
    isConnected: boolean
    onTitleChange: (title: string) => void
    yDoc: any
    yText: any
}

const NoteDetailContent: FC<NoteDetailContentProps> = ({
    note,
    t,
    wsTitle,
    wsContent,
    activeUsers,
    isConnected,
    onTitleChange,
    yDoc,
    yText
}) => {
    const { toggleSidebar, isSidebarCollapsed } = useTwoColumn()

    return (
        <>
            <TwoColumnMain
                className="bg-white dark:bg-[#222] text-neutral-800 dark:text-gray-400"
            >
                <NoteDetailView
                    note={note}
                    wsTitle={wsTitle}
                    wsContent={wsContent}
                    activeUsers={activeUsers}
                    isConnected={isConnected}
                    onTitleChange={onTitleChange}
                    yDoc={yDoc}
                    yText={yText}
                    menu={
                        note ? (
                            <button
                                onClick={toggleSidebar}
                                className="lg:hidden p-3 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                title={isSidebarCollapsed ? t("actions.openNoteInfo") : t("actions.closeNoteInfo")}
                            >
                                <EllipsisIcon size={20} />
                            </button>
                        ) : undefined
                    }
                />
            </TwoColumnMain>
            <TwoColumnSidebar>
                {note && <NoteDetailSidebar note={note} />}
            </TwoColumnSidebar>
        </>
    )
}

export default NoteDetailPage

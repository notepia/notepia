import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams, useSearchParams } from "react-router-dom"
import useCurrentWorkspaceId from "@/hooks/use-currentworkspace-id"
import { useEffect, useState, useRef, useCallback, FC } from "react"
import { getNote, NoteData, updateNote } from "@/api/note"
import { useTranslation } from "react-i18next"
import NoteDetailView from "@/components/notedetail/NoteDetailView"
import NoteDetailSidebar from "@/components/notedetailsidebar/NoteDetailSidebar"
import { TwoColumn, TwoColumnMain, TwoColumnSidebar, useTwoColumn } from "@/components/twocolumn"
import { toast } from "@/stores/toast"
import { EllipsisIcon } from "lucide-react"

const NoteDetailPage = () => {
    const [searchParams] = useSearchParams()
    const initialMode = searchParams.get('mode') === 'edit' ? 'edit' : 'view'
    const [note, setNote] = useState<NoteData | null>(null)
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
    const [mode, setMode] = useState<'view' | 'edit'>(initialMode)
    const currentWorkspaceId = useCurrentWorkspaceId()
    const { noteId } = useParams()
    const { t } = useTranslation()
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const queryClient = useQueryClient()

    const { data: fetchedNote } = useQuery({
        queryKey: ['note', currentWorkspaceId, noteId],
        queryFn: () => getNote(currentWorkspaceId, noteId!),
        enabled: !!noteId && !!currentWorkspaceId,
    })

    const updateNoteMutation = useMutation({
        mutationFn: (data: NoteData) => updateNote(currentWorkspaceId, data),
        onSuccess: () => {
            setSaveStatus('saved')
            queryClient.invalidateQueries({ queryKey: ['note', currentWorkspaceId, noteId] })
            queryClient.invalidateQueries({ queryKey: ['notes', currentWorkspaceId] })
            setTimeout(() => setSaveStatus('idle'), 2000)
        },
        onError: (error) => {
            setSaveStatus('idle')
            toast.error(t("messages.saveNoteFailed"))
            console.error("Failed to save note:", error)
        }
    })

    const handleNoteChange = useCallback((data: any) => {
        if (!note || !noteId) return

        const updatedNote = {
            ...note,
            ...data
        }

        setNote(updatedNote)

        // Clear previous timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }

        setSaveStatus('saving')

        // Set new timeout for auto-save (debounced by 1 second)
        saveTimeoutRef.current = setTimeout(() => {
            updateNoteMutation.mutate({
                id: noteId,
                ...updatedNote
            })
        }, 1000)
    }, [note, noteId, updateNoteMutation])

    useEffect(() => {
        if (fetchedNote) {
            setNote(fetchedNote)
        }
    }, [fetchedNote])

    // Update mode when URL search params change
    useEffect(() => {
        const modeParam = searchParams.get('mode')
        if (modeParam === 'edit') {
            setMode('edit')
        } else if (modeParam === null) {
            setMode('view')
        }
    }, [searchParams])

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current)
            }
        }
    }, [])

    return (
        <TwoColumn>
            <NoteDetailContent
                note={note}
                t={t}
                handleNoteChange={handleNoteChange}
                saveStatus={saveStatus}
                mode={mode}
                onModeChange={setMode}
            />
        </TwoColumn>
    )
}

interface NoteDetailContentProps {
    note: NoteData | null
    t: any
    handleNoteChange: (data: any) => void
    saveStatus: 'idle' | 'saving' | 'saved'
    mode: 'view' | 'edit'
    onModeChange: (mode: 'view' | 'edit') => void
}

const NoteDetailContent: FC<NoteDetailContentProps> = ({ note, t, handleNoteChange, saveStatus, mode, onModeChange }) => {
    const { toggleSidebar,isSidebarCollapsed } = useTwoColumn()

    return (
        <>
            <TwoColumnMain
                className="bg-white dark:bg-[#222] text-neutral-800 dark:text-gray-400"
            >
                <NoteDetailView
                    note={note}
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
                    isEditable={mode === 'edit'}
                    onChange={handleNoteChange}
                    saveStatus={saveStatus}
                />
            </TwoColumnMain>
            <TwoColumnSidebar>
                {note && <NoteDetailSidebar note={note} mode={mode} onModeChange={onModeChange} />}
            </TwoColumnSidebar>
        </>
    )
}

export default NoteDetailPage

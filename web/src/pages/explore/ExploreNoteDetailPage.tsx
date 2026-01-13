import { useQuery } from "@tanstack/react-query"
import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { getPublicNote, NoteData } from "@/api/note"
import { useTranslation } from "react-i18next"
import { ArrowLeft } from "lucide-react"
import ReadOnlyNoteContent from "@/components/readonlynotecontent/ReadOnlyNoteContent"

const ExploreNoteDetailPage = () => {
    const [note, setNote] = useState<NoteData | null>(null)
    const { noteId } = useParams()
    const { t } = useTranslation()
    const navigate = useNavigate()

    const { data: fetchedNote } = useQuery({
        queryKey: ['publicNote', noteId],
        queryFn: () => getPublicNote(noteId!),
        enabled: !!noteId,
    })

    useEffect(() => {
        if (fetchedNote) {
            setNote(fetchedNote)
        }
    }, [fetchedNote])

    if (!note) {
        return (
            <div className="overflow-auto bg-white dark:bg-neutral-800 fixed xl:static top-0 left-0 z-[100] w-screen xl:w-full h-dvh">
                <div className="w-full">
                    <div className="flex flex-col min-h-dvh animate-pulse">
                        <div className="flex justify-center">
                            <div className="max-w-3xl w-full m-auto">
                                <div className="px-4 pt-16 xl:pt-32">
                                    <div className="flex flex-col gap-4">
                                        <div className="hidden xl:block">
                                            <div className="h-10 bg-gray-200 dark:bg-neutral-700 rounded w-full"></div>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <div className="h-6 bg-gray-200 dark:bg-neutral-700 rounded w-full"></div>
                                            <div className="h-6 bg-gray-200 dark:bg-neutral-700 rounded w-5/6"></div>
                                            <div className="h-6 bg-gray-200 dark:bg-neutral-700 rounded w-4/5"></div>
                                            <div className="h-6 bg-gray-200 dark:bg-neutral-700 rounded w-full"></div>
                                            <div className="h-6 bg-gray-200 dark:bg-neutral-700 rounded w-3/4"></div>
                                            <div className="h-6 bg-gray-200 dark:bg-neutral-700 rounded w-5/6"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="overflow-auto bg-white dark:bg-neutral-800 fixed xl:static top-0 left-0 z-[100] w-screen xl:w-full h-dvh">
            <div className="w-full">
                <div className="flex flex-col min-h-dvh">
                    <div className="p-2 xl:p-4">
                        <div className="flex justify-between items-center gap-2 flex-1 min-w-0">
                            <button
                                onClick={() => navigate(-1)}
                                aria-label="back"
                                className="inline-flex xl:hidden p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
                            >
                                <ArrowLeft size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="flex">
                        <div className="max-w-3xl w-full m-auto">
                            <div className="xl:p-10">
                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2 xl:py-4 px-4 items-center">
                                        <div className="flex-1 text-4xl text-gray-300 dark:text-gray-600 font-semibold min-w-0">
                                            {note.title || t("notes.untitled")}
                                        </div>
                                    </div>
                                    <div className="px-4">
                                        <div key={`note-${note.id}`}>
                                            <ReadOnlyNoteContent note={note} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ExploreNoteDetailPage
import { FC, ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { NoteData } from "@/api/note"
import { useTranslation } from "react-i18next"
import Editor from "../editor/Editor"
import EditableDiv from "@/components/editablediv/EditableDiv"

interface NoteDetailViewProps {
    note: NoteData | null
    menu?: ReactNode
    wsTitle: string
    wsContent: string
    onTitleChange: (title: string) => void
    yDoc?: any
    yText?: any
}

const NoteDetailView: FC<NoteDetailViewProps> = ({
    note,
    menu,
    wsTitle,
    wsContent,
    onTitleChange,
    yDoc,
    yText
}) => {
    const navigate = useNavigate()
    const { t } = useTranslation()

    if (!note) {
        return (
            <div className="w-full">
                <div className="flex flex-col min-h-dvh animate-pulse">
                    <div className="flex">
                        <div className="w-full m-auto">
                            <div className="px-6 pt-16">
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
        )
    }

    // Use WebSocket data if available, fallback to note data
    const displayTitle = wsTitle || note.title
    const displayContent = wsContent || note.content

    return (
        <div className="w-full">
            {note && (
                <div className="flex flex-col min-h-dvh">
                    <div className="p-2 xl:p-0 flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0 xl:hidden">
                            <button
                                onClick={() => navigate(-1)}
                                aria-label="back"
                                className="inline-flex p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <EditableDiv
                                key={note.id}
                                value={displayTitle}
                                editable={true}
                                placeholder={t("notes.untitled")}
                                className="flex-1 text-lg font-semibold border-none outline-none bg-transparent placeholder:text-gray-300 dark:placeholder:text-gray-600 min-w-0"
                                onChange={onTitleChange}
                            />
                            {menu && <div className="inline-flex flex-shrink-0">{menu}</div>}
                        </div>
                    </div>
                    <div className="flex">
                        <div className="w-full m-auto">
                            <div className="lg:p-4">
                                <div className="flex flex-col gap-2">
                                    <div className="hidden xl:flex xl:gap-2 p-4 xl:items-center">
                                        <EditableDiv
                                            key={note.id}
                                            value={displayTitle}
                                            editable={true}
                                            placeholder={t("notes.untitled")}
                                            className="flex-1 text-4xl font-semibold border-none outline-none bg-transparent placeholder:text-gray-300 dark:placeholder:text-gray-600 min-w-0"
                                            onChange={onTitleChange}
                                        />

                                        {menu && <div className="inline-flex flex-shrink-0">{menu}</div>}
                                    </div>
                                    <div className="px-4">
                                        <div key={`editor-${note.id}`}>
                                            <Editor
                                                note={{ ...note, content: displayContent }}
                                                yDoc={yDoc}
                                                yText={yText}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default NoteDetailView

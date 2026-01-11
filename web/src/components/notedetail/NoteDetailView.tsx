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
    activeUsers: Array<{ id: string; name: string }>
    isConnected: boolean
    onTitleChange: (title: string) => void
    yDoc?: any
    yText?: any
}

const NoteDetailView: FC<NoteDetailViewProps> = ({
    note,
    menu,
    wsTitle,
    wsContent,
    activeUsers,
    isConnected,
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
                            {/* Connection status indicator */}
                            {isConnected && activeUsers.length > 0 && (
                                <div className="flex items-center gap-1 px-2">
                                    <div className="flex -space-x-2">
                                        {activeUsers.slice(0, 3).map((user, index) => (
                                            <div
                                                key={user.id}
                                                className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center border-2 border-white dark:border-gray-800"
                                                title={user.name}
                                            >
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                        ))}
                                    </div>
                                    {activeUsers.length > 3 && (
                                        <span className="text-xs text-gray-500">
                                            +{activeUsers.length - 3}
                                        </span>
                                    )}
                                </div>
                            )}
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
                                        {/* Desktop active users */}
                                        {isConnected && activeUsers.length > 0 && (
                                            <div className="flex items-center gap-2 ml-4">
                                                <div className="flex -space-x-2">
                                                    {activeUsers.slice(0, 5).map((user) => (
                                                        <div
                                                            key={user.id}
                                                            className="w-8 h-8 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center border-2 border-white dark:border-gray-800"
                                                            title={user.name}
                                                        >
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    ))}
                                                </div>
                                                {activeUsers.length > 5 && (
                                                    <span className="text-sm text-gray-500">
                                                        +{activeUsers.length - 5}
                                                    </span>
                                                )}
                                            </div>
                                        )}
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

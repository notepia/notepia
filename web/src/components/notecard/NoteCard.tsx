import { FC } from "react"
import { Link } from "react-router-dom"
import { NoteData } from "@/api/note"
import NoteTime from "../notetime/NoteTime"
import Renderer from "@/components/renderer/Renderer"
import { ExternalLink } from "lucide-react"

interface NoteCardProps {
    note: NoteData
    linkTo?: string
    showLink?: boolean
}

const NoteCard: FC<NoteCardProps> = ({ note, linkTo }) => {

    return (
        <div className="bg-white dark:bg-neutral-800 border sm:shadow-sm dark:border-none rounded-lg overflow-auto flex flex-col gap-2 p-4">
            <>
                <div className="flex justify-between items-center text-gray-500">
                    <div>
                        <NoteTime time={note.created_at ?? ""} />
                    </div>
                    <div>
                        <Link to={linkTo || ""}>
                            <ExternalLink size={16} />
                        </Link>
                    </div>
                </div>
                <div className="break-all w-full flex flex-col m-auto">
                    {note.title ? (
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {note.title}
                        </div>
                    ) : (
                        <Renderer content={note?.content || ''} />
                    )}
                </div>
            </>
        </div>
    )
}

export default NoteCard
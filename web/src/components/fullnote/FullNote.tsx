import { FC } from "react"
import { NoteData } from "@/api/note"
import { PhotoProvider } from 'react-photo-view'
import Renderer from "../renderer/Renderer"

interface Props {
    note: NoteData
}

const FullNote: FC<Props> = ({ note }) => {
    return <>
        <PhotoProvider>
            <Renderer content={note?.content || ''} />
        </PhotoProvider>
    </>
}

export default FullNote
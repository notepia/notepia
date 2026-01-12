import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getNote } from '../../../api/note';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { TableKit } from '@tiptap/extension-table';
import { Attachment } from '../../editor/extensions/attachment/Attachment';
import { ImageNode } from '../../editor/extensions/imagenode/ImageNode';

interface NoteOverlayProps {
    noteId: string;
    position: { x: number; y: number };
    width: number;
    height: number;
    viewport: { x: number; y: number; zoom: number };
    workspaceId?: string;
}

const NoteOverlay: React.FC<NoteOverlayProps> = ({ noteId, position, width, height, viewport, workspaceId }) => {
    const { data: note } = useQuery({
        queryKey: ['note', workspaceId, noteId],
        queryFn: () => getNote(workspaceId!, noteId),
        enabled: !!workspaceId && !!noteId,
    });

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                blockquote: {
                    HTMLAttributes: {
                        class: "border-l-4 pl-4 italic text-gray-600"
                    }
                },
                codeBlock: {
                    HTMLAttributes: {
                        class: "rounded bg-gray-800 text-gray-100 p-4 font-mono text-sm"
                    }
                }
            }),
            TaskList.configure({
                HTMLAttributes: {
                    class: 'list-none',
                },
            }),
            TaskItem.configure({
                HTMLAttributes: {
                    class: 'pointer-events-none',
                },
            }),
            Attachment.configure({
                upload: undefined,
                workspaceId: undefined,
                listFiles: undefined
            }),
            ImageNode.configure({
                upload: undefined,
                workspaceId: undefined,
                listFiles: undefined
            }),
            TableKit,
        ],
        editorProps: {
            attributes: {
                class: 'prose prose-xs focus:outline-none max-w-none',
            },
        },
        content: note?.content ? JSON.parse(note.content) : null,
        editable: false,
    }, [note?.id]);

    if (!note || !note.content || !editor) return null;

    // Calculate transformed position based on viewport
    const transformedX = position.x * viewport.zoom + viewport.x;
    const transformedY = position.y * viewport.zoom + viewport.y;
    const transformedWidth = width * viewport.zoom;
    const transformedHeight = height * viewport.zoom;

    // Calculate font size based on zoom
    const fontSize = Math.max(8, Math.min(12, 10 * viewport.zoom));
    const scaleFactor = fontSize / 10;

    return (
        <div
            className="absolute pointer-events-none overflow-hidden"
            style={{
                left: `${transformedX}px`,
                top: `${transformedY + 5 * viewport.zoom}px`,
                width: `${transformedWidth}px`,
                height: `${transformedHeight - 35 * viewport.zoom}px`,
            }}
        >
            <div
                className="p-2 overflow-hidden select-text"
                style={{
                    transform: `scale(${scaleFactor})`,
                    transformOrigin: 'top left',
                    width: `${100 / scaleFactor}%`,
                    height: `${100 / scaleFactor}%`,
                }}
            >
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};

export default NoteOverlay;

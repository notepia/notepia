import DragHandle from '@tiptap/extension-drag-handle-react'
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { useEditor, EditorContext, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Placeholder } from "@tiptap/extensions"
import { FC, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Code, GripVertical, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, Image, List, ListTodo, Paperclip, Type } from 'lucide-react'
import { CommandItem, SlashCommand } from './extensions/slashcommand/SlashCommand'
import { Attachment } from './extensions/attachment/Attachment'
import { ImageNode } from './extensions/imagenode/ImageNode'

interface Props {
  data: any
  onChange?: (data: any) => void
}

const Editor: FC<Props> = ({ data, onChange }) => {
  const { t } = useTranslation("editor")
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
      Placeholder.configure({
        placeholder: t("placeholder")
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'list-none',
        },
      }),
      TaskItem,
      Attachment,
      ImageNode,
      SlashCommand.configure({
        suggestion: {
          items: ({ query }: { query: string }): CommandItem[] => {
            return [
              {
                icon: <Type size={14} />,
                label: t("Paragraph"),
                keywords: ["text"],
                command: ({ editor }: any) =>
                  editor.chain().focus().setParagraph().run(),
              },
              {
                icon: <Code size={14} />,
                label: t("Code"),
                keywords: ["text"],
                command: ({ editor }: any) =>
                  editor.chain().focus().toggleCode().run(),
              },
              {
                icon: <Heading1 size={16} />,
                label: t("Heading 1"),
                keywords: ["h1", "title", "header", "heading"],
                command: ({ editor }: any) =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run(),
              },
              {
                icon: <Heading2 size={16} />,
                label: t("Heading 2"),
                keywords: ["h2", "title", "header", "heading"],
                command: ({ editor }: any) =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run(),
              },
              {
                icon: <Heading3 size={16} />,
                label: t("Heading 3"),
                keywords: ["h3", "title", "header", "heading"],
                command: ({ editor }: any) =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run(),
              },
              {
                icon: <Heading4 size={16} />,
                label: t("Heading 4"),
                keywords: ["h4", "title", "header", "heading"],
                command: ({ editor }: any) =>
                  editor.chain().focus().toggleHeading({ level: 4 }).run(),
              },
              {
                icon: <Heading5 size={16} />,
                label: t("Heading 5"),
                keywords: ["h5", "title", "header", "heading"],
                command: ({ editor }: any) =>
                  editor.chain().focus().toggleHeading({ level: 5 }).run(),
              },
              {
                icon: <Heading6 size={16} />,
                label: t("Heading 6"),
                keywords: ["h6", "title", "header", "heading"],
                command: ({ editor }: any) =>
                  editor.chain().focus().toggleHeading({ level: 6 }).run(),
              },
              {
                icon: <List size={16} />,
                label: t("BulletList"),
                keywords: ["list"],
                command: ({ editor }: any) =>
                  editor.chain().focus().toggleBulletList().run(),
              },
              {
                icon: <ListTodo size={16} />,
                label: t("TaskList"),
                keywords: ["list"],
                command: ({ editor }: any) =>
                  editor.chain().focus().toggleTaskList().run(),
              },
              {
                icon: <Paperclip size={16} />,
                label: t("Attachment"),
                keywords: ["file"],
                command: ({ editor }: any) =>
                  editor?.chain().focus().setFile({ src: null, name: null }).run()
              },
              {
                icon: <Image size={16} />,
                label: t("Image"),
                keywords: ["image"],
                command: ({ editor }: any) =>
                  editor?.chain().focus().setImage({ src: null, name: null }).run()
              },
            ].filter((item) =>
              item.label.toLowerCase().includes(query.toLowerCase()) ||
              item.keywords?.some(k => k.toLowerCase().includes(query.toLowerCase()))
            )
          },
        }
      })
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl p-3 focus:outline-none',
      },
    },
    content: data ?? ``,
    onUpdate({ editor }) {
      if (onChange) {
        onChange(editor.getJSON())
      }
    },
  })

  const providerValue = useMemo(() => ({ editor }), [editor])

  return (
    <EditorContext.Provider value={providerValue}>
      <DragHandle editor={editor} className='border rounded shadow-sm p-1'>
        <GripVertical size={12} />
      </DragHandle>
      <EditorContent editor={editor} />
    </EditorContext.Provider>
  )
}

export default Editor
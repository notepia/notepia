import { TaskItem, TaskList } from "@tiptap/extension-list"
import { useEditor, EditorContext, EditorContent } from "@tiptap/react"
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from "@tiptap/starter-kit"
import { Placeholder } from "@tiptap/extensions"
import { useMemo } from "react"
import { SlashCommand } from "./extensions/slash-command/slash"

const Editor = () => {

  const editor = useEditor({
    extensions: [StarterKit,
      Placeholder.configure({
        placeholder: "enter / to open the menu",
      }),
      TaskList,
      TaskItem,
      SlashCommand],
    content: '',
  })

  const providerValue = useMemo(() => ({ editor }), [editor])

  return (
    <EditorContext.Provider value={providerValue}>
      <button onClick={() => console.log(editor.getJSON())}>save</button>
      <EditorContent className="prose" editor={editor} />
      <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu>
    </EditorContext.Provider>
  )
}

export default Editor
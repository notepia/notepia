import { FC, useEffect, useState } from "react"
import { BubbleMenu } from "@tiptap/react/menus"
import { Editor, useEditorState } from "@tiptap/react"

interface Props {
    editor: Editor
}

const MyBubbleMenu: FC<Props> = ({ editor }) => {
    const [clicked, setClicked] = useState(false)

    const editorState = useEditorState({
        editor,
        selector: ({ editor }) => {
            if (!editor) return null;

            return {
                isEditable: editor.isEditable,
                currentSelection: editor.state.selection,
                currentSelectionContent: editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, " "),
                currentSelectionNodes: getSelectedTypes(editor),
            };
        },
    })

function getSelectedTypes(editor: Editor) {
  const { from, to } = editor.state.selection
  const nodeTypes = new Set<string>()
  const markTypes = new Set<string>()

  editor.state.doc.nodesBetween(from, to, (node) => {
    if (!node.isText) {
      nodeTypes.add(node.type.name)
    } else {
      node.marks.forEach(mark => markTypes.add(mark.type.name))
    }
  })

  return {
    nodes: Array.from(nodeTypes),
    marks: Array.from(markTypes),
  }
}

    //   useEffect(() => {
    //     if (!editor) return

    //     editor.on("selectionUpdate", ({ editor }) => {
    //       const { from, to, empty } = editor.state.selection
    //       if (!empty) {
    //         const text = editor.state.doc.textBetween(from, to, " ")
    //         setSelectedText(text)
    //       } else {
    //         setSelectedText("")
    //       }
    //     })
    //   }, [editor])

    return (
        <BubbleMenu
            editor={editor}
            shouldShow={({ editor }) => !editor.isEmpty && !editor.state.selection.empty && editor.isActive("paragraph")}
            options={{ onHide: () => setClicked(false), placement: 'bottom' }}
        >
            <div className="bubble-menu">
                <button onClick={() => setClicked(true)}>
                    open
                </button>
            </div>
        </BubbleMenu>
    )
}

export default MyBubbleMenu

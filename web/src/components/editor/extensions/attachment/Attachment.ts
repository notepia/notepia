import { Node, mergeAttributes } from '@tiptap/core'
import AttachmentComponent from './AttachmentComponent'
import { ReactNodeViewRenderer } from '@tiptap/react'

export const Attachment = Node.create({
  name: 'attachment',

  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      name: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'file-node' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['file-node', mergeAttributes(HTMLAttributes)]
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setFile:
        (options: { src: string; name: string }) =>
        ({ chain }:any) =>
          chain()
            .insertContent({
              type: this.name,
              attrs: options,
            })
            .run(),
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(AttachmentComponent)
  },
})
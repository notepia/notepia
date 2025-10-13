import { Node, mergeAttributes } from '@tiptap/core'
import AIGenerationComponent from './AIGenerationComponent'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { GenCommand } from '../../../../types/user'
import { AIGenerateRequest } from '../../../../types/ai'

export const AIGenerationNode = Node.create({
    name: 'AIGeneration',

    group: 'block',
    atom: true,

    addAttributes() {
        return {
            command: { default: null },
            result: { default: null },
            selectedText: { default: null },
            selectedImages: { default: null }
        }
    },

    addOptions() {
        return {
            generate: async (req: AIGenerateRequest) => {
                return {}
            }
        }
    },

    parseHTML() {
        return [{ tag: 'AIGeneration-node' }]
    },

    renderHTML({ HTMLAttributes }) {
        return ['AIGeneration-node', mergeAttributes(HTMLAttributes)]
    },

    addCommands() {
        return {
            ...this.parent?.(),
            addAIGeneration:
                (command: GenCommand) =>
                    ({ chain }: any) => {
                        const { state } = this.editor
                        const { selection } = state
                        const selectedText = state.doc.textBetween(selection.from, selection.to, ' ')
                        const posAfter = selection.$to.end()
                        chain()
                            .insertContentAt(posAfter, {
                                type: this.name,
                                attrs: {
                                    command: command,
                                    selectedText: selectedText
                                }
                            })
                            .run()
                    },
        }
    },

    addNodeView() {
        return ReactNodeViewRenderer(AIGenerationComponent, {
            as: 'div'
        })
    },
})
import React from 'react'
import { NoteData } from '../../api/note'
import { PhotoView } from 'react-photo-view'

interface Node {
    type: string
    content?: Node[]
    text?: string
    marks?: { type: string; attrs?: any }[]
    attrs?: any
}

interface RendererProps {
    json: Node
}

const Renderer: React.FC<RendererProps> = ({ json }) => {
    const renderNode = (node: Node, key?: React.Key): React.ReactNode => {
        if (!node) return null

        const renderContent = () =>
            node.content?.map((child, idx) => renderNode(child, idx))

        switch (node.type) {
            case 'paragraph':
                return <p className='px-4 leading-6' key={key}>{renderContent()}</p>
            case 'heading':
                const level = node.attrs?.level || 1
                const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements
                return <HeadingTag key={key} className='px-4'>{renderContent()}</HeadingTag>
            case 'bulletList':
                return <ul key={key} className="px-4">{renderContent()}</ul>
            case 'orderedList':
                return <ol key={key} className="px-4">{renderContent()}</ol>
            case 'taskList':
                return <div key={key} className="px-4">{renderContent()}</div>
            case 'taskItem':
                return <div className='px-4 flex'><input disabled={true} type='checkbox' checked={node.attrs.checked} aria-label='checkbox' />{renderContent()}</div>
            case 'listItem':
                return <li key={key} className="px-4">{renderContent()}</li>
            case 'codeBlock':
                return <pre key={key} className="px-4"><code>{renderContent()}</code></pre>
            case 'blockquote':
                return <blockquote key={key} className="px-4">{renderContent()}</blockquote>
            case 'horizontalRule':
                return <hr key={key} />
            case 'image':
                return <div className="px-4">
                    <PhotoView src={node.attrs?.src} >
                        <img className=" rounded overflow-hidden max-w-full max-h-[620px]" key={key} alt={node.attrs?.name || ''} src={node.attrs?.src} />
                    </PhotoView>
                </div>
            case 'attachment':
                return <a href={node.attrs.src} className="px-4 text-blue-600">{node.attrs.name}</a>
            case 'hardBreak':
                return <br key={key} />
            case 'text':
                let text: React.ReactNode = node.text
                if (node.marks) {
                    node.marks.forEach(mark => {
                        switch (mark.type) {
                            case 'bold':
                                text = <strong key={key}>{text}</strong>
                                break
                            case 'italic':
                                text = <em key={key}>{text}</em>
                                break
                            case 'strike':
                                text = <s key={key}>{text}</s>
                                break
                            case 'code':
                                text = <code key={key}>{text}</code>
                                break
                            case 'link':
                                text = (
                                    <a
                                        key={key}
                                        href={mark.attrs?.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {text}
                                    </a>
                                )
                                break
                            default:
                                break
                        }
                    })
                }
                return text
            default:
                return <></>
        }
    }

    return <>{(json.content || []).map((node, idx) => renderNode(node, idx))}</>
}

export const ConvertToNode: (n: NoteData) => Node = (noteData: NoteData) => {
    let node: Node = {
        type: 'doc',
        content: []
    }

    node.content = noteData.blocks?.map(b => {
        return {
            type: b.type,
            content: b.data.content,
            attrs: b.data.attrs
        }
    })

    return node
}

export default Renderer
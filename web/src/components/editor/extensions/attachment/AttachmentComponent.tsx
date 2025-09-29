import { NodeViewProps, NodeViewWrapper } from "@tiptap/react"
import { DownloadIcon, UploadCloud } from "lucide-react"
import { useRef } from "react"

const AttachmentComponent: React.FC<NodeViewProps> = ({ node, updateAttributes, extension }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const { src, name } = node.attrs

  const handleSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const result = await extension.options?.upload(file)

    if (result?.src) {
      updateAttributes({
        src: result.src,
        name: result.name
      })
    }
  }

  if (!src) {
    return (
      <NodeViewWrapper className="file-node select-none border rounded p-2 bg-gray-100">
        <button
          className="rounded w-full h-32 flex gap-3 items-center justify-center"
          onClick={() => inputRef.current?.click()}
        >
          <UploadCloud size={20} />
          Upload
        </button>
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          aria-label="upload"
          onChange={handleSelectFile}
        />
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper className="file-node select-none border rounded p-2 flex items-center gap-2 bg-gray-50">
      <span className="text-blue-500"></span>
      <a href={src} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">
        {name}
      </a>
      <a
        href={src}
        download={name}
        className="ml-auto text-sm text-gray-600 hover:text-gray-900"
      >
        <DownloadIcon size={16} />
      </a>
    </NodeViewWrapper>
  )
}

export default AttachmentComponent
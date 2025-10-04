import { NodeViewProps, NodeViewWrapper } from "@tiptap/react"
import { Image, Loader2 } from "lucide-react"
import { useRef, useState } from "react"
import { twMerge } from "tailwind-merge"

const ImageComponent: React.FC<NodeViewProps> = ({ node, extension, updateAttributes, selected }) => {
    const [isUploading, setIsUploading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const { src, name } = node.attrs

    const handleSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)

        const result = await extension.options?.upload(file)

        setIsUploading(false)

        if (result?.src) {
            updateAttributes({
                src: result.src,
                name: result.name
            })
        }
    }

    if (!src) {
        return (
            <NodeViewWrapper className="image-node select-none border rounded p-2 bg-gray-100">
                <button
                    className="rounded w-full h-32 flex gap-3 items-center justify-center"
                    onClick={() => inputRef.current?.click()}
                >
                    {
                        isUploading ?
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Uploading
                            </>
                            :
                            <>
                                <Image size={20} />
                                Upload
                            </>
                    }


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
        <NodeViewWrapper >
            <img src={src} className={twMerge("image-node select-none rounded box-border w-auto", selected ? "border-4 border-sky-300" : "")} alt={name} />
        </NodeViewWrapper>
    )
}

export default ImageComponent
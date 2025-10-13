import { FC, useState, useEffect } from "react"
import { BubbleMenu } from "@tiptap/react/menus"
import { Editor } from "@tiptap/react"
import { useQuery } from "@tanstack/react-query"
import { getUserGenCommands } from "../../../../api/user"
import { useCurrentUserStore } from "../../../../stores/current-user"

interface Props {
    editor: Editor
}

const ImageSelectionMenu: FC<Props> = ({ editor }: any) => {
    const { user } = useCurrentUserStore()
    const [imageBase64, setImageBase64] = useState<string | null>(null)

    // Fetch commands
    const { data: commands = [], isLoading } = useQuery({
        queryKey: ["userGenCommands", user?.id],
        queryFn: async () => {
            const result = await getUserGenCommands(user!.id);
            return result || [];
        },
        enabled: !!user?.id,
    })

    // Convert image URL to base64
    const convertImageToBase64 = async (imageUrl: string): Promise<string> => {
        try {
            const response = await fetch(imageUrl)
            const blob = await response.blob()
            return new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.onloadend = () => {
                    const base64String = reader.result as string
                    // Extract only the base64 data without the data URL prefix
                    const base64Data = base64String.split(',')[1]
                    resolve(base64Data)
                }
                reader.onerror = reject
                reader.readAsDataURL(blob)
            })
        } catch (error) {
            console.error('Error converting image to base64:', error)
            throw error
        }
    }

    // Get selected image and convert to base64
    useEffect(() => {
        if (editor.isActive('image')) {
            const { node } = editor.state.selection as any
            if (node?.attrs?.src) {
                convertImageToBase64(node.attrs.src)
                    .then(base64 => setImageBase64(base64))
                    .catch(err => console.error('Failed to convert image:', err))
            }
        }
    }, [editor.state.selection])

    const handleCommandClick = async (command: any) => {
        if (!imageBase64) {
            console.error('No image base64 available')
            return
        }
        editor.chain().focus().addAIGenerationWithImage(command, imageBase64).run()
    }

    return (
        commands &&
        commands.filter(x => x.menu_type == "editorImageSelectionMenu").length > 0 &&
        <BubbleMenu
            editor={editor}
            shouldShow={({ editor }) => editor.isActive("image")}
            options={{ placement: 'bottom-start' }}
        >
            <div className="image-selection-menu text-xs bg-white p-1 border rounded-md shadow-sm flex gap-1">
                {
                    commands.filter(x => x.menu_type == "editorImageSelectionMenu").map(c => (
                        <button
                            key={c.id}
                            onClick={() => handleCommandClick(c)}
                            className="px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                            disabled={!imageBase64}
                        >
                            {c.name}
                        </button>
                    ))
                }
            </div>
        </BubbleMenu>
    )
}

export default ImageSelectionMenu

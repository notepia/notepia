import { LucideAlignJustify } from "lucide-react"
import { useSidebar } from "./SidebarProvider"

const SidebarButton = () => {
    const { toggleSidebar, isOver1280 } = useSidebar()

    return !isOver1280 && <button title="toggle the sidebar" className="bg-opacity-50 text-gray-600 dark:text-gray-400" onClick={() => toggleSidebar()}>
        <LucideAlignJustify size={20} />
    </button>
}

export default SidebarButton
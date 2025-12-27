import { createContext, useContext, ReactNode } from "react"
import { useSidebarToggle } from "./useSidebarToggle"
import { twMerge } from "tailwind-merge"
import { useSidebar } from "@/components/sidebar/SidebarProvider"

interface TwoColumnContextValue {
    isSidebarCollapsed: boolean
    toggleSidebar: () => void
    openBottomSheet: () => void
    breakpoint: number
}

const TwoColumnContext = createContext<TwoColumnContextValue | undefined>(undefined)

/**
 * Hook to access TwoColumn context
 */
export const useTwoColumn = () => {
    const context = useContext(TwoColumnContext)
    if (!context) {
        throw new Error('useTwoColumn must be used within TwoColumn component')
    }
    return context
}

interface TwoColumnProps {
    children: ReactNode
    breakpoint?: number
    defaultBottomSheetOpen?: boolean
}

export const TwoColumn = ({ children, breakpoint = 1024, defaultBottomSheetOpen = false }: TwoColumnProps) => {

    const { isCollapse } = useSidebar()
    const { isSidebarCollapsed, toggleSidebar, setIsSidebarCollapsed } = useSidebarToggle(breakpoint, defaultBottomSheetOpen)

    const openBottomSheet = () => {
        // On mobile (below breakpoint), open the bottom sheet by setting collapsed to false
        if (window.innerWidth < breakpoint) {
            setIsSidebarCollapsed(false)
        }
    }

    return (
        <TwoColumnContext.Provider value={{ isSidebarCollapsed, toggleSidebar, openBottomSheet, breakpoint }}>
            <div className={twMerge(!isCollapse ? "xl:px-4" : "", "w-full h-screen flex overflow-hidden ")}>
                {children}
            </div>
        </TwoColumnContext.Provider>
    )
}

export default TwoColumn
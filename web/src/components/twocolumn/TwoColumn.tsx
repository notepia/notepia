import { createContext, useContext, ReactNode } from "react"
import { useSidebarToggle } from "./useSidebarToggle"

interface TwoColumnContextValue {
    isSidebarCollapsed: boolean
    toggleSidebar: () => void
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
}

/**
 * Root container for two-column layout
 *
 * @example
 * ```tsx
 * <TwoColumn>
 *   <TwoColumnMain>Main content</TwoColumnMain>
 *   <TwoColumnSidebar>Sidebar content</TwoColumnSidebar>
 * </TwoColumn>
 * ```
 */
export const TwoColumn = ({ children, breakpoint = 1024 }: TwoColumnProps) => {
    const { isSidebarCollapsed, toggleSidebar } = useSidebarToggle(breakpoint)

    return (
        <TwoColumnContext.Provider value={{ isSidebarCollapsed, toggleSidebar, breakpoint }}>
            <div className="w-full h-screen flex overflow-hidden">
                {children}
            </div>
        </TwoColumnContext.Provider>
    )
}

export default TwoColumn
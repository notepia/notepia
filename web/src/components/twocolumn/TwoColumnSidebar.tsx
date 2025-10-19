import { ReactNode } from "react"
import { useTwoColumn } from "./TwoColumn"

interface TwoColumnSidebarProps {
    children: ReactNode
    className?: string
}

/**
 * Sidebar area of the two-column layout
 * - Hidden by default on mobile (<breakpoint)
 * - Always visible on desktop (>=breakpoint)
 * - Fixed position overlay on mobile when open
 *
 * @example
 * ```tsx
 * <TwoColumnSidebar>
 *   <div>Your sidebar content here</div>
 * </TwoColumnSidebar>
 * ```
 */
export const TwoColumnSidebar = ({ children, className = "" }: TwoColumnSidebarProps) => {
    const { isSidebarCollapsed } = useTwoColumn()

    return (
        <div
            className={`${
                isSidebarCollapsed
                    ? 'hidden lg:hidden'
                    : 'w-full h-screen fixed right-0 top-0 lg:static lg:w-1/3'
            } border-l dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 overflow-y-auto transition-all duration-300 z-50 ${className}`}
        >
            {children}
        </div>
    )
}

export default TwoColumnSidebar
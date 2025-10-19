import { ReactNode } from "react"
import TransitionWrapper from "@/components/transitionwrapper/TransitionWrapper"

interface TwoColumnMainProps {
    children: ReactNode
    className?: string
}

/**
 * Main content area of the two-column layout
 *
 * @example
 * ```tsx
 * <TwoColumnMain>
 *   <div>Your main content here</div>
 * </TwoColumnMain>
 * ```
 */
export const TwoColumnMain = ({ children, className = "" }: TwoColumnMainProps) => {
    return (
        <TransitionWrapper className={`w-full xl:px-0 xl:pr-4 overflow-y-auto transition-all duration-300 ${className}`}>
            {children}
        </TransitionWrapper>
    )
}

export default TwoColumnMain
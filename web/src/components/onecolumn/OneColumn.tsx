import { useSidebar } from "@/components/sidebar/SidebarProvider"
import { FC, ReactNode } from "react"
import { twMerge } from "tailwind-merge"

interface Props {
    children: ReactNode
}

const OneColumn: FC<Props> = ({ children }) => {
    const { isCollapse } = useSidebar()
    return <div className={twMerge(isCollapse ? "xl:px-0" : "", "px-4 xl:pr-4 w-full")}>
        {children}
    </div>
}

export default OneColumn
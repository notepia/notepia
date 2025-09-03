import { motion } from "motion/react"
import { FC, ReactNode } from "react"
import { twMerge } from "tailwind-merge"

const TransitionWrapper: FC<{ className:string,  children: ReactNode }> = ({ className, children }) => {
    return <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.2 }}
        className={twMerge(' px-4 xl:px-0 xl:pr-4',className)}
    >
        {children}
    </motion.div>
}

export default TransitionWrapper
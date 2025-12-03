import { FC } from "react"
import GeneratorCardSkeleton from "./GeneratorCardSkeleton"

interface GeneratorsGridSkeletonProps {
    count?: number
}

const GeneratorsGridSkeleton: FC<GeneratorsGridSkeletonProps> = ({ count = 6 }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, idx) => (
                <GeneratorCardSkeleton key={idx} />
            ))}
        </div>
    )
}

export default GeneratorsGridSkeleton
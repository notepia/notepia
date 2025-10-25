import { ArrowLeft, Plus, Calendar } from "lucide-react"
import { useTwoColumn } from "@/components/twocolumn"
import TransitionWrapper from "@/components/transitionwrapper/TransitionWrapper"
import CalendarViewComponent from "./CalendarViewComponent"

interface CalendarViewContentProps {
    view: any
    viewObjects: any[]
    navigate: any
    currentWorkspaceId: string
    isCreating: boolean
    setIsCreating: (value: boolean) => void
    newObjectName: string
    setNewObjectName: (value: string) => void
    newObjectData: string
    setNewObjectData: (value: string) => void
    handleCreate: () => void
    createMutation: any
}

const CalendarViewContent = ({
    view,
    viewObjects,
    navigate,
    currentWorkspaceId,
    isCreating,
    setIsCreating,
    newObjectName,
    setNewObjectName,
    newObjectData,
    setNewObjectData,
    handleCreate,
    createMutation
}: CalendarViewContentProps) => {
    const { isSidebarCollapsed, toggleSidebar } = useTwoColumn()

    return (
        <TransitionWrapper className="px-4 w-full">
            <div className="py-4">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(`/workspaces/${currentWorkspaceId}/views`)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-2">
                            <Calendar size={24} />
                            <span className="text-2xl font-semibold">{view.name}</span>
                            <span className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 capitalize">
                                Calendar
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                            title={isSidebarCollapsed ? "Show Sidebar" : "Hide Sidebar"}
                        >
                            <Calendar size={18} />
                        </button>
                        <button
                            onClick={() => setIsCreating(!isCreating)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            <Plus size={18} />
                            New Slot
                        </button>
                    </div>
                </div>

                {isCreating && (
                    <div className="mb-6 p-6 border dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-900">
                        <h3 className="text-lg font-semibold mb-4">Create New Calendar Slot</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Slot Name</label>
                                <input
                                    type="text"
                                    value={newObjectName}
                                    onChange={(e) => setNewObjectName(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border dark:border-neutral-600 bg-white dark:bg-neutral-800"
                                    placeholder="Enter slot name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Date</label>
                                <input
                                    type="date"
                                    value={newObjectData}
                                    onChange={(e) => setNewObjectData(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border dark:border-neutral-600 bg-white dark:bg-neutral-800"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCreate}
                                    disabled={createMutation.isPending || !newObjectName.trim()}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                                >
                                    {createMutation.isPending ? 'Creating...' : 'Create'}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsCreating(false)
                                        setNewObjectName("")
                                        setNewObjectData("")
                                    }}
                                    className="px-4 py-2 border dark:border-neutral-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <CalendarViewComponent viewObjects={viewObjects} />
            </div>
        </TransitionWrapper>
    )
}

export default CalendarViewContent
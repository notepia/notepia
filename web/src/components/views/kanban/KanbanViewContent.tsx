import { Settings, Plus } from "lucide-react"
import { useState } from "react"
import KanbanViewComponent from "./KanbanViewComponent"
import CreateViewObjectModal from "../CreateViewObjectModal"
import KanbanViewSettingsModal from "./KanbanViewSettingsModal"
import ViewHeader from "../common/ViewHeader"

interface KanbanViewContentProps {
    view: any
    viewObjects: any[]
    navigate: any
    currentWorkspaceId: string
    isCreating: boolean
    setIsCreating: (value: boolean) => void
    handleCloseModal: () => void
    newObjectName: string
    setNewObjectName: (value: string) => void
    newObjectData: string
    setNewObjectData: (value: string) => void
    handleCreate: () => void
    createMutation: any
    focusedObjectId?: string
}

const KanbanViewContent = ({
    view,
    viewObjects,
    navigate,
    currentWorkspaceId,
    isCreating,
    setIsCreating,
    handleCloseModal,
    newObjectName,
    setNewObjectName,
    newObjectData,
    setNewObjectData,
    handleCreate,
    createMutation,
    focusedObjectId
}: KanbanViewContentProps) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

    return (
        <div className="flex flex-col h-screen">
            <ViewHeader
                viewName={view.name}
                onBack={() => navigate(`/workspaces/${currentWorkspaceId}/views`)}
                rightActions={
                    <>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            <Plus size={18} />
                            <span className="hidden sm:inline">New Column</span>
                        </button>
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                            title="Settings"
                        >
                            <Settings size={18} />
                        </button>
                    </>
                }
            />

            <CreateViewObjectModal
                open={isCreating}
                onOpenChange={(open) => {
                    if (!open) handleCloseModal()
                    else setIsCreating(true)
                }}
                viewType="kanban"
                name={newObjectName}
                setName={setNewObjectName}
                data={newObjectData}
                setData={setNewObjectData}
                onSubmit={handleCreate}
                isSubmitting={createMutation.isPending}
            />

            <KanbanViewSettingsModal
                open={isSettingsOpen}
                onOpenChange={setIsSettingsOpen}
                view={view}
                workspaceId={currentWorkspaceId}
            />

            <div className="flex-1 overflow-hidden">
                <KanbanViewComponent
                    key={focusedObjectId || 'default'}
                    viewObjects={viewObjects}
                    focusedObjectId={focusedObjectId}
                    workspaceId={currentWorkspaceId}
                    viewId={view.id}
                />
            </div>
        </div>
    )
}

export default KanbanViewContent

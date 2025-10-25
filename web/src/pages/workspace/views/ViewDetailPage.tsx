import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { Trash2, Calendar, MapPin, ChevronRight } from "lucide-react"
import useCurrentWorkspaceId from "@/hooks/use-currentworkspace-id"
import { getView, getViewObjects, createViewObject, deleteViewObject } from "@/api/view"
import { useToastStore } from "@/stores/toast"
import { TwoColumn, TwoColumnMain, TwoColumnSidebar, useTwoColumn } from "@/components/twocolumn"
import { ViewObject, ViewObjectType } from "@/types/view"
import CalendarViewContent from "@/components/views/calendar/CalendarViewContent"
import MapViewContent from "@/components/views/map/MapViewContent"

const ViewDetailPage = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { viewId } = useParams<{ viewId: string }>()
    const currentWorkspaceId = useCurrentWorkspaceId()
    const { addToast } = useToastStore()
    const [isCreating, setIsCreating] = useState(false)
    const [newObjectName, setNewObjectName] = useState("")
    const [newObjectData, setNewObjectData] = useState("")

    const { data: view, isLoading: isViewLoading } = useQuery({
        queryKey: ['view', currentWorkspaceId, viewId],
        queryFn: () => getView(currentWorkspaceId, viewId!),
        enabled: !!currentWorkspaceId && !!viewId,
    })

    const { data: viewObjects, refetch: refetchViewObjects } = useQuery({
        queryKey: ['view-objects', currentWorkspaceId, viewId],
        queryFn: () => getViewObjects(currentWorkspaceId, viewId!),
        enabled: !!currentWorkspaceId && !!viewId,
    })

    // Determine the object type based on view type
    const getObjectType = (): ViewObjectType => {
        if (view?.type === 'calendar') return 'calendar_slot'
        if (view?.type === 'map') return 'map_marker'
        return 'calendar_slot' // default
    }

    const createMutation = useMutation({
        mutationFn: (data: { name: string; data: string }) =>
            createViewObject(currentWorkspaceId, viewId!, {
                name: data.name,
                type: getObjectType(),
                data: data.data
            }),
        onSuccess: () => {
            addToast({ title: t('views.objectCreatedSuccess'), type: 'success' })
            refetchViewObjects()
            setIsCreating(false)
            setNewObjectName("")
            setNewObjectData("")
        },
        onError: () => {
            addToast({ title: t('views.objectCreatedError'), type: 'error' })
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (objectId: string) => deleteViewObject(currentWorkspaceId, viewId!, objectId),
        onSuccess: () => {
            addToast({ title: t('views.objectDeletedSuccess'), type: 'success' })
            refetchViewObjects()
        },
        onError: () => {
            addToast({ title: t('views.objectDeletedError'), type: 'error' })
        }
    })

    const handleCreate = () => {
        if (newObjectName.trim()) {
            createMutation.mutate({ name: newObjectName.trim(), data: newObjectData })
        }
    }

    const handleDelete = (objectId: string) => {
        if (window.confirm(t('views.deleteObjectConfirm'))) {
            deleteMutation.mutate(objectId)
        }
    }

    if (isViewLoading) {
        return <div className="flex justify-center items-center h-screen">{t('common.loading')}</div>
    }

    if (!view) {
        return <div className="flex justify-center items-center h-screen">{t('views.viewNotFound')}</div>
    }

    return (
        <TwoColumn>
            <TwoColumnMain className="bg-white dark:bg-neutral-800">
                <ViewContent
                    view={view}
                    viewObjects={viewObjects}
                    navigate={navigate}
                    currentWorkspaceId={currentWorkspaceId}
                    isCreating={isCreating}
                    setIsCreating={setIsCreating}
                    newObjectName={newObjectName}
                    setNewObjectName={setNewObjectName}
                    newObjectData={newObjectData}
                    setNewObjectData={setNewObjectData}
                    handleCreate={handleCreate}
                    createMutation={createMutation}
                />
            </TwoColumnMain>

            <TwoColumnSidebar className="bg-white">
                <ViewObjectsSidebar
                    view={view}
                    viewObjects={viewObjects}
                    handleDelete={handleDelete}
                    deleteMutation={deleteMutation}
                />
            </TwoColumnSidebar>
        </TwoColumn>
    )
}

// Sidebar component - displays view objects list
const ViewObjectsSidebar = ({ view, viewObjects, handleDelete, deleteMutation }: any) => {
    const { t } = useTranslation()
    const { toggleSidebar } = useTwoColumn()

    const getIcon = () => {
        if (view.type === 'calendar') return <Calendar size={18} />
        if (view.type === 'map') return <MapPin size={18} />
        return <Calendar size={18} />
    }

    const getTitle = () => {
        if (view.type === 'calendar') return t('views.calendarSlots')
        if (view.type === 'map') return t('views.mapMarkers')
        return 'Objects'
    }

    const getEmptyMessage = () => {
        if (view.type === 'calendar') return t('views.noSlots')
        if (view.type === 'map') return t('views.noMarkers')
        return 'No objects yet'
    }

    const getEmptyHint = () => {
        if (view.type === 'calendar') return t('views.createSlot')
        if (view.type === 'map') return t('views.createMarker')
        return 'Create your first one to get started'
    }

    return (
        <div className="max-w-sm">
            <div className="sticky top-0 bg-gray-50 dark:bg-neutral-900 border-b dark:border-neutral-700 px-4 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                    {getIcon()}
                    <div className="text-lg font-semibold">{getTitle()}</div>
                </div>
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg"
                    title={t('views.hideSidebar')}
                >
                    <ChevronRight size={18} />
                </button>
            </div>

            <div className="p-4 space-y-4">
                {viewObjects && viewObjects.length > 0 ? (
                    viewObjects.map((obj: ViewObject) => (
                        <div
                            key={obj.id}
                            className="bg-white dark:bg-neutral-800 rounded-lg border dark:border-neutral-700 p-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold mb-2">{obj.name}</h3>
                                    {obj.data && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                            {obj.data}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-2">
                                        {t('views.createdBy')}: {obj.created_by}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDelete(obj.id)}
                                    disabled={deleteMutation.isPending}
                                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 rounded-lg disabled:opacity-50"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        {getIcon()}
                        <p className="text-sm mt-4">{getEmptyMessage()}</p>
                        <p className="text-xs mt-2">{getEmptyHint()}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

// Main content component - renders different views based on type
const ViewContent = (props: any) => {
    if (props.view.type === 'calendar') {
        return <CalendarViewContent {...props} />
    }
    if (props.view.type === 'map') {
        return <MapViewContent {...props} />
    }
    return null
}

export default ViewDetailPage
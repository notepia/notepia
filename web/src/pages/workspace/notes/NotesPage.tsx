import { Edit, Search, X } from "lucide-react"
import { useTranslation } from "react-i18next"
import SidebarButton from "@/components/sidebar/SidebarButton"
import { getNotes, NoteData, createNote } from "@/api/note"
import useCurrentWorkspaceId from "@/hooks/use-currentworkspace-id"
import { Outlet, useNavigate } from "react-router-dom"
import { useInfiniteQuery, useMutation } from "@tanstack/react-query"
import { useRef, useCallback, useState, useEffect } from "react"
import { Tooltip } from "radix-ui"
import NoteMasonry from "@/components/notecard/NoteMasonry"
import NoteMasonrySkeleton from "@/components/notecard/NoteMasonrySkeleton"
import { toast } from "@/stores/toast"
import OneColumn from "@/components/onecolumn/OneColumn"
import NoteListSkeleton from "@/components/notecard/NoteListSkeleton"
import NoteList from "@/components/notecard/NoteList"

const PAGE_SIZE = 20;

const NotesPage = () => {
    const [query, setQuery] = useState("")
    const [debouncedQuery, setDebouncedQuery] = useState(query);
    const currentWorkspaceId = useCurrentWorkspaceId();
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const { t } = useTranslation()
    const observerRef = useRef<IntersectionObserver | null>(null);
    const navigate = useNavigate();

    const createNoteMutation = useMutation({
        mutationFn: (data: NoteData) => createNote(currentWorkspaceId, data),
        onSuccess: (data) => {
            navigate(`./${data.id}?mode=edit`)
        },
        onError: (error) => {
            toast.error(t("messages.createNoteFailed"))
            console.error("Failed to create note:", error)
        }
    })

    const handleCreateNote = () => {
        const emptyContent = JSON.stringify({
            type: "doc",
            content: [{
                type: "paragraph",
                content: [{ type: "text", text: "" }]
            }]
        })
        createNoteMutation.mutate({
            content: emptyContent,
            visibility: "private"
        })
    }

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [query]);

    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch
    } = useInfiniteQuery({
        queryKey: ['notes', currentWorkspaceId],
        queryFn: ({ pageParam = 1 }: { pageParam?: unknown }) =>
            getNotes(currentWorkspaceId, Number(pageParam), PAGE_SIZE, debouncedQuery),
        enabled: !!currentWorkspaceId,
        getNextPageParam: (lastPage, allPages) => {
            if (!lastPage || lastPage.length < PAGE_SIZE) return undefined;
            return allPages.length + 1;
        },
        refetchOnWindowFocus: false,
        staleTime: 0,
        initialPageParam: 1
    })

    useEffect(() => {
        refetch();
    }, [debouncedQuery, refetch]);

    const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }
        if (node && hasNextPage && !isLoading) {
            observerRef.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    fetchNextPage();
                }
            }, { root: null });
            observerRef.current.observe(node);
        }
    }, [hasNextPage, isLoading, fetchNextPage]);

    const notes = data?.pages.flat() || [];

    return <>
        <div className="flex h-screen">
            <div className="w-full xl:w-[360px] h-full overflow-auto shrink-0 bg-neutral-200 shadow-inner">
                <div className="px-4 pt-4 flex gap-2">
                    <SidebarButton />
                    <div className="flex gap-2 items-center max-w-[calc(100vw-165px)] overflow-x-auto whitespace-nowrap sm:text-xl font-semibold hide-scrollbar">
                        {t("menu.notes")}
                    </div>
                </div>
                {isLoading ? (
                    <NoteListSkeleton />
                ) : (
                    <NoteList notes={notes} maxNodes={3} getLinkTo={(note) => `${note.id}`} />
                )}
            </div>
            <div className="xl:flex-1">
                <Outlet />
            </div>
        </div>
    </>
}

export default NotesPage
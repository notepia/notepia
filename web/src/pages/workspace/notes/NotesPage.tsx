import { Edit, Search, X } from "lucide-react"
import { useTranslation } from "react-i18next"
import SidebarButton from "@/components/sidebar/SidebarButton"
import { getNotes, NoteData, createNote } from "@/api/note"
import useCurrentWorkspaceId from "@/hooks/use-currentworkspace-id"
import { Outlet, useNavigate } from "react-router-dom"
import { useInfiniteQuery, useMutation } from "@tanstack/react-query"
import { useRef, useCallback, useState, useEffect } from "react"
import { Tooltip } from "radix-ui"
import { toast } from "@/stores/toast"
import NoteListSkeleton from "@/components/notecard/NoteListSkeleton"
import NoteList from "@/components/notecard/NoteList"


const NotesPage = () => {
    const PAGE_SIZE = 10;
    const [query, setQuery] = useState("")
    const [debouncedQuery, setDebouncedQuery] = useState(query);
    const currentWorkspaceId = useCurrentWorkspaceId();
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const { t } = useTranslation()
    const observerRef = useRef<IntersectionObserver | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
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
    } = useInfiniteQuery({
        queryKey: ['notes', currentWorkspaceId, debouncedQuery],
        queryFn: async ({ pageParam = 1 }: { pageParam?: unknown }) => {
            const result = await getNotes(currentWorkspaceId, Number(pageParam), PAGE_SIZE, debouncedQuery)
            return result
        },
        enabled: !!currentWorkspaceId,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length === PAGE_SIZE) {
                const nextPage = allPages.length + 1;
                return nextPage;
            }

            return undefined;
        },
        refetchOnWindowFocus: false,
        staleTime: 0,
        initialPageParam: 1
    })

    const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }
        if (node && hasNextPage && !isFetchingNextPage && scrollContainerRef.current) {
            observerRef.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    fetchNextPage();
                }
            }, {
                root: scrollContainerRef.current,
                rootMargin: '50px',
                threshold: 0.1
            });
            observerRef.current.observe(node);
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const notes = data?.pages.flat() || [];

    return <>
        <div className="flex h-screen">
            <div ref={scrollContainerRef} className="w-full xl:w-[360px] h-full overflow-auto shrink-0 bg-neutral-200 dark:bg-neutral-950 shadow-inner">
                <div>{
                    isSearchVisible ? < div className="px-4 pt-4">
                        <div className="w-full flex items-center gap-2 py-2 px-3 rounded-xl shadow-inner border dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-100">
                            <Search size={16} className="text-gray-400" />
                            <input type="text" value={query} onChange={e => setQuery(e.target.value)} className=" bg-transparent flex-1" placeholder={t("placeholder.search")} />
                            <button title="toggle isSearchVisible" onClick={() => setIsSearchVisible(false)}>
                                <X size={16} className="text-gray-400" />
                            </button>
                        </div>
                    </div> : <div className="pt-2 px-4 flex gap-2 items-center justify-between">
                        <div className="flex gap-4">
                            <SidebarButton />
                            <div className="flex gap-2 items-center max-w-[calc(100vw-165px)] overflow-x-auto whitespace-nowrap sm:text-xl font-semibold hide-scrollbar">
                                {t("menu.notes")}
                            </div>
                        </div>
                        <div className="flex">
                            {
                                !isSearchVisible && <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                        <button aria-label="toggle the filter" className="p-3" onClick={() => setIsSearchVisible(!isSearchVisible)}>
                                            <Search size={20} />
                                        </button>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                        <Tooltip.Content
                                            className="select-none rounded-lg bg-gray-900 text-white dark:bg-gray-100 dark:text-black px-2 py-1 text-sm"
                                            side="bottom"
                                        >
                                            <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-100" />
                                            {t("actions.filter")}
                                        </Tooltip.Content>
                                    </Tooltip.Portal>
                                </Tooltip.Root>
                            }
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <button onClick={handleCreateNote} aria-label="edit" disabled={createNoteMutation.isPending} className="p-3">
                                        <Edit size={20} />
                                    </button>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content
                                        className="select-none rounded-lg bg-gray-900 text-white dark:bg-gray-100 dark:text-black px-2 py-1 text-sm"
                                        side="bottom"
                                    >
                                        <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-100" />
                                        {t("actions.newNote")}
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        </div>
                    </div>
                }
                </div>
                {isLoading ? (
                    <NoteListSkeleton />
                ) : (
                    <>
                        <NoteList notes={notes} maxNodes={3} getLinkTo={(note) => `${note.id}`} />

                        <div ref={loadMoreRef} className="h-4" ></div>
                        {isFetchingNextPage && <NoteListSkeleton count={3} />}
                        {!isLoading && !hasNextPage && (
                            <div className="text-center py-4 text-gray-400">{t("messages.noMoreNotes")}</div>
                        )}
                    </>
                )}
            </div>
            <div className="xl:flex-1">
                <Outlet />
            </div>
        </div>
    </>
}

export default NotesPage
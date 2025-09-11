import { useMutation } from "@tanstack/react-query"
import { CircleUserRound, LogOut } from "lucide-react"
import { DropdownMenu } from "radix-ui"
import { useNavigate } from "react-router-dom"
import { signOut } from "../../api/auth"
import { useSidebar } from "../sidebar/SidebarProvider"
import { useTranslation } from "react-i18next"
import { useCurrentUserStore } from "../../stores/current-user"

const UserMenu = () => {
    const { t } = useTranslation()
    const { isOver1280, isCollapse } = useSidebar()
    const navigate = useNavigate()
    const { user } = useCurrentUserStore()
    const signoutMutation = useMutation({
        mutationFn: () => signOut(),
        onSuccess: async () => {
            try {
                navigate(`/`)
            } catch (error) {
                console.error('Error invalidating queries:', error)

            }
        },
    })

    const handleLogout = () => {
        signoutMutation.mutate()
    }

    return <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
            <button className="p-2" aria-label="user menu">
                <CircleUserRound size={20} />
            </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
            <DropdownMenu.Content
                className={"w-[260px] z-50 rounded-md  bg-white text-gray-900 dark:bg-neutral-900 dark:text-gray-100 dark:border dark:border-gray-100 p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade"}
                side={!isOver1280 || !isCollapse ? "top" : "right"}
                sideOffset={5}
                align={"end"}
                alignOffset={5}
            >
                <DropdownMenu.Item className="  select-none rounded-lg leading-none outline-none data-[disabled]:pointer-events-none ">
                    <div  className="p-3 w-full" >
                        <div className="flex justify-between gap-3 items-center">
                            <div className="flex-1 flex flex-col items-start gap-1 truncate">
                                <div>
                                    {user?.name}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                    {user?.email}
                                </div>
                            </div>
                            <button onClick={handleLogout} className=" shrink flex flex-col gap-2 items-center">
                                <LogOut size={20} />
                                {t("actions.signout")}
                            </button>
                        </div>
                    </div>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="  select-none rounded-lg leading-none outline-none  ">

                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Portal>
    </DropdownMenu.Root>
}

export default UserMenu
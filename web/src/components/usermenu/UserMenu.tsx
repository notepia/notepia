import { useMutation } from "@tanstack/react-query"
import { CircleUserRound, LogOut } from "lucide-react"
import { DropdownMenu } from "radix-ui"
import { useNavigate } from "react-router-dom"
import { signOut } from "../../api/auth"
import { useSidebar } from "../sidebar/SidebarProvider"
import { useTranslation } from "react-i18next"

const UserMenu= () => {
    const {t} =useTranslation()
    const {isOver1280,isCollapse} = useSidebar()
    const navigate = useNavigate()
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

    const handleLogout = ()=>{
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
                className="z-50 rounded-md  bg-white text-gray-900 dark:bg-neutral-900 dark:text-gray-100 dark:border dark:border-gray-100 p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade"
                side={!isOver1280 || !isCollapse ? "top" : "right"} 
                sideOffset={5} 
                align={!isOver1280 || !isCollapse ? "start" : "end"}
                alignOffset={0}  
            >
                <DropdownMenu.Item className="  select-none rounded-lg leading-none outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-gray-100 dark:data-[highlighted]:text-gray-900 ">
                    <button onClick={handleLogout} className="flex gap-3 p-3 items-center w-full" >
                        <LogOut size={20} />
                        {t("actions.signout")}
                    </button>
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Portal>
    </DropdownMenu.Root>
}

export default UserMenu
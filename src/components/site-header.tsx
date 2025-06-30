import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface SiteHeaderProps {
  userEmail?: string
  onLogout?: () => void
  title?: string
}

export function SiteHeader({ userEmail, onLogout, title = "Documents" }: SiteHeaderProps) {
  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium flex-1">{title}</h1>
        {userEmail && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground">{userEmail}</span>
            {onLogout && (
              <button
                className="text-xs underline underline-offset-2 text-red-600 hover:text-red-800"
                onClick={onLogout}
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

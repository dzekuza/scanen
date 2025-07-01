"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useDashboardTitle } from "./dashboard-title-context"
import { BusinessDetailsModal } from "@/components/ui/dialog-box"

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const { title } = useDashboardTitle()
  const [businessModalOpen, setBusinessModalOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }
  if (!user) return null

  return (
    <>
      <BusinessDetailsModal open={businessModalOpen} onOpenChange={setBusinessModalOpen} />
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader userEmail={user.email} onLogout={logout} title={title} />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {children}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
} 
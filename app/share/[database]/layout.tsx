"use client"

import { useEffect } from "react"
import { Outlet, useSearchParams } from "react-router-dom"

import { getSqliteProxy } from "@/lib/sqlite/proxy"
import { useAppRuntimeStore } from "@/lib/store/runtime-store"
import { cn } from "@/lib/utils"
import { useCurrentPathInfo } from "@/hooks/use-current-pathinfo"
import { usePeerConnect } from "@/hooks/use-peer"
import { useSqliteStore } from "@/hooks/use-sqlite"
import { DatabaseLayoutBase } from "@/app/[database]/base-layout"
import { useConfigStore } from "@/app/settings/store"

const SwitchProxyWrapper = ({ children, conn }: any) => {
  const { setSqliteProxy } = useSqliteStore()
  const { space } = useCurrentPathInfo()
  useEffect(() => {
    // TODO: handle connection
    if (conn) {
      const sqliteProxy = getSqliteProxy(space, {
        isShareMode: true,
        connection: conn,
      })
      console.log(`share mode setSqlWorker`)
      setSqliteProxy(sqliteProxy)
    }
  }, [conn, space, setSqliteProxy])
  return <>{children}</>
}

export default function ShareDatabaseLayout() {
  const [searchParams] = useSearchParams()
  const sharePeerId = searchParams.get("peerId")
  const { profile } = useConfigStore()
  const { isConnected, conn } = usePeerConnect(sharePeerId, profile.username)
  const { setShareMode } = useAppRuntimeStore()
  useEffect(() => {
    setShareMode(true)
    return () => {
      setShareMode(false)
    }
  }, [setShareMode])

  // border to show difference between share and app
  // first we need init peer client at DatabaseLayoutBase, then we can use connect to share peer
  return (
    <DatabaseLayoutBase
      className={cn(
        "border-box border-2",
        isConnected ? "border-green-400" : "border-red-400"
      )}
    >
      <SwitchProxyWrapper conn={conn}>
        <Outlet />
      </SwitchProxyWrapper>
    </DatabaseLayoutBase>
  )
}

import type { LucideIcon } from "lucide-react"

export type Navigation = {
  name: string
  to: string
  icon: LucideIcon | (() => null)
  end?: boolean
}

export type NavigationGroup = {
  name: string
  items: Navigation[]
}

import { Link } from "react-router-dom"
import { paths } from "@/config/paths"

export const Logo = () => {
  return (
    <Link to={paths.app.dashboard.getHref()} className="flex items-center gap-2">
      <img
        src="https://ducthanhco.vn/wp-content/uploads/2021/10/logo-tab.png"
        alt="Logo"
        className="h-8 w-auto"
      />
      <span className="font-semibold text-lg text-sidebar-foreground">Dashboard</span>
    </Link>
  )
}




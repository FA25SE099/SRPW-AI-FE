
import { Loader2, MapPin, Phone, Mail, Users, Grid, Sprout } from "lucide-react"
import { useFarmerDetail } from "../api/get-farmer-detail"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"

type FarmerDetailDialogProps = {
  farmerId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const FarmerDetailDialog = ({ farmerId, open, onOpenChange }: FarmerDetailDialogProps) => {
  const [activeTab, setActiveTab] = useState<"groups" | "plots">("groups")

  const {
    data: farmer,
    isLoading,
    isError,
  } = useFarmerDetail({
    farmerId: farmerId || "",
    queryConfig: {
      enabled: !!farmerId && open,
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Farmer Details</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="text-center py-12">
            <p className="text-red-500">Failed to load farmer details</p>
          </div>
        )}

        {farmer && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="border rounded-lg p-6 bg-card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{farmer.fullName}</h3>
                    <p className="text-muted-foreground">{farmer.farmCode}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {farmer.isActive && (
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">Active</span>
                  )}
                  {farmer.isVerified && (
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">Verified</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone Number</p>
                    <p className="font-medium">{farmer.phoneNumber}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{farmer.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Activity</p>
                    <p className="font-medium">
                      {new Date(farmer.lastActivityAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Grid className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Plots</p>
                    <p className="font-medium">{farmer.plotCount}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Tabs Implementation */}
            <div className="w-full">
              {/* Tab List */}
              <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full">
                <button
                  onClick={() => setActiveTab("groups")}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 ${activeTab === "groups" ? "bg-background text-foreground shadow-sm" : "hover:bg-background/50"
                    }`}
                >
                  Groups ({farmer.groups?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab("plots")}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 ${activeTab === "plots" ? "bg-background text-foreground shadow-sm" : "hover:bg-background/50"
                    }`}
                >
                  Plots ({farmer.plots?.length || 0})
                </button>
              </div>

              {/* Groups Tab Content */}
              {activeTab === "groups" && (
                <div className="space-y-4 mt-4">
                  {!farmer.groups || farmer.groups.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No groups found</p>
                    </div>
                  ) : (
                    farmer.groups.map((group) => (
                      <div key={group.groupId} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground mt-1">Group ID: {group.groupId}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs ${group.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                              }`}
                          >
                            {group.status}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm pt-3 border-t">
                          <span className="text-muted-foreground">Total Area</span>
                          <span className="font-medium">{group.totalArea} ha</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Plots Tab Content */}
              {activeTab === "plots" && (
                <div className="space-y-4 mt-4">
                  {!farmer.plots || farmer.plots.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg">
                      <Grid className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No plots found</p>
                    </div>
                  ) : (
                    farmer.plots.map((plot) => (
                      <div key={plot.plotId} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Sprout className="h-5 w-5 text-green-600" />
                            <div>
                              <h4 className="font-semibold">
                                Thửa {plot.soThua} - Tờ {plot.soTo}
                              </h4>
                              <p className="text-sm text-muted-foreground">{plot.varietyName}</p>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs ${plot.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                              }`}
                          >
                            {plot.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Area</p>
                            <p className="font-medium">{plot.area} ha</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Soil Type</p>
                            <p className="font-medium">{plot.soilType}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Plot ID</p>
                            <p className="font-mono text-xs">{plot.plotId}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}


            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
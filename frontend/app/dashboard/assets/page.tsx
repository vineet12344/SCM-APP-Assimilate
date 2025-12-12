"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { PageHeader, StatsGrid, StatCard, Table } from "@/components/dashboard-components"
import { Server, AlertTriangle, CheckCircle2, Clock, X } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Eye } from "lucide-react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function AssetsPage() {
  const assetStats = [
    { label: "Total Assets", value: "2,847", icon: <Server className="w-5 h-5" />, change: 12, trend: "up" },
    { label: "Healthy", value: "2,681", icon: <CheckCircle2 className="w-5 h-5" />, change: 8, trend: "up" },
    { label: "At Risk", value: "156", icon: <AlertTriangle className="w-5 h-5" />, change: 3, trend: "down" },
    { label: "Pending Review", value: "10", icon: <Clock className="w-5 h-5" />, change: 1, trend: "up" },
  ]

  // generate 100 sample assets so there are 10 pages of 10 items each
  const assets = useMemo(() => {
    const list: any[] = []
    const types = ["Database", "Web Server", "API Server", "Application"]
    const statuses = ["Healthy", "At Risk", "Pending"]
    const locations = ["US-East-1", "US-West-2", "EU-Central-1", "AP-South-1"]
    const owners = ["Alice", "Bob", "Carol", "Dave"]
    for (let i = 1; i <= 100; i++) {
      const id = `asset-${String(i).padStart(3, "0")}`
      list.push({
        asset: id,
        type: types[i % types.length],
        status: statuses[i % statuses.length],
        location: locations[i % locations.length],
        lastScanned: `${i % 24} hours ago`,
        owner: owners[i % owners.length],
        tags: `tag${i % 5},tag${(i + 1) % 5}`,
        connector: i % 2 === 0 ? "SSH" : "HTTPS",
        discoverySource: i % 3 === 0 ? "CMDB" : i % 3 === 1 ? "AWS" : "Manual",
        externalRef: `ref-${i}`,
        actions: (
          <Button asChild variant="ghost" size="sm">
            <Link href={`/dashboard/assets/${id}`}>
              <Eye className="w-4 h-4" />
            </Link>
          </Button>
        ),
      })
    }
    return list
  }, [])

  const [page, setPage] = useState(1)
  const perPage = 10
  // Filter/search state
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [ownerFilter, setOwnerFilter] = useState("all")

  // Unique values for filters
  const typeOptions = useMemo(() => Array.from(new Set(assets.map(a => a.type))), [assets])
  const statusOptions = useMemo(() => Array.from(new Set(assets.map(a => a.status))), [assets])
  const locationOptions = useMemo(() => Array.from(new Set(assets.map(a => a.location))), [assets])
  const ownerOptions = useMemo(() => Array.from(new Set(assets.map(a => a.owner))), [assets])

  // Filtered assets
  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      if (search && !(
        a.asset.toLowerCase().includes(search.toLowerCase()) ||
        a.type.toLowerCase().includes(search.toLowerCase()) ||
        a.status.toLowerCase().includes(search.toLowerCase()) ||
        a.location.toLowerCase().includes(search.toLowerCase()) ||
        a.owner.toLowerCase().includes(search.toLowerCase())
      )) return false
      if (typeFilter !== "all" && a.type !== typeFilter) return false
      if (statusFilter !== "all" && a.status !== statusFilter) return false
      if (locationFilter !== "all" && a.location !== locationFilter) return false
      if (ownerFilter !== "all" && a.owner !== ownerFilter) return false
      return true
    })
  }, [assets, search, typeFilter, statusFilter, locationFilter, ownerFilter])

  const totalPages = Math.ceil(filteredAssets.length / perPage)
  const pagedData = useMemo(() => {
    const start = (page - 1) * perPage
    return filteredAssets.slice(start, start + perPage)
  }, [filteredAssets, page])

  return (
    <DashboardLayout title="Assets">
      <PageHeader title="Asset Management" description="Monitor and manage all your organizational assets" />

      <StatsGrid>
        {assetStats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </StatsGrid>

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row md:items-end gap-3 mb-6">
        <div className="flex gap-2 flex-1 flex-wrap">
          <Input
            placeholder="Search assets..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-48"
          />
          <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setPage(1) }}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {typeOptions.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1) }}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={locationFilter} onValueChange={v => { setLocationFilter(v); setPage(1) }}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Location" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locationOptions.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={ownerFilter} onValueChange={v => { setOwnerFilter(v); setPage(1) }}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Owner" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Owners</SelectItem>
              {ownerOptions.map(owner => <SelectItem key={owner} value={owner}>{owner}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>+ Add Asset</Button>
            </DialogTrigger>
            {/* ...existing code for DialogContent... */}
            <DialogContent className="max-w-lg w-full p-0 min-h-[520px] flex flex-col justify-between rounded-xl shadow-lg overflow-hidden">
              {/* ...existing code for DialogHeader, Tabs, etc... */}
              <DialogHeader className="flex flex-row items-center justify-between pt-4 pb-0 px-4 border-b sticky top-0 bg-background z-10">
                <DialogTitle className="text-lg font-semibold">Add Asset</DialogTitle>
                <DialogClose asChild>
                  <Button variant="ghost" size="sm" className="p-1">
                    <X className="w-4 h-4" />
                  </Button>
                </DialogClose>
              </DialogHeader>
              <div className="px-6 pb-4 flex-1 flex flex-col justify-start">
                {/* ...existing code for Tabs... */}
                <Tabs defaultValue="manual" className="w-full">
                  {/* ...existing code for TabsList, TabsContent... */}
                  <TabsList className="grid grid-cols-4 gap-2 mb-3">
                    <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
                    <TabsTrigger value="cmdb">CMDB Sync</TabsTrigger>
                    <TabsTrigger value="cloud">Cloud Sync</TabsTrigger>
                    <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                  </TabsList>
                  <div className="relative min-h-[220px]">
                    {/* ...existing code for TabsContent... */}
                    <TabsContent value="bulk" className="absolute inset-0">
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">Import assets from a CSV or JSON file.</p>
                        <Input type="file" accept=".csv,.json" className="w-full" />
                        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                          <DialogClose asChild>
                            <Button variant="outline" type="button">Cancel</Button>
                          </DialogClose>
                          <Button type="button">Import</Button>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="cmdb" className="absolute inset-0">
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">Sync assets from ServiceNow CMDB.</p>
                        <Button type="button" className="w-full sm:w-auto">Sync with ServiceNow</Button>
                        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                          <DialogClose asChild>
                            <Button variant="outline" type="button">Cancel</Button>
                          </DialogClose>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="cloud" className="absolute inset-0">
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">Sync assets from cloud providers (AWS/Azure).</p>
                        <div className="flex gap-2 flex-col sm:flex-row">
                          <Button type="button" className="w-full sm:w-auto">Sync from AWS</Button>
                          <Button type="button" className="w-full sm:w-auto">Sync from Azure</Button>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                          <DialogClose asChild>
                            <Button variant="outline" type="button">Cancel</Button>
                          </DialogClose>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="manual" className="absolute inset-0 pr-2">
                      <form className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Input name="hostname" placeholder="Hostname" required className="w-full" />
                        <Input name="ip_address" placeholder="IP Address" required className="w-full" />
                        <Select name="os_family" required>
                          <SelectTrigger className="w-full"><SelectValue placeholder="OS Family" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="linux">Linux</SelectItem>
                            <SelectItem value="windows">Windows</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input name="os_version" placeholder="OS Version" required className="w-full" />
                        <Input name="domain" placeholder="Domain (optional)" className="w-full" />
                        <Select name="environment" required>
                          <SelectTrigger className="w-full"><SelectValue placeholder="Environment" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="prod">Production</SelectItem>
                            <SelectItem value="qa">QA</SelectItem>
                            <SelectItem value="dev">Development</SelectItem>
                            <SelectItem value="dmz">DMZ</SelectItem>
                            <SelectItem value="cloud">Cloud</SelectItem>
                            <SelectItem value="staging">Staging</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input name="owner" placeholder="Owner (optional)" className="w-full" />
                        <Input name="tags" placeholder="Tags (comma separated)" className="w-full" />
                        <Select name="connector_type" required>
                          <SelectTrigger className="w-full"><SelectValue placeholder="Connector Type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ssh">SSH</SelectItem>
                            <SelectItem value="openssh">OpenSSH</SelectItem>
                            <SelectItem value="https">HTTPS</SelectItem>
                            <SelectItem value="micro-agent">Micro-Agent</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select name="discovery_source" required>
                          <SelectTrigger className="w-full"><SelectValue placeholder="Discovery Source" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manual">Manual</SelectItem>
                            <SelectItem value="bulk">Bulk</SelectItem>
                            <SelectItem value="aws">AWS</SelectItem>
                            <SelectItem value="azure">Azure</SelectItem>
                            <SelectItem value="cmdb">CMDB</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input name="external_ref_id" placeholder="External Ref ID (optional)" className="w-full" />
                        <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row justify-end gap-2 pt-4">
                          <DialogClose asChild>
                            <Button variant="outline" type="button">Cancel</Button>
                          </DialogClose>
                          <Button type="submit">Add Asset</Button>
                        </div>
                      </form>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline">Export</Button>
        </div>
      </div>

      <Table
        columns={[
          { label: "Asset", key: "asset" },
          { label: "Type", key: "type" },
          { label: "Status", key: "status" },
          { label: "Location", key: "location" },
          { label: "Last Scanned", key: "lastScanned" },
          { label: "Owner", key: "owner" },
          { label: "Tags", key: "tags" },
          { label: "Connector", key: "connector" },
          { label: "Discovery Source", key: "discoverySource" },
          { label: "External Ref", key: "externalRef" },
          { label: "Actions", key: "actions" },
        ]}
        data={pagedData}
      />

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Showing {(page - 1) * perPage + 1} - {Math.min(page * perPage, filteredAssets.length)} of {filteredAssets.length}</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Prev
          </Button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={i}
                variant={page === i + 1 ? undefined : "ghost"}
                size="sm"
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}

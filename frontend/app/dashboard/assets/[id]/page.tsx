"use client"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/cards/status-badge"
import { KPICard } from "@/components/cards/kpi-card"
import { CheckCircle2, AlertCircle, DownloadCloud } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

const assetDetails = {
  id: "prod-web-01",
  name: "Production Web Server",
  type: "Web Server",
  environment: "Production",
  ipAddress: "10.0.1.45",
  hostname: "prod-web-01.company.com",
  os: "Ubuntu 22.04 LTS",
  connector: "SSH",
  owner: "Platform Team",
  domain: "company.com",
  tags: ["web-server", "nginx"],
  lastScan: "2h ago",
  complianceScore: 92,
  complianceScoreText: "Above average",
  controls: { passing: 89, total: 97 },
  assignedPolicies: [
    {
      name: "CIS Ubuntu Linux 22.04 LTS Benchmark v1.0.0",
      controls: 97,
      link: "#",
    },
    {
      name: "Custom Security Baseline v2.1",
      controls: 45,
      link: "#",
    },
  ],
}

const complianceResults = [
  { controlId: "DB-001", name: "Database encryption enabled", status: "completed", severity: "high" },
  { controlId: "DB-002", name: "Backup strategy configured", status: "completed", severity: "medium" },
  { controlId: "DB-003", name: "Access controls enforced", status: "failed", severity: "high" },
  { controlId: "DB-004", name: "Audit logging enabled", status: "completed", severity: "medium" },
]

const scanHistory = [
  {
    date: "2 hours ago",
    policy: "CIS Benchmark",
    score: 92,
    pass: 89,
    fail: 8,
    status: "Completed",
  },
  {
    date: "1 day ago",
    policy: "CIS Benchmark",
    score: 91,
    pass: 88,
    fail: 9,
    status: "Completed",
  },
  {
    date: "3 days ago",
    policy: "CIS Benchmark",
    score: 89,
    pass: 86,
    fail: 11,
    status: "Completed",
  },
]

const evidenceFiles = [
  {
    controlId: "CIS-5.2.10",
    description: "SSH Root Login Configuration",
    timestamp: "2 hours ago",
    severity: "High",
  },
  {
    controlId: "CIS-3.5.1.1",
    description: "Firewall Status Check",
    timestamp: "2 hours ago",
    severity: "High",
  },
  {
    controlId: "CIS-5.3.1",
    description: "Password Requirements",
    timestamp: "2 hours ago",
    severity: "Medium",
  },
]

const exceptions = [
  {
    control: "CIS-1.1.1",
    justification: "Legacy application requirement",
    approver: "John Doe",
    expires: "30 days",
    status: "Approved",
  },
  {
    control: "CIS-2.3.4",
    justification: "Business exception for Q4",
    approver: "Jane Smith",
    expires: "60 days",
    status: "Approved",
  },
]

const metadata = {
  system: {
    kernel: "5.15.0-91-generic",
    arch: "x86_64",
    cpu: 8,
    memory: "32 GB",
  },
  network: {
    mac: "00:0a:95:9d:68:16",
    subnet: "10.0.1.0/24",
    gateway: "10.0.1.1",
    dns: ["10.0.0.1", "10.0.0.2"],
  },
}

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "scan-history", label: "Scan History" },
  { value: "evidence", label: "Evidence" },
  { value: "exceptions", label: "Exceptions" },
  { value: "metadata", label: "Metadata" },
]

export default function AssetDetailPage({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout title="Assets">
      <div className="flex flex-col min-h-[calc(100vh-64px)] bg-background">
        {/* Top bar: Back + Export */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 pt-6 pb-2 gap-2">
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="rounded-lg font-medium border border-primary text-primary hover:bg-primary/10 transition"
          >
            <Link href="/dashboard/assets">
              <span className="mr-1">&larr;</span> Back to Assets
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="hidden sm:inline-flex items-center gap-2">
              <DownloadCloud className="w-4 h-4" /> Export
            </Button>
            <Button variant="outline" size="sm" className="inline-flex sm:hidden p-2">
              <DownloadCloud className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-1 flex flex-col w-full">
          <Tabs defaultValue="overview" className="flex-1 flex flex-col w-full">
            <div className="flex justify-center w-full bg-background">
              <TabsList
                className="
                  w-full max-w-6xl mx-auto flex flex-row flex-nowrap overflow-x-auto
                  bg-transparent border-none rounded-none px-0 py-0
                  gap-1 sm:gap-2 md:gap-4
                  scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent
                "
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {TABS.map(tab => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={`
                      px-3 sm:px-5 py-2 font-medium rounded-t-lg
                      transition-colors
                      data-[state=active]:bg-primary data-[state=active]:text-white
                      data-[state=active]:shadow
                      bg-muted/60 text-muted-foreground
                      hover:bg-primary/10
                      whitespace-nowrap
                    `}
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <div className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-4 py-6">
              <TabsContent value="overview">
                <div className="flex flex-col gap-8">
                  {/* Compliance Score & Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-start shadow">
                      <div className="text-xs text-muted-foreground uppercase mb-1">Compliance Score</div>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-primary">{assetDetails.complianceScore}%</span>
                        <Badge variant="outline" className="text-xs px-2 py-0.5">{assetDetails.complianceScoreText}</Badge>
                      </div>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-start shadow">
                      <div className="text-xs text-muted-foreground uppercase mb-1">Controls</div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-semibold">{assetDetails.controls.passing}</span>
                        <span className="text-muted-foreground text-lg">/</span>
                        <span className="text-lg">{assetDetails.controls.total}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Passing controls</div>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-start shadow">
                      <div className="text-xs text-muted-foreground uppercase mb-1">Last Scanned</div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-semibold">{assetDetails.lastScan.split(" ")[0]}</span>
                        <span className="text-muted-foreground">{assetDetails.lastScan.split(" ")[1]}</span>
                        <span className="text-xs text-muted-foreground">ago</span>
                      </div>
                    </div>
                  </div>

                  {/* Asset Information */}
                  <div>
                    <div className="text-lg font-semibold mb-2">Asset Information</div>
                    <div className="text-sm text-muted-foreground mb-4">Basic details and configuration</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-2">
                        <div className="text-xs text-muted-foreground uppercase">Hostname</div>
                        <div className="font-medium">{assetDetails.hostname}</div>
                      </div>
                      <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-2">
                        <div className="text-xs text-muted-foreground uppercase">IP Address</div>
                        <div className="font-medium">{assetDetails.ipAddress}</div>
                      </div>
                      <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-2">
                        <div className="text-xs text-muted-foreground uppercase">Operating System</div>
                        <div className="font-medium">{assetDetails.os}</div>
                      </div>
                      <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-2">
                        <div className="text-xs text-muted-foreground uppercase">Connector Type</div>
                        <div className="font-medium">{assetDetails.connector}</div>
                      </div>
                      <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-2">
                        <div className="text-xs text-muted-foreground uppercase">Environment</div>
                        <div className="font-medium">{assetDetails.environment}</div>
                      </div>
                      <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-2">
                        <div className="text-xs text-muted-foreground uppercase">Owner</div>
                        <div className="font-medium">{assetDetails.owner}</div>
                      </div>
                      <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-2">
                        <div className="text-xs text-muted-foreground uppercase">Domain</div>
                        <div className="font-medium">{assetDetails.domain}</div>
                      </div>
                      <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-2">
                        <div className="text-xs text-muted-foreground uppercase">Tags</div>
                        <div className="flex flex-wrap gap-1">
                          {assetDetails.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Policies */}
                  <div>
                    <div className="text-lg font-semibold mb-2">Assigned Policies</div>
                    <div className="text-sm text-muted-foreground mb-4">Compliance policies applied to this asset</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {assetDetails.assignedPolicies.map(policy => (
                        <div key={policy.name} className="bg-card border border-border rounded-lg p-4 flex flex-col gap-2">
                          <div className="font-medium">{policy.name}</div>
                          <div className="text-xs text-muted-foreground">{policy.controls} controls</div>
                          <Button asChild variant="outline" size="sm" className="w-fit mt-1">
                            <a href={policy.link}>View</a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="scan-history">
                <div className="flex flex-col gap-6">
                  <div>
                    <div className="text-lg font-semibold mb-2">Scan History</div>
                    <div className="text-sm text-muted-foreground mb-4">Historical compliance scans for this asset</div>
                    <div className="bg-card border border-border rounded-xl overflow-x-auto shadow">
                      <Table>
                        <TableHeader className="bg-secondary/40">
                          <TableRow>
                            <TableHead className="text-foreground font-semibold">Scan Date</TableHead>
                            <TableHead className="text-foreground font-semibold">Policy</TableHead>
                            <TableHead className="text-foreground font-semibold">Score</TableHead>
                            <TableHead className="text-foreground font-semibold">Pass</TableHead>
                            <TableHead className="text-foreground font-semibold">Fail</TableHead>
                            <TableHead className="text-foreground font-semibold">Status</TableHead>
                            <TableHead className="text-right text-foreground font-semibold">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {scanHistory.map((scan, i) => (
                            <TableRow key={i} className="border-border hover:bg-secondary/10 transition">
                              <TableCell>{scan.date}</TableCell>
                              <TableCell>{scan.policy}</TableCell>
                              <TableCell>
                                <span className="font-semibold text-primary">{scan.score}%</span>
                              </TableCell>
                              <TableCell>
                                <span className="text-green-600 font-semibold">{scan.pass}</span>
                              </TableCell>
                              <TableCell>
                                <span className="text-red-500 font-semibold">{scan.fail}</span>
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={scan.status.toLowerCase() as "completed" | "failed" | "running" | "pending" | "approved" | "expired"} />
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="rounded font-medium text-primary border border-primary hover:bg-primary/10"
                                >
                                  Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="evidence">
                <div className="flex flex-col gap-6">
                  <div>
                    <div className="text-lg font-semibold mb-2">Evidence Files</div>
                    <div className="text-sm text-muted-foreground mb-4">Audit evidence collected from this asset</div>
                    <div className="bg-card border border-border rounded-xl overflow-x-auto shadow">
                      <Table>
                        <TableHeader className="bg-secondary/40">
                          <TableRow>
                            <TableHead className="text-foreground font-semibold">Control ID</TableHead>
                            <TableHead className="text-foreground font-semibold">Description</TableHead>
                            <TableHead className="text-foreground font-semibold">Timestamp</TableHead>
                            <TableHead className="text-foreground font-semibold">Severity</TableHead>
                            <TableHead className="text-right text-foreground font-semibold">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {evidenceFiles.map((evi, i) => (
                            <TableRow key={i} className="border-border hover:bg-secondary/10 transition">
                              <TableCell>{evi.controlId}</TableCell>
                              <TableCell>{evi.description}</TableCell>
                              <TableCell>{evi.timestamp}</TableCell>
                              <TableCell>
                                <StatusBadge status={evi.severity.toLowerCase() === "high" ? "failed" : "pending"} />
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="rounded font-medium text-primary border border-primary hover:bg-primary/10"
                                >
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="exceptions">
                <div className="flex flex-col gap-6">
                  <div>
                    <div className="text-lg font-semibold mb-2">Active Exceptions</div>
                    <div className="text-sm text-muted-foreground mb-4">Approved compliance exceptions for this asset</div>
                    <div className="bg-card border border-border rounded-xl overflow-x-auto shadow">
                      <Table>
                        <TableHeader className="bg-secondary/40">
                          <TableRow>
                            <TableHead className="text-foreground font-semibold">Control</TableHead>
                            <TableHead className="text-foreground font-semibold">Justification</TableHead>
                            <TableHead className="text-foreground font-semibold">Approver</TableHead>
                            <TableHead className="text-foreground font-semibold">Expires</TableHead>
                            <TableHead className="text-foreground font-semibold">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {exceptions.map((ex, i) => (
                            <TableRow key={i} className="border-border hover:bg-secondary/10 transition">
                              <TableCell>{ex.control}</TableCell>
                              <TableCell>{ex.justification}</TableCell>
                              <TableCell>{ex.approver}</TableCell>
                              <TableCell>{ex.expires}</TableCell>
                              <TableCell>
                                <StatusBadge status="approved" />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="metadata">
                <div className="flex flex-col gap-6">
                  <div>
                    <div className="text-lg font-semibold mb-2">Technical Metadata</div>
                    <div className="text-sm text-muted-foreground mb-4">Detailed technical information about this asset</div>
                    {/* System Information */}
                    <div className="mb-6">
                      <div className="font-medium mb-2">System Information</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-1">
                          <div className="text-xs text-muted-foreground uppercase">Kernel Version</div>
                          <div className="font-medium">{metadata.system.kernel}</div>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-1">
                          <div className="text-xs text-muted-foreground uppercase">Architecture</div>
                          <div className="font-medium">{metadata.system.arch}</div>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-1">
                          <div className="text-xs text-muted-foreground uppercase">CPU Cores</div>
                          <div className="font-medium">{metadata.system.cpu}</div>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-1">
                          <div className="text-xs text-muted-foreground uppercase">Memory</div>
                          <div className="font-medium">{metadata.system.memory}</div>
                        </div>
                      </div>
                    </div>
                    {/* Network Configuration */}
                    <div>
                      <div className="font-medium mb-2">Network Configuration</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-1">
                          <div className="text-xs text-muted-foreground uppercase">MAC Address</div>
                          <div className="font-medium">{metadata.network.mac}</div>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-1">
                          <div className="text-xs text-muted-foreground uppercase">Subnet</div>
                          <div className="font-medium">{metadata.network.subnet}</div>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-1">
                          <div className="text-xs text-muted-foreground uppercase">Gateway</div>
                          <div className="font-medium">{metadata.network.gateway}</div>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-1">
                          <div className="text-xs text-muted-foreground uppercase">DNS Servers</div>
                          <div className="font-medium">{metadata.network.dns.join(", ")}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  )
}

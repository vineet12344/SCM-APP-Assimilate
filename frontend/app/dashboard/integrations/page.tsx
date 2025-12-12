"use client"
import { PageHeader } from "@/components/layout/page-header"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, XCircle, Plug } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

const integrations = [
  { name: "ServiceNow", status: "connected", description: "IT Service Management" },
  { name: "Jira", status: "connected", description: "Issue Tracking" },
  { name: "Vault", status: "disconnected", description: "Secrets Management" },
  { name: "Splunk", status: "connected", description: "SIEM" },
]

export default function IntegrationsPage() {
  const [open, setOpen] = useState(false)
  const [authType, setAuthType] = useState<'basic'|'oauth'>('basic')
  const [form, setForm] = useState({
    instanceUrl: '',
    baseApiUrl: '',
    authType: 'basic',
    username: '',
    password: '',
    clientId: '',
    clientSecret: '',
    cmdbTable: '',
  })

  const handleOpen = (integrationName: string) => {
    if (integrationName === 'ServiceNow') setOpen(true)
  }
  const handleClose = () => setOpen(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleAuthTypeChange = (value: string) => {
    setAuthType(value as 'basic'|'oauth')
    setForm(f => ({ ...f, authType: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: submit form data to backend
    setOpen(false)
  }

  return (
    <DashboardLayout title="Integrations">
      <div className="space-y-6">
        <PageHeader title="Integrations" description="Connect external services and platforms" />
        <div className="px-6">
          <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Integrations" }]} />
        </div>
        <div className="px-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {integrations.map((integration) => (
            <Card key={integration.name} className="p-6 border border-border flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-secondary/30 rounded">
                  <Plug className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{integration.name}</h3>
                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {integration.status === "connected" ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary border-primary/20">
                          Connected
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-muted-foreground" />
                        <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground">
                          Disconnected
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant={integration.status === "connected" ? "outline" : "default"}
                size="sm"
                onClick={() => handleOpen(integration.name)}
              >
                {integration.status === "connected" ? "Manage" : "Connect"}
              </Button>
            </Card>
          ))}
        </div>

        {/* ServiceNow Manage Modal */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage ServiceNow Integration</DialogTitle>
              <DialogDescription>Configure ServiceNow connection and sync settings.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="instanceUrl">Instance URL</Label>
                <Input required name="instanceUrl" value={form.instanceUrl} onChange={handleChange} placeholder="https://your-instance.service-now.com" />
              </div>
              <div>
                <Label htmlFor="authType">Auth Type</Label>
                <Select value={authType} onValueChange={handleAuthTypeChange} name="authType">
                  <SelectTrigger>
                    <SelectValue placeholder="Select Auth Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="oauth">OAuth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {authType === 'basic' ? (
                <>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input required name="username" value={form.username} onChange={handleChange} placeholder="API Username" />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input required type="password" name="password" value={form.password} onChange={handleChange} placeholder="API Password" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="clientId">Client ID</Label>
                    <Input required name="clientId" value={form.clientId} onChange={handleChange} placeholder="OAuth Client ID" />
                  </div>
                  <div>
                    <Label htmlFor="clientSecret">Client Secret</Label>
                    <Input required type="password" name="clientSecret" value={form.clientSecret} onChange={handleChange} placeholder="OAuth Client Secret" />
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="cmdbTable">CMDB Table</Label>
                <Input required name="cmdbTable" value={form.cmdbTable} onChange={handleChange} placeholder="e.g. cmdb_ci_computer" />
              </div>
              <DialogFooter>
                <Button type="submit">Save</Button>
                <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

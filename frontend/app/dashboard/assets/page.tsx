"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import {
  PageHeader,
  StatsGrid,
  StatCard,
  Table,
} from "@/components/dashboard-components";
import {
  Server,
  AlertTriangle,
  CheckCircle2,
  Clock,
  X,
  Monitor,
  MonitorSmartphone,
  DownloadCloud,
} from "lucide-react";
import { useMemo, useState } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Replace Lucide icons with SVG logos for Linux and Windows
const LinuxLogo = () => (
  <svg
    className="inline w-4 h-4 mr-1 align-text-bottom"
    viewBox="0 0 32 32"
    fill="none"
  >
    <ellipse cx="16" cy="16" rx="16" ry="16" fill="#333" />
    <ellipse cx="16" cy="20" rx="7" ry="9" fill="#fff" />
    <ellipse cx="13" cy="15" rx="1.2" ry="2" fill="#333" />
    <ellipse cx="19" cy="15" rx="1.2" ry="2" fill="#333" />
    <ellipse cx="16" cy="24" rx="3" ry="1.2" fill="#F9D923" />
  </svg>
);

const WindowsLogo = () => (
  <svg
    className="inline w-4 h-4 mr-1 align-text-bottom"
    viewBox="0 0 32 32"
    fill="none"
  >
    <rect width="32" height="32" rx="6" fill="#00ADEF" />
    <rect x="6" y="8" width="8" height="7" fill="#fff" />
    <rect x="18" y="8" width="8" height="7" fill="#fff" />
    <rect x="6" y="17" width="8" height="7" fill="#fff" />
    <rect x="18" y="17" width="8" height="7" fill="#fff" />
  </svg>
);

// ComplianceBar component for visual compliance score
const ComplianceBar = ({
  score,
  status,
}: {
  score?: number;
  status?: string;
}) => {
  // show empty muted bar + dash when score not available or Pending
  if (score === undefined || status === "Pending") {
    return (
      <div className="flex items-center gap-2">
        <div className="w-24 h-3 border border-muted rounded bg-transparent" />
        <span className="text-xs text-muted-foreground">—</span>
      </div>
    );
  }
  let barColor = "bg-green-500";
  if (score < 60) barColor = "bg-red-500";
  else if (score < 85) barColor = "bg-yellow-400";
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-3 bg-gray-200 rounded overflow-hidden">
        <div className={`h-3 ${barColor}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs text-muted-foreground">{score}%</span>
    </div>
  );
};

export default function AssetsPage() {
  const assetStats = [
    {
      label: "Total Assets",
      value: "2,847",
      icon: <Server className="w-5 h-5" />,
      change: 12,
      trend: "up",
    },
    {
      label: "Healthy",
      value: "2,681",
      icon: <CheckCircle2 className="w-5 h-5" />,
      change: 8,
      trend: "up",
    },
    {
      label: "At Risk",
      value: "156",
      icon: <AlertTriangle className="w-5 h-5" />,
      change: 3,
      trend: "down",
    },
    {
      label: "Pending Review",
      value: "10",
      icon: <Clock className="w-5 h-5" />,
      change: 1,
      trend: "up",
    },
  ];

  // generate 100 sample assets so there are 10 pages of 10 items each
  const assets = useMemo(() => {
    const list: any[] = [];
    const types = ["Database", "Web Server", "API Server", "Application"];
    const statuses = ["Healthy", "At Risk", "Pending"];
    const locations = ["US-East-1", "US-West-2", "EU-Central-1", "AP-South-1"];
    const owners = ["Alice", "Bob", "Carol", "Dave"];
    for (let i = 1; i <= 100; i++) {
      const id = `asset-${String(i).padStart(3, "0")}`;
      const osType = i % 2 === 0 ? "Linux" : "Windows";
      // Simulate compliance score or blank for pending
      let complianceScore: number | undefined = undefined;
      let complianceStatus = statuses[i % statuses.length];
      if (complianceStatus !== "Pending") {
        complianceScore = 50 + ((i * 7) % 51); // 50-100%
      }
      list.push({
        asset: id,
        os: {
          name: osType,
          icon: osType === "Linux" ? <LinuxLogo /> : <WindowsLogo />,
        },
        environment: [
          "Production",
          "QA",
          "Development",
          "DMZ",
          "Cloud",
          "Staging",
        ][i % 6],
        connector: i % 2 === 0 ? "SSH" : "HTTPS",
        lastScanned: `${i % 24} hours ago`,
        compliance: { score: complianceScore, status: complianceStatus },
        exceptions: i % 4 === 0 ? "2" : "0",
        status: complianceStatus,
        actions: (
          <Button asChild variant="ghost" size="sm">
            <Link href={`/dashboard/assets/${id}`}>
              <Eye className="w-4 h-4" />
            </Link>
          </Button>
        ),
      });
    }
    return list;
  }, []);

  const [page, setPage] = useState(1);
  const perPage = 10;

  // Unique values for filters (now based on generated asset fields)
  const osOptions = useMemo(() => ["Linux", "Windows"], []);
  const environmentOptions = useMemo(
    () => Array.from(new Set(assets.map((a) => a.environment))),
    [assets]
  );
  const connectorOptions = useMemo(
    () => Array.from(new Set(assets.map((a) => a.connector))),
    [assets]
  );
  const statusOptions = useMemo(
    () => Array.from(new Set(assets.map((a) => a.status))),
    [assets]
  );

  // Filter/search state (updated for new columns)
  const [search, setSearch] = useState("");
  const [osFilter, setOsFilter] = useState("all");
  const [environmentFilter, setEnvironmentFilter] = useState("all");
  const [connectorFilter, setConnectorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filtered assets (updated for new columns)
  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      if (
        search &&
        !(
          a.asset.toLowerCase().includes(search.toLowerCase()) ||
          a.os.name.toLowerCase().includes(search.toLowerCase()) ||
          a.environment.toLowerCase().includes(search.toLowerCase()) ||
          a.connector.toLowerCase().includes(search.toLowerCase()) ||
          a.status.toLowerCase().includes(search.toLowerCase())
        )
      )
        return false;
      if (osFilter !== "all" && a.os.name !== osFilter) return false;
      if (environmentFilter !== "all" && a.environment !== environmentFilter)
        return false;
      if (connectorFilter !== "all" && a.connector !== connectorFilter)
        return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      return true;
    });
  }, [
    assets,
    search,
    osFilter,
    environmentFilter,
    connectorFilter,
    statusFilter,
  ]);

  const totalPages = Math.ceil(filteredAssets.length / perPage);
  const pagedData = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredAssets.slice(start, start + perPage);
  }, [filteredAssets, page]);

  // Patch pagedData to render OS icon+name and compliance bar in the table
  const pagedDataWithOsIcon = useMemo(
    () =>
      pagedData.map((row) => ({
        ...row,
        os: (
          <span className="flex items-center">
            {row.os.icon}
            <span>{row.os.name}</span>
          </span>
        ),
        compliance: (
          <ComplianceBar
            score={row.compliance?.score}
            status={row.compliance?.status}
          />
        ),
      })),
    [pagedData]
  );

  // State for connector type in the Add Asset form
  const [connectorType, setConnectorType] = useState<string>("ssh");
  // State for SSH auth type in the Add Asset form
  const [sshAuthType, setSshAuthType] = useState<string>("password");

  const handleAddAsset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const payload = {
      hostname: formData.get("hostname"),
      ip_address: formData.get("ip_address"),
      os_family: formData.get("os_family"),
      os_version: formData.get("os_version"),
      domain: formData.get("domain"),
      environment: formData.get("environment"),
      owner: formData.get("owner"),
      tags: (formData.get("tags") as string)?.split(",").map((t) => t.trim()),
      connector_type: formData.get("connector_type"),
      discovery_source: "manual",
    };

    const res = await fetch("http://localhost:8080/api/v1/assets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("Failed to add asset");
      return;
    }

    alert("Asset added successfully");
    e.currentTarget.reset();
  };

  return (
    <DashboardLayout title="Assets">
      <PageHeader
        title="Asset Management"
        description="Monitor and manage all your organizational assets"
      />

      <StatsGrid>
        {assetStats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </StatsGrid>

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row md:items-end gap-3 mb-6">
        <div className="flex gap-2 flex-1 flex-wrap">
          <Input
            placeholder="Search asset, OS, environment, connector, status..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-56"
          />
          <Select
            value={osFilter}
            onValueChange={(v) => {
              setOsFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="OS" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All OS</SelectItem>
              {osOptions.map((os) => (
                <SelectItem key={os} value={os}>
                  {os}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={environmentFilter}
            onValueChange={(v) => {
              setEnvironmentFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Environments</SelectItem>
              {environmentOptions.map((env) => (
                <SelectItem key={env} value={env}>
                  {env}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={connectorFilter}
            onValueChange={(v) => {
              setConnectorFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Connector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Connectors</SelectItem>
              {connectorOptions.map((conn) => (
                <SelectItem key={conn} value={conn}>
                  {conn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Dialog>
            {/* primary Add button on sm+, compact icon-only on xs */}
            <div className="flex items-center gap-2">
              <DialogTrigger asChild>
                <Button variant="default" className="hidden sm:inline-flex">
                  + Add Asset
                </Button>
              </DialogTrigger>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="inline-flex sm:hidden px-2"
                >
                  +
                </Button>
              </DialogTrigger>
            </div>
            {/* ...existing code for DialogContent... */}
            <DialogContent className="max-w-lg w-full p-0 min-h-[600px] flex flex-col justify-between rounded-xl shadow-lg overflow-hidden">
              {/* ...existing code for DialogHeader, Tabs, etc... */}
              <DialogHeader className="flex flex-row items-center justify-between pt-4 pb-0 px-4 border-b sticky top-0 bg-background z-10">
                <DialogTitle className="text-lg font-semibold">
                  Add Asset
                </DialogTitle>
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
                  <div className="relative" style={{ height: "480px" }}>
                    <div className="absolute inset-0 overflow-y-auto">
                      {/* ...existing code for TabsContent... */}
                      <TabsContent value="bulk" className="">
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Import assets from a CSV or JSON file.
                          </p>
                          <Input
                            type="file"
                            accept=".csv,.json"
                            className="w-full"
                          />
                          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                            <DialogClose asChild>
                              <Button variant="outline" type="button">
                                Cancel
                              </Button>
                            </DialogClose>
                            <Button type="button">Import</Button>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="cmdb" className="">
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Sync assets from ServiceNow CMDB.
                          </p>
                          <Button type="button" className="w-full sm:w-auto">
                            Sync with ServiceNow
                          </Button>
                          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                            <DialogClose asChild>
                              <Button variant="outline" type="button">
                                Cancel
                              </Button>
                            </DialogClose>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="cloud" className="">
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Sync assets from cloud providers (AWS/Azure).
                          </p>
                          <div className="flex gap-2 flex-col sm:flex-row">
                            <Button type="button" className="w-full sm:w-auto">
                              Sync from AWS
                            </Button>
                            <Button type="button" className="w-full sm:w-auto">
                              Sync from Azure
                            </Button>
                          </div>
                          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                            <DialogClose asChild>
                              <Button variant="outline" type="button">
                                Cancel
                              </Button>
                            </DialogClose>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="manual" className="">
                        {/* Dynamic Add Asset Form - hooks moved to top level */}
                        <form
                          className="w-full"
                          onSubmit={handleAddAsset}
                        >
                          <div className="space-y-8 pr-2">
                            {/* Basic Information */}
                            <div className="space-y-4">
                              <h4 className="text-lg font-semibold text-foreground border-b pb-2">
                                Basic Information
                              </h4>
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="hostname"
                                    className="text-sm font-medium"
                                  >
                                    Hostname *
                                  </Label>
                                  <Input
                                    id="hostname"
                                    name="hostname"
                                    placeholder="e.g., server.example.com"
                                    required
                                    className="w-full h-10"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="ip_address"
                                    className="text-sm font-medium"
                                  >
                                    IP Address *
                                  </Label>
                                  <Input
                                    id="ip_address"
                                    name="ip_address"
                                    placeholder="e.g., 192.168.1.1"
                                    required
                                    className="w-full h-10"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="os_family"
                                    className="text-sm font-medium"
                                  >
                                    OS Family *
                                  </Label>
                                  <Select name="os_family" required>
                                    <SelectTrigger className="w-full h-10">
                                      <SelectValue placeholder="Select OS Family" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="linux">
                                        Linux
                                      </SelectItem>
                                      <SelectItem value="windows">
                                        Windows
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="os_version"
                                    className="text-sm font-medium"
                                  >
                                    OS Version *
                                  </Label>
                                  <Input
                                    id="os_version"
                                    name="os_version"
                                    placeholder="e.g., Ubuntu 20.04"
                                    required
                                    className="w-full h-10"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="domain"
                                    className="text-sm font-medium"
                                  >
                                    Domain
                                  </Label>
                                  <Input
                                    id="domain"
                                    name="domain"
                                    placeholder="e.g., example.com"
                                    className="w-full h-10"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="environment"
                                    className="text-sm font-medium"
                                  >
                                    Environment *
                                  </Label>
                                  <Select name="environment" required>
                                    <SelectTrigger className="w-full h-10">
                                      <SelectValue placeholder="Select Environment" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="prod">
                                        Production
                                      </SelectItem>
                                      <SelectItem value="qa">QA</SelectItem>
                                      <SelectItem value="dev">
                                        Development
                                      </SelectItem>
                                      <SelectItem value="dmz">DMZ</SelectItem>
                                      <SelectItem value="cloud">
                                        Cloud
                                      </SelectItem>
                                      <SelectItem value="staging">
                                        Staging
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="owner"
                                    className="text-sm font-medium"
                                  >
                                    Owner
                                  </Label>
                                  <Input
                                    id="owner"
                                    name="owner"
                                    placeholder="e.g., john.doe"
                                    className="w-full h-10"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="tags"
                                    className="text-sm font-medium"
                                  >
                                    Tags
                                  </Label>
                                  <Input
                                    id="tags"
                                    name="tags"
                                    placeholder="e.g., web, production"
                                    className="w-full h-10"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Connector Configuration */}
                            <div className="space-y-4">
                              <h4 className="text-lg font-semibold text-foreground border-b pb-2">
                                Connector Configuration
                              </h4>
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="connector_type"
                                    className="text-sm font-medium"
                                  >
                                    Connector Type *
                                  </Label>
                                  <Select
                                    name="connector_type"
                                    required
                                    value={connectorType}
                                    onValueChange={(v) => setConnectorType(v)}
                                  >
                                    <SelectTrigger className="w-full h-10">
                                      <SelectValue placeholder="Select Connector Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="ssh">SSH</SelectItem>
                                      <SelectItem value="openssh">
                                        OpenSSH
                                      </SelectItem>
                                      <SelectItem value="https">
                                        HTTPS
                                      </SelectItem>
                                      <SelectItem value="micro-agent">
                                        Micro-Agent
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Dynamic fields for SSH */}
                                {connectorType === "ssh" && (
                                  <>
                                    <div className="space-y-2">
                                      <Label
                                        htmlFor="ssh_username"
                                        className="text-sm font-medium"
                                      >
                                        SSH Username *
                                      </Label>
                                      <Input
                                        id="ssh_username"
                                        name="ssh_username"
                                        placeholder="e.g., root"
                                        required
                                        className="w-full h-10"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label
                                        htmlFor="ssh_auth_type"
                                        className="text-sm font-medium"
                                      >
                                        Auth Type *
                                      </Label>
                                      <Select
                                        name="ssh_auth_type"
                                        required
                                        value={sshAuthType}
                                        onValueChange={(v) => setSshAuthType(v)}
                                      >
                                        <SelectTrigger className="w-full h-10">
                                          <SelectValue placeholder="Select Auth Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="password">
                                            Password
                                          </SelectItem>
                                          <SelectItem value="private_key">
                                            Private Key
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    {sshAuthType === "password" && (
                                      <div className="space-y-2">
                                        <Label
                                          htmlFor="ssh_password"
                                          className="text-sm font-medium"
                                        >
                                          Password *
                                        </Label>
                                        <Input
                                          id="ssh_password"
                                          name="ssh_password"
                                          type="password"
                                          placeholder="Enter password"
                                          required
                                          className="w-full h-10"
                                        />
                                      </div>
                                    )}
                                    {sshAuthType === "private_key" && (
                                      <>
                                        <div className="space-y-2 md:col-span-2">
                                          <Label
                                            htmlFor="ssh_private_key"
                                            className="text-sm font-medium"
                                          >
                                            Private Key *
                                          </Label>
                                          <Input
                                            id="ssh_private_key"
                                            name="ssh_private_key"
                                            type="text"
                                            placeholder="Paste private key"
                                            required
                                            className="w-full h-10"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label
                                            htmlFor="ssh_passphrase"
                                            className="text-sm font-medium"
                                          >
                                            Passphrase
                                          </Label>
                                          <Input
                                            id="ssh_passphrase"
                                            name="ssh_passphrase"
                                            type="password"
                                            placeholder="Enter passphrase"
                                            className="w-full h-10"
                                          />
                                        </div>
                                      </>
                                    )}
                                    <div className="space-y-2">
                                      <Label
                                        htmlFor="ssh_port"
                                        className="text-sm font-medium"
                                      >
                                        Port
                                      </Label>
                                      <Input
                                        id="ssh_port"
                                        name="ssh_port"
                                        type="number"
                                        placeholder="22"
                                        className="w-full h-10"
                                        min={1}
                                        max={65535}
                                      />
                                    </div>
                                  </>
                                )}

                                {/* Dynamic fields for OpenSSH (Windows) */}
                                {connectorType === "openssh" && (
                                  <>
                                    <div className="space-y-2">
                                      <Label
                                        htmlFor="win_username"
                                        className="text-sm font-medium"
                                      >
                                        Windows Username *
                                      </Label>
                                      <Input
                                        id="win_username"
                                        name="win_username"
                                        placeholder="e.g., Administrator"
                                        required
                                        className="w-full h-10"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label
                                        htmlFor="win_password"
                                        className="text-sm font-medium"
                                      >
                                        Password *
                                      </Label>
                                      <Input
                                        id="win_password"
                                        name="win_password"
                                        type="password"
                                        placeholder="Enter password"
                                        required
                                        className="w-full h-10"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label
                                        htmlFor="win_port"
                                        className="text-sm font-medium"
                                      >
                                        Port
                                      </Label>
                                      <Input
                                        id="win_port"
                                        name="win_port"
                                        type="number"
                                        placeholder="Default OpenSSH port"
                                        className="w-full h-10"
                                        min={1}
                                        max={65535}
                                      />
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          {/* Buttons at the bottom of the form */}
                          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 mt-8 border-t">
                            <DialogClose asChild>
                              <Button variant="outline" type="button">
                                Cancel
                              </Button>
                            </DialogClose>
                            <Button type="submit">Add Asset</Button>
                          </div>
                        </form>
                      </TabsContent>
                    </div>
                  </div>
                </Tabs>
              </div>
            </DialogContent>
          </Dialog>
          {/* Export: full label on sm+, compact icon on xs */}
          <Button
            variant="outline"
            className="hidden sm:inline-flex items-center gap-2"
          >
            <DownloadCloud className="w-4 h-4" /> Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="inline-flex sm:hidden p-2"
          >
            <DownloadCloud className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table
          columns={[
            { label: "Asset", key: "asset" },
            { label: "OS", key: "os" },
            { label: "Environment", key: "environment" },
            { label: "Connector", key: "connector" },
            { label: "Last Scanned", key: "lastScanned" },
            { label: "Compliance", key: "compliance" },
            { label: "Exceptions", key: "exceptions" },
            { label: "Status", key: "status" },
            { label: "Actions", key: "actions" },
          ]}
          data={pagedDataWithOsIcon}
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {(page - 1) * perPage + 1} -{" "}
          {Math.min(page * perPage, filteredAssets.length)} of{" "}
          {filteredAssets.length}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </Button>
          <div className="flex gap-1 overflow-x-auto">
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={i}
                variant={page === i + 1 ? "default" : "ghost"}
                size="sm"
                onClick={() => setPage(i + 1)}
                className="min-w-[36px] px-2"
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

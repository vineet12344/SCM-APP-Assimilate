package models

import (
	"time"

	"github.com/lib/pq" // Required for Postgres Arrays
	"gorm.io/gorm"
)

type Asset struct {
	ID uint `json:"id" gorm:"primaryKey"`

	// 1. Hostname  - Required by FR-INV-01
	Hostname string `json:"hostname" gorm:"not null"`

	// 2. IP Address - Required by FR-INV-01
	IPAddress string `json:"ip_address" gorm:"not null"`

	// 3. OS Details - Required by FR-INV-04
	OSFamily  string `json:"os_family"`  // e.g. "linux"
	OSVersion string `json:"os_version"` // e.g. "Ubuntu 22.04"

	// 4. Classification
	Domain      string `json:"domain"`      // Required by FR-INV-04
	Environment string `json:"environment"` // Required by FR-INV-04 ("prod", "dev")
	Owner       string `json:"owner"`       // Required by FR-INV-01

	// 5. Tags (Replaces string-based tags) - Required by Task 1
	// We use pq.StringArray because the DB column is 'text[]'
	Tags pq.StringArray `json:"tags" gorm:"type:text[]"`

	// 6. Connection Info - Required by FR-INV-05
	ConnectorType string `json:"connector_type"` // e.g. "ssh", "winrm"

	// 7. Sync Logic - Required by Task 3
	DiscoverySource string `json:"discovery_source"` // "manual", "cmdb"
	ExternalRefID   string `json:"external_ref_id"`  // ServiceNow sys_id

	// 8. Timestamps
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	 // 9. FOR SOFT DELETE
	DeletedAt       gorm.DeletedAt `json:"deleted_at" gorm:"index"`

	// Relationships
	Scans []Scan `json:"scans,omitempty" gorm:"foreignKey:AssetID"`
}
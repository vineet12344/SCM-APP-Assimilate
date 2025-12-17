package models

import (
	"time"
	"gorm.io/gorm"
)

type Asset struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Hostname    string         `json:"hostname" gorm:"not null"`
	IP          string         `json:"ip" gorm:"not null"`
	Status      string         `json:"status" gorm:"default:'active'"`
	OsFamily    string         `json:"os_family" gorm:"not null"`  
	OsVersion   string         `json:"os_version" gorm:"not null"` 
	Domain      string         `json:"domain"`                     
	Environment string         `json:"environment" gorm:"not null"` 
	Owner       string         `json:"owner"`                       
	Tags        string         `json:"tags"`                        
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"deleted_at" gorm:"index"`
	ImportMethod string         `json:"import_method" gorm:"not null"`
	Port        int            `json:"port" gorm:"not null"`
	ConnectorType string        `json:"connector_type" gorm:"not null"`
	CredId     string          `json:"creds" gorm:"not null"`
}

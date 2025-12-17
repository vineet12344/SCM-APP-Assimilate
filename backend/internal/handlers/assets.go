package handlers

import (
	"encoding/json"
	"io"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/patil-rushikesh/scm-backend/internal/models"
	"github.com/patil-rushikesh/scm-backend/internal/services"
	"github.com/patil-rushikesh/scm-backend/internal/utils"
)

type AssetHandler struct {
	service services.AssetService
}

// Constructor expects Service, NOT DB
func NewAssetHandler(service services.AssetService) *AssetHandler {
	return &AssetHandler{service: service}
}

// Task 2: Manual Entry
func (h *AssetHandler) CreateAsset(c *gin.Context) {
	var asset models.Asset
	if err := c.ShouldBindJSON(&asset); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid input", err)
		return
	}

	// 1. Validation
	if asset.Hostname == "" || asset.IPAddress == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "Hostname and IP Address are required", nil)
		return
	}

	// 2. Auto-Detect defaults
	if asset.ConnectorType == "" {
		if strings.Contains(strings.ToLower(asset.OSFamily), "win") {
			asset.ConnectorType = "winrm"
		} else {
			asset.ConnectorType = "ssh"
		}
	}
	if asset.DiscoverySource == "" {
		asset.DiscoverySource = "manual"
	}

	// 3. Call Service
	if err := h.service.CreateAsset(&asset); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create asset", err)
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Asset created successfully", asset)
}

// Task 5: Asset Details (Mock Data)
func (h *AssetHandler) GetAsset(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid asset ID", err)
		return
	}

	// 1. Get Real Data from Service
	asset, err := h.service.GetAsset(uint(id))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Asset not found", err)
		return
	}

	// 2. Mix with Mock Data
	response := gin.H{
		"id":               asset.ID,
		"hostname":         asset.Hostname,
		"ip_address":       asset.IPAddress,
		"os_family":        asset.OSFamily,
		"os_version":       asset.OSVersion,
		"tags":             asset.Tags,
		"connector_type":   asset.ConnectorType,
		"discovery_source": asset.DiscoverySource,
		"created_at":       asset.CreatedAt,
		// Mock Details
		"hardware": gin.H{"cpu": "4 vCPU", "ram": "16 GB", "disk": "512 GB SSD"},
		"software": []string{"Docker v24.0", "Nginx 1.18", "PostgreSQL Client 15"},
		"scan_history": []gin.H{
			{"date": "2024-12-10", "status": "passed", "score": 98},
			{"date": "2024-12-01", "status": "failed", "score": 45},
		},
		"evidence_links": []string{"s3://bucket/logs/scan_101.log"},
	}

	utils.SuccessResponse(c, http.StatusOK, "Asset retrieved successfully", response)
}

func (h *AssetHandler) GetAllAssets(c *gin.Context) {
	assets, err := h.service.GetAllAssets()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to get assets", err)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Assets retrieved successfully", assets)
}


// Update Asset (PUT /api/v1/assets/:id)
func (h *AssetHandler) UpdateAsset(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid asset ID", err)
		return
	}

	var asset models.Asset
	if err := c.ShouldBindJSON(&asset); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid input", err)
		return
	}

	// Call service to update
	updatedAsset, err := h.service.UpdateAsset(uint(id), &asset)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update asset", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Asset updated successfully", updatedAsset)
}

// Soft Delete Asset (DELETE /api/v1/assets/:id)
func (h *AssetHandler) DeleteAsset(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid asset ID", err)
		return
	}

	// Call service to delete
	if err := h.service.DeleteAsset(uint(id)); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete asset", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Asset deleted successfully", nil)
}

func (h *AssetHandler) BulkImportAssets(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to get file", err)
		return

	}

	f, err := file.Open()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to open file", err)

		return
	}

	defer f.Close()

	data, err := io.ReadAll(f)

	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to read file", err)
		return
	}

	var assets []models.Asset
	if err := json.Unmarshal(data, &assets); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid file format", err)
		return
	}

	if err := h.service.BulkCreateAssets(assets); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to import assets", err)
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Assets imported successfully", nil)

}

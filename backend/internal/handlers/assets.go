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

func (h *AssetHandler) AddAsset(c *gin.Context) {
	var req struct {
		Hostname      string                 `json:"hostname"`
		IP            string                 `json:"ip"`
		Port          int                    `json:"port"`
		ConnectorType string                 `json:"connector_type"`
		Environment   string                 `json:"environment"`
		Owner         string                 `json:"owner"`
		Tags          []string               `json:"tags"`
		OsFamily      string                 `json:"os_family"`
		OsVersion     string                 `json:"os_version"`
		Domain        string                 `json:"domain"`
		Creds         map[string]interface{} `json:"creds"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid input", err)
		return
	}

	// If credentials are provided, store them in the vault and get an ID
	var credID string
	if req.Creds != nil {
		id, err := utils.StoreCredentials(req.Creds)
		if err != nil {
			utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to store credentials in vault", err)
			return
		}
		credID = id
	}

	// Build the asset model to persist; only store reference to credentials (credID)
	asset := models.Asset{
		Hostname:      req.Hostname,
		IP:            req.IP,
		Port:          req.Port,
		ConnectorType: req.ConnectorType,
		Environment:   req.Environment,
		Owner:         req.Owner,
		Tags:          strings.Join(req.Tags, ","), // store tags as CSV
		OsFamily:      req.OsFamily,
		OsVersion:     req.OsVersion,
		Domain:        req.Domain,
		CredId:        credID,
	}

	// Persist the asset via service
	if err := h.service.CreateAsset(&asset); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create asset", err)
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Asset created successfully", asset)
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

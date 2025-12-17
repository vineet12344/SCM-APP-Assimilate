// middleware/asset_validation.go
package middleware

import (
	"net"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

func ValidateAddAsset() gin.HandlerFunc {

	return func(c *gin.Context) {
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

		// Bind JSON into DTO
		if err := c.ShouldBindJSON(&req); err != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
			return
		}

		// Either hostname or IP must be present
		if strings.TrimSpace(req.Hostname) == "" && strings.TrimSpace(req.IP) == "" {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "hostname or ip is required"})
			return
		}

		// Validate IP if provided
		if req.IP != "" {
			if net.ParseIP(strings.TrimSpace(req.IP)) == nil {
				c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid IP address"})
				return
			}

			// Default port
			if req.Port == 0 {
				req.Port = 22
			}

			// Port range validation
			if req.Port < 1 || req.Port > 65535 {
				c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid port"})
				return
			}

			// Resolve address (prefer IP)
			address := strings.TrimSpace(req.IP)
			if address == "" {
				address = strings.TrimSpace(req.Hostname)
			}

			target := net.JoinHostPort(address, strconv.Itoa(req.Port))

			// TCP connectivity check (non-blocking & safe)
			conn, err := net.DialTimeout("tcp", target, 3*time.Second)
			if err != nil {
				c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "unable to connect to asset"})
				return
			}
			_ = conn.Close()

			// Pass validated request to next handlers
			c.Set("addAssetReq", req)
			c.Next()
		}
	}
}

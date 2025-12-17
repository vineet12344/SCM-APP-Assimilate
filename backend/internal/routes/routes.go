package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/patil-rushikesh/scm-backend/internal/handlers"
	asset "github.com/patil-rushikesh/scm-backend/internal/middleware/assets"
	jwt_auth "github.com/patil-rushikesh/scm-backend/internal/middleware/auth"
)

func SetupRoutes(router *gin.Engine, h *handlers.Handlers) {
	// Health check
	router.GET("/health", h.Health.HealthCheck)

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Auth routes
		auth := v1.Group("/auth")
		{
			auth.POST("/register", h.User.Register)
			auth.POST("/login", h.User.Authenticate)
			auth.GET("/me", jwt_auth.JWTAuthMiddleware(), h.User.GetProfile)
			auth.POST("/logout", h.User.Logout)
		}
		// Asset routes
		assets := v1.Group("/assets", jwt_auth.JWTAuthMiddleware())
		{
			assets.POST("/", asset.ValidateAddAsset(), h.Asset.AddAsset)
		}

	}
}

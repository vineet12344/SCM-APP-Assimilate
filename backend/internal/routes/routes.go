package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/patil-rushikesh/scm-backend/internal/handlers"
	"github.com/patil-rushikesh/scm-backend/internal/middleware"
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
			auth.GET("/me", middleware.JWTAuthMiddleware(), h.User.GetProfile)
			auth.POST("/logout", h.User.Logout)
		}

		// // User routes
		// users := v1.Group("/users")
		// {
		// 	users.GET("/:id", h.User.GetUser)
		// 	users.PUT("/:id", h.User.UpdateUser)
		// 	users.DELETE("/:id", h.User.DeleteUser)
		// }

		// Asset routes
		assets := v1.Group("/assets")
		{
			assets.POST("/", h.Asset.CreateAsset)
			assets.GET("/", h.Asset.GetAllAssets)
			assets.GET("/:id", h.Asset.GetAsset)
			assets.PUT("/:id", h.Asset.UpdateAsset)
    		assets.DELETE("/:id", h.Asset.DeleteAsset)
			assets.POST("/bulk-import", middleware.JWTAuthMiddleware(), middleware.RoleCheckMiddleware("admin"), h.Asset.BulkImportAssets)
		}

		// // Scan routes
		// scans := v1.Group("/scans")
		// {
		// 	scans.POST("/", h.Scan.CreateScan)
		// 	scans.GET("/", h.Scan.GetAllScans)
		// 	scans.GET("/:id", h.Scan.GetScan)
		// }

		// // Evidence routes
		// evidence := v1.Group("/evidence")
		// {
		// 	evidence.POST("/", h.Evidence.CreateEvidence)
		// 	evidence.GET("/", h.Evidence.GetAllEvidence)
		// 	evidence.GET("/:id", h.Evidence.GetEvidence)
		// }

		// // Exception routes
		// exceptions := v1.Group("/exceptions")
		// {
		// 	exceptions.POST("/", h.Exception.CreateException)
		// 	exceptions.GET("/", h.Exception.GetAllExceptions)
		// 	exceptions.GET("/:id", h.Exception.GetException)
		// }
	}
}

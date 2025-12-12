package main

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/patil-rushikesh/scm-backend/config"
	"github.com/patil-rushikesh/scm-backend/internal/handlers"
	"github.com/patil-rushikesh/scm-backend/internal/middleware"
	"github.com/patil-rushikesh/scm-backend/internal/repository"
	"github.com/patil-rushikesh/scm-backend/internal/routes"
	"github.com/patil-rushikesh/scm-backend/internal/services"
	"github.com/patil-rushikesh/scm-backend/shared/database"
	
)

func main() {
	// gin.SetMode(gin.ReleaseMode)
	_ = godotenv.Load()
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}
	db, err := database.NewPostgresDB(cfg)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	repos := repository.NewRepositories(db)
	services := services.NewServices(repos)
	handlers := handlers.NewHandlers(services)
	router := gin.Default()
	router.Use(middleware.Logger())
	router.Use(middleware.Recovery())
	router.Use(middleware.CORSMiddleware())
	routes.SetupRoutes(router, handlers)
	if err := router.Run(fmt.Sprintf(":%d", cfg.Server.Port)); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

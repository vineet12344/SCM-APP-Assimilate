package database

import (
	"fmt"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/patil-rushikesh/scm-backend/config"
	"github.com/patil-rushikesh/scm-backend/internal/models"
)

func NewPostgresDB(cfg *config.Config) (*gorm.DB, error) {
	dsn := cfg.Database.ConnectionString

	//  MODIFIED: Added config to disable prepared statements
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		PrepareStmt: false, // CRITICAL FIX for Neon DB Connection Pooler
	})

	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}
	return db, nil
}

func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.User{},
		&models.Asset{},
		&models.Scan{},
		&models.Evidence{},
		&models.Exception{},
	)
}

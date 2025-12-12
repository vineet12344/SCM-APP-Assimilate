package repository

import (
	"github.com/patil-rushikesh/scm-backend/internal/models"
	"gorm.io/gorm"
)

type AssetRepository interface {
	Create(asset *models.Asset) error
	GetByID(id uint) (*models.Asset, error)
	GetAll() ([]models.Asset, error)
    // Updated Signatures
	Update(id uint, asset *models.Asset) (*models.Asset, error)
	Delete(id uint) error
	BulkCreate(assets []models.Asset) error
}

type assetRepository struct {
	db *gorm.DB
}

func NewAssetRepository(db *gorm.DB) AssetRepository {
	return &assetRepository{db: db}
}

func (r *assetRepository) Create(asset *models.Asset) error {
	return r.db.Create(asset).Error
}

func (r *assetRepository) GetByID(id uint) (*models.Asset, error) {
	var asset models.Asset
	err := r.db.Preload("Scans").First(&asset, id).Error
	return &asset, err
}

func (r *assetRepository) GetAll() ([]models.Asset, error) {
	var assets []models.Asset
	err := r.db.Find(&assets).Error
	return assets, err
}

// Update modifies an existing asset
func (r *assetRepository) Update(id uint, asset *models.Asset) (*models.Asset, error) {
	var existing models.Asset
	// 1. Find existing
	if err := r.db.First(&existing, id).Error; err != nil {
		return nil, err
	}
	// 2. Update fields
	if err := r.db.Model(&existing).Updates(asset).Error; err != nil {
		return nil, err
	}
	return &existing, nil
}

// Delete performs a soft delete (because model has DeletedAt)
func (r *assetRepository) Delete(id uint) error {
	return r.db.Delete(&models.Asset{}, id).Error
}


func (r *assetRepository) BulkCreate(assets []models.Asset) error {
	tx := r.db.Begin()
	if err := tx.Error; err != nil {
		return err
	}
	
	if err := tx.CreateInBatches(&assets, 100).Error; err != nil {
		tx.Rollback()
		return err
	}
	return tx.Commit().Error
}

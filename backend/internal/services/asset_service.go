package services

import (
	"github.com/patil-rushikesh/scm-backend/internal/models"
	"github.com/patil-rushikesh/scm-backend/internal/repository"
)

type AssetService interface {
	CreateAsset(asset *models.Asset) error
	GetAsset(id uint) (*models.Asset, error)
	GetAllAssets() ([]models.Asset, error)
    // Updated Signatures
	UpdateAsset(id uint, asset *models.Asset) (*models.Asset, error)
	DeleteAsset(id uint) error
	BulkCreateAssets(assets []models.Asset) error
}

type assetService struct {
	repo repository.AssetRepository
}

func NewAssetService(repo repository.AssetRepository) AssetService {
	return &assetService{repo: repo}
}

func (s *assetService) CreateAsset(asset *models.Asset) error {
	return s.repo.Create(asset)
}

func (s *assetService) GetAsset(id uint) (*models.Asset, error) {
	return s.repo.GetByID(id)
}

func (s *assetService) GetAllAssets() ([]models.Asset, error) {
	return s.repo.GetAll()
}

func (s *assetService) UpdateAsset(id uint, asset *models.Asset) (*models.Asset, error) {
	// Calls the updated Repo Update method
	return s.repo.Update(id, asset)
}

func (s *assetService) DeleteAsset(id uint) error {
	return s.repo.Delete(id)
}

func (s *assetService) BulkCreateAssets(assets []models.Asset) error {
	return s.repo.BulkCreate(assets)
}




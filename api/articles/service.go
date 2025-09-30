package articles

import (
	"math"

	"base/app/models"
	"base/core/emitter"
	"base/core/logger"
	"base/core/storage"
	"base/core/types"

	"gorm.io/gorm"
)

const (
	CreateArticleEvent = "articles.create"
	UpdateArticleEvent = "articles.update"
	DeleteArticleEvent = "articles.delete"
)

type ArticleService struct {
	DB      *gorm.DB
	Emitter *emitter.Emitter
	Storage *storage.ActiveStorage
	Logger  logger.Logger
}

func NewArticleService(db *gorm.DB, emitter *emitter.Emitter, storage *storage.ActiveStorage, logger logger.Logger) *ArticleService {
	return &ArticleService{
		DB:      db,
		Logger:  logger,
		Emitter: emitter,
		Storage: storage,
	}
}

// applySorting applies sorting to the query based on the sort and order parameters
func (s *ArticleService) applySorting(query *gorm.DB, sortBy *string, sortOrder *string) {
	// Valid sortable fields for Article
	validSortFields := map[string]string{
		"id":         "id",
		"created_at": "created_at",
		"updated_at": "updated_at",
		"title":      "title",
		"content":    "content",
		"featured":   "featured",
		"author_id":  "author_id",
	}

	// Default sorting - if sort_order exists, always use it for custom ordering
	defaultSortBy := "id"
	defaultSortOrder := "desc"

	// Determine sort field
	sortField := defaultSortBy
	if sortBy != nil && *sortBy != "" {
		if field, exists := validSortFields[*sortBy]; exists {
			sortField = field
		}
	}

	// Determine sort direction (order parameter)
	sortDirection := defaultSortOrder
	if sortOrder != nil && (*sortOrder == "asc" || *sortOrder == "desc") {
		sortDirection = *sortOrder
	}

	// Apply sorting
	query.Order(sortField + " " + sortDirection)
}

func (s *ArticleService) Create(req *models.CreateArticleRequest) (*models.Article, error) {
	item := &models.Article{
		Title:    req.Title,
		Content:  req.Content,
		Featured: req.Featured,
		AuthorId: req.AuthorId,
	}

	if err := s.DB.Create(item).Error; err != nil {
		s.Logger.Error("failed to create article", logger.String("error", err.Error()))
		return nil, err
	}

	// Emit create event
	s.Emitter.Emit(CreateArticleEvent, item)

	return s.GetById(item.Id)
}

func (s *ArticleService) Update(id uint, req *models.UpdateArticleRequest) (*models.Article, error) {
	item := &models.Article{}
	if err := s.DB.First(item, id).Error; err != nil {
		s.Logger.Error("failed to find article for update",
			logger.String("error", err.Error()),
			logger.Int("id", int(id)))
		return nil, err
	}

	// Validate request
	if err := ValidateArticleUpdateRequest(req, id); err != nil {
		return nil, err
	}

	// Update fields directly on the model
	// For non-pointer string fields
	if req.Title != "" {
		item.Title = req.Title
	}
	// For non-pointer string fields
	if req.Content != "" {
		item.Content = req.Content
	}
	// For boolean fields, check if it's included in the request (pointer would be non-nil)
	if req.Featured != nil {
		item.Featured = *req.Featured
	}
	// For non-pointer unsigned integer fields
	if req.AuthorId != 0 {
		item.AuthorId = req.AuthorId
	}

	if err := s.DB.Save(item).Error; err != nil {
		s.Logger.Error("failed to update article",
			logger.String("error", err.Error()),
			logger.Int("id", int(id)))
		return nil, err
	}

	// Handle many-to-many relationships

	result, err := s.GetById(item.Id)
	if err != nil {
		s.Logger.Error("failed to get updated article",
			logger.String("error", err.Error()),
			logger.Int("id", int(id)))
		return nil, err
	}

	// Emit update event
	s.Emitter.Emit(UpdateArticleEvent, result)

	return result, nil
}

func (s *ArticleService) Delete(id uint) error {
	item := &models.Article{}
	if err := s.DB.First(item, id).Error; err != nil {
		s.Logger.Error("failed to find article for deletion",
			logger.String("error", err.Error()),
			logger.Int("id", int(id)))
		return err
	}

	// Delete file attachments if any

	if err := s.DB.Delete(item).Error; err != nil {
		s.Logger.Error("failed to delete article",
			logger.String("error", err.Error()),
			logger.Int("id", int(id)))
		return err
	}

	// Emit delete event
	s.Emitter.Emit(DeleteArticleEvent, item)

	return nil
}

func (s *ArticleService) GetById(id uint) (*models.Article, error) {
	item := &models.Article{}

	query := item.Preload(s.DB)
	if err := query.First(item, id).Error; err != nil {
		s.Logger.Error("failed to get article",
			logger.String("error", err.Error()),
			logger.Int("id", int(id)))
		return nil, err
	}

	return item, nil
}

func (s *ArticleService) GetAll(page *int, limit *int, sortBy *string, sortOrder *string) (*types.PaginatedResponse, error) {
	var items []*models.Article
	var total int64

	query := s.DB.Model(&models.Article{})
	// Set default values if nil
	defaultPage := 1
	defaultLimit := 10
	if page == nil {
		page = &defaultPage
	}
	if limit == nil {
		limit = &defaultLimit
	}

	// Get total count
	if err := query.Count(&total).Error; err != nil {
		s.Logger.Error("failed to count articles",
			logger.String("error", err.Error()))
		return nil, err
	}

	// Apply pagination if provided
	if page != nil && limit != nil {
		offset := (*page - 1) * *limit
		query = query.Offset(offset).Limit(*limit)
	}

	// Apply sorting
	s.applySorting(query, sortBy, sortOrder)

	// Don't preload relationships for list response (faster)
	// query = (&models.Article{}).Preload(query)

	// Execute query
	if err := query.Find(&items).Error; err != nil {
		s.Logger.Error("failed to get articles",
			logger.String("error", err.Error()))
		return nil, err
	}

	// Convert to response type
	responses := make([]*models.ArticleListResponse, len(items))
	for i, item := range items {
		responses[i] = item.ToListResponse()
	}

	// Calculate total pages
	totalPages := int(math.Ceil(float64(total) / float64(*limit)))
	if totalPages == 0 {
		totalPages = 1
	}

	return &types.PaginatedResponse{
		Data: responses,
		Pagination: types.Pagination{
			Total:      int(total),
			Page:       *page,
			PageSize:   *limit,
			TotalPages: totalPages,
		},
	}, nil
}

// GetAllForSelect gets all items for select box/dropdown options (simplified response)
func (s *ArticleService) GetAllForSelect() ([]*models.Article, error) {
	var items []*models.Article

	query := s.DB.Model(&models.Article{})

	// Only select the necessary fields for select options
	query = query.Select("id, title")

	// Order by name/title for better UX
	query = query.Order("title ASC")

	if err := query.Find(&items).Error; err != nil {
		s.Logger.Error("Failed to fetch items for select", logger.String("error", err.Error()))
		return nil, err
	}

	return items, nil
}

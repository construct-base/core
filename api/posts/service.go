package posts

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
	CreatePostEvent = "posts.create"
	UpdatePostEvent = "posts.update"
	DeletePostEvent = "posts.delete"
)

type PostService struct {
	DB      *gorm.DB
	Emitter *emitter.Emitter
	Storage *storage.ActiveStorage
	Logger  logger.Logger
}

func NewPostService(db *gorm.DB, emitter *emitter.Emitter, storage *storage.ActiveStorage, logger logger.Logger) *PostService {
	return &PostService{
		DB:      db,
		Logger:  logger,
		Emitter: emitter,
		Storage: storage,
	}
}

// applySorting applies sorting to the query based on the sort and order parameters
func (s *PostService) applySorting(query *gorm.DB, sortBy *string, sortOrder *string) {
	// Valid sortable fields for Post
	validSortFields := map[string]string{
		"id":          "id",
		"created_at":  "created_at",
		"updated_at":  "updated_at",
		"title":       "title",
		"content":     "content",
		"published":   "published",
		"category_id": "category_id",
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

func (s *PostService) Create(req *models.CreatePostRequest) (*models.Post, error) {
	item := &models.Post{
		Title:      req.Title,
		Content:    req.Content,
		Published:  req.Published,
		CategoryId: req.CategoryId,
	}

	if err := s.DB.Create(item).Error; err != nil {
		s.Logger.Error("failed to create post", logger.String("error", err.Error()))
		return nil, err
	}

	// Emit create event
	s.Emitter.Emit(CreatePostEvent, item)

	return s.GetById(item.Id)
}

func (s *PostService) Update(id uint, req *models.UpdatePostRequest) (*models.Post, error) {
	item := &models.Post{}
	if err := s.DB.First(item, id).Error; err != nil {
		s.Logger.Error("failed to find post for update",
			logger.String("error", err.Error()),
			logger.Int("id", int(id)))
		return nil, err
	}

	// Validate request
	if err := ValidatePostUpdateRequest(req, id); err != nil {
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
	if req.Published != nil {
		item.Published = *req.Published
	}
	// For non-pointer unsigned integer fields
	if req.CategoryId != 0 {
		item.CategoryId = req.CategoryId
	}

	if err := s.DB.Save(item).Error; err != nil {
		s.Logger.Error("failed to update post",
			logger.String("error", err.Error()),
			logger.Int("id", int(id)))
		return nil, err
	}

	// Handle many-to-many relationships

	result, err := s.GetById(item.Id)
	if err != nil {
		s.Logger.Error("failed to get updated post",
			logger.String("error", err.Error()),
			logger.Int("id", int(id)))
		return nil, err
	}

	// Emit update event
	s.Emitter.Emit(UpdatePostEvent, result)

	return result, nil
}

func (s *PostService) Delete(id uint) error {
	item := &models.Post{}
	if err := s.DB.First(item, id).Error; err != nil {
		s.Logger.Error("failed to find post for deletion",
			logger.String("error", err.Error()),
			logger.Int("id", int(id)))
		return err
	}

	// Delete file attachments if any

	if err := s.DB.Delete(item).Error; err != nil {
		s.Logger.Error("failed to delete post",
			logger.String("error", err.Error()),
			logger.Int("id", int(id)))
		return err
	}

	// Emit delete event
	s.Emitter.Emit(DeletePostEvent, item)

	return nil
}

func (s *PostService) GetById(id uint) (*models.Post, error) {
	item := &models.Post{}

	query := item.Preload(s.DB)
	if err := query.First(item, id).Error; err != nil {
		s.Logger.Error("failed to get post",
			logger.String("error", err.Error()),
			logger.Int("id", int(id)))
		return nil, err
	}

	return item, nil
}

func (s *PostService) GetAll(page *int, limit *int, sortBy *string, sortOrder *string) (*types.PaginatedResponse, error) {
	var items []*models.Post
	var total int64

	query := s.DB.Model(&models.Post{})
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
		s.Logger.Error("failed to count posts",
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
	// query = (&models.Post{}).Preload(query)

	// Execute query
	if err := query.Find(&items).Error; err != nil {
		s.Logger.Error("failed to get posts",
			logger.String("error", err.Error()))
		return nil, err
	}

	// Convert to response type
	responses := make([]*models.PostListResponse, len(items))
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
func (s *PostService) GetAllForSelect() ([]*models.Post, error) {
	var items []*models.Post

	query := s.DB.Model(&models.Post{})

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

package models

import (
	"time"

	"gorm.io/gorm"
)

// Article represents a article entity
type Article struct {
	Id        uint           `json:"id" gorm:"primarykey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
	Title     string         `json:"title"`
	Content   string         `json:"content"`
	Featured  bool           `json:"featured"`
	AuthorId  uint           `json:"author_id"`
}

// TableName returns the table name for the Article model
func (m *Article) TableName() string {
	return "articles"
}

// GetId returns the Id of the model
func (m *Article) GetId() uint {
	return m.Id
}

// GetModelName returns the model name
func (m *Article) GetModelName() string {
	return "article"
}

// CreateArticleRequest represents the request payload for creating a Article
type CreateArticleRequest struct {
	Title    string `json:"title"`
	Content  string `json:"content"`
	Featured bool   `json:"featured"`
	AuthorId uint   `json:"author_id"`
}

// UpdateArticleRequest represents the request payload for updating a Article
type UpdateArticleRequest struct {
	Title    string `json:"title,omitempty"`
	Content  string `json:"content,omitempty"`
	Featured *bool  `json:"featured,omitempty"`
	AuthorId uint   `json:"author_id,omitempty"`
}

// ArticleResponse represents the API response for Article
type ArticleResponse struct {
	Id        uint           `json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at"`
	Title     string         `json:"title"`
	Content   string         `json:"content"`
	Featured  bool           `json:"featured"`
	AuthorId  uint           `json:"author_id"`
}

// ArticleModelResponse represents a simplified response when this model is part of other entities
type ArticleModelResponse struct {
	Id    uint   `json:"id"`
	Title string `json:"title"`
}

// ArticleSelectOption represents a simplified response for select boxes and dropdowns
type ArticleSelectOption struct {
	Id   uint   `json:"id"`
	Name string `json:"name"` // From Title field
}

// ArticleListResponse represents the response for list operations (optimized for performance)
type ArticleListResponse struct {
	Id        uint           `json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at"`
	Title     string         `json:"title"`
	Content   string         `json:"content"`
	Featured  bool           `json:"featured"`
	AuthorId  uint           `json:"author_id"`
}

// ToResponse converts the model to an API response
func (m *Article) ToResponse() *ArticleResponse {
	if m == nil {
		return nil
	}
	response := &ArticleResponse{
		Id:        m.Id,
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
		DeletedAt: m.DeletedAt,
		Title:     m.Title,
		Content:   m.Content,
		Featured:  m.Featured,
		AuthorId:  m.AuthorId,
	}

	return response
}

// ToModelResponse converts the model to a simplified response for when it's part of other entities
func (m *Article) ToModelResponse() *ArticleModelResponse {
	if m == nil {
		return nil
	}
	return &ArticleModelResponse{
		Id:    m.Id,
		Title: m.Title,
	}
}

// ToSelectOption converts the model to a select option for dropdowns
func (m *Article) ToSelectOption() *ArticleSelectOption {
	if m == nil {
		return nil
	}
	displayName := m.Title

	return &ArticleSelectOption{
		Id:   m.Id,
		Name: displayName,
	}
}

// ToListResponse converts the model to a list response (without preloaded relationships for fast listing)
func (m *Article) ToListResponse() *ArticleListResponse {
	if m == nil {
		return nil
	}
	return &ArticleListResponse{
		Id:        m.Id,
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
		DeletedAt: m.DeletedAt,
		Title:     m.Title,
		Content:   m.Content,
		Featured:  m.Featured,
		AuthorId:  m.AuthorId,
	}
}

// Preload preloads all the model's relationships
func (m *Article) Preload(db *gorm.DB) *gorm.DB {
	query := db
	return query
}

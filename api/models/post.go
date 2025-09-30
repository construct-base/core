package models

import (
	"time"

	"gorm.io/gorm"
)

// Post represents a post entity
type Post struct {
	Id        uint           `json:"id" gorm:"primarykey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
	Title     string         `json:"title"`
	Content   string         `json:"content"`
	Published bool           `json:"published"`
}

// TableName returns the table name for the Post model
func (m *Post) TableName() string {
	return "posts"
}

// GetId returns the Id of the model
func (m *Post) GetId() uint {
	return m.Id
}

// GetModelName returns the model name
func (m *Post) GetModelName() string {
	return "post"
}

// CreatePostRequest represents the request payload for creating a Post
type CreatePostRequest struct {
	Title     string `json:"title"`
	Content   string `json:"content"`
	Published bool   `json:"published"`
}

// UpdatePostRequest represents the request payload for updating a Post
type UpdatePostRequest struct {
	Title     string `json:"title,omitempty"`
	Content   string `json:"content,omitempty"`
	Published *bool  `json:"published,omitempty"`
}

// PostResponse represents the API response for Post
type PostResponse struct {
	Id        uint           `json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at"`
	Title     string         `json:"title"`
	Content   string         `json:"content"`
	Published bool           `json:"published"`
}

// PostModelResponse represents a simplified response when this model is part of other entities
type PostModelResponse struct {
	Id    uint   `json:"id"`
	Title string `json:"title"`
}

// PostSelectOption represents a simplified response for select boxes and dropdowns
type PostSelectOption struct {
	Id   uint   `json:"id"`
	Name string `json:"name"` // From Title field
}

// PostListResponse represents the response for list operations (optimized for performance)
type PostListResponse struct {
	Id        uint           `json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at"`
	Title     string         `json:"title"`
	Content   string         `json:"content"`
	Published bool           `json:"published"`
}

// ToResponse converts the model to an API response
func (m *Post) ToResponse() *PostResponse {
	if m == nil {
		return nil
	}
	response := &PostResponse{
		Id:        m.Id,
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
		DeletedAt: m.DeletedAt,
		Title:     m.Title,
		Content:   m.Content,
		Published: m.Published,
	}

	return response
}

// ToModelResponse converts the model to a simplified response for when it's part of other entities
func (m *Post) ToModelResponse() *PostModelResponse {
	if m == nil {
		return nil
	}
	return &PostModelResponse{
		Id:    m.Id,
		Title: m.Title,
	}
}

// ToSelectOption converts the model to a select option for dropdowns
func (m *Post) ToSelectOption() *PostSelectOption {
	if m == nil {
		return nil
	}
	displayName := m.Title

	return &PostSelectOption{
		Id:   m.Id,
		Name: displayName,
	}
}

// ToListResponse converts the model to a list response (without preloaded relationships for fast listing)
func (m *Post) ToListResponse() *PostListResponse {
	if m == nil {
		return nil
	}
	return &PostListResponse{
		Id:        m.Id,
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
		DeletedAt: m.DeletedAt,
		Title:     m.Title,
		Content:   m.Content,
		Published: m.Published,
	}
}

// Preload preloads all the model's relationships
func (m *Post) Preload(db *gorm.DB) *gorm.DB {
	query := db
	return query
}

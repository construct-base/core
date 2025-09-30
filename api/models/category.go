package models

import (
	"time"

	"gorm.io/gorm"
)

// Category represents a category entity
type Category struct {
	Id          uint           `json:"id" gorm:"primarykey"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"deleted_at" gorm:"index"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Active      bool           `json:"active"`
}

// TableName returns the table name for the Category model
func (m *Category) TableName() string {
	return "categories"
}

// GetId returns the Id of the model
func (m *Category) GetId() uint {
	return m.Id
}

// GetModelName returns the model name
func (m *Category) GetModelName() string {
	return "category"
}

// CreateCategoryRequest represents the request payload for creating a Category
type CreateCategoryRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Active      bool   `json:"active"`
}

// UpdateCategoryRequest represents the request payload for updating a Category
type UpdateCategoryRequest struct {
	Name        string `json:"name,omitempty"`
	Description string `json:"description,omitempty"`
	Active      *bool  `json:"active,omitempty"`
}

// CategoryResponse represents the API response for Category
type CategoryResponse struct {
	Id          uint           `json:"id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"deleted_at"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Active      bool           `json:"active"`
}

// CategoryModelResponse represents a simplified response when this model is part of other entities
type CategoryModelResponse struct {
	Id   uint   `json:"id"`
	Name string `json:"name"`
}

// CategorySelectOption represents a simplified response for select boxes and dropdowns
type CategorySelectOption struct {
	Id   uint   `json:"id"`
	Name string `json:"name"` // From Name field
}

// CategoryListResponse represents the response for list operations (optimized for performance)
type CategoryListResponse struct {
	Id          uint           `json:"id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"deleted_at"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Active      bool           `json:"active"`
}

// ToResponse converts the model to an API response
func (m *Category) ToResponse() *CategoryResponse {
	if m == nil {
		return nil
	}
	response := &CategoryResponse{
		Id:          m.Id,
		CreatedAt:   m.CreatedAt,
		UpdatedAt:   m.UpdatedAt,
		DeletedAt:   m.DeletedAt,
		Name:        m.Name,
		Description: m.Description,
		Active:      m.Active,
	}

	return response
}

// ToModelResponse converts the model to a simplified response for when it's part of other entities
func (m *Category) ToModelResponse() *CategoryModelResponse {
	if m == nil {
		return nil
	}
	return &CategoryModelResponse{
		Id:   m.Id,
		Name: m.Name,
	}
}

// ToSelectOption converts the model to a select option for dropdowns
func (m *Category) ToSelectOption() *CategorySelectOption {
	if m == nil {
		return nil
	}
	displayName := m.Name

	return &CategorySelectOption{
		Id:   m.Id,
		Name: displayName,
	}
}

// ToListResponse converts the model to a list response (without preloaded relationships for fast listing)
func (m *Category) ToListResponse() *CategoryListResponse {
	if m == nil {
		return nil
	}
	return &CategoryListResponse{
		Id:          m.Id,
		CreatedAt:   m.CreatedAt,
		UpdatedAt:   m.UpdatedAt,
		DeletedAt:   m.DeletedAt,
		Name:        m.Name,
		Description: m.Description,
		Active:      m.Active,
	}
}

// Preload preloads all the model's relationships
func (m *Category) Preload(db *gorm.DB) *gorm.DB {
	query := db
	return query
}

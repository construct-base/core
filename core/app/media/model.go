package media

import (
	"mime/multipart"
	"time"

	"base/core/storage"

	"gorm.io/gorm"
)

// Media represents a media entity (can be file or folder)
type Media struct {
	Id          uint                `json:"id" gorm:"primaryKey"`
	Name        string              `json:"name" gorm:"column:name"`
	Type        string              `json:"type" gorm:"column:type"` // "file" or "folder"
	Description string              `json:"description" gorm:"column:description"`
	ParentId    *uint               `json:"parent_id,omitempty" gorm:"column:parent_id;index"`
	Parent      *Media              `json:"parent,omitempty" gorm:"foreignKey:ParentId"`
	Children    []*Media            `json:"children,omitempty" gorm:"foreignKey:ParentId"`
	File        *storage.Attachment `json:"file,omitempty" gorm:"polymorphic:Model"`
	Path        string              `json:"path" gorm:"column:path;index"` // Full path for quick navigation
	CreatedAt   time.Time           `json:"created_at"`
	UpdatedAt   time.Time           `json:"updated_at"`
	DeletedAt   gorm.DeletedAt      `json:"deleted_at" gorm:"index"`
}

// TableName returns the table name for the Media model
func (item *Media) TableName() string {
	return "media"
}

// GetId returns the Id of the model
func (item *Media) GetId() uint {
	return item.Id
}

// GetModelName returns the model name
func (item *Media) GetModelName() string {
	return "media"
}

// Preload preloads all the model's relationships
func (item *Media) Preload(db *gorm.DB) *gorm.DB {
	return db.Preload("Parent").Preload("Children")
}

// IsFolder checks if the media item is a folder
func (item *Media) IsFolder() bool {
	return item.Type == "folder"
}

// IsFile checks if the media item is a file
func (item *Media) IsFile() bool {
	return item.Type == "file"
}

// BuildPath builds the full path for the media item
func (item *Media) BuildPath(db *gorm.DB) string {
	if item.ParentId == nil {
		return "/" + item.Name
	}

	var parent Media
	if err := db.First(&parent, *item.ParentId).Error; err != nil {
		return "/" + item.Name
	}

	return parent.BuildPath(db) + "/" + item.Name
}

// MediaListResponse represents the list view response
type MediaListResponse struct {
	Id          uint                `json:"id"`
	CreatedAt   time.Time           `json:"created_at"`
	UpdatedAt   time.Time           `json:"updated_at"`
	Name        string              `json:"name"`
	Type        string              `json:"type"`
	Description string              `json:"description"`
	ParentId    *uint               `json:"parent_id,omitempty"`
	Path        string              `json:"path"`
	File        *storage.Attachment `json:"file,omitempty"`
	ChildCount  int                 `json:"child_count,omitempty"` // For folders
}

// MediaResponse represents the detailed view response
type MediaResponse struct {
	Id          uint                `json:"id"`
	CreatedAt   time.Time           `json:"created_at"`
	UpdatedAt   time.Time           `json:"updated_at"`
	DeletedAt   gorm.DeletedAt      `json:"deleted_at,omitempty"`
	Name        string              `json:"name"`
	Type        string              `json:"type"`
	Description string              `json:"description"`
	ParentId    *uint               `json:"parent_id,omitempty"`
	Parent      *MediaListResponse  `json:"parent,omitempty"`
	Path        string              `json:"path"`
	File        *storage.Attachment `json:"file,omitempty"`
	ChildCount  int                 `json:"child_count,omitempty"`
}

// MediaResponse represents the detailed view response
type MediaModelResponse struct {
	Id          uint                `json:"id"`
	CreatedAt   time.Time           `json:"created_at"`
	UpdatedAt   time.Time           `json:"updated_at"`
	DeletedAt   gorm.DeletedAt      `json:"deleted_at,omitempty"`
	Name        string              `json:"name"`
	Type        string              `json:"type"`
	Description string              `json:"description"`
	File        *storage.Attachment `json:"file,omitempty"`
}

// CreateMediaRequest represents the request payload for creating a Media
type CreateMediaRequest struct {
	Name        string                `form:"name" binding:"required"`
	Type        string                `form:"type" binding:"required"` // "file" or "folder"
	Description string                `form:"description"`
	ParentId    *uint                 `form:"parent_id"`
	File        *multipart.FileHeader `form:"file"` // Required for files, optional for folders
}

// CreateFolderRequest represents the request payload for creating a folder
type CreateFolderRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	ParentId    *uint  `json:"parent_id"`
}

// ShareMediaRequest represents the request payload for sharing media
type ShareMediaRequest struct {
	MediaId     uint     `json:"media_id" binding:"required"`
	UserIds     []uint   `json:"user_ids"`
	RoleIds     []uint   `json:"role_ids"`
	Permissions []string `json:"permissions" binding:"required"` // e.g., ["read", "update"]
}

// MediaShareResponse represents a media sharing response
type MediaShareResponse struct {
	Id          uint   `json:"id"`
	MediaId     uint   `json:"media_id"`
	UserId      *uint  `json:"user_id,omitempty"`
	RoleId      *uint  `json:"role_id,omitempty"`
	Permissions string `json:"permissions"`
	CreatedAt   string `json:"created_at"`
}

// UpdateMediaRequest represents the request payload for updating a Media
type UpdateMediaRequest struct {
	Name        *string               `form:"name"`
	Type        *string               `form:"type"`
	Description *string               `form:"description"`
	File        *multipart.FileHeader `form:"file"`
}

// ToListResponse converts the model to a list response
func (item *Media) ToListResponse() *MediaListResponse {
	childCount := 0
	if item.Type == "folder" {
		childCount = len(item.Children)
	}

	return &MediaListResponse{
		Id:          item.Id,
		CreatedAt:   item.CreatedAt,
		UpdatedAt:   item.UpdatedAt,
		Name:        item.Name,
		Type:        item.Type,
		Description: item.Description,
		ParentId:    item.ParentId,
		Path:        item.Path,
		File:        item.File,
		ChildCount:  childCount,
	}
}

// ToResponse converts the model to a detailed response
func (item *Media) ToResponse() *MediaResponse {
	childCount := 0
	if item.Type == "folder" {
		childCount = len(item.Children)
	}

	var parent *MediaListResponse
	if item.Parent != nil {
		parent = item.Parent.ToListResponse()
	}

	return &MediaResponse{
		Id:          item.Id,
		CreatedAt:   item.CreatedAt,
		UpdatedAt:   item.UpdatedAt,
		DeletedAt:   item.DeletedAt,
		Name:        item.Name,
		Type:        item.Type,
		Description: item.Description,
		ParentId:    item.ParentId,
		Parent:      parent,
		Path:        item.Path,
		File:        item.File,
		ChildCount:  childCount,
	}
}

// ToResponse converts the model to a detailed response
func (item *Media) ToModelResponse() *MediaModelResponse {
	return &MediaModelResponse{
		Id:          item.Id,
		CreatedAt:   item.CreatedAt,
		UpdatedAt:   item.UpdatedAt,
		DeletedAt:   item.DeletedAt,
		Name:        item.Name,
		Type:        item.Type,
		Description: item.Description,
		File:        item.File,
	}
}

var _ storage.Attachable = (*Media)(nil)

// GetAttachmentConfig returns the attachment configuration for the model
func (item *Media) GetAttachmentConfig() map[string]any {
	return map[string]any{
		"file": map[string]any{
			"path":       "media/:id/:filename",
			"validators": []string{"image", "audio"},
			"min_size":   1,                 // 1 byte
			"max_size":   100 * 1024 * 1024, // 100MB
		},
	}
}

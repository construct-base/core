package media

import (
	"context"
	"fmt"
	"math"
	"mime/multipart"
	"time"

	"base/core/emitter"
	"base/core/logger"
	"base/core/storage"
	"base/core/types"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type MediaService struct {
	DB            *gorm.DB
	Emitter       *emitter.Emitter
	ActiveStorage *storage.ActiveStorage
	Logger        logger.Logger
}

func NewMediaService(db *gorm.DB, emitter *emitter.Emitter, activeStorage *storage.ActiveStorage, logger logger.Logger) *MediaService {
	// Register file attachment configuration
	activeStorage.RegisterAttachment("media", storage.AttachmentConfig{
		Field:             "file",
		Path:              "media/files",
		AllowedExtensions: []string{".jpg", ".jpeg", ".png", ".mp3", ".webp", ".webv", ".wav", ".ogg"},
		MaxFileSize:       100 << 20, // 100MB
		Multiple:          false,
	})

	return &MediaService{
		DB:            db,
		Emitter:       emitter,
		ActiveStorage: activeStorage,
		Logger:        logger,
	}
}

// GetById returns a single media item by id
func (s *MediaService) GetById(id uint) (*Media, error) {
	var item Media

	if err := s.DB.First(&item, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("media not found")
		}
		s.Logger.Error("failed to get media", logger.String("error", err.Error()))
		return nil, fmt.Errorf("failed to get media: %w", err)
	}

	// Load relationships
	if err := s.DB.Preload(clause.Associations).First(&item, id).Error; err != nil {
		s.Logger.Error("failed to load media relationships", logger.String("error", err.Error()))
		return nil, fmt.Errorf("failed to load media relationships: %w", err)
	}

	return &item, nil
}

// GetByIds returns multiple media items by their IDs
func (s *MediaService) GetByIds(ids []uint) ([]*Media, error) {
	if len(ids) == 0 {
		return []*Media{}, nil
	}

	var items []*Media
	if err := s.DB.Where("id IN ?", ids).Preload(clause.Associations).Find(&items).Error; err != nil {
		s.Logger.Error("failed to get media by ids", logger.String("error", err.Error()))
		return nil, fmt.Errorf("failed to get media by ids: %w", err)
	}

	return items, nil
}

// GetAll returns a paginated list of media items
func (s *MediaService) GetAll(page, limit *int) (*types.PaginatedResponse, error) {
	var items []*Media
	var total int64

	// Get total count
	if err := s.DB.Model(&Media{}).Count(&total).Error; err != nil {
		s.Logger.Error("failed to count media", logger.String("error", err.Error()))
		return nil, fmt.Errorf("failed to count media: %w", err)
	}

	// Build query
	query := s.DB.Model(&Media{})

	// Add pagination if provided
	if page != nil && limit != nil {
		offset := (*page - 1) * *limit
		query = query.Offset(offset).Limit(*limit)
	}

	// Execute query with preloads
	if err := query.Preload(clause.Associations).Find(&items).Error; err != nil {
		s.Logger.Error("failed to get media", logger.String("error", err.Error()))
		return nil, fmt.Errorf("failed to get media: %w", err)
	}

	// Convert to response
	responses := make([]any, len(items))
	for i, item := range items {
		responses[i] = item.ToListResponse()
	}

	// Calculate pagination
	pageSize := 10
	currentPage := 1
	if limit != nil {
		pageSize = *limit
	}
	if page != nil {
		currentPage = *page
	}
	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))
	if totalPages == 0 {
		totalPages = 1
	}

	// Build paginated response
	return &types.PaginatedResponse{
		Data: responses,
		Pagination: types.Pagination{
			Total:      int(total),
			Page:       currentPage,
			PageSize:   pageSize,
			TotalPages: totalPages,
		},
	}, nil
}

// CreateFolder creates a new folder
func (s *MediaService) CreateFolder(req *CreateFolderRequest) (*Media, error) {
	// Begin transaction
	tx := s.DB.Begin()
	if tx.Error != nil {
		s.Logger.Error("failed to begin transaction", logger.String("error", tx.Error.Error()))
		return nil, fmt.Errorf("failed to begin transaction: %w", tx.Error)
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Validate parent folder if specified
	var parentPath string
	if req.ParentId != nil {
		var parent Media
		if err := tx.First(&parent, *req.ParentId).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("parent folder not found")
		}
		if parent.Type != "folder" {
			tx.Rollback()
			return nil, fmt.Errorf("parent must be a folder")
		}
		parentPath = parent.Path
	} else {
		parentPath = ""
	}

	// Create folder item
	folder := &Media{
		Name:        req.Name,
		Type:        "folder",
		Description: req.Description,
		ParentId:    req.ParentId,
		Path:        parentPath + "/" + req.Name,
	}

	if err := tx.Create(folder).Error; err != nil {
		tx.Rollback()
		s.Logger.Error("failed to create folder", logger.String("error", err.Error()))
		return nil, fmt.Errorf("failed to create folder: %w", err)
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		s.Logger.Error("failed to commit transaction", logger.String("error", err.Error()))
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	// Reload item with relationships
	return s.GetById(folder.Id)
}

// GetFolderContents returns the contents of a folder
func (s *MediaService) GetFolderContents(folderId uint, page, limit *int) (*types.PaginatedResponse, error) {
	var items []*Media
	var total int64

	// Get total count
	query := s.DB.Model(&Media{}).Where("parent_id = ?", folderId)
	if err := query.Count(&total).Error; err != nil {
		s.Logger.Error("failed to count folder contents", logger.String("error", err.Error()))
		return nil, fmt.Errorf("failed to count folder contents: %w", err)
	}

	// Build query with pagination
	if page != nil && limit != nil {
		offset := (*page - 1) * *limit
		query = query.Offset(offset).Limit(*limit)
	}

	// Execute query with preloads
	if err := query.Preload("File").Order("type DESC, name ASC").Find(&items).Error; err != nil {
		s.Logger.Error("failed to get folder contents", logger.String("error", err.Error()))
		return nil, fmt.Errorf("failed to get folder contents: %w", err)
	}

	// Convert to response
	responses := make([]any, len(items))
	for i, item := range items {
		responses[i] = item.ToListResponse()
	}

	// Calculate pagination
	pageSize := 10
	currentPage := 1
	if limit != nil {
		pageSize = *limit
	}
	if page != nil {
		currentPage = *page
	}
	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))
	if totalPages == 0 {
		totalPages = 1
	}

	return &types.PaginatedResponse{
		Data: responses,
		Pagination: types.Pagination{
			Total:      int(total),
			Page:       currentPage,
			PageSize:   pageSize,
			TotalPages: totalPages,
		},
	}, nil
}

// GetRootContents returns the contents of the root directory
func (s *MediaService) GetRootContents(page, limit *int) (*types.PaginatedResponse, error) {
	var items []*Media
	var total int64

	// Get total count
	query := s.DB.Model(&Media{}).Where("parent_id IS NULL")
	if err := query.Count(&total).Error; err != nil {
		s.Logger.Error("failed to count root contents", logger.String("error", err.Error()))
		return nil, fmt.Errorf("failed to count root contents: %w", err)
	}

	// Build query with pagination
	if page != nil && limit != nil {
		offset := (*page - 1) * *limit
		query = query.Offset(offset).Limit(*limit)
	}

	// Execute query with preloads
	if err := query.Preload("File").Order("type DESC, name ASC").Find(&items).Error; err != nil {
		s.Logger.Error("failed to get root contents", logger.String("error", err.Error()))
		return nil, fmt.Errorf("failed to get root contents: %w", err)
	}

	// Convert to response
	responses := make([]any, len(items))
	for i, item := range items {
		responses[i] = item.ToListResponse()
	}

	// Calculate pagination
	pageSize := 10
	currentPage := 1
	if limit != nil {
		pageSize = *limit
	}
	if page != nil {
		currentPage = *page
	}
	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))
	if totalPages == 0 {
		totalPages = 1
	}

	return &types.PaginatedResponse{
		Data: responses,
		Pagination: types.Pagination{
			Total:      int(total),
			Page:       currentPage,
			PageSize:   pageSize,
			TotalPages: totalPages,
		},
	}, nil
}

// Create creates a new media item
func (s *MediaService) Create(req *CreateMediaRequest) (*Media, error) {
	// Begin transaction
	tx := s.DB.Begin()
	if tx.Error != nil {
		s.Logger.Error("failed to begin transaction", logger.String("error", tx.Error.Error()))
		return nil, fmt.Errorf("failed to begin transaction: %w", tx.Error)
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Validate parent folder if specified
	var parentPath string
	if req.ParentId != nil {
		var parent Media
		if err := tx.First(&parent, *req.ParentId).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("parent folder not found")
		}
		if parent.Type != "folder" {
			tx.Rollback()
			return nil, fmt.Errorf("parent must be a folder")
		}
		parentPath = parent.Path
	} else {
		parentPath = ""
	}

	// Validate file type requirements
	if req.Type == "file" && req.File == nil {
		tx.Rollback()
		return nil, fmt.Errorf("file is required for file type media")
	}
	if req.Type == "folder" && req.File != nil {
		tx.Rollback()
		return nil, fmt.Errorf("folders cannot have files")
	}

	// Create media item
	item := &Media{
		Name:        req.Name,
		Type:        req.Type,
		Description: req.Description,
		ParentId:    req.ParentId,
		Path:        parentPath + "/" + req.Name,
	}

	if err := tx.Create(item).Error; err != nil {
		tx.Rollback()
		s.Logger.Error("failed to create media", logger.String("error", err.Error()))
		return nil, fmt.Errorf("failed to create media: %w", err)
	}

	// Handle file upload if provided
	if req.File != nil {
		// Upload the file using storage system
		attachment, err := s.ActiveStorage.Attach(item, "file", req.File)
		if err != nil {
			tx.Rollback()
			s.Logger.Error("failed to upload file", logger.String("error", err.Error()))
			return nil, fmt.Errorf("failed to upload file: %w", err)
		}

		// Update media with file information
		item.File = attachment
		if err := tx.Save(item).Error; err != nil {
			tx.Rollback()
			s.Logger.Error("failed to update media with file", logger.String("error", err.Error()))
			return nil, fmt.Errorf("failed to update media with file: %w", err)
		}
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		s.Logger.Error("failed to commit transaction", logger.String("error", err.Error()))
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	// Reload item with relationships
	return s.GetById(item.Id)
}

// Update updates a media item
func (s *MediaService) Update(id uint, req *UpdateMediaRequest) (*Media, error) {
	// Begin transaction
	tx := s.DB.Begin()
	if tx.Error != nil {
		s.Logger.Error("failed to begin transaction", logger.String("error", tx.Error.Error()))
		return nil, fmt.Errorf("failed to begin transaction: %w", tx.Error)
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Get existing item
	item, err := s.GetById(id)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	// Update fields if provided
	if req.Name != nil {
		item.Name = *req.Name
	}
	if req.Type != nil {
		item.Type = *req.Type
	}
	if req.Description != nil {
		item.Description = *req.Description
	}

	// Handle file update if provided
	if req.File != nil {
		// Remove existing file if any
		if item.File != nil {
			if err := s.ActiveStorage.Delete(item.File); err != nil {
				tx.Rollback()
				s.Logger.Error("failed to delete existing file", logger.String("error", err.Error()))
				return nil, fmt.Errorf("failed to delete existing file: %w", err)
			}
		}

		// Upload new file
		attachment, err := s.ActiveStorage.Attach(item, "file", req.File)
		if err != nil {
			tx.Rollback()
			s.Logger.Error("failed to upload file", logger.String("error", err.Error()))
			return nil, fmt.Errorf("failed to upload file: %w", err)
		}

		// Update media with new file information
		item.File = attachment
	}

	// Save changes
	if err := tx.Save(item).Error; err != nil {
		tx.Rollback()
		s.Logger.Error("failed to update media", logger.String("error", err.Error()))
		return nil, fmt.Errorf("failed to update media: %w", err)
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		s.Logger.Error("failed to commit transaction", logger.String("error", err.Error()))
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	// Reload item with relationships
	return s.GetById(id)
}

// Delete deletes a media item
func (s *MediaService) Delete(id uint) error {
	// Get existing item
	item, err := s.GetById(id)
	if err != nil {
		return err
	}

	// Begin transaction
	tx := s.DB.Begin()
	if tx.Error != nil {
		s.Logger.Error("failed to begin transaction", logger.String("error", tx.Error.Error()))
		return fmt.Errorf("failed to begin transaction: %w", tx.Error)
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Delete the file if it exists
	if item.File != nil {
		if err := s.ActiveStorage.Delete(item.File); err != nil {
			s.Logger.Error("failed to delete file", logger.String("error", err.Error()))
			return fmt.Errorf("failed to delete file: %w", err)
		}
	}

	// Delete the media item
	if err := tx.Delete(item).Error; err != nil {
		tx.Rollback()
		s.Logger.Error("failed to delete media", logger.String("error", err.Error()))
		return fmt.Errorf("failed to delete media: %w", err)
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		s.Logger.Error("failed to commit transaction", logger.String("error", err.Error()))
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// UpdateFile updates the file of a media item
func (s *MediaService) UpdateFile(ctx context.Context, id uint, file *multipart.FileHeader) (*Media, error) {
	// Begin transaction
	tx := s.DB.Begin()
	if tx.Error != nil {
		s.Logger.Error("failed to begin transaction", logger.String("error", tx.Error.Error()))
		return nil, fmt.Errorf("failed to begin transaction: %w", tx.Error)
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Get existing item
	item, err := s.GetById(id)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	// Remove existing file if any
	if item.File != nil {
		if err := s.ActiveStorage.Delete(item.File); err != nil {
			tx.Rollback()
			s.Logger.Error("failed to delete existing file", logger.String("error", err.Error()))
			return nil, fmt.Errorf("failed to delete existing file: %w", err)
		}
	}

	// Upload new file
	attachment, err := s.ActiveStorage.Attach(item, "file", file)
	if err != nil {
		tx.Rollback()
		s.Logger.Error("failed to upload file", logger.String("error", err.Error()))
		return nil, fmt.Errorf("failed to upload file: %w", err)
	}

	// Update media with new file information
	item.File = attachment
	if err := tx.Save(item).Error; err != nil {
		tx.Rollback()
		s.Logger.Error("failed to update media with file", logger.String("error", err.Error()))
		return nil, fmt.Errorf("failed to update media with file: %w", err)
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		s.Logger.Error("failed to commit transaction", logger.String("error", err.Error()))
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	// Reload item with relationships
	return s.GetById(id)
}

// RemoveFile removes the file from a media item
func (s *MediaService) RemoveFile(ctx context.Context, id uint) (*Media, error) {
	// Begin transaction
	tx := s.DB.Begin()
	if tx.Error != nil {
		s.Logger.Error("failed to begin transaction", logger.String("error", tx.Error.Error()))
		return nil, fmt.Errorf("failed to begin transaction: %w", tx.Error)
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Get existing item
	item, err := s.GetById(id)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	// Remove file if exists
	if item.File != nil {
		if err := s.ActiveStorage.Delete(item.File); err != nil {
			tx.Rollback()
			s.Logger.Error("failed to delete file", logger.String("error", err.Error()))
			return nil, fmt.Errorf("failed to delete file: %w", err)
		}

		// Update media item
		item.File = nil
		if err := tx.Save(item).Error; err != nil {
			tx.Rollback()
			s.Logger.Error("failed to update media", logger.String("error", err.Error()))
			return nil, fmt.Errorf("failed to update media: %w", err)
		}
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		s.Logger.Error("failed to commit transaction", logger.String("error", err.Error()))
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	// Reload item with relationships
	return s.GetById(id)
}

// ShareMedia creates resource permissions for sharing media with users or roles
func (s *MediaService) ShareMedia(req *ShareMediaRequest) error {
	// Begin transaction
	tx := s.DB.Begin()
	if tx.Error != nil {
		s.Logger.Error("failed to begin transaction", logger.String("error", tx.Error.Error()))
		return fmt.Errorf("failed to begin transaction: %w", tx.Error)
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Verify media exists
	var media Media
	if err := tx.First(&media, req.MediaId).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("media not found")
	}

	// Create resource permissions for users
	for _, userId := range req.UserIds {
		for _, permission := range req.Permissions {
			// Use raw SQL to insert resource permission
			result := tx.Exec(`
				INSERT INTO resource_permissions (resource_type, resource_id, user_id, action, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?)
				ON CONFLICT (resource_type, resource_id, user_id, action) DO NOTHING
			`, "media", req.MediaId, userId, permission, time.Now(), time.Now())

			if result.Error != nil {
				tx.Rollback()
				s.Logger.Error("failed to create user resource permission",
					logger.String("error", result.Error.Error()),
					logger.Uint("userId", userId),
					logger.String("permission", permission))
				return fmt.Errorf("failed to create user resource permission: %w", result.Error)
			}
		}
	}

	// Create resource permissions for roles
	for _, roleId := range req.RoleIds {
		for _, permission := range req.Permissions {
			// Use raw SQL to insert resource permission
			result := tx.Exec(`
				INSERT INTO resource_permissions (resource_type, resource_id, role_id, action, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?)
				ON CONFLICT (resource_type, resource_id, role_id, action) DO NOTHING
			`, "media", req.MediaId, roleId, permission, time.Now(), time.Now())

			if result.Error != nil {
				tx.Rollback()
				s.Logger.Error("failed to create role resource permission",
					logger.String("error", result.Error.Error()),
					logger.Uint("roleId", roleId),
					logger.String("permission", permission))
				return fmt.Errorf("failed to create role resource permission: %w", result.Error)
			}
		}
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		s.Logger.Error("failed to commit transaction", logger.String("error", err.Error()))
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// GetMediaShares returns the sharing information for a media item
func (s *MediaService) GetMediaShares(mediaId uint) ([]*MediaShareResponse, error) {
	var shares []*MediaShareResponse

	// Query resource permissions for this media
	rows, err := s.DB.Raw(`
		SELECT rp.id, rp.resource_id as media_id, rp.user_id, rp.role_id, rp.action as permissions, rp.created_at
		FROM resource_permissions rp
		WHERE rp.resource_type = ? AND rp.resource_id = ?
		ORDER BY rp.created_at DESC
	`, "media", mediaId).Rows()

	if err != nil {
		s.Logger.Error("failed to get media shares", logger.String("error", err.Error()))
		return nil, fmt.Errorf("failed to get media shares: %w", err)
	}
	defer rows.Close()

	shareMap := make(map[string]*MediaShareResponse)

	for rows.Next() {
		var share MediaShareResponse
		var createdAt time.Time

		if err := rows.Scan(&share.Id, &share.MediaId, &share.UserId, &share.RoleId, &share.Permissions, &createdAt); err != nil {
			s.Logger.Error("failed to scan media share", logger.String("error", err.Error()))
			continue
		}

		share.CreatedAt = createdAt.Format(time.RFC3339)

		// Create a unique key for this user/role combination
		var key string
		if share.UserId != nil {
			key = fmt.Sprintf("user:%d", *share.UserId)
		} else if share.RoleId != nil {
			key = fmt.Sprintf("role:%d", *share.RoleId)
		}

		// Aggregate permissions for the same user/role
		if existing, exists := shareMap[key]; exists {
			existing.Permissions += "," + share.Permissions
		} else {
			shareMap[key] = &share
		}
	}

	// Convert map to slice
	for _, share := range shareMap {
		shares = append(shares, share)
	}

	return shares, nil
}

// UnshareMedia removes resource permissions for a media item
func (s *MediaService) UnshareMedia(mediaId uint, userId *uint, roleId *uint) error {
	// Begin transaction
	tx := s.DB.Begin()
	if tx.Error != nil {
		s.Logger.Error("failed to begin transaction", logger.String("error", tx.Error.Error()))
		return fmt.Errorf("failed to begin transaction: %w", tx.Error)
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Delete resource permissions
	result := tx.Exec(`
		DELETE FROM resource_permissions
		WHERE resource_type = ? AND resource_id = ?
		AND (user_id = ? OR role_id = ?)
	`, "media", mediaId, userId, roleId)

	if result.Error != nil {
		tx.Rollback()
		s.Logger.Error("failed to delete resource permissions", logger.String("error", result.Error.Error()))
		return fmt.Errorf("failed to delete resource permissions: %w", result.Error)
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		s.Logger.Error("failed to commit transaction", logger.String("error", err.Error()))
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}


package users

import (
	"base/core/logger"
	"base/core/storage"
	"base/core/types"
	"context"
	"errors"
	"fmt"
	"math"
	"mime/multipart"
	"strings"

	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserService struct {
	db            *gorm.DB
	logger        logger.Logger
	activeStorage *storage.ActiveStorage
}

func NewUserService(db *gorm.DB, logger logger.Logger, activeStorage *storage.ActiveStorage) *UserService {
	if db == nil {
		panic("db is required")
	}
	if logger == nil {
		panic("logger is required")
	}
	if activeStorage == nil {
		panic("activeStorage is required")
	}

	// Register avatar attachment configuration
	activeStorage.RegisterAttachment("users", storage.AttachmentConfig{
		Field:             "avatar",
		Path:              "avatars",
		AllowedExtensions: []string{".jpg", ".jpeg", ".png", ".gif"},
		MaxFileSize:       5 << 20, // 5MB
		Multiple:          false,
	})

	return &UserService{
		db:            db,
		logger:        logger,
		activeStorage: activeStorage,
	}
}

// GetAll returns a paginated list of users with optional filtering
func (s *UserService) GetAll(filters *UserFilters) (*types.PaginatedResponse, error) {
	var users []*User
	var total int64

	// Build base query
	query := s.db.Model(&User{}).Preload("Role")

	// Apply filters
	if filters != nil {
		if filters.Search != "" {
			searchTerm := "%" + strings.ToLower(filters.Search) + "%"
			query = query.Where(
				"LOWER(first_name) LIKE ? OR LOWER(last_name) LIKE ? OR LOWER(username) LIKE ? OR LOWER(email) LIKE ?",
				searchTerm, searchTerm, searchTerm, searchTerm,
			)
		}
		if filters.RoleId != nil {
			query = query.Where("role_id = ?", *filters.RoleId)
		}
	}

	// Get total count
	if err := query.Count(&total).Error; err != nil {
		s.logger.Error("failed to count users", logger.String("error", err.Error()))
		return nil, fmt.Errorf("failed to count users: %w", err)
	}

	// Set defaults for pagination
	page := 1
	limit := 10
	if filters != nil {
		if filters.Page > 0 {
			page = filters.Page
		}
		if filters.Limit > 0 {
			limit = filters.Limit
		}
	}

	// Apply pagination
	offset := (page - 1) * limit
	query = query.Offset(offset).Limit(limit)

	// Execute query
	if err := query.Find(&users).Error; err != nil {
		s.logger.Error("failed to get users", logger.String("error", err.Error()))
		return nil, fmt.Errorf("failed to get users: %w", err)
	}

	// Convert to response
	responses := make([]any, len(users))
	for i, user := range users {
		responses[i] = user.ToListResponse()
	}

	// Calculate pagination
	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	if totalPages == 0 {
		totalPages = 1
	}

	return &types.PaginatedResponse{
		Data: responses,
		Pagination: types.Pagination{
			Total:      int(total),
			Page:       page,
			PageSize:   limit,
			TotalPages: totalPages,
		},
	}, nil
}

// GetById returns a single user by id
func (s *UserService) GetById(id uint) (*User, error) {
	var user User

	if err := s.db.Preload("Role").First(&user, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			s.logger.Error("User not found", logger.Uint("user_id", id))
			return nil, fmt.Errorf("user not found")
		}
		s.logger.Error("Database error while fetching user", logger.Uint("user_id", id), logger.String("error", err.Error()))
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return &user, nil
}

// Create creates a new user
func (s *UserService) Create(req *CreateUserRequest) (*User, error) {
	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		s.logger.Error("Failed to hash password", zap.Error(err))
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create user
	user := &User{
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Username:  req.Username,
		Phone:     req.Phone,
		Email:     req.Email,
		Password:  string(hashedPassword),
		RoleId:    3, // Default role
	}

	// Set role if provided
	if req.RoleId != nil {
		user.RoleId = *req.RoleId
	}

	if err := s.db.Create(user).Error; err != nil {
		s.logger.Error("Failed to create user", zap.Error(err))
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Reload user with relationships
	return s.GetById(user.Id)
}

// Update updates a user
func (s *UserService) Update(id uint, req *UpdateUserRequest) (*User, error) {
	user, err := s.GetById(id)
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if req.FirstName != "" {
		user.FirstName = req.FirstName
	}
	if req.LastName != "" {
		user.LastName = req.LastName
	}
	if req.Username != "" {
		user.Username = req.Username
	}
	if req.Phone != "" {
		user.Phone = req.Phone
	}
	if req.Email != "" {
		user.Email = req.Email
	}
	if req.RoleId != nil {
		user.RoleId = *req.RoleId
	}

	if err := s.db.Save(user).Error; err != nil {
		s.logger.Error("Failed to save user updates", zap.Error(err), zap.Uint("user_id", id))
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	// Reload user with relationships
	return s.GetById(id)
}

// Delete deletes a user
func (s *UserService) Delete(id uint) error {
	user, err := s.GetById(id)
	if err != nil {
		return err
	}

	// Begin transaction
	tx := s.db.Begin()
	if tx.Error != nil {
		s.logger.Error("failed to begin transaction", logger.String("error", tx.Error.Error()))
		return fmt.Errorf("failed to begin transaction: %w", tx.Error)
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Delete avatar if exists
	// if user.Avatar != nil {
	// 	if err := s.activeStorage.Delete(user.Avatar); err != nil {
	// 		tx.Rollback()
	// 		s.logger.Error("Failed to delete avatar", zap.Error(err), zap.Uint("user_id", id))
	// 		return fmt.Errorf("failed to delete avatar: %w", err)
	// 	}
	// }

	// Delete the user
	if err := tx.Delete(user).Error; err != nil {
		tx.Rollback()
		s.logger.Error("Failed to delete user", zap.Error(err), zap.Uint("user_id", id))
		return fmt.Errorf("failed to delete user: %w", err)
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		s.logger.Error("failed to commit transaction", logger.String("error", err.Error()))
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// UpdateAvatar updates a user's avatar
func (s *UserService) UpdateAvatar(ctx context.Context, id uint, avatarFile *multipart.FileHeader) (*User, error) {
	user, err := s.GetById(id)
	if err != nil {
		return nil, err
	}

	// Just attach the new file - cleanup is handled inside Attach
	_, err = s.activeStorage.Attach(user, "avatar", avatarFile)
	if err != nil {
		return nil, fmt.Errorf("failed to upload avatar: %w", err)
	}

	// Update user's avatar
	// user.Avatar = attachment
	if err := s.db.Save(user).Error; err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	// Reload user with relationships
	return s.GetById(id)
}

// RemoveAvatar removes a user's avatar
func (s *UserService) RemoveAvatar(ctx context.Context, id uint) (*User, error) {
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	_, err := s.GetById(id)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	// if user.Avatar != nil {
	// 	if err := s.activeStorage.Delete(user.Avatar); err != nil {
	// 		tx.Rollback()
	// 		s.logger.Error("Failed to delete avatar", zap.Error(err), zap.Uint("user_id", id))
	// 		return nil, fmt.Errorf("failed to delete avatar: %w", err)
	// 	}
	// 	user.Avatar = nil
	// 	if err := tx.Save(user).Error; err != nil {
	// 		tx.Rollback()
	// 		return nil, err
	// 	}
	// }

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	// Reload user with relationships
	return s.GetById(id)
}

// Search searches for users based on search term
func (s *UserService) Search(searchTerm string, page, limit int) (*types.PaginatedResponse, error) {
	filters := &UserFilters{
		Search: searchTerm,
		Page:   page,
		Limit:  limit,
	}
	return s.GetAll(filters)
}

// GetByRole returns users by role ID
func (s *UserService) GetByRole(roleId uint, page, limit int) (*types.PaginatedResponse, error) {
	filters := &UserFilters{
		RoleId: &roleId,
		Page:   page,
		Limit:  limit,
	}
	return s.GetAll(filters)
}

// GetByIds returns multiple users by their IDs
func (s *UserService) GetByIds(ids []uint) ([]*User, error) {
	if len(ids) == 0 {
		return []*User{}, nil
	}

	var users []*User
	if err := s.db.Where("id IN ?", ids).Preload("Role").Find(&users).Error; err != nil {
		s.logger.Error("failed to get users by ids", logger.String("error", err.Error()))
		return nil, fmt.Errorf("failed to get users by ids: %w", err)
	}

	return users, nil
}

// UpdatePassword updates a user's password
func (s *UserService) UpdatePassword(id uint, req *UpdatePasswordRequest) error {
	// Hash the new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		s.logger.Error("failed to hash password", logger.String("error", err.Error()))
		return fmt.Errorf("failed to hash password: %w", err)
	}

	// Update password in database
	result := s.db.Model(&User{}).Where("id = ?", id).Update("password", string(hashedPassword))
	if result.Error != nil {
		s.logger.Error("failed to update password", logger.Uint("user_id", id), logger.String("error", result.Error.Error()))
		return fmt.Errorf("failed to update password: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	s.logger.Info("password updated successfully", logger.Uint("user_id", id))
	return nil
}

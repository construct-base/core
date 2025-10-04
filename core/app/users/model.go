package users

import (
	"base/core/app/authorization"
	"base/core/storage"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	Id        uint                `gorm:"column:id;primary_key;auto_increment"`
	FirstName string              `gorm:"column:first_name;not null;size:255"`
	LastName  string              `gorm:"column:last_name;not null;size:255"`
	Username  string              `gorm:"column:username;unique;not null;size:255"`
	Phone     string              `gorm:"column:phone;unique;size:255"`
	Email     string              `gorm:"column:email;unique;not null;size:255"`
	RoleId    uint                `gorm:"column:role_id;default:3"`
	Role      *authorization.Role `gorm:"foreignKey:RoleId"`
	Avatar    *storage.Attachment `gorm:"ModelType:users;ModelId:id;Field:avatar"` // Temporarily disabled due to GORM issues
	Password  string              `gorm:"column:password;size:255"`
	LastLogin *time.Time          `gorm:"column:last_login"`
	CreatedAt time.Time           `gorm:"column:created_at"`
	UpdatedAt time.Time           `gorm:"column:updated_at"`
	DeletedAt gorm.DeletedAt      `gorm:"column:deleted_at"`
}

func (User) TableName() string {
	return "users"
}

// BeforeCreate hook to hash password before creating user
func (u *User) BeforeCreate(tx *gorm.DB) error {
	// Only hash if password is not empty and not already hashed
	if u.Password != "" && len(u.Password) < 60 {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		u.Password = string(hashedPassword)
	}
	return nil
}

type CreateUserRequest struct {
	FirstName string `json:"first_name" binding:"required,max=255"`
	LastName  string `json:"last_name" binding:"required,max=255"`
	Username  string `json:"username" binding:"required,max=255"`
	Phone     string `json:"phone" binding:"max=255"`
	Email     string `json:"email" binding:"required,email,max=255"`
	Password  string `json:"password" binding:"required,min=8,max=255"`
	RoleId    *uint  `json:"role_id"`
}

type UpdateUserRequest struct {
	FirstName string `form:"first_name" binding:"max=255"`
	LastName  string `form:"last_name" binding:"max=255"`
	Username  string `form:"username" binding:"max=255"`
	Phone     string `form:"phone" binding:"max=255"`
	Email     string `form:"email" binding:"email,max=255"`
	RoleId    *uint  `form:"role_id"`
}

type UpdatePasswordRequest struct {
	Password string `json:"password" binding:"required,min=8,max=255"`
}

type UserFilters struct {
	Search string `form:"search"`
	RoleId *uint  `form:"role_id"`
	Page   int    `form:"page"`
	Limit  int    `form:"limit"`
}

// Implement the Attachable interface
func (u *User) GetId() uint {
	return u.Id
}

func (u *User) GetModelName() string {
	return "users"
}

// UserResponse represents the API response structure
type UserResponse struct {
	Id        uint   `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Username  string `json:"username"`
	Phone     string `json:"phone"`
	Email     string `json:"email"`
	RoleId    uint   `json:"role_id"`
	RoleName  string `json:"role_name"`
	AvatarURL string `json:"avatar_url"`
	LastLogin string `json:"last_login"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

// UserListResponse represents the list view response
type UserListResponse struct {
	Id        uint   `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Username  string `json:"username"`
	Phone     string `json:"phone"`
	Email     string `json:"email"`
	RoleId    uint   `json:"role_id"`
	RoleName  string `json:"role_name"`
	AvatarURL string `json:"avatar_url"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

// ToResponse converts the User to a UserResponse
func (u *User) ToResponse() *UserResponse {
	if u == nil {
		return nil
	}
	response := &UserResponse{
		Id:        u.Id,
		FirstName: u.FirstName,
		LastName:  u.LastName,
		Username:  u.Username,
		Phone:     u.Phone,
		Email:     u.Email,
		RoleId:    u.RoleId,
		CreatedAt: u.CreatedAt.Format(time.RFC3339),
		UpdatedAt: u.UpdatedAt.Format(time.RFC3339),
	}

	// Include role name if role relationship is loaded
	if u.Role != nil {
		response.RoleName = u.Role.Name
	}

	if u.Avatar != nil {
		response.AvatarURL = u.Avatar.URL
	}

	if u.LastLogin != nil {
		response.LastLogin = u.LastLogin.Format(time.RFC3339)
	}

	return response
}

// ToListResponse converts the User to a UserListResponse
func (u *User) ToListResponse() *UserListResponse {
	if u == nil {
		return nil
	}
	response := &UserListResponse{
		Id:        u.Id,
		FirstName: u.FirstName,
		LastName:  u.LastName,
		Username:  u.Username,
		Phone:     u.Phone,
		Email:     u.Email,
		RoleId:    u.RoleId,
		CreatedAt: u.CreatedAt.Format(time.RFC3339),
		UpdatedAt: u.UpdatedAt.Format(time.RFC3339),
	}

	// Include role name if role relationship is loaded
	if u.Role != nil {
		response.RoleName = u.Role.Name
	}

	if u.Avatar != nil {
		response.AvatarURL = u.Avatar.URL
	}

	return response
}

// UserModelResponse represents a simplified response when User is part of other entities
type UserModelResponse struct {
	Id        uint   `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Username  string `json:"username"`
	Phone     string `json:"phone"`
	Email     string `json:"email"`
}

// ToModelResponse converts the model to a simplified response for when it's part of other entities
func (u *User) ToModelResponse() *UserModelResponse {
	if u == nil {
		return nil
	}
	return &UserModelResponse{
		Id:        u.Id,
		FirstName: u.FirstName,
		LastName:  u.LastName,
		Username:  u.Username,
		Phone:     u.Phone,
		Email:     u.Email,
	}
}

// Preload preloads all the model's relationships
func (u *User) Preload(db *gorm.DB) *gorm.DB {
	return db.Preload("Role")
}

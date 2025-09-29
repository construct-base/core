package users

import (
	"base/core/logger"
	"base/core/router"
	"base/core/types"
	"errors"
	"net/http"
	"strconv"

	"gorm.io/gorm"
)

type UserController struct {
	service *UserService
	logger  logger.Logger
}

func NewUserController(service *UserService, logger logger.Logger) *UserController {
	return &UserController{
		service: service,
		logger:  logger,
	}
}

func (c *UserController) Routes(router *router.RouterGroup) {
	// Main CRUD endpoints
	router.GET("/users", c.List)
	router.POST("/users", c.Create)

	// Specific endpoints (must come before :id routes)
	router.GET("/users/search", c.Search)
	router.GET("/users/role/:role_id", c.GetByRole)

	// Profile endpoints for current user
	router.GET("/users/me", c.GetProfile)
	router.PUT("/users/me", c.UpdateProfile)
	router.PUT("/users/me/avatar", c.UpdateProfileAvatar)
	router.PUT("/users/me/password", c.UpdateProfilePassword)

	// Parameterized routes (must come last)
	router.GET("/users/:id", c.Get)
	router.PUT("/users/:id", c.Update)
	router.DELETE("/users/:id", c.Delete)

	// Avatar management endpoints
	router.PUT("/users/:id/avatar", c.UpdateAvatar)
	router.DELETE("/users/:id/avatar", c.RemoveAvatar)
}

// List godoc
// @Summary List users
// @Description Get a paginated list of users with optional filtering
// @Tags Core/Users
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param search query string false "Search term (searches name, username, email)"
// @Param role_id query int false "Filter by role ID"
// @Success 200 {object} types.PaginatedResponse
// @Failure 400 {object} types.ErrorResponse
// @Failure 500 {object} types.ErrorResponse
// @Router /users [get]
// @Security ApiKeyAuth
// @Security BearerAuth
func (c *UserController) List(ctx *router.Context) error {
	var filters UserFilters
	if err := ctx.BindQuery(&filters); err != nil {
		return ctx.JSON(http.StatusBadRequest, types.ErrorResponse{Error: "Invalid query parameters: " + err.Error()})
	}

	// Set defaults
	if filters.Page <= 0 {
		filters.Page = 1
	}
	if filters.Limit <= 0 {
		filters.Limit = 10
	}

	result, err := c.service.GetAll(&filters)
	if err != nil {
		c.logger.Error("Failed to list users", logger.String("error", err.Error()))
		return ctx.JSON(http.StatusInternalServerError, types.ErrorResponse{Error: "Failed to fetch users"})
	}

	return ctx.JSON(http.StatusOK, result)
}

// Get godoc
// @Summary Get a user
// @Description Get a user by ID
// @Tags Core/Users
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {object} UserResponse
// @Failure 400 {object} types.ErrorResponse
// @Failure 404 {object} types.ErrorResponse
// @Failure 500 {object} types.ErrorResponse
// @Router /users/{id} [get]
// @Security ApiKeyAuth
// @Security BearerAuth
func (c *UserController) Get(ctx *router.Context) error {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, types.ErrorResponse{Error: "Invalid ID format"})
	}

	user, err := c.service.GetById(uint(id))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) || err.Error() == "user not found" {
			return ctx.JSON(http.StatusNotFound, types.ErrorResponse{Error: "User not found"})
		}
		c.logger.Error("Failed to get user", logger.Uint("user_id", uint(id)), logger.String("error", err.Error()))
		return ctx.JSON(http.StatusInternalServerError, types.ErrorResponse{Error: "Failed to fetch user"})
	}

	return ctx.JSON(http.StatusOK, user.ToResponse())
}

// Create godoc
// @Summary Create a user
// @Description Create a new user
// @Tags Core/Users
// @Accept json
// @Produce json
// @Param input body CreateUserRequest true "Create User Request"
// @Success 201 {object} UserResponse
// @Failure 400 {object} types.ErrorResponse
// @Failure 500 {object} types.ErrorResponse
// @Router /users [post]
// @Security ApiKeyAuth
// @Security BearerAuth
func (c *UserController) Create(ctx *router.Context) error {
	var req CreateUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, types.ErrorResponse{Error: "Invalid input: " + err.Error()})
	}

	user, err := c.service.Create(&req)
	if err != nil {
		c.logger.Error("Failed to create user", logger.String("error", err.Error()))
		return ctx.JSON(http.StatusInternalServerError, types.ErrorResponse{Error: "Failed to create user: " + err.Error()})
	}

	return ctx.JSON(http.StatusCreated, user.ToResponse())
}

// Update godoc
// @Summary Update a user
// @Description Update a user's details
// @Tags Core/Users
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Param input body UpdateUserRequest true "Update User Request"
// @Success 200 {object} UserResponse
// @Failure 400 {object} types.ErrorResponse
// @Failure 404 {object} types.ErrorResponse
// @Failure 500 {object} types.ErrorResponse
// @Router /users/{id} [put]
// @Security ApiKeyAuth
// @Security BearerAuth
func (c *UserController) Update(ctx *router.Context) error {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, types.ErrorResponse{Error: "Invalid ID format"})
	}

	var req UpdateUserRequest
	if err := ctx.ShouldBind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, types.ErrorResponse{Error: "Invalid input: " + err.Error()})
	}

	user, err := c.service.Update(uint(id), &req)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) || err.Error() == "user not found" {
			return ctx.JSON(http.StatusNotFound, types.ErrorResponse{Error: "User not found"})
		}
		c.logger.Error("Failed to update user", logger.Uint("user_id", uint(id)), logger.String("error", err.Error()))
		return ctx.JSON(http.StatusInternalServerError, types.ErrorResponse{Error: "Failed to update user: " + err.Error()})
	}

	return ctx.JSON(http.StatusOK, user.ToResponse())
}

// Delete godoc
// @Summary Delete a user
// @Description Delete a user and their associated avatar
// @Tags Core/Users
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Success 204 "No Content"
// @Failure 400 {object} types.ErrorResponse
// @Failure 404 {object} types.ErrorResponse
// @Failure 500 {object} types.ErrorResponse
// @Router /users/{id} [delete]
// @Security ApiKeyAuth
// @Security BearerAuth
func (c *UserController) Delete(ctx *router.Context) error {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, types.ErrorResponse{Error: "Invalid ID format"})
	}

	if err := c.service.Delete(uint(id)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) || err.Error() == "user not found" {
			return ctx.JSON(http.StatusNotFound, types.ErrorResponse{Error: "User not found"})
		}
		c.logger.Error("Failed to delete user", logger.Uint("user_id", uint(id)), logger.String("error", err.Error()))
		return ctx.JSON(http.StatusInternalServerError, types.ErrorResponse{Error: "Failed to delete user"})
	}

	ctx.Status(http.StatusNoContent)
	return nil
}

// UpdateAvatar godoc
// @Summary Update user avatar
// @Description Update a user's avatar image
// @Tags Core/Users
// @Accept multipart/form-data
// @Produce json
// @Param id path int true "User ID"
// @Param avatar formData file true "Avatar file"
// @Success 200 {object} UserResponse
// @Failure 400 {object} types.ErrorResponse
// @Failure 404 {object} types.ErrorResponse
// @Failure 500 {object} types.ErrorResponse
// @Router /users/{id}/avatar [put]
// @Security ApiKeyAuth
// @Security BearerAuth
func (c *UserController) UpdateAvatar(ctx *router.Context) error {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, types.ErrorResponse{Error: "Invalid ID format"})
	}

	file, err := ctx.FormFile("avatar")
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, types.ErrorResponse{Error: "Failed to get avatar file: " + err.Error()})
	}

	user, err := c.service.UpdateAvatar(ctx, uint(id), file)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) || err.Error() == "user not found" {
			return ctx.JSON(http.StatusNotFound, types.ErrorResponse{Error: "User not found"})
		}
		c.logger.Error("Failed to update avatar", logger.Uint("user_id", uint(id)), logger.String("error", err.Error()))
		return ctx.JSON(http.StatusInternalServerError, types.ErrorResponse{Error: "Failed to update avatar: " + err.Error()})
	}

	return ctx.JSON(http.StatusOK, user.ToResponse())
}

// RemoveAvatar godoc
// @Summary Remove user avatar
// @Description Remove a user's avatar image
// @Tags Core/Users
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {object} UserResponse
// @Failure 400 {object} types.ErrorResponse
// @Failure 404 {object} types.ErrorResponse
// @Failure 500 {object} types.ErrorResponse
// @Router /users/{id}/avatar [delete]
// @Security ApiKeyAuth
// @Security BearerAuth
func (c *UserController) RemoveAvatar(ctx *router.Context) error {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, types.ErrorResponse{Error: "Invalid ID format"})
	}

	user, err := c.service.RemoveAvatar(ctx, uint(id))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) || err.Error() == "user not found" {
			return ctx.JSON(http.StatusNotFound, types.ErrorResponse{Error: "User not found"})
		}
		c.logger.Error("Failed to remove avatar", logger.Uint("user_id", uint(id)), logger.String("error", err.Error()))
		return ctx.JSON(http.StatusInternalServerError, types.ErrorResponse{Error: "Failed to remove avatar"})
	}

	return ctx.JSON(http.StatusOK, user.ToResponse())
}

// Search godoc
// @Summary Search users
// @Description Search users by name, username, or email
// @Tags Core/Users
// @Accept json
// @Produce json
// @Param q query string true "Search query"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Success 200 {object} types.PaginatedResponse
// @Failure 400 {object} types.ErrorResponse
// @Failure 500 {object} types.ErrorResponse
// @Router /users/search [get]
// @Security ApiKeyAuth
// @Security BearerAuth
func (c *UserController) Search(ctx *router.Context) error {
	query := ctx.Query("q")
	if query == "" {
		return ctx.JSON(http.StatusBadRequest, types.ErrorResponse{Error: "Search query is required"})
	}

	page := 1
	limit := 10

	if pageStr := ctx.Query("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	if limitStr := ctx.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	result, err := c.service.Search(query, page, limit)
	if err != nil {
		c.logger.Error("Failed to search users", logger.String("query", query), logger.String("error", err.Error()))
		return ctx.JSON(http.StatusInternalServerError, types.ErrorResponse{Error: "Failed to search users"})
	}

	return ctx.JSON(http.StatusOK, result)
}

// GetByRole godoc
// @Summary Get users by role
// @Description Get users filtered by role ID
// @Tags Core/Users
// @Accept json
// @Produce json
// @Param role_id path int true "Role ID"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Success 200 {object} types.PaginatedResponse
// @Failure 400 {object} types.ErrorResponse
// @Failure 500 {object} types.ErrorResponse
// @Router /users/role/{role_id} [get]
// @Security ApiKeyAuth
// @Security BearerAuth
func (c *UserController) GetByRole(ctx *router.Context) error {
	roleId, err := strconv.ParseUint(ctx.Param("role_id"), 10, 32)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, types.ErrorResponse{Error: "Invalid role ID format"})
	}

	page := 1
	limit := 10

	if pageStr := ctx.Query("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	if limitStr := ctx.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	result, err := c.service.GetByRole(uint(roleId), page, limit)
	if err != nil {
		c.logger.Error("Failed to get users by role", logger.Uint("role_id", uint(roleId)), logger.String("error", err.Error()))
		return ctx.JSON(http.StatusInternalServerError, types.ErrorResponse{Error: "Failed to fetch users by role"})
	}

	return ctx.JSON(http.StatusOK, result)
}

// Profile endpoints for current user

// GetProfile godoc
// @Summary Get current user profile
// @Description Get profile from authenticated user token
// @Tags Core/Users
// @Accept json
// @Produce json
// @Success 200 {object} UserResponse
// @Failure 400 {object} types.ErrorResponse
// @Failure 404 {object} types.ErrorResponse
// @Failure 500 {object} types.ErrorResponse
// @Router /users/me [get]
// @Security ApiKeyAuth
// @Security BearerAuth
func (c *UserController) GetProfile(ctx *router.Context) error {
	id := ctx.GetUint("user_id")
	c.logger.Debug("Getting user profile", logger.Uint("user_id", id))
	if id == 0 {
		return ctx.JSON(http.StatusBadRequest, types.ErrorResponse{Error: "Invalid user ID"})
	}

	user, err := c.service.GetById(uint(id))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ctx.JSON(http.StatusNotFound, types.ErrorResponse{Error: "User not found"})
		}
		c.logger.Error("Failed to get user profile", logger.Uint("user_id", id))
		return ctx.JSON(http.StatusInternalServerError, types.ErrorResponse{Error: "Failed to fetch user profile"})
	}

	return ctx.JSON(http.StatusOK, user.ToResponse())
}

// UpdateProfile godoc
// @Summary Update current user profile
// @Description Update profile details for authenticated user
// @Tags Core/Users
// @Accept json
// @Produce json
// @Param input body UpdateUserRequest true "Update Profile Request"
// @Success 200 {object} UserResponse
// @Failure 400 {object} types.ErrorResponse
// @Failure 404 {object} types.ErrorResponse
// @Failure 500 {object} types.ErrorResponse
// @Router /users/me [put]
// @Security ApiKeyAuth
// @Security BearerAuth
func (c *UserController) UpdateProfile(ctx *router.Context) error {
	id := ctx.GetUint("user_id")
	if id == 0 {
		return ctx.JSON(http.StatusBadRequest, types.ErrorResponse{Error: "Invalid user ID"})
	}

	var req UpdateUserRequest
	if err := ctx.ShouldBind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, types.ErrorResponse{Error: "Invalid input: " + err.Error()})
	}

	user, err := c.service.Update(uint(id), &req)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ctx.JSON(http.StatusNotFound, types.ErrorResponse{Error: "User not found"})
		}
		c.logger.Error("Failed to update user profile", logger.Uint("user_id", id), logger.String("error", err.Error()))
		return ctx.JSON(http.StatusInternalServerError, types.ErrorResponse{Error: "Failed to update profile: " + err.Error()})
	}

	return ctx.JSON(http.StatusOK, user.ToResponse())
}

// UpdateProfileAvatar godoc
// @Summary Update current user avatar
// @Description Update avatar for authenticated user
// @Tags Core/Users
// @Accept multipart/form-data
// @Produce json
// @Param avatar formData file true "Avatar file"
// @Success 200 {object} UserResponse
// @Failure 400 {object} types.ErrorResponse
// @Failure 404 {object} types.ErrorResponse
// @Failure 500 {object} types.ErrorResponse
// @Router /users/me/avatar [put]
// @Security ApiKeyAuth
// @Security BearerAuth
func (c *UserController) UpdateProfileAvatar(ctx *router.Context) error {
	id := ctx.GetUint("user_id")
	if id == 0 {
		return ctx.JSON(http.StatusBadRequest, types.ErrorResponse{Error: "Invalid user ID"})
	}

	file, err := ctx.FormFile("avatar")
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, types.ErrorResponse{Error: "Failed to get avatar file: " + err.Error()})
	}

	user, err := c.service.UpdateAvatar(ctx, uint(id), file)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ctx.JSON(http.StatusNotFound, types.ErrorResponse{Error: "User not found"})
		}
		c.logger.Error("Failed to update profile avatar", logger.Uint("user_id", id), logger.String("error", err.Error()))
		return ctx.JSON(http.StatusInternalServerError, types.ErrorResponse{Error: "Failed to update avatar: " + err.Error()})
	}

	return ctx.JSON(http.StatusOK, user.ToResponse())
}

// UpdateProfilePassword godoc
// @Summary Update current user password
// @Description Update password for authenticated user
// @Tags Core/Users
// @Accept json
// @Produce json
// @Param input body UpdatePasswordRequest true "Update Password Request"
// @Success 200 {object} types.SuccessResponse
// @Failure 400 {object} types.ErrorResponse
// @Failure 404 {object} types.ErrorResponse
// @Failure 500 {object} types.ErrorResponse
// @Router /users/me/password [put]
// @Security ApiKeyAuth
// @Security BearerAuth
func (c *UserController) UpdateProfilePassword(ctx *router.Context) error {
	id := ctx.GetUint("user_id")
	if id == 0 {
		return ctx.JSON(http.StatusBadRequest, types.ErrorResponse{Error: "Invalid user ID"})
	}

	var req UpdatePasswordRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, types.ErrorResponse{Error: "Invalid input: " + err.Error()})
	}

	if err := c.service.UpdatePassword(uint(id), &req); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ctx.JSON(http.StatusNotFound, types.ErrorResponse{Error: "User not found"})
		}
		c.logger.Error("Failed to update password", logger.Uint("user_id", id), logger.String("error", err.Error()))
		return ctx.JSON(http.StatusInternalServerError, types.ErrorResponse{Error: "Failed to update password: " + err.Error()})
	}

	return ctx.JSON(http.StatusOK, types.SuccessResponse{Message: "Password updated successfully", Success: true})
}

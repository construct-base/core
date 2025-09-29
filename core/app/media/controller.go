package media

import (
	"net/http"
	"strconv"

	"base/core/app/authorization"
	"base/core/logger"
	"base/core/router"
	"base/core/storage"
)

type MediaController struct {
	Service *MediaService
	Storage *storage.ActiveStorage
	Logger  logger.Logger
}

func NewMediaController(service *MediaService, storage *storage.ActiveStorage, logger logger.Logger) *MediaController {
	return &MediaController{
		Service: service,
		Storage: storage,
		Logger:  logger,
	}
}

func (c *MediaController) Routes(router *router.RouterGroup) {
	// Read endpoints - require read permission on media
	router.GET("/media", c.List) // Temporarily disabled authorization: authorization.Can("read", "media")
	router.GET("/media/all", c.ListAll) // Temporarily disabled authorization: authorization.Can("read", "media")
	router.GET("/media/root", c.GetRootContents, authorization.Can("read", "media")) // Root folder contents
	router.GET("/media/folder/:name", c.GetByName) // Get folder by name
	router.GET("/media/folder/:name/contents", c.GetFolderContentsByName) // Get folder contents by name
	router.GET("/media/:id", c.Get) // Temporarily disabled authorization: authorization.CanAccess("read", "media", "id")
	router.GET("/media/:id/contents", c.GetFolderContents) // Temporarily disabled authorization: authorization.CanAccess("read", "media", "id")

	// Create endpoints - require create permission on media
	router.POST("/media", c.Create) // Temporarily disabled authorization: authorization.Can("create", "media")
	router.POST("/media/folders", c.CreateFolder) // Temporarily disabled authorization: authorization.Can("create", "media")

	// Update endpoints - require update permission on specific media
	router.PUT("/media/:id", c.Update, authorization.CanAccess("update", "media", "id"))
	router.PUT("/media/:id/file", c.UpdateFile, authorization.CanAccess("update", "media", "id"))

	// Delete endpoints - require delete permission on specific media
	router.DELETE("/media/:id", c.Delete, authorization.CanAccess("delete", "media", "id"))
	router.DELETE("/media/:id/file", c.RemoveFile, authorization.CanAccess("update", "media", "id"))

	// Sharing endpoints - require update permission on specific media
	router.POST("/media/:id/share", c.ShareMedia, authorization.CanAccess("update", "media", "id"))
	router.GET("/media/:id/shares", c.GetMediaShares, authorization.CanAccess("read", "media", "id"))
	router.DELETE("/media/:id/shares", c.UnshareMedia, authorization.CanAccess("update", "media", "id"))
}

// Create godoc
// @Summary Create a new media item
// @Description Create a new media item with optional file upload
// @Tags Core/Media
// @Accept multipart/form-data
// @Produce json
// @Param name formData string true "Media name"
// @Param type formData string true "Media type"
// @Param description formData string false "Media description"
// @Param file formData file false "Media file"
// @Success 201 {object} MediaResponse
// @Router /media [post]
// @Security ApiKeyAuth
// @Security BearerAuth
func (c *MediaController) Create(ctx *router.Context) error {
	var req CreateMediaRequest
	if err := ctx.ShouldBind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
	}

	// Handle file upload
	if file, err := ctx.FormFile("file"); err == nil {
		req.File = file
	}

	item, err := c.Service.Create(&req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
	}

	return ctx.JSON(http.StatusCreated, item.ToResponse())
}

// UpdateFile godoc
// @Summary Update media file
// @Description Update the file attached to a media item
// @Tags Core/Media
// @Accept multipart/form-data
// @Produce json
// @Param id path int true "Media Id"
// @Param file formData file true "Media file"
// @Success 200 {object} MediaResponse
// @Router /media/{id}/file [put]
// @Security ApiKeyAuth
// @Security BearerAuth
func (c *MediaController) UpdateFile(ctx *router.Context) error {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid id parameter"})
	}

	file, err := ctx.FormFile("file")
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "file is required"})
	}

	item, err := c.Service.UpdateFile(ctx, uint(id), file)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
	}

	return ctx.JSON(http.StatusOK, item.ToResponse())
}

// RemoveFile godoc
// @Summary Remove media file
// @Description Remove the file attached to a media item
// @Tags Core/Media
// @Produce json
// @Param id path int true "Media Id"
// @Success 200 {object} MediaResponse
// @Router /media/{id}/file [delete]
// @Security ApiKeyAuth
// @Security BearerAuth
func (c *MediaController) RemoveFile(ctx *router.Context) error {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid id parameter"})
	}

	item, err := c.Service.RemoveFile(ctx, uint(id))
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
	}

	return ctx.JSON(http.StatusOK, item.ToResponse())
}

// Update godoc
// @Summary Update a media item
// @Description Update a media item's details and optionally its file
// @Tags Core/Media
// @Accept multipart/form-data
// @Produce json
// @Param id path int true "Media Id"
// @Param name formData string false "Media name"
// @Param type formData string false "Media type"
// @Param description formData string false "Media description"
// @Param file formData file false "Media file"
// @Success 200 {object} MediaResponse
// @Router /media/{id} [put]
// @Security ApiKeyAuth
// @Security BearerAuth
func (c *MediaController) Update(ctx *router.Context) error {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid id parameter"})
	}

	var req UpdateMediaRequest
	if err := ctx.ShouldBind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
	}

	// Handle file upload
	if file, err := ctx.FormFile("file"); err == nil {
		req.File = file
	}

	item, err := c.Service.Update(uint(id), &req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
	}

	return ctx.JSON(http.StatusOK, item.ToResponse())
}

// Delete godoc
// @Summary Delete a media item
// @Description Delete a media item and its associated file
// @Tags Core/Media
// @Produce json
// @Param id path int true "Media Id"
// @Success 204 "No Content"
// @Router /media/{id} [delete]
// @Security ApiKeyAuth
// @Security BearerAuth
func (c *MediaController) Delete(ctx *router.Context) error {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid id parameter"})
	}

	if err := c.Service.Delete(uint(id)); err != nil {
		return ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
	}

	ctx.Status(http.StatusNoContent)
	return nil
}

// Get godoc
// @Summary Get a media item
// @Description Get a media item by Id
// @Tags Core/Media
// @Produce json
// @Param id path int true "Media Id"
// @Success 200 {object} MediaResponse
// @Router /media/{id} [get]
// @Security ApiKeyAuth
// @Security BearerAuth
func (c *MediaController) Get(ctx *router.Context) error {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid id parameter"})
	}

	item, err := c.Service.GetById(uint(id))
	if err != nil {
		return ctx.JSON(http.StatusNotFound, ErrorResponse{Error: "media not found"})
	}

	return ctx.JSON(http.StatusOK, item.ToResponse())
}

// GetByName godoc
// @Summary Get media item by name
// @Description Get a media item by name
// @Tags Core/Media
// @Produce json
// @Param name path string true "Media Name"
// @Success 200 {object} MediaResponse
// @Router /media/folder/{name} [get]
func (c *MediaController) GetByName(ctx *router.Context) error {
	name := ctx.Param("name")
	if name == "" {
		return ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "name parameter is required"})
	}

	item, err := c.Service.GetByName(name)
	if err != nil {
		return ctx.JSON(http.StatusNotFound, ErrorResponse{Error: "media not found"})
	}

	return ctx.JSON(http.StatusOK, item.ToResponse())
}

// GetFolderContentsByName godoc
// @Summary Get folder contents by name
// @Description Get the contents of a folder by name
// @Tags Core/Media
// @Produce json
// @Param name path string true "Folder Name"
// @Param page query int false "Page number"
// @Param limit query int false "Page size"
// @Success 200 {object} types.PaginatedResponse
// @Router /media/folder/{name}/contents [get]
func (c *MediaController) GetFolderContentsByName(ctx *router.Context) error {
	name := ctx.Param("name")
	if name == "" {
		return ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "name parameter is required"})
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

	items, err := c.Service.GetFolderContentsByName(name, &page, &limit)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
	}

	return ctx.JSON(http.StatusOK, items)
}

// List godoc
// @Summary List media items
// @Description Get a paginated list of media items
// @Tags Core/Media
// @Produce json
// @Param page query int false "Page number"
// @Param limit query int false "Items per page"
// @Success 200 {object} types.PaginatedResponse
// @Router /media [get]
// @Security ApiKeyAuth
// @Security BearerAuth
func (c *MediaController) List(ctx *router.Context) error {
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

	result, err := c.Service.GetAll(&page, &limit)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
	}

	return ctx.JSON(http.StatusOK, result)
}

// ListAll godoc
// @Summary List all media items
// @Description Get an unpaginated list of all media items
// @Tags Core/Media
// @Produce json
// @Success 200 {array} MediaListResponse
// @Router /media/all [get]
// @Security ApiKeyAuth
// @Security BearerAuth
func (c *MediaController) ListAll(ctx *router.Context) error {
	result, err := c.Service.GetAll(nil, nil)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
	}

	return ctx.JSON(http.StatusOK, result)
}

// CreateFolder godoc
// @Summary Create a new folder
// @Description Create a new folder in the media system
// @Tags Core/Media
// @Accept json
// @Produce json
// @Param request body CreateFolderRequest true "Folder creation request"
// @Success 201 {object} MediaResponse
// @Router /media/folders [post]
// @Security ApiKeyAuth
// @Security BearerAuth
func (c *MediaController) CreateFolder(ctx *router.Context) error {
	var req CreateFolderRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
	}

	folder, err := c.Service.CreateFolder(&req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
	}

	return ctx.JSON(http.StatusCreated, folder.ToResponse())
}

// GetFolderContents godoc
// @Summary Get folder contents
// @Description Get the contents of a specific folder
// @Tags Core/Media
// @Produce json
// @Param id path int true "Folder Id"
// @Param page query int false "Page number"
// @Param limit query int false "Items per page"
// @Success 200 {object} types.PaginatedResponse
// @Router /media/{id}/contents [get]
// @Security ApiKeyAuth
// @Security BearerAuth
func (c *MediaController) GetFolderContents(ctx *router.Context) error {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid id parameter"})
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

	result, err := c.Service.GetFolderContents(uint(id), &page, &limit)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
	}

	return ctx.JSON(http.StatusOK, result)
}

// GetRootContents godoc
// @Summary Get root folder contents
// @Description Get the contents of the root directory
// @Tags Core/Media
// @Produce json
// @Param page query int false "Page number"
// @Param limit query int false "Items per page"
// @Success 200 {object} types.PaginatedResponse
// @Router /media/root [get]
// @Security ApiKeyAuth
// @Security BearerAuth
func (c *MediaController) GetRootContents(ctx *router.Context) error {
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

	result, err := c.Service.GetRootContents(&page, &limit)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
	}

	return ctx.JSON(http.StatusOK, result)
}

// ShareMedia godoc
// @Summary Share a media item
// @Description Share a media item with users or roles
// @Tags Core/Media
// @Accept json
// @Produce json
// @Param id path int true "Media Id"
// @Param request body ShareMediaRequest true "Share request"
// @Success 200 "Success"
// @Router /media/{id}/share [post]
// @Security ApiKeyAuth
// @Security BearerAuth
func (c *MediaController) ShareMedia(ctx *router.Context) error {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid id parameter"})
	}

	var req ShareMediaRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
	}

	// Set the media ID from the URL parameter
	req.MediaId = uint(id)

	if err := c.Service.ShareMedia(&req); err != nil {
		return ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
	}

	return ctx.JSON(http.StatusOK, map[string]string{"message": "media shared successfully"})
}

// GetMediaShares godoc
// @Summary Get media shares
// @Description Get sharing information for a media item
// @Tags Core/Media
// @Produce json
// @Param id path int true "Media Id"
// @Success 200 {array} MediaShareResponse
// @Router /media/{id}/shares [get]
// @Security ApiKeyAuth
// @Security BearerAuth
func (c *MediaController) GetMediaShares(ctx *router.Context) error {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid id parameter"})
	}

	shares, err := c.Service.GetMediaShares(uint(id))
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
	}

	return ctx.JSON(http.StatusOK, shares)
}

// UnshareMedia godoc
// @Summary Unshare a media item
// @Description Remove sharing permissions for a media item
// @Tags Core/Media
// @Produce json
// @Param id path int true "Media Id"
// @Param user_id query int false "User Id to unshare from"
// @Param role_id query int false "Role Id to unshare from"
// @Success 200 "Success"
// @Router /media/{id}/shares [delete]
// @Security ApiKeyAuth
// @Security BearerAuth
func (c *MediaController) UnshareMedia(ctx *router.Context) error {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid id parameter"})
	}

	var userId *uint
	var roleId *uint

	if userIdStr := ctx.Query("user_id"); userIdStr != "" {
		if parsedUserId, err := strconv.ParseUint(userIdStr, 10, 32); err == nil {
			userIdVal := uint(parsedUserId)
			userId = &userIdVal
		}
	}

	if roleIdStr := ctx.Query("role_id"); roleIdStr != "" {
		if parsedRoleId, err := strconv.ParseUint(roleIdStr, 10, 32); err == nil {
			roleIdVal := uint(parsedRoleId)
			roleId = &roleIdVal
		}
	}

	if userId == nil && roleId == nil {
		return ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "either user_id or role_id must be provided"})
	}

	if err := c.Service.UnshareMedia(uint(id), userId, roleId); err != nil {
		return ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
	}

	return ctx.JSON(http.StatusOK, map[string]string{"message": "media unshared successfully"})
}

type ErrorResponse struct {
	Error string `json:"error"`
}

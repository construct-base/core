package users

import (
	"base/core/logger"
	"base/core/module"
	"base/core/router"
	"base/core/storage"

	"gorm.io/gorm"
)

type UsersModule struct {
	module.DefaultModule
	DB            *gorm.DB
	Controller    *UserController
	Service       *UserService
	Logger        logger.Logger
	ActiveStorage *storage.ActiveStorage
}

func NewUsersModule(
	db *gorm.DB,
	router *router.RouterGroup,
	logger logger.Logger,
	activeStorage *storage.ActiveStorage,
) module.Module {
	// Initialize service with active storage
	service := NewUserService(db, logger, activeStorage)
	controller := NewUserController(service, logger)

	usersModule := &UsersModule{
		DB:            db,
		Controller:    controller,
		Service:       service,
		Logger:        logger,
		ActiveStorage: activeStorage,
	}

	return usersModule
}

func (m *UsersModule) Routes(router *router.RouterGroup) {
	m.Controller.Routes(router)
}

func (m *UsersModule) Migrate() error {
	err := m.DB.AutoMigrate(&User{})
	if err != nil {
		m.Logger.Error("Migration failed", logger.String("error", err.Error()))
		return err
	}
	return nil
}

func (m *UsersModule) GetModels() []any {
	return []any{
		&User{},
	}
}

func (m *UsersModule) GetModelNames() []string {
	models := m.GetModels()
	names := make([]string, len(models))
	for i, model := range models {
		names[i] = m.DB.Model(model).Statement.Table
	}
	return names
}
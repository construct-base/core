package articles

import (
	"base/app/models"
	"base/core/module"
	"base/core/router"

	"gorm.io/gorm"
)

type Module struct {
	module.DefaultModule
	DB         *gorm.DB
	Service    *ArticleService
	Controller *ArticleController
}

// Init creates and initializes the Article module with all dependencies
func Init(deps module.Dependencies) module.Module {
	// Initialize service and controller
	service := NewArticleService(deps.DB, deps.Emitter, deps.Storage, deps.Logger)
	controller := NewArticleController(service, deps.Storage)

	// Create module
	mod := &Module{
		DB:         deps.DB,
		Service:    service,
		Controller: controller,
	}

	return mod
}

// Routes registers the module routes
func (m *Module) Routes(router *router.RouterGroup) {
	m.Controller.Routes(router)
}

func (m *Module) Init() error {
	return nil
}

func (m *Module) Migrate() error {
	return m.DB.AutoMigrate(&models.Article{})
}

func (m *Module) GetModels() []any {
	return []any{
		&models.Article{},
	}
}

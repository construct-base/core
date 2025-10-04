package authentication

import (
	"base/core/app/users"
	"base/core/email"
	"base/core/emitter"
	"base/core/logger"
	"base/core/module"
	"base/core/router"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthenticationModule struct {
	module.DefaultModule
	DB          *gorm.DB
	Controller  *AuthController
	Service     *AuthService
	Logger      logger.Logger
	EmailSender email.Sender
	Emitter     *emitter.Emitter
}

func NewAuthenticationModule(db *gorm.DB, router *router.RouterGroup, emailSender email.Sender, logger logger.Logger, emitter *emitter.Emitter) module.Module {
	service := NewAuthService(db, emailSender, emitter)
	controller := NewAuthController(service, emailSender, logger)

	authModule := &AuthenticationModule{
		DB:          db,
		Controller:  controller,
		Service:     service,
		Logger:      logger,
		EmailSender: emailSender,
		Emitter:     emitter,
	}

	return authModule
}

func (m *AuthenticationModule) Routes(router *router.RouterGroup) {
	// Create /auth group under /api (router is already /api from main.go)
	authGroup := router.Group("/auth")

	m.Controller.Routes(authGroup)
}

func (m *AuthenticationModule) Migrate() error {
	if err := m.DB.AutoMigrate(&AuthUser{}); err != nil {
		return err
	}

	// Seed admin user
	return m.seedAdminUser()
}

func (m *AuthenticationModule) seedAdminUser() error {
	// Check if admin already exists
	var count int64
	m.DB.Model(&AuthUser{}).Where("email = ?", "admin@base.al").Count(&count)

	if count > 0 {
		// Admin already exists, skip seeding
		return nil
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// Create admin user
	admin := &AuthUser{
		User: users.User{
			Email:     "admin@base.al",
			Username:  "admin",
			FirstName: "Base",
			LastName:  "Admin",
			Password:  string(hashedPassword),
		},
	}

	if err := m.DB.Create(admin).Error; err != nil {
		return err
	}

	m.Logger.Info("✅ Admin user seeded: admin@base.al / admin123")
	return nil
}

func (m *AuthenticationModule) GetModels() []any {
	return []any{
		&AuthUser{},
	}
}

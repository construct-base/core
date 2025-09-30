package app

import (
	"base/app/articles"
	"base/app/categories"
	"base/app/posts"
	"base/core/module"
)

// AppModules implements module.AppModuleProvider interface
type AppModules struct{}

// GetAppModules returns the list of app modules to initialize
// This is the only function that needs to be updated when adding new app modules
func (am *AppModules) GetAppModules(deps module.Dependencies) map[string]module.Module {
	modules := make(map[string]module.Module)

	// App modules - custom system functionality
	modules["posts"] = posts.Init(deps)

	// Articles module
	modules["articles"] = articles.Init(deps)

	// Categories module
	modules["categories"] = categories.Init(deps)
	return modules
}

// NewAppModules creates a new AppModules provider
func NewAppModules() *AppModules {
	return &AppModules{}
}

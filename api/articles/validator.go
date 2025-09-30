package articles

import (
	"base/app/models"
	"base/core/validator"
)

// Global validator instance using Base core validator wrapper
var validate = validator.New()

// ValidateArticleCreateRequest validates the create request
func ValidateArticleCreateRequest(req *models.CreateArticleRequest) error {
	if req == nil {
		return validator.ValidationErrors{
			{
				Field:   "request",
				Tag:     "required",
				Value:   "nil",
				Message: "request cannot be nil",
			},
		}
	}

	// Use Base core validator
	return validate.Validate(req)
}

// ValidateArticleUpdateRequest validates the update request
func ValidateArticleUpdateRequest(req *models.UpdateArticleRequest, id uint) error {
	if req == nil {
		return validator.ValidationErrors{
			{
				Field:   "request",
				Tag:     "required",
				Value:   "nil",
				Message: "request cannot be nil",
			},
		}
	}

	if id == 0 {
		return validator.ValidationErrors{
			{
				Field:   "id",
				Tag:     "required",
				Value:   "0",
				Message: "id cannot be zero",
			},
		}
	}

	// Skip validation for update requests - all fields are optional
	return nil
}

// ValidateArticleDeleteRequest validates the delete request
func ValidateArticleDeleteRequest(id uint) error {
	return ValidateID(id)
}

// ValidateID validates if the ID is valid
func ValidateID(id uint) error {
	if id == 0 {
		return validator.ValidationErrors{
			{
				Field:   "id",
				Tag:     "required",
				Value:   "0",
				Message: "id cannot be zero",
			},
		}
	}
	return nil
}

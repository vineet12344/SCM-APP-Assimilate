package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/patil-rushikesh/scm-backend/internal/models"
	"github.com/patil-rushikesh/scm-backend/internal/services"
	"github.com/patil-rushikesh/scm-backend/internal/utils"
	"net/http"
)

type UserHandler struct {
	service services.UserService
}

func (h *UserHandler) Logout(c *gin.Context) {
	// Clear the cookie by setting MaxAge to -1
	c.SetCookie(
		"user_token",
		"",
		-1,
		"/",
		"",
		false, // Secure=false for local dev
		true,  // HttpOnly
	)
	utils.SuccessResponse(c, http.StatusOK, "Logged out successfully", nil)
}

func NewUserHandler(service services.UserService) *UserHandler {
	return &UserHandler{service: service}
}

func (h *UserHandler) Register(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid input", err)
		return
	}

	if err := h.service.RegisterUser(&user); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to register user", err)
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "User registered successfully", user)
}

func (h *UserHandler) Authenticate(c *gin.Context) {
	var credentials struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&credentials); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid input", err)
		return
	}

	user, err := h.service.AuthenticateUser(credentials.Email, credentials.Password)
	if err != nil {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Authentication failed", err)
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Email, user.Role)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to generate token", err)
		return
	}
	// Set cookie with appropriate attributes for local dev (Secure=false, SameSite=Lax)
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "user_token",
		Value:    token,
		Path:     "/",
		Domain:   "", // set to your backend domain in production
		MaxAge:   3600,
		Secure:   true, // set true for production/HTTPS
		HttpOnly: true,
		SameSite: http.SameSiteNoneMode, // Lax for local dev, None for cross-site in production
	})
	resp := gin.H{
		"user": user,
	}
	utils.SuccessResponse(c, http.StatusOK, "User authenticated successfully", resp)
}

func (h *UserHandler) GetProfile(c *gin.Context) {
	claims, exists := c.Get("user")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	userClaims, ok := claims.(jwt.MapClaims)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	userIDFloat, ok := userClaims["user_id"].(float64)

	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}
	userID := uint(userIDFloat)
	user, err := h.service.GetUserByID(userID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve user profile", err)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "User profile retrieved successfully", user)
}

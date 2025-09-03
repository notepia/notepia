package handler

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

type ChangePasswordRequest struct {
	Password string
}
type ChangeAvatarUrlRequest struct {
	AvatarUrl string
}

func (h Handler) ChangePassword(c echo.Context) error {
	id := c.Param("id")

	var req ChangePasswordRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if req.Password == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "password is required")
	}

	user, err := h.db.FindUserByID(id)
	if err != nil {
		return c.JSON(http.StatusBadRequest, "failed to get user by id")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)

	if err != nil {
		return c.JSON(http.StatusBadRequest, "failed to hash password")
	}

	user.PasswordHash = string(hashedPassword)
	user.UpdatedAt = time.Now().UTC().String()
	user.UpdatedBy = user.ID

	err = h.db.UpdateUser(user)

	if err != nil {
		return c.JSON(http.StatusBadRequest, "failed to update user")
	}

	return c.JSON(http.StatusOK, "Successfully changed password.")
}

func (h Handler) ChangeAvatar(c echo.Context) error {
	id := c.Param("id")

	var req ChangeAvatarUrlRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if req.AvatarUrl == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "avatar url is required")
	}

	user, err := h.db.FindUserByID(id)
	if err != nil {
		return c.JSON(http.StatusBadRequest, "failed to get user by id")
	}

	user.AvatarUrl = req.AvatarUrl
	user.UpdatedAt = time.Now().UTC().String()
	user.UpdatedBy = user.ID

	err = h.db.UpdateUser(user)

	if err != nil {
		return c.JSON(http.StatusBadRequest, "failed to update user")
	}

	return c.JSON(http.StatusOK, "Successfully changed avatar.")
}

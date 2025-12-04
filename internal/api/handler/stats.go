package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
)

type NoteCountByDateResponse struct {
	Date  string `json:"date"`
	Count int    `json:"count"`
}

// GetNoteCountsByDate returns the number of notes created per date
func (h Handler) GetNoteCountsByDate(c echo.Context) error {
	workspaceId := c.Param("workspaceId")
	if workspaceId == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Workspace id is required")
	}

	// Parse days parameter (default to 365 days)
	days := 365
	if d := c.QueryParam("days"); d != "" {
		if v, err := strconv.Atoi(d); err == nil && v > 0 && v <= 730 {
			days = v
		}
	}

	// Parse timezone offset parameter (in minutes, default to 0 for UTC)
	timezoneOffset := 0
	if tz := c.QueryParam("timezoneOffset"); tz != "" {
		if v, err := strconv.Atoi(tz); err == nil && v >= -720 && v <= 840 {
			timezoneOffset = v
		}
	}

	// Calculate start date
	startDate := time.Now().UTC().AddDate(0, 0, -days)
	startDateStr := startDate.Format("2006-01-02")

	// Get note counts by date from database
	counts, err := h.db.GetNoteCountsByDate(workspaceId, startDateStr, timezoneOffset)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	// Convert to response format
	response := make([]NoteCountByDateResponse, 0)
	for date, count := range counts {
		response = append(response, NoteCountByDateResponse{
			Date:  date,
			Count: count,
		})
	}

	return c.JSON(http.StatusOK, response)
}

package middlewares

import "github.com/labstack/echo/v4"

func Skippable(m echo.MiddlewareFunc, skipper func(c echo.Context) bool) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			if skipper(c) {
				return next(c)
			}
			return m(next)(c)
		}
	}
}

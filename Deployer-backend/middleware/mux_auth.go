package middleware

import (
	"database/sql"
	"context"
	"net/http"

	"github.com/golang-jwt/jwt/v5"
	"github.com/dhruvsingh/deployer-backend/models"
)

func AuthMiddleware(jwtSecret string, db *sql.DB) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				respondError(w, "Missing authorization header", http.StatusUnauthorized)
				return
			}

			tokenString := authHeader
			if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
				tokenString = authHeader[7:]
			}

			// Parse and validate JWT
			token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, jwt.ErrSignatureInvalid
				}
				return []byte(jwtSecret), nil
			})

			if err != nil || !token.Valid {
				respondError(w, "Invalid token", http.StatusUnauthorized)
				return
			}

			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				respondError(w, "Invalid token claims", http.StatusUnauthorized)
				return
			}

			// Extract user info
			user := &models.JWTClaims{
				UserID:   getString(claims, "user_id"),
				Email:    getString(claims, "email"),
			}

			// Add user to context
			ctx := r.Context()
			ctx = setUserContext(ctx, user)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func setUserContext(ctx context.Context, user *models.JWTClaims) context.Context {
	return context.WithValue(ctx, UserContextKey, user)
}

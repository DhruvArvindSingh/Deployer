package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/dhruvsingh/deployer-backend/config"
	"github.com/dhruvsingh/deployer-backend/models"
	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const UserContextKey contextKey = "user"

func RequireAuth(cfg *config.Config, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			respondError(w, "Missing authorization header", http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			respondError(w, "Invalid authorization format", http.StatusUnauthorized)
			return
		}

		// Parse and validate JWT
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(cfg.JWTSecret), nil
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
			UserID:   getString(claims, "userId"),
			Email:    getString(claims, "email"),
			Provider: getString(claims, "provider"),
			Username: getString(claims, "username"),
		}

		// Add user to context
		ctx := context.WithValue(r.Context(), UserContextKey, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

func GetUserFromContext(r *http.Request) *models.JWTClaims {
	user, ok := r.Context().Value(UserContextKey).(*models.JWTClaims)
	if !ok {
		return nil
	}
	return user
}

func getString(claims jwt.MapClaims, key string) string {
	if val, ok := claims[key].(string); ok {
		return val
	}
	return ""
}

func respondError(w http.ResponseWriter, message string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}

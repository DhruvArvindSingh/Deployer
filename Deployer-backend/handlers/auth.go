package handlers

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/dhruvsingh/deployer-backend/config"
	"github.com/golang-jwt/jwt/v5"
)

type GitHubUser struct {
	ID    int    `json:"id"`
	Login string `json:"login"`
	Email string `json:"email"`
	Name  string `json:"name"`
}

type GoogleUser struct {
	ID      string `json:"id"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Picture string `json:"picture"`
}

func GitHubCallbackHandler(db *sql.DB, cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		code := r.URL.Query().Get("code")
		if code == "" {
			respondError(w, "No authorization code provided", http.StatusBadRequest)
			return
		}

		// Exchange code for access token
		tokenReq := map[string]string{
			"client_id":     cfg.GitHubClientID,
			"client_secret": cfg.GitHubClientSecret,
			"code":          code,
		}

		tokenReqBody, _ := json.Marshal(tokenReq)
		req, _ := http.NewRequest("POST", "https://github.com/login/oauth/access_token", bytes.NewBuffer(tokenReqBody))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Accept", "application/json")

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			respondError(w, "Failed to exchange code for token", http.StatusInternalServerError)
			return
		}
		defer resp.Body.Close()

		var tokenResp struct {
			AccessToken string `json:"access_token"`
			TokenType   string `json:"token_type"`
			Scope       string `json:"scope"`
		}

		if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
			respondError(w, "Failed to parse token response", http.StatusInternalServerError)
			return
		}

		// Get user info from GitHub
		userReq, _ := http.NewRequest("GET", "https://api.github.com/user", nil)
		userReq.Header.Set("Authorization", "Bearer "+tokenResp.AccessToken)
		userReq.Header.Set("Accept", "application/json")

		userResp, err := http.DefaultClient.Do(userReq)
		if err != nil {
			respondError(w, "Failed to get user info", http.StatusInternalServerError)
			return
		}
		defer userResp.Body.Close()

		var githubUser GitHubUser
		if err := json.NewDecoder(userResp.Body).Decode(&githubUser); err != nil {
			respondError(w, "Failed to parse user info", http.StatusInternalServerError)
			return
		}

		// Fallback email if not public
		email := githubUser.Email
		if email == "" {
			email = fmt.Sprintf("%s@github.com", githubUser.Login)
		}

		// Create or update user in database
		userID, err := createOrUpdateUser(db, email, githubUser.Login, "github", fmt.Sprintf("%d", githubUser.ID))
		if err != nil {
			respondError(w, "Failed to create user", http.StatusInternalServerError)
			return
		}

		// Generate JWT token
		token, err := generateJWT(userID, email, cfg.JWTSecret)
		if err != nil {
			respondError(w, "Failed to generate token", http.StatusInternalServerError)
			return
		}

		// Return token
		respondJSON(w, map[string]string{
			"token": token,
			"email": email,
		}, http.StatusOK)
	}
}

func GoogleCallbackHandler(db *sql.DB, cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		code := r.URL.Query().Get("code")
		if code == "" {
			respondError(w, "No authorization code provided", http.StatusBadRequest)
			return
		}

		// Exchange code for access token
		tokenReq := map[string]string{
			"client_id":     cfg.GoogleClientID,
			"client_secret": cfg.GoogleClientSecret,
			"code":          code,
			"grant_type":    "authorization_code",
			"redirect_uri":  cfg.AuthPageURL + "/callback.html",
		}

		tokenReqBody, _ := json.Marshal(tokenReq)
		req, _ := http.NewRequest("POST", "https://oauth2.googleapis.com/token", bytes.NewBuffer(tokenReqBody))
		req.Header.Set("Content-Type", "application/json")

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			respondError(w, "Failed to exchange code for token", http.StatusInternalServerError)
			return
		}
		defer resp.Body.Close()

		var tokenResp struct {
			AccessToken string `json:"access_token"`
			TokenType   string `json:"token_type"`
		}

		if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
			respondError(w, "Failed to parse token response", http.StatusInternalServerError)
			return
		}

		// Get user info from Google
		userReq, _ := http.NewRequest("GET", "https://www.googleapis.com/oauth2/v2/userinfo", nil)
		userReq.Header.Set("Authorization", "Bearer "+tokenResp.AccessToken)

		userResp, err := http.DefaultClient.Do(userReq)
		if err != nil {
			respondError(w, "Failed to get user info", http.StatusInternalServerError)
			return
		}
		defer userResp.Body.Close()

		var googleUser GoogleUser
		if err := json.NewDecoder(userResp.Body).Decode(&googleUser); err != nil {
			respondError(w, "Failed to parse user info", http.StatusInternalServerError)
			return
		}

		// Create or update user
		userID, err := createOrUpdateUser(db, googleUser.Email, googleUser.Name, "google", googleUser.ID)
		if err != nil {
			respondError(w, "Failed to create user", http.StatusInternalServerError)
			return
		}

		// Generate JWT
		token, err := generateJWT(userID, googleUser.Email, cfg.JWTSecret)
		if err != nil {
			respondError(w, "Failed to generate token", http.StatusInternalServerError)
			return
		}

		respondJSON(w, map[string]string{
			"token": token,
			"email": googleUser.Email,
		}, http.StatusOK)
	}
}

func createOrUpdateUser(db *sql.DB, email, username, provider, providerID string) (string, error) {
	ctx := context.Background()
	
	// Check if user exists
	var userID string
	err := db.QueryRowContext(ctx, "SELECT id FROM users WHERE email = $1", email).Scan(&userID)
	
	if err == sql.ErrNoRows {
		// Create new user
		err = db.QueryRowContext(ctx, `
			INSERT INTO users (email, username, provider, provider_id)
			VALUES ($1, $2, $3, $4)
			RETURNING id
		`, email, username, provider, providerID).Scan(&userID)
		
		if err != nil {
			return "", err
		}
	} else if err != nil {
		return "", err
	}
	
	// Update last login
	_, err = db.ExecContext(ctx, "UPDATE users SET updated_at = NOW() WHERE id = $1", userID)
	return userID, err
}

func generateJWT(userID, email, secret string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"email":   email,
		"iat":     time.Now().Unix(),
		"exp":     time.Now().Add(30 * 24 * time.Hour).Unix(), // 30 days
	}
	
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// Helper functions
func respondJSON(w http.ResponseWriter, data interface{}, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func respondError(w http.ResponseWriter, message string, status int) {
	respondJSON(w, map[string]string{"error": message}, status)
}

package handlers

import (
	"io"
	"net/http"
	"os"
)

func ServeLatestCLI() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// For now, we serve the local binary from the host path.
		// In a production setup, this would come from a storage bucket or GitHub release.
		cliPath := "/app/deploynet-cli"
		
		file, err := os.Open(cliPath)
		if err != nil {
			respondError(w, "CLI binary not found", http.StatusNotFound)
			return
		}
		defer file.Close()

		// Set headers to trigger download
		w.Header().Set("Content-Disposition", "attachment; filename=deployer")
		w.Header().Set("Content-Type", "application/octet-stream")

		io.Copy(w, file)
	}
}

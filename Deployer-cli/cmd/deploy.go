package cmd

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/textproto"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/briandowns/spinner"
	"github.com/spf13/cobra"
)

type ProjectConfig struct {
	ProjectID  string `json:"project_id"`
	BucketName string `json:"bucket_name"`
	LastDeploy string `json:"last_deploy"`
}

var (
	ciMode bool
	token  string
)

var deployCmd = &cobra.Command{
	Use:   "deploy",
	Short: "Deploy current directory to DeployNet",
	Long:  "Detect project type, build, and deploy to your homelab",
	RunE:  runDeploy,
}

func init() {
	deployCmd.Flags().BoolVar(&ciMode, "ci", false, "Run in non-interactive CI mode")
	deployCmd.Flags().StringVar(&token, "token", "", "Authentication token (overrides config file)")
}

func runDeploy(cmd *cobra.Command, args []string) error {
	if !ciMode {
		printBanner()
	}

	// Load auth config
	var authToken string
	if token != "" {
		authToken = token
	} else {
		config, err := loadConfig()
		if err != nil {
			// In CI mode, try environment variable if config file missing
			if ciMode {
				authToken = os.Getenv("DEPLOYER_TOKEN")
				if authToken == "" {
					return fmt.Errorf("DEPLOYER_TOKEN environment variable not set")
				}
			} else {
				return err
			}
		} else {
			authToken = config.Token
		}
	}

	// Detect project type
	if !ciMode {
		printInfo("[1/6] Detecting project type...")
	}
	projectType, buildDir, err := detectProjectType()
	if err != nil {
		return err
	}
	if !ciMode {
		printSuccess(fmt.Sprintf("Detected %s project", projectType))
	}

	// Check for existing project config
	localConfig, exists := loadProjectConfig()

	var projectName string
	if exists {
		if !ciMode {
			printInfo(fmt.Sprintf("Found existing project: %s", localConfig.BucketName))
		}
		projectName = localConfig.BucketName
	} else {
		if ciMode {
			return fmt.Errorf("no project configuration found (.deployer/config.json) - run 'deployer setup' or a manual deploy first")
		}
		// Get project name from user
		fmt.Println()
		fmt.Println("Enter a name for your project (e.g., my-portfolio)")
		fmt.Print(cyan("Project name: "))
		projectName = promptUser("")

		if projectName == "" {
			return fmt.Errorf("project name cannot be empty")
		}

		// Check availability
		if err := checkBucketAvailability(authToken, projectName); err != nil {
			return err
		}
	}

	// Build project
	if !ciMode {
		printInfo(fmt.Sprintf("[2/6] Building %s project...", projectType))
	}
	if err := buildProject(projectType); err != nil {
		return fmt.Errorf("build failed: %w", err)
	}
	if !ciMode {
		printSuccess("Build completed successfully")
	}

	// Upload files
	if !ciMode {
		printInfo(fmt.Sprintf("[3/6] Uploading files from %s...", buildDir))
	}
	deploymentID, url, err := uploadFiles(authToken, projectName, buildDir)
	if err != nil {
		return fmt.Errorf("upload failed: %w", err)
	}
	if !ciMode {
		printSuccess(fmt.Sprintf("Uploaded files to MinIO"))
	}

	// Save project config
	if !ciMode {
		printInfo("[4/6] Saving project configuration...")
	}
	if err := saveProjectConfig(projectName, deploymentID); err != nil {
		if !ciMode {
			printWarning(fmt.Sprintf("Could not save project config: %v", err))
		}
	} else {
		if !ciMode {
			printSuccess("Saved to .deployer/config.json")
		}
	}

	// Print success
	if !ciMode {
		fmt.Println()
		fmt.Println(green("═══════════════════════════════════════"))
		fmt.Printf("%s %s\n", green("🚀"), bold("Deployment Successful!"))
		fmt.Println(green("═══════════════════════════════════════"))
		fmt.Printf("  %s %s\n", cyan("URL:"), url)
		fmt.Printf("  %s %s\n", cyan("Deployment ID:"), deploymentID)
		fmt.Println(green("═══════════════════════════════════════"))
		fmt.Println()
	} else {
		fmt.Printf("Deployment successful: %s (ID: %s)\n", url, deploymentID)
	}

	return nil
}

func detectProjectType() (string, string, error) {
	// Check for Next.js
	if _, err := os.Stat("next.config.js"); err == nil {
		return "Next.js", "out", nil
	}
	if _, err := os.Stat("next.config.ts"); err == nil {
		return "Next.js", "out", nil
	}
	if _, err := os.Stat("next.config.mjs"); err == nil {
		return "Next.js", "out", nil
	}
	
	// Check for Vite
	if _, err := os.Stat("vite.config.js"); err == nil {
		return "Vite", "dist", nil
	}
	if _, err := os.Stat("vite.config.ts"); err == nil {
		return "Vite", "dist", nil
	}
	
	// Check for Create React App
	if data, err := os.ReadFile("package.json"); err == nil {
		if strings.Contains(string(data), "react-scripts") {
			return "Create React App", "build", nil
		}
	}
	
	return "", "", fmt.Errorf("unsupported project type - please use Next.js, Vite, or Create React App")
}

func buildProject(projectType string) error {
	s := spinner.New(spinner.CharSets[14], 100*time.Millisecond)
	s.Suffix = " Building project..."
	s.Start()
	defer s.Stop()
	
	cmd := exec.Command("npm", "run", "build")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	
	if err := cmd.Run(); err != nil {
		return err
	}
	
	return nil
}

func checkBucketAvailability(token, name string) error {
	reqBody, _ := json.Marshal(map[string]string{"name": name})
	req, _ := http.NewRequest("POST", apiURL+"/api/buckets/check", bytes.NewBuffer(reqBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	
	var result struct {
		Available bool `json:"available"`
	}
	json.NewDecoder(resp.Body).Decode(&result)
	
	if !result.Available {
		return fmt.Errorf("project name '%s' is already taken or reserved", name)
	}
	
	printSuccess(fmt.Sprintf("Project name '%s' is available", name))
	return nil
}

func uploadFiles(token, projectName, buildDir string) (string, string, error) {
	// Create multipart form
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	// Add project name
	writer.WriteField("project_name", projectName)

	// Add CI/metadata info if available
	source := "cli"
	if ciMode || os.Getenv("GITHUB_ACTIONS") == "true" {
		source = "ci"
	}
	writer.WriteField("source", source)

	// Try to get git info
	if repoURL, err := exec.Command("git", "remote", "get-url", "origin").Output(); err == nil {
		writer.WriteField("repo_url", strings.TrimSpace(string(repoURL)))
	}
	if commitHash, err := exec.Command("git", "rev-parse", "HEAD").Output(); err == nil {
		writer.WriteField("commit_hash", strings.TrimSpace(string(commitHash)))
	}
	if commitMsg, err := exec.Command("git", "log", "-1", "--format=%s").Output(); err == nil {
		writer.WriteField("commit_message", strings.TrimSpace(string(commitMsg)))
	}

	// Walk build directory and add files
	fileCount := 0
	err := filepath.Walk(buildDir, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() {
			return err
		}
		
		// Get relative path
		relPath, _ := filepath.Rel(buildDir, path)
		
		// Open file
		file, err := os.Open(path)
		if err != nil {
			return err
		}
		defer file.Close()
		
		// Detect content type from extension
		contentType := getContentTypeFromPath(relPath)
		
		// Create form part with proper Content-Type header and custom path header
		h := make(textproto.MIMEHeader)
		h.Set("Content-Disposition", fmt.Sprintf(`form-data; name="files"; filename="%s"`, relPath))
		h.Set("Content-Type", contentType)
		h.Set("X-File-Path", relPath) // Add custom header to preserve full path
		part, err := writer.CreatePart(h)
		if err != nil {
			return err
		}
		
		// Copy file content
		if _, err := io.Copy(part, file); err != nil {
			return err
		}
		
		fileCount++
		return nil
	})
	
	if err != nil {
		return "", "", err
	}
	
	writer.Close()
	
	// Create request
	req, _ := http.NewRequest("POST", apiURL+"/api/deploy", body)
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	
	// Send request
	s := spinner.New(spinner.CharSets[14], 100*time.Millisecond)
	s.Suffix = fmt.Sprintf(" Uploading %d files...", fileCount)
	s.Start()
	
	resp, err := http.DefaultClient.Do(req)
	s.Stop()
	
	if err != nil {
		return "", "", err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return "", "", fmt.Errorf("deployment failed: %s", string(bodyBytes))
	}
	
	var result struct {
		DeploymentID string `json:"deployment_id"`
		URL          string `json:"url"`
	}
	json.NewDecoder(resp.Body).Decode(&result)
	
	return result.DeploymentID, result.URL, nil
}

func loadProjectConfig() (*ProjectConfig, bool) {
	data, err := os.ReadFile(".deployer/config.json")
	if err != nil {
		return nil, false
	}
	
	var config ProjectConfig
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, false
	}
	
	return &config, true
}

func saveProjectConfig(bucketName, deploymentID string) error {
	if err := os.MkdirAll(".deployer", 0755); err != nil {
		return err
	}
	
	config := ProjectConfig{
		BucketName: bucketName,
		ProjectID:  deploymentID,
		LastDeploy: time.Now().Format(time.RFC3339),
	}
	
	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return err
	}
	
	return os.WriteFile(".deployer/config.json", data, 0644)
}

func getContentTypeFromPath(filename string) string {
	ext := filepath.Ext(filename)
	contentTypes := map[string]string{
		".html": "text/html; charset=utf-8",
		".css":  "text/css; charset=utf-8",
		".js":   "application/javascript; charset=utf-8",
		".mjs":  "application/javascript; charset=utf-8",
		".json": "application/json",
		".png":  "image/png",
		".jpg":  "image/jpeg",
		".jpeg": "image/jpeg",
		".gif":  "image/gif",
		".svg":  "image/svg+xml",
		".ico":  "image/x-icon",
		".woff": "font/woff",
		".woff2": "font/woff2",
		".ttf":  "font/ttf",
		".eot":  "application/vnd.ms-fontobject",
		".pdf":  "application/pdf",
		".txt":  "text/plain; charset=utf-8",
		".xml":  "application/xml",
		".webp": "image/webp",
		".mp4":  "video/mp4",
		".webm": "video/webm",
	}

	if ct, ok := contentTypes[ext]; ok {
		return ct
	}
	return "application/octet-stream"
}

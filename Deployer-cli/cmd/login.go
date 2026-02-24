package cmd

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"

	"github.com/dhruvsingh/deployer-cli/config"
	"github.com/spf13/cobra"
)

type Config struct {
	Token string `json:"token"`
	Email string `json:"email"`
}

var loginCmd = &cobra.Command{
	Use:   "login",
	Short: "Authenticate with DeployNet",
	Long:  "Open browser to authenticate with GitHub or Google OAuth",
	RunE:  runLogin,
}

func runLogin(cmd *cobra.Command, args []string) error {
	printBanner()
	printInfo("Starting authentication flow...")

	// Open browser to auth page
	authURL := config.AuthURL
	printInfo(fmt.Sprintf("Opening browser to: %s", authURL))
	printInfo("Please log in with GitHub or Google")

	if err := openBrowser(authURL); err != nil {
		printWarning("Could not open browser automatically")
		fmt.Printf("\nPlease open this URL manually: %s\n\n", authURL)
	}

	fmt.Println()
	printInfo("After logging in, copy your deployment token from the website.")
	token := promptUser(fmt.Sprintf("%s Enter your token: ", blue("🔑")))

	if token == "" {
		return fmt.Errorf("token cannot be empty")
	}

	// Save token to config
	if err := saveConfig(token); err != nil {
		return fmt.Errorf("failed to save config: %w", err)
	}

	printSuccess("Authentication successful!")
	printSuccess("Token saved to ~/.deployer/config.json")
	fmt.Printf("\n%s You're ready to deploy! Run %s to get started.\n\n",
		green("🚀"), bold("deployer deploy"))
	return nil
}

func saveConfig(token string) error {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return err
	}

	configDir := filepath.Join(homeDir, ".deployer")
	if err := os.MkdirAll(configDir, 0755); err != nil {
		return err
	}

	config := Config{
		Token: token,
	}

	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return err
	}

	configPath := filepath.Join(configDir, "config.json")
	return os.WriteFile(configPath, data, 0600)
}

func loadConfig() (*Config, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return nil, err
	}

	configPath := filepath.Join(homeDir, ".deployer", "config.json")
	data, err := os.ReadFile(configPath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, fmt.Errorf("not authenticated - run 'deployer login' first")
		}
		return nil, err
	}

	var config Config
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, err
	}

	return &config, nil
}

func openBrowser(url string) error {
	var cmd *exec.Cmd

	switch runtime.GOOS {
	case "linux":
		cmd = exec.Command("xdg-open", url)
	case "darwin":
		cmd = exec.Command("open", url)
	case "windows":
		cmd = exec.Command("rundll32", "url.dll,FileProtocolHandler", url)
	default:
		return fmt.Errorf("unsupported platform")
	}

	return cmd.Start()
}

func promptUser(prompt string) string {
	fmt.Print(prompt)
	reader := bufio.NewReader(os.Stdin)
	input, _ := reader.ReadString('\n')
	return strings.TrimSpace(input)
}

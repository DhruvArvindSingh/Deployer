package cmd

import (
	"fmt"

	"github.com/dhruvsingh/deployer-cli/config"
	"github.com/fatih/color"
	"github.com/spf13/cobra"
)

var (
	// Global flags
	apiURL string

	// Colors
	green  = color.New(color.FgGreen).SprintFunc()
	red    = color.New(color.FgRed).SprintFunc()
	yellow = color.New(color.FgYellow).SprintFunc()
	cyan   = color.New(color.FgCyan).SprintFunc()
	blue   = color.New(color.FgBlue).SprintFunc()
	bold   = color.New(color.Bold).SprintFunc()
)

var rootCmd = &cobra.Command{
	Use:   "deployer",
	Short: "Deploy static sites to your homelab instantly",
	Long: `DeployNet CLI - Deploy static websites (Next.js, Vite, etc.) to your 
homelab with a single command. Fast, simple, and self-hosted.`,
	Version: "1.0.0",
}

func Execute() error {
	return rootCmd.Execute()
}

func init() {
	// Default API URL comes from centralized config.
	// Users can still override it at runtime with the --api flag.
	apiURL = config.APIURL
	rootCmd.PersistentFlags().StringVar(&apiURL, "api", apiURL, "Backend API URL")

	rootCmd.AddCommand(loginCmd)
	rootCmd.AddCommand(deployCmd)
	rootCmd.AddCommand(listCmd)
	rootCmd.AddCommand(deleteCmd)
	rootCmd.AddCommand(statusCmd)
}

func printBanner() {
	banner := `
╔══════════════════════════════════════╗
║                                      ║
║         🚀 D E P L O Y N E T        ║
║                                      ║
║    Deploy static sites instantly     ║
║                                      ║
╚══════════════════════════════════════╝
`
	fmt.Println(cyan(banner))
}

func printSuccess(message string) {
	fmt.Printf("%s %s\n", green("✓"), message)
}

func printError(message string) {
	fmt.Printf("%s %s\n", red("✗"), message)
}

func printInfo(message string) {
	fmt.Printf("%s %s\n", cyan("ℹ"), message)
}

func printWarning(message string) {
	fmt.Printf("%s %s\n", yellow("⚠"), message)
}

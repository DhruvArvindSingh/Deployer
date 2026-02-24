package cmd

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/spf13/cobra"
)

type Project struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
}

var listCmd = &cobra.Command{
	Use:   "list",
	Short: "List all your deployed projects",
	RunE:  runList,
}

var deleteCmd = &cobra.Command{
	Use:   "delete [project-id]",
	Short: "Delete a deployed project",
	Args:  cobra.ExactArgs(1),
	RunE:  runDelete,
}

var statusCmd = &cobra.Command{
	Use:   "status",
	Short: "Show deployment status for current project",
	RunE:  runStatus,
}

func runList(cmd *cobra.Command, args []string) error {
	config, err := loadConfig()
	if err != nil {
		return err
	}

	req, _ := http.NewRequest("GET", apiURL+"/api/projects", nil)
	req.Header.Set("Authorization", "Bearer "+config.Token)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	var projects []Project
	if err := json.NewDecoder(resp.Body).Decode(&projects); err != nil {
		return err
	}

	if len(projects) == 0 {
		printInfo("No projects found. Deploy your first project with 'deployer deploy'")
		return nil
	}

	fmt.Println()
	fmt.Println(bold("Your Projects:"))
	fmt.Println()

	for _, p := range projects {
		fmt.Printf("  %s %s\n", cyan("•"), bold(p.Name))
		fmt.Printf("    %s %s\n", "ID:", p.ID)
		fmt.Printf("    %s http://%s.dsingh.fun:31579\n", "URL:", p.Name)
		fmt.Printf("    %s %s\n", "Created:", p.CreatedAt.Format("2006-01-02 15:04"))
		fmt.Println()
	}

	return nil
}

func runDelete(cmd *cobra.Command, args []string) error {
	config, err := loadConfig()
	if err != nil {
		return err
	}

	projectID := args[0]

	// Confirm deletion
	fmt.Printf("Are you sure you want to delete this project? [y/N]: ")
	confirm := promptUser("")

	if confirm != "y" && confirm != "Y" {
		printInfo("Deletion cancelled")
		return nil
	}

	req, _ := http.NewRequest("DELETE", apiURL+"/api/projects/"+projectID, nil)
	req.Header.Set("Authorization", "Bearer "+config.Token)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to delete project")
	}

	printSuccess("Project deleted successfully")
	return nil
}

func runStatus(cmd *cobra.Command, args []string) error {
	localConfig, exists := loadProjectConfig()
	if !exists {
		return fmt.Errorf("no project found in current directory - run 'deployer deploy' first")
	}

	fmt.Println()
	fmt.Println(bold("Project Status:"))
	fmt.Println()
	fmt.Printf("  %s %s\n", cyan("Name:"), localConfig.BucketName)
	fmt.Printf("  %s %s\n", cyan("Last Deploy:"), localConfig.LastDeploy)
	fmt.Printf("  %s https://%s.dsingh.fun\n", cyan("URL:"), localConfig.BucketName)
	fmt.Println()

	return nil
}

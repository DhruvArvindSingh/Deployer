package cmd

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/spf13/cobra"
)

var setupCmd = &cobra.Command{
	Use:   "setup",
	Short: "Configure CI/CD for the current project",
	Long:  "Generates a GitHub Actions workflow to auto-deploy your site on every push",
	RunE:  runSetup,
}

func runSetup(cmd *cobra.Command, args []string) error {
	printBanner()
	printInfo("Setting up CI/CD workflow...")

	// 1. Check for git repo
	repoRoot, err := findGitRoot()
	if err != nil {
		return fmt.Errorf("git repository not found - run 'git init' first")
	}

	// 2. Detect project and sub-directory
	cwd, _ := os.Getwd()
	subDir := ""
	if cwd != repoRoot {
		subDir, _ = filepath.Rel(repoRoot, cwd)
		printInfo(fmt.Sprintf("Monorepo detected: project is in '%s'", subDir))
	}

	// 3. Get/Detect project name
	localConfig, exists := loadProjectConfig()
	projectName := ""
	if exists {
		projectName = localConfig.BucketName
		printInfo(fmt.Sprintf("Using existing project: %s", projectName))
	} else {
		fmt.Println()
		fmt.Println("Enter a name for your project (e.g., my-portfolio)")
		fmt.Print(cyan("Project name: "))
		projectName = promptUser("")
		if projectName == "" {
			return fmt.Errorf("project name required")
		}
		// Check availability (using token if logged in)
		auth, _ := loadConfig()
		if auth != nil {
			if err := checkBucketAvailability(auth.Token, projectName); err != nil {
				return err
			}
		}
	}

	// 4. Determine branch
	branch, err := getCurrentBranch()
	if err != nil {
		branch = "main"
	}

	// 5. Generate Workflow
	workflowDir := filepath.Join(repoRoot, ".github", "workflows")
	if err := os.MkdirAll(workflowDir, 0755); err != nil {
		return fmt.Errorf("failed to create workflow directory: %w", err)
	}

	workflowName := "deploy.yml"
	if subDir != "" {
		workflowName = fmt.Sprintf("deploy-%s.yml", strings.ReplaceAll(subDir, string(filepath.Separator), "-"))
	}
	workflowPath := filepath.Join(workflowDir, workflowName)

	workflowYAML := generateWorkflow(projectName, subDir, branch)
	if err := os.WriteFile(workflowPath, []byte(workflowYAML), 0644); err != nil {
		return fmt.Errorf("failed to write workflow file: %w", err)
	}

	// 6. Save/Update project config
	if err := saveProjectConfig(projectName, ""); err != nil {
		printWarning(fmt.Sprintf("Could not save .deployer/config.json: %v", err))
	}

	fmt.Println()
	printSuccess(fmt.Sprintf("Created GitHub Action: %s", workflowPath))
	fmt.Println()
	fmt.Println(bold("═══════════════════════════════════════"))
	fmt.Printf("%s %s\n", yellow("🔑"), bold("Action Required: Add Secret"))
	fmt.Println(bold("═══════════════════════════════════════"))
	fmt.Println("Add your deploy token as a GitHub secret:")
	fmt.Println()
	fmt.Println("  1. GitHub Settings -> Secrets -> Actions")
	fmt.Println("  2. Name:  " + bold("DEPLOYER_TOKEN"))
	fmt.Println("  3. Value: (Your token from 'deployer login')")
	fmt.Println(bold("═══════════════════════════════════════"))
	fmt.Println()

	return nil
}

func findGitRoot() (string, error) {
	out, err := exec.Command("git", "rev-parse", "--show-toplevel").Output()
	if err != nil {
		return "", err
	}
	return strings.TrimSpace(string(out)), nil
}

func getCurrentBranch() (string, error) {
	out, err := exec.Command("git", "rev-parse", "--abbrev-ref", "HEAD").Output()
	if err != nil {
		return "", err
	}
	return strings.TrimSpace(string(out)), nil
}

func generateWorkflow(projectName, subDir, branch string) string {
	pathFilter := ""
	workingDir := ""
	
	if subDir != "" {
		pathFilter = fmt.Sprintf("\n    paths:\n      - '%s/**'", subDir)
		workingDir = fmt.Sprintf("\n    defaults:\n      run:\n        working-directory: %s", subDir)
	}

	return fmt.Sprintf(`name: Deploy %s to DeployNet

on:
  push:
    branches: [%s]%s

jobs:
  deploy:
    runs-on: ubuntu-latest%s
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm ci
      - name: Build project
        run: npm run build
      - name: Deploy
        env:
          DEPLOYER_TOKEN: ${{ secrets.DEPLOYER_TOKEN }}
        run: |
          curl -sL https://deployer-be.dsingh.fun/api/cli/latest -o deployer
          chmod +x deployer
          ./deployer deploy --ci --token "$DEPLOYER_TOKEN"
`, projectName, branch, pathFilter, workingDir)
}

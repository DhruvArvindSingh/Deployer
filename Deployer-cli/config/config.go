package config

// Centralized CLI configuration.
// Update these values and rebuild the binary when you want
// to point the CLI to a different backend or auth page.

// APIURL is the base URL for the DeployNet backend.
// Example: "http://localhost:8080" or "https://api.example.com".
const APIURL = "https://deployer-be.dsingh.fun"

// AuthURL is the URL of the auth page opened during `deployer login`.
// Example: "http://localhost:3000" or "https://deployer-cli.example.com".
const AuthURL = "https://deployer-cli.dsingh.fun"

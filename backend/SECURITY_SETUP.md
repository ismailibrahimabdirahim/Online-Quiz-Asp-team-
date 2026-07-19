# Security Configuration Setup

This project uses User Secrets for storing sensitive configuration data. This prevents sensitive credentials from being committed to GitHub.

## Setting Up User Secrets

### 1. Initialize User Secrets
Run the following command in the backend directory:
```bash
cd backend
dotnet user-secrets init
```

### 2. Set Connection String
```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost;Database=QuizMasterProDb;User=root;Password=YOUR_PASSWORD;"
```

Replace `YOUR_PASSWORD` with your actual MySQL password.

### 3. Set JWT Secret
```bash
dotnet user-secrets set "JwtSettings:Secret" "YOUR_LONG_SECURE_SECRET_KEY_HERE"
```

Generate a secure random key (at least 32 characters) for the JWT secret.

## Example User Secrets Configuration
Your user secrets file should contain:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=QuizMasterProDb;User=root;Password=your_password;"
  },
  "JwtSettings": {
    "Secret": "your_very_long_secure_random_secret_key_minimum_32_characters"
  }
}
```

## For Production Deployment
In production, use environment variables instead of user secrets:
- `ConnectionStrings__DefaultConnection`
- `JwtSettings__Secret`

## Security Notes
- Never commit sensitive credentials to GitHub
- Use strong, unique passwords
- Generate secure random JWT secrets
- The `appsettings.json` file in the repo contains empty values for security

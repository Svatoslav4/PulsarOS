# PULSAR Backend

The backend service for **PULSAR**, a desktop application built with Electron. This API is developed with **NestJS** and **TypeScript** and provides the server-side layer used by the PULSAR client.

> **Project note:** Update the API routes and environment variables in this document to match the controllers and configuration currently implemented in your repository.

## Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API](#api)
- [Testing](#testing)
- [Docker](#docker)
- [CI/CD](#cicd)
- [Deploying to Render](#deploying-to-render)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

PULSAR Backend is the API service for the PULSAR desktop client. It is intended to keep server-side functionality separate from the Electron application and frontend.

Depending on the controllers enabled in your current version, the API may provide system-information or monitoring data such as CPU, memory, disk, process, network, or GPU information. Check the source controllers to confirm the exact capabilities and routes available in your build.

## Technology Stack

- **Node.js** — JavaScript runtime
- **NestJS** — backend application framework
- **TypeScript** — application language
- **pnpm** — package manager
- **Docker** — containerized builds and local execution
- **GitHub Actions** — continuous integration and deployment workflow automation
- **Render** — hosting and deployment platform

## Prerequisites

Install the following tools before running the project locally:

- Node.js 22 or another version supported by the project's `engines` setting
- pnpm (use the version configured by the repository and CI workflow)
- Git
- Docker and Docker Compose, if you want to run the application in a container

Check the installed versions:

```bash
node --version
pnpm --version
git --version
```

## Getting Started

### 1. Clone the repository

```bash
git clone <YOUR_BACKEND_REPOSITORY_URL>
cd <YOUR_BACKEND_DIRECTORY>
```

Replace the placeholders with your repository URL and directory name.

### 2. Install dependencies

```bash
pnpm install --frozen-lockfile
```

### 3. Configure environment variables

Create a local `.env` file in the project root. Use `.env.example` as a template if the repository contains one. Never commit secrets or production credentials.

For example, if these variables are used by the application:

```dotenv
NODE_ENV=development
PORT=3000
```

Add any other variables required by your actual code, such as database or authentication settings, if applicable.

### 4. Start the development server

```bash
pnpm run start:dev
```

NestJS will start the API using the configuration defined in the project. If the application listens on port `3000`, the local base URL is:

```text
http://localhost:3000
```

If `main.ts` configures a global API prefix, include that prefix in requests. For example, a global prefix of `api` makes the base path `http://localhost:3000/api`.

### 5. Build and run the production version

```bash
pnpm run build
pnpm run start:prod
```

Confirm that the production start command in `package.json` points to the actual compiled entry file. A common NestJS output path is `dist/main.js`.

## Environment Variables

The exact variables depend on the features enabled in your backend. Document each variable used by the application in `.env.example` and configure production values in Render's **Environment** settings.

| Variable | Purpose | Example |
|---|---|---|
| `NODE_ENV` | Application environment | `development` or `production` |
| `PORT` | HTTP port used by the API | `3000` locally; Render may provide its own value |
| `DATABASE_URL` | Database connection string, only if a database is used | Set in the environment; do not commit credentials |
| `JWT_SECRET` | Signing secret, only if JWT authentication is implemented | Use a long, random secret |

Do not add a variable to production unless the application actually uses it. If Render provides a `PORT` value, the server should listen on `process.env.PORT` and bind to `0.0.0.0` where required by the hosting environment.

## Available Scripts

Run `pnpm run` to see the scripts defined by the repository's `package.json`. Typical NestJS scripts include:

| Command | Purpose |
|---|---|
| `pnpm run start` | Start the application |
| `pnpm run start:dev` | Start in watch mode for development |
| `pnpm run build` | Compile the TypeScript application |
| `pnpm run start:prod` | Run the compiled application |
| `pnpm run lint` | Run lint checks, if configured |
| `pnpm run test` | Run unit tests, if configured |
| `pnpm run test:e2e` | Run end-to-end tests, if configured |

The commands available in your repository are determined by `package.json`; scripts in this table may need to be adjusted to match it.

## API

The API is implemented through NestJS controllers and services. The authoritative route definitions are in the source code under `src/`.

To document the exact API, list each implemented endpoint with its HTTP method, path, authentication requirements, query parameters, request body, and response shape. Do not rely on example routes that are not present in the code.

If Swagger/OpenAPI is enabled, document its configured URL here, for example:

```text
http://localhost:3000/<SWAGGER_PATH>
```

Replace `<SWAGGER_PATH>` with the actual path configured by the application. If Swagger is not enabled, remove this section or add it when documentation is implemented.

## Testing

Run the tests configured in `package.json`:

```bash
pnpm run test
```

For end-to-end tests, if the project defines the script:

```bash
pnpm run test:e2e
```

For test coverage, if the project defines the script:

```bash
pnpm run test:cov
```

A passing build does not replace unit or integration tests. Add tests for controllers, services, error handling, validation, and any external integrations used by the backend.

## Docker

The repository can be containerized with the `Dockerfile` and `docker-compose.yml` files, if present.

### Build the image

```bash
docker compose build
```

### Start the container

```bash
docker compose up -d
```

### View logs

```bash
docker compose logs -f pulsar-backend
```

### Stop the container

```bash
docker compose down
```

Make sure that the Compose service name matches the service name in `docker-compose.yml`. Keep `.env` out of version control and provide required environment variables securely at runtime.

## CI/CD

PULSAR Backend can use GitHub Actions to automate verification and deployment.

Recommended workflow files:

```text
.github/
└── workflows/
    ├── ci.yml
    └── cd.yml
```

- **CI** installs locked dependencies, runs lint checks and tests when configured, and builds the NestJS application.
- **CD** triggers a Render deployment only after the configured CI workflow succeeds on the production branch.

The workflow names and branch filters in `cd.yml` must match the actual CI workflow and production branch. Do not store deployment hooks or other secrets directly in workflow files.

### GitHub secret for Render

If `cd.yml` uses a Render Deploy Hook, add this repository secret in **GitHub → Settings → Secrets and variables → Actions → New repository secret**:

| Name | Value |
|---|---|
| `RENDER_DEPLOY_HOOK_URL` | The private Deploy Hook URL copied from the corresponding Render service |

Treat the Deploy Hook URL like a password. If it is exposed, rotate or replace it in Render and update the GitHub secret.

## Deploying to Render

1. Push the backend repository to GitHub.
2. In Render, create or open the Web Service connected to that repository.
3. Configure the service to use the repository's `Dockerfile` if deploying with Docker. Otherwise, configure the correct native build and start commands for the project.
4. Add all required environment variables in the service's **Environment** settings.
5. Confirm the application listens on the port provided by the environment.
6. Trigger a deployment and inspect the Render logs for build or startup errors.
7. If using GitHub Actions for CD, create a Render Deploy Hook for the service and store it as `RENDER_DEPLOY_HOOK_URL` in GitHub repository secrets.

Avoid configuring two competing automatic deployment mechanisms unless that behavior is intentional. If Render's automatic deploy is enabled for every push and GitHub Actions also triggers a Deploy Hook, one commit may cause redundant deployment attempts.

## Project Structure

A typical NestJS backend has a structure similar to the following. The exact modules in PULSAR may differ:

```text
.
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   └── ...                 # Controllers, services, modules, DTOs
├── test/                   # Unit or end-to-end tests, if present
├── .github/
│   └── workflows/          # CI/CD workflows
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .env.example
├── nest-cli.json
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

## Troubleshooting

### Dependencies cannot be installed

- Verify that Node.js and pnpm versions match the project configuration.
- Ensure `pnpm-lock.yaml` is committed and in sync with `package.json`.
- Run `pnpm install` locally, resolve dependency changes, and commit the updated lockfile.

### The application exits after starting

- Check the terminal output or Render logs.
- Confirm that all required environment variables are configured.
- Verify that the production start command points to the actual compiled entry point.

### The client cannot reach the API

- Confirm the backend is running and the URL is correct.
- Check CORS configuration if a browser-based client is involved.
- Confirm that the frontend uses the correct API prefix and the production Render URL.
- Do not assume that a local `localhost` URL is reachable from a deployed client.

### Docker build fails

- Check that the Docker build context includes `package.json` and `pnpm-lock.yaml`.
- Verify that the Dockerfile's Node and pnpm versions support the project.
- Review the build logs for missing generated files, environment variables, or native dependencies.

## Contributing

1. Create a feature branch.
2. Make the change and add or update tests where appropriate.
3. Run the available lint, test, and build commands locally.
4. Open a pull request and resolve any failing CI checks.

## License

Add the project's license here. If the repository is not licensed for public reuse, do not assume that it is open source.


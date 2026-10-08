# AWS CI/CD Lab

Production-style AWS CI/CD laboratory demonstrating how to build, containerize, continuously integrate, and continuously deploy a Node.js application to Amazon ECS using GitHub Actions and AWS IAM OIDC.

The lab is intentionally designed to practice real-world cloud engineering concepts while minimizing unnecessary AWS costs.

## Architecture

```text
                         ┌─────────────────────┐
                         │      Developer      │
                         │      git push       │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │       GitHub        │
                         │     Repository      │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   GitHub Actions    │
                         │                     │
                         │  OIDC authentication│
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      AWS STS        │
                         │ Temporary credentials│
                         └──────────┬──────────┘
                                    │
                                    ▼
                    ┌──────────────────────────────┐
                    │ IAM GitHub Actions Role      │
                    │                              │
                    │ ECR + ECS deployment access  │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
             ┌─────────────┐              ┌─────────────┐
             │     ECR     │              │     ECS     │
             │ Docker image│              │   Fargate   │
             └─────────────┘              └──────┬──────┘
                                                │
                                                ▼
                                         ┌─────────────┐
                                         │  Node.js    │
                                         │ Application │
                                         └─────────────┘
```

## Application

The lab application is a small Node.js HTTP service used to demonstrate the deployment lifecycle.

Endpoints:

```text
GET /health
GET /version
```

Example:

```bash
curl http://<application-endpoint>/health
```

Response:

```json
{
  "status": "healthy"
}
```

Version endpoint:

```bash
curl http://<application-endpoint>/version
```

Example response:

```json
{
  "version": "ecr-latest",
  "environment": "production"
}
```

## Technology Stack

* Node.js
* TypeScript
* Docker
* Amazon ECR
* Amazon ECS
* AWS Fargate
* Application Load Balancer
* Amazon CloudWatch
* AWS CodeBuild
* AWS CodePipeline
* AWS IAM
* AWS STS
* GitHub Actions
* GitHub OIDC
* AWS CLI

## CI/CD Evolution

This project intentionally builds the delivery system progressively.

### Phase 1 — Local Node API

Build and run the application locally.

### Phase 2 — Docker

Containerize the application using a multi-stage Docker build.

### Phase 3 — Amazon ECR

Push versioned container images to Amazon Elastic Container Registry.

### Phase 4 — Amazon ECS / Fargate

Deploy the container to Amazon Elastic Container Service using AWS Fargate.

### Phase 5 — Application Load Balancer + CloudWatch

Expose the service through an Application Load Balancer and integrate application logging with CloudWatch.

### Phase 6 — AWS CodeBuild

Introduce automated container builds using AWS CodeBuild.

### Phase 7 — AWS CodePipeline

Create an AWS-native continuous delivery pipeline connecting source, build, ECR, and ECS.

### Phase 8 — IAM + GitHub OIDC

Replace long-lived AWS credentials with short-lived credentials obtained through GitHub's OpenID Connect federation with AWS.

Deployment flow:

```text
GitHub
   │
   │ OIDC
   ▼
AWS STS
   │
   │ temporary credentials
   ▼
IAM deployment role
   │
   ├── ECR
   │
   └── ECS
```

No static AWS access keys are required by the GitHub Actions deployment.

### Phase 9 — Terraform

Rebuild the infrastructure using Infrastructure as Code.

### Phase 10 — Deployment Failure / Rollback

Intentionally introduce deployment failures and practice recovery and rollback procedures.

### Phase 11 — Security Hardening

Review and tighten IAM permissions, networking, container security, secrets management, logging, and deployment controls.

### Phase 12 — Resource Cleanup

Destroy the lab infrastructure and verify that no unnecessary AWS resources remain.

## Security

The deployment uses GitHub OIDC rather than storing long-lived AWS access keys in GitHub.

The GitHub Actions workflow requests:

```yaml
permissions:
  id-token: write
  contents: read
```

AWS then validates the GitHub identity and issues temporary credentials to the dedicated deployment role.

The role is restricted to the resources required for the deployment, including:

* ECR authentication
* ECR image push
* ECS task-definition registration
* ECS service updates
* Passing the ECS task execution role

The ECS task execution role is separately scoped from the GitHub Actions deployment role.

### Credential verification

The public repository was checked for static AWS credentials.

Verified:

* No GitHub repository secrets containing AWS credentials
* No AWS access keys in the working tree
* No AWS secret access keys in the working tree
* No `AKIA...` access key patterns
* No `ASIA...` temporary credential patterns
* No credential files tracked by Git
* `.env` files excluded through `.gitignore`
* GitHub Actions uses OIDC-based authentication

## Cost-Conscious Design

This laboratory is intentionally designed to minimize unnecessary AWS spending.

Principles:

* No NAT Gateway
* No RDS
* No EKS
* Single Fargate task
* Small Fargate task size
* No unnecessary replicas
* ALB used only when required for the relevant phase
* CloudWatch retention kept small
* Resources stopped or destroyed after exercises
* Infrastructure is created, tested, and cleaned up deliberately

The goal is to gain production-oriented experience without maintaining an unnecessary always-on environment.

## Docker

The application uses a multi-stage Docker build.

The builder stage installs dependencies and compiles TypeScript.

The runtime stage contains only the production dependencies and compiled application.

The container runs as a non-root user.

The base image is pulled from Amazon ECR Public to avoid unnecessary Docker Hub rate-limit issues during AWS builds.

## Deployment Strategy

Container images are tagged using the Git commit SHA.

Example:

```text
aws-cicd-lab:<git-sha>
```

This provides an immutable reference between:

```text
Git commit
    ↓
Docker image
    ↓
ECR
    ↓
ECS task definition
    ↓
Running application
```

This makes deployments traceable and supports future rollback exercises.

## AWS Resources

Primary resources used throughout the lab include:

```text
ECR Repository
└── aws-cicd-lab

ECS Cluster
└── aws-cicd-lab

ECS Service
└── aws-cicd-lab-service

ECS Task Definition
└── aws-cicd-lab

IAM Roles
├── aws-cicd-lab-github-actions-role
└── aws-cicd-lab-ecsTaskExecutionRole

CodeBuild
└── aws-cicd-lab

CodePipeline
└── aws-cicd-lab
```

## Learning Objectives

This lab is intended to build practical experience with:

* Containerization
* AWS networking
* ECS and Fargate
* Container registries
* Load balancing
* CloudWatch
* Continuous Integration
* Continuous Delivery
* IAM
* IAM policy design
* OIDC federation
* Temporary AWS credentials
* GitHub Actions
* AWS CodeBuild
* AWS CodePipeline
* Deployment traceability
* Infrastructure as Code
* Failure recovery
* Rollbacks
* Cloud cost management
* Production security practices

## Repository Philosophy

The goal of this project is not simply to make an application run.

The goal is to understand the **entire software delivery system**:

```text
Source
  ↓
Build
  ↓
Test
  ↓
Package
  ↓
Registry
  ↓
Authentication
  ↓
Deployment
  ↓
Infrastructure
  ↓
Observability
  ↓
Security
  ↓
Failure recovery
  ↓
Rollback
  ↓
Cleanup
```

Each phase is implemented deliberately so that the underlying systems, permissions, dependencies, and operational behavior can be understood rather than abstracted away.

## Current Status

| Phase | Area               | Status     |
| ----- | ------------------ | ---------- |
| 1     | Local Node API     | ✅ Complete |
| 2     | Docker             | ✅ Complete |
| 3     | ECR                | ✅ Complete |
| 4     | ECS / Fargate      | ✅ Complete |
| 5     | ALB + CloudWatch   | ✅ Complete |
| 6     | CodeBuild CI       | ✅ Complete |
| 7     | CodePipeline CD    | ✅ Complete |
| 8     | IAM + GitHub OIDC  | ✅ Complete |
| 9     | Terraform          | ⏭️ Next    |
| 10    | Failure / Rollback | ⏳ Planned  |
| 11    | Security Hardening | ⏳ Planned  |
| 12    | Destroy / Cleanup  | ⏳ Planned  |

## License

This project is intended as a personal cloud engineering and portfolio laboratory.


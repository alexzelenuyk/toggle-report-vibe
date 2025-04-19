# Contributing to Toggle Report Vibe

Thank you for your interest in contributing to Toggle Report Vibe! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone. Please be considerate of differing viewpoints and experiences, and focus on constructive feedback and collaboration.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/toggle-report-vibe.git
   cd toggle-report-vibe
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up your development environment**:
   ```bash
   npm run dev
   ```

## Development Workflow

1. **Create a new branch** for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
   
2. **Make your changes** in the codebase

3. **Ensure your code passes all checks**:
   ```bash
   npm run lint        # Run ESLint
   npm run typecheck   # TypeScript type checking
   npm test            # Run unit and component tests
   npm run build       # Verify build works
   ```

4. **Commit your changes** with descriptive commit messages:
   ```bash
   git commit -m "Add feature: description of the feature"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Submit a pull request** to the main repository

## Pull Request Process

1. Fill out the pull request template completely, including:
   - Clear description of the changes
   - Related issues
   - Type of change
   - Testing information

2. Ensure all CI checks pass

3. Request reviews from maintainers

4. Address any feedback from the code review

5. Once approved, a maintainer will merge your PR

## Coding Standards

This project follows specific coding standards to maintain consistency across the codebase:

### TypeScript

- Use TypeScript for type safety
- Define interfaces for data structures
- Avoid using `any` type when possible
- Add JSDoc comments for functions and components

### React Components

- Use functional components with hooks instead of class components
- Follow the React hooks rules
- Keep components focused on a single responsibility
- Add "use client" directive for client components
- Name components using PascalCase

### Style Guidelines

- Use Material UI components and patterns
- Use the `sx` prop for styling Material UI components
- Organize imports: React, Next.js, MUI, other libraries, local components/utils
- Use named exports over default exports

### State Management

- Group state variables by related functionality
- Use React hooks for state management
- Keep state as close to where it's needed as possible

## Testing

All code changes should be accompanied by appropriate tests:

### Unit Tests

- Write tests for utility functions and core logic
- Ensure good coverage of edge cases
- Use Jest for unit testing

### Component Tests

- Test React components using React Testing Library
- Focus on testing component behavior, not implementation details
- Test user interactions similar to how a real user would interact

### Running Tests

```bash
npm test            # Run all tests
npm test -- --watch # Run tests in watch mode
```

## Documentation

- Update the README.md if you add new features or change existing functionality
- Add JSDoc comments to functions and components
- Include examples in documentation when helpful
- Update the report format documentation if you change the output format

---

Thank you for contributing to Toggle Report Vibe! Your efforts help make this project better for everyone.
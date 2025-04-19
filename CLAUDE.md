# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- Install: `npm install`
- Start development: `npm run dev`
- Build: `npm run build`
- Start production: `npm start`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`

## Project Structure
- `/src/app` - Next.js app router and pages
- `/src/components` - React components
- `/src/lib` - Utilities and API functions
- `/public` - Static assets

## Code Style Guidelines
- Use TypeScript for type safety
- Follow Material UI patterns for components and styling
- Use MUI components and sx prop for styling
- Organize imports: React, Next.js, MUI, other libraries, local components/utils
- Use named exports over default exports
- Prefer functional components with React hooks
- Use "use client" directive for client components
- Use camelCase for variables and functions, PascalCase for components/types
- Wrap API calls in try/catch blocks with proper error handling
- Use async/await over promises
- Group state variables by related functionality
- Keep components small and focused on a single responsibility
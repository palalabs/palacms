# PalaCMS V3 Development Guide

## Project Overview

PalaCMS V3 is a self-hosted CMS built with SvelteKit and PocketBase, focused on visual page building, custom content types, and real-time collaboration.

## Development Environment

### Scripts

- `npm run dev` - Start development server with devenv
- `npm run build` - Build for production (with increased memory limit)
- `npm run preview` - Preview production build
- `npm run test` - Run Playwright tests
- `npm run check` - Type checking with svelte-check
- `npm run lint` - Check code formatting with Prettier
- `npm run format` - Format code with Prettier

### Key Technologies

- **Frontend**: SvelteKit 2.x with Svelte 5
- **Backend**: PocketBase with JavaScript hooks
- **UI**: Tailwind CSS 4, bits-ui components
- **Code Editing**: CodeMirror 6 with Svelte language support
- **Rich Text**: TipTap editor
- **Testing**: Playwright for E2E tests

## Architecture

### Core Directories

- `app/lib/builder/` - Main page builder components and logic
- `app/lib/common/models/` - TypeScript data models and types
- `app/lib/pocketbase/` - PocketBase client and collection mappings
- `app/lib/components/` - Shared UI components
- `app/routes/` - SvelteKit routes and pages
- `pb_hooks/` - PocketBase server-side JavaScript hooks
- `pb_migrations/` - Database schema migrations

### Key Components

- **ComponentPreview.svelte** - Live preview of user components
- **Primo.svelte** - Main page builder interface
- **Field Types** (`app/lib/builder/field-types/`) - Form field components
- **CodeEditor** - Syntax-highlighted code editing with autocomplete

### Data Models

All models are in `app/lib/common/models/`:

- `Site.ts` - Site-level configuration and fields
- `Page.ts` - Individual pages with content
- `PageType.ts` - Page templates and schemas
- `Symbol.ts` - Reusable components/blocks
- Field types for various content inputs

## Development Workflow

### Adding New Features

1. Create data models in `app/lib/common/models/` if needed
2. Add PocketBase migrations in `pb_migrations/`
3. Implement UI components in appropriate directories
4. Add routes in `app/routes/` if needed
5. Write tests in `tests/e2e/`

### Working with PocketBase

- Database is in `pb_data/`
- Hooks are in `pb_hooks/` (CommonJS format)
- Migrations use JavaScript in `pb_migrations/`
- Collection types are auto-generated in `pb_data/types.d.ts`

### Code Style

- Use Prettier for formatting (`npm run format`)
- Follow existing component patterns in the codebase
- TypeScript interfaces should extend base types from `app/lib/common/models/`

### Testing

- E2E tests use Playwright
- Test files are in `tests/e2e/`
- Run tests with `npm run test`

## Current Development Status

- ✅ Core page builder functionality
- ✅ Field types and dynamic content
- ✅ PocketBase integration
- 🚧 Real-time collaboration features
- 🚧 Block/starter library
- 🚧 Marketplace integration

## Troubleshooting

- Build issues: Try increasing Node memory with `NODE_OPTIONS=--max_old_space_size=16384`
- PocketBase issues: Check `pb_data/` permissions and migrations
- Type errors: Run `npm run check` for detailed diagnostics

## Git Workflow

Current branch: `pocketbase-4`
Main branch: `master`

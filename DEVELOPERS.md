# Developer Guide

This guide covers the technical aspects of working **on the PalaCMS codebase itself** - whether you're contributing, forking, or just trying to understand how it works.

> **Looking to build with PalaCMS?** If you want to learn how to create blocks, templates, or sites using PalaCMS, check out our user documentation at [palacms.com/docs](https://palacms.com/docs).

## 🏗️ Architecture Overview

### Tech Stack

- **Frontend**: SvelteKit 2.x with Svelte 5
- **Backend**: PocketBase with JavaScript hooks
- **Database**: SQLite (via PocketBase)
- **UI Framework**: Tailwind CSS 4 with bits-ui components
- **Code Editing**: CodeMirror 6 with Svelte language support
- **Rich Text**: TipTap editor (built on ProseMirror 6)
- **Testing**: Playwright for E2E tests

### Project Structure

```
palacms/
├── app/                    # Main SvelteKit application
│   ├── lib/
│   │   ├── builder/        # Core page builder components
│   │   │   ├── components/ # Builder UI components
│   │   │   ├── stores/     # Svelte stores for state
│   │   │   ├── utils/      # Utility functions
│   │   │   └── views/      # Builder views (editor, modals)
│   │   ├── common/
│   │   │   └── models/     # TypeScript data models
│   │   ├── pocketbase/     # PocketBase client & collection mappings
│   │   └── components/     # Shared UI components
│   └── routes/            # SvelteKit routes and pages
│       ├── admin/         # Admin interface routes
│       └── dashboard/     # Dashboard routes
├── pb_hooks/              # PocketBase server-side JavaScript hooks
├── pb_migrations/         # Database schema migrations
├── pb_data/               # PocketBase database & uploaded files
├── tests/                 # Test suites
│   └── e2e/              # End-to-end Playwright tests
└── static/               # Static assets
```

## 🚀 Development Setup

### Prerequisites

- Node.js higher than v18
- npm (pnpm is not currently supported)
- Git
- devenv or Dev Container compatible development environment 

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/palacms/palacms.git
   cd palacms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   This starts both the SvelteKit dev server and PocketBase backend.

4. **Access the application**
   - Main app: http://localhost:5173
   - PocketBase Admin: http://localhost:8090/_/
   - Built app: http://localhost:8090

### Available Scripts

- `npm run dev` - Start development server with devenv
- `npm run build` - Build for production (with increased memory limit)
- `npm run preview` - Preview production build

## 📝 Core Concepts

### Sites & Pages
- **Sites** contain global content 
- **Page Types** define reusable page templates with predefined sections and fields
- **Pages** are individual content items with their own page-level content and sections

### Blocks (called Symbols internally)
- Contain HTML, CSS, and JS powered by Svelte
- Can contain dynamic **Fields** for content editing
- Available in both **Site Library** and **Global Library**

### Fields & Content
- **Site Fields** - Global content that appears across pages (e.g. Logo, Site Navigation, Social Links)
- **Page Fields** - Content specific to individual pages  (e.g. Post Title, Event Date, Person Bio)
- **Block Fields** - Content within blocks - each section containing its own entries
- Support for text, rich text, images, repeaters, and conditional logic

## 🗄️ Working with PocketBase

### Database Schema

- Schema changes go in `pb_migrations/`
- Migrations use JavaScript format
- Collection types are auto-generated in `pb_data/types.d.ts`

### Server Hooks

- Hooks are in `pb_hooks/` (CommonJS format)
- Keep hooks lightweight and focused
- Handle errors gracefully
- Used for validation, data transformation, and business logic

### Collections & Data Access

- Use the CollectionMapping system for reactive data access
- Collections are defined in `app/lib/pocketbase/collections.ts`
- Follow existing patterns for CRUD operations
- Data models are in `app/lib/common/models/`

Example:
```javascript
// Get a site with reactive updates
const site = Sites.one(siteId)

// Create a new page
const newPage = Pages.create({
  name: 'New Page',
  slug: 'new-page',
  site: siteId
})

// Update and commit changes
Pages.update(pageId, { name: 'Updated Name' })
await manager.commit()
```

### State Management

- **Global state**: Use Svelte stores in `$lib/builder/stores/`
- **Component state**: Keep local with `$state()` when possible
- **Context**: Use for deeply nested component communication
- **URL state**: Use SvelteKit's page store for shareable state

### Styling Guidelines

- Use Tailwind CSS classes for styling
- Custom CSS in component `<style>` blocks when needed
- Follow existing color and spacing patterns
- Use CSS custom properties for theme values

## 🐛 Debugging & Troubleshooting

### Common Issues

**Build Errors**
```bash
# Increase Node memory for large builds
NODE_OPTIONS=--max_old_space_size=16384 npm run build
```

**PocketBase Issues**
- Check `pb_data/` permissions and ownership
- Verify migrations have run successfully
- Check PocketBase logs in the terminal
- Use PocketBase admin UI at :8090 to inspect data

**Type Errors**
```bash
# Get detailed TypeScript diagnostics
npm run check

# Check specific file
npx svelte-check --watch
```

**Performance Issues**
- Use browser DevTools Performance tab
- Check for unnecessary rerenders with Svelte DevTools
- Profile database queries in PocketBase admin

### Development Tips

1. **Hot Module Replacement**: The dev server supports HMR for fast iteration
2. **Browser DevTools**: Use Svelte DevTools extension for component inspection
3. **PocketBase Admin**: Use the admin UI at :8090 to inspect and modify data
4. **Console Debugging**: Use `$inspect()` rune for reactive debugging
5. **Network Tab**: Monitor API calls to PocketBase

## 🚀 Deployment

### Production Build

```bash
# Build the application
npm run build

# Preview the build locally
npm run preview
```

### Environment Setup

The app uses these environment variables:


# Production (optional - defaults to same host)
POCKETBASE_URL=https://your-pocketbase-instance.com
```

Note: Setting `POCKETBASE_URL` is primarily for development or when PocketBase is hosted separately from the SvelteKit app. For production deployments, see the [PocketBase deployment documentation](https://pocketbase.io/docs/going-to-production/).

### Hosting Options

**SvelteKit App:**
- Vercel, Netlify, or any Node.js hosting
- Can be deployed as static site or with server-side features

**PocketBase Backend:**
- VPS with SQLite support
- Docker containers
- Cloud services like Railway, Fly.io

## 📚 Code Style & Patterns

### TypeScript

- All new code should be TypeScript
- Data models extend base types from `app/lib/common/models/`
- Use proper typing for Svelte components and stores
- Prefer interfaces over types for object shapes

### File Organization

- Components: PascalCase (e.g., `ComponentName.svelte`)
- Utilities: camelCase (e.g., `utilityFunction.ts`)
- Stores: camelCase (e.g., `userStore.ts`)
- Routes: lowercase with hyphens (e.g., `user-settings/`)

### Naming Conventions

- Use descriptive names that explain intent
- Prefer explicit over clever
- Use consistent naming across similar features
- Follow existing patterns in the codebase

## 🔌 Extending PalaCMS

### Adding New Field Types

1. Create field component in `app/lib/builder/field-types/`
2. Add to field type registry
3. Define TypeScript interfaces
4. Add validation logic
5. Write tests

### Creating Custom Views

1. Add route in `app/routes/`
2. Create view components
3. Handle authentication and permissions
4. Add navigation if needed

### Adding PocketBase Hooks

1. Create hook file in `pb_hooks/`
2. Use CommonJS module format
3. Handle errors gracefully
4. Test thoroughly with various scenarios

## 📄 Additional Resources

- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Svelte 5 Guide](https://svelte-5-preview.vercel.app/docs/introduction)
- [PocketBase Documentation](https://pocketbase.io/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [CodeMirror Documentation](https://codemirror.net/)
- [Playwright Testing](https://playwright.dev/)

---

**Questions?** Check existing issues and discussions, or refer to the [Contributing Guide](CONTRIBUTING.md) for how to get help.
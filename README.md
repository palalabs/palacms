# PalaCMS (formerly Primo) V3 Alpha

> Pala has been temporarily reverted from Beta to Alpha status pending major architectural changes. We're currently working on significant backend changes and restructuring core components that could require a database manual migration in the future. During this transition period, the codebase is functional but should be considered highly experimental. Features, APIs, and architecture are all subject to substantial changes in upcoming releases.

## ✨ V3 Features & Improvements

- Custom Page Types (i.e. Content Types)
- Dynamic content fields (i.e. 'Site Field', 'Page Field', 'Page' to update entity page content referenced on other pages)
- Block/Starter Library
- Design system editor
- 10x faster build times bc every page gets generated on update, instead of all at once. 
- Conditional fields (to show/hide fields based on preceding field values)
- CSS-library compatibility (bootstrap, tailwind, bulma, etc. all work reliably using a standard cdn link). 
- UI/UX improvements
  - Drag pages to reorder them in the page list
  - Drag repeater items to reorder them
  - Drag-and-drop functionality improved for adding blocks to page & now works on mobile.
  - Block editor organized into code & content (i.e. fields & entries), UI improved.
  - On-page editing significantly improved.

## 🔄 Migrating from V2 to V3

PalaCMS V3 includes significant improvements that require setting up a new database. Follow these steps to migrate your sites from V2 to V3:

### Step 1: Export Your V2 Site File
1. Navigate to your published V2 site
2. Add `/primo.json` to the end of your site URL (e.g., `https://your-site.com/primo.json`)
3. Save this JSON file

### Step 2: Import to PalaCMS V3
1. Log in to PalaCMS V3
2. Select "Create Site"
3. Choose "Upload Site File" option
4. Upload the JSON file you saved from V2

### Step 3: Review and Update
1. Verify all pages and content migrated correctly
2. Take advantage of new V3 features like Custom Page Types and Dynamic Fields
3. Test your site thoroughly before publishing

> **Note:** While the migration process preserves your content and structure, you may need to make minor adjustments to take full advantage of V3's new features.


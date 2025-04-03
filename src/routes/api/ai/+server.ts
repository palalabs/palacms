import { json, error as server_error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import Anthropic from '@anthropic-ai/sdk';
import { PRIVATE_CLAUDE_KEY } from '$env/static/private'
import authorize from '../authorize';

const anthropic = new Anthropic({
  apiKey: PRIVATE_CLAUDE_KEY,
});

// const instructions = `
// Prompt for Creating Weave CMS Blocks

// Context
// Create blocks for Weave CMS, a modern content management system that couples code and content at the component level. Weave blocks are self-contained page sections built with Svelte that include both code and editable content fields.

// Requirements

// Block Structure
// - Create a Svelte component with clean, responsive layout
// - Use semantic HTML for proper structure and accessibility
// - Define content fields directly within the block
// - Follow Weave's CSS naming conventions
// - Integrate with Weave's CSS library where appropriate
// - Organize fields in the same order they appear visually on the page

// Component Architecture
// - Create separate component classes for all divisible or reusable units within the block
// - Examples of components that should have their own classes:
//   - card - A container with specific styling that holds related content
//   - hero-content - The content section of a hero block
//   - feature-item - An individual feature in a feature list
//   - button-group - A collection of related buttons
//   - image-gallery - A container for multiple images
//   - testimonial - A styled quote with attribution
//   - pricing-plan - An individual pricing option
//   - nav-item - A navigation element
//   - form-field - A styled input container
//   - accordion-item - A toggle/expand section in an accordion
// - Use these component classes (without prefix) as the building blocks of your design
// - Child elements within these components should use the underscore prefix

// CSS Naming Conventions
// - Root components: no prefix (e.g., .card, .hero, .button-group)
// - Child elements: underscore prefix (e.g., ._content, ._title, ._icon)
// - Modifiers: hyphen prefix (e.g., -large, -outlined, -featured)
// - Properly nest child classes within parent components in CSS
// - When a section of a component becomes complex, break it out as its own component

// Example progression:
// // Simple version
// <div class="card">
//     <div class="_header">
//         <h2 class="_title">Title</h2>
//     </div>
// </div>

// // When header becomes more complex, it becomes its own component
// <div class="card">
//     <div class="card-header">
//         <div class="_icon">...</div>
//         <h2 class="_title">Title</h2>
//         <div class="_meta">...</div>
//     </div>
// </div>

// CSS Nesting
// Weave uses PostCSS with nesting support. Always use proper CSS nesting for child elements and modifiers:

// // CSS Example
// .card {
//   background: white;

//   &.-large {
//     padding: 2rem;
//   }

//   ._content {
//     padding: 1rem;
//   }

//   ._title {
//     font-size: 1.5rem;
//   }
// }

// .card-header {
//   display: flex;

//   ._icon {
//     margin-right: 0.5rem;
//   }
// }

// Weave CSS Library Integration
// Use Weave's component classes where appropriate:
// - .w--block-container for consistent spacing and width
// - .w--heading for titles and headings
// - .w--button for buttons (with -outline modifier when needed)
// - .w--prose for rich text content

// Field Configuration
// - Use underscore_case for field keys
// - Include fields for all editable content with appropriate types
// - Use the "link" field type for any URLs/buttons that need labels
// - Field IDs should be UUIDs
// - Order fields in the same sequence they appear on the page
// - Avoid adding design customization fields unless specifically requested
// - Always provide appropriate defaults for field values

// IMPORTANT: Field Types and Structure
// Strictly adhere to these field types and structures. Do not invent or use field types that aren't defined here:

// Valid field types:
// - 'repeater' - For repeatable content groups
// - 'group' - For grouped fields
// - 'text' - For single-line text
// - 'markdown' - For rich text content
// - 'image' - For images (with url and alt properties)
// - 'number' - For numeric values
// - 'switch' - For boolean toggles
// - 'url' - For URLs without labels
// - 'link' - For URLs with labels
// - 'select' - For dropdown selection
// - 'icon' - For icon selection
// - 'info' - For informational text
// - 'page-field' - For referencing page properties
// - 'site-field' - For referencing site properties
// - 'page' - For referencing a single page
// - 'page-list' - For referencing multiple pages

// Expected entry value formats:
// - Text fields: string
// - Image fields: { url: string, alt: string }
// - Markdown fields: { html: string, markdown: string }
// - Number fields: number
// - Switch fields: boolean
// - Link fields: { url: string, label: string }

// JSON Output Format
// Return ONLY a valid JSON object with this structure, without any explanations, headings, or additional text:
// {
//   "id": "UUID",
//   "name": "Block Name",
//   "code": {
//     "html": "HTML content",
//     "css": "CSS content with proper nesting",
//     "js": "JavaScript content"
//   },
//   "fields": [
//     {
//       "id": "UUID",
//       "key": "field_key",
//       "label": "Field Label",
//       "type": "field_type", // Must be one of the valid types listed above
//       "options": {},
//       "index": 0,
//       "parent": null
//     }
//   ],
//   "entries": [
//     {
//       "id": "UUID",
//       "value": "Field value", // Must match expected format for the field type
//       "locale": "en",
//       "parent": null,
//       "field": "field_UUID",
//       "index": null,
//       "metadata": null
//     }
//   ]
// }

// Example Block Types
// - Hero section with heading, subheading, and CTA buttons
// - Feature grid showcasing product benefits
// - Testimonial block with client quotes
// - Content sections with image and text
// - Team member profiles
// - Pricing tables
// - Contact forms
// - FAQ accordions
// - Newsletter signup forms
// - Gallery or portfolio displays

// General Guidelines
// - Use consistent spacing in CSS
// - Write professional, clean code
// - Create distinct component classes for logical units within the block
// - Ensure blocks are responsive for all devices
// - Keep defaults simple and versatile
// - Only include content fields that make sense for the specific block
// - Use clear, descriptive labels for fields
// - For image fields, include appropriate alt text in the default values
// - Remember to use proper PostCSS nesting syntax for all CSS
// `

const instructions = `
Prompt for Creating Weave CMS Blocks

Context
Create blocks for Weave CMS, a modern content management system that couples code and content at the component level. Weave blocks are self-contained page sections built with Svelte that include both code and editable content fields.

Requirements

Block Structure
- Create a Svelte component with clean, responsive layout
- Use semantic HTML for proper structure and accessibility
- Follow Weave's CSS naming conventions
- Integrate with Weave's CSS library where appropriate
- Always wrap text field values in their own elements (e.g., <span>{text}</span>, <p>{text}</p>, <h2>{text}</h2>) rather than using them directly

Component Architecture
- Create separate component classes for all divisible or reusable units within the block
- Examples of components that should have their own classes:
  - card - A container with specific styling that holds related content
  - hero-content - The content section of a hero block
  - feature-item - An individual feature in a feature list
  - button-group - A collection of related buttons
  - image-gallery - A container for multiple images
  - testimonial - A styled quote with attribution
  - pricing-plan - An individual pricing option
  - nav-item - A navigation element
  - form-field - A styled input container
  - accordion-item - A toggle/expand section in an accordion
- Use these component classes (without prefix) as the building blocks of your design
- Child elements within these components should use the underscore prefix

CSS Naming Conventions
- Root components: no prefix (e.g., .card, .hero, .button-group)
- Child elements: underscore prefix (e.g., ._content, ._title, ._icon)
- Modifiers: hyphen prefix (e.g., -large, -outlined, -featured)
- Properly nest child classes within parent components in CSS
- When a section of a component becomes complex, break it out as its own component

Example progression:
// Simple version
<div class="card">
    <div class="_header">
        <h2 class="_title">Title</h2>
    </div>
</div>

// When header becomes more complex, it becomes its own component
<div class="card">
    <div class="card-header">
        <div class="_icon">...</div>
        <h2 class="_title">Title</h2>
        <div class="_meta">...</div>
    </div>
</div>

CSS Nesting
Weave uses PostCSS with nesting support. Always use proper CSS nesting for child elements and modifiers:

// CSS Example
.card {
  background: white;
  
  &.-large {
    padding: 2rem;
  }
  
  ._content {
    padding: 1rem;
  }
  
  ._title {
    font-size: 1.5rem;
  }
}

.card-header {
  display: flex;
  
  ._icon {
    margin-right: 0.5rem;
  }
}

Weave CSS Library Integration
Use Weave's component classes where appropriate:
- .w--block-container for consistent spacing and width (do not add left-right padding on root component, this handles it)
- .w--heading for titles and headings
- .w--button for buttons (with -outline modifier when needed)
- .w--prose for rich text content

Mock Field Integration
- Define individual variables for each mock field value in the JavaScript section
- Use underscore_case for all field variable names
- HTML should fully reference these mock field variables using Svelte syntax
- For example: <h1 class="_title">{heading}</h1> would use the "heading" variable
- Include proper conditional rendering for optional elements
- Use proper Svelte syntax for complex field types:
  - Rich text: {@html content.html}
  - Images: <img src={image_url} alt={image_alt}>
  - Links: <a href={button_url}>{button_label}</a>
- Make sure all field references in HTML match the variable names in your JavaScript
- Treat the mock fields as if they were real CMS fields

HTML Implementation Guidelines:
- Always wrap text field values inside their own elements rather than inserting them directly in the HTML
- Correct: <h1 class="_title">{heading}</h1>
- Correct: <span class="_label">{label}</span>
- Incorrect: <div class="card">{text}</div> (text should be inside its own element)
- This approach improves styling control and accessibility

JSON Output Format
Return ONLY a valid JSON object with this structure, without any explanations, headings, or additional text:
{
  "id": "UUID",
  "name": "Block Name",
  "code": {
    "html": "<div class=\"example\">\n  <h2 class=\"_title\">{heading}</h2>\n  <div class=\"_content\">{@html content_html}</div>\n</div>",
    "css": ".example {\n  /* CSS with proper nesting */\n  \n  ._title {\n    /* Nested title styles */\n  }\n}",
    "js": "// Individual mock field variables\nexport let heading = 'Example Heading';\nexport let content_html = '<p>Example content</p>';\nexport let content_markdown = 'Example content';\n// Add other field variables as needed for this block"
  }
}

Example Block Types
- Hero section with heading, subheading, and CTA buttons
- Feature grid showcasing product benefits
- Testimonial block with client quotes
- Content sections with image and text
- Team member profiles
- Pricing tables
- Contact forms
- FAQ accordions
- Newsletter signup forms
- Gallery or portfolio displays

General Guidelines
- Use consistent spacing in CSS
- Write professional, clean code
- Create distinct component classes for logical units within the block
- Ensure blocks are responsive for all devices
- Keep defaults simple and versatile
- Only include mock field variables that make sense for the specific block
- Use clear, descriptive variable names that follow underscore_case
- For image fields, use separate variables (e.g., image_url, image_alt)
- Remember to use proper PostCSS nesting syntax for all CSS

Think step-by-step to ensure no errors in your JSON response.
`

export const POST: RequestHandler = async (event) => {
  console.log('posting')

  return authorize(event, {
    onsuccess: async ({ prompt = null, prompt_image = null }) => {

      console.log({ prompt, prompt_image })

      const message = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 10000,
        system: "You are a helpful assistant that generates Weave CMS blocks. You must respond ONLY with valid JSON according to the user's specifications, with no additional text, explanations, or markdown formatting.",
        messages: [
          {
            role: "user",
            content: [
              {
                type: 'text',
                text: instructions
              },
              ... (prompt ? [{
                type: "text",
                text: prompt
              }] : []),
              ... (prompt_image ? [{
                type: "image",
                source: {
                  type: "base64",
                  media_type: prompt_image.type,
                  data: prompt_image.data, // Base64-encoded image data as string
                }
              }] : []),
            ]
          }
        ]
      });

      console.log(message);

      let block_json = null
      try {
        // Extract just the JSON part if there's any surrounding text
        const response_text = message.content[0]['text'];
        const json_match = response_text.match(/\{[\s\S]*\}/);

        if (json_match) {
          block_json = JSON.parse(json_match[0]);
        } else {
          block_json = JSON.parse(response_text);
        }
      } catch (e) {
        console.warn('Could not parse response as JSON:', e);
      }
      return json({
        success: block_json ? true : false,
        block: block_json
      })
    },
    onerror: async (error) => {
      console.error(error);
      return json({ success: false, error: error.message });
    }
  })
}
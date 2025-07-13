const { mkdirSync, writeFileSync } = require('fs');
const { join } = require('path');

const modules = [
  'mealTypes',
  'units',
  'categories',
  'foods',
  'recipes',
  'diners',
  'weeklyPlans',
  'shoppingList',
];

const basePath = 'src/modules';

const files = {
  '+page.svelte': '<!-- Main view for this module -->',
  '+page.ts': '// Load logic for this page',
  'types.ts': '// TypeScript interfaces for this module',
  'api.ts': '// Firebase access functions (CRUD)',
  'formSchema.ts': '// Zod schema for form validation (if needed)',
};

modules.forEach((mod) => {
  const modulePath = join(basePath, mod);
  mkdirSync(modulePath, { recursive: true });

  Object.entries(files).forEach(([filename, content]) => {
    const filePath = join(modulePath, filename);
    writeFileSync(filePath, content);
    console.log(`✅ Created ${filePath}`);
  });
});

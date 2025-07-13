const fs = require('fs');
const path = require('path');

const routes = [
  'meal-types',
  'units',
  'categories',
  'foods',
  'recipes',
  'diners',
  'weekly-plans',
  'shopping-list'
];

const basePath = 'src/routes';

const pageSvelteContent = `<!-- Interfaz principal de la ruta -->\n<script lang="ts">\n\texport let data;\n</script>\n`;

const pageTsContent = `// Lógica de carga de datos para esta ruta\n\nexport async function load() {\n\t// const data = await getSomething();\n\treturn {};\n}\n`;

routes.forEach((route) => {
  const routePath = path.join(basePath, route);
  fs.mkdirSync(routePath, { recursive: true });

  const sveltePath = path.join(routePath, '+page.svelte');
  const tsPath = path.join(routePath, '+page.ts');

  fs.writeFileSync(sveltePath, pageSvelteContent);
  fs.writeFileSync(tsPath, pageTsContent);

  console.log(`✅ Ruta creada: ${routePath}`);
});

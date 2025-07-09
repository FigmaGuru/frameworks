const fs = require('fs');
const path = require('path');
// Cache-busting: always reload the config
delete require.cache[require.resolve('./tailwind.config.js')];
const tailwindConfig = require('./tailwind.config.js');

const primitives = tailwindConfig.theme.colors;
const darkPrimitives = tailwindConfig.theme.darkColors || {};
const semantics = tailwindConfig.theme.semantics || {};

// Debug: print keys of each section
console.log('Color families:', Object.keys(primitives));
console.log('Dark color families:', Object.keys(darkPrimitives));
console.log('Semantic tokens:', Object.keys(semantics));

function flattenColors(obj, prefix = '') {
  let result = [];
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      result = result.concat(flattenColors(obj[key], `${prefix}${key}-`));
    } else {
      result.push({ name: `${prefix}${key}`, value: obj[key] });
    }
  }
  return result;
}

function getPrimitiveValue(primitives, name) {
  // name is like 'gray-50' or 'dataviz-1'
  const dashIdx = name.indexOf('-');
  if (dashIdx === -1) return primitives?.[name];
  const group = name.slice(0, dashIdx);
  const shade = name.slice(dashIdx + 1);
  return primitives?.[group]?.[shade] || '';
}

// 1. Light primitives
const flatLight = flattenColors(primitives);
// 2. Dark primitives
const flatDark = flattenColors(darkPrimitives);

// 3. Semantic tokens
const semanticNames = Object.keys(semantics);

// Debug output
console.log('--- Light Primitives ---');
flatLight.forEach(({ name, value }) => console.log(`${name}: ${value}`));
console.log('Total:', flatLight.length);
console.log('\n--- Dark Primitives ---');
flatDark.forEach(({ name, value }) => console.log(`${name}: ${value}`));
console.log('Total:', flatDark.length);
console.log('\n--- Semantic Tokens ---');
semanticNames.forEach((semantic) => {
  const light = semantics[semantic]?.light;
  const dark = semantics[semantic]?.dark;
  console.log(`${semantic}: light=${light}, dark=${dark}`);
});
console.log('Total:', semanticNames.length);

let css = ':root {\n';
// Light primitives
flatLight.forEach(({ name, value }) => {
  css += `  --color-${name}: ${value};\n`;
});
// Light semantics
semanticNames.forEach((semantic) => {
  const primitive = semantics[semantic]?.light;
  const value = getPrimitiveValue(primitives, primitive);
  css += `  --color-${semantic}: ${value};\n`;
});
css += '}\n\n';

css += '.dark {\n';
// Dark primitives
flatDark.forEach(({ name, value }) => {
  css += `  --color-${name}: ${value};\n`;
});
// Dark semantics
semanticNames.forEach((semantic) => {
  const primitive = semantics[semantic]?.dark;
  const value = getPrimitiveValue(darkPrimitives, primitive);
  css += `  --color-${semantic}: ${value};\n`;
});
css += '}\n';

fs.writeFileSync(path.join(__dirname, 'primitives.css'), css);
console.log('primitives.css generated with light/dark primitives and semantics!'); 
const fs = require('fs');
const path = require('path');
delete require.cache[require.resolve('./tailwind.config.js')];
const tailwindConfig = require('./tailwind.config.js');

const primitives = tailwindConfig.theme.colors;
const darkPrimitives = tailwindConfig.theme.darkColors || {};
const semantics = tailwindConfig.theme.semantics || {};

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
  const dashIdx = name.indexOf('-');
  if (dashIdx === -1) return primitives?.[name];
  const group = name.slice(0, dashIdx);
  const shade = name.slice(dashIdx + 1);
  return primitives?.[group]?.[shade] || '';
}

const tokens = {};

// Add all primitives (light)
flattenColors(primitives).forEach(({ name, value }) => {
  tokens[name] = {
    value,
    type: 'color',
    description: `Primitive color ${name} (light mode)`
  };
});
// Add all primitives (dark)
flattenColors(darkPrimitives).forEach(({ name, value }) => {
  tokens[`${name}-dark`] = {
    value,
    type: 'color',
    description: `Primitive color ${name} (dark mode)`
  };
});
// Add all semantics (light)
Object.keys(semantics).forEach((semantic) => {
  const primitive = semantics[semantic]?.light;
  const value = getPrimitiveValue(primitives, primitive);
  tokens[semantic] = {
    value,
    type: 'color',
    description: `Semantic token ${semantic} (light mode)`
  };
});
// Add all semantics (dark)
Object.keys(semantics).forEach((semantic) => {
  const primitive = semantics[semantic]?.dark;
  const value = getPrimitiveValue(darkPrimitives, primitive);
  tokens[`${semantic}-dark`] = {
    value,
    type: 'color',
    description: `Semantic token ${semantic} (dark mode)`
  };
});

fs.writeFileSync(path.join(__dirname, 'tokens.json'), JSON.stringify({ color: tokens }, null, 2));
console.log('tokens.json generated for Figma plugin compatibility!'); 
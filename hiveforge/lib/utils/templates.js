/**
 * HiveForge Template Utilities
 * Simple template engine for variable substitution
 */

const fs = require('fs');
const path = require('path');

/**
 * Replace template variables in the format {{VARIABLE_NAME}}
 * @param {string} template - Template string with {{variables}}
 * @param {object} variables - Key-value pairs for substitution
 * @returns {string} Processed template
 */
function generateTemplate(template, variables) {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value !== undefined && value !== null ? value : '');
  }

  return result;
}

/**
 * Load a template file and process it with variables
 * @param {string} templatePath - Path to template file
 * @param {object} variables - Key-value pairs for substitution
 * @returns {string} Processed template
 */
function loadTemplate(templatePath, variables = {}) {
  const template = fs.readFileSync(templatePath, 'utf8');
  return generateTemplate(template, variables);
}

/**
 * Copy a template file to destination with variable substitution
 * @param {string} templatePath - Source template path
 * @param {string} destPath - Destination path
 * @param {object} variables - Key-value pairs for substitution
 */
function copyTemplate(templatePath, destPath, variables = {}) {
  const content = loadTemplate(templatePath, variables);

  // Ensure destination directory exists
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  fs.writeFileSync(destPath, content);
}

/**
 * Copy an entire directory of templates
 * @param {string} srcDir - Source directory
 * @param {string} destDir - Destination directory
 * @param {object} variables - Key-value pairs for substitution
 * @returns {string[]} List of created files (relative paths)
 */
function copyTemplateDir(srcDir, destDir, variables = {}) {
  const files = [];

  if (!fs.existsSync(srcDir)) {
    return files;
  }

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      const subFiles = copyTemplateDir(srcPath, destPath, variables);
      files.push(...subFiles);
    } else {
      copyTemplate(srcPath, destPath, variables);
      files.push(path.relative(process.cwd(), destPath));
    }
  }

  return files;
}

/**
 * Get the templates directory path
 * @returns {string} Templates directory path
 */
function getTemplatesDir() {
  return path.join(__dirname, '../../templates');
}

module.exports = {
  generateTemplate,
  loadTemplate,
  copyTemplate,
  copyTemplateDir,
  getTemplatesDir
};

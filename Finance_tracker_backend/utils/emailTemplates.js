const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const mjml2html = require("mjml");

const templatesDir = path.join(__dirname, "..", "emails", "templates");

const cache = new Map();

const getTemplateSource = (templateName) => {
  const filePath = path.join(templatesDir, `${templateName}.mjml`);
  return fs.readFileSync(filePath, "utf8");
};

const getCompiled = (templateName) => {
  const cached = cache.get(templateName);
  if (cached) return cached;

  const source = getTemplateSource(templateName);
  const compiled = Handlebars.compile(source, { strict: true });
  cache.set(templateName, compiled);
  return compiled;
};

const renderMjmlTemplate = (templateName, data) => {
  const compiled = getCompiled(templateName);
  const mjmlMarkup = compiled(data);

  const { html, errors } = mjml2html(mjmlMarkup, {
    validationLevel: "strict",
  });

  if (errors && errors.length) {
    const msg = errors.map((e) => e.formattedMessage || e.message).join("\n");
    const err = new Error(`MJML render failed for ${templateName}: ${msg}`);
    err.statusCode = 500;
    throw err;
  }

  return html;
};

module.exports = {
  renderMjmlTemplate,
};

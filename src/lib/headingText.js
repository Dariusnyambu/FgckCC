export function cleanHeadingText(text) {
  return typeof text === "string"
    ? text.replace(/\s*—\s*/g, " ").trim()
    : text;
}

export function cleanHeadingHtml(html) {
  return html.replace(
    /(<h[1-6]\b[^>]*>)([\s\S]*?)(<\/h[1-6]\s*>)/gi,
    (_, openingTag, content, closingTag) =>
      `${openingTag}${content.replace(/\s*—\s*/g, " ")}${closingTag}`
  );
}

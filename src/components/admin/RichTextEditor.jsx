import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Link2,
  Image as ImageIcon,
  Minus,
  BookOpen,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Pilcrow,
} from "lucide-react";

const HEADING_OPTIONS = [
  ["P", "Paragraph"],
  ["H1", "Heading 1"],
  ["H2", "Heading 2"],
  ["H3", "Heading 3"],
  ["H4", "Heading 4"],
];

function ToolbarButton({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()} // keep selection focused in the editor
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition ${
        active ? "bg-crimson/15 text-crimson" : "text-ink/60 hover:bg-ink/5 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * A self-contained WYSIWYG editor for blog content. Uses contentEditable +
 * document.execCommand — intentionally simple and dependency-free rather
 * than pulling in a full editor framework, while still covering every
 * format the brief calls for (headings, lists, blockquote, scripture
 * block, divider, links, images, alignment).
 *
 * `value` / `onChange` carry the content as an HTML string.
 */
export default function RichTextEditor({ value, onChange, placeholder = "Start writing..." }) {
  const ref = useRef(null);
  const [heading, setHeading] = useState("P");

  // Only push `value` into the DOM when it changes from *outside* (e.g.
  // loading an existing post) — never on every keystroke, or the cursor
  // jumps to the start on each render.
  useEffect(() => {
    if (ref.current && value !== undefined && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emit = () => onChange(ref.current.innerHTML);

  const exec = (command, arg) => {
    document.execCommand(command, false, arg);
    ref.current.focus();
    emit();
  };

  const insertLink = () => {
    const url = window.prompt("Link URL");
    if (!url) return;
    exec("createLink", url);
  };

  const insertImage = () => {
    const url = window.prompt("Image URL");
    if (!url) return;
    exec("insertImage", url);
  };

  const insertDivider = () => {
    document.execCommand("insertHorizontalRule");
    ref.current.focus();
    emit();
  };

  const insertScripture = () => {
    const text = window.prompt("Scripture text");
    if (!text) return;
    const ref_ = window.prompt("Reference (e.g. John 3:16)") || "";
    document.execCommand(
      "insertHTML",
      false,
      `<blockquote class="scripture-block"><p>${text}</p>${ref_ ? `<cite>— ${ref_}</cite>` : ""}</blockquote><p><br></p>`
    );
    ref.current.focus();
    emit();
  };

  const insertCallout = () => {
    const text = window.prompt("Callout text");
    if (!text) return;
    document.execCommand("insertHTML", false, `<div class="callout-block"><p>${text}</p></div><p><br></p>`);
    ref.current.focus();
    emit();
  };

  const applyHeading = (tag) => {
    setHeading(tag);
    exec("formatBlock", tag === "P" ? "P" : tag);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-ink/15 bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-ink/10 bg-ink/[0.02] px-2 py-1.5">
        <select
          value={heading}
          onChange={(e) => applyHeading(e.target.value)}
          className="mr-1 rounded-md border border-ink/15 bg-white px-2 py-1 text-xs text-ink/70 outline-none"
        >
          {HEADING_OPTIONS.map(([tag, label]) => (
            <option key={tag} value={tag}>{label}</option>
          ))}
        </select>

        <Divider />
        <ToolbarButton title="Bold" onClick={() => exec("bold")}><Bold size={15} /></ToolbarButton>
        <ToolbarButton title="Italic" onClick={() => exec("italic")}><Italic size={15} /></ToolbarButton>
        <ToolbarButton title="Underline" onClick={() => exec("underline")}><Underline size={15} /></ToolbarButton>
        <ToolbarButton title="Strikethrough" onClick={() => exec("strikeThrough")}><Strikethrough size={15} /></ToolbarButton>

        <Divider />
        <ToolbarButton title="Align left" onClick={() => exec("justifyLeft")}><AlignLeft size={15} /></ToolbarButton>
        <ToolbarButton title="Align center" onClick={() => exec("justifyCenter")}><AlignCenter size={15} /></ToolbarButton>
        <ToolbarButton title="Align right" onClick={() => exec("justifyRight")}><AlignRight size={15} /></ToolbarButton>

        <Divider />
        <ToolbarButton title="Bullet list" onClick={() => exec("insertUnorderedList")}><List size={15} /></ToolbarButton>
        <ToolbarButton title="Numbered list" onClick={() => exec("insertOrderedList")}><ListOrdered size={15} /></ToolbarButton>
        <ToolbarButton title="Blockquote" onClick={() => exec("formatBlock", "BLOCKQUOTE")}><Quote size={15} /></ToolbarButton>

        <Divider />
        <ToolbarButton title="Insert link" onClick={insertLink}><Link2 size={15} /></ToolbarButton>
        <ToolbarButton title="Insert image" onClick={insertImage}><ImageIcon size={15} /></ToolbarButton>
        <ToolbarButton title="Insert divider" onClick={insertDivider}><Minus size={15} /></ToolbarButton>
        <ToolbarButton title="Insert scripture block" onClick={insertScripture}><BookOpen size={15} /></ToolbarButton>
        <ToolbarButton title="Insert callout" onClick={insertCallout}><Pilcrow size={15} /></ToolbarButton>
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        data-placeholder={placeholder}
        className="prose-editor min-h-[320px] max-w-none px-5 py-4 text-sm leading-relaxed text-ink outline-none"
      />
    </div>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-ink/10" />;
}

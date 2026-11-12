"use client";

import { useMemo, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown as MarkdownExtension } from "@tiptap/markdown";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

type View = "visual" | "source" | "preview" | "html";

const blocks = [
  { value: "p", label: "Paragraph <p>" },
  ...([1, 2, 3, 4, 5, 6] as const).map((level) => ({ value: `h${level}`, label: `Heading ${level} <h${level}>` })),
  { value: "ul", label: "Bulleted list <ul>" },
  { value: "ol", label: "Numbered list <ol>" },
  { value: "blockquote", label: "Quote <blockquote>" },
];

function needsSource(markdown: string) {
  return /!\[[^\]]*\]\([^)]+\)|^\s*\|.+\|\s*$|^\s*[-*+]\s+\[[ xX]\]/m.test(markdown);
}

export function BlogTextEditor({ initialValue, invalid }: { initialValue: string; invalid: boolean }) {
  const [value, setValue] = useState(initialValue);
  const [view, setView] = useState<View>(() => needsSource(initialValue) ? "source" : "visual");
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkError, setLinkError] = useState("");
  const [revision, setRevision] = useState(0);
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] }, link: { openOnClick: false, autolink: false } }), MarkdownExtension],
    content: initialValue,
    contentType: "markdown",
    immediatelyRender: false,
    onUpdate: ({ editor: current }) => { setValue(current.getMarkdown()); setRevision((number) => number + 1); },
    onSelectionUpdate: () => setRevision((number) => number + 1),
  });
  void revision;
  const html = useMemo(() => view === "html" ? renderToStaticMarkup(<Markdown skipHtml remarkPlugins={[remarkGfm]}>{value}</Markdown>) : "", [value, view]);
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  const visualAvailable = !needsSource(value);
  const activeBlock = editor?.isActive("heading")
    ? `h${editor.getAttributes("heading").level}`
    : editor?.isActive("bulletList") ? "ul"
      : editor?.isActive("orderedList") ? "ol"
        : editor?.isActive("blockquote") ? "blockquote" : "p";

  function changeView(next: View) {
    if (next === "visual" && editor) editor.commands.setContent(value, { contentType: "markdown", emitUpdate: false });
    setView(next);
  }

  function changeBlock(block: string) {
    if (!editor) return;
    if (block === "p") editor.chain().focus().setParagraph().run();
    else if (block.startsWith("h")) editor.chain().focus().setHeading({ level: Number(block.slice(1)) as 1 | 2 | 3 | 4 | 5 | 6 }).run();
    else if (block === "ul") editor.chain().focus().toggleBulletList().run();
    else if (block === "ol") editor.chain().focus().toggleOrderedList().run();
    else if (block === "blockquote") editor.chain().focus().toggleBlockquote().run();
    setRevision((number) => number + 1);
  }

  function openLink() {
    setLinkUrl(editor?.getAttributes("link").href || "https://");
    setLinkError("");
    setLinkOpen(true);
  }

  function insertLink() {
    if (!editor) return;
    const url = linkUrl.trim();
    try {
      const parsed = new URL(url);
      if (!(["https:", "http:"].includes(parsed.protocol))) throw new Error("protocol");
    } catch { setLinkError("Enter a full http:// or https:// URL."); return; }
    if (editor.state.selection.empty) {
      editor.chain().focus().insertContent({ type: "text", text: url, marks: [{ type: "link", attrs: { href: url } }] }).run();
    } else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    setLinkOpen(false);
    setLinkError("");
  }

  const button = (label: string, title: string, action: () => void, pressed = false, disabled = false) =>
    <button type="button" title={title} aria-label={title} aria-pressed={pressed} onClick={action} disabled={disabled || !editor || view !== "visual"}>{label}</button>;

  return <div className={`admin-blog-composer admin-text-editor${invalid ? " is-invalid" : ""}`}>
    <input type="hidden" name="content" value={value} />
    <div className="admin-text-editor-head"><span>POST CONTENT</span><div role="tablist" aria-label="Editor view"><button type="button" role="tab" aria-selected={view === "visual"} disabled={!visualAvailable} onClick={() => changeView("visual")}>Visual</button><button type="button" role="tab" aria-selected={view === "source"} onClick={() => changeView("source")}>Source</button><button type="button" role="tab" aria-selected={view === "preview"} onClick={() => changeView("preview")}>Preview</button><button type="button" role="tab" aria-selected={view === "html"} onClick={() => changeView("html")}>HTML</button></div></div>
    <div className="admin-text-editor-toolbar" role="toolbar" aria-label="Text formatting">
      <div className="admin-text-editor-tool-group">{button("↶", "Undo", () => editor?.chain().focus().undo().run(), false, !editor?.can().undo())}{button("↷", "Redo", () => editor?.chain().focus().redo().run(), false, !editor?.can().redo())}</div>
      <div className="admin-text-editor-tool-group"><label htmlFor="blog-block-type" className="sr-only">Block type</label><select id="blog-block-type" value={activeBlock} disabled={!editor || view !== "visual"} onChange={(event) => changeBlock(event.target.value)}>{blocks.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
      <div className="admin-text-editor-tool-group">{button("B", "Bold", () => editor?.chain().focus().toggleBold().run(), Boolean(editor?.isActive("bold")))}{button("I", "Italic", () => editor?.chain().focus().toggleItalic().run(), Boolean(editor?.isActive("italic")))}{button("S", "Strikethrough", () => editor?.chain().focus().toggleStrike().run(), Boolean(editor?.isActive("strike")))}</div>
      <div className="admin-text-editor-tool-group">{button("☷", "Bulleted list", () => editor?.chain().focus().toggleBulletList().run(), Boolean(editor?.isActive("bulletList")))}{button("1≡", "Numbered list", () => editor?.chain().focus().toggleOrderedList().run(), Boolean(editor?.isActive("orderedList")))}{button("❝", "Quote", () => editor?.chain().focus().toggleBlockquote().run(), Boolean(editor?.isActive("blockquote")))}</div>
      <div className="admin-text-editor-tool-group">{button("↗", "Insert link", openLink, Boolean(editor?.isActive("link")))}{button("</>", "Inline code", () => editor?.chain().focus().toggleCode().run(), Boolean(editor?.isActive("code")))}</div>
    </div>
    {linkOpen && <div className="admin-text-editor-link-dialog" role="group" aria-label="Insert link"><label>Link URL<input type="url" value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); insertLink(); } }} placeholder="https://example.com" autoFocus /></label><button type="button" onClick={insertLink}>Insert link</button><button type="button" onClick={() => setLinkOpen(false)}>Cancel</button>{linkError && <p role="alert">{linkError}</p>}</div>}
    <div className={view === "visual" ? "admin-text-editor-canvas" : "admin-blog-hidden-area"}><EditorContent editor={editor} /></div>
    {view === "source" && <textarea value={value} onChange={(event) => setValue(event.target.value)} maxLength={200000} aria-label="Article Markdown source" aria-invalid={invalid} aria-describedby={invalid ? "blog-content-error" : "blog-content-help"} className="admin-blog-writing-area" />}
    {view === "preview" && <div className="admin-blog-live-preview markdown-body" aria-label="Article preview"><Markdown skipHtml remarkPlugins={[remarkGfm]}>{value || "Start writing to see your preview."}</Markdown></div>}
    {view === "html" && <pre className="admin-text-editor-html" aria-label="Generated HTML"><code>{html || "<!-- Add content to see its HTML -->"}</code></pre>}
    <div className="admin-text-editor-footer"><span>{view === "visual" ? `Block: <${activeBlock}>` : view === "source" ? "Markdown source" : view === "html" ? "Generated HTML" : "Published preview"}</span><span>{words} {words === 1 ? "word" : "words"}</span></div>
    {needsSource(value) && <p className="admin-text-editor-notice">This post contains images, tables, or task lists. Keep editing in Source to preserve those elements.</p>}
    <p id="blog-content-help" className="admin-blog-editor-help">The visual editor writes Markdown to the database. Preview and HTML show the semantic elements readers receive. Raw HTML in Source is ignored on public pages.</p>
  </div>;
}

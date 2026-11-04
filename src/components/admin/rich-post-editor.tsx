"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { TableKit } from "@tiptap/extension-table";
import { Markdown } from "@tiptap/markdown";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code2,
  Link2,
  Undo2,
  Redo2,
  Minus,
  ImagePlus,
  Table2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaPicker } from "./media-picker";
import { isRichArticle, normalizeArticleMarkdown } from "@/lib/article-content";
import "./rich-post-editor.css";

const input =
  "bg-background border-input focus-visible:ring-ring min-h-11 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2";
const toolbarSelect =
  "bg-background border-input focus-visible:ring-ring min-h-11 max-w-full shrink-0 rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2";
const AlignedText = TextAlign.extend({
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textAlign: {
            default: null,
            parseHTML: (element: HTMLElement) =>
              element.getAttribute("data-align") ||
              element.style.textAlign ||
              null,
            renderHTML: (attributes: Record<string, unknown>) =>
              attributes.textAlign
                ? { "data-align": attributes.textAlign }
                : {},
          },
        },
      },
    ];
  },
});
const ArticleImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: null },
      height: { default: null },
      align: {
        default: "center",
        parseHTML: (el: HTMLElement) =>
          el.getAttribute("data-align") || "center",
        renderHTML: (attrs: Record<string, unknown>) => ({
          "data-align": attrs.align,
        }),
      },
      caption: {
        default: "",
        parseHTML: (el: HTMLElement) => el.getAttribute("data-caption") || "",
        renderHTML: (attrs: Record<string, unknown>) =>
          attrs.caption ? { "data-caption": attrs.caption } : {},
      },
    };
  },
});
type ImageFields = {
  src: string;
  alt: string;
  caption: string;
  width: string;
  height: string;
  align: string;
};
const blankImage: ImageFields = {
  src: "",
  alt: "",
  caption: "",
  width: "",
  height: "",
  align: "center",
};

export default function RichPostEditor({
  value,
  onChange,
  onPendingSourceChange,
}: {
  value: string;
  onChange: (value: string) => void;
  onPendingSourceChange?: (pending: boolean) => void;
}) {
  const lastValue = useRef(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [sourceMode, setSourceMode] = useState(false);
  const [source, setSource] = useState(value);
  const [showImage, setShowImage] = useState(false);
  const [image, setImage] = useState<ImageFields>(blankImage);
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [showLink, setShowLink] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false },
      }),
      ArticleImage,
      AlignedText.configure({ types: ["heading", "paragraph"] }),
      TableKit.configure({ table: { resizable: false } }),
      Markdown,
    ],
    content: normalizeArticleMarkdown(value),
    contentType: isRichArticle(value) ? "html" : "markdown",
    editorProps: {
      attributes: {
        class:
          "prose prose-ncdai dark:prose-invert max-w-none min-h-[28rem] p-5 sm:p-8 outline-none",
        "aria-label": "Article content",
        role: "textbox",
        "aria-multiline": "true",
      },
      handlePaste(view, event) {
        const text = event.clipboardData?.getData("text/plain") || "";
        const html = event.clipboardData?.getData("text/html");
        if (
          !html &&
          /(^#{1,6}\s|\*\*[^*]+\*\*|^```|^[-*]\s|^>\s)/m.test(text)
        ) {
          queueMicrotask(() =>
            editor?.commands.insertContent(normalizeArticleMarkdown(text), {
              contentType: "markdown",
            }),
          );
          return true;
        }
        return false;
      },
    },
    onUpdate({ editor: current }) {
      const html = current.isEmpty ? "" : current.getHTML();
      lastValue.current = html;
      onChangeRef.current(html);
    },
    onSelectionUpdate({ editor: current }) {
      if (current.isActive("image")) {
        const attrs = current.getAttributes("image");
        setImage({
          src: attrs.src || "",
          alt: attrs.alt || "",
          caption: attrs.caption || "",
          width: attrs.width?.toString() || "",
          height: attrs.height?.toString() || "",
          align: attrs.align || "center",
        });
        setShowImage(true);
      }
    },
  });
  useEffect(() => {
    if (!editor || value === lastValue.current) return;
    lastValue.current = value;
    editor.commands.setContent(normalizeArticleMarkdown(value), {
      contentType: isRichArticle(value) ? "html" : "markdown",
      emitUpdate: false,
    });
    setSource(value);
  }, [value, editor]);
  if (!editor)
    return (
      <p role="status" className="text-muted-foreground p-6 text-sm">
        Preparing your writing space…
      </p>
    );
  function toolbar(
    label: string,
    icon: React.ReactNode,
    action: () => void,
    active = false,
    disabled = false,
  ) {
    return (
      <Button
        key={label}
        type="button"
        variant={active ? "secondary" : "ghost"}
        className="min-h-11 min-w-11 px-3"
        aria-label={label}
        title={label}
        aria-pressed={active}
        disabled={disabled}
        onMouseDown={(e) => e.preventDefault()}
        onClick={action}
      >
        {icon}
      </Button>
    );
  }
  function saveImage() {
    if (!editor) return;
    if (!/^(https?:\/\/|\/(?!\/))/i.test(image.src)) {
      setMessage("Use an https image URL or a path beginning with /.");
      return;
    }
    if (
      [image.width, image.height].some(
        (v) =>
          v !== "" && (!/^\d+$/.test(v) || Number(v) < 1 || Number(v) > 10000),
      )
    ) {
      setMessage("Image dimensions must be between 1 and 10,000 pixels.");
      return;
    }
    const attrs = {
      src: image.src,
      alt: image.alt,
      caption: image.caption,
      width: image.width ? Number(image.width) : null,
      height: image.height ? Number(image.height) : null,
      align: image.align,
    };
    if (editor.isActive("image"))
      editor.chain().focus().updateAttributes("image", attrs).run();
    else
      editor
        .chain()
        .focus()
        .insertContent([{ type: "image", attrs }, { type: "paragraph" }])
        .run();
    setMessage("");
    setShowImage(false);
    setImage(blankImage);
  }
  return (
    <div className="article-editor border-border min-w-0 rounded-lg border">
      <div className="bg-muted/40 border-border flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
        <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          Article canvas
        </span>
        <div className="flex gap-1" aria-label="Editor mode">
          <Button
            type="button"
            variant={!sourceMode ? "secondary" : "ghost"}
            className="min-h-11"
            aria-pressed={!sourceMode}
            disabled={sourceMode && source !== value}
            onClick={() => {
              setSourceMode(false);
              onPendingSourceChange?.(false);
            }}
          >
            Write
          </Button>
          <Button
            type="button"
            variant={sourceMode ? "secondary" : "ghost"}
            className="min-h-11"
            aria-pressed={sourceMode}
            onClick={() => {
              if (!sourceMode) {
                setSource(value);
                setSourceMode(true);
              }
            }}
          >
            Source / import
          </Button>
        </div>
      </div>
      {sourceMode ? (
        <div className="space-y-3 p-4">
          <label htmlFor="article-source" className="block text-sm font-medium">
            Markdown or HTML source
          </label>
          <p className="text-muted-foreground text-xs">
            Paste Markdown here to import an article. Apply source before saving
            the post. Keep a copy when importing custom HTML.
          </p>
          <textarea
            id="article-source"
            rows={20}
            maxLength={100000}
            className={`${input} font-mono`}
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              onPendingSourceChange?.(e.target.value !== value);
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              className="min-h-11"
              onClick={() => {
                editor.commands.setContent(normalizeArticleMarkdown(source), {
                  contentType: isRichArticle(source) ? "html" : "markdown",
                  emitUpdate: false,
                });
                const html = editor.isEmpty ? "" : editor.getHTML();
                lastValue.current = html;
                onChangeRef.current(html);
                setSourceMode(false);
                onPendingSourceChange?.(false);
              }}
            >
              Apply source
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => {
                setSourceMode(false);
                onPendingSourceChange?.(false);
              }}
            >
              Cancel import
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div
            role="group"
            aria-label="Article formatting"
            className="bg-background border-border sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b p-2"
          >
            <select
              aria-label="Text style"
              className={toolbarSelect}
              value={
                editor.isActive("heading", { level: 2 })
                  ? "2"
                  : editor.isActive("heading", { level: 3 })
                    ? "3"
                    : editor.isActive("heading", { level: 4 })
                      ? "4"
                      : "p"
              }
              onChange={(e) =>
                e.target.value === "p"
                  ? editor.chain().focus().setParagraph().run()
                  : editor
                      .chain()
                      .focus()
                      .toggleHeading({
                        level: Number(e.target.value) as 2 | 3 | 4,
                      })
                      .run()
              }
            >
              <option value="p">Paragraph</option>
              <option value="2">Heading 2</option>
              <option value="3">Heading 3</option>
              <option value="4">Heading 4</option>
            </select>
            {toolbar(
              "Bold",
              <Bold size={16} />,
              () => editor.chain().focus().toggleBold().run(),
              editor.isActive("bold"),
            )}
            {toolbar(
              "Italic",
              <Italic size={16} />,
              () => editor.chain().focus().toggleItalic().run(),
              editor.isActive("italic"),
            )}
            {toolbar(
              "Strikethrough",
              <Strikethrough size={16} />,
              () => editor.chain().focus().toggleStrike().run(),
              editor.isActive("strike"),
            )}
            {toolbar(
              "Add or edit link",
              <Link2 size={16} />,
              () => {
                setLink(editor.getAttributes("link").href || "");
                setShowLink(!showLink);
              },
              editor.isActive("link"),
            )}
            {toolbar(
              "Bullet list",
              <List size={16} />,
              () => editor.chain().focus().toggleBulletList().run(),
              editor.isActive("bulletList"),
            )}
            {toolbar(
              "Numbered list",
              <ListOrdered size={16} />,
              () => editor.chain().focus().toggleOrderedList().run(),
              editor.isActive("orderedList"),
            )}
            {toolbar(
              "Callout or quote",
              <Quote size={16} />,
              () => editor.chain().focus().toggleBlockquote().run(),
              editor.isActive("blockquote"),
            )}
            {toolbar(
              "Code block",
              <Code2 size={16} />,
              () => editor.chain().focus().toggleCodeBlock().run(),
              editor.isActive("codeBlock"),
            )}
            {toolbar("Divider", <Minus size={16} />, () =>
              editor.chain().focus().setHorizontalRule().run(),
            )}
            {toolbar(
              "Insert image",
              <ImagePlus size={16} />,
              () => {
                if (!editor.isActive("image")) setImage(blankImage);
                setShowImage(!showImage);
              },
              showImage,
            )}
            {toolbar("Insert table", <Table2 size={16} />, () =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run(),
            )}
            <select
              aria-label="Text alignment"
              className={toolbarSelect}
              value={
                editor.getAttributes("paragraph").textAlign ||
                editor.getAttributes("heading").textAlign ||
                "left"
              }
              onChange={(e) =>
                editor.chain().focus().setTextAlign(e.target.value).run()
              }
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
            {toolbar(
              "Undo",
              <Undo2 size={16} />,
              () => editor.chain().focus().undo().run(),
              false,
              !editor.can().undo(),
            )}
            {toolbar(
              "Redo",
              <Redo2 size={16} />,
              () => editor.chain().focus().redo().run(),
              false,
              !editor.can().redo(),
            )}
          </div>
          {showLink && (
            <div className="border-border flex flex-wrap gap-2 border-b p-4">
              <label className="min-w-40 flex-1 text-sm">
                Link URL
                <input
                  type="url"
                  className={input}
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://example.com/reference"
                />
              </label>
              <Button
                type="button"
                variant="outline"
                className="min-h-11 self-end"
                onClick={() => {
                  if (
                    link &&
                    !/^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(link)
                  ) {
                    setMessage(
                      "Enter a valid https URL, email link, or page path.",
                    );
                    return;
                  }
                  if (link)
                    editor
                      .chain()
                      .focus()
                      .extendMarkRange("link")
                      .setLink({ href: link })
                      .run();
                  else
                    editor
                      .chain()
                      .focus()
                      .extendMarkRange("link")
                      .unsetLink()
                      .run();
                  setShowLink(false);
                  setMessage("");
                }}
              >
                Apply link
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="min-h-11 self-end"
                onClick={() => {
                  editor
                    .chain()
                    .focus()
                    .extendMarkRange("link")
                    .unsetLink()
                    .run();
                  setShowLink(false);
                }}
              >
                Remove link
              </Button>
            </div>
          )}
          {showImage && (
            <fieldset className="bg-muted/20 border-border space-y-4 border-b p-4">
              <legend className="px-1 text-sm font-medium">
                {editor.isActive("image")
                  ? "Edit selected image"
                  : "Insert an image in your article"}
              </legend>
              <MediaPicker
                onSelect={(url) =>
                  setImage((current) => ({ ...current, src: url }))
                }
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm sm:col-span-2">
                  Image URL
                  <input
                    className={input}
                    value={image.src}
                    onChange={(e) =>
                      setImage({ ...image, src: e.target.value })
                    }
                  />
                </label>
                <label className="text-sm">
                  Alternative text
                  <input
                    className={input}
                    value={image.alt}
                    onChange={(e) =>
                      setImage({ ...image, alt: e.target.value })
                    }
                    placeholder="Describe what the image shows"
                  />
                </label>
                <label className="text-sm">
                  Caption / reference
                  <input
                    className={input}
                    value={image.caption}
                    onChange={(e) =>
                      setImage({ ...image, caption: e.target.value })
                    }
                    placeholder="Source or explanation"
                  />
                </label>
                <label className="text-sm">
                  Width (px)
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    className={input}
                    value={image.width}
                    onChange={(e) =>
                      setImage({ ...image, width: e.target.value })
                    }
                    placeholder="Automatic"
                  />
                </label>
                <label className="text-sm">
                  Height (px)
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    className={input}
                    value={image.height}
                    onChange={(e) =>
                      setImage({ ...image, height: e.target.value })
                    }
                    placeholder="Automatic"
                  />
                </label>
                <label className="text-sm">
                  Alignment
                  <select
                    className={input}
                    value={image.align}
                    onChange={(e) =>
                      setImage({ ...image, align: e.target.value })
                    }
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </label>
              </div>
              <p className="text-muted-foreground text-xs leading-5">
                Images stay within the article width on mobile. Leave one
                dimension empty to keep the natural aspect ratio. Select an
                image in the canvas to edit it later.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" className="min-h-11" onClick={saveImage}>
                  {editor.isActive("image") ? "Update image" : "Insert image"}
                </Button>
                {editor.isActive("image") && (
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-11"
                    onClick={() => {
                      editor.chain().focus().deleteSelection().run();
                      setShowImage(false);
                    }}
                  >
                    Remove image
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-11"
                  onClick={() => setShowImage(false)}
                >
                  Close
                </Button>
              </div>
            </fieldset>
          )}
          {editor.isActive("table") && (
            <div className="border-border flex flex-wrap gap-2 border-b p-2">
              {[
                ["Add row", () => editor.chain().focus().addRowAfter().run()],
                [
                  "Add column",
                  () => editor.chain().focus().addColumnAfter().run(),
                ],
                ["Delete row", () => editor.chain().focus().deleteRow().run()],
                [
                  "Delete column",
                  () => editor.chain().focus().deleteColumn().run(),
                ],
                [
                  "Delete table",
                  () => editor.chain().focus().deleteTable().run(),
                ],
              ].map(([label, action]) => (
                <Button
                  key={label as string}
                  type="button"
                  variant="ghost"
                  className="min-h-11"
                  onClick={action as () => void}
                >
                  {label as string}
                </Button>
              ))}
            </div>
          )}
          {message && (
            <p role="alert" className="text-destructive px-4 py-3 text-sm">
              {message}
            </p>
          )}
          <EditorContent editor={editor} />
          <p className="border-border text-muted-foreground border-t px-4 py-3 text-xs leading-5">
            Write directly, paste formatted text, or import Markdown. Use
            headings for structure and descriptive links for references.
          </p>
        </>
      )}
    </div>
  );
}

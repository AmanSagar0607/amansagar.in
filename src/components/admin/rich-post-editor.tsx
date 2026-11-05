"use client";
import { Input as FormInput } from "@/components/ui/input";
import { Select as FormSelect } from "@/components/ui/select";
import { Textarea as FormTextarea } from "@/components/ui/textarea";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import type { SelectionBookmark } from "@tiptap/pm/state";
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
  ImageIcon,
  Trash2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MediaPicker } from "./media-picker";
import { isRichArticle, normalizeArticleMarkdown } from "@/lib/article-content";
import "./rich-post-editor.css";

const input =
  "bg-background border-input focus-visible:ring-ring min-h-11 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2";
const toolbarSelect =
  "bg-transparent border-transparent focus-visible:ring-ring h-11 shrink-0 rounded-md px-2 py-1 text-xs font-medium shadow-none outline-none focus-visible:ring-2 sm:h-9";
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
  const imageSelection = useRef<SelectionBookmark | null>(null);
  const imageInsertAt = useRef<number | null>(null);
  const [editingImage, setEditingImage] = useState(false);
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
        class: "prose prose-ncdai dark:prose-invert outline-none",
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
      handleKeyDown(_view, event) {
        if (
          (event.ctrlKey || event.metaKey) &&
          event.altKey &&
          event.key.toLowerCase() === "i"
        ) {
          event.preventDefault();
          if (editor) openImageSettings(editor);
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
        className="size-11 shrink-0 rounded-md p-0 sm:size-9"
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
    if (imageSelection.current)
      editor.view.dispatch(
        editor.state.tr.setSelection(
          imageSelection.current.resolve(editor.state.doc),
        ),
      );
    if (editingImage && editor.isActive("image"))
      editor.chain().focus().updateAttributes("image", attrs).run();
    else if (imageInsertAt.current !== null)
      editor
        .chain()
        .focus()
        .insertContentAt(imageInsertAt.current, [
          { type: "image", attrs },
          { type: "paragraph" },
        ])
        .run();
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
  function openImageSettings(current: Editor, insertAfterImage = false) {
    imageSelection.current = current.state.selection.getBookmark();
    imageInsertAt.current = insertAfterImage
      ? current.state.selection.to
      : null;
    const selected = current.isActive("image") && !insertAfterImage;
    setEditingImage(selected);
    setMessage("");
    if (selected) {
      const attrs = current.getAttributes("image");
      setImage({
        src: attrs.src || "",
        alt: attrs.alt || "",
        caption: attrs.caption || "",
        width: attrs.width?.toString() || "",
        height: attrs.height?.toString() || "",
        align: attrs.align || "center",
      });
    } else setImage(blankImage);
    setShowImage(true);
  }
  function removeImage() {
    if (!editor) return;
    if (imageSelection.current)
      editor.view.dispatch(
        editor.state.tr.setSelection(
          imageSelection.current.resolve(editor.state.doc),
        ),
      );
    if (editor.isActive("image"))
      editor.chain().focus().deleteSelection().run();
    setShowImage(false);
  }
  return (
    <div className="article-editor border-border min-w-0 rounded-lg border">
      <div className="bg-muted/20 border-border flex items-center justify-between gap-2 border-b px-3 py-2">
        <div className="min-w-0">
          <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Article canvas
          </span>
        </div>
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
          <FormTextarea
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
          <div className="article-toolbar border-border bg-background sticky top-0 z-10 flex min-w-0 items-center border-b">
            <ScrollArea className="min-w-0 flex-1" type="auto">
              <div
                role="group"
                aria-label="Article formatting"
                className="flex w-max min-w-full items-center gap-1 px-2 py-2"
              >
                <div
                  role="group"
                  aria-label="History"
                  className="article-toolbar-group"
                >
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
                <div
                  role="group"
                  aria-label="Text structure"
                  className="article-toolbar-group"
                >
                  <FormSelect
                    aria-label="Text style"
                    className={`${toolbarSelect} w-[7.5rem]`}
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
                  </FormSelect>
                </div>
                <div
                  role="group"
                  aria-label="Text formatting"
                  className="article-toolbar-group"
                >
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
                    "Code block",
                    <Code2 size={16} />,
                    () => editor.chain().focus().toggleCodeBlock().run(),
                    editor.isActive("codeBlock"),
                  )}
                </div>
                <div
                  role="group"
                  aria-label="Lists and quotes"
                  className="article-toolbar-group"
                >
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
                </div>
                <div
                  role="group"
                  aria-label="Alignment"
                  className="article-toolbar-group"
                >
                  <FormSelect
                    aria-label="Text alignment"
                    className={`${toolbarSelect} w-[6rem]`}
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
                  </FormSelect>
                </div>
                <div
                  role="group"
                  aria-label="Links"
                  className="article-toolbar-group border-r-0 pr-0"
                >
                  {toolbar(
                    "Add or edit link",
                    <Link2 size={16} />,
                    () => {
                      setLink(editor.getAttributes("link").href || "");
                      setShowLink(!showLink);
                    },
                    editor.isActive("link"),
                  )}
                </div>
              </div>
              <ScrollBar orientation="horizontal" className="h-1.5" />
            </ScrollArea>
            <div
              role="group"
              aria-label="Insert content"
              className="border-border flex shrink-0 items-center gap-0.5 border-l px-1"
            >
              <Button
                type="button"
                variant={showImage ? "secondary" : "ghost"}
                className="h-11 shrink-0 gap-2 rounded-md px-3 text-xs sm:h-9"
                aria-label="Insert image at cursor"
                title="Insert image where your cursor is"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => openImageSettings(editor)}
              >
                <ImagePlus size={16} />
                <span>Image</span>
              </Button>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="size-11 shrink-0 rounded-md p-0 sm:size-9"
                    aria-label="Insert block"
                    title="Insert block"
                    onMouseDown={(event) => event.preventDefault()}
                  >
                    <Plus size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  onCloseAutoFocus={(event) => event.preventDefault()}
                >
                  <DropdownMenuItem
                    className="min-h-11"
                    onSelect={() => openImageSettings(editor)}
                  >
                    <ImagePlus />
                    Image
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="min-h-11"
                    onSelect={() =>
                      editor
                        .chain()
                        .focus()
                        .insertTable({
                          rows: 3,
                          cols: 3,
                          withHeaderRow: true,
                        })
                        .run()
                    }
                  >
                    <Table2 />
                    Table
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="min-h-11"
                    onSelect={() =>
                      editor.chain().focus().setHorizontalRule().run()
                    }
                  >
                    <Minus />
                    Divider
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {showLink && (
            <div className="border-border flex flex-wrap gap-2 border-b p-4">
              <label className="min-w-40 flex-1 text-sm">
                Link URL
                <FormInput
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
          <Dialog open={showImage} onOpenChange={setShowImage}>
            <DialogContent
              className="grid max-h-[85dvh] grid-rows-[auto_auto_minmax(0,1fr)] overflow-hidden sm:max-w-xl"
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                editor.commands.focus(undefined, { scrollIntoView: false });
              }}
            >
              <DialogTitle>
                {editingImage ? "Edit selected image" : "Insert image here"}
              </DialogTitle>
              <DialogDescription>
                Choose or upload an image, then adjust its appearance. Your
                place in the article is preserved.
              </DialogDescription>
              <ScrollArea className="min-h-0">
                <fieldset className="space-y-4 pr-4">
                  <legend className="sr-only">Image properties</legend>
                  <MediaPicker
                    onSelect={(url) =>
                      setImage((current) => ({ ...current, src: url }))
                    }
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm sm:col-span-2">
                      Image URL
                      <FormInput
                        className={input}
                        value={image.src}
                        onChange={(e) =>
                          setImage({ ...image, src: e.target.value })
                        }
                      />
                    </label>
                    <label className="text-sm">
                      Alternative text
                      <FormInput
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
                      <FormInput
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
                      <FormInput
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
                      <FormInput
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
                      <FormSelect
                        className={input}
                        value={image.align}
                        onChange={(e) =>
                          setImage({ ...image, align: e.target.value })
                        }
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </FormSelect>
                    </label>
                  </div>
                  <p className="text-muted-foreground text-xs leading-5">
                    Images stay within the article width on mobile. Leave one
                    dimension empty to keep the natural aspect ratio. Select an
                    image in the canvas to edit it later.
                  </p>
                  {message && (
                    <p role="alert" className="text-destructive text-sm">
                      {message}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      className="min-h-11"
                      onClick={saveImage}
                    >
                      {editingImage ? "Update image" : "Insert image"}
                    </Button>
                    {editingImage && (
                      <Button
                        type="button"
                        variant="outline"
                        className="min-h-11"
                        onClick={removeImage}
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
              </ScrollArea>
            </DialogContent>
          </Dialog>
          {editor.isActive("table") && (
            <ScrollArea className="border-border min-w-0 border-b" type="auto">
              <div
                role="group"
                aria-label="Table actions"
                className="flex w-max min-w-full gap-1 p-2"
              >
                {[
                  ["Add row", () => editor.chain().focus().addRowAfter().run()],
                  [
                    "Add column",
                    () => editor.chain().focus().addColumnAfter().run(),
                  ],
                  [
                    "Delete row",
                    () => editor.chain().focus().deleteRow().run(),
                  ],
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
                    className="h-11 shrink-0 text-xs sm:h-9"
                    onClick={action as () => void}
                  >
                    {label as string}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="h-1.5" />
            </ScrollArea>
          )}
          {message && !showImage && (
            <p role="alert" className="text-destructive px-4 py-3 text-sm">
              {message}
            </p>
          )}
          <ContextMenu modal={false}>
            <ContextMenuTrigger asChild>
              <div
                className="relative"
                onContextMenuCapture={(event) => {
                  const target =
                    event.target instanceof Element
                      ? event.target.closest("img")
                      : null;
                  if (target && editor.view.dom.contains(target)) {
                    const pos = editor.view.posAtDOM(target, 0);
                    if (editor.state.doc.nodeAt(pos)?.type.name === "image")
                      editor.commands.setNodeSelection(pos);
                  } else if (event.clientX || event.clientY) {
                    const position = editor.view.posAtCoords({
                      left: event.clientX,
                      top: event.clientY,
                    });
                    if (position)
                      editor.commands.setTextSelection(position.pos);
                  }
                  imageSelection.current = editor.state.selection.getBookmark();
                }}
              >
                <EditorContent editor={editor} />
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent
              onCloseAutoFocus={(event) => event.preventDefault()}
            >
              <ContextMenuLabel>Article image</ContextMenuLabel>
              <ContextMenuItem
                onSelect={() =>
                  openImageSettings(editor, editor.isActive("image"))
                }
              >
                <ImagePlus />
                {editor.isActive("image")
                  ? "Insert image after this one…"
                  : "Insert image here…"}
              </ContextMenuItem>
              {editor.isActive("image") && (
                <>
                  <ContextMenuItem onSelect={() => openImageSettings(editor)}>
                    <ImageIcon />
                    Image size, alignment & caption…
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem variant="destructive" onSelect={removeImage}>
                    <Trash2 />
                    Remove image
                  </ContextMenuItem>
                </>
              )}
            </ContextMenuContent>
          </ContextMenu>
          <p className="border-border text-muted-foreground border-t px-4 py-3 text-xs leading-5">
            Write directly, paste formatted text, or import Markdown. Use
            headings for structure and descriptive links for references.{" "}
            Right-click where you are writing to insert an image, or use
            Ctrl/⌘+Alt+I. Select an image to edit its size, alignment and
            caption.
          </p>
        </>
      )}
    </div>
  );
}

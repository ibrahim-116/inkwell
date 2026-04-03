"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { useEffect } from "react";
import "./editor.css";

interface TiptapRendererProps {
  content: string; // JSON string
}

export default function TiptapRenderer({ content }: TiptapRendererProps) {
  const jsonContent = (() => {
    try {
      return JSON.parse(content);
    } catch {
      // Fallback for plain text or malformed JSON
      return {
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: content }] }],
      };
    }
  })();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Underline,
    ],
    content: jsonContent,
    editable: false,
    immediatelyRender: false,
  });

  // Update content if it changes dynamically
  useEffect(() => {
    if (editor && content) {
      try {
        const newJson = JSON.parse(content);
        editor.commands.setContent(newJson);
      } catch {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="tiptap-renderer w-full">
      <EditorContent editor={editor} />
    </div>
  );
}

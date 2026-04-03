"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import CharacterCount from "@tiptap/extension-character-count";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import MenuBar from "./MenuBar";
import "./editor.css";

const lowlight = createLowlight(common);

interface EditorProps {
  initialContent?: unknown;
  onChange: (content: unknown) => void;
  placeholder?: string;
}

export default function Editor({ initialContent, onChange, placeholder }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: false,
      }),
      Typography,
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg border shadow-sm max-w-full my-8 mx-auto block",
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "rounded-md bg-gray-900 text-gray-100 p-6 font-mono text-sm my-6 overflow-x-auto",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Start writing your story...",
      }),
      CharacterCount,
    ],
    immediatelyRender: false,
    content: initialContent || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: "prose-inkwell focus:outline-none min-h-[500px]",
      },
    },
  });

  return (
    <div className="w-full relative">
      <MenuBar editor={editor} />
      <div className="relative">
        <EditorContent editor={editor} />
      </div>
      
      {editor && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/90 backdrop-blur border rounded-full shadow-lg text-[10px] uppercase font-bold tracking-widest text-gray-500 z-50 flex items-center gap-4">
          <span>{editor.storage.characterCount.words()} words</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full" />
          <span>{editor.storage.characterCount.characters()} characters</span>
        </div>
      )}
    </div>
  );
}

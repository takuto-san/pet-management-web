"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { FloatingMenu } from '@tiptap/extension-floating-menu'
import { BubbleMenu } from '@tiptap/extension-bubble-menu'

// ページの型定義
interface Page {
  id: string;
  title: string;
  content: string;
}

interface TiptapEditorProps {
  selectedPage: Page | null;
  editingPageTitle: boolean;
  editingPageTitleValue: string;
  onEditingPageTitleChange: (editing: boolean) => void;
  onEditingPageTitleValueChange: (value: string) => void;
  onPageTitleClick: () => void;
  onPageTitleChange: (newTitle: string) => void;
  editingPageContent: string;
  onEditingPageContentChange: (content: string) => void;
  onPageContentChange: (content: string) => void;
}

export function TiptapEditor({
  selectedPage,
  editingPageTitle,
  editingPageTitleValue,
  onEditingPageTitleChange,
  onEditingPageTitleValueChange,
  onPageTitleClick,
  onPageTitleChange,
  editingPageContent,
  onEditingPageContentChange,
  onPageContentChange,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "'/' でコマンドを入力...",
      }),
      FloatingMenu.configure({
        shouldShow: ({ state, editor }) => {
          const { $from } = state.selection;
          const currentLineText = $from.parent.textContent;
          return currentLineText === '/';
        },
      }),
      BubbleMenu.configure({
        shouldShow: ({ editor, state }) => {
          return !editor.isActive('image') && !state.selection.empty;
        },
      }),
    ],
    content: editingPageContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onEditingPageContentChange(html);
      onPageContentChange(html);
    },
  });

  // ページが変更されたときにエディタの内容を更新
  useEffect(() => {
    if (editor && selectedPage) {
      editor.commands.setContent(editingPageContent);
    }
  }, [editor, selectedPage, editingPageContent]);

  // ページ選択時：エディタ
  if (selectedPage) {
    return (
      <div className="h-full bg-gray-900 flex flex-col">
        <div className="pt-20 px-6">
          <div className="max-w-3xl mx-auto">
            {editingPageTitle ? (
              <input
                autoFocus
                type="text"
                value={editingPageTitleValue}
                onChange={(e) => onEditingPageTitleValueChange(e.target.value)}
                onBlur={() => {
                  onEditingPageTitleChange(false);
                  onPageTitleChange(editingPageTitleValue);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onEditingPageTitleChange(false);
                    onPageTitleChange(editingPageTitleValue);
                  } else if (e.key === "Escape") {
                      onEditingPageTitleChange(false);
                    }
                }}
                onFocus={(e) => e.target.select()}
                className="w-full text-4xl font-bold bg-transparent border-none outline-none text-white placeholder-gray-400"
              />
            ) : (
              <h1
                className="text-4xl font-bold text-white cursor-pointer hover:bg-gray-800 rounded px-2 py-1 transition-colors"
                onClick={onPageTitleClick}
              >
                {selectedPage.title}
              </h1>
            )}
          </div>
        </div>
        <div className="flex-1 px-6 pb-6">
          <div className="max-w-3xl mx-auto relative">
            {editor ? (
              <EditorContent
                editor={editor}
                className="min-h-[400px] prose prose-invert max-w-none focus:outline-none text-white"
              />
            ) : (
              <div className="text-white">エディタを読み込み中...</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 何も選択されていない場合
  return (
    <div className="h-full bg-gray-900" />
  );
}

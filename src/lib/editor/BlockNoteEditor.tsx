"use client";

import { useEffect, useState } from "react";
import { BlockNoteEditor as BlockNoteEditorClass } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

// ページの型定義
interface Page {
  id: string;
  title: string;
  content: string;
}

interface BlockNoteEditorProps {
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

export function BlockNoteEditor({
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
}: BlockNoteEditorProps) {

  // BlockNote エディタインスタンス
  const [editor, setEditor] = useState<BlockNoteEditorClass | null>(null);

  // エディタ初期化
  useEffect(() => {
    const newEditor = BlockNoteEditorClass.create();
    setEditor(newEditor);
  }, []);

  // エディタの変更を監視
  useEffect(() => {
    if (!editor) return;

    const handleChange = () => {
      if (!editor) return;
      const blocks = editor.document;
      // エディタのビルトインブロック->HTML変換を使用
      const html = editor.blocksToHTMLLossy(blocks);
      onEditingPageContentChange(html);
      onPageContentChange(html);
    };

    editor.onChange(handleChange);

    return () => {
      // クリーンアップ
    };
  }, [editor, onEditingPageContentChange, onPageContentChange]);

  // コンテンツ更新
  useEffect(() => {
    if (!editor || editingPageContent === undefined) return;
    
    try {
      // エディタのビルトインHTML->ブロック変換を使用
      if (!editingPageContent || editingPageContent.trim() === '') {
        // 空の場合は空のパラグラフを設定
        editor.replaceBlocks(editor.document, [
          {
            type: "paragraph",
            content: "",
          },
        ]);
      } else {
        const blocks = editor.tryParseHTMLToBlocks(editingPageContent);
        editor.replaceBlocks(editor.document, blocks);
      }
    } catch (error) {
      console.error('HTML to BlockNote conversion error:', error);
      // エラー時は空のパラグラフを設定
      editor.replaceBlocks(editor.document, [
        {
          type: "paragraph",
          content: "",
        },
      ]);
    }
  }, [editor, editingPageContent]);

  // ページ選択時：エディタ
  if (selectedPage) {
    return (
      <div className="mx-auto max-w-3xl w-full px-12 pt-24 bg-background min-h-[80vh]">
        {editingPageTitle ? (
          <input
            type="text"
            value={editingPageTitleValue}
            onChange={(e) => onEditingPageTitleValueChange(e.target.value)}
            onBlur={() => {
              onPageTitleChange(editingPageTitleValue);
              onEditingPageTitleChange(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onPageTitleChange(editingPageTitleValue);
                onEditingPageTitleChange(false);
              }
            }}
            className="text-5xl font-bold text-foreground mb-8 bg-transparent border-none outline-none w-full"
            autoFocus
          />
        ) : (
          <h1
            className="text-5xl font-bold text-foreground mb-8 cursor-pointer"
            onClick={onPageTitleClick}
          >
            {selectedPage.title || "無題"}
          </h1>
        )}
        <div className="blocknote-editor">
          {editor ? (
            <BlockNoteView
              editor={editor}
            />
          ) : (
            <div className="text-foreground">Loading editor...</div>
          )}
        </div>
      </div>
    );
  }

  // 何も選択されていない場合
  return (
    <div className="h-full bg-background flex items-center justify-center">
      <div className="text-foreground text-center">
        <p className="text-lg mb-2">ページを選択してください</p>
        <p className="text-sm text-muted-foreground">ノートからページを選択すると、ここにエディタが表示されます</p>
      </div>
    </div>
  );
}

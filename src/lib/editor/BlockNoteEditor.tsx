"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { BlockNoteEditor as BlockNoteEditorClass } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/shadcn";
import { Box } from "@mui/material";
import { InsertDriveFile as InsertDriveFileIcon, Description as DescriptionIcon } from "@mui/icons-material";
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
  
  // Track if the user is actively typing (to prevent content sync feedback loop)
  const isUserTypingRef = useRef(false);
  const contentSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // エディタ初期化
  useEffect(() => {
    const newEditor = BlockNoteEditorClass.create();
    setEditor(newEditor);
  }, []);

  // Memoize the change handler to prevent recreation
  const handleEditorChange = useCallback(() => {
    if (!editor) return;
    
    // Mark that user is actively typing
    isUserTypingRef.current = true;
    
    // Clear existing timeout
    if (contentSyncTimeoutRef.current) {
      clearTimeout(contentSyncTimeoutRef.current);
    }
    
    const blocks = editor.document;
    // エディタのビルトインブロック->HTML変換を使用
    const html = editor.blocksToHTMLLossy(blocks);
    onEditingPageContentChange(html);
    onPageContentChange(html);
    
    // Reset typing flag after a short delay (allows IME composition to complete)
    contentSyncTimeoutRef.current = setTimeout(() => {
      isUserTypingRef.current = false;
    }, 500);
  }, [editor, onEditingPageContentChange, onPageContentChange]);

  // エディタの変更を監視
  useEffect(() => {
    if (!editor) return;

    editor.onChange(handleEditorChange);

    return () => {
      // Clean up timeout on unmount
      if (contentSyncTimeoutRef.current) {
        clearTimeout(contentSyncTimeoutRef.current);
      }
    };
  }, [editor, handleEditorChange]);

  // コンテンツ更新 - only when not actively typing
  useEffect(() => {
    if (!editor || editingPageContent === undefined) return;
    
    // Skip content sync if user is actively typing (prevents IME interruption)
    if (isUserTypingRef.current) return;
    
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
    const isContentEmpty = !selectedPage.content || selectedPage.content.trim() === '';
    const Icon = isContentEmpty ? InsertDriveFileIcon : DescriptionIcon;

    return (
      <Box sx={{ mx: "auto", maxWidth: "3xl", width: "100%", px: 12, pt: 4, bgcolor: "#2D2631", minHeight: "80vh" }}>
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
            className="text-4xl font-bold text-white mb-8 bg-transparent border-none outline-none w-full"
            autoFocus
          />
        ) : (
          <h1
            className="text-4xl font-bold text-white mb-8 cursor-pointer flex items-center"
            onClick={onPageTitleClick}
          >
            <Icon sx={{ mr: 2, fontSize: "2.5rem" }} />
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
      </Box>
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

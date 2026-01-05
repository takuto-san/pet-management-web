"use client";

import { useEffect, useState } from "react";
import { PartialBlock, BlockNoteEditor as BlockNoteEditorClass } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { Command } from "@/components/ui/command";
import * as Popover from "@/components/ui/popover";

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

  // HTMLをBlockNoteブロックに変換する関数
  const htmlToBlocks = (html: string): PartialBlock[] => {
    if (!html || html.trim() === '') {
      return [
        {
          type: "paragraph",
          content: "",
        },
      ];
    }

    // 簡易的なHTML to BlockNote変換
    // 実際の変換ではより複雑な処理が必要ですが、基本的な変換を実装
    try {
      // HTMLをパースしてブロックに変換
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const blocks: PartialBlock[] = [];

      const processNode = (node: Node): PartialBlock[] => {
        const blocks: PartialBlock[] = [];

        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent?.trim();
          if (text && text.length > 0) {
            blocks.push({
              type: "paragraph",
              content: text,
            });
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          const tagName = element.tagName.toLowerCase();

          switch (tagName) {
            case 'p':
              blocks.push({
                type: "paragraph",
                content: element.textContent || "",
              });
              break;
            case 'h1':
              blocks.push({
                type: "heading",
                content: element.textContent || "",
                props: { level: 1 },
              });
              break;
            case 'h2':
              blocks.push({
                type: "heading",
                content: element.textContent || "",
                props: { level: 2 },
              });
              break;
            case 'h3':
              blocks.push({
                type: "heading",
                content: element.textContent || "",
                props: { level: 3 },
              });
              break;
            case 'ul':
              // リストアイテムを処理
              Array.from(element.children).forEach(li => {
                if (li.tagName.toLowerCase() === 'li') {
                  blocks.push({
                    type: "bulletListItem",
                    content: li.textContent || "",
                  });
                }
              });
              break;
            case 'ol':
              // 番号付きリストアイテムを処理
              Array.from(element.children).forEach(li => {
                if (li.tagName.toLowerCase() === 'li') {
                  blocks.push({
                    type: "numberedListItem",
                    content: li.textContent || "",
                  });
                }
              });
              break;
            case 'div':
            case 'span':
              // 子ノードを処理
              Array.from(element.childNodes).forEach(child => {
                blocks.push(...processNode(child));
              });
              break;
            default:
              // その他の要素は段落として扱う
              blocks.push({
                type: "paragraph",
                content: element.textContent || "",
              });
              break;
          }
        }

        return blocks;
      };

      Array.from(doc.body.childNodes).forEach(node => {
        blocks.push(...processNode(node));
      });

      // ブロックが空の場合はデフォルトブロックを返す
      if (blocks.length === 0) {
        return [
          {
            type: "paragraph",
            content: "",
          },
        ];
      }

      return blocks;
    } catch (error) {
      console.error('HTML to BlockNote conversion error:', error);
      return [
        {
          type: "paragraph",
          content: html,
        },
      ];
    }
  };

  // BlockNoteブロックをHTMLに変換する関数
  const blocksToHtml = (blocks: PartialBlock[]): string => {
    try {
      let html = '';

      blocks.forEach(block => {
        switch (block.type) {
          case 'paragraph':
            html += `<p>${block.content}</p>`;
            break;
          case 'heading':
            const level = (block.props as any)?.level || 1;
            html += `<h${level}>${block.content}</h${level}>`;
            break;
          case 'bulletListItem':
            html += `<li>${block.content}</li>`;
            break;
          case 'numberedListItem':
            html += `<li>${block.content}</li>`;
            break;
          default:
            html += `<p>${block.content}</p>`;
            break;
        }
      });

      return html;
    } catch (error) {
      console.error('BlockNote to HTML conversion error:', error);
      return '';
    }
  };

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
      const html = blocksToHtml(blocks);
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
    if (editor && editingPageContent !== undefined) {
      const blocks = htmlToBlocks(editingPageContent);
      editor.replaceBlocks(editor.document, blocks);
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
              shadCNComponents={{
                Popover,
              }}
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

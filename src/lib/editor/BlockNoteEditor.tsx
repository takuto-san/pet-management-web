"use client";

import { useEffect, useMemo, useState } from "react";
import { PartialBlock, BlockNoteEditor as BlockNoteEditorClass } from "@blocknote/core";
import { BlockNoteViewRaw } from "@blocknote/react";
import "@blocknote/react/style.css";

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

  // State for cover and icon
  const [showCoverHover, setShowCoverHover] = useState(false);
  const [showIconHover, setShowIconHover] = useState(false);
  const [hasCover, setHasCover] = useState(false);
  const [hasIcon, setHasIcon] = useState(false);
  const [pageIcon, setPageIcon] = useState("📄");

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

  // 初期ブロックデータを計算
  const initialBlocks = useMemo(() => {
    return htmlToBlocks(editingPageContent);
  }, [editingPageContent]);

  // エディタの変更ハンドラ
  const handleEditorChange = () => {
    const blocks = editor.document;
    const html = blocksToHtml(blocks);
    onEditingPageContentChange(html);
    onPageContentChange(html);
  };

  // BlockNote エディタインスタンス
  const editor = useMemo(() => {
    return BlockNoteEditorClass.create();
  }, []);

  // エディタの変更を監視
  useEffect(() => {
    const handleChange = () => {
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
      <div className="bg-[#191919] min-h-[calc(100vh-200px)]">
        {/* Breadcrumb Navigation */}
        <div className="px-12 pt-4 pb-2 text-sm text-zinc-500">
          <span className="hover:text-zinc-300 cursor-pointer">ワークスペース</span>
          <span className="mx-2">/</span>
          <span className="hover:text-zinc-300 cursor-pointer">ノート</span>
          <span className="mx-2">/</span>
          <span className="text-zinc-400">{selectedPage.title || "無題"}</span>
        </div>

        {/* Cover Image Section */}
        <div 
          className="relative h-[200px] bg-gradient-to-br from-zinc-800 to-zinc-900 group"
          onMouseEnter={() => setShowCoverHover(true)}
          onMouseLeave={() => setShowCoverHover(false)}
        >
          {!hasCover && showCoverHover && (
            <button
              onClick={() => setHasCover(true)}
              className="absolute bottom-4 right-4 px-4 py-2 bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 text-sm rounded-md transition-colors"
            >
              カバーを追加
            </button>
          )}
          {hasCover && showCoverHover && (
            <button
              onClick={() => setHasCover(false)}
              className="absolute bottom-4 right-4 px-4 py-2 bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 text-sm rounded-md transition-colors"
            >
              カバーを削除
            </button>
          )}
        </div>

        {/* Page Icon and Content Container */}
        <div 
          className="mx-auto max-w-4xl w-full px-12 cursor-text relative"
          onClick={(e) => {
            // Only focus if clicking on the container itself, not on existing blocks
            if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('blocknote-editor')) {
              editor.focus();
            }
          }}
        >
          {/* Page Icon */}
          <div 
            className="relative -mt-8 group"
            onMouseEnter={() => setShowIconHover(true)}
            onMouseLeave={() => setShowIconHover(false)}
          >
            {hasIcon ? (
              <div className="text-6xl mb-4 inline-block cursor-pointer hover:opacity-80 transition-opacity">
                {pageIcon}
              </div>
            ) : (
              showIconHover && (
                <button
                  onClick={() => {
                    setHasIcon(true);
                    setPageIcon("📄");
                  }}
                  className="px-4 py-2 bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 text-sm rounded-md transition-colors mb-4"
                >
                  アイコンを追加
                </button>
              )
            )}
          </div>

          {/* Title */}
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
              className="text-5xl font-bold text-zinc-100 mb-2 bg-transparent border-none outline-none w-full"
              autoFocus
            />
          ) : (
            <h1
              className="text-5xl font-bold text-zinc-100 mb-2 cursor-pointer hover:bg-zinc-800/30 rounded px-1 -ml-1 transition-colors"
              onClick={onPageTitleClick}
            >
              {selectedPage.title || "無題"}
            </h1>
          )}

          {/* Editor Content with margin-top */}
          <div className="blocknote-editor leading-relaxed mt-8" data-theme="dark">
            <BlockNoteViewRaw
              editor={editor}
              className="text-zinc-100"
              sideMenu={true}
              slashMenu={true}
              emojiPicker={true}
              formattingToolbar={true}
            />
          </div>
        </div>
      </div>
    );
  }

  // 何も選択されていない場合
  return (
    <div className="h-full bg-gray-900 flex items-center justify-center">
      <div className="text-white text-center">
        <p className="text-lg mb-2">ページを選択してください</p>
        <p className="text-sm text-gray-400">ノートからページを選択すると、ここにエディタが表示されます</p>
      </div>
    </div>
  );
}

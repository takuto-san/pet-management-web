"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/stores/store";
import { Header } from "@/components/organisms/Header";
import { Footer } from "@/components/organisms/Footer";
import { LayoutTemplate } from "@/components/templates/LayoutTemplate";
import { useListSpaces } from "@/api/generated/space/space";
import { useListDocuments, useAddDocument, useUpdateDocument, useDeleteDocument } from "@/api/generated/document/document";
import type { Document, DocumentFields, DocumentUpdateFields } from "@/types/api";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  TextField,
  IconButton,
  Button,
  ThemeProvider,
  createTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemIcon,
  InputAdornment,
} from "@mui/material";
import { Menu as MenuIcon, ChevronRight as ChevronRightIcon, Note as NoteIcon, Description as DescriptionIcon, Create as CreateIcon, HealthAndSafety as HealthAndSafetyIcon, Book as BookIcon, Search as SearchIcon, ArrowBack as ArrowBackIcon } from "@mui/icons-material";

// ページの型定義
interface Page {
  id: string;
  title: string;
  content: string;
}

// セクションの型定義
interface Section {
  id: string;
  title: string;
  pages: Page[];
  isExpanded: boolean;
}

// ノートの型定義
interface Note {
  id: string;
  name: string;
  sections: Section[];
  createdAt: Date;
}

// テンプレートの型定義
interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactElement;
  sections: { title: string; pages?: { title: string; content: string }[] }[];
}

// ダークテーマ
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
    primary: {
      main: "#90caf9",
    },
  },
});

// ハンバーガーバー
function HamburgerBar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  return (
    <Box sx={{ p: 2, display: "flex", alignItems: "center", bgcolor: "background.paper" }}>
      <IconButton onClick={onToggleSidebar}>
        <MenuIcon />
      </IconButton>
    </Box>
  );
}

// ノート一覧（サイドバー）
function NoteList({ notes, selectedNoteId, selectedSectionId, expandedNoteIds, onSelectNote, onSelectSection, onToggleExpand, onAddSection, onAddNote, isSidebarOpen, editingNoteId, editingSectionId, editingNoteName, editingSectionName, onDoubleClickNote, onDoubleClickSection, onNoteNameChange, onSectionNameChange, onEditingNoteNameChange, onEditingSectionNameChange }: {
  notes: Note[];
  selectedNoteId: string;
  selectedSectionId: string | null;
  expandedNoteIds: string[];
  onSelectNote: (id: string) => void;
  onSelectSection: (noteId: string, sectionId: string) => void;
  onToggleExpand: (id: string) => void;
  onAddSection: (noteId: string) => void;
  onAddNote: () => void;
  isSidebarOpen: boolean;
  editingNoteId: string | null;
  editingSectionId: string | null;
  editingNoteName: string;
  editingSectionName: string;
  onDoubleClickNote: (id: string) => void;
  onDoubleClickSection: (noteId: string, sectionId: string) => void;
  onNoteNameChange: (noteId: string, newName: string) => void;
  onSectionNameChange: (noteId: string, sectionId: string, newTitle: string) => void;
  onEditingNoteNameChange: (name: string) => void;
  onEditingSectionNameChange: (name: string) => void;
}) {
  return (
    <Box sx={{ height: "100%", bgcolor: "background.paper" }}>
      {isSidebarOpen && (
        <Box sx={{ width: 256, display: "flex", flexDirection: "column", height: "100%" }}>
          <List sx={{ flexGrow: 1, overflow: "auto" }}>
            {notes.map((note) => {
              const isExpanded = expandedNoteIds.includes(note.id);
              const isSelected = selectedNoteId === note.id && selectedSectionId === null;
              return (
                <Box key={note.id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      selected={isSelected}
                      onClick={() => onSelectNote(note.id)}
                      onDoubleClick={() => onDoubleClickNote(note.id)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        px: 1,
                        "&.Mui-selected": {
                          bgcolor: "grey.700",
                          borderRadius: 1,
                          "&:hover": {
                            bgcolor: "grey.600",
                          },
                        },
                      }}
                    >
                      <ChevronRightIcon
                        sx={{
                          transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                          transition: "transform 0.2s",
                          mr: 1,
                          cursor: "pointer",
                          fontSize: "1.2rem",
                          color: "text.secondary",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleExpand(note.id);
                        }}
                      />
                      {editingNoteId === note.id ? (
                        <TextField
                          autoFocus
                          value={editingNoteName}
                          onChange={(e) => onEditingNoteNameChange(e.target.value)}
                          onBlur={() => onNoteNameChange(note.id, editingNoteName)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              onNoteNameChange(note.id, editingNoteName);
                            }
                          }}
                          onFocus={(e) => e.target.select()}
                          fullWidth
                          variant="standard"
                          InputProps={{
                            disableUnderline: true,
                          }}
                          sx={{
                            "& .MuiInputBase-input": {
                              color: "text.primary",
                              fontSize: "1rem",
                            },
                          }}
                        />
                      ) : (
                        <ListItemText primary={note.name} />
                      )}
                    </ListItemButton>
                  </ListItem>
                  {isExpanded && (
                    <List sx={{ pl: 4 }}>
                      {note.sections.map((section) => {
                        const isSectionSelected = selectedSectionId === section.id;
                        return (
                          <ListItem key={section.id} disablePadding>
                            <ListItemButton
                              selected={isSectionSelected}
                              onClick={() => onSelectSection(note.id, section.id)}
                              onDoubleClick={() => onDoubleClickSection(note.id, section.id)}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                py: 0.5,
                                "&.Mui-selected": {
                                  bgcolor: "grey.700",
                                  borderRadius: 1,
                                  px: 1,
                                  "&:hover": {
                                    bgcolor: "grey.600",
                                  },
                                },
                              }}
                            >
                              {editingSectionId === section.id ? (
                                <TextField
                                  autoFocus
                                  value={editingSectionName}
                                  onChange={(e) => onEditingSectionNameChange(e.target.value)}
                                  onBlur={() => onSectionNameChange(note.id, section.id, editingSectionName)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      onSectionNameChange(note.id, section.id, editingSectionName);
                                    }
                                  }}
                                  onFocus={(e) => e.target.select()}
                                  fullWidth
                                  variant="standard"
                                  InputProps={{
                                    disableUnderline: true,
                                  }}
                                  sx={{
                                    "& .MuiInputBase-input": {
                                      color: "text.primary",
                                      fontSize: "0.9rem",
                                    },
                                  }}
                                />
                              ) : (
                                <ListItemText primary={section.title} sx={{ fontSize: "0.9rem" }} />
                              )}
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                      <ListItem disablePadding>
                        <ListItemButton
                          onClick={() => onAddSection(note.id)}
                          sx={{
                            py: 0.5,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <CreateIcon sx={{ mr: 1, fontSize: "0.9rem", color: "text.secondary" }} />
                          <ListItemText primary="セクションを追加" sx={{ fontSize: "0.9rem", color: "text.secondary" }} />
                        </ListItemButton>
                      </ListItem>
                    </List>
                  )}
                </Box>
              );
            })}
          </List>
          <Box sx={{ p: 1, borderTop: 1, borderColor: "divider" }}>
            <Button
              startIcon={<CreateIcon />}
              fullWidth
              variant="outlined"
              onClick={onAddNote}
              sx={{
                justifyContent: "flex-start",
                textTransform: "none",
                color: "text.primary",
                borderColor: "divider",
                "&:hover": {
                  borderColor: "text.secondary",
                },
              }}
            >
              ノートを追加
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}

// ページリスト（サイドバーの横）
function PageList({ selectedSection, selectedPageId, onSelectPage, selectedNoteId, editingPageId, editingPageName, onDoubleClickPage, onPageNameChange, onEditingPageNameChange, onAddPage }: {
  selectedSection: Section | null;
  selectedPageId: string | null;
  onSelectPage: (noteId: string, sectionId: string, pageId: string) => void;
  selectedNoteId: string;
  editingPageId: string | null;
  editingPageName: string;
  onDoubleClickPage: (noteId: string, sectionId: string, pageId: string) => void;
  onPageNameChange: (noteId: string, sectionId: string, pageId: string, newTitle: string) => void;
  onEditingPageNameChange: (name: string) => void;
  onAddPage: (sectionId: string) => void;
}) {
  if (!selectedSection) return null;

  return (
    <Box sx={{ height: "100%", bgcolor: "background.paper", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 1 }}>
        <Button
          startIcon={<CreateIcon />}
          fullWidth
          variant="outlined"
          onClick={() => onAddPage(selectedSection.id)}
          sx={{
            justifyContent: "flex-start",
            textTransform: "none",
            color: "text.primary",
            borderColor: "divider",
            "&:hover": {
              borderColor: "text.secondary",
            },
          }}
        >
          ページを追加
        </Button>
      </Box>
      <List sx={{ flexGrow: 1, overflow: "auto", p: 1 }}>
        {selectedSection.pages.map((page) => {
          const isPageSelected = selectedPageId === page.id;
          return (
            <ListItem key={page.id} disablePadding>
              <ListItemButton
                selected={isPageSelected}
                onClick={() => onSelectPage(selectedNoteId, selectedSection.id, page.id)}
                onDoubleClick={() => onDoubleClickPage(selectedNoteId, selectedSection.id, page.id)}
                sx={{
                  py: 0.5,
                  "&.Mui-selected": {
                    bgcolor: "grey.700",
                    borderRadius: 1,
                    px: 1,
                    "&:hover": {
                      bgcolor: "grey.600",
                    },
                  },
                }}
              >
                {editingPageId === page.id ? (
                  <TextField
                    autoFocus
                    value={editingPageName}
                    onChange={(e) => onEditingPageNameChange(e.target.value)}
                    onBlur={() => onPageNameChange(selectedNoteId, selectedSection.id, page.id, editingPageName)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        onPageNameChange(selectedNoteId, selectedSection.id, page.id, editingPageName);
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                    fullWidth
                    variant="standard"
                    InputProps={{
                      disableUnderline: true,
                    }}
                    sx={{
                      "& .MuiInputBase-input": {
                        color: "text.primary",
                        fontSize: "0.9rem",
                      },
                    }}
                  />
                ) : (
                  <ListItemText primary={page.title} sx={{ fontSize: "0.9rem" }} />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}

// メインコンテンツ
function MainContent({ selectedPage, editingPageId, editingPageName, onDoubleClickPage, onPageNameChange, onEditingPageNameChange }: {
  selectedPage: Page | null;
  editingPageId: string | null;
  editingPageName: string;
  onDoubleClickPage: () => void;
  onPageNameChange: (newTitle: string) => void;
  onEditingPageNameChange: (name: string) => void;
}) {
  // ページ選択時：エディタ
  if (selectedPage) {
    return (
      <Box sx={{ height: "100%", bgcolor: "background.paper", display: "flex", flexDirection: "column" }}>
        <Box sx={{ p: 3 }} onDoubleClick={onDoubleClickPage}>
          {editingPageId === selectedPage.id ? (
            <TextField
              autoFocus
              value={editingPageName}
              onChange={(e) => onEditingPageNameChange(e.target.value)}
              onBlur={() => onPageNameChange(editingPageName)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onPageNameChange(editingPageName);
                }
              }}
              onFocus={(e) => e.target.select()}
              fullWidth
              variant="standard"
              InputProps={{
                disableUnderline: true,
              }}
              sx={{
                "& .MuiInputBase-input": {
                  color: "text.primary",
                  fontSize: "2rem",
                  fontWeight: "bold",
                },
              }}
            />
          ) : (
            <Typography variant="h4" sx={{ fontWeight: "bold", color: "text.primary" }}>
              {selectedPage.title}
            </Typography>
          )}
        </Box>
        <Box sx={{ flexGrow: 1, p: 3, overflow: "auto" }}>
          <TextField
            fullWidth
            multiline
            variant="standard"
            placeholder="ここにページの内容を入力してください..."
            value={selectedPage.content}
            onChange={(e) => {
              // TODO: コンテンツ更新ハンドラーを実装
            }}
            InputProps={{
              disableUnderline: true,
            }}
            sx={{
              "& .MuiInputBase-input": {
                fontSize: "1rem",
                lineHeight: 1.5,
              },
            }}
          />
        </Box>
      </Box>
    );
  }

  // 何も選択されていない場合
  return (
    <Box sx={{ height: "100%", bgcolor: "background.paper" }} />
  );
}

// DocumentからNote構造に変換する関数
function convertDocumentsToNotes(documents: Document[]): Note[] {
  const notes: Note[] = [];
  const sections: { [noteId: string]: Section[] } = {};
  const pages: { [sectionId: string]: Page[] } = {};

  // ノートを作成
  documents.filter(doc => doc.parentDocId === null).forEach(doc => {
    notes.push({
      id: doc.id,
      name: doc.title,
      sections: [],
      createdAt: new Date(doc.createdAt || Date.now()),
    });
  });

  // セクションを作成
  documents.filter(doc => doc.parentDocId && notes.some(note => note.id === doc.parentDocId)).forEach(doc => {
    const section: Section = {
      id: doc.id,
      title: doc.title,
      pages: [],
      isExpanded: false,
    };
    if (!sections[doc.parentDocId!]) {
      sections[doc.parentDocId!] = [];
    }
    sections[doc.parentDocId!].push(section);
  });

  // ページを作成
  documents.filter(doc => doc.parentDocId && Object.keys(sections).some(noteId => sections[noteId].some(sec => sec.id === doc.parentDocId))).forEach(doc => {
    const page: Page = {
      id: doc.id,
      title: doc.title,
      content: (doc.body?.content as string) || "",
    };
    if (!pages[doc.parentDocId!]) {
      pages[doc.parentDocId!] = [];
    }
    pages[doc.parentDocId!].push(page);
  });

  // 構造を組み立てる
  notes.forEach(note => {
    note.sections = sections[note.id] || [];
    note.sections.forEach(section => {
      section.pages = pages[section.id] || [];
    });
  });

  return notes;
}

export function NotePage() {
  const router = useRouter();
  const { currentUser, isLoadingUser } = useSelector((state: RootState) => ({
    currentUser: state.user.currentUser,
    isLoadingUser: state.user.isLoadingUser,
  }));

  useEffect(() => {
    if (!isLoadingUser && !currentUser) {
      router.push("/auth/signin");
    }
  }, [isLoadingUser, currentUser, router]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTemplateModeDialogOpen, setIsTemplateModeDialogOpen] = useState(false);
  const [isTemplateSelectDialogOpen, setIsTemplateSelectDialogOpen] = useState(false);
  const [templateSearchQuery, setTemplateSearchQuery] = useState("");

  // テンプレートデータ
  const templates: Template[] = [
    {
      id: "health",
      name: "健康手帳",
      description: "ペットの健康記録用",
      icon: <HealthAndSafetyIcon />,
      sections: [
        { title: "体重記録", pages: [{ title: "体重グラフ", content: "" }] },
        { title: "ワクチン記録", pages: [{ title: "接種履歴", content: "" }] },
        { title: "健康メモ", pages: [{ title: "日々の健康状態", content: "" }] },
      ],
    },
    {
      id: "diary",
      name: "日記",
      description: "ペットの日常を記録",
      icon: <BookIcon />,
      sections: [
        { title: "2024年", pages: [{ title: "1月", content: "" }] },
      ],
    },
  ];

  // API hooks
  const { data: spaces } = useListSpaces();
  const spaceId = spaces?.[0]?.id;
  const { data: documents = [] } = useListDocuments(spaceId || "", { query: { enabled: !!spaceId } });
  const addDocumentMutation = useAddDocument();
  const updateDocumentMutation = useUpdateDocument();
  const deleteDocumentMutation = useDeleteDocument();

  // ノートデータをAPIから変換
  const notes = convertDocumentsToNotes(documents);

  const [selectedNoteId, setSelectedNoteId] = useState<string>("");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [expandedNoteIds, setExpandedNoteIds] = useState<string[]>([]);
  const [expandedSectionIds, setExpandedSectionIds] = useState<string[]>([]);

  // notesが変更されたときに初期選択を更新
  useEffect(() => {
    if (notes.length > 0 && !selectedNoteId) {
      setSelectedNoteId(notes[0].id);
      setExpandedNoteIds([notes[0].id]);
    }
  }, [notes, selectedNoteId]);

  // 編集状態の管理
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingNoteName, setEditingNoteName] = useState<string>("");
  const [editingSectionName, setEditingSectionName] = useState<string>("");
  const [editingPageName, setEditingPageName] = useState<string>("");

  const handleAddPage = (sectionId: string) => {
    if (!spaceId) return;
    const newDoc: DocumentFields = {
      title: "新しいページ",
      parentDocId: sectionId,
      body: { content: "" },
    };
    addDocumentMutation.mutate({ spaceId, data: newDoc });
  };

  const selectedNote = notes.find((n) => n.id === selectedNoteId) || null;
  const selectedSection = selectedNote?.sections.find((s) => s.id === selectedSectionId) || null;
  const selectedPage = selectedSection?.pages.find((p) => p.id === selectedPageId) || null;

  // ページが選択されたらタイトルを変更
  useEffect(() => {
    if (selectedPage) {
      document.title = selectedPage.title;
    } else {
      document.title = "PetManagemnt | ペット管理サイト";
    }
  }, [selectedPage]);

  const handleToggleSidebar = () => {
    const newIsSidebarOpen = !isSidebarOpen;
    setIsSidebarOpen(newIsSidebarOpen);
    // サイドバーを閉じる場合、タブ内のコンテンツも全て閉じる
    if (!newIsSidebarOpen) {
      setSelectedSectionId(null);
      setSelectedPageId(null);
    }
  };

  const handleSelectNote = (id: string) => {
    setSelectedNoteId(id);
    setSelectedSectionId(null);
    setSelectedPageId(null);
  };

  const handleSelectSection = (noteId: string, sectionId: string) => {
    setSelectedNoteId(noteId);
    setSelectedSectionId(sectionId);
    setSelectedPageId(null);
  };

  const handleSelectPage = (noteId: string, sectionId: string, pageId: string) => {
    setSelectedNoteId(noteId);
    setSelectedSectionId(sectionId);
    setSelectedPageId(pageId);
  };

  const handleToggleExpand = (noteId: string) => {
    setExpandedNoteIds((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId]
    );
  };

  const handleToggleSection = (sectionId: string) => {
    setExpandedSectionIds((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleAddSection = (noteId: string) => {
    if (!spaceId) return;
    const newDoc: DocumentFields = {
      title: "新しいセクション",
      parentDocId: noteId,
    };
    addDocumentMutation.mutate({ spaceId, data: newDoc });
  };

  const handleAddNote = () => {
    setIsTemplateModeDialogOpen(true);
  };

  const handleSelectTemplateMode = (mode: "template" | "custom") => {
    if (mode === "custom") {
      handleCreateNote("custom");
    } else {
      setIsTemplateModeDialogOpen(false);
      setIsTemplateSelectDialogOpen(true);
    }
  };

  const handleCreateNote = (templateId: string) => {
    if (!spaceId) return;
    let title = "新しいノート";
    let sections: { title: string; pages?: { title: string; content: string }[] }[] = [];

    if (templateId === "custom") {
      // カスタムの場合、空のノート
    } else {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        title = template.name;
        sections = template.sections;
      }
    }

    // ノートを作成
    const noteDoc: DocumentFields = {
      title,
      parentDocId: undefined,
    };
    addDocumentMutation.mutate({ spaceId, data: noteDoc }, {
      onSuccess: (newNote) => {
        setSelectedNoteId(newNote.id);
        setSelectedSectionId(null);
        setSelectedPageId(null);
        setExpandedNoteIds((prev) => [...prev, newNote.id]);
        setIsTemplateModeDialogOpen(false);
        setIsTemplateSelectDialogOpen(false);

        // セクションを作成
        sections.forEach((section, index) => {
          const sectionDoc: DocumentFields = {
            title: section.title,
            parentDocId: newNote.id,
          };
          addDocumentMutation.mutate({ spaceId, data: sectionDoc }, {
            onSuccess: (newSection) => {
              // ページを作成
              if (section.pages) {
                section.pages.forEach((page) => {
                  const pageDoc: DocumentFields = {
                    title: page.title,
                    parentDocId: newSection.id,
                    body: { content: page.content },
                  };
                  addDocumentMutation.mutate({ spaceId, data: pageDoc });
                });
              }
            },
          });
        });
      },
    });
  };

  // 名前変更ハンドラー
  const handleNoteNameChange = (noteId: string, newName: string) => {
    if (!spaceId) return;
    const updateData: DocumentUpdateFields = {
      title: newName,
    };
    updateDocumentMutation.mutate({ spaceId, documentId: noteId, data: updateData }, {
      onSuccess: () => {
        setEditingNoteId(null);
      },
    });
  };

  const handleSectionNameChange = (noteId: string, sectionId: string, newTitle: string) => {
    if (!spaceId) return;
    const updateData: DocumentUpdateFields = {
      title: newTitle,
    };
    updateDocumentMutation.mutate({ spaceId, documentId: sectionId, data: updateData }, {
      onSuccess: () => {
        setEditingSectionId(null);
      },
    });
  };

  const handlePageNameChange = (noteId: string, sectionId: string, pageId: string, newTitle: string) => {
    if (!spaceId) return;
    const updateData: DocumentUpdateFields = {
      title: newTitle,
    };
    updateDocumentMutation.mutate({ spaceId, documentId: pageId, data: updateData }, {
      onSuccess: () => {
        setEditingPageId(null);
      },
    });
  };

  // ダブルクリックハンドラー
  const handleDoubleClickNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setEditingNoteId(noteId);
      setEditingNoteName(note.name);
    }
  };

  const handleDoubleClickSection = (noteId: string, sectionId: string) => {
    const note = notes.find(n => n.id === noteId);
    const section = note?.sections.find(s => s.id === sectionId);
    if (section) {
      setEditingSectionId(sectionId);
      setEditingSectionName(section.title);
    }
  };

  const handleDoubleClickPage = (noteId: string, sectionId: string, pageId: string) => {
    setSelectedNoteId(noteId);
    setSelectedSectionId(sectionId);
    setSelectedPageId(pageId);
    const note = notes.find(n => n.id === noteId);
    const section = note?.sections.find(s => s.id === sectionId);
    const page = section?.pages.find(p => p.id === pageId);
    if (page) {
      setEditingPageId(pageId);
      setEditingPageName(page.title);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <LayoutTemplate
        header={<Header />}
        hamburgerBar={<HamburgerBar onToggleSidebar={handleToggleSidebar} />}
        footer={<Footer />}
        isSidebarOpen={isSidebarOpen}
        sidebar={
          <NoteList
            notes={notes}
            selectedNoteId={selectedNoteId}
            selectedSectionId={selectedSectionId}
            expandedNoteIds={expandedNoteIds}
            onSelectNote={handleSelectNote}
            onSelectSection={handleSelectSection}
            onToggleExpand={handleToggleExpand}
            onAddSection={handleAddSection}
            onAddNote={handleAddNote}
            isSidebarOpen={isSidebarOpen}
            editingNoteId={editingNoteId}
            editingSectionId={editingSectionId}
            editingNoteName={editingNoteName}
            editingSectionName={editingSectionName}
            onDoubleClickNote={handleDoubleClickNote}
            onDoubleClickSection={handleDoubleClickSection}
            onNoteNameChange={handleNoteNameChange}
            onSectionNameChange={handleSectionNameChange}
            onEditingNoteNameChange={setEditingNoteName}
            onEditingSectionNameChange={setEditingSectionName}
          />
        }
        pageList={
          selectedSection ? (
            <PageList
              selectedSection={selectedSection}
              selectedPageId={selectedPageId}
              onSelectPage={handleSelectPage}
              selectedNoteId={selectedNoteId}
              editingPageId={editingPageId}
              editingPageName={editingPageName}
              onDoubleClickPage={handleDoubleClickPage}
              onPageNameChange={handlePageNameChange}
              onEditingPageNameChange={setEditingPageName}
              onAddPage={handleAddPage}
            />
          ) : null
        }
        main={
          <MainContent
            selectedPage={selectedPage}
            editingPageId={editingPageId}
            editingPageName={editingPageName}
            onDoubleClickPage={() => {
              if (selectedNoteId && selectedSectionId && selectedPageId) {
                handleDoubleClickPage(selectedNoteId, selectedSectionId, selectedPageId);
              }
            }}
            onPageNameChange={(newTitle) => {
              if (selectedNoteId && selectedSectionId && selectedPageId) {
                handlePageNameChange(selectedNoteId, selectedSectionId, selectedPageId, newTitle);
              }
            }}
            onEditingPageNameChange={setEditingPageName}
          />
        }
      />
      {/* テンプレートモード選択ダイアログ */}
      <Dialog open={isTemplateModeDialogOpen} onClose={() => setIsTemplateModeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>ノートを作成</DialogTitle>
        <DialogContent>
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleSelectTemplateMode("template")}>
                <ListItemIcon>
                  <DescriptionIcon />
                </ListItemIcon>
                <ListItemText primary="テンプレートから作成" secondary="既存のテンプレートから選択" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleSelectTemplateMode("custom")}>
                <ListItemIcon>
                  <NoteIcon />
                </ListItemIcon>
                <ListItemText primary="カスタム" secondary="新しいノートを作成" />
              </ListItemButton>
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsTemplateModeDialogOpen(false)}>キャンセル</Button>
        </DialogActions>
      </Dialog>
      {/* テンプレート選択ダイアログ */}
      <Dialog open={isTemplateSelectDialogOpen} onClose={() => setIsTemplateSelectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              edge="start"
              onClick={() => {
                setIsTemplateSelectDialogOpen(false);
                setIsTemplateModeDialogOpen(true);
              }}
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            テンプレートを選択
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="テンプレートを検索..."
            value={templateSearchQuery}
            onChange={(e) => setTemplateSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <List>
            {templates
              .filter(template => template.name.includes(templateSearchQuery) || template.description.includes(templateSearchQuery))
              .map(template => (
                <ListItem key={template.id} disablePadding>
                  <ListItemButton onClick={() => handleCreateNote(template.id)}>
                    <ListItemIcon>
                      {template.icon}
                    </ListItemIcon>
                    <ListItemText primary={template.name} secondary={template.description} />
                  </ListItemButton>
                </ListItem>
              ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsTemplateSelectDialogOpen(false)}>キャンセル</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

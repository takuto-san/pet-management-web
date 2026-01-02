"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useQueryClient, useQueries } from "@tanstack/react-query";
import type { RootState } from "@/lib/stores/store";
import { Header } from "@/components/organisms/Header";
import { Footer } from "@/components/organisms/Footer";
import { LayoutTemplate } from "@/components/templates/LayoutTemplate";
import { useListSpaces, useAddSpace, getListSpacesQueryKey } from "@/api/generated/space/space";
import { useListDocuments, useAddDocument, useUpdateDocument, useDeleteDocument, getListDocumentsQueryKey, listDocuments } from "@/api/generated/document/document";
import type { Document, DocumentFields, DocumentUpdateFields } from "@/types/api";
import { Template, noteTemplates } from "@/types/noteTemplates";
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
import { Menu as MenuIcon, ChevronRight as ChevronRightIcon, Note as NoteIcon, Description as DescriptionIcon, Create as CreateIcon, HealthAndSafety as HealthAndSafetyIcon, Book as BookIcon, Search as SearchIcon, ArrowBack as ArrowBackIcon, Delete as DeleteIcon } from "@mui/icons-material";

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

// アイコン取得関数
const getIcon = (icon: string) => {
  switch (icon) {
    case "health":
      return <HealthAndSafetyIcon />;
    case "diary":
      return <BookIcon />;
    default:
      return <NoteIcon />;
  }
};

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
function NoteList({ notes, selectedNoteId, selectedSectionId, expandedNoteIds, onSelectNote, onSelectSection, onToggleExpand, onAddSection, onAddNote, isSidebarOpen, editingNoteId, editingSectionId, editingNoteName, editingSectionName, onDoubleClickNote, onDoubleClickSection, onNoteNameChange, onSectionNameChange, onEditingNoteNameChange, onEditingSectionNameChange, onDeleteNote, onDeleteSection }: {
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
  onDeleteNote: (noteId: string) => void;
  onDeleteSection: (noteId: string, sectionId: string) => void;
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
                      onDoubleClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDoubleClickNote(note.id);
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        px: 1,
                        userSelect: "none",
                        "&.Mui-selected": {
                          bgcolor: "grey.700",
                          borderRadius: 1,
                          "&:hover": {
                            bgcolor: "grey.600",
                          },
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
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
                      </Box>
                      {isSelected && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteNote(note.id);
                          }}
                          sx={{
                            opacity: 0.7,
                            "&:hover": {
                              opacity: 1,
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
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
                              onDoubleClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onDoubleClickSection(note.id, section.id);
                              }}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                py: 0.5,
                                userSelect: "none",
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
                              <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
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
                              </Box>
                              {isSectionSelected && (
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteSection(note.id, section.id);
                                  }}
                                  sx={{
                                    opacity: 0.7,
                                    "&:hover": {
                                      opacity: 1,
                                    },
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
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
function PageList({ selectedSection, selectedPageId, onSelectPage, selectedNoteId, editingPageId, editingPageName, onDoubleClickPage, onPageNameChange, onEditingPageNameChange, onAddPage, onDeletePage }: {
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
  onDeletePage: (noteId: string, sectionId: string, pageId: string) => void;
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
                onDoubleClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDoubleClickPage(selectedNoteId, selectedSection.id, page.id);
                }}
                sx={{
                  py: 0.5,
                  userSelect: "none",
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
                <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
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
                </Box>
                {isPageSelected && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePage(selectedNoteId, selectedSection.id, page.id);
                    }}
                    sx={{
                      opacity: 0.7,
                      "&:hover": {
                        opacity: 1,
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
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
function MainContent({ selectedPage, editingPageTitle, editingPageTitleValue, onEditingPageTitleChange, onEditingPageTitleValueChange, onPageTitleClick, onPageTitleChange, editingPageContent, onEditingPageContentChange, onPageContentChange }: {
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
}) {
  // ページ選択時：エディタ
  if (selectedPage) {
    return (
      <Box sx={{ height: "100%", bgcolor: "background.paper", display: "flex", flexDirection: "column" }}>
        <Box sx={{ p: 3, userSelect: "none" }}>
          {editingPageTitle ? (
            <TextField
              autoFocus
              fullWidth
              variant="standard"
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
              InputProps={{
                disableUnderline: true,
              }}
              sx={{
                "& .MuiInputBase-input": {
                  fontSize: "2rem",
                  fontWeight: "bold",
                  color: "text.primary",
                },
              }}
            />
          ) : (
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                color: "text.primary",
                cursor: "pointer",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 1,
                },
              }}
              onClick={onPageTitleClick}
            >
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
            value={editingPageContent}
            onChange={(e) => onEditingPageContentChange(e.target.value)}
            onBlur={() => onPageContentChange(editingPageContent)}
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

  // 作成順にソート
  notes.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  notes.forEach(note => {
    note.sections.sort((a, b) => {
      const aDoc = documents.find(d => d.id === a.id);
      const bDoc = documents.find(d => d.id === b.id);
      return (new Date(aDoc?.createdAt || 0)).getTime() - (new Date(bDoc?.createdAt || 0)).getTime();
    });
    note.sections.forEach(section => {
      section.pages.sort((a, b) => {
        const aDoc = documents.find(d => d.id === a.id);
        const bDoc = documents.find(d => d.id === b.id);
        return (new Date(aDoc?.createdAt || 0)).getTime() - (new Date(bDoc?.createdAt || 0)).getTime();
      });
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
  const [isCreateSpaceDialogOpen, setIsCreateSpaceDialogOpen] = useState(false);
  const [hasShownCreateSpaceDialog, setHasShownCreateSpaceDialog] = useState(false);
  const [templateSearchQuery, setTemplateSearchQuery] = useState("");
  const [createSpaceName, setCreateSpaceName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'note' | 'section' | 'page'; id: string; name: string } | null>(null);
  const [isAddSectionDialogOpen, setIsAddSectionDialogOpen] = useState(false);
  const [addSectionName, setAddSectionName] = useState("");
  const [isAddPageDialogOpen, setIsAddPageDialogOpen] = useState(false);
  const [addPageName, setAddPageName] = useState("");
  const [addSectionNoteId, setAddSectionNoteId] = useState<string>("");
  const [addPageSectionId, setAddPageSectionId] = useState<string>("");



  // API hooks
  const { data: spaces } = useListSpaces();
  const spaceId = spaces?.[0]?.id;
  const spaceIds = spaces?.map(space => space.id) || [];
  const documentsQueries = useQueries({
    queries: spaceIds.map(sid => ({
      queryKey: getListDocumentsQueryKey(sid),
      queryFn: () => listDocuments(sid),
      enabled: !!sid,
    })),
  });
  const documents = useMemo(() => {
    return documentsQueries.flatMap(query => query.data || []);
  }, [JSON.stringify(documentsQueries.map(q => q.data))]);
  const addDocumentMutation = useAddDocument();
  const updateDocumentMutation = useUpdateDocument();
  const deleteDocumentMutation = useDeleteDocument();
  const addSpaceMutation = useAddSpace();
  const queryClient = useQueryClient();



  // ノートデータをAPIから変換
  const notes = useMemo(() => convertDocumentsToNotes(documents), [documents]);

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

  // ノートタブを開いたときにワークスペースが存在しない場合、ワークスペース作成ダイアログを表示
  useEffect(() => {
    if (spaces !== undefined && spaces.length === 0 && !hasShownCreateSpaceDialog) {
      const defaultName = currentUser?.username ? `${currentUser.username}のワークスペース` : "ワークスペース";
      setCreateSpaceName(defaultName);
      setIsCreateSpaceDialogOpen(true);
      setHasShownCreateSpaceDialog(true);
    }
  }, [spaces, hasShownCreateSpaceDialog, currentUser]);

  // 編集状態の管理
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingPageTitle, setEditingPageTitle] = useState<boolean>(false);
  const [editingPageTitleValue, setEditingPageTitleValue] = useState<string>("");
  const [editingNoteName, setEditingNoteName] = useState<string>("");
  const [editingSectionName, setEditingSectionName] = useState<string>("");
  const [editingPageName, setEditingPageName] = useState<string>("");
  const [editingPageContent, setEditingPageContent] = useState<string>("");

  const handleAddPage = (sectionId: string) => {
    setAddPageSectionId(sectionId);
    setAddPageName("");
    setIsAddPageDialogOpen(true);
  };

  const selectedNote = notes.find((n) => n.id === selectedNoteId) || null;
  const selectedSection = selectedNote?.sections.find((s) => s.id === selectedSectionId) || null;
  const selectedPage = selectedSection?.pages.find((p) => p.id === selectedPageId) || null;

  // ページが選択されたらタイトルを変更
  useEffect(() => {
    if (selectedPage) {
      document.title = selectedPage.title;
      setEditingPageContent(selectedPage.content);
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
    setAddSectionNoteId(noteId);
    setAddSectionName("");
    setIsAddSectionDialogOpen(true);
  };

  const handleAddNote = () => {
    if (!spaceId) {
      if (!isCreateSpaceDialogOpen) {
        // 初回スペース作成時のデフォルト値設定
        const defaultName = currentUser?.username ? `${currentUser.username}のワークスペース` : "ワークスペース";
        setCreateSpaceName(defaultName);
        setIsCreateSpaceDialogOpen(true);
      }
    } else {
      setIsTemplateModeDialogOpen(true);
    }
  };

  const handleSelectTemplateMode = (mode: "template" | "custom") => {
    if (mode === "custom") {
      handleCreateNote("custom");
    } else {
      setIsTemplateModeDialogOpen(false);
      setIsTemplateSelectDialogOpen(true);
    }
  };

  const handleCreateSpace = () => {
    if (!createSpaceName.trim()) return;
    addSpaceMutation.mutate({ data: { name: createSpaceName } }, {
      onSuccess: (newSpace) => {
        queryClient.invalidateQueries({ queryKey: getListSpacesQueryKey() });
        setIsCreateSpaceDialogOpen(false);
        setCreateSpaceName("");
        // スペース作成後にノート作成ダイアログを開く
        setIsTemplateModeDialogOpen(true);
      },
    });
  };

  const handleCreateNote = (templateId: string) => {
    if (!spaceId) {
      setIsCreateSpaceDialogOpen(true);
      return;
    }

    const createNoteInSpace = (currentSpaceId: string) => {
      let title = "新しいノート";
      let sections: { title: string; pages?: { title: string; content: string }[] }[] = [];

      if (templateId === "custom") {
        // カスタムの場合、空のノート
      } else {
        const template = noteTemplates.find(t => t.id === templateId);
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
      addDocumentMutation.mutate({ spaceId: currentSpaceId, data: noteDoc }, {
        onSuccess: (newNote) => {
          setSelectedNoteId(newNote.id);
          setSelectedSectionId(null);
          setSelectedPageId(null);
          setExpandedNoteIds((prev) => [...prev, newNote.id]);
          setIsTemplateModeDialogOpen(false);
          setIsTemplateSelectDialogOpen(false);

          // セクションを作成
          const sectionPromises = sections.map((section) => {
            return new Promise<void>((resolve) => {
              const sectionDoc: DocumentFields = {
                title: section.title,
                parentDocId: newNote.id,
              };
              addDocumentMutation.mutate({ spaceId: currentSpaceId, data: sectionDoc }, {
                onSuccess: (newSection) => {
                  // ページを作成
                  if (section.pages) {
                    const pagePromises = section.pages.map((page) => {
                      return new Promise<void>((resolvePage) => {
                        const pageDoc: DocumentFields = {
                          title: page.title,
                          parentDocId: newSection.id,
                          body: { content: page.content },
                        };
                        addDocumentMutation.mutate({ spaceId: currentSpaceId, data: pageDoc }, {
                          onSuccess: () => resolvePage(),
                        });
                      });
                    });
                    Promise.all(pagePromises).then(() => resolve());
                  } else {
                    resolve();
                  }
                },
              });
            });
          });

          Promise.all(sectionPromises).then(() => {
            // すべてのドキュメント作成完了後にクエリを無効化
            queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey(currentSpaceId) });
          });
        },
      });
    };

    createNoteInSpace(spaceId);
  };

  // 名前変更ハンドラー
  const handleNoteNameChange = async (noteId: string, newName: string) => {
    if (!spaceId) return;

    try {
      const updateData: DocumentUpdateFields = {
        title: newName,
      };
      await updateDocumentMutation.mutateAsync({ spaceId, documentId: noteId, data: updateData });
      queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey(spaceId) });
      setEditingNoteId(null);
    } catch (error) {
      // TODO: エラー表示
    }
  };

  const handleSectionNameChange = async (noteId: string, sectionId: string, newTitle: string) => {
    if (!spaceId) return;

    try {
      const updateData: DocumentUpdateFields = {
        title: newTitle,
      };
      await updateDocumentMutation.mutateAsync({ spaceId, documentId: sectionId, data: updateData });
      queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey(spaceId) });
      setEditingSectionId(null);
    } catch (error) {
      // TODO: エラー表示
    }
  };

  const handlePageNameChange = async (noteId: string, sectionId: string, pageId: string, newTitle: string) => {
    if (!spaceId) return;

    try {
      const updateData: DocumentUpdateFields = {
        title: newTitle,
      };
      await updateDocumentMutation.mutateAsync({ spaceId, documentId: pageId, data: updateData });
      queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey(spaceId) });
      setEditingPageId(null);
    } catch (error) {
      // TODO: エラー表示
    }
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

  // 削除ハンドラー
  const handleDeleteNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setDeleteTarget({ type: 'note', id: noteId, name: note.name });
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteSection = (noteId: string, sectionId: string) => {
    const note = notes.find(n => n.id === noteId);
    const section = note?.sections.find(s => s.id === sectionId);
    if (section) {
      setDeleteTarget({ type: 'section', id: sectionId, name: section.title });
      setDeleteDialogOpen(true);
    }
  };

  const handleDeletePage = (noteId: string, sectionId: string, pageId: string) => {
    const note = notes.find(n => n.id === noteId);
    const section = note?.sections.find(s => s.id === sectionId);
    const page = section?.pages.find(p => p.id === pageId);
    if (page) {
      setDeleteTarget({ type: 'page', id: pageId, name: page.title });
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !spaceId) return;

    try {
      await deleteDocumentMutation.mutateAsync({ spaceId, documentId: deleteTarget.id });
      queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey(spaceId) });

      // 選択状態のリセット
      if (deleteTarget.type === 'note' && selectedNoteId === deleteTarget.id) {
        setSelectedNoteId(notes.length > 1 ? notes.find(n => n.id !== deleteTarget.id)?.id || '' : '');
        setSelectedSectionId(null);
        setSelectedPageId(null);
      } else if (deleteTarget.type === 'section' && selectedSectionId === deleteTarget.id) {
        setSelectedSectionId(null);
        setSelectedPageId(null);
      } else if (deleteTarget.type === 'page' && selectedPageId === deleteTarget.id) {
        setSelectedPageId(null);
      }

      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      // TODO: エラー表示
    }
  };

  const handleCreateSection = () => {
    if (!addSectionName.trim() || !spaceId) {
      setIsAddSectionDialogOpen(false);
      return;
    }
    setIsAddSectionDialogOpen(false);
    const newDoc: DocumentFields = {
      title: addSectionName,
      parentDocId: addSectionNoteId,
    };
    addDocumentMutation.mutate({ spaceId, data: newDoc }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey(spaceId) });
        setAddSectionName("");
        setAddSectionNoteId("");
      },
      onError: () => {
        setIsAddSectionDialogOpen(true); // エラー時はダイアログを再開
      },
    });
  };

  const handleCreatePage = () => {
    if (!addPageName.trim() || !spaceId) {
      setIsAddPageDialogOpen(false);
      return;
    }
    setIsAddPageDialogOpen(false);
    const newDoc: DocumentFields = {
      title: addPageName,
      parentDocId: addPageSectionId,
      body: { content: "" },
    };
    addDocumentMutation.mutate({ spaceId, data: newDoc }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey(spaceId) });
        setAddPageName("");
        setAddPageSectionId("");
      },
      onError: () => {
        setIsAddPageDialogOpen(true); // エラー時はダイアログを再開
      },
    });
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
            onDeleteNote={handleDeleteNote}
            onDeleteSection={handleDeleteSection}
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
              onDeletePage={handleDeletePage}
            />
          ) : null
        }
        main={
          <MainContent
            selectedPage={selectedPage}
            editingPageTitle={editingPageTitle}
            editingPageTitleValue={editingPageTitleValue}
            onEditingPageTitleChange={setEditingPageTitle}
            onEditingPageTitleValueChange={setEditingPageTitleValue}
            onPageTitleClick={() => {
              if (selectedPage) {
                setEditingPageTitleValue(selectedPage.title);
                setEditingPageTitle(true);
              }
            }}
            onPageTitleChange={(newTitle) => {
              if (selectedPage && spaceId) {
                const updateData: DocumentUpdateFields = {
                  title: newTitle,
                };
                updateDocumentMutation.mutate({ spaceId, documentId: selectedPage.id, data: updateData }, {
                  onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey(spaceId) });
                  },
                });
              }
            }}
            editingPageContent={editingPageContent}
            onEditingPageContentChange={setEditingPageContent}
            onPageContentChange={(content) => {
              if (selectedPage && spaceId) {
                const updateData: DocumentUpdateFields = {
                  body: { content },
                };
                updateDocumentMutation.mutate({ spaceId, documentId: selectedPage.id, data: updateData }, {
                  onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey(spaceId) });
                    // 保存成功後にローカル状態を更新
                    setEditingPageContent(content);
                  },
                });
              }
            }}
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
            {noteTemplates
              .filter(template => template.name.includes(templateSearchQuery) || template.description.includes(templateSearchQuery))
              .map(template => (
                <ListItem key={template.id} disablePadding>
                  <ListItemButton onClick={() => handleCreateNote(template.id)}>
                    <ListItemIcon>
                      {getIcon(template.icon)}
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
      {/* ワークスペース作成ダイアログ */}
      <Dialog open={isCreateSpaceDialogOpen} onClose={() => setIsCreateSpaceDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>ワークスペースを作成</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="ワークスペース名"
            value={createSpaceName}
            onChange={(e) => setCreateSpaceName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateSpaceDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleCreateSpace} variant="contained">作成</Button>
        </DialogActions>
      </Dialog>
      {/* 削除確認ダイアログ */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>削除の確認</DialogTitle>
        <DialogContent>
          <Typography>
            {deleteTarget ? `${deleteTarget.name} を削除しますか？この操作は取り消すことができません。` : ''}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            削除
          </Button>
        </DialogActions>
      </Dialog>
      {/* セクション追加ダイアログ */}
      <Dialog open={isAddSectionDialogOpen} onClose={() => setIsAddSectionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>セクションを追加</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="セクション名"
            value={addSectionName}
            onChange={(e) => setAddSectionName(e.target.value)}
            sx={{ mt: 2 }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreateSection();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddSectionDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleCreateSection} variant="contained">追加</Button>
        </DialogActions>
      </Dialog>
      {/* ページ追加ダイアログ */}
      <Dialog open={isAddPageDialogOpen} onClose={() => setIsAddPageDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>ページを追加</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="ページ名"
            value={addPageName}
            onChange={(e) => setAddPageName(e.target.value)}
            sx={{ mt: 2 }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreatePage();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddPageDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleCreatePage} variant="contained">追加</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

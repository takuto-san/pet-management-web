"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/stores/store";
import { Header } from "@/components/organisms/Header";
import { Footer } from "@/components/organisms/Footer";
import { LayoutTemplate } from "@/components/templates/LayoutTemplate";
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
} from "@mui/material";
import { Menu as MenuIcon, ChevronRight as ChevronRightIcon, Note as NoteIcon, Description as DescriptionIcon, Create as CreateIcon } from "@mui/icons-material";

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
function NoteList({ notes, selectedNoteId, selectedSectionId, expandedNoteIds, onSelectNote, onSelectSection, onToggleExpand, onAddSection, onAddNote, isSidebarOpen }: {
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
                      <ListItemText primary={note.name} />
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
                              <ListItemText primary={section.title} sx={{ fontSize: "0.9rem" }} />
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
function PageList({ selectedSection, selectedPageId, onSelectPage, selectedNoteId }: {
  selectedSection: Section | null;
  selectedPageId: string | null;
  onSelectPage: (noteId: string, sectionId: string, pageId: string) => void;
  selectedNoteId: string;
}) {
  if (!selectedSection) return null;

  return (
    <Box sx={{ height: "100%", bgcolor: "background.paper", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 1 }}>
        <Button
          startIcon={<CreateIcon />}
          fullWidth
          variant="outlined"
          onClick={() => {
            // TODO: ページ追加ハンドラーを実装
          }}
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
                <ListItemText primary={page.title} sx={{ fontSize: "0.9rem" }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}

// メインコンテンツ
function MainContent({ selectedPage }: {
  selectedPage: Page | null;
}) {
  // ページ選択時：エディタ
  if (selectedPage) {
    return (
      <Box sx={{ height: "100%", bgcolor: "background.paper", display: "flex", flexDirection: "column" }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "text.primary" }}>
            {selectedPage.title}
          </Typography>
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

  // 仮のノートデータ
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      name: "Saddle Inventory",
      sections: [
        {
          id: "1-1",
          title: "サドルリスト",
          pages: [
            {
              id: "1-1-1",
              title: "在庫ページ",
              content: "サドルの在庫情報をここに記載します。",
            },
          ],
          isExpanded: true,
        },
        {
          id: "1-2",
          title: "メンテナンス記録",
          pages: [
            {
              id: "1-2-1",
              title: "履歴ページ",
              content: "サドルのメンテナンス履歴。",
            },
          ],
          isExpanded: false,
        },
      ],
      createdAt: new Date(),
    },
    {
      id: "2",
      name: "Other Notes",
      sections: [
        {
          id: "2-1",
          title: "一般ノート",
          pages: [
            {
              id: "2-1-1",
              title: "ノートページ",
              content: "他のノート内容。",
            },
          ],
          isExpanded: true,
        },
      ],
      createdAt: new Date(),
    },
  ]);

  const [selectedNoteId, setSelectedNoteId] = useState<string>("1");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [expandedNoteIds, setExpandedNoteIds] = useState<string[]>(["1"]);

  const selectedNote = notes.find((n) => n.id === selectedNoteId) || null;
  const selectedSection = selectedNote?.sections.find((s) => s.id === selectedSectionId) || null;
  const selectedPage = selectedSection?.pages.find((p) => p.id === selectedPageId) || null;

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

  const handleToggleSection = (noteId: string, sectionId: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              sections: note.sections.map((section) =>
                section.id === sectionId
                  ? { ...section, isExpanded: !section.isExpanded }
                  : section
              ),
            }
          : note
      )
    );
  };

  const handleAddSection = (noteId: string) => {
    const newSection: Section = {
      id: `new-${Date.now()}`,
      title: "新しいセクション",
      pages: [],
      isExpanded: false,
    };
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === noteId
          ? { ...note, sections: [...note.sections, newSection] }
          : note
      )
    );
  };

  const handleAddNote = () => {
    const newNote: Note = {
      id: `new-${Date.now()}`,
      name: "新しいノート",
      sections: [],
      createdAt: new Date(),
    };
    setNotes((prevNotes) => [...prevNotes, newNote]);
    setSelectedNoteId(newNote.id);
    setSelectedSectionId(null);
    setSelectedPageId(null);
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
          />
        }
        pageList={
          selectedSection ? (
            <PageList
              selectedSection={selectedSection}
              selectedPageId={selectedPageId}
              onSelectPage={handleSelectPage}
              selectedNoteId={selectedNoteId}
            />
          ) : null
        }
        main={
          <MainContent
            selectedPage={selectedPage}
          />
        }
      />
    </ThemeProvider>
  );
}

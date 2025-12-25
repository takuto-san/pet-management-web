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
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { Menu as MenuIcon, ChevronRight as ChevronRightIcon } from "@mui/icons-material";

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
function NoteList({ notes, selectedNoteId, selectedSectionId, selectedPageId, expandedNoteIds, onSelectNote, onSelectSection, onSelectPage, onToggleExpand, onToggleSection, isSidebarOpen }: {
  notes: Note[];
  selectedNoteId: string;
  selectedSectionId: string | null;
  selectedPageId: string | null;
  expandedNoteIds: string[];
  onSelectNote: (id: string) => void;
  onSelectSection: (noteId: string, sectionId: string) => void;
  onSelectPage: (noteId: string, sectionId: string, pageId: string) => void;
  onToggleExpand: (id: string) => void;
  onToggleSection: (noteId: string, sectionId: string) => void;
  isSidebarOpen: boolean;
}) {
  return (
    <Box sx={{ height: "100%", bgcolor: "background.paper", display: "flex", flexDirection: "column" }}>
      {isSidebarOpen && (
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
                      "&.Mui-selected": {
                        bgcolor: "grey.700",
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
                      const isSectionSelected = selectedSectionId === section.id && selectedPageId === null;
                      return (
                        <Box key={section.id}>
                          <ListItem disablePadding>
                            <ListItemButton
                              selected={isSectionSelected}
                              onClick={() => onSelectSection(note.id, section.id)}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                py: 0.5,
                                "&.Mui-selected": {
                                  bgcolor: "grey.700",
                                  "&:hover": {
                                    bgcolor: "grey.600",
                                  },
                                },
                              }}
                            >
                              <ChevronRightIcon
                                sx={{
                                  transform: section.isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                                  transition: "transform 0.2s",
                                  mr: 1,
                                  cursor: "pointer",
                                  fontSize: "1rem",
                                  color: "text.secondary",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleSection(note.id, section.id);
                                }}
                              />
                              <ListItemText primary={section.title} sx={{ fontSize: "0.9rem" }} />
                            </ListItemButton>
                          </ListItem>
                          {section.isExpanded && (
                            <List sx={{ pl: 4 }}>
                              {section.pages.map((page) => {
                                const isPageSelected = selectedPageId === page.id;
                                return (
                                  <ListItem key={page.id} disablePadding>
                                    <ListItemButton
                                      selected={isPageSelected}
                                      onClick={() => onSelectPage(note.id, section.id, page.id)}
                                      sx={{
                                        py: 0.25,
                                        "&.Mui-selected": {
                                          bgcolor: "grey.700",
                                          "&:hover": {
                                            bgcolor: "grey.600",
                                          },
                                        },
                                      }}
                                    >
                                      <ListItemText primary={page.title} sx={{ fontSize: "0.8rem" }} />
                                    </ListItemButton>
                                  </ListItem>
                                );
                              })}
                            </List>
                          )}
                        </Box>
                      );
                    })}
                  </List>
                )}
              </Box>
            );
          })}
        </List>
      )}
    </Box>
  );
}

// エディタ（メイン）
function NoteEditor({ selectedPage }: { selectedPage: Page | null }) {
  if (!selectedPage) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          bgcolor: "background.paper",
          color: "text.secondary",
        }}
      >
        ページを選択してください
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", bgcolor: "background.paper", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
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
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>("1-1");
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [expandedNoteIds, setExpandedNoteIds] = useState<string[]>(["1"]);

  const selectedNote = notes.find((n) => n.id === selectedNoteId) || null;
  const selectedSection = selectedNote?.sections.find((s) => s.id === selectedSectionId) || null;
  const selectedPage = selectedSection?.pages.find((p) => p.id === selectedPageId) || null;

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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

  return (
    <ThemeProvider theme={darkTheme}>
      <LayoutTemplate
        header={<Header />}
        hamburgerBar={<HamburgerBar onToggleSidebar={handleToggleSidebar} />}
        footer={<Footer />}
        sidebar={
          <NoteList
            notes={notes}
            selectedNoteId={selectedNoteId}
            selectedSectionId={selectedSectionId}
            selectedPageId={selectedPageId}
            expandedNoteIds={expandedNoteIds}
            onSelectNote={handleSelectNote}
            onSelectSection={handleSelectSection}
            onSelectPage={handleSelectPage}
            onToggleExpand={handleToggleExpand}
            onToggleSection={handleToggleSection}
            isSidebarOpen={isSidebarOpen}
          />
        }
        main={
          <NoteEditor selectedPage={selectedPage} />
        }
      />
    </ThemeProvider>
  );
}

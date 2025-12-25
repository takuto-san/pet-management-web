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

// ノートセクションの型定義
interface NoteSection {
  id: string;
  title: string;
  content: string;
  isExpanded: boolean;
}

// ノートの型定義
interface Note {
  id: string;
  name: string;
  sections: NoteSection[];
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
function NoteList({ notes, selectedNoteId, expandedNoteIds, onSelectNote, onToggleExpand, isSidebarOpen }: {
  notes: Note[];
  selectedNoteId: string;
  expandedNoteIds: string[];
  onSelectNote: (id: string) => void;
  onToggleExpand: (id: string) => void;
  isSidebarOpen: boolean;
}) {
  return (
    <Box sx={{ height: "100%", bgcolor: "background.paper", display: "flex", flexDirection: "column" }}>
      {isSidebarOpen && (
        <List sx={{ flexGrow: 1, overflow: "auto" }}>
          {notes.map((note) => {
            const isExpanded = expandedNoteIds.includes(note.id);
            const isSelected = selectedNoteId === note.id;
            return (
              <Box key={note.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => onSelectNote(note.id)}
                    sx={{ display: "flex", alignItems: "center" }}
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
                    {note.sections.map((section) => (
                      <ListItem key={section.id} disablePadding>
                        <ListItemButton
                          onClick={() => onSelectNote(note.id)}
                          sx={{ py: 0.5 }}
                        >
                          <ListItemText primary={section.title} sx={{ fontSize: "0.9rem" }} />
                        </ListItemButton>
                      </ListItem>
                    ))}
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
function NoteEditor({ note, onToggleSection }: { note: Note | null; onToggleSection: (noteId: string, sectionId: string) => void }) {
  const [title, setTitle] = useState(note?.name || "");

  if (!note) {
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
        ノートを選択してください
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", bgcolor: "background.paper", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
        <TextField
          fullWidth
          variant="standard"
          placeholder="ノートタイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {note.createdAt.toLocaleDateString("ja-JP")} {note.createdAt.toLocaleTimeString("ja-JP")}
        </Typography>
      </Box>
      <Box sx={{ flexGrow: 1, p: 3, overflow: "auto" }}>
        {note.sections.map((section) => (
          <Box key={section.id} sx={{ mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                p: 1,
                borderRadius: 1,
                "&:hover": { bgcolor: "action.hover" },
              }}
              onClick={() => onToggleSection(note.id, section.id)}
            >
              <Typography
                sx={{
                  transform: section.isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                  mr: 1,
                  fontSize: "1.2rem",
                }}
              >
                ▶
              </Typography>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                {section.title}
              </Typography>
            </Box>
            {section.isExpanded && (
              <Box sx={{ pl: 4, mt: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  variant="standard"
                  placeholder="ここにセクションの内容を入力してください..."
                  value={section.content}
                  onChange={(e) => {
                    // TODO: コンテンツ更新ハンドラーを実装
                  }}
                  InputProps={{
                    disableUnderline: true,
                  }}
                />
              </Box>
            )}
          </Box>
        ))}
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
          content: "サドルの在庫情報をここに記載します。",
          isExpanded: true,
        },
        {
          id: "1-2",
          title: "メンテナンス記録",
          content: "サドルのメンテナンス履歴。",
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
          content: "他のノート内容。",
          isExpanded: true,
        },
      ],
      createdAt: new Date(),
    },
  ]);

  const [selectedNoteId, setSelectedNoteId] = useState<string>("1");
  const [expandedNoteIds, setExpandedNoteIds] = useState<string[]>([]);

  const selectedNote = notes.find((n) => n.id === selectedNoteId) || null;

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
            expandedNoteIds={expandedNoteIds}
            onSelectNote={setSelectedNoteId}
            onToggleExpand={handleToggleExpand}
            isSidebarOpen={isSidebarOpen}
          />
        }
        main={
          <NoteEditor note={selectedNote} onToggleSection={handleToggleSection} />
        }
      />
    </ThemeProvider>
  );
}

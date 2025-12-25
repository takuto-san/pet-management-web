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
import { Menu as MenuIcon } from "@mui/icons-material";

// ノート（セクション）の型定義
interface Note {
  id: string;
  name: string;
  content: string;
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
function NoteList({ notes, selectedNoteId, onSelectNote, isSidebarOpen }: {
  notes: Note[];
  selectedNoteId: string;
  onSelectNote: (id: string) => void;
  isSidebarOpen: boolean;
}) {
  return (
    <Box sx={{ height: "100%", bgcolor: "background.paper", display: "flex", flexDirection: "column" }}>
      {isSidebarOpen && (
        <List sx={{ flexGrow: 1, overflow: "auto" }}>
          {notes.map((note) => (
            <ListItem key={note.id} disablePadding>
              <ListItemButton
                selected={selectedNoteId === note.id}
                onClick={() => onSelectNote(note.id)}
              >
                <ListItemText primary={note.name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}

// エディタ（メイン）
function NoteEditor({ note }: { note: Note | null }) {
  const [title, setTitle] = useState(note?.name || "");
  const [content, setContent] = useState(note?.content || "");

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
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <TextField
          fullWidth
          multiline
          variant="standard"
          placeholder="ここにノートを入力してください..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          InputProps={{
            disableUnderline: true,
          }}
          sx={{
            height: "100%",
            "& .MuiInputBase-root": {
              height: "100%",
            },
            "& .MuiInputBase-input": {
              height: "100% !important",
              overflow: "auto",
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
  const [notes] = useState<Note[]>([
    {
      id: "1",
      name: "Saddle Inventory",
      content: "ここにノート内容が入ります。",
      createdAt: new Date(),
    },
    {
      id: "2",
      name: "Other Notes",
      content: "別のノートの内容。",
      createdAt: new Date(),
    },
  ]);

  const [selectedNoteId, setSelectedNoteId] = useState<string>("1");

  const selectedNote = notes.find((n) => n.id === selectedNoteId) || null;

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
            onSelectNote={setSelectedNoteId}
            isSidebarOpen={isSidebarOpen}
          />
        }
        main={
          <NoteEditor note={selectedNote} />
        }
      />
    </ThemeProvider>
  );
}

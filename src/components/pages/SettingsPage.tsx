"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { Box } from "@mui/material";
import { Header } from "@/components/organisms/Header";
import { Footer } from "@/components/organisms/Footer";
import { LayoutTemplate } from "@/components/templates/LayoutTemplate";
import { Tabs, Tab } from "@mui/material";
import type { RootState } from "@/lib/stores/store";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`setting-tabpanel-${index}`}
      aria-labelledby={`setting-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export function SettingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(pathname.endsWith('/profile') ? 1 : 0);

  const { currentUser, isLoadingUser } = useSelector((state: RootState) => ({
    currentUser: state.user.currentUser,
    isLoadingUser: state.user.isLoadingUser,
  }));

  useEffect(() => {
    if (!isLoadingUser && !currentUser) {
      router.push('/auth/signin');
    }
  }, [currentUser, isLoadingUser, router]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    if (newValue === 0) {
      router.push(pathname.replace('/profile', ''));
    } else {
      router.push(`${pathname}/profile`);
    }
  };

  if (isLoadingUser || !currentUser) {
    return null;
  }

  return (
    <LayoutTemplate
      header={<Header />}
      footer={<Footer />}
      main={
        <div className="p-4">
          <h1 className="text-xl font-bold">設定</h1>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="setting tabs">
              <Tab label="アカウント" id="setting-tab-0" aria-controls="setting-tabpanel-0" />
              <Tab label="プロフィール" id="setting-tab-1" aria-controls="setting-tabpanel-1" />
            </Tabs>
          </Box>
          <TabPanel value={value} index={0}>
            <p className="text-gray-600 mt-2">ここに設定を表示します。</p>
          </TabPanel>
          <TabPanel value={value} index={1}>
            <p className="text-gray-600 mt-2">ここにプロフィール設定を表示します。</p>
          </TabPanel>
        </div>
      }
    />
  );
}

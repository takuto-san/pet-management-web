"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Header } from "@/components/organisms/Header";
import { Footer } from "@/components/organisms/Footer";
import { LayoutTemplate } from "@/components/templates/LayoutTemplate";
import { Tabs, Tab, Box } from "@mui/material";

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

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    if (newValue === 0) {
      router.push(pathname.replace('/profile', ''));
    } else {
      router.push(`${pathname}/profile`);
    }
  };

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

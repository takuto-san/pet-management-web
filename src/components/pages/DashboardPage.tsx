"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { CircularProgress } from "@mui/material";
import type { RootState } from "@/lib/stores/store";
import type { Task, MonthlyEvent } from "@/types/dashboard";
import { Header } from "@/components/organisms/Header";
import { Footer } from "@/components/organisms/Footer";
import { LayoutTemplate } from "@/components/templates/LayoutTemplate";
import { PetProfileCard } from "@/components/organisms/PetProfileCard";
import { TodayScheduleCard } from "@/components/organisms/TodayScheduleCard";
import { MonthlyScheduleCard } from "@/components/organisms/MonthlyScheduleCard";
import { WeightTrendsCard } from "@/components/organisms/WeightTrendsCard";
import { ClinicVisitsCard } from "@/components/organisms/ClinicVisitsCard";
import { VaccinationsCard } from "@/components/organisms/VaccinationsCard";
import { useListPetsByUser } from "@/api/generated/pet/pet";
import { useListVisits } from "@/api/generated/visit/visit";

// ユーティリティ関数：visitTypeの日本語化
const getVisitTypeDisplayName = (visitType: string | undefined): string => {
  switch (visitType) {
    case "general":
      return "定期検診";
    case "checkup":
      return "通院";
    case "vaccine":
      return "ワクチン";
    case "heartworm":
      return "フィラリア";
    case "flea_tick":
      return "ノミダニ";
    default:
      return visitType || "";
  }
};

// ユーティリティ関数：理由の日本語化と整形
const getReasonDisplayName = (reason: string | undefined): string => {
  if (!reason) return "";

  let display = reason;

  // カテゴリの日本語化
  display = display.replace(/^hospital/, "通院");
  display = display.replace(/^supplies/, "備品");
  display = display.replace(/^general/, "定期検診");

  // undefined の除去（値が存在しない場合の区切り文字も除去）
  display = display.replace(/ - undefined/g, "");
  display = display.replace(/^undefined/, "");
  display = display.replace(/undefined$/, "");
  display = display.replace(/undefined - /g, "");

  // 空の区切り文字の除去
  display = display.replace(/^ - /, "");
  display = display.replace(/ - $/, "");

  return display.trim();
};

// ユーティリティ関数：タイトルの整形
const formatTitle = (reason: string | undefined): string => {
  if (!reason) return "診察";

  const displayReason = getReasonDisplayName(reason);

  // 日本語化された理由をタイトルとして使用
  if (displayReason) {
    return displayReason;
  }

  return "定期検診";
};

export function DashboardPage() {
  const router = useRouter();
  const { currentUser, isLoadingUser } = useSelector((state: RootState) => ({
    currentUser: state.user.currentUser,
    isLoadingUser: state.user.isLoadingUser,
  }));



  const { data: petsData, isLoading: isPetsLoading } = useListPetsByUser(currentUser?.id || "", undefined, {
    query: {
      enabled: !!currentUser && !isLoadingUser,
    },
  });

  const pets = petsData?.content || [];
  const [selectedPetId, setSelectedPetId] = useState<string | null>(pets.length > 0 ? pets[0].id : null);

  useEffect(() => {
    if (pets.length > 0 && !selectedPetId) {
      setSelectedPetId(pets[0].id);
    }
  }, [pets, selectedPetId]);

  const selectedPet = pets.find(pet => pet.id === selectedPetId);
  const selectedPetIndex = pets.findIndex(pet => pet.id === selectedPetId);

  const goToPreviousPet = () => {
    if (selectedPetIndex > 0) {
      setSelectedPetId(pets[selectedPetIndex - 1].id);
    }
  };

  const goToNextPet = () => {
    if (selectedPetIndex < pets.length - 1) {
      setSelectedPetId(pets[selectedPetIndex + 1].id);
    }
  };

  // 選択されたペットのvisitsを取得
  const { data: visitsData } = useListVisits({ petId: selectedPet?.id }, {
    query: {
      enabled: !!selectedPet,
    },
  });

  const visits = useMemo(() => visitsData?.content || [], [visitsData]);

  const [todayTasks, setTodayTasks] = useState<Task[]>([]);

  useEffect(() => {
    const today = new Date();
    const targetDateStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    const todayVisits = visits.filter(visit =>
      visit.visitedOn && visit.visitedOn.startsWith(targetDateStr)
    );

    const tasks = todayVisits.map(visit => ({
      id: visit.id,
      name: formatTitle(visit.reason),
      time: visit.visitedOn ? new Date(visit.visitedOn).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '08:00',
      completed: false, // 仮に未完了とする
    }));

    setTodayTasks(tasks);
  }, [visits]);

  const monthlyEvents: MonthlyEvent[] = useMemo(() => {
    const events: MonthlyEvent[] = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    visits.forEach(visit => {
      if (visit.visitedOn) {
        const visitDate = new Date(visit.visitedOn);
        if (visitDate.getMonth() === currentMonth && visitDate.getFullYear() === currentYear) {
          events.push({
            date: visitDate.getDate(),
            title: formatTitle(visit.reason),
          });
        }
      }
      // nextDueOn がある場合も追加
      if (visit.nextDueOn) {
        const nextDate = new Date(visit.nextDueOn);
        if (nextDate.getMonth() === currentMonth && nextDate.getFullYear() === currentYear) {
          events.push({
            date: nextDate.getDate(),
            title: `次回: ${formatTitle(visit.reason)}`,
          });
        }
      }
    });

    return events;
  }, [visits]);

  const toggleTask = (id: string) => {
    setTodayTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  if (isLoadingUser || (currentUser && isPetsLoading)) {
    return (
      <LayoutTemplate
        header={<Header />}
        footer={<Footer />}
        main={
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }
      />
    );
  }

  if (!currentUser && !isLoadingUser) {
    return (
      <LayoutTemplate
        header={<Header />}
        footer={<Footer />}
        main={
          <div className="flex items-center justify-center h-full">
            <CircularProgress sx={{ color: 'white' }} />
          </div>
        }
      />
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <LayoutTemplate
      header={<Header />}
      footer={<Footer />}
      main={
        <div className="min-h-screen bg-[#2D2631] text-foreground flex items-center justify-center p-4">
          <div className="w-full max-w-6xl space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl font-bold">
                {currentUser.username} さんのダッシュボード
              </h1>
            </div>

          {pets.length > 1 && selectedPet && (
            <div className="flex items-center justify-center space-x-4 mb-6">
              <button
                onClick={goToPreviousPet}
                disabled={selectedPetIndex === 0}
                className="p-2 rounded-full bg-primary hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-xl text-foreground">◀</span>
              </button>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl">🐾</span>
                </div>
                <span className="text-sm font-medium text-foreground">{selectedPet.name}</span>
              </div>
              <button
                onClick={goToNextPet}
                disabled={selectedPetIndex === pets.length - 1}
                className="p-2 rounded-full bg-primary hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-xl text-foreground">▶</span>
              </button>
            </div>
          )}

          {selectedPet ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PetProfileCard pet={selectedPet} />
                <div className="md:col-span-1 h-32">
                  <TodayScheduleCard tasks={todayTasks} onToggleTask={toggleTask} />
                </div>
                <MonthlyScheduleCard events={monthlyEvents} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <WeightTrendsCard visits={visits} />
                <ClinicVisitsCard visits={visits} />
                <VaccinationsCard visits={visits} />
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">まだペットが登録されていません。</p>
            </div>
          )}
          </div>
        </div>
      }
    />
  );
}

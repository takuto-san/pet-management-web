"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/stores/store";
import { Header } from "@/components/organisms/Header";
import { Footer } from "@/components/organisms/Footer";
import { LayoutTemplate } from "@/components/templates/LayoutTemplate";
import { PetProfileCard } from "@/components/organisms/PetProfileCard";
import { TodayScheduleCard } from "@/components/organisms/TodayScheduleCard";
import { MonthlyScheduleCard } from "@/components/organisms/MonthlyScheduleCard";
import { WeightTrendsCard } from "@/components/organisms/WeightTrendsCard";
import { ClinicVisitsCard } from "@/components/organisms/ClinicVisitsCard";
import { VaccinationsCard } from "@/components/organisms/VaccinationsCard";
import { useListPets } from "@/api/generated/pet/pet";
import { useListVisits } from "@/api/generated/visit/visit";
import { useListUserItems } from "@/api/generated/user-item/user-item";
import { useListItems } from "@/api/generated/item/item";

interface Task {
  id: string;
  name: string;
  time: string;
  completed: boolean;
}

interface MonthlyEvent {
  date: number;
  title: string;
}

export function DashboardPage() {
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

  const { data: petsData, isLoading: isPetsLoading } = useListPets(undefined, {
    query: {
      enabled: !!currentUser && !isLoadingUser,
    },
  });

  const allPets = petsData?.content || [];
  const pets = currentUser ? allPets.filter(pet => pet.userId === currentUser.id) : [];
  const [selectedPetId, setSelectedPetId] = useState<string | null>(pets.length > 0 ? pets[0].id : null);

  useEffect(() => {
    if (pets.length > 0 && !selectedPetId) {
      setSelectedPetId(pets[0].id);
    }
  }, [pets, selectedPetId]);

  const selectedPet = pets.find(pet => pet.id === selectedPetId);

  const { data: visitsData } = useListVisits(
    selectedPet ? { petId: selectedPet.id } : undefined,
    {
      query: {
        enabled: !!selectedPet,
      },
    }
  );

  const { data: userItemsData } = useListUserItems(
    currentUser ? { userId: currentUser.id } : undefined,
    {
      query: {
        enabled: !!currentUser,
      },
    }
  );

  const { data: itemsData } = useListItems();

  const visits = visitsData?.content || [];
  const userItems = userItemsData?.content || [];
  const items = itemsData?.content || [];

  const dummyTasks: Task[] = useMemo(() => [
    { id: "1", name: "朝食を与える", time: "08:00", completed: false },
    { id: "2", name: "投薬をする", time: "09:00", completed: true },
    { id: "3", name: "散歩に行く", time: "10:00", completed: false },
  ], []);

  const monthlyEvents: MonthlyEvent[] = useMemo(() => {
    const events: MonthlyEvent[] = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    visits.forEach(visit => {
      if (visit.nextDueOn) {
        const nextDate = new Date(visit.nextDueOn);
        if (nextDate.getMonth() === currentMonth && nextDate.getFullYear() === currentYear) {
          events.push({
            date: nextDate.getDate(),
            title: "次回診察予定",
          });
        }
      }
    });

    return events;
  }, [visits]);

  const toggleTask = (id: string) => {
  };

  if (isLoadingUser || (currentUser && isPetsLoading)) {
    return (
      <LayoutTemplate
        header={<Header />}
        footer={<Footer />}
        main={
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">{currentUser.username} さんのダッシュボード</h1>
          </div>

          {pets.length > 0 && (
            <div className="overflow-x-auto mb-6">
              <div className="flex space-x-4 pb-2">
                {pets.map((pet) => (
                  <button
                    key={pet.id}
                    onClick={() => setSelectedPetId(pet.id)}
                    className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${
                      selectedPetId === pet.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                      <span className="text-2xl">🐾</span>
                    </div>
                    <span className="text-sm font-medium">{pet.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedPet ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PetProfileCard pet={selectedPet} />
                <TodayScheduleCard tasks={dummyTasks} onToggleTask={toggleTask} />
                <MonthlyScheduleCard events={monthlyEvents} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <WeightTrendsCard visits={visits} />
                <ClinicVisitsCard visits={visits} />
                <VaccinationsCard userItems={userItems} items={items} />
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">まだペットが登録されていません。</p>
            </div>
          )}
        </div>
      }
    />
  );
}

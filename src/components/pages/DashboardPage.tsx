"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/stores/store";
import { Header } from "@/components/organisms/Header";
import { Footer } from "@/components/organisms/Footer";
import { LayoutTemplate } from "@/components/templates/LayoutTemplate";
import { useListPets } from "@/api/generated/pet/pet";
import AddIcon from "@mui/icons-material/Add";

interface Task {
  id: string;
  name: string;
  completed: boolean;
  petName: string;
  petType: string;
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

  const { data: petsData, isLoading, error } = useListPets(undefined, {
    query: {
      enabled: !!currentUser && !isLoadingUser,
    },
  });

  const allPets = petsData?.content || [];
  const pets = currentUser ? allPets.filter(pet => pet.userId === currentUser.id) : [];
  const [selectedPetId, setSelectedPetId] = useState<string | null>(pets.length > 0 ? pets[0].id : null);

  const selectedPet = pets.find(pet => pet.id === selectedPetId);

  const dummyTasks: Task[] = selectedPet ? [
    { id: "1", name: "朝食を与える", completed: false, petName: selectedPet.name, petType: selectedPet.type },
    { id: "2", name: "投薬をする", completed: true, petName: selectedPet.name, petType: selectedPet.type },
    { id: "3", name: "散歩に行く", completed: false, petName: selectedPet.name, petType: selectedPet.type },
    { id: "4", name: "水を替える", completed: true, petName: selectedPet.name, petType: selectedPet.type },
  ] : [];

  const toggleTask = (id: string) => {
    // TODO: 状態管理で完了状態を更新
  };

  if (isLoadingUser || (currentUser && isLoading)) {
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
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">{currentUser.username} さんのタスク</h1>
            <button className="fixed bottom-20 right-4 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors z-40">
              <AddIcon className="w-6 h-6" />
            </button>
          </div>

          {pets.length > 0 && (
            <div className="overflow-x-auto">
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

          <div className="space-y-3">
            {dummyTasks.map((task) => (
              <div key={task.id} className="bg-white rounded-lg shadow p-4 border">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{task.name}</p>
                    <p className="text-sm text-gray-500">{task.petName} ({task.petType})</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pets.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">まだペットが登録されていません。</p>
            </div>
          )}
        </div>
      }
    />
  );
}

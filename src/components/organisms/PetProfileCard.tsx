import type { Pet } from "@/types/api";
import { DashboardCard } from "@/components/molecules/DashboardCard";

interface PetProfileCardProps {
  pet: Pet;
}

export function PetProfileCard({ pet }: PetProfileCardProps) {
  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return "不明";
    const birth = new Date(birthDate);
    const today = new Date();
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    
    if (years === 0) {
      return `${months}ヶ月`;
    } else if (months < 0) {
      return `${years - 1}歳${12 + months}ヶ月`;
    } else {
      return `${years}歳${months}ヶ月`;
    }
  };

  return (
    <DashboardCard title="ペット情報">
      <div className="flex items-center space-x-4">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-4xl">🐾</span>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold">{pet.name}</h3>
          <div className="text-sm text-gray-600 space-y-1 mt-2">
            <p>種類: {pet.type}</p>
            <p>ID: {pet.id}</p>
            <p>性別: {pet.sex || "不明"}</p>
            <p>年齢: {calculateAge(pet.birthDate)}</p>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}

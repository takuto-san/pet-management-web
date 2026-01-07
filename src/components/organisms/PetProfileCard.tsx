import type { Pet, Visit } from "@/types/api";
import { DashboardCard } from "@/components/molecules/DashboardCard";

interface PetProfileCardProps {
  pet: Pet;
  visits?: Visit[];
}

export function PetProfileCard({ pet, visits }: PetProfileCardProps) {
  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return "不明";
    const birth = new Date(birthDate);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    if (years < 0) {
      return "不明";
    }

    if (years === 0) {
      return `${months}ヶ月`;
    } else {
      return `${years}歳${months}ヶ月`;
    }
  };

  const latestWeight = visits
    ? visits
        .filter(visit => visit.weight !== undefined)
        .sort((a, b) => new Date(b.visitedOn).getTime() - new Date(a.visitedOn).getTime())[0]?.weight
    : undefined;

  return (
    <DashboardCard title="ペット情報">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
          <span className="text-4xl text-red-800">🐾</span>
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-foreground">{pet.name}</h3>
          <p className="text-sm text-muted-foreground">種類: {pet.type}</p>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          <p>年齢: {calculateAge(pet.birthDate)}</p>
          <p>体重: {latestWeight ? `${latestWeight} kg` : "不明"}</p>
        </div>
      </div>
    </DashboardCard>
  );
}

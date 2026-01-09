import { Box, IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import type { Pet, Visit } from "@/types/api";
import { DashboardCard } from "@/components/molecules/DashboardCard";

interface PetProfileCardProps {
  pet: Pet;
  visits?: Visit[];
  onEdit?: (pet: Pet) => void;
}

export function PetProfileCard({ pet, visits, onEdit }: PetProfileCardProps) {
  const getPetTypeDisplayName = (type: string) => {
    switch (type) {
      case 'dog':
        return '犬';
      case 'cat':
        return '猫';
      case 'rabbit':
        return 'ウサギ';
      case 'hamster':
        return 'ハムスター';
      case 'bird':
        return '鳥';
      case 'turtle':
        return 'カメ';
      case 'fish':
        return '魚';
      default:
        return type;
    }
  };

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
    <Box sx={{ position: 'relative' }}>
      <IconButton
        sx={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          color: 'white',
          zIndex: 1,
          fontSize: '1.5rem',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
        onClick={() => onEdit && onEdit(pet)}
      >
        <EditIcon fontSize="large" />
      </IconButton>
      <DashboardCard title="ペット情報">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
            {pet.icon ? (
              <img src={pet.icon} alt={pet.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-4xl text-red-800">🐾</span>
            )}
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-foreground">{pet.name}</h3>
            <p className="text-sm text-muted-foreground mt-2">種類: {getPetTypeDisplayName(pet.type)}</p>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            <p>年齢: {calculateAge(pet.birthDate)}</p>
            <p>体重: {latestWeight ? `${latestWeight} kg` : "不明"}</p>
          </div>
        </div>
      </DashboardCard>
    </Box>
  );
}

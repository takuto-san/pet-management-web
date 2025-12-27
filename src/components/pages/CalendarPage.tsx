"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/stores/store";
import { Header } from "@/components/organisms/Header";
import { Footer } from "@/components/organisms/Footer";
import { LayoutTemplate } from "@/components/templates/LayoutTemplate";
import { useState } from "react";
import { useListPets } from "@/api/generated/pet/pet";
import { useListVisits } from "@/api/generated/visit/visit";
import { useListVisitPrescriptions } from "@/api/generated/visit-prescription/visit-prescription";
import { Info, Pets, Check, CalendarToday, Add, Close, Edit } from '@mui/icons-material';
import { Fab, Drawer, Box, TextField, Select, MenuItem, FormControl, InputLabel, Button, Typography, IconButton, Chip, Grid, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useAddVisit, useUpdateVisit } from "@/api/generated/visit/visit";
import { useAddVisitPrescription } from "@/api/generated/visit-prescription/visit-prescription";
import { useAddItem } from "@/api/generated/item/item";
import { useAddPrescription } from "@/api/generated/prescription/prescription";
import { useListClinics } from "@/api/generated/clinic/clinic";
import { useQueryClient } from "@tanstack/react-query";
import { VisitFields, VisitType, ItemCategory, PrescriptionFields, PrescriptionCategory, VisitPrescriptionFields } from "@/types/api";

interface RecordForm {
  petId?: string;
  category?: 'hospital' | 'supplies';
  subcategoryType?: string;
  date?: string;
  [key: string]: any;
}

export function CalendarPage() {
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    return startOfWeek;
  });
  const [viewMode, setViewMode] = useState<'monthly' | 'weekly'>('monthly');
  const [cardCompletions, setCardCompletions] = useState<Record<string, boolean>>({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<'category' | 'subcategory' | 'form'>('category');
  const [selectedCategory, setSelectedCategory] = useState<'hospital' | 'supplies' | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<VisitType | ItemCategory | null>(null);
  const [selectedSubcategoryType, setSelectedSubcategoryType] = useState<string | null>(null);
  const [recordForm, setRecordForm] = useState<RecordForm>({});
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 右サイドバー用の状態
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [isSidebarEditing, setIsSidebarEditing] = useState(false);

  // 編集用の状態
  const [isEditing, setIsEditing] = useState(false);
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null);

  // API: ユーザーのペットを取得
  const { data: petsData } = useListPets();

  // API: 全visitsを取得（実際にはユーザーのものにフィルタ）
  const { data: visitsData } = useListVisits();

  // API: クリニックを取得
  const { data: clinicsData } = useListClinics();

  // clinicがロードされたらデフォルト選択
  useEffect(() => {
    if (clinicsData?.content && clinicsData.content.length > 0 && recordForm.category === 'hospital' && recordForm.subcategoryType === 'visit' && !recordForm.clinicId) {
      setRecordForm(prev => ({ ...prev, clinicId: clinicsData.content[0].id }));
    }
  }, [clinicsData, recordForm.category, recordForm.subcategoryType, recordForm.clinicId]);

  const queryClient = useQueryClient();
  const addVisitMutation = useAddVisit();
  const updateVisitMutation = useUpdateVisit();
  const addVisitPrescriptionMutation = useAddVisitPrescription();
  const addItemMutation = useAddItem();
  const addPrescriptionMutation = useAddPrescription();

  // カードデータを日付ごとにグループ化（実際のvisitsデータから生成）
  const getCardsForDate = (date: Date) => {
    if (!visitsData?.content) return [];

    // 選択された日付のvisitsをフィルタ
    const targetDateStr = date.toISOString().split('T')[0];
    const dayVisits = visitsData.content.filter(visit =>
      visit.visitedOn && visit.visitedOn.startsWith(targetDateStr)
    );

    // visitsをカード形式に変換
    return dayVisits.map(visit => ({
      id: visit.id,
      time: '08:00', // 仮の時間（実際にはvisit.visitedOnから取得可能）
      medicine: visit.reason || '診察',
      dosage: visit.note || '',
      petName: petsData?.content?.find(pet => pet.id === visit.petId)?.name || '不明',
      completed: cardCompletions[visit.id] ?? false,
    }));
  };

  // 月間表示の日付計算
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDateMonth = new Date(firstDayOfMonth);
  startDateMonth.setDate(startDateMonth.getDate() - firstDayOfMonth.getDay());
  const endDateMonth = new Date(lastDayOfMonth);
  endDateMonth.setDate(endDateMonth.getDate() + (6 - lastDayOfMonth.getDay()));

  // 週間表示の日付計算
  const startDateWeek = new Date(currentWeek);
  const endDateWeek = new Date(currentWeek);
  endDateWeek.setDate(endDateWeek.getDate() + 6);

  // 現在の表示モードに基づく日付配列
  const dates = [];
  const startDate = viewMode === 'monthly' ? startDateMonth : startDateWeek;
  const endDate = viewMode === 'monthly' ? endDateMonth : endDateWeek;
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // 月を変更
  const changeMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  // 週を変更
  const changeWeek = (direction: number) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + direction * 7);
    setCurrentWeek(newWeek);
  };

  // 今日に戻る
  const goToToday = () => {
    const today = new Date();
    if (viewMode === 'monthly') {
      setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    } else {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      setCurrentWeek(startOfWeek);
    }
    setSelectedDate(today);
  };

  // 選択された日付が現在の月かどうか
  const isSelectedDate = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  // 当月または当週かどうか
  const isCurrentPeriod = (date: Date) => {
    if (viewMode === 'monthly') {
      return date.getMonth() === currentMonth.getMonth();
    } else {
      return date >= startDateWeek && date <= endDateWeek;
    }
  };

  // 曜日見出し
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  // カード完了状態をトグル
  const toggleCardCompletion = (cardId: string) => {
    setCardCompletions(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  // モックデータ：予定の状態（実際にはAPIから取得）
  const getStatusForDate = (date: Date) => {
    // 仮のロジック：日付によってステータスを返す
    const day = date.getDate();
    if (day % 3 === 0) return 'completed';
    if (day % 3 === 1) return 'pending';
    return 'none';
  };

  const status = getStatusForDate(selectedDate);

  // selectedDateが変わったらrecordForm.dateを更新
  useEffect(() => {
    if (isDrawerOpen && recordForm.date) {
      const dateStr = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      setRecordForm(prev => ({ ...prev, date: dateStr }));
    }
  }, [selectedDate, isDrawerOpen]);

  // FABクリックでドロワーを開く
  const handleFabClick = () => {
    setIsDrawerOpen(true);
    const dateStr = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    const nextDateStr = new Date(selectedDate.getTime() + 30 * 24 * 60 * 60 * 1000 - selectedDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    setRecordForm({ petId: '', category: 'hospital', subcategoryType: 'medication', date: dateStr, nextDate: nextDateStr, nextVaccinationDate: nextDateStr });
  };

  // ドロワーを閉じる
  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setCurrentStep('category');
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedSubcategoryType(null);
    setRecordForm({});
    setErrorMessage('');
    setIsEditing(false);
    setEditingVisitId(null);
  };

  // 大カテゴリー選択
  const handleCategorySelect = (category: 'hospital' | 'supplies') => {
    setSelectedCategory(category);
    setCurrentStep('subcategory');
  };

  // 小カテゴリー選択
  const handleSubcategorySelect = (subcategory: VisitType | ItemCategory, type: string) => {
    setSelectedSubcategory(subcategory);
    setSelectedSubcategoryType(type);
    setCurrentStep('form');
    setRecordForm({ petId: '', date: selectedDate.toISOString().split('T')[0] });
  };

  // ステップ戻る
  const handleBack = () => {
    if (currentStep === 'subcategory') {
      setCurrentStep('category');
      setSelectedCategory(null);
    } else if (currentStep === 'form') {
      setCurrentStep('subcategory');
      setSelectedSubcategory(null);
      setSelectedSubcategoryType(null);
      setRecordForm({});
    }
  };

  // フォーム送信
  const handleSubmitRecord = async () => {
    setErrorMessage('');

    if (!recordForm.petId) {
      setErrorMessage('ペットを選択してください');
      return;
    }

    const selectedCategory = recordForm.category;
    const selectedSubcategoryType = recordForm.subcategoryType;

    if (selectedCategory === 'hospital') {
      if (!recordForm.clinicId) {
        setErrorMessage('病院を選択してください');
        return;
      }
      if (selectedSubcategoryType === 'medication' && !recordForm.medicineName) {
        setErrorMessage('薬名を入力してください');
        return;
      }
      if (selectedSubcategoryType === 'vaccine' && (!recordForm.vaccineType)) {
        setErrorMessage('ワクチン種類を入力してください');
        return;
      }
      if (selectedSubcategoryType === 'visit' && (!recordForm.diagnosis || !recordForm.weight || !recordForm.condition)) {
        setErrorMessage('必須項目を入力してください');
        return;
      }
      // prescriptionが入力された場合のバリデーション
      if (selectedSubcategoryType === 'visit' && recordForm.prescriptionName && (!recordForm.prescriptionCategory || !recordForm.prescriptionQuantity || !recordForm.prescriptionUnit)) {
        setErrorMessage('処方薬の必須項目を入力してください');
        return;
      }
    } else if (selectedCategory === 'supplies') {
      if (!recordForm.itemName || !recordForm.quantity) {
        setErrorMessage('必須項目を入力してください');
        return;
      }
    }

    try {
      if (selectedCategory === 'hospital') {
        // VisitFieldsを作成
        let visitType: VisitType = VisitType.general;
        let reason = '';
        let note = '';

        if (selectedSubcategoryType === 'medication') {
          reason = `${recordForm.category} - ${recordForm.medicineName}`;
          note = recordForm.nextDate ? `次回: ${recordForm.nextDate}` : '';
        } else if (selectedSubcategoryType === 'vaccine') {
          visitType = VisitType.checkup;
          reason = `ワクチン接種 - ${recordForm.vaccineType}`;
          note = `Lot No: ${recordForm.lotNo || ''}, 次回: ${recordForm.nextVaccinationDate || ''}`;
        } else if (selectedSubcategoryType === 'visit') {
          visitType = VisitType.checkup;
          reason = recordForm.diagnosis;
          note = `病院: ${recordForm.clinicName}, 体重: ${recordForm.weight}kg, 体調: ${recordForm.condition}, 指示: ${recordForm.doctorNote || ''}`;
        }

        // clinicId から clinicName を取得
        let clinicName = '';
        if (recordForm.clinicId && clinicsData?.content) {
          const clinic = clinicsData.content.find(c => c.id === recordForm.clinicId);
          clinicName = clinic?.name || '';
        }

        // note を再構築
        if (recordForm.subcategoryType === 'medication') {
          note = recordForm.nextDate ? `次回: ${recordForm.nextDate}` : '';
        } else if (recordForm.subcategoryType === 'vaccine') {
          note = `Lot No: ${recordForm.lotNo || ''}, 次回: ${recordForm.nextVaccinationDate || ''}`;
        } else if (recordForm.subcategoryType === 'visit') {
          note = `病院: ${clinicName}, 体重: ${recordForm.weight}kg, 体調: ${recordForm.condition}, 指示: ${recordForm.doctorNote || ''}`;
        }

        const visitFields: VisitFields = {
          petId: recordForm.petId,
          clinicId: recordForm.subcategoryType === 'visit' ? recordForm.clinicId : (clinicsData?.content?.[0]?.id || null), // 診察の場合は選択されたclinicId、それ以外は最初のclinicId
          visitedOn: `${selectedDate.toISOString().split('T')[0]}T12:00:00`, // デフォルト時間
          visitType,
          reason,
          note,
        };

        let visit;
        if (isEditing && editingVisitId) {
          // 編集の場合
          visit = await updateVisitMutation.mutateAsync({ visitId: editingVisitId, data: visitFields });
        } else {
          // 新規作成の場合
          visit = await addVisitMutation.mutateAsync({ data: visitFields });
        }

        // 処方薬がある場合、prescriptionを作成してvisit-prescriptionで関連付ける
        if (selectedSubcategoryType === 'visit' && recordForm.prescriptionName) {
          // prescription categoryをenumに変換
          const getPrescriptionCategory = (category: string): PrescriptionCategory => {
            switch (category) {
              case 'vaccine': return PrescriptionCategory.vaccine;
              case 'heartworm': return PrescriptionCategory.heartworm;
              case 'flea_tick': return PrescriptionCategory.flea_tick;
              default: return PrescriptionCategory.other;
            }
          };

          const prescriptionFields: PrescriptionFields = {
            category: getPrescriptionCategory(recordForm.prescriptionCategory),
            name: recordForm.prescriptionName,
            form: recordForm.prescriptionUnit, // 単位をformとして使用
            strength: recordForm.prescriptionQuantity, // 投与量をstrengthとして使用
            note: recordForm.prescriptionInstructions || '',
          };

          const prescription = await addPrescriptionMutation.mutateAsync({ data: prescriptionFields });

          const visitPrescriptionFields: VisitPrescriptionFields = {
            visitId: visit.id,
            prescriptionId: prescription.id,
            quantity: parseFloat(recordForm.prescriptionQuantity),
            unit: recordForm.prescriptionUnit,
            days: recordForm.prescriptionDays ? parseInt(recordForm.prescriptionDays) : undefined,
            dosageInstructions: recordForm.prescriptionInstructions || '',
            purpose: recordForm.diagnosis || '',
          };

          await addVisitPrescriptionMutation.mutateAsync({ visitId: visit.id, data: visitPrescriptionFields });
        }

        // リマインダー作成（今後の実装）

        // クエリを無効化
        queryClient.invalidateQueries({ queryKey: ['/visits'] });

      } else if (selectedCategory === 'supplies') {
        // Item作成
        let itemCategory: ItemCategory = ItemCategory.other;
        if (selectedSubcategoryType === 'food') itemCategory = ItemCategory.food;
        else if (selectedSubcategoryType === 'toilet') itemCategory = ItemCategory.pad;
        else if (selectedSubcategoryType === 'care') itemCategory = ItemCategory.hygiene;
        else if (selectedSubcategoryType === 'others') itemCategory = ItemCategory.other;

        const itemData = {
          petId: recordForm.petId,
          category: itemCategory,
          name: recordForm.itemName,
          quantity: parseInt(recordForm.quantity),
          purchaseDate: recordForm.purchaseDate,
          note: recordForm.memo || '',
        };
        await addItemMutation.mutateAsync({ data: itemData });

        queryClient.invalidateQueries({ queryKey: ['/items'] });
      }

      // 編集モードの場合はサイドバーを閉じる、それ以外はドロワーを閉じる
      if (isEditing && editingVisitId) {
        setIsSidebarOpen(false);
        setSelectedCard(null);
        setIsSidebarEditing(false);
        setIsEditing(false);
        setEditingVisitId(null);
      } else {
        handleDrawerClose();
      }
    } catch (error) {
      setErrorMessage(`記録の保存に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  };

  return (
    <LayoutTemplate
      header={<Header />}
      footer={<Footer />}
      main={
        <div className="p-4 relative">
          <h1 className="text-xl font-bold mb-4">カレンダー</h1>

          {/* カレンダー部分 */}
          <div className="bg-[#1e1e1e] rounded-lg shadow p-4 mb-6">

            {/* ナビゲーション */}
            <div className="grid grid-cols-3 items-center gap-4 mb-4">
              {/* 左側: 年セレクター */}
              <div className="justify-self-start">
                <select
                  value={currentMonth.getFullYear()}
                  onChange={(e) => setCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth(), 1))}
                  className="bg-transparent border border-gray-700 rounded px-2 py-1 text-gray-100"
                >
                  {Array.from({ length: 11 }, (_, i) => 2020 + i).map(year => (
                    <option key={year} value={year}>{year}年</option>
                  ))}
                </select>
              </div>

              {/* 中央: 月移動グループ */}
              <div className="justify-self-center flex items-center gap-4">
                <button
                  onClick={() => viewMode === 'monthly' ? changeMonth(-1) : changeWeek(-1)}
                  className="text-gray-100 hover:text-white text-2xl"
                >
                  ‹
                </button>
                <h2 className="text-lg font-semibold text-white">
                  {viewMode === 'monthly'
                    ? `${currentMonth.getMonth() + 1}月`
                    : `${startDateWeek.getMonth() + 1}月`
                  }
                </h2>
                <button
                  onClick={() => viewMode === 'monthly' ? changeMonth(1) : changeWeek(1)}
                  className="text-gray-100 hover:text-white text-2xl"
                >
                  ›
                </button>
              </div>

              {/* 右側: 表示切り替えと今日アイコン */}
              <div className="justify-self-end flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('monthly')}
                  className={`w-6 h-6 flex items-center justify-center ${viewMode === 'monthly' ? 'text-green-600' : 'text-gray-400'}`}
                  title="月間表示"
                >
                  <div className="relative w-4 h-4 border border-current rounded">
                    <div className="absolute top-0 left-0 w-full h-1 bg-current"></div>
                    <div className="absolute bottom-0.5 left-0.5 w-2 h-0.5 bg-current"></div>
                    <div className="absolute bottom-0.5 right-0.5 w-1 h-0.5 bg-current"></div>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('weekly')}
                  className={`w-6 h-6 flex items-center justify-center ${viewMode === 'weekly' ? 'text-green-600' : 'text-gray-400'}`}
                  title="週間表示"
                >
                  <div className="flex flex-col gap-px">
                    <div className="w-3 h-0.5 bg-current"></div>
                    <div className="w-3 h-0.5 bg-current"></div>
                    <div className="w-3 h-0.5 bg-current"></div>
                  </div>
                </button>
                <button
                  onClick={goToToday}
                  className="w-6 h-6 flex items-center justify-center p-2 text-blue-400 hover:bg-gray-800 rounded"
                >
                  <CalendarToday className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 曜日見出し（月間表示のみ） */}
            {viewMode === 'monthly' && (
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-100 py-2">
                    {day}
                  </div>
                ))}
              </div>
            )}

            {/* 日付セル */}
            <div className={`grid gap-1 ${viewMode === 'monthly' ? 'grid-cols-7' : 'grid-cols-7'}`}>
              {dates.map((date, index) => {
                const cards = getCardsForDate(date);
                const maxDots = 5;
                const displayedCards = cards.slice(0, maxDots);
                const remainingCount = Math.max(0, cards.length - maxDots);

                return (
                  <div
                    key={index}
                    onClick={() => setSelectedDate(date)}
                    className={`relative text-center py-3 px-2 text-sm cursor-pointer hover:bg-gray-700 rounded ${
                      isSelectedDate(date) ? 'bg-gray-700' : ''
                    } ${
                      isCurrentPeriod(date) ? 'text-white' : 'text-gray-500'
                    }`}
                  >
                    {date.getDate()}
                    {/* カードドット */}
                    {displayedCards.length > 0 && (
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                        {displayedCards.map((card, cardIndex) => (
                          <div
                            key={card.id}
                            className={`w-1.5 h-1.5 rounded-full ${
                              card.completed ? 'bg-[#27A67A]' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                        {remainingCount > 0 && (
                          <span className="text-xs text-gray-500 ml-0.5">+{remainingCount}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* カードリスト部分 */}
          <div className="bg-[#1e1e1e] rounded-lg shadow p-4">
            {/* 日付ヘッダー */}
            <h3 className="text-lg font-semibold mb-4 text-white">
              {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日
            </h3>

            {/* 投薬カード */}
            <div className="space-y-4">
              {getCardsForDate(selectedDate).map(card => (
                <div
                  key={card.id}
                  onClick={() => {
                    setSelectedCard(card);
                    setIsSidebarOpen(true);
                  }}
                  className="bg-[#1e1e1e] border border-gray-700 rounded-lg p-4 flex justify-between items-start cursor-pointer hover:bg-gray-700"
                >
                  <div className="flex flex-col gap-2">
                    <div className="font-bold text-white">{card.time} - {card.medicine}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-100">
                      <Info className="w-4 h-4" />
                      {card.dosage}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-100">
                      <Pets className="w-4 h-4" />
                      {card.petName}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // カードクリックを防ぐ
                      toggleCardCompletion(card.id);
                    }}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      card.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                    }`}
                  >
                    {card.completed && <Check className="w-4 h-4 text-white" />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* FAB */}
          <Fab
            color="primary"
            aria-label="記録を追加"
            onClick={handleFabClick}
            sx={{
              position: 'fixed',
              bottom: 80,
              right: 16,
              zIndex: 1000,
            }}
          >
            <Add />
          </Fab>

          {/* 詳細表示サイドバー */}
          <Drawer
            anchor={isMobile ? "bottom" : "right"}
            open={isSidebarOpen}
            onClose={() => {
              setIsSidebarOpen(false);
              setSelectedCard(null);
              setIsSidebarEditing(false);
            }}
            sx={{
              '& .MuiDrawer-paper': {
                width: isMobile ? '100%' : 400,
                height: isMobile ? '80vh' : '100vh',
                backgroundColor: '#1e1e1e',
                color: 'white',
              },
            }}
          >
            <Box sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center">
                  {isSidebarEditing && (
                    <IconButton onClick={() => setIsSidebarEditing(false)}>
                      <ArrowBack />
                    </IconButton>
                  )}
                  <Typography variant="h6" sx={{ ml: isSidebarEditing ? 1 : 0 }}>
                    {isSidebarEditing ? '記録を編集' : '詳細情報'}
                  </Typography>
                </Box>
                <Box>
                  {!isSidebarEditing && (
                    <IconButton onClick={() => {
                      // 編集モードを開始
                      const visit = visitsData?.content?.find(v => v.id === selectedCard.id);
                      if (visit) {
                        setIsEditing(true);
                        setEditingVisitId(visit.id);
                        // recordFormに既存データをセット
                        const dateStr = new Date(visit.visitedOn).toISOString().split('T')[0];
                        setSelectedDate(new Date(dateStr)); // 編集時にselectedDateを更新
                        let formData: any = {
                          petId: visit.petId,
                          date: dateStr,
                          category: 'hospital',
                        };

                        // visit.reasonからカテゴリを判定し、データを復元
                        if (visit.reason && visit.reason.includes('ワクチン接種')) {
                          formData.subcategoryType = 'vaccine';
                          formData.vaccineType = visit.reason.replace('ワクチン接種 - ', '');
                          // noteからLot Noと次回接種日を抽出
                          if (visit.note) {
                            const noteParts = visit.note.split(', ');
                            formData.lotNo = noteParts.find(p => p.startsWith('Lot No: '))?.replace('Lot No: ', '') || '';
                            const nextDatePart = noteParts.find(p => p.startsWith('次回: '));
                            if (nextDatePart) {
                              formData.nextVaccinationDate = nextDatePart.replace('次回: ', '');
                            }
                          }
                        } else if ((visit.reason && visit.reason.includes('診察')) || visit.visitType === VisitType.checkup) {
                          formData.subcategoryType = 'visit';
                          formData.diagnosis = visit.reason || '';
                          // noteから病院、体重、体調、指示を抽出
                          if (visit.note) {
                            const noteParts = visit.note.split(', ');
                            formData.clinicName = noteParts.find(p => p.startsWith('病院: '))?.replace('病院: ', '') || '';
                            formData.weight = noteParts.find(p => p.startsWith('体重: '))?.replace('体重: ', '').replace('kg', '') || '';
                            formData.condition = noteParts.find(p => p.startsWith('体調: '))?.replace('体調: ', '') || '';
                            formData.doctorNote = noteParts.find(p => p.startsWith('指示: '))?.replace('指示: ', '') || '';
                          }
                          // clinicIdをclinicNameから逆引き
                          if (formData.clinicName && clinicsData?.content) {
                            const clinic = clinicsData.content.find(c => c.name === formData.clinicName);
                            if (clinic) {
                              formData.clinicId = clinic.id;
                            }
                          }
                        } else {
                          formData.subcategoryType = 'medication';
                          formData.medicineName = visit.reason ? (visit.reason.split(' - ')[1] || visit.reason) : '';
                          // noteから区分と次回日を抽出
                          if (visit.note && visit.note.startsWith('次回: ')) {
                            formData.nextDate = visit.note.replace('次回: ', '');
                          }
                        }

                        setRecordForm(formData);
                        setIsSidebarEditing(true);
                      }
                    }}>
                      <Edit />
                    </IconButton>
                  )}
                  <IconButton onClick={() => {
                    setIsSidebarOpen(false);
                    setSelectedCard(null);
                    setIsSidebarEditing(false);
                  }}>
                    <Close />
                  </IconButton>
                </Box>
              </Box>

              {isSidebarEditing ? (
                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* 大カテゴリー選択 */}
                  <FormControl fullWidth>
                    <InputLabel>カテゴリー</InputLabel>
                    <Select
                      value={recordForm.category || 'hospital'}
                      label="カテゴリー"
                      onChange={(e) => {
                        const category = e.target.value as 'hospital' | 'supplies';
                        setRecordForm({ ...recordForm, category, subcategoryType: category === 'hospital' ? 'medication' : 'food' });
                      }}
                    >
                      <MenuItem value="hospital">病院</MenuItem>
                      <MenuItem value="supplies">備品</MenuItem>
                    </Select>
                  </FormControl>

                  {/* 日付選択 */}
                  <TextField
                    fullWidth
                    label="日付"
                    type="date"
                    value={recordForm.date || ''}
                    onChange={(e) => {
                      setRecordForm({ ...recordForm, date: e.target.value });
                      setSelectedDate(new Date(e.target.value)); // 日付変更時にselectedDateを更新
                    }}
                    InputLabelProps={{ shrink: true }}
                  />

                  {/* 小カテゴリー選択 */}
                  {recordForm.category === 'hospital' && (
                    <FormControl fullWidth>
                      <InputLabel>項目</InputLabel>
                      <Select
                        value={recordForm.subcategoryType || 'medication'}
                        label="項目"
                        onChange={(e) => {
                          const subcategoryType = e.target.value;
                          setRecordForm({ ...recordForm, subcategoryType });
                          if (subcategoryType === 'medication') setSelectedSubcategory(VisitType.general);
                          else if (subcategoryType === 'vaccine') setSelectedSubcategory(VisitType.checkup);
                          else if (subcategoryType === 'visit') setSelectedSubcategory(VisitType.checkup);
                          setSelectedSubcategoryType(subcategoryType);
                        }}
                      >
                        <MenuItem value="medication">投薬・予防</MenuItem>
                        <MenuItem value="vaccine">ワクチン</MenuItem>
                        <MenuItem value="visit">診察</MenuItem>
                      </Select>
                    </FormControl>
                  )}

                  {recordForm.category === 'supplies' && (
                    <FormControl fullWidth>
                      <InputLabel>項目</InputLabel>
                      <Select
                        value={recordForm.subcategoryType || 'food'}
                        label="項目"
                        onChange={(e) => {
                          const subcategoryType = e.target.value;
                          setRecordForm({ ...recordForm, subcategoryType });
                          if (subcategoryType === 'food') setSelectedSubcategory(ItemCategory.food);
                          else if (subcategoryType === 'toilet') setSelectedSubcategory(ItemCategory.pad);
                          else if (subcategoryType === 'care') setSelectedSubcategory(ItemCategory.hygiene);
                          else if (subcategoryType === 'others') setSelectedSubcategory(ItemCategory.other);
                          setSelectedSubcategoryType(subcategoryType);
                        }}
                      >
                        <MenuItem value="food">フード・おやつ</MenuItem>
                        <MenuItem value="toilet">トイレ用品</MenuItem>
                        <MenuItem value="care">ケア用品</MenuItem>
                        <MenuItem value="others">その他</MenuItem>
                      </Select>
                    </FormControl>
                  )}

                  {/* ペット選択 */}
                  <FormControl fullWidth>
                    <InputLabel>ペット</InputLabel>
                    <Select
                      value={recordForm.petId || ''}
                      label="ペット"
                      onChange={(e) => setRecordForm({ ...recordForm, petId: e.target.value })}
                    >
                      {petsData?.content?.map(pet => (
                        <MenuItem key={pet.id} value={pet.id}>{pet.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* 専用フィールド */}
                  {recordForm.category === 'hospital' && recordForm.subcategoryType === 'medication' && (
                    <>
                      <FormControl fullWidth>
                        <InputLabel>区分</InputLabel>
                        <Select
                          value={recordForm.categoryField || ''}
                          label="区分"
                          onChange={(e) => setRecordForm({ ...recordForm, categoryField: e.target.value })}
                        >
                          <MenuItem value="フィラリア">フィラリア</MenuItem>
                          <MenuItem value="ノミダニ">ノミダニ</MenuItem>
                          <MenuItem value="その他">その他</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        label="薬名"
                        value={recordForm.medicineName || ''}
                        onChange={(e) => setRecordForm({ ...recordForm, medicineName: e.target.value })}
                      />
                      <TextField
                        fullWidth
                        label="次回の予定日"
                        type="date"
                        value={recordForm.nextDate || ''}
                        onChange={(e) => setRecordForm({ ...recordForm, nextDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                      />
                    </>
                  )}

                  {recordForm.category === 'hospital' && recordForm.subcategoryType === 'vaccine' && (
                    <>
                      <TextField
                        fullWidth
                        label="ワクチン種類"
                        value={recordForm.vaccineType || ''}
                        onChange={(e) => setRecordForm({ ...recordForm, vaccineType: e.target.value })}
                      />
                      <TextField
                        fullWidth
                        label="Lot No"
                        value={recordForm.lotNo || ''}
                        onChange={(e) => setRecordForm({ ...recordForm, lotNo: e.target.value })}
                      />
                      <TextField
                        fullWidth
                        label="次回接種予定日"
                        type="date"
                        value={recordForm.nextVaccinationDate || ''}
                        onChange={(e) => setRecordForm({ ...recordForm, nextVaccinationDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                      />
                    </>
                  )}

                  {recordForm.category === 'hospital' && recordForm.subcategoryType === 'visit' && (
                    <>
                      <FormControl fullWidth>
                        <InputLabel>病院</InputLabel>
                        <Select
                          value={recordForm.clinicId || ''}
                          label="病院"
                          onChange={(e) => setRecordForm({ ...recordForm, clinicId: e.target.value })}
                        >
                          {clinicsData?.content?.map(clinic => (
                            <MenuItem key={clinic.id} value={clinic.id}>{clinic.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        label="診断内容"
                        value={recordForm.diagnosis || ''}
                        onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                      />
                      <TextField
                        fullWidth
                        label="体重 (kg)"
                        type="number"
                        inputProps={{ step: "0.1" }}
                        value={recordForm.weight || ''}
                        onChange={(e) => setRecordForm({ ...recordForm, weight: e.target.value })}
                      />
                      <FormControl fullWidth>
                        <InputLabel>体調ステータス</InputLabel>
                        <Select
                          value={recordForm.condition || ''}
                          label="体調ステータス"
                          onChange={(e) => setRecordForm({ ...recordForm, condition: e.target.value })}
                        >
                          <MenuItem value="元気">元気</MenuItem>
                          <MenuItem value="普通">普通</MenuItem>
                          <MenuItem value="不調">不調</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        label="医師からの指示メモ"
                        multiline
                        rows={3}
                        value={recordForm.doctorNote || ''}
                        onChange={(e) => setRecordForm({ ...recordForm, doctorNote: e.target.value })}
                      />
                      {/* 処方薬の追加 */}
                      <Typography variant="body1" sx={{ mt: 2, mb: 1 }}>処方薬（任意）</Typography>
                      <TextField
                        fullWidth
                        label="薬名"
                        value={recordForm.prescriptionName || ''}
                        onChange={(e) => setRecordForm({ ...recordForm, prescriptionName: e.target.value })}
                      />
                      <FormControl fullWidth>
                        <InputLabel>薬のカテゴリ</InputLabel>
                        <Select
                          value={recordForm.prescriptionCategory || ''}
                          label="薬のカテゴリ"
                          onChange={(e) => setRecordForm({ ...recordForm, prescriptionCategory: e.target.value })}
                        >
                          <MenuItem value="vaccine">ワクチン</MenuItem>
                          <MenuItem value="heartworm">フィラリア</MenuItem>
                          <MenuItem value="flea_tick">ノミ・ダニ</MenuItem>
                          <MenuItem value="other">その他</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        label="投与量"
                        value={recordForm.prescriptionQuantity || ''}
                        onChange={(e) => setRecordForm({ ...recordForm, prescriptionQuantity: e.target.value })}
                      />
                      <TextField
                        fullWidth
                        label="単位"
                        value={recordForm.prescriptionUnit || ''}
                        onChange={(e) => setRecordForm({ ...recordForm, prescriptionUnit: e.target.value })}
                        placeholder="錠, ml, etc."
                      />
                      <TextField
                        fullWidth
                        label="投与日数"
                        type="number"
                        value={recordForm.prescriptionDays || ''}
                        onChange={(e) => setRecordForm({ ...recordForm, prescriptionDays: e.target.value })}
                      />
                      <TextField
                        fullWidth
                        label="投与指示"
                        multiline
                        rows={2}
                        value={recordForm.prescriptionInstructions || ''}
                        onChange={(e) => setRecordForm({ ...recordForm, prescriptionInstructions: e.target.value })}
                      />
                    </>
                  )}

                  {recordForm.category === 'supplies' && (
                    <>
                      <TextField
                        fullWidth
                        label="品名"
                        value={recordForm.itemName || ''}
                        onChange={(e) => setRecordForm({ ...recordForm, itemName: e.target.value })}
                      />
                      <TextField
                        fullWidth
                        label="数量"
                        value={recordForm.quantity || ''}
                        onChange={(e) => setRecordForm({ ...recordForm, quantity: e.target.value })}
                      />
                      <TextField
                        fullWidth
                        label="購入日"
                        type="date"
                        value={recordForm.purchaseDate || ''}
                        onChange={(e) => setRecordForm({ ...recordForm, purchaseDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                      />
                      <TextField
                        fullWidth
                        label="メモ"
                        multiline
                        rows={3}
                        value={recordForm.memo || ''}
                        onChange={(e) => setRecordForm({ ...recordForm, memo: e.target.value })}
                      />
                    </>
                  )}

                  <Button
                    variant="contained"
                    onClick={handleSubmitRecord}
                    disabled={addVisitMutation.isPending || updateVisitMutation.isPending || addVisitPrescriptionMutation.isPending}
                  >
                    更新
                  </Button>
                </Box>
              ) : (
                selectedCard && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      {selectedCard.time} - {selectedCard.medicine}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Pets sx={{ fontSize: 20 }} />
                      <Typography>{selectedCard.petName}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Info sx={{ fontSize: 20 }} />
                      <Typography>{selectedCard.dosage}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Check sx={{ fontSize: 20, color: selectedCard.completed ? 'green' : 'gray' }} />
                      <Typography>完了状態: {selectedCard.completed ? '完了' : '未完了'}</Typography>
                    </Box>

                    {/* 追加の詳細情報（visitデータから取得可能） */}
                    {(() => {
                      const visit = visitsData?.content?.find(v => v.id === selectedCard.id);
                      if (visit) {
                        return (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                              追加情報
                            </Typography>
                            <Typography>訪問日時: {visit.visitedOn}</Typography>
                            <Typography>訪問タイプ: {visit.visitType}</Typography>
                            <Typography>理由: {visit.reason}</Typography>
                            {visit.note && <Typography>メモ: {visit.note}</Typography>}
                          </Box>
                        );
                      }
                      return null;
                    })()}
                  </Box>
                )
              )}
            </Box>
          </Drawer>

          {/* 記録入力ドロワー */}
          <Drawer
            anchor="bottom"
            open={isDrawerOpen}
            onClose={handleDrawerClose}
          >
            <Box sx={{ p: 3, minHeight: '50vh' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">{isEditing ? '記録を編集' : '記録を追加'}</Typography>
                <IconButton onClick={handleDrawerClose}>
                  <Close />
                </IconButton>
              </Box>

              {errorMessage && (
                <Typography variant="body2" sx={{ color: 'error.main', mb: 2 }}>
                  {errorMessage}
                </Typography>
              )}

              <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* 大カテゴリー選択 */}
                <FormControl fullWidth>
                  <InputLabel>カテゴリー</InputLabel>
                  <Select
                    value={recordForm.category || 'hospital'}
                    label="カテゴリー"
                    onChange={(e) => {
                      const category = e.target.value as 'hospital' | 'supplies';
                      setRecordForm({ ...recordForm, category, subcategoryType: category === 'hospital' ? 'medication' : 'food' });
                    }}
                  >
                    <MenuItem value="hospital">病院</MenuItem>
                    <MenuItem value="supplies">備品</MenuItem>
                  </Select>
                </FormControl>

                {/* 日付選択 */}
                <TextField
                  fullWidth
                  label="日付"
                  type="date"
                  value={recordForm.date || ''}
                  onChange={(e) => setRecordForm({ ...recordForm, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />

                {/* 小カテゴリー選択 */}
                {recordForm.category === 'hospital' && (
                  <FormControl fullWidth>
                    <InputLabel>項目</InputLabel>
                    <Select
                      value={recordForm.subcategoryType || 'medication'}
                      label="項目"
                      onChange={(e) => {
                        const subcategoryType = e.target.value;
                        setRecordForm({ ...recordForm, subcategoryType });
                        if (subcategoryType === 'medication') setSelectedSubcategory(VisitType.general);
                        else if (subcategoryType === 'vaccine') setSelectedSubcategory(VisitType.checkup);
                        else if (subcategoryType === 'visit') setSelectedSubcategory(VisitType.checkup);
                        setSelectedSubcategoryType(subcategoryType);
                      }}
                    >
                      <MenuItem value="medication">投薬・予防</MenuItem>
                      <MenuItem value="vaccine">ワクチン</MenuItem>
                      <MenuItem value="visit">診察</MenuItem>
                    </Select>
                  </FormControl>
                )}

                {recordForm.category === 'supplies' && (
                  <FormControl fullWidth>
                    <InputLabel>項目</InputLabel>
                    <Select
                      value={recordForm.subcategoryType || 'food'}
                      label="項目"
                      onChange={(e) => {
                        const subcategoryType = e.target.value;
                        setRecordForm({ ...recordForm, subcategoryType });
                        if (subcategoryType === 'food') setSelectedSubcategory(ItemCategory.food);
                        else if (subcategoryType === 'toilet') setSelectedSubcategory(ItemCategory.pad);
                        else if (subcategoryType === 'care') setSelectedSubcategory(ItemCategory.hygiene);
                        else if (subcategoryType === 'others') setSelectedSubcategory(ItemCategory.other);
                        setSelectedSubcategoryType(subcategoryType);
                      }}
                    >
                      <MenuItem value="food">フード・おやつ</MenuItem>
                      <MenuItem value="toilet">トイレ用品</MenuItem>
                      <MenuItem value="care">ケア用品</MenuItem>
                      <MenuItem value="others">その他</MenuItem>
                    </Select>
                  </FormControl>
                )}

                {/* ペット選択 */}
                <FormControl fullWidth>
                  <InputLabel>ペット</InputLabel>
                  <Select
                    value={recordForm.petId || ''}
                    label="ペット"
                    onChange={(e) => setRecordForm({ ...recordForm, petId: e.target.value })}
                  >
                    {petsData?.content?.map(pet => (
                      <MenuItem key={pet.id} value={pet.id}>{pet.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* 専用フィールド */}
                {recordForm.category === 'hospital' && recordForm.subcategoryType === 'medication' && (
                  <>
                    <FormControl fullWidth>
                      <InputLabel>区分</InputLabel>
                      <Select
                        value={recordForm.categoryField || ''}
                        label="区分"
                        onChange={(e) => setRecordForm({ ...recordForm, categoryField: e.target.value })}
                      >
                        <MenuItem value="フィラリア">フィラリア</MenuItem>
                        <MenuItem value="ノミダニ">ノミダニ</MenuItem>
                        <MenuItem value="その他">その他</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label="薬名"
                      value={recordForm.medicineName || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, medicineName: e.target.value })}
                    />
                    <TextField
                      fullWidth
                      label="次回の予定日"
                      type="date"
                      value={recordForm.nextDate || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, nextDate: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </>
                )}

                {recordForm.category === 'hospital' && recordForm.subcategoryType === 'vaccine' && (
                  <>
                    <TextField
                      fullWidth
                      label="ワクチン種類"
                      value={recordForm.vaccineType || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, vaccineType: e.target.value })}
                    />
                    <TextField
                      fullWidth
                      label="Lot No"
                      value={recordForm.lotNo || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, lotNo: e.target.value })}
                    />
                    <TextField
                      fullWidth
                      label="次回接種予定日"
                      type="date"
                      value={recordForm.nextVaccinationDate || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, nextVaccinationDate: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </>
                )}

                {recordForm.category === 'hospital' && recordForm.subcategoryType === 'visit' && (
                  <>
                    <FormControl fullWidth>
                      <InputLabel>病院</InputLabel>
                      <Select
                        value={recordForm.clinicId || ''}
                        label="病院"
                        onChange={(e) => setRecordForm({ ...recordForm, clinicId: e.target.value })}
                      >
                        {clinicsData?.content?.map(clinic => (
                          <MenuItem key={clinic.id} value={clinic.id}>{clinic.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label="診断内容"
                      value={recordForm.diagnosis || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                    />
                    <TextField
                      fullWidth
                      label="体重 (kg)"
                      type="number"
                      inputProps={{ step: "0.1" }}
                      value={recordForm.weight || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, weight: e.target.value })}
                    />
                    <FormControl fullWidth>
                      <InputLabel>体調ステータス</InputLabel>
                      <Select
                        value={recordForm.condition || ''}
                        label="体調ステータス"
                        onChange={(e) => setRecordForm({ ...recordForm, condition: e.target.value })}
                      >
                        <MenuItem value="元気">元気</MenuItem>
                        <MenuItem value="普通">普通</MenuItem>
                        <MenuItem value="不調">不調</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label="医師からの指示メモ"
                      multiline
                      rows={3}
                      value={recordForm.doctorNote || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, doctorNote: e.target.value })}
                    />
                    {/* 処方薬の追加 */}
                    <Typography variant="body1" sx={{ mt: 2, mb: 1 }}>処方薬（任意）</Typography>
                    <TextField
                      fullWidth
                      label="薬名"
                      value={recordForm.prescriptionName || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, prescriptionName: e.target.value })}
                    />
                    <FormControl fullWidth>
                      <InputLabel>薬のカテゴリ</InputLabel>
                      <Select
                        value={recordForm.prescriptionCategory || ''}
                        label="薬のカテゴリ"
                        onChange={(e) => setRecordForm({ ...recordForm, prescriptionCategory: e.target.value })}
                      >
                        <MenuItem value="vaccine">ワクチン</MenuItem>
                        <MenuItem value="heartworm">フィラリア</MenuItem>
                        <MenuItem value="flea_tick">ノミ・ダニ</MenuItem>
                        <MenuItem value="other">その他</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label="投与量"
                      value={recordForm.prescriptionQuantity || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, prescriptionQuantity: e.target.value })}
                    />
                    <TextField
                      fullWidth
                      label="単位"
                      value={recordForm.prescriptionUnit || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, prescriptionUnit: e.target.value })}
                      placeholder="錠, ml, etc."
                    />
                    <TextField
                      fullWidth
                      label="投与日数"
                      type="number"
                      value={recordForm.prescriptionDays || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, prescriptionDays: e.target.value })}
                    />
                    <TextField
                      fullWidth
                      label="投与指示"
                      multiline
                      rows={2}
                      value={recordForm.prescriptionInstructions || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, prescriptionInstructions: e.target.value })}
                    />
                  </>
                )}



                {recordForm.category === 'supplies' && (
                  <>
                    <TextField
                      fullWidth
                      label="品名"
                      value={recordForm.itemName || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, itemName: e.target.value })}
                    />
                    <TextField
                      fullWidth
                      label="数量"
                      value={recordForm.quantity || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, quantity: e.target.value })}
                    />
                    <TextField
                      fullWidth
                      label="購入日"
                      type="date"
                      value={recordForm.purchaseDate || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, purchaseDate: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      fullWidth
                      label="メモ"
                      multiline
                      rows={3}
                      value={recordForm.memo || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, memo: e.target.value })}
                    />
                  </>
                )}

                <Button
                  variant="contained"
                  onClick={handleSubmitRecord}
                  disabled={addVisitMutation.isPending || updateVisitMutation.isPending || addVisitPrescriptionMutation.isPending}
                >
                  {isEditing ? '更新' : '保存'}
                </Button>
              </Box>
            </Box>
          </Drawer>
        </div>
      }
    />
  );
}

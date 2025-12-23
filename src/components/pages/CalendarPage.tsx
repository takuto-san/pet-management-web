"use client";

import { Header } from "@/components/organisms/Header";
import { Footer } from "@/components/organisms/Footer";
import { LayoutTemplate } from "@/components/templates/LayoutTemplate";
import { useState, useEffect } from "react";
import { useListPets } from "@/api/generated/pet/pet";
import { useListVisits } from "@/api/generated/visit/visit";
import { useListVisitPrescriptions } from "@/api/generated/visit-prescription/visit-prescription";
import { Info, Pets, Check, CalendarToday, Add, Close } from '@mui/icons-material';
import { Fab, Drawer, Box, TextField, Select, MenuItem, FormControl, InputLabel, Button, Typography, IconButton, Chip, Grid, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useAddVisit } from "@/api/generated/visit/visit";
import { useAddVisitPrescription } from "@/api/generated/visit-prescription/visit-prescription";
import { useAddItem } from "@/api/generated/item/item";
import { useQueryClient } from "@tanstack/react-query";
import { VisitFields, VisitType, ItemCategory } from "@/types/api";

interface RecordForm {
  petId?: string;
  category?: 'hospital' | 'supplies';
  subcategoryType?: string;
  date?: string;
  [key: string]: any;
}

export function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    return startOfWeek;
  });
  const [viewMode, setViewMode] = useState<'monthly' | 'weekly'>('monthly');
  const [taskCompletions, setTaskCompletions] = useState<Record<string, boolean>>({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<'category' | 'subcategory' | 'form'>('category');
  const [selectedCategory, setSelectedCategory] = useState<'hospital' | 'supplies' | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<VisitType | ItemCategory | null>(null);
  const [selectedSubcategoryType, setSelectedSubcategoryType] = useState<string | null>(null);
  const [recordForm, setRecordForm] = useState<RecordForm>({});

  // API: ユーザーのペットを取得
  const { data: petsData } = useListPets();

  // API: 全visitsを取得（実際にはユーザーのものにフィルタ）
  const { data: visitsData } = useListVisits();

  const queryClient = useQueryClient();
  const addVisitMutation = useAddVisit();
  const addVisitPrescriptionMutation = useAddVisitPrescription();
  const addItemMutation = useAddItem();

  // モックタスクデータ
  const [mockTasks, setMockTasks] = useState([
    { id: '1', time: '8:00', medicine: '肝臓用サプリ', dosage: '1錠', petName: 'クレオパトラ' },
    { id: '2', time: '12:00', medicine: '抗生物質', dosage: '2滴', petName: 'マックス' },
  ]);

  // タスクデータを日付ごとにグループ化
  const getTasksForDate = (date: Date) => {
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return mockTasks.map(task => ({
        ...task,
        completed: taskCompletions[task.id] ?? false,
      }));
    }
    return [];
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

  // タスク完了状態をトグル
  const toggleTaskCompletion = (taskId: string) => {
    setTaskCompletions(prev => ({ ...prev, [taskId]: !prev[taskId] }));
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
    if (!recordForm.petId) {
      alert('ペットを選択してください');
      return;
    }

    const selectedCategory = recordForm.category;
    const selectedSubcategoryType = recordForm.subcategoryType;

    if (selectedCategory === 'hospital') {
      if (selectedSubcategoryType === 'medication' && (!recordForm.categoryField || !recordForm.medicineName)) {
        alert('必須項目を入力してください');
        return;
      }
      if (selectedSubcategoryType === 'vaccine' && (!recordForm.vaccineType)) {
        alert('必須項目を入力してください');
        return;
      }
      if (selectedSubcategoryType === 'visit' && (!recordForm.clinicName || !recordForm.diagnosis || !recordForm.weight || !recordForm.condition)) {
        alert('必須項目を入力してください');
        return;
      }
    } else if (selectedCategory === 'supplies') {
      if (!recordForm.itemName || !recordForm.quantity) {
        alert('必須項目を入力してください');
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

        const visitFields: VisitFields = {
          petId: recordForm.petId,
          clinicId: 'default-clinic-id', // 仮のクリニックID
          visitedOn: `${selectedDate.toISOString().split('T')[0]}T12:00:00`, // デフォルト時間
          visitType,
          reason,
          note,
        };

        const visit = await addVisitMutation.mutateAsync({ data: visitFields });

        // リマインダー作成
        if ((selectedSubcategoryType === 'medication' && recordForm.nextDate) ||
            (selectedSubcategoryType === 'vaccine' && recordForm.nextVaccinationDate)) {
          const nextDate = selectedSubcategoryType === 'medication' ? recordForm.nextDate : recordForm.nextVaccinationDate;
          const reminderTask = {
            id: `reminder-${visit.id}`,
            time: '08:00',
            medicine: selectedSubcategoryType === 'medication' ? (recordForm.medicineName || '') : (recordForm.vaccineType || ''),
            dosage: selectedSubcategoryType === 'medication' ? (recordForm.category || '') : '接種',
            petName: petsData?.content?.find(p => p.id === recordForm.petId)?.name || '',
          };
          setMockTasks(prev => [...prev, reminderTask]);
        }

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

      handleDrawerClose();
    } catch (error) {
      console.error('記録の保存に失敗しました:', error);
      alert('記録の保存に失敗しました');
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
                const tasks = getTasksForDate(date);
                const maxDots = 5;
                const displayedTasks = tasks.slice(0, maxDots);
                const remainingCount = Math.max(0, tasks.length - maxDots);

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
                    {/* タスクドット */}
                    {displayedTasks.length > 0 && (
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                        {displayedTasks.map((task, taskIndex) => (
                          <div
                            key={task.id}
                            className={`w-1.5 h-1.5 rounded-full ${
                              task.completed ? 'bg-[#27A67A]' : 'bg-gray-300'
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

          {/* タスクリスト部分 */}
          <div className="bg-[#1e1e1e] rounded-lg shadow p-4">
            {/* 日付ヘッダー */}
            <h3 className="text-lg font-semibold mb-4 text-white">
              {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日
            </h3>

            {/* 投薬カード */}
            <div className="space-y-4">
              {getTasksForDate(selectedDate).map(task => (
                <div key={task.id} className="bg-[#1e1e1e] border border-gray-700 rounded-lg p-4 flex justify-between items-start">
                  <div className="flex flex-col gap-2">
                    <div className="font-bold text-white">{task.time} - {task.medicine}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-100">
                      <Info className="w-4 h-4" />
                      {task.dosage}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-100">
                      <Pets className="w-4 h-4" />
                      {task.petName}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleTaskCompletion(task.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                    }`}
                  >
                    {task.completed && <Check className="w-4 h-4 text-white" />}
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

          {/* 記録入力ドロワー */}
          <Drawer
            anchor="bottom"
            open={isDrawerOpen}
            onClose={handleDrawerClose}
          >
            <Box sx={{ p: 3, minHeight: '50vh' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">記録を追加</Typography>
                <IconButton onClick={handleDrawerClose}>
                  <Close />
                </IconButton>
              </Box>

              <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* 大カテゴリー選択 */}
                <FormControl component="fieldset">
                  <Typography variant="body1" sx={{ mb: 1 }}>カテゴリー</Typography>
                  <RadioGroup
                    row
                    value={recordForm.category || 'hospital'}
                    onChange={(e) => {
                      const category = e.target.value as 'hospital' | 'supplies';
                      setRecordForm({ ...recordForm, category, subcategoryType: category === 'hospital' ? 'medication' : 'food' });
                    }}
                  >
                    <FormControlLabel value="hospital" control={<Radio />} label="🏥 病院" />
                    <FormControlLabel value="supplies" control={<Radio />} label="🛍️ 備品" />
                  </RadioGroup>
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
                  <FormControl component="fieldset">
                    <Typography variant="body1" sx={{ mb: 1 }}>項目</Typography>
                    <RadioGroup
                      row
                      value={recordForm.subcategoryType || 'medication'}
                      onChange={(e) => {
                        const subcategoryType = e.target.value;
                        setRecordForm({ ...recordForm, subcategoryType });
                        if (subcategoryType === 'medication') setSelectedSubcategory(VisitType.general);
                        else if (subcategoryType === 'vaccine') setSelectedSubcategory(VisitType.checkup);
                        else if (subcategoryType === 'visit') setSelectedSubcategory(VisitType.checkup);
                        setSelectedSubcategoryType(subcategoryType);
                      }}
                    >
                      <FormControlLabel value="medication" control={<Radio />} label="💊 投薬・予防" />
                      <FormControlLabel value="vaccine" control={<Radio />} label="💉 ワクチン" />
                      <FormControlLabel value="visit" control={<Radio />} label="🏥 診察" />
                    </RadioGroup>
                  </FormControl>
                )}

                {recordForm.category === 'supplies' && (
                  <FormControl component="fieldset">
                    <Typography variant="body1" sx={{ mb: 1 }}>項目</Typography>
                    <RadioGroup
                      row
                      value={recordForm.subcategoryType || 'food'}
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
                      <FormControlLabel value="food" control={<Radio />} label="🍱 フード・おやつ" />
                      <FormControlLabel value="toilet" control={<Radio />} label="🚽 トイレ用品" />
                      <FormControlLabel value="care" control={<Radio />} label="🧴 ケア用品" />
                      <FormControlLabel value="others" control={<Radio />} label="📦 その他" />
                    </RadioGroup>
                  </FormControl>
                )}

                {/* ペット選択 */}
                <FormControl component="fieldset">
                  <Typography variant="body1" sx={{ mb: 1 }}>ペット</Typography>
                  <RadioGroup
                    row
                    value={recordForm.petId || ''}
                    onChange={(e) => setRecordForm({ ...recordForm, petId: e.target.value })}
                  >
                    {petsData?.content?.map(pet => (
                      <FormControlLabel key={pet.id} value={pet.id} control={<Radio />} label={pet.name} />
                    ))}
                  </RadioGroup>
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
                    <TextField
                      fullWidth
                      label="病院名"
                      value={recordForm.clinicName || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, clinicName: e.target.value })}
                    />
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
                  disabled={addVisitMutation.isPending || addVisitPrescriptionMutation.isPending}
                >
                  保存
                </Button>
              </Box>
            </Box>
          </Drawer>
        </div>
      }
    />
  );
}

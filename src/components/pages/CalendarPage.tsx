"use client";

import { Header } from "@/components/organisms/Header";
import { Footer } from "@/components/organisms/Footer";
import { LayoutTemplate } from "@/components/templates/LayoutTemplate";
import { useState } from "react";
import { useListPets } from "@/api/generated/pet/pet";
import { useListVisits } from "@/api/generated/visit/visit";
import { useListVisitPrescriptions } from "@/api/generated/visit-prescription/visit-prescription";
import { Info, Pets, Check, Today } from '@mui/icons-material';

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

  // API: ユーザーのペットを取得
  const { data: petsData } = useListPets();

  // API: 全visitsを取得（実際にはユーザーのものにフィルタ）
  const { data: visitsData } = useListVisits();

  // モックタスクデータ
  const mockTasks = [
    { id: '1', time: '8:00', medicine: '肝臓用サプリ', dosage: '1錠', petName: 'クレオパトラ' },
    { id: '2', time: '12:00', medicine: '抗生物質', dosage: '2滴', petName: 'マックス' },
  ];

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

  return (
    <LayoutTemplate
      header={<Header />}
      footer={<Footer />}
      main={
        <div className="p-4 max-w-6xl mx-auto">
          <h1 className="text-xl font-bold mb-4">カレンダー</h1>

          {/* カレンダー部分 */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">

            {/* ナビゲーション */}
            <div className="grid grid-cols-3 items-center gap-4 mb-4">
              {/* 左側: 年セレクター */}
              <div className="justify-self-start">
                <select
                  value={currentMonth.getFullYear()}
                  onChange={(e) => setCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth(), 1))}
                  className="bg-transparent border border-gray-700 rounded px-2 py-1 text-gray-800"
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
                  className="text-gray-600 hover:text-gray-800 text-2xl"
                >
                  ‹
                </button>
                <h2 className="text-lg font-semibold">
                  {viewMode === 'monthly'
                    ? `${currentMonth.getMonth() + 1}月`
                    : `${startDateWeek.getMonth() + 1}月`
                  }
                </h2>
                <button
                  onClick={() => viewMode === 'monthly' ? changeMonth(1) : changeWeek(1)}
                  className="text-gray-600 hover:text-gray-800 text-2xl"
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
                  title="今日"
                >
                  <Today className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 曜日見出し（月間表示のみ） */}
            {viewMode === 'monthly' && (
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
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
                    className={`relative text-center py-3 px-2 text-sm cursor-pointer hover:bg-gray-50 rounded ${
                      isSelectedDate(date) ? 'bg-blue-100 border-2 border-blue-500' : ''
                    } ${
                      isCurrentPeriod(date) ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {date.getDate()}
                    {/* タスクドット */}
                    {displayedTasks.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
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
          <div className="bg-white rounded-lg shadow p-4">
            {/* 日付ヘッダー */}
            <h3 className="text-lg font-semibold mb-4">
              {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日
            </h3>

            {/* 投薬カード */}
            <div className="space-y-4">
              {getTasksForDate(selectedDate).map(task => (
                <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-start">
                  <div className="flex flex-col gap-2">
                    <div className="font-bold">{task.time} - {task.medicine}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Info className="w-4 h-4" />
                      {task.dosage}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
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
        </div>
      }
    />
  );
}

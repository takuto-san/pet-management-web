export interface Task {
  id: string;
  name: string;
  time: string;
  completed: boolean;
}

export interface MonthlyEvent {
  date: number;
  title: string;
}

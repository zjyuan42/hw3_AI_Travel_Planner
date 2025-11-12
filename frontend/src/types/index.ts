// 旅行计划类型定义
export interface TravelPlan {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelers: number;
  preferences: string[];
  itinerary: DayPlan[];
  createdAt: string;
  updatedAt: string;
}

export interface DayPlan {
  day: number;
  date: string;
  activities: Activity[];
  accommodation?: Accommodation;
  transportation?: Transportation;
  meals: Meal[];
}

export interface Activity {
  id: string;
  name: string;
  type: 'sightseeing' | 'shopping' | 'dining' | 'entertainment' | 'relaxation';
  location: Location;
  duration: number; // 分钟
  cost: number;
  description: string;
  time: string;
}

export interface Location {
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Accommodation {
  name: string;
  type: 'hotel' | 'hostel' | 'apartment' | 'resort';
  location: Location;
  cost: number;
  checkIn: string;
  checkOut: string;
}

export interface Transportation {
  type: 'flight' | 'train' | 'bus' | 'car' | 'walking';
  from: Location;
  to: Location;
  cost: number;
  duration: number;
  departureTime: string;
  arrivalTime: string;
}

export interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  restaurant: string;
  location: Location;
  cost: number;
  time: string;
}

// 预算管理类型定义
export interface BudgetItem {
  id: string;
  category: 'transportation' | 'accommodation' | 'food' | 'activities' | 'shopping' | 'other';
  description: string;
  amount: number;
  date: string;
  planId: string;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  byCategory: {
    [key: string]: {
      budget: number;
      spent: number;
    };
  };
}

// 用户类型定义
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: {
    travelStyles: string[];
    budgetRange: {
      min: number;
      max: number;
    };
    interests: string[];
  };
  createdAt: string;
}

// API响应类型定义
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 语音识别类型定义
export interface VoiceRecognitionResult {
  text: string;
  confidence: number;
  isFinal: boolean;
}

// 地图相关类型定义
export interface MapMarker {
  id: string;
  position: [number, number];
  title: string;
  description: string;
  type: 'attraction' | 'restaurant' | 'hotel' | 'transportation';
}
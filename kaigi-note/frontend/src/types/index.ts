// Common types for the application

// User types
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserRegistration extends UserCredentials {
  name: string;
}

// Event types
export interface Event {
  id: number;
  start_time: string;
  end_time: string;
  place: string;
  content: string | null;
  status: string;
  total_cost: number;
  created_at: string;
  updated_at: string;
}

export interface EventCreate {
  start_time: string;
  end_time: string;
  place: string;
  content?: string;
  status?: string;
  total_cost?: number;
}

export interface EventUpdate {
  start_time?: string;
  end_time?: string;
  place?: string;
  content?: string;
  status?: string;
  total_cost?: number;
}

// Participant types
export interface Participant {
  id: number;
  event_id: number;
  user_id: number;
  paid_amount: number;
  created_at: string;
  updated_at: string;
}

export interface ParticipantWithUser extends Participant {
  user_name: string;
}

export interface ParticipantCreate {
  user_id: number;
  paid_amount: number;
}

export interface ParticipantUpdate {
  paid_amount?: number;
}

// Auth types
export interface Token {
  access_token: string;
  token_type: string;
}

// API response types
export interface ApiError {
  detail: string;
}

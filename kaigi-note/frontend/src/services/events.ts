import { AxiosError } from 'axios';
import { authAxios } from './auth';
import { 
  Event, 
  EventCreate, 
  EventUpdate, 
  Participant, 
  ParticipantCreate, 
  ParticipantUpdate, 
  ParticipantWithUser,
  ApiError
} from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const EVENTS_ENDPOINT = '/api/events';

// Get all events with optional filtering
export const getEvents = async (params: Record<string, any> = {}): Promise<Event[]> => {
  try {
    const response = await authAxios.get<Event[]>(EVENTS_ENDPOINT, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    const axiosError = error as AxiosError<ApiError>;
    throw axiosError.response?.data || { detail: 'Failed to fetch events' };
  }
};

// Get a specific event by ID
export const getEvent = async (eventId: number | string): Promise<Event> => {
  try {
    const response = await authAxios.get<Event>(`${EVENTS_ENDPOINT}/${eventId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching event ${eventId}:`, error);
    const axiosError = error as AxiosError<ApiError>;
    throw axiosError.response?.data || { detail: 'Failed to fetch event' };
  }
};

// Create a new event
export const createEvent = async (eventData: EventCreate): Promise<Event> => {
  try {
    const response = await authAxios.post<Event>(EVENTS_ENDPOINT, eventData);
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    const axiosError = error as AxiosError<ApiError>;
    throw axiosError.response?.data || { detail: 'Failed to create event' };
  }
};

// Update an existing event
export const updateEvent = async (eventId: number | string, eventData: EventUpdate): Promise<Event> => {
  try {
    const response = await authAxios.put<Event>(`${EVENTS_ENDPOINT}/${eventId}`, eventData);
    return response.data;
  } catch (error) {
    console.error(`Error updating event ${eventId}:`, error);
    const axiosError = error as AxiosError<ApiError>;
    throw axiosError.response?.data || { detail: 'Failed to update event' };
  }
};

// Delete an event
export const deleteEvent = async (eventId: number | string): Promise<boolean> => {
  try {
    await authAxios.delete(`${EVENTS_ENDPOINT}/${eventId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting event ${eventId}:`, error);
    const axiosError = error as AxiosError<ApiError>;
    throw axiosError.response?.data || { detail: 'Failed to delete event' };
  }
};

// Get participants for an event
export const getEventParticipants = async (eventId: number | string): Promise<ParticipantWithUser[]> => {
  try {
    const response = await authAxios.get<ParticipantWithUser[]>(`${EVENTS_ENDPOINT}/${eventId}/participants`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching participants for event ${eventId}:`, error);
    const axiosError = error as AxiosError<ApiError>;
    throw axiosError.response?.data || { detail: 'Failed to fetch participants' };
  }
};

// Add a participant to an event
export const addParticipant = async (eventId: number | string, participantData: ParticipantCreate): Promise<Participant> => {
  try {
    const response = await authAxios.post<Participant>(`${EVENTS_ENDPOINT}/${eventId}/participants`, participantData);
    return response.data;
  } catch (error) {
    console.error(`Error adding participant to event ${eventId}:`, error);
    const axiosError = error as AxiosError<ApiError>;
    throw axiosError.response?.data || { detail: 'Failed to add participant' };
  }
};

// Update a participant
export const updateParticipant = async (
  eventId: number | string, 
  participantId: number | string, 
  participantData: ParticipantUpdate
): Promise<Participant> => {
  try {
    const response = await authAxios.put<Participant>(
      `${EVENTS_ENDPOINT}/${eventId}/participants/${participantId}`,
      participantData
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating participant ${participantId}:`, error);
    const axiosError = error as AxiosError<ApiError>;
    throw axiosError.response?.data || { detail: 'Failed to update participant' };
  }
};

// Remove a participant from an event
export const removeParticipant = async (eventId: number | string, participantId: number | string): Promise<boolean> => {
  try {
    await authAxios.delete(`${EVENTS_ENDPOINT}/${eventId}/participants/${participantId}`);
    return true;
  } catch (error) {
    console.error(`Error removing participant ${participantId}:`, error);
    const axiosError = error as AxiosError<ApiError>;
    throw axiosError.response?.data || { detail: 'Failed to remove participant' };
  }
};

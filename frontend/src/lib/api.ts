import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface UserCreate {
  Name: string;
  Email: string;
  Password: string;
  Role_Type: 'Host' | 'Anchor' | 'User';
}

export interface UserLogin {
  Email: string;
  Password: string;
}

export interface LoginResponse {
  message: string;
  user_id: number;
  role: 'Host' | 'Anchor' | 'User';
}

export const register = (data: UserCreate) =>
  api.post('/register', data).then((r) => r.data);

export const login = (data: UserLogin): Promise<LoginResponse> =>
  api.post('/login', data).then((r) => r.data);

// ─── Host ────────────────────────────────────────────────────────────────────

export interface CreateEvent {
  Event_Title: string;
  Description: string;
  Event_Date: string; // ISO datetime string
  Location: string;
}

export interface UpdateEvent {
  Event_Title?: string;
  Description?: string;
  Event_Date?: string;
  Location?: string;
}

export const getHostDashboard = (host_id: number) =>
  api.get(`/host/${host_id}/dashboard`).then((r) => r.data);

export const createEvent = (host_id: number, data: CreateEvent) =>
  api.post(`/host/${host_id}/create-event`, data).then((r) => r.data);

export const hireAnchor = (host_id: number, application_id: number) =>
  api.put(`/host/${host_id}/hire/${application_id}`).then((r) => r.data);

export const updateEvent = (host_id: number, event_id: number, data: UpdateEvent) =>
  api.put(`/host/${host_id}/update-event/${event_id}`, data).then((r) => r.data);

export const deleteEvent = (host_id: number, event_id: number) =>
  api.delete(`/host/${host_id}/delete-event/${event_id}`).then((r) => r.data);

// ─── Anchor ──────────────────────────────────────────────────────────────────

export interface AnchorProfileUpdate {
  Specialization: string;
  Past_Work_Links: string;
  Base_Fee: number;
  Languages_Spoken: string;
  Average_Rating: number;
}

export const getAnchorDashboard = (user_id: number) =>
  api.get(`/anchor/${user_id}/dashboard`).then((r) => r.data);

export const updateAnchorProfile = (user_id: number, data: AnchorProfileUpdate) =>
  api.put(`/anchor/${user_id}/update-profile`, data).then((r) => r.data);

export const applyForEvent = (user_id: number, event_id: number) =>
  api.post(`/anchor/${user_id}/apply/${event_id}`).then((r) => r.data);

// ─── User / Common ───────────────────────────────────────────────────────────

export const getEventsFeed = (user_id: number) =>
  api.get(`/events/feed/${user_id}`).then((r) => r.data);

export const bookTicket = (user_id: number, event_id: number) =>
  api.post(`/user/${user_id}/book/${event_id}`).then((r) => r.data);

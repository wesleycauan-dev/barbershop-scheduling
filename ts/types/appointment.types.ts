export type Period = "morning" | "afternoon" | "evening";

export interface Service {
  id: string;
  name: string;
  price: number;
}

export interface TimeSlot {
  time: string;
  period: Period;
  booked: boolean;
}

export interface Appointment {
  id: string;
  clientName: string;
  serviceId: string;
  date: string;
  time: string;
  createdAt: string;
}

export interface NewAppointmentInput {
  clientName: string;
  serviceId: string;
  date: string;
  time: string;
}

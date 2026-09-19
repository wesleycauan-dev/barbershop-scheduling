import {
  Appointment,
  NewAppointmentInput,
} from "../types/appointment.types.js";

const STORAGE_KEY = "barbershop:appointments";

function generateId(): string {
  return `appt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export class AppointmentService {
  static getAll(): Appointment[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    try {
      return JSON.parse(raw) as Appointment[];
    } catch {
      return [];
    }
  }

  static getByDate(date: string): Appointment[] {
    return this.getAll()
      .filter((appointment) => appointment.date === date)
      .sort((a, b) => a.time.localeCompare(b.time));
  }

  static isSlotBooked(date: string, time: string): boolean {
    return this.getAll().some(
      (appointment) => appointment.date === date && appointment.time === time,
    );
  }

  static create(input: NewAppointmentInput): Appointment {
    const appointment: Appointment = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      ...input,
    };

    const all = this.getAll();
    all.push(appointment);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

    return appointment;
  }

  static cancel(id: string): void {
    const remaining = this.getAll().filter(
      (appointment) => appointment.id !== id,
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
  }
}

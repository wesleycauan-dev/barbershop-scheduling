import { Appointment, Period, TimeSlot } from "../types/appointment.types.js";

const OPENING_HOUR = 9;
const CLOSING_HOUR = 21;

function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, "0")}:00`;
}

function getPeriodForHour(hour: number): Period {
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

export class BusinessHours {
  static generateDailySlots(
    date: string,
    existingAppointments: Appointment[],
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];

    for (let hour = OPENING_HOUR; hour < CLOSING_HOUR; hour++) {
      const time = formatHour(hour);
      const isBooked = existingAppointments.some(
        (appointment) => appointment.date === date && appointment.time === time,
      );

      slots.push({
        time,
        period: getPeriodForHour(hour),
        booked: isBooked,
      });
    }

    return slots;
  }

  static groupByPeriod(slots: TimeSlot[]): Record<Period, TimeSlot[]> {
    return {
      morning: slots.filter((slot) => slot.period === "morning"),
      afternoon: slots.filter((slot) => slot.period === "afternoon"),
      evening: slots.filter((slot) => slot.period === "evening"),
    };
  }
}

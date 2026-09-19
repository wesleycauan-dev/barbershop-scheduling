import { ServiceCatalog } from "./services/serviceCatalog.js";
import { AppointmentService } from "./services/appointmentService.js";
import { BusinessHours } from "./hours/businessHours.js";
import {
  validateClientName,
  validateServiceSelected,
  validateDateSelected,
  validateTimeSelected,
} from "./utils/validation.js";
import { Period, TimeSlot } from "./types/appointment.types.js";

let selectedTime: string | null = null;

const clientNameInput = document.getElementById(
  "clientNameInput",
) as HTMLInputElement;
const serviceSelect = document.getElementById(
  "serviceSelect",
) as HTMLSelectElement;
const dateInput = document.getElementById("dateInput") as HTMLInputElement;
const bookingForm = document.getElementById("bookingForm") as HTMLFormElement;
const appointmentsList = document.getElementById(
  "appointmentsList",
) as HTMLDivElement;
const selectedDateLabel = document.getElementById(
  "selectedDateLabel",
) as HTMLSpanElement;

const periodContainers: Record<Period, HTMLDivElement> = {
  morning: document.getElementById("morningSlots") as HTMLDivElement,
  afternoon: document.getElementById("afternoonSlots") as HTMLDivElement,
  evening: document.getElementById("eveningSlots") as HTMLDivElement,
};

function populateServiceSelect(): void {
  ServiceCatalog.getAll().forEach((service) => {
    const option = document.createElement("option");
    option.value = service.id;
    option.textContent = `${service.name} - $${service.price}`;
    serviceSelect.appendChild(option);
  });
}

function setupDateInput(): void {
  const today = new Date().toISOString().split("T")[0];
  dateInput.min = today;
  dateInput.value = today;

  dateInput.addEventListener("change", () => {
    selectedTime = null;
    renderTimeSlots();
    renderAppointmentsForSelectedDate();
  });
}

function renderTimeSlots(): void {
  const date = dateInput.value;

  (Object.keys(periodContainers) as Period[]).forEach((period) => {
    periodContainers[period].innerHTML = "";
  });

  if (!date) return;

  const existingAppointments = AppointmentService.getAll();
  const slots = BusinessHours.generateDailySlots(date, existingAppointments);
  const groupedSlots = BusinessHours.groupByPeriod(slots);

  (Object.keys(groupedSlots) as Period[]).forEach((period) => {
    groupedSlots[period].forEach((slot) => renderSingleSlot(period, slot));
  });
}

function renderSingleSlot(period: Period, slot: TimeSlot): void {
  const container = periodContainers[period];

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = slot.time;
  button.className = "time-slot";

  if (slot.booked) {
    button.classList.add("time-slot--booked");
    button.disabled = true;
    button.title = "This time is already booked";
  } else {
    button.addEventListener("click", () =>
      selectTimeSlot(slot.time, container),
    );
  }

  if (slot.time === selectedTime) {
    button.classList.add("time-slot--selected");
  }

  container.appendChild(button);
}

function selectTimeSlot(time: string, container: HTMLDivElement): void {
  selectedTime = time;

  document
    .querySelectorAll(".time-slot")
    .forEach((el) => el.classList.remove("time-slot--selected"));

  const clickedButton = Array.from(container.children).find(
    (el) => el.textContent === time,
  ) as HTMLButtonElement | undefined;

  clickedButton?.classList.add("time-slot--selected");
}

function renderAppointmentsForSelectedDate(): void {
  const date = dateInput.value;
  selectedDateLabel.textContent = date ? formatDateForDisplay(date) : "";

  appointmentsList.innerHTML = "";

  const appointments = AppointmentService.getByDate(date);

  if (appointments.length === 0) {
    appointmentsList.innerHTML = `<p class="hint-text">No appointments booked for this date yet.</p>`;
    return;
  }

  appointments.forEach((appointment) => {
    const service = ServiceCatalog.getById(appointment.serviceId);

    const card = document.createElement("div");
    card.className = "appointment-card";
    card.innerHTML = `
      <div class="appointment-card__info">
        <strong>${appointment.time}</strong>
        <span>${appointment.clientName}</span>
        <span class="appointment-card__service">${service ? service.name : "Service"}</span>
      </div>
    `;

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "cancel-button";
    cancelButton.textContent = "Cancel";
    cancelButton.addEventListener("click", () => {
      AppointmentService.cancel(appointment.id);
      renderTimeSlots();
      renderAppointmentsForSelectedDate();
    });

    card.appendChild(cancelButton);
    appointmentsList.appendChild(card);
  });
}

function formatDateForDisplay(date: string): string {
  const parsedDate = new Date(`${date}T12:00:00`);
  return parsedDate.toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function setupBookingForm(): void {
  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const nameCheck = validateClientName(clientNameInput.value);
    const serviceCheck = validateServiceSelected(serviceSelect.value);
    const dateCheck = validateDateSelected(dateInput.value);
    const timeCheck = validateTimeSelected(selectedTime);

    const firstError = [nameCheck, serviceCheck, dateCheck, timeCheck].find(
      (result) => !result.valid,
    );
    if (firstError) {
      alert(firstError.message);
      return;
    }

    AppointmentService.create({
      clientName: clientNameInput.value.trim(),
      serviceId: serviceSelect.value,
      date: dateInput.value,
      time: selectedTime as string,
    });

    alert("Appointment booked successfully! ✂️");

    bookingForm.reset();
    selectedTime = null;
    dateInput.value = new Date().toISOString().split("T")[0];

    renderTimeSlots();
    renderAppointmentsForSelectedDate();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  populateServiceSelect();
  setupDateInput();
  setupBookingForm();
  renderTimeSlots();
  renderAppointmentsForSelectedDate();
});

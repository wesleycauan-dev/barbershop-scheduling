
class ServiceCatalog {
    static getAll() {
        return this.services;
    }
    static getById(id) {
        return this.services.find((service) => service.id === id);
    }
}
ServiceCatalog.services = [
    { id: "haircut", name: "Haircut", price: 40 },
    { id: "beard", name: "Beard Trim", price: 30 },
    { id: "haircut-beard", name: "Haircut + Beard", price: 60 },
    { id: "eyebrows", name: "Eyebrow Design", price: 15 },
];
const STORAGE_KEY = "barbershop:appointments";
function generateId() {
    return `appt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
class AppointmentService {
    static getAll() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return [];
        try {
            return JSON.parse(raw);
        }
        catch {
            return [];
        }
    }
    static getByDate(date) {
        return this.getAll()
            .filter((appointment) => appointment.date === date)
            .sort((a, b) => a.time.localeCompare(b.time));
    }
    static isSlotBooked(date, time) {
        return this.getAll().some((appointment) => appointment.date === date && appointment.time === time);
    }
    static create(input) {
        const appointment = {
            id: generateId(),
            createdAt: new Date().toISOString(),
            ...input,
        };
        const all = this.getAll();
        all.push(appointment);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        return appointment;
    }
    static cancel(id) {
        const remaining = this.getAll().filter((appointment) => appointment.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
    }
}
const OPENING_HOUR = 9;
const CLOSING_HOUR = 21;
function formatHour(hour) {
    return `${hour.toString().padStart(2, "0")}:00`;
}
function getPeriodForHour(hour) {
    if (hour < 12)
        return "morning";
    if (hour < 18)
        return "afternoon";
    return "evening";
}
class BusinessHours {
    static generateDailySlots(date, existingAppointments) {
        const slots = [];
        for (let hour = OPENING_HOUR; hour < CLOSING_HOUR; hour++) {
            const time = formatHour(hour);
            const isBooked = existingAppointments.some((appointment) => appointment.date === date && appointment.time === time);
            slots.push({
                time,
                period: getPeriodForHour(hour),
                booked: isBooked,
            });
        }
        return slots;
    }
    static groupByPeriod(slots) {
        return {
            morning: slots.filter((slot) => slot.period === "morning"),
            afternoon: slots.filter((slot) => slot.period === "afternoon"),
            evening: slots.filter((slot) => slot.period === "evening"),
        };
    }
}
function validateClientName(name) {
    if (name.trim().length < 3) {
        return {
            valid: false,
            message: "Please enter your full name (at least 3 letters).",
        };
    }
    return { valid: true };
}
function validateServiceSelected(serviceId) {
    if (!serviceId) {
        return { valid: false, message: "Please select a service." };
    }
    return { valid: true };
}
function validateDateSelected(date) {
    if (!date) {
        return { valid: false, message: "Please select a date." };
    }
    return { valid: true };
}
function validateTimeSelected(time) {
    if (!time) {
        return { valid: false, message: "Please choose a time slot." };
    }
    return { valid: true };
}
let selectedTime = null;
const clientNameInput = document.getElementById("clientNameInput");
const serviceSelect = document.getElementById("serviceSelect");
const dateInput = document.getElementById("dateInput");
const bookingForm = document.getElementById("bookingForm");
const appointmentsList = document.getElementById("appointmentsList");
const selectedDateLabel = document.getElementById("selectedDateLabel");
const periodContainers = {
    morning: document.getElementById("morningSlots"),
    afternoon: document.getElementById("afternoonSlots"),
    evening: document.getElementById("eveningSlots"),
};
function populateServiceSelect() {
    ServiceCatalog.getAll().forEach((service) => {
        const option = document.createElement("option");
        option.value = service.id;
        option.textContent = `${service.name} - $${service.price}`;
        serviceSelect.appendChild(option);
    });
}
function setupDateInput() {
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
    dateInput.value = today;
    dateInput.addEventListener("change", () => {
        selectedTime = null;
        renderTimeSlots();
        renderAppointmentsForSelectedDate();
    });
}
function renderTimeSlots() {
    const date = dateInput.value;
    Object.keys(periodContainers).forEach((period) => {
        periodContainers[period].innerHTML = "";
    });
    if (!date)
        return;
    const existingAppointments = AppointmentService.getAll();
    const slots = BusinessHours.generateDailySlots(date, existingAppointments);
    const groupedSlots = BusinessHours.groupByPeriod(slots);
    Object.keys(groupedSlots).forEach((period) => {
        groupedSlots[period].forEach((slot) => renderSingleSlot(period, slot));
    });
}
function renderSingleSlot(period, slot) {
    const container = periodContainers[period];
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = slot.time;
    button.className = "time-slot";
    if (slot.booked) {
        button.classList.add("time-slot--booked");
        button.disabled = true;
        button.title = "This time is already booked";
    }
    else {
        button.addEventListener("click", () => selectTimeSlot(slot.time, container));
    }
    if (slot.time === selectedTime) {
        button.classList.add("time-slot--selected");
    }
    container.appendChild(button);
}
function selectTimeSlot(time, container) {
    selectedTime = time;
    document
        .querySelectorAll(".time-slot")
        .forEach((el) => el.classList.remove("time-slot--selected"));
    const clickedButton = Array.from(container.children).find((el) => el.textContent === time);
    clickedButton?.classList.add("time-slot--selected");
}
function renderAppointmentsForSelectedDate() {
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
function formatDateForDisplay(date) {
    const parsedDate = new Date(`${date}T12:00:00`);
    return parsedDate.toLocaleDateString("en-US", {
        weekday: "long",
        day: "2-digit",
        month: "long",
    });
}
function setupBookingForm() {
    bookingForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const nameCheck = validateClientName(clientNameInput.value);
        const serviceCheck = validateServiceSelected(serviceSelect.value);
        const dateCheck = validateDateSelected(dateInput.value);
        const timeCheck = validateTimeSelected(selectedTime);
        const firstError = [nameCheck, serviceCheck, dateCheck, timeCheck].find((result) => !result.valid);
        if (firstError) {
            alert(firstError.message);
            return;
        }
        AppointmentService.create({
            clientName: clientNameInput.value.trim(),
            serviceId: serviceSelect.value,
            date: dateInput.value,
            time: selectedTime,
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
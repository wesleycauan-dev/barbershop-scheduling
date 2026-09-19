import { Service } from "../types/appointment.types.js";

export class ServiceCatalog {
  private static readonly services: Service[] = [
    { id: "haircut", name: "Haircut", price: 40 },
    { id: "beard", name: "Beard Trim", price: 30 },
    { id: "haircut-beard", name: "Haircut + Beard", price: 60 },
    { id: "eyebrows", name: "Eyebrow Design", price: 15 },
  ];

  static getAll(): Service[] {
    return this.services;
  }

  static getById(id: string): Service | undefined {
    return this.services.find((service) => service.id === id);
  }
}

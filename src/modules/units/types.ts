// src/modules/units/types.ts
export interface Unit {
  id?: string; // Se añade al obtener los datos desde Firebase
  name: string;
  symbol: string;
  conversionFactor: number;
  createdAt: Date;
  updatedAt: Date;
}

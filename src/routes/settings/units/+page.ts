import { getDocs } from 'firebase/firestore';
import { unitsCollection, initDefaultUnits } from '$modules/units/api';
import type { Unit } from '$modules/units/types';

export const load = async () => {
  // Creamos unidades por defecto si no existen
  await initDefaultUnits();

  // Obtenemos las unidades actualizadas
  const snapshot = await getDocs(unitsCollection);

  const units: Unit[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  })) as Unit[];

  units.sort((a, b) => a.name.localeCompare(b.name));

  return { units };

};

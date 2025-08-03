import { Timestamp } from 'firebase/firestore';

export interface Diner {
	id: string;
	name: string;
	caloriesObjective?: number;
	proteinsObjective?: number;
	carbsObjective?: number;
	fatObjective?: number;
	totalMacros?: number;
	allergies?: {
		foods: string[];
		categories: string[];
	};
	createdAt: Timestamp;
	updatedAt: Timestamp;
}

import type { Timestamp } from 'firebase/firestore';

export interface Category {
	id: string;
	name: string;
	icon: string;      // emoji o texto
	color: string;     // código HEX
	createdAt: Timestamp;
	updatedAt: Timestamp;
}

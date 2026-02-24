import { db } from './firebase';
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';

export interface TrainingResult {
    id?: string;
    userId: string;
    type: string;
    score: number;
    total: number;
    date: Timestamp;
}

/**
 * Saves a training result to Firestore 'results' collection.
 */
export const saveTrainingResult = async (
    userId: string,
    type: string,
    score: number,
    total: number
) => {
    try {
        const docRef = await addDoc(collection(db, 'results'), {
            userId,
            type,
            score,
            total,
            date: serverTimestamp()
        });
        console.log("Training result saved with ID: ", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error saving training result: ", error);
        throw error;
    }
};

/**
 * Fetches training results for a specific user from 'results' collection.
 */
export const getTrainingResults = async (userId: string): Promise<TrainingResult[]> => {
    try {
        const q = query(
            collection(db, 'results'),
            where('userId', '==', userId)
        );

        const querySnapshot = await getDocs(q);
        const results: TrainingResult[] = [];

        querySnapshot.forEach((doc) => {
            results.push({ id: doc.id, ...doc.data() } as TrainingResult);
        });

        // Client-side sorting as composite index might be missing
        return results.sort((a, b) => {
            const dateA = a.date?.seconds || 0;
            const dateB = b.date?.seconds || 0;
            return dateB - dateA;
        });
    } catch (error) {
        console.error("Error fetching training results: ", error);
        throw error;
    }
};

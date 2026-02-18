import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Custom Hook to fetch and listen to Firestore document changes
 * @param {string} collection - Collection name (e.g., 'content')
 * @param {string} docId - Document ID (e.g., 'home')
 * @param {object} defaultData - Default data structure if document doesn't exist
 */
export function useFirestoreDoc(collection, docId, defaultData = {}) {
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const docRef = doc(db, collection, docId);

    // Real-time listener
    const unsubscribe = onSnapshot(
      docRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          setData(docSnap.data());
        } else {
          // If document doesn't exist, create it with default data
          try {
            await setDoc(docRef, defaultData);
            setData(defaultData);
          } catch (err) {
            console.error('Error creating document:', err);
            setError(err);
          }
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching document:', err);
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [collection, docId]);

  return { data, loading, error };
}

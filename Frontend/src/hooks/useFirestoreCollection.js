import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

export function useFirestoreCollection(collectionName, constraints = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log(`Fetching ${collectionName}...`);
        const collectionRef = collection(db, collectionName);
        
        let q = collectionRef;
        if (constraints.length > 0) {
          q = query(collectionRef, ...constraints);
        }

        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log(`${collectionName} fetched:`, items.length, 'items');
        setData(items);
        setError(null);
      } catch (err) {
        console.error(`Error fetching ${collectionName}:`, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName, JSON.stringify(constraints)]);

  return { data, loading, error };
}

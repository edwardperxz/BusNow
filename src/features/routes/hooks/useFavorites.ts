import { useCallback, useEffect, useState } from 'react';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../../../services/firebaseApp';

export interface FavoriteRoute {
  id: string;
  routeId: string;
  routeName: string;
  addedAt: number;
}

export function useFavorites(uid: string | null) {
  const [favorites, setFavorites] = useState<FavoriteRoute[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!uid) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    const q = query(collection(db, 'users', uid, 'favorites'));
    const unsub = onSnapshot(q, (snap) => {
      const items: FavoriteRoute[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<FavoriteRoute, 'id'>),
      }));
      items.sort((a, b) => b.addedAt - a.addedAt);
      setFavorites(items);
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  const addFavorite = useCallback(
    async (routeId: string, routeName: string) => {
      if (!uid) return;
      await addDoc(collection(db, 'users', uid, 'favorites'), {
        routeId,
        routeName,
        addedAt: Date.now(),
      });
    },
    [uid]
  );

  const removeFavorite = useCallback(
    async (favoriteId: string) => {
      if (!uid) return;
      await deleteDoc(doc(db, 'users', uid, 'favorites', favoriteId));
    },
    [uid]
  );

  const isFavorite = useCallback(
    (routeId: string) => favorites.some((f) => f.routeId === routeId),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (routeId: string, routeName: string) => {
      const existing = favorites.find((f) => f.routeId === routeId);
      if (existing) {
        await removeFavorite(existing.id);
      } else {
        await addFavorite(routeId, routeName);
      }
    },
    [favorites, addFavorite, removeFavorite]
  );

  return { favorites, loading, addFavorite, removeFavorite, isFavorite, toggleFavorite };
}

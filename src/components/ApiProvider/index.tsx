import {getPersistedQueryStorage, storage} from 'src/utils';
import {
  Persister,
  PersistQueryClientProvider,
} from '@tanstack/react-query-persist-client';
import {QueryClient} from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: Infinity,
      refetchOnReconnect: 'always',
      retry: 3,
      suspense: false,
    },
  },
});

const createNativePersister = (key: string): Persister => {
  const store = getPersistedQueryStorage(storage);

  return {
    persistClient: persistClient => store.setItem(key, persistClient),
    removeClient: () => store.removeItem(key),
    restoreClient: () => store.getItem(key),
  };
};

export function ApiProvider({children}: {children: React.ReactNode}) {
  const persister = createNativePersister('PERSIST_NATIVE');

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{persister}}>
      {children}
    </PersistQueryClientProvider>
  );
}

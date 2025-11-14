import React, { createContext, useContext, useState, ReactNode } from 'react';

type SearchState = 'hidden' | 'neutral' | 'expanded';

interface SearchContextType {
  searchState: SearchState;
  setSearchState: (state: SearchState) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchState, setSearchState] = useState<SearchState>('neutral');

  return (
    <SearchContext.Provider value={{ searchState, setSearchState }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
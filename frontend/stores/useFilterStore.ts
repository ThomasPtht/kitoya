import { create } from "zustand";

interface FilterState {
  search: string;
  selectedClubs: string[];
  selectedSeasons: string[];
  selectedKitTypes: string[];
  setSearch: (search: string) => void;
  toggleClub: (club: string) => void;
  toggleSeason: (season: string) => void;
  toggleKitType: (kitType: string) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  search: "",
  selectedClubs: [],
  selectedSeasons: [],
  selectedKitTypes: [],

  setSearch: (search) => set({ search }),

  toggleClub: (club) =>
    set((state) => ({
      selectedClubs: state.selectedClubs.includes(club)
        ? state.selectedClubs.filter((c) => c !== club)
        : [...state.selectedClubs, club],
    })),

  toggleSeason: (season) =>
    set((state) => ({
      selectedSeasons: state.selectedSeasons?.includes(season)
        ? state.selectedSeasons.filter((s) => s !== season)
        : [...(state.selectedSeasons || []), season],
    })),

  toggleKitType: (kitType) =>
    set((state) => ({
      selectedKitTypes: state.selectedKitTypes?.includes(kitType)
        ? state.selectedKitTypes.filter((k) => k !== kitType)
        : [...(state.selectedKitTypes || []), kitType],
    })),

  resetFilters: () =>
    set({
      search: "",
      selectedClubs: [],
      selectedSeasons: [],
      selectedKitTypes: [],
    }),
}));

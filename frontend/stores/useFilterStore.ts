import { create } from "zustand";

interface FilterState {
  search: string;
  selectedClubs: string[];
  selectedSeasons: string[];
  selectedKitTypes: string[];
  selectedVersions: string[];
  selectedConditions: string[];
  selectedBrands: string[];
  setSearch: (search: string) => void;
  toggleClub: (club: string) => void;
  toggleSeason: (season: string) => void;
  toggleKitType: (kitType: string) => void;
  toggleVersion: (version: string) => void;
  toggleCondition: (condition: string) => void;
  toggleBrand: (brand: string) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  search: "",
  selectedClubs: [],
  selectedSeasons: [],
  selectedKitTypes: [],
  selectedVersions: [],
  selectedConditions: [],
  selectedBrands: [],

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

  toggleVersion: (version) =>
    set((state) => ({
      selectedVersions: state.selectedVersions?.includes(version)
        ? state.selectedVersions.filter((v) => v !== version)
        : [...(state.selectedVersions || []), version],
    })),

  toggleCondition: (condition) =>
    set((state) => ({
      selectedConditions: state.selectedConditions?.includes(condition)
        ? state.selectedConditions.filter((v) => v !== condition)
        : [...(state.selectedConditions || []), condition],
    })),

  toggleBrand: (brand) =>
    set((state) => ({
      selectedBrands: state.selectedBrands?.includes(brand)
        ? state.selectedBrands.filter((v) => v !== brand)
        : [...(state.selectedBrands || []), brand],
    })),

  resetFilters: () =>
    set({
      search: "",
      selectedClubs: [],
      selectedSeasons: [],
      selectedKitTypes: [],
      selectedVersions: [],
      selectedConditions: [],
      selectedBrands: [],
    }),
}));

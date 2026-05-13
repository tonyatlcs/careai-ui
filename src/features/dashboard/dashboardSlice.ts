import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface DashboardState {
  sidebarOpen: boolean;
  activeSection: string;
}

const initialState: DashboardState = {
  sidebarOpen: true,
  activeSection: "overview",
};

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setActiveSection: (state, action: PayloadAction<string>) => {
      state.activeSection = action.payload;
    },
  },
});

export const { setActiveSection, setSidebarOpen } = dashboardSlice.actions;
export const dashboardReducer = dashboardSlice.reducer;

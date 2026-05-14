import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface DashboardState {
  sidebarOpen: boolean;
  activeSection: string;
  fileCount: number;
}

const initialState: DashboardState = {
  sidebarOpen: true,
  activeSection: "overview",
  fileCount: 0,
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
    setFileCount: (state, action: PayloadAction<number>) => {
      state.fileCount = action.payload;
    },
  },
});

export const { setActiveSection, setFileCount, setSidebarOpen } =
  dashboardSlice.actions;
export const dashboardReducer = dashboardSlice.reducer;

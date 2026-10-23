import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TBulkImportProduct } from "@/types";

export type TBulkImportStatus =
  | "pending"
  | "creating"
  | "created"
  | "restored"
  | "error"
  | "cancelled";

export type TBulkImportItem = {
  id: string;
  payload: TBulkImportProduct;
  status: TBulkImportStatus;
  error?: string;
};

type TBulkImportState = {
  items: TBulkImportItem[];
  isRunning: boolean;
  isOpen: boolean;
  isMinimized: boolean;
};

const initialState: TBulkImportState = {
  items: [],
  isRunning: false,
  isOpen: false,
  isMinimized: false,
};

const setStatus = (
  state: TBulkImportState,
  id: string,
  status: TBulkImportStatus,
  error?: string,
) => {
  const item = state.items.find((i) => i.id === id);
  if (item) {
    item.status = status;
    item.error = error;
  }
};

export const bulkImportSlice = createSlice({
  name: "bulkImport",
  initialState,
  reducers: {
    importQueued: (state, action: PayloadAction<TBulkImportItem[]>) => {
      // Drop finished items from a previous run, keep the new queue
      state.items = action.payload;
      state.isRunning = true;
      state.isOpen = true;
      state.isMinimized = false;
    },
    itemsRequeued: (state, action: PayloadAction<string[]>) => {
      const ids = new Set(action.payload);
      state.items.forEach((item) => {
        if (ids.has(item.id)) {
          item.status = "pending";
          item.error = undefined;
        }
      });
      state.isRunning = true;
    },
    itemStarted: (state, action: PayloadAction<string>) => {
      setStatus(state, action.payload, "creating");
    },
    itemSucceeded: (
      state,
      action: PayloadAction<{ id: string; restored: boolean }>,
    ) => {
      setStatus(
        state,
        action.payload.id,
        action.payload.restored ? "restored" : "created",
      );
    },
    itemFailed: (state, action: PayloadAction<{ id: string; error: string }>) => {
      setStatus(state, action.payload.id, "error", action.payload.error);
    },
    remainingCancelled: (state) => {
      state.items.forEach((item) => {
        if (item.status === "pending") item.status = "cancelled";
      });
    },
    importFinished: (state) => {
      state.isRunning = false;
    },
    panelMinimizedToggled: (state) => {
      state.isMinimized = !state.isMinimized;
    },
    panelClosed: (state) => {
      if (state.isRunning) return;
      state.isOpen = false;
      state.items = [];
    },
  },
});

export const {
  importQueued,
  itemsRequeued,
  itemStarted,
  itemSucceeded,
  itemFailed,
  remainingCancelled,
  importFinished,
  panelMinimizedToggled,
  panelClosed,
} = bulkImportSlice.actions;

export default bulkImportSlice.reducer;

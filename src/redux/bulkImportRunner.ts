/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "sonner";
import { TBulkImportProduct } from "@/types";
import { baseApi } from "./api/baseApi";
import { productApi } from "./api/productApi";
import {
  importFinished,
  importQueued,
  itemFailed,
  itemsRequeued,
  itemStarted,
  itemSucceeded,
  remainingCancelled,
} from "./bulkImportSlice";
import type { AppDispatch, RootState } from "./store";

// Refresh product lists every N successful rows so the table fills in while importing
const REFRESH_EVERY = 25;

let cancelRequested = false;

export const cancelBulkImport = () => {
  cancelRequested = true;
};

const getErrorMessage = (error: any): string => {
  const message = error?.data?.message;
  if (message) return message;
  if (error?.status === "FETCH_ERROR") return "Network error: could not reach the server";
  if (error?.error) return String(error.error);
  return "Something went wrong";
};

const refreshProducts = (dispatch: AppDispatch) => {
  dispatch(baseApi.util.invalidateTags(["Product", "ActivityLog"]));
};

// Creates the queued rows one by one in the background
const processQueue =
  (ids: string[]) => async (dispatch: AppDispatch, getState: () => RootState) => {
    cancelRequested = false;
    let successSinceRefresh = 0;

    for (const id of ids) {
      if (cancelRequested) {
        dispatch(remainingCancelled());
        break;
      }

      const item = getState().bulkImport.items.find((i) => i.id === id);
      if (!item || item.status !== "pending") continue;

      dispatch(itemStarted(id));
      const request = dispatch(
        productApi.endpoints.importProduct.initiate(item.payload),
      );

      try {
        const res = await request.unwrap();
        dispatch(itemSucceeded({ id, restored: Boolean(res.data?.restored) }));
        successSinceRefresh += 1;
        if (successSinceRefresh >= REFRESH_EVERY) {
          refreshProducts(dispatch);
          successSinceRefresh = 0;
        }
      } catch (error) {
        dispatch(itemFailed({ id, error: getErrorMessage(error) }));
      } finally {
        // Drop the mutation entry so 1000 rows don't pile up in the api cache
        request.reset();
      }
    }

    refreshProducts(dispatch);
    dispatch(importFinished());

    const items = getState().bulkImport.items;
    const succeeded = items.filter(
      (i) => i.status === "created" || i.status === "restored",
    ).length;
    const failed = items.filter((i) => i.status === "error").length;

    if (failed > 0) {
      toast.warning(
        `Import finished: ${succeeded} succeeded, ${failed} failed. See the import panel for details.`,
      );
    } else if (succeeded > 0) {
      toast.success(`Import finished: ${succeeded} product(s) added.`);
    }
  };

export const startBulkImport =
  (products: TBulkImportProduct[]) =>
  (dispatch: AppDispatch, getState: () => RootState): boolean => {
    if (getState().bulkImport.isRunning) {
      toast.error("An import is already running. Please wait for it to finish.");
      return false;
    }

    const batchId = Date.now().toString(36);
    const items = products.map((payload, index) => ({
      id: `${batchId}-${index}`,
      payload,
      status: "pending" as const,
    }));

    dispatch(importQueued(items));
    dispatch(processQueue(items.map((i) => i.id)));
    return true;
  };

export const retryFailedImports =
  () => (dispatch: AppDispatch, getState: () => RootState) => {
    const { items, isRunning } = getState().bulkImport;
    if (isRunning) return;

    const ids = items
      .filter((i) => i.status === "error" || i.status === "cancelled")
      .map((i) => i.id);
    if (ids.length === 0) return;

    dispatch(itemsRequeued(ids));
    dispatch(processQueue(ids));
  };

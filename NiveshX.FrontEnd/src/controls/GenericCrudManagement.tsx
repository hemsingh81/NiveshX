import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Typography,
  TextField,
  InputAdornment,
  Paper,
  Chip,
  useTheme,
  Divider,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { MdAdd, MdSearch, MdClear } from "react-icons/md";

export type RowWithId = { id: string };

export type GenericCrudProps<T extends RowWithId, CreateReq, UpdateReq> = {
  title: string;
  fetchAll: () => Promise<T[]>;
  createItem: (req: CreateReq) => Promise<any>;
  updateItem: (id: string, req: UpdateReq) => Promise<any>;
  deleteItem: (id: string) => Promise<any>;
  columns: GridColDef<T>[];
  rowFilterFields?: (keyof T)[];
  formDialogRenderer: (props: {
    open: boolean;
    mode: "add" | "edit";
    item?: T | undefined;
    onClose: () => void;
    onSubmit: (data: CreateReq | UpdateReq) => Promise<void>;
  }) => React.ReactNode;
  emptyLabel?: string;
  pageSize?: number;
  /**
   * Optional helper to render the actions column. The parent can provide a column that will
   * receive onEdit/onDelete handlers from the GenericCrud internals so the Edit button opens
   * the generic dialog and Delete triggers the generic delete+refresh flow.
   */
  actionsRenderer?: (h: {
    onEdit: (row: T) => void;
    onDelete: (id: string) => Promise<void>;
  }) => GridColDef<T>;
};

export default function GenericCrudManagement<
  T extends RowWithId,
  CreateReq = unknown,
  UpdateReq = unknown
>(props: GenericCrudProps<T, CreateReq, UpdateReq>) {
  const {
    title,
    fetchAll,
    createItem,
    updateItem,
    deleteItem,
    columns,
    rowFilterFields,
    formDialogRenderer,
    emptyLabel = "No rows found",
    pageSize = 10,
    actionsRenderer,
  } = props;

  const theme = useTheme();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<T | undefined>(undefined);
  const [mode, setMode] = useState<"add" | "edit">("add");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(
    search.trim().toLowerCase()
  );
  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedSearch(search.trim().toLowerCase()),
      250
    );
    return () => clearTimeout(t);
  }, [search]);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAll();
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, [fetchAll]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleAdd = useCallback(() => {
    setMode("add");
    setEditItem(undefined);
    setDialogOpen(true);
  }, []);

  const handleEditRequest = useCallback((item: T) => {
    setMode("edit");
    setEditItem(item);
    setDialogOpen(true);
  }, []);

  const handleDeleteRequest = useCallback(
    async (id: string) => {
      try {
        await deleteItem(id);
        await fetch();
      } catch {
        // toasts/errors handled by service layer
      }
    },
    [deleteItem, fetch]
  );

  const handleSubmit = useCallback(
    async (data: CreateReq | UpdateReq): Promise<void> => {
      try {
        if (mode === "add") {
          await createItem(data as CreateReq);
        } else if (editItem) {
          await updateItem(editItem.id, data as UpdateReq);
        }
        await fetch();
        setDialogOpen(false);
      } catch (err) {
        throw err;
      }
    },
    [mode, editItem, createItem, updateItem, fetch]
  );

  // Build columns: start from consumer columns then append actions column (if actionsRenderer provided)
  const builtColumns = useMemo(() => {
    const base = columns.map((c) => ({ ...c })) as GridColDef<T>[];
    if (actionsRenderer) {
      base.push(
        actionsRenderer({
          onEdit: handleEditRequest,
          onDelete: handleDeleteRequest,
        })
      );
    }
    return base;
  }, [columns, actionsRenderer, handleEditRequest, handleDeleteRequest]);

  const filteredRows = useMemo(() => {
    if (!debouncedSearch) return items;
    const q = debouncedSearch;
    const fields =
      rowFilterFields ?? (Object.keys(items[0] ?? {}) as (keyof T)[]);
    return items.filter((it) =>
      fields.some((f) => {
        const v = (it as any)[f];
        if (v == null) return false;
        return String(v).toLowerCase().includes(q);
      })
    );
  }, [items, debouncedSearch, rowFilterFields]);

  // When there are no rows we still render the grid with a minHeight (so headers remain visible).
  // We hide the footer/pagination when there are no rows for a cleaner empty state.
  const gridMinHeight = 320;

  return (
    <>
      <Box mb={2} display="flex" alignItems="center" gap={2}>
        <Typography variant="h5" fontWeight={700}>
          {title}
        </Typography>
        <Box flex={1} />
      </Box>
      <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <TextField
            size="small"
            variant="outlined"
            placeholder={`Search ${title}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MdSearch />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Clear search"
                    onClick={() => setSearch("")}
                    size="small"
                    edge="end"
                  >
                    <MdClear />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
              "aria-label": `Search ${title}`,
            }}
            sx={{
              width: { xs: "100%", sm: 520 },
              backgroundColor: theme.palette.background.paper,
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`,
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              px: 0.25,
            }}
          />

          <Box flex={1} />

          <Chip
            aria-label={`Showing ${filteredRows.length} of ${items.length}`}
            label={`${filteredRows.length} / ${items.length}`}
            variant="outlined"
            size="small"
          />

          <Button
            variant="contained"
            startIcon={<MdAdd />}
            onClick={handleAdd}
            sx={{ borderRadius: 2, textTransform: "none", ml: 1 }}
            aria-label={`Add ${title}`}
          >
            Add
          </Button>
        </Box>
        <Divider />
        <Box>
          <DataGrid
            rows={filteredRows}
            columns={builtColumns}
            loading={loading}
            // keep autoHeight off so the grid keeps its header even with zero rows
            autoHeight={true}
            disableRowSelectionOnClick
            getRowId={(row: any) => row.id}
            pageSizeOptions={[5, 10, 25]}
            hideFooter={filteredRows.length === 0}
            initialState={{
              pagination: { paginationModel: { pageSize, page: 0 } },
            }}
            sx={{
              minHeight: gridMinHeight,
              "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700 },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor:
                  theme.palette.mode === "light"
                    ? "rgba(208,222,241,0.6)"
                    : undefined,
              },
              "& .MuiDataGrid-row:nth-of-type(odd)": {
                backgroundColor:
                  theme.palette.mode === "light"
                    ? "rgba(245,248,252,0.6)"
                    : undefined,
              },
              "& .MuiDataGrid-cell": {
                borderBottom: `1px solid ${theme.palette.divider}`,
              },
            }}
          />
        </Box>

        {formDialogRenderer({
          open: dialogOpen,
          mode,
          item: editItem,
          onClose: () => setDialogOpen(false),
          onSubmit: handleSubmit,
        })}
      </Paper>
    </>
  );
}

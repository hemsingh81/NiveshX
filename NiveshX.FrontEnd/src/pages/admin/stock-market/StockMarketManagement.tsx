// src/pages/admin/stock-market/StockMarketManagement.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { MdAdd, MdEdit, MdDelete } from "react-icons/md";
import Layout from "../../../components/Layout";
import StockMarketFormDialog from "./StockMarketFormDialog";
import { ConfirmButton } from "../../../controls";
import {
  getAllStockMarkets,
  deleteStockMarket,
  StockMarketResponse,
  CreateStockMarketRequest,
  UpdateStockMarketRequest,
  createStockMarket,
  updateStockMarket,
} from "../../../services/stockMarketService";

const StockMarketManagement: React.FC = () => {
  const [items, setItems] = useState<StockMarketResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<StockMarketResponse | undefined>(undefined);
  const [mode, setMode] = useState<"add" | "edit">("add");

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllStockMarkets();
      setItems(data);
    } catch {
      // toasts shown by service
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleAdd = useCallback(() => {
    setMode("add");
    setEditItem(undefined);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((item: StockMarketResponse) => {
    setMode("edit");
    setEditItem(item);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteStockMarket(id);
        await fetch();
      } catch {
        // toasts shown by service
      }
    },
    [fetch]
  );

  const handleSubmit = useCallback(
    async (data: CreateStockMarketRequest | UpdateStockMarketRequest): Promise<void> => {
      try {
        if (mode === "add") {
          await createStockMarket(data as CreateStockMarketRequest);
        } else if (editItem) {
          await updateStockMarket(editItem.id, data as UpdateStockMarketRequest);
        }
        setDialogOpen(false);
        await fetch();
      } catch (err) {
        throw err;
      }
    },
    [mode, editItem, fetch]
  );

  // Use non-generic GridColDef and narrow any params to avoid MUI type incompatibilities
  const columns: GridColDef[] = useMemo(
    () => [
      { field: "name", headerName: "Name", flex: 1 },
      { field: "code", headerName: "Code", width: 160 },
      {
        field: "country",
        headerName: "Country",
        flex: 1,
        // params typing can be loose; we only access row
        valueGetter: (params: any) => params.row?.country?.name ?? "",
      },
      {
        field: "isActive",
        headerName: "Active",
        width: 100,
        renderCell: (params: any) => (params.value ? "Yes" : "No"),
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 160,
        align: "center",
        sortable: false,
        renderCell: (params: any) => (
          <>
            <IconButton aria-label={`Edit ${params.row.name}`} onClick={() => handleEdit(params.row)}>
              <MdEdit />
            </IconButton>
            <ConfirmButton
              icon={<MdDelete />}
              color="error"
              size="small"
              variant="text"
              dialogTitle="Delete Stock Market"
              dialogMessage={`Delete ${params.row.name}?`}
              confirmText="Delete"
              cancelText="Cancel"
              onConfirm={() => handleDelete(params.row.id)}
            />
          </>
        ),
      },
    ],
    [handleDelete, handleEdit]
  );

  return (
    <Layout>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" fontWeight="bold">
            Stock Markets
          </Typography>
          <Button variant="contained" startIcon={<MdAdd />} onClick={handleAdd} aria-label="Add stock market">
            Add Stock Market
          </Button>
        </Box>

        <DataGrid
          rows={items}
          columns={columns}
          loading={loading}
          autoHeight
          disableRowSelectionOnClick
          getRowId={(row: StockMarketResponse) => row.id}
          pageSizeOptions={[5, 10]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{
            "& .MuiDataGrid-columnHeaderTitle": { fontWeight: "bold" },
            "& .MuiDataGrid-columnHeaders": { backgroundColor: "rgb(208,222,241)" },
          }}
        />

        <StockMarketFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSubmit={handleSubmit} mode={mode} stockMarket={editItem} />
      </Box>
    </Layout>
  );
};

export default StockMarketManagement;

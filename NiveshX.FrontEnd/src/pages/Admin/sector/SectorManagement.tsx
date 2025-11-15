import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { MdAdd, MdEdit, MdDelete } from "react-icons/md";
import Layout from "../../../components/Layout";
import {
  getAllSectors,
  createSector,
  updateSector,
  deleteSector,
  SectorResponse,
  CreateSectorRequest,
  UpdateSectorRequest,
} from "../../../services";
import SectorFormDialog from "./SectorFormDialog";
import { ConfirmButton } from "../../../controls";

const SectorManagement: React.FC = () => {
  const [items, setItems] = useState<SectorResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<SectorResponse | undefined>(undefined);
  const [mode, setMode] = useState<"add" | "edit">("add");

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllSectors();
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

  const handleEdit = useCallback((item: SectorResponse) => {
    setMode("edit");
    setEditItem(item);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteSector(id);
        await fetch();
      } catch {
        // toasts shown by service
      }
    },
    [fetch]
  );

  const handleSubmit = useCallback(
    async (data: CreateSectorRequest | UpdateSectorRequest): Promise<void> => {
      try {
        if (mode === "add") {
          await createSector(data as CreateSectorRequest);
        } else if (editItem) {
          await updateSector(editItem.id, data as UpdateSectorRequest);
        }
        await fetch();
      } catch (err) {
        throw err;
      }
    },
    [mode, editItem, fetch]
  );

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "name", headerName: "Name", flex: 1 },
      { field: "description", headerName: "Description", flex: 1, minWidth: 240 },
      { field: "isActive", headerName: "Active", width: 100, renderCell: (p) => (p.value ? "Yes" : "No") },
      {
        field: "actions",
        headerName: "Actions",
        width: 140,
        align: "center",
        sortable: false,
        renderCell: (params) => (
          <>
            <IconButton onClick={() => handleEdit(params.row)}>
              <MdEdit />
            </IconButton>
            <ConfirmButton
              icon={<MdDelete />}
              color="error"
              size="small"
              variant="text"
              dialogTitle="Delete Sector"
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
            Sectors
          </Typography>
          <Button variant="contained" startIcon={<MdAdd />} onClick={handleAdd}>
            Add Sector
          </Button>
        </Box>

        <DataGrid
          rows={items}
          columns={columns}
          loading={loading}
          autoHeight
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
          pageSizeOptions={[5, 10]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{
            "& .MuiDataGrid-columnHeaderTitle": { fontWeight: "bold" },
            "& .MuiDataGrid-columnHeaders": { backgroundColor: "rgb(208,222,241)" },
          }}
        />

        <SectorFormDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
          mode={mode}
          sector={editItem}
        />
      </Box>
    </Layout>
  );
};

export default SectorManagement;

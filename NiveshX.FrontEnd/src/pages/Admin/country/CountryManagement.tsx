import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { MdAdd, MdEdit, MdDelete } from "react-icons/md";
import Layout from "../../../components/Layout";
import {
  getAllCountries,
  createCountry,
  updateCountry,
  deleteCountry,
  CountryResponse,
  CreateCountryRequest,
  UpdateCountryRequest,
} from "../../../services";
import CountryFormDialog from "./CountryFormDialog";
import { ConfirmButton } from "../../../controls";

const CountryManagement: React.FC = () => {
  const [countries, setCountries] = useState<CountryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCountry, setEditCountry] = useState<CountryResponse | undefined>(
    undefined
  );
  const [mode, setMode] = useState<"add" | "edit">("add");

  const fetchCountries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllCountries();
      setCountries(data);
    } catch (err) {
      // optional: handle error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  const handleAdd = useCallback(() => {
    setMode("add");
    setEditCountry(undefined);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((country: CountryResponse) => {
    setMode("edit");
    setEditCountry(country);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteCountry(id);
        await fetchCountries();
      } catch (err) {
        // optional
      }
    },
    [fetchCountries]
  );

  const handleSubmit = useCallback(
    async (
      data: CreateCountryRequest | UpdateCountryRequest
    ): Promise<void> => {
      try {
        if (mode === "add") {
          await createCountry(data as CreateCountryRequest);
        } else if (editCountry) {
          await updateCountry(editCountry.id, data as UpdateCountryRequest);
        }
        await fetchCountries();
      } catch (err) {
        // rethrow so dialog can show field errors
        throw err;
      }
    },
    [mode, editCountry, fetchCountries]
  );

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "name", headerName: "Name", flex: 1 },
      { field: "code", headerName: "Code", width: 150 },
      {
        field: "isActive",
        headerName: "Active",
        width: 100,
        renderCell: (p) => (p.value ? "Yes" : "No"),
      },
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
              dialogTitle="Delete Country"
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
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h5" fontWeight="bold">
            Countries
          </Typography>
          <Button variant="contained" startIcon={<MdAdd />} onClick={handleAdd}>
            Add Country
          </Button>
        </Box>

        <DataGrid
          rows={countries}
          columns={columns}
          loading={loading}
          autoHeight
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
          pageSizeOptions={[5, 10]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
          }}
          sx={{
            "& .MuiDataGrid-columnHeaderTitle": { fontWeight: "bold" },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "rgb(208,222,241)",
            },
          }}
        />

        <CountryFormDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
          mode={mode}
          country={editCountry}
        />
      </Box>
    </Layout>
  );
};

export default CountryManagement;

import React, { useMemo, useCallback } from "react";
import Layout from "../../../components/Layout";
import GenericCrudManagement from "../../../controls/GenericCrudManagement"; // adjust path if needed
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { IconButton, Tooltip } from "@mui/material";
import { MdEdit, MdDelete } from "react-icons/md";
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

type FormDialogRendererProps = {
  open: boolean;
  mode: "add" | "edit";
  item?: CountryResponse | undefined;
  onClose: () => void;
  onSubmit: (data: CreateCountryRequest | UpdateCountryRequest) => Promise<void>;
};

const CountryManagement: React.FC = () => {
  const baseColumns = useMemo<GridColDef<CountryResponse>[]>(() => {
    return [
      { field: "name", headerName: "Name", flex: 1 },
      { field: "code", headerName: "Code", width: 150 },
      {
        field: "isActive",
        headerName: "Active",
        width: 100,
        renderCell: (p: GridRenderCellParams<CountryResponse>) => (p.value ? "Yes" : "No"),
      },
    ];
  }, []);

  const actionsRenderer = useCallback(
    (h: { onEdit: (row: CountryResponse) => void; onDelete: (id: string) => Promise<void> }): GridColDef<CountryResponse> => ({
      field: "actions",
      headerName: "Actions",
      width: 140,
      align: "center",
      sortable: false,
      renderCell: (params: GridRenderCellParams<CountryResponse>) => (
        <>
          <Tooltip title="Edit">
            <IconButton onClick={() => h.onEdit(params.row)} size="small" aria-label={`Edit ${params.row.name ?? "country"}`}>
              <MdEdit />
            </IconButton>
          </Tooltip>

          <ConfirmButton
            icon={<MdDelete />}
            color="error"
            size="small"
            variant="text"
            dialogTitle="Delete Country"
            dialogMessage={`Delete ${params.row.name ?? "this country"}?`}
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={() => h.onDelete(params.row.id)}
          />
        </>
      ),
    }),
    []
  );

  return (
    <Layout>
      <GenericCrudManagement<CountryResponse, CreateCountryRequest, UpdateCountryRequest>
        title="Countries"
        fetchAll={getAllCountries}
        createItem={createCountry}
        updateItem={updateCountry}
        deleteItem={deleteCountry}
        columns={baseColumns}
        actionsRenderer={actionsRenderer}
        rowFilterFields={["name", "code"]}
        formDialogRenderer={({
          open,
          mode,
          item,
          onClose,
          onSubmit,
        }: FormDialogRendererProps) => (
          <CountryFormDialog open={open} onClose={onClose} onSubmit={onSubmit} mode={mode} country={item} />
        )}
        emptyLabel="No countries found"
      />
    </Layout>
  );
};

export default CountryManagement;

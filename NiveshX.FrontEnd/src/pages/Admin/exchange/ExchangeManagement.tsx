//src/pages/admin/exchange/ExchangeManagement.tsx
import React, { useMemo, useCallback } from "react";
import Layout from "../../../components/Layout";
import GenericCrudManagement from "../../../controls/GenericCrudManagement";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { IconButton, Tooltip } from "@mui/material";
import { MdEdit, MdDelete } from "react-icons/md";
import {
  getAllExchanges,
  deleteExchange,
  ExchangeResponse,
  CreateExchangeRequest,
  UpdateExchangeRequest,
  createExchange,
  updateExchange,
} from "../../../services/exchangeService";
import ExchangeFormDialog from "./ExchangeFormDialog";
import { ConfirmButton } from "../../../controls";
import { CountryResponse } from "../../../services";

type FormDialogRendererProps = {
  open: boolean;
  mode: "add" | "edit";
  item?: ExchangeResponse | undefined;
  onClose: () => void;
  onSubmit: (data: CreateExchangeRequest | UpdateExchangeRequest) => Promise<void>;
};

const ExchangeManagement: React.FC = () => {
  // use permissive any on GridColDef to avoid version/generic mismatch issues
  const baseColumns = useMemo<GridColDef<any>[]>(() => {
    return [
      { field: "name", headerName: "Name", flex: 1 },
      { field: "code", headerName: "Code", width: 160 },
      {
        field: "country",
        headerName: "Country",
        flex: 1,
        valueGetter: (params: any) => {
          const row = params as CountryResponse | any;
          return row?.name ?? "";
        },
      },
      {
        field: "isActive",
        headerName: "Active",
        width: 100,
        renderCell: (p: GridRenderCellParams<any>) => (p.value ? "Yes" : "No"),
      },
    ];
  }, []);

  const actionsRenderer = useCallback(
    (h: { onEdit: (row: ExchangeResponse) => void; onDelete: (id: string) => Promise<void> }): GridColDef<any> => ({
      field: "actions",
      headerName: "Actions",
      width: 160,
      align: "center",
      sortable: false,
      renderCell: (params: GridRenderCellParams<any>) => {
        const row = params.row as ExchangeResponse;
        return (
          <>
            <Tooltip title="Edit">
              <IconButton onClick={() => h.onEdit(row)} aria-label={`Edit ${row.name ?? "exchange"}`}>
                <MdEdit />
              </IconButton>
            </Tooltip>

            <ConfirmButton
              icon={<MdDelete />}
              color="error"
              variant="text"
              dialogTitle="Delete Exchange"
              dialogMessage={`Delete ${row.name ?? "this exchange"}?`}
              confirmText="Delete"
              cancelText="Cancel"
              onConfirm={() => h.onDelete(row.id)}
            />
          </>
        );
      },
    }),
    []
  );

  return (
    <Layout>
      <GenericCrudManagement<ExchangeResponse, CreateExchangeRequest, UpdateExchangeRequest>
        title="Exchanges"
        fetchAll={getAllExchanges}
        createItem={createExchange}
        updateItem={updateExchange}
        deleteItem={deleteExchange}
        columns={baseColumns}
        actionsRenderer={actionsRenderer}
        rowFilterFields={["name", "code", "country"]}
        formDialogRenderer={({
          open,
          mode,
          item,
          onClose,
          onSubmit,
        }: FormDialogRendererProps) => (
          <ExchangeFormDialog open={open} onClose={onClose} onSubmit={onSubmit} mode={mode} exchange={item} />
        )}
      />
    </Layout>
  );
};

export default ExchangeManagement;

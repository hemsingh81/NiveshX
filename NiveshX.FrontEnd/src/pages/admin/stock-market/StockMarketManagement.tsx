import React, { useMemo, useCallback } from "react";
import Layout from "../../../components/Layout";
import GenericCrudManagement from "../../../controls/GenericCrudManagement"; // adjust path if needed
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { IconButton, Tooltip } from "@mui/material";
import { MdEdit, MdDelete } from "react-icons/md";
import {
  getAllStockMarkets,
  deleteStockMarket,
  StockMarketResponse,
  CreateStockMarketRequest,
  UpdateStockMarketRequest,
  createStockMarket,
  updateStockMarket,
} from "../../../services/stockMarketService";
import StockMarketFormDialog from "./StockMarketFormDialog";
import { ConfirmButton } from "../../../controls";

type FormDialogRendererProps = {
  open: boolean;
  mode: "add" | "edit";
  item?: StockMarketResponse | undefined;
  onClose: () => void;
  onSubmit: (data: CreateStockMarketRequest | UpdateStockMarketRequest) => Promise<void>;
};

const StockMarketManagement: React.FC = () => {
  const baseColumns = useMemo<GridColDef<StockMarketResponse>[]>(() => {
    return [
      { field: "name", headerName: "Name", flex: 1 },
      { field: "code", headerName: "Code", width: 160 },
      {
        field: "country",
        headerName: "Country",
        flex: 1,
        valueGetter: (params: any) => params.row?.country?.name ?? "",
      },
      {
        field: "isActive",
        headerName: "Active",
        width: 100,
        renderCell: (p: GridRenderCellParams<StockMarketResponse>) => (p.value ? "Yes" : "No"),
      },
    ];
  }, []);

  const actionsRenderer = useCallback(
    (h: { onEdit: (row: StockMarketResponse) => void; onDelete: (id: string) => Promise<void> }): GridColDef<StockMarketResponse> => ({
      field: "actions",
      headerName: "Actions",
      width: 160,
      align: "center",
      sortable: false,
      renderCell: (params: GridRenderCellParams<StockMarketResponse>) => (
        <>
          <Tooltip title="Edit">
            <IconButton onClick={() => h.onEdit(params.row)} aria-label={`Edit ${params.row.name ?? "stock market"}`}>
              <MdEdit />
            </IconButton>
          </Tooltip>

          <ConfirmButton
            icon={<MdDelete />}
            color="error"
            variant="text"
            dialogTitle="Delete Stock Market"
            dialogMessage={`Delete ${params.row.name ?? "this stock market"}?`}
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
      <GenericCrudManagement<StockMarketResponse, CreateStockMarketRequest, UpdateStockMarketRequest>
        title="Stock Markets"
        fetchAll={getAllStockMarkets}
        createItem={createStockMarket}
        updateItem={updateStockMarket}
        deleteItem={deleteStockMarket}
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
          <StockMarketFormDialog open={open} onClose={onClose} onSubmit={onSubmit} mode={mode} stockMarket={item} />
        )}
      />
    </Layout>
  );
};

export default StockMarketManagement;

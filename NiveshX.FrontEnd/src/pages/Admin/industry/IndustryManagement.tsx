import React, { useMemo, useCallback } from "react";
import Layout from "../../../components/Layout";
import GenericCrudManagement from "../../../controls/GenericCrudManagement";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { IconButton, Tooltip } from "@mui/material";
import { MdEdit, MdDelete } from "react-icons/md";
import {
  getAllIndustries,
  createIndustry,
  updateIndustry,
  deleteIndustry,
  IndustryResponse,
  CreateIndustryRequest,
  UpdateIndustryRequest,
} from "../../../services";
import IndustryFormDialog from "./IndustryFormDialog";
import { ConfirmButton } from "../../../controls";

type FormDialogRendererProps = {
  open: boolean;
  mode: "add" | "edit";
  item?: IndustryResponse | undefined;
  onClose: () => void;
  onSubmit: (data: CreateIndustryRequest | UpdateIndustryRequest) => Promise<void>;
};

const IndustryManagement: React.FC = () => {
  // base columns (without actions)
  const baseColumns = useMemo<GridColDef<IndustryResponse>[]>(() => {
    return [
      { field: "name", headerName: "Name", flex: 1, minWidth: 160 },
      { field: "description", headerName: "Description", flex: 1, minWidth: 240 },
      {
        field: "isActive",
        headerName: "Active",
        width: 100,
        renderCell: (p: GridRenderCellParams<IndustryResponse>) => (p.value ? "Yes" : "No"),
      },
    ];
  }, []);

  // actionsRenderer builds the actions column and uses onEdit/onDelete provided by GenericCrudManagement
  const actionsRenderer = useCallback(
    (h: { onEdit: (row: IndustryResponse) => void; onDelete: (id: string) => Promise<void> }): GridColDef<IndustryResponse> => ({
      field: "actions",
      headerName: "Actions",
      width: 140,
      align: "center",
      sortable: false,
      renderCell: (params: GridRenderCellParams<IndustryResponse>) => (
        <>
          <Tooltip title="Edit">
            <IconButton
              onClick={() => h.onEdit(params.row)}
              aria-label={`Edit ${params.row.name ?? "industry"}`}
            >
              <MdEdit />
            </IconButton>
          </Tooltip>

          <ConfirmButton
            icon={<MdDelete />}
            color="error"
            variant="text"
            dialogTitle="Delete Industry"
            dialogMessage={`Delete ${params.row.name ?? "this industry"}?`}
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
      <GenericCrudManagement<IndustryResponse, CreateIndustryRequest, UpdateIndustryRequest>
        title="Industries"
        fetchAll={getAllIndustries}
        createItem={createIndustry}
        updateItem={updateIndustry}
        deleteItem={deleteIndustry}
        columns={baseColumns}
        actionsRenderer={actionsRenderer}
        rowFilterFields={["name", "description"]}
        formDialogRenderer={({
          open,
          mode,
          item,
          onClose,
          onSubmit,
        }: FormDialogRendererProps) => (
          <IndustryFormDialog open={open} onClose={onClose} onSubmit={onSubmit} mode={mode} industry={item} />
        )}
      />
    </Layout>
  );
};

export default IndustryManagement;

import React, { useMemo, useCallback } from "react";
import Layout from "../../../components/Layout";
import GenericCrudManagement from "../../../controls/GenericCrudManagement"; // adjust path if needed
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { IconButton, Tooltip } from "@mui/material";
import { MdEdit, MdDelete } from "react-icons/md";
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

type FormDialogRendererProps = {
  open: boolean;
  mode: "add" | "edit";
  item?: SectorResponse | undefined;
  onClose: () => void;
  onSubmit: (data: CreateSectorRequest | UpdateSectorRequest) => Promise<void>;
};

const SectorManagement: React.FC = () => {
  const baseColumns = useMemo<GridColDef<SectorResponse>[]>(() => {
    return [
      { field: "name", headerName: "Name", flex: 1 },
      { field: "description", headerName: "Description", flex: 1, minWidth: 240 },
      {
        field: "isActive",
        headerName: "Active",
        width: 100,
        renderCell: (p: GridRenderCellParams<SectorResponse>) => (p.value ? "Yes" : "No"),
      },
    ];
  }, []);

  const actionsRenderer = useCallback(
    (h: { onEdit: (row: SectorResponse) => void; onDelete: (id: string) => Promise<void> }): GridColDef<SectorResponse> => ({
      field: "actions",
      headerName: "Actions",
      width: 140,
      align: "center",
      sortable: false,
      renderCell: (params: GridRenderCellParams<SectorResponse>) => (
        <>
          <Tooltip title="Edit">
            <IconButton onClick={() => h.onEdit(params.row)} aria-label={`Edit ${params.row.name ?? "sector"}`}>
              <MdEdit />
            </IconButton>
          </Tooltip>

          <ConfirmButton
            icon={<MdDelete />}
            color="error"
            variant="text"
            dialogTitle="Delete Sector"
            dialogMessage={`Delete ${params.row.name ?? "this sector"}?`}
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
      <GenericCrudManagement<SectorResponse, CreateSectorRequest, UpdateSectorRequest>
        title="Sectors"
        fetchAll={getAllSectors}
        createItem={createSector}
        updateItem={updateSector}
        deleteItem={deleteSector}
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
          <SectorFormDialog open={open} onClose={onClose} onSubmit={onSubmit} mode={mode} sector={item} />
        )}
      />
    </Layout>
  );
};

export default SectorManagement;

import React, { useMemo, useCallback } from "react";
import Layout from "../../../components/Layout";
import GenericCrudManagement from "../../../controls/GenericCrudManagement"; // adjust path if needed
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { IconButton, Tooltip } from "@mui/material";
import { MdEdit, MdDelete } from "react-icons/md";
import {
  getAllClassificationTags,
  createClassificationTag,
  updateClassificationTag,
  deleteClassificationTag,
  ClassificationTagResponse,
  CreateClassificationTagRequest,
  UpdateClassificationTagRequest,
} from "../../../services";
import ClassificationTagFormDialog from "./ClassificationTagFormDialog";
import { ConfirmButton } from "../../../controls";

type FormDialogRendererProps = {
  open: boolean;
  mode: "add" | "edit";
  item?: ClassificationTagResponse | undefined;
  onClose: () => void;
  onSubmit: (data: CreateClassificationTagRequest | UpdateClassificationTagRequest) => Promise<void>;
};

const ClassificationTagManagement: React.FC = () => {
  const baseColumns = useMemo<GridColDef<ClassificationTagResponse>[]>(() => {
    return [
      { field: "name", headerName: "Name", flex: 1, minWidth: 160 },
      { field: "category", headerName: "Category", width: 180 },
      { field: "description", headerName: "Description", flex: 1, minWidth: 240 },
      {
        field: "isActive",
        headerName: "Active",
        width: 100,
        renderCell: (p: GridRenderCellParams<ClassificationTagResponse>) => (p.value ? "Yes" : "No"),
      },
    ];
  }, []);

  const actionsRenderer = useCallback(
    (h: { onEdit: (row: ClassificationTagResponse) => void; onDelete: (id: string) => Promise<void> }): GridColDef<ClassificationTagResponse> => ({
      field: "actions",
      headerName: "Actions",
      width: 140,
      align: "center",
      sortable: false,
      renderCell: (params: GridRenderCellParams<ClassificationTagResponse>) => (
        <>
          <Tooltip title="Edit">
            <IconButton
              onClick={() => h.onEdit(params.row)}
              aria-label={`Edit ${params.row.name ?? "tag"}`}
            >
              <MdEdit />
            </IconButton>
          </Tooltip>

          <ConfirmButton
            icon={<MdDelete />}
            color="error"
            variant="text"
            dialogTitle="Delete Tag"
            dialogMessage={`Delete ${params.row.name ?? "this tag"}?`}
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
      <GenericCrudManagement<ClassificationTagResponse, CreateClassificationTagRequest, UpdateClassificationTagRequest>
        title="Classification Tags"
        fetchAll={getAllClassificationTags}
        createItem={createClassificationTag}
        updateItem={updateClassificationTag}
        deleteItem={deleteClassificationTag}
        columns={baseColumns}
        actionsRenderer={actionsRenderer}
        rowFilterFields={["name", "category", "description"]}
        formDialogRenderer={({
          open,
          mode,
          item,
          onClose,
          onSubmit,
        }: FormDialogRendererProps) => (
          <ClassificationTagFormDialog open={open} onClose={onClose} onSubmit={onSubmit} mode={mode} tag={item} />
        )}
      />
    </Layout>
  );
};

export default ClassificationTagManagement;

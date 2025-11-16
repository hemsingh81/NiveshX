import React, { useMemo, useCallback } from "react";
import Layout from "../../../components/Layout";
import GenericCrudManagement from "../../../controls/GenericCrudManagement"; // adjust path if needed
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { IconButton, Tooltip } from "@mui/material";
import { MdEdit, MdDelete } from "react-icons/md";
import {
  getAllQuotes,
  addQuote,
  editQuote,
  deleteQuote,
  MotivationQuoteResponse,
  CreateMotivationQuoteRequest,
  UpdateMotivationQuoteRequest,
} from "../../../services/motivationQuoteService";
import MotivationQuoteFormDialog from "./MotivationQuoteFormDialog";
import { ConfirmButton } from "../../../controls";

type FormDialogRendererProps = {
  open: boolean;
  mode: "add" | "edit";
  item?: MotivationQuoteResponse | undefined;
  onClose: () => void;
  onSubmit: (data: CreateMotivationQuoteRequest | UpdateMotivationQuoteRequest) => Promise<void>;
};

const MotivationQuotesManagement: React.FC = () => {
  const baseColumns = useMemo<GridColDef<MotivationQuoteResponse>[]>(() => {
    return [
      { field: "quote", headerName: "Motivational Quote", flex: 1 },
      { field: "author", headerName: "Author", width: 220 },
      {
        field: "isActive",
        headerName: "Visible",
        width: 120,
        renderCell: (p: GridRenderCellParams<MotivationQuoteResponse>) => (p.value ? "Yes" : "No"),
      },
    ];
  }, []);

  const actionsRenderer = useCallback(
    (h: { onEdit: (row: MotivationQuoteResponse) => void; onDelete: (id: string) => Promise<void> }): GridColDef<MotivationQuoteResponse> => ({
      field: "actions",
      headerName: "Actions",
      width: 160,
      align: "center",
      sortable: false,
      renderCell: (params: GridRenderCellParams<MotivationQuoteResponse>) => (
        <>
          <Tooltip title="Edit">
            <IconButton
              onClick={() => h.onEdit(params.row)}
              size="small"
              aria-label={`Edit ${params.row.author ?? "quote"}`}
            >
              <MdEdit />
            </IconButton>
          </Tooltip>

          <ConfirmButton
            icon={<MdDelete />}
            color="error"
            size="small"
            variant="text"
            dialogTitle="Delete Quote"
            dialogMessage={`Delete quote by ${params.row.author ?? "unknown"}?`}
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
      <GenericCrudManagement<MotivationQuoteResponse, CreateMotivationQuoteRequest, UpdateMotivationQuoteRequest>
        title="Motivation Quotes"
        fetchAll={getAllQuotes}
        createItem={addQuote}
        updateItem={async (id, req) =>
          editQuote({
            id,
            quote: req.quote,
            author: req.author,
            isActive: (req as UpdateMotivationQuoteRequest).isActive ?? true,
          } as MotivationQuoteResponse)
        }
        deleteItem={deleteQuote}
        columns={baseColumns}
        actionsRenderer={actionsRenderer}
        rowFilterFields={["quote", "author"]}
        formDialogRenderer={({
          open,
          mode,
          item,
          onClose,
          onSubmit,
        }: FormDialogRendererProps) => (
          <MotivationQuoteFormDialog open={open} initial={item} mode={mode} onClose={onClose} onSubmit={onSubmit} />
        )}
        emptyLabel="No quotes found"
      />
    </Layout>
  );
};

export default MotivationQuotesManagement;

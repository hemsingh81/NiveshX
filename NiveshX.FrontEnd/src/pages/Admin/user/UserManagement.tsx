import React, { useMemo, useCallback } from "react";
import Layout from "../../../components/Layout";
import GenericCrudManagement from "../../../controls/GenericCrudManagement"; // adjust path if needed
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { IconButton, Tooltip } from "@mui/material";
import { MdEdit, MdDelete, MdAdd } from "react-icons/md";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
} from "../../../services";
import UserFormDialog from "./UserFormDialog";
import { ConfirmButton } from "../../../controls";

type FormDialogRendererProps = {
  open: boolean;
  mode: "add" | "edit";
  item?: UserResponse | undefined;
  onClose: () => void;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => Promise<void>;
};

const UserManagement: React.FC = () => {
  const baseColumns = useMemo<GridColDef<UserResponse>[]>(() => {
    return [
      { field: "name", headerName: "Name", flex: 1 },
      { field: "email", headerName: "Email", flex: 1 },
      { field: "phoneNumber", headerName: "Phone", width: 250 },
      { field: "role", headerName: "Role", width: 120 },
      {
        field: "isActive",
        headerName: "Active",
        width: 100,
        renderCell: (p: GridRenderCellParams<UserResponse>) => (p.value ? "Yes" : "No"),
      },
      {
        field: "isLockedOut",
        headerName: "Is Locked Out",
        width: 120,
        renderCell: (p: GridRenderCellParams<UserResponse>) => (p.value ? "Yes" : "No"),
      },
    ];
  }, []);

  const actionsRenderer = useCallback(
    (h: { onEdit: (row: UserResponse) => void; onDelete: (id: string) => Promise<void> }): GridColDef<UserResponse> => ({
      field: "actions",
      headerName: "Actions",
      width: 150,
      align: "center",
      sortable: false,
      renderCell: (params: GridRenderCellParams<UserResponse>) => (
        <>
          <Tooltip title="Edit">
            <IconButton onClick={() => h.onEdit(params.row)} size="small" aria-label={`Edit ${params.row.name ?? "user"}`}>
              <MdEdit />
            </IconButton>
          </Tooltip>

          <ConfirmButton
            icon={<MdDelete />}
            color="error"
            size="small"
            variant="text"
            dialogTitle="Delete User"
            dialogMessage={`Are you sure you want to delete ${params.row.name ?? "this user"}?`}
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
      <GenericCrudManagement<UserResponse, CreateUserRequest, UpdateUserRequest>
        title="User Management"
        fetchAll={getAllUsers}
        createItem={createUser}
        updateItem={updateUser}
        deleteItem={deleteUser}
        columns={baseColumns}
        actionsRenderer={actionsRenderer}
        rowFilterFields={["name", "email", "role"]}
        formDialogRenderer={({
          open,
          mode,
          item,
          onClose,
          onSubmit,
        }: FormDialogRendererProps) => (
          <UserFormDialog open={open} onClose={onClose} onSubmit={onSubmit} mode={mode} user={item} />
        )}
        emptyLabel="No users found"
      />
    </Layout>
  );
};

export default UserManagement;

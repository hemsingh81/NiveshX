import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { MdAdd, MdEdit, MdDelete } from "react-icons/md";
import Layout from "../../../components/Layout";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
} from "../../../services/userService";
import UserFormDialog from "./UserFormDialog";
import { ConfirmButton } from "../../../controls";

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserResponse | undefined>();
  const [mode, setMode] = useState<"add" | "edit">("add");

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      // optionally log or handle local state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAdd = useCallback(() => {
    setMode("add");
    setEditUser(undefined);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((user: UserResponse) => {
    setMode("edit");
    setEditUser(user);
    setDialogOpen(true);
  }, []);

  const handleDeleteUser = useCallback(
    async (id: string) => {
      try {
        await deleteUser(id);
        await fetchUsers();
      } catch (err) {
        // optional: console.error(err);
      }
    },
    [fetchUsers]
  );

  const handleSubmit = useCallback(
    async (data: CreateUserRequest | UpdateUserRequest): Promise<void> => {
      try {
        if (mode === "add") {
          await createUser(data as CreateUserRequest);
        } else if (editUser) {
          await updateUser(editUser.id, data as UpdateUserRequest);
        }
        await fetchUsers();
      } catch (err) {
        // let caller handle errors (dialog keeps open)
        throw err;
      }
    },
    [mode, editUser, fetchUsers]
  );

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "name", headerName: "Name", flex: 1 },
      { field: "email", headerName: "Email", flex: 1 },
      { field: "phoneNumber", headerName: "Phone", width: 250 },
      { field: "role", headerName: "Role", width: 120 },
      {
        field: "isActive",
        headerName: "Active",
        width: 100,
        renderCell: (params) => (params.value ? "Yes" : "No"),
      },
      {
        field: "isLockedOut",
        headerName: "Locked Out",
        width: 120,
        renderCell: (params) => (params.value ? "Yes" : "No"),
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 160,
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
              dialogTitle="Delete User"
              dialogMessage={`Are you sure you want to delete ${params.row.name}?`}
              confirmText="Delete"
              cancelText="Cancel"
              onConfirm={() => handleDeleteUser(params.row.id)}
            />
          </>
        ),
      },
    ],
    [handleEdit, handleDeleteUser]
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
            User Management
          </Typography>
          <Button variant="contained" startIcon={<MdAdd />} onClick={handleAdd}>
            Add User
          </Button>
        </Box>
        <DataGrid
          rows={users}
          columns={columns}
          loading={loading}
          autoHeight
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
          pageSizeOptions={[5, 10]}
          initialState={{
            pagination: { paginationModel: { pageSize: 5, page: 0 } },
          }}
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? "even-row" : "odd-row"
          }
          sx={{
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "rgb(208, 222, 241)",
            },
          }}
        />
        <UserFormDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
          mode={mode}
          user={editUser}
        />
      </Box>
    </Layout>
  );
};

export default UserManagement;

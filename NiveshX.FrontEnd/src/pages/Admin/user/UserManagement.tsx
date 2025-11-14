import React, { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { MdAdd, MdEdit, MdDelete } from "react-icons/md";
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

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserResponse | undefined>();
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = () => {
    setMode("add");
    setEditUser(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (user: UserResponse) => {
    setMode("edit");
    setEditUser(user);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteUser(deleteId);
      setDeleteId(null);
      fetchUsers();
    }
  };

  const handleSubmit = async (data: CreateUserRequest | UpdateUserRequest) => {
    if (mode === "add") {
      await createUser(data as CreateUserRequest);
    } else if (editUser) {
      await updateUser(editUser.id, data as UpdateUserRequest);
    }
    setDialogOpen(false);
    fetchUsers();
  };

  const columns: GridColDef[] = [
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
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleEdit(params.row)}>
            <MdEdit />
          </IconButton>
          <IconButton color="error" onClick={() => setDeleteId(params.row.id)}>
            <MdDelete />
          </IconButton>
        </>
      ),
    },
  ];

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
        <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
          <DialogTitle>Are you sure you want to delete this user?</DialogTitle>
          <DialogActions>
            <Button onClick={() => setDeleteId(null)} variant="outlined">Cancel</Button>
            <Button color="error" onClick={handleDelete} variant="outlined">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default UserManagement;

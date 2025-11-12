import React, { useEffect, useState } from 'react';
import { MdAdd } from 'react-icons/md';
import Layout from '../../../components/Layout';
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import {
  Button,
  Switch,
  Box,
} from '@mui/material';
import {
  getAllQuotes,
  addQuote,
  editQuote,
  deleteQuote,
  MotivationQuote,
} from '../../../services/motivationService';
import { ConfirmButton } from '../../../controls';

const MotivationQuotes: React.FC = () => {
  const [rows, setRows] = useState<MotivationQuote[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const quotes = await getAllQuotes();
      setRows(quotes);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = async () => {
    const newQuote = { quote: 'New motivational quote...' };
    await addQuote(newQuote);
    await fetchQuotes();
  };

  const handleDeleteQuote = async (id: GridRowId) => {
    await deleteQuote(String(id));
    setRows(prev => prev.filter(row => row.id !== id));
  };

  const handleToggleVisibility = async (id: GridRowId) => {
    const updatedRow = rows.find(row => row.id === id);
    if (!updatedRow) return;

    const updatedQuote = {
      id: updatedRow.id,
      quote: updatedRow.quote,
      isActive: !updatedRow.isActive,
    };

    await editQuote(updatedQuote);

    setRows(prev =>
      prev.map(row => (row.id === id ? updatedQuote : row))
    );
  };

  const processRowUpdate = async (newRow: MotivationQuote) => {
    await editQuote({
      id: newRow.id,
      quote: newRow.quote,
      isActive: newRow.isActive,
    });

    setRows(prev =>
      prev.map(row => (row.id === newRow.id ? newRow : row))
    );

    return newRow;
  };

  const columns: GridColDef[] = [
    {
      field: 'quote',
      headerName: 'Motivational Quote',
      flex: 1,
      editable: true,
    },
    {
      field: 'isActive',
      headerName: 'Visible',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Switch
          checked={params.value}
          onChange={() => handleToggleVisibility(params.id)}
          color="primary"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <ConfirmButton
          label="Delete"
          color="error"
          confirmText="Delete"
          dialogTitle="Confirm Deletion"
          dialogMessage="Are you sure you want to delete this quote?"
          onConfirm={() => handleDeleteQuote(params.id)}
        />
      ),
    },
  ];

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Motivation Quotes</h1>
      <Box mb={2}>
        <Button variant="contained" color="primary" onClick={handleAddNew} startIcon={<MdAdd />}>
          Add New Quote
        </Button>
      </Box>
      <div className="custom-header" style={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          processRowUpdate={processRowUpdate}
          pageSizeOptions={[5, 10]}
          initialState={{
            pagination: { paginationModel: { pageSize: 5, page: 0 } },
          }}
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : 'odd-row'
          }
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#1976d2',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 'bold',
            },
          }}
        />
      </div>

    </Layout>
  );
};

export default MotivationQuotes;

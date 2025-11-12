import React, { useState } from 'react';
import Layout from '../../../components/Layout';
import {
  DataGrid,
  GridColDef,
  GridRowsProp,
  GridRowId,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import { Button, Switch, TextField, Box } from '@mui/material';

const MotivationQuotes: React.FC = () => {
  const [rows, setRows] = useState<GridRowsProp>([
    { id: 1, quote: 'Believe in yourself!', isVisible: true },
    { id: 2, quote: 'Stay positive, work hard.', isVisible: false },
  ]);

  const handleDelete = (id: GridRowId) => {
    setRows(prev => prev.filter(row => row.id !== id));
  };

  const handleToggleVisibility = (id: GridRowId) => {
    setRows(prev =>
      prev.map(row =>
        row.id === id ? { ...row, isVisible: !row.isVisible } : row
      )
    );
  };

  const handleAddNew = () => {
    const newId = rows.length ? Math.max(...rows.map(r => Number(r.id))) + 1 : 1;
    setRows(prev => [
      ...prev,
      { id: newId, quote: 'New motivational quote...', isVisible: true },
    ]);
  };

  const handleEditCellChangeCommitted = (params: any) => {
    const { id, field, value } = params;
    setRows(prev =>
      prev.map(row =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  const columns: GridColDef[] = [
    {
      field: 'quote',
      headerName: 'Motivational Quote',
      flex: 1,
      editable: true,
    },
    {
      field: 'isVisible',
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
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => handleDelete(params.id)}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Motivation Quotes</h1>
      <Box mb={2}>
        <Button variant="contained" color="primary" onClick={handleAddNew}>
          ➕ Add New Quote
        </Button>
      </Box>
      <div style={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          onCellEditStop={handleEditCellChangeCommitted}
          pageSizeOptions={[5, 10]}
          initialState={{
            pagination: { paginationModel: { pageSize: 5, page: 0 } },
          }}
        />
      </div>
    </Layout>
  );
};

export default MotivationQuotes;

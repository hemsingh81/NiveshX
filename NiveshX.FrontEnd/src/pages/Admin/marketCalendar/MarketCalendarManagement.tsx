// src/pages/admin/marketCalendar/MarketCalendarManagement.tsx
import React, { useMemo, useCallback, useState } from "react";
import Layout from "../../../components/Layout";
import GenericCrudManagement from "../../../controls/GenericCrudManagement";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { IconButton, Tooltip } from "@mui/material";
import { MdEdit, MdDelete } from "react-icons/md";
import MarketCalendarFormDialog from "./MarketCalendarFormDialog";
import { ConfirmButton } from "../../../controls";
import type {
  MarketCalendarEntry,
  CreateMarketCalendarRequest,
  UpdateMarketCalendarRequest,
} from "../../../services/marketCalendarService";
import { useExchanges } from "../../../hooks/useExchanges";
import {
  useMarketCalendar,
  useCreateMarketCalendar,
  useUpdateMarketCalendar,
  useDeleteMarketCalendar,
} from "../../../hooks/useMarketCalendar";

const MarketCalendarManagement: React.FC = () => {
  const { data: exchanges = [] } = useExchanges();
  const exchangeOptions = useMemo(
    () => (exchanges ?? []).map((e) => ({ id: e.id, name: e.name })),
    [exchanges]
  );

  const { data: items = [], isLoading } = useMarketCalendar();

  const createMutation = useCreateMarketCalendar();
  const updateMutation = useUpdateMarketCalendar();
  const deleteMutation = useDeleteMarketCalendar();

  const [dialog, setDialog] = useState<{
    open: boolean;
    mode: "add" | "edit";
    item?: MarketCalendarEntry;
  }>({
    open: false,
    mode: "add",
  });

  const handleCreate = async (payload: CreateMarketCalendarRequest) => {
    await createMutation.mutateAsync(payload);
  };

  const handleUpdate = async (
    id: string,
    payload: UpdateMarketCalendarRequest
  ) => {
    await updateMutation.mutateAsync({ id, payload });
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const exchangeMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const ex of exchanges ?? []) m[ex.id] = ex.name;
    return m;
  }, [exchanges]);

  const normalizedItems = useMemo<MarketCalendarEntry[]>(() => {
    return (items ?? []).map((it) => {
      const anyIt = it as any;
      const id = String(
        anyIt.id ?? anyIt.Id ?? anyIt.exchangeId ?? `${Math.random().toString(36).slice(2, 8)}`
      );
      const exchangeId = String(anyIt.exchangeId ?? anyIt.ExchangeId ?? "");
      const normalizeTime = (t: any) => {
        if (t === null || t === undefined) return null;
        if (typeof t === "string" && t.trim() === "") return null;
        if (/^\d{2}:\d{2}$/.test(t)) return `${t}:00`;
        return String(t);
      };
      return {
        id,
        exchangeId,
        exchange: (anyIt.exchange ?? null) as any,
        regularOpenTime: normalizeTime(anyIt.regularOpenTime ?? anyIt.RegularOpenTime),
        regularCloseTime: normalizeTime(anyIt.regularCloseTime ?? anyIt.RegularCloseTime),
        preMarketOpen: normalizeTime(anyIt.preMarketOpen ?? anyIt.PreMarketOpen),
        preMarketClose: normalizeTime(anyIt.preMarketClose ?? anyIt.PreMarketClose),
        postMarketOpen: normalizeTime(anyIt.postMarketOpen ?? anyIt.PostMarketOpen),
        postMarketClose: normalizeTime(anyIt.postMarketClose ?? anyIt.PostMarketClose),
        holidayDatesJson: anyIt.holidayDatesJson ?? anyIt.HolidayDatesJson ?? "[]",
        sessionRulesJson: anyIt.sessionRulesJson ?? anyIt.SessionRulesJson ?? "{}",
        isActive: typeof anyIt.isActive === "boolean" ? anyIt.isActive : Boolean(anyIt.isActive),
        rowVersion: anyIt.rowVersion ?? anyIt.RowVersion ?? undefined,
      } as MarketCalendarEntry;
    });
  }, [items]);

  const fetchAllForCrud = useCallback(async (): Promise<MarketCalendarEntry[]> => {
    return normalizedItems;
  }, [normalizedItems]);

  const columns = useMemo<GridColDef<MarketCalendarEntry>[]>(() => {
    const fmtTime = (v: any) => {
      if (v == null) return "";
      const s = String(v);
      if (/^\d{2}:\d{2}(:\d{2})?$/.test(s)) return s;
      return s;
    };

    return [
      {
        field: "exchangeId",
        headerName: "Exchange",
        flex: 1,
        sortable: true,
        renderCell: (params: any) => {
          const row = params?.row ?? {};
          const name = row?.exchange?.name ?? exchangeMap[row?.exchangeId] ?? row?.exchangeId ?? "";
          return <span>{name}</span>;
        },
      },
      {
        field: "regularOpenTime",
        headerName: "Regular Open",
        width: 120,
        valueFormatter: (params: any) => fmtTime(params),
      },
      {
        field: "regularCloseTime",
        headerName: "Regular Close",
        width: 120,
        valueFormatter: (params: any) => fmtTime(params),
      },
      {
        field: "preMarketOpen",
        headerName: "Pre Open",
        width: 120,
        valueFormatter: (params: any) => fmtTime(params),
      },
      {
        field: "preMarketClose",
        headerName: "Pre Close",
        width: 120,
        valueFormatter: (params: any) => fmtTime(params),
      },
      {
        field: "postMarketOpen",
        headerName: "Post Open",
        width: 120,
        valueFormatter: (params: any) => fmtTime(params),
      },
      {
        field: "postMarketClose",
        headerName: "Post Close",
        width: 120,
        valueFormatter: (params: any) => fmtTime(params),
      },
      {
        field: "holidayDatesJson",
        headerName: "Holidays",
        flex: 1,
        renderCell: (params: any) => {
          const text = params?.value ?? JSON.stringify(params?.row?.holidayDatesJson ?? "[]");
          return (
            <span
              title={String(text)}
              style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220 }}
            >
              {String(text)}
            </span>
          );
        },
      },
      {
        field: "sessionRulesJson",
        headerName: "Session Rules",
        flex: 1,
        renderCell: (params: any) => {
          const text = params?.value ?? JSON.stringify(params?.row?.sessionRulesJson ?? "{}");
          return (
            <span
              title={String(text)}
              style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220 }}
            >
              {String(text)}
            </span>
          );
        },
      },
      {
        field: "isActive",
        headerName: "Active",
        width: 100,
        renderCell: (p: GridRenderCellParams<MarketCalendarEntry>) => (p.value ? "Yes" : "No"),
      },
    ];
  }, [exchangeMap]);

  const actionsRenderer = useCallback(
    (h: {
      onEdit: (row: MarketCalendarEntry) => void;
      onDelete: (id: string) => Promise<void>;
    }): GridColDef<any> => ({
      field: "actions",
      headerName: "Actions",
      width: 160,
      align: "center",
      sortable: false,
      renderCell: (params: any) => {
        const row = params.row as MarketCalendarEntry;
        return (
          <>
            <Tooltip title="Edit">
              <IconButton
                onClick={() => h.onEdit(row)}
                aria-label={`Edit ${row.exchange?.name ?? row.exchangeId ?? row.id}`}
              >
                <MdEdit />
              </IconButton>
            </Tooltip>

            <ConfirmButton
              icon={<MdDelete />}
              color="error"
              variant="text"
              dialogTitle="Delete Calendar Entry"
              dialogMessage={`Delete entry for ${row.exchange?.name ?? row.exchangeId ?? row.id}?`}
              confirmText="Delete"
              cancelText="Cancel"
              onConfirm={() => h.onDelete(row.id)}
            />
          </>
        );
      },
    }),
    []
  );

  const formDialogRenderer = ({ open, mode, item, onClose, onSubmit }: any) => {
    const submitAdapter = async (
      data: CreateMarketCalendarRequest | UpdateMarketCalendarRequest
    ) => {
      if (mode === "add") {
        await handleCreate(data as CreateMarketCalendarRequest);
      } else {
        if (!item) throw new Error("Missing item for update");
        await handleUpdate(item.id, data as UpdateMarketCalendarRequest);
      }
      onClose();
    };

    return (
      <MarketCalendarFormDialog
        open={open}
        mode={mode}
        onClose={onClose}
        onSubmit={submitAdapter}
        item={item}
        exchangeOptions={exchangeOptions}
      />
    );
  };

  return (
    <Layout>
      <GenericCrudManagement<
        MarketCalendarEntry,
        CreateMarketCalendarRequest,
        UpdateMarketCalendarRequest
      >
        title="Market Calendar"
        fetchAll={fetchAllForCrud}
        createItem={(payload) => createMutation.mutateAsync(payload)}
        updateItem={(id, payload) => updateMutation.mutateAsync({ id, payload })}
        deleteItem={(id) => deleteMutation.mutateAsync(id)}
        columns={columns}
        actionsRenderer={actionsRenderer}
        rowFilterFields={[
          "exchangeId",
          "regularOpenTime",
          "regularCloseTime",
          "preMarketOpen",
          "preMarketClose",
          "postMarketOpen",
          "postMarketClose",
          "holidayDatesJson",
          "sessionRulesJson",
          "isActive",
        ]}
        formDialogRenderer={formDialogRenderer}
        pageSize={10}
      />
    </Layout>
  );
};

export default MarketCalendarManagement;

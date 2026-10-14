import { useState } from "react";
import Swal from "sweetalert2";

import QuoteFilters from "../../components/quotes/QuoteFilters";
import QuoteHeader from "../../components/quotes/QuoteHeader";
import QuoteTable from "../../components/quotes/QuotesTable";
import QuotePreviewModal from "../../components/quotes/QuotesPreviewModal";
import QuoteFormModal, {
  type QuoteFormSavePayload,
} from "../../components/quotes/QuoteFormModal";
import QuoteEditModal from "../../components/quotes/QuoteEditModal";
import AddPaymentModal from "../../components/quotes/AddPaymentModal";

import { useQuotes } from "../../hooks/useQuotes";
import { useArticles } from "../../hooks/useArticles";
import { useFabricTypes } from "../../hooks/useFabricTypes";
import { useClients } from "../../hooks/useClients";
import { useAuth } from "../../context/AuthContext";
import { createQuickClient } from "../../services/client.service";

import type { AxiosError } from "axios";

import type { Quote, QuoteUpdatePayload } from "../../types/quote";

const Quotes = () => {
  const {
    quotes,
    pagination,
    loading,
    error,
    search,
    setSearch,
    status,
    setStatus,
    priority,
    setPriority,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    page,
    setPage,
    refetch,
    createQuote,
    updateQuote,
    deleteQuote,
    acceptQuote,
    addQuoteIva,
  } = useQuotes();
  const { hasRole } = useAuth();
  const { articles } = useArticles();
  const { fabricTypes } = useFabricTypes();
  const { clients } = useClients();

  const isAdmin = hasRole("administrador");

  const [openModal, setOpenModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [previewQuote, setPreviewQuote] = useState<Quote | null>(null);
  const [payingQuote, setPayingQuote] = useState<Quote | null>(null);

  const handleClearFilters = () => {
    setSearch("");
    setStatus("all");
    setPriority("all");
    setDateFrom("");
    setDateTo("");
  };

  const handleCreate = async (payload: QuoteFormSavePayload) => {
    try {
      let clientId: number;

      if (payload.newClient) {
        const { id } = await createQuickClient({
          name: payload.newClient.name,
          paternal_last_name: payload.newClient.lastNameP,
          maternal_last_name: payload.newClient.lastNameM,
          phone: payload.newClient.phone,
        });
        clientId = id;
      } else {
        clientId = payload.clientId!;
      }

      await createQuote({
        clientId,
        deliveryDate: payload.deliveryDate,
        iva: payload.iva,
        sending: payload.sending,
        shippingAmount: payload.sending ? payload.shippingAmount : 0,
        total: payload.total,
        advance: payload.advance,
        priority: payload.priority,
        articles: payload.items.map((item) => ({
          articleId: item.articleId!,
          fabricType: item.fabricTypeId!,
          amount: item.qty,
          unitPrice: item.price,
          subtotal: item.qty * item.price,
        })),
      });

      Swal.fire({
        icon: "success",
        title: "¡Listo!",
        text: "Cotización creada con éxito.",
        timer: 2000,
        showConfirmButton: false,
      });

      setOpenModal(false);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo crear la cotización.",
      });
      throw err;
    }
  };

  const handleUpdate = async (payload: {
    quoteId: number;
    deliveryDate: string;
    priority: QuoteUpdatePayload["priority"];
    items: {
      articleId: number | null;
      fabricTypeId: number | null;
      qty: number;
      price: number;
    }[];
    iva: boolean;
    sending: boolean;
    shippingAmount: number;
    total: number;
  }) => {
    try {
      await updateQuote(payload.quoteId, {
        deliveryDate: payload.deliveryDate,
        priority: payload.priority,
        iva: payload.iva,
        sending: payload.sending,
        shippingAmount: payload.sending ? payload.shippingAmount : 0,
        total: payload.total,
        articles: payload.items.map((i) => ({
          articleId: i.articleId!,
          fabricType: i.fabricTypeId!,
          amount: i.qty,
          unitPrice: i.price,
          subtotal: i.qty * i.price,
        })),
      });

      Swal.fire({
        icon: "success",
        title: "¡Listo!",
        text: "Cotización actualizada.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar la cotización.",
      });
      throw err;
    }
  };

  const handleAccept = async (quote: Quote) => {
    const result = await Swal.fire({
      title: "¿Aceptar cotización sin anticipo?",
      text: `${quote.folio} pasará a estado aceptada.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#d33",
      confirmButtonText: "Aceptar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const { message } = await acceptQuote(quote.id);

      Swal.fire({
        icon: "success",
        title: "¡Listo!",
        text: message,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      const message =
        (err as AxiosError<{ message?: string }>).response?.data?.message ??
        "No se pudo aceptar la cotización.";

      Swal.fire({ icon: "error", title: "Error", text: message });
    }
  };

  const handleAddIva = async (quote: Quote) => {
    const result = await Swal.fire({
      title: "¿Agregar IVA?",
      text: `Se agregará IVA a ${quote.folio} y se recalculará su total.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#7c3aed",
      cancelButtonColor: "#d33",
      confirmButtonText: "Agregar IVA",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const { message } = await addQuoteIva(quote.id);

      // El modal tiene una copia vieja de la cotización, hay que cerrarlo
      setEditingQuote(null);

      Swal.fire({
        icon: "success",
        title: "¡Listo!",
        text: message,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      const message =
        (err as AxiosError<{ message?: string }>).response?.data?.message ??
        "No se pudo agregar el IVA.";

      Swal.fire({ icon: "error", title: "Error", text: message });
    }
  };

  return (
    <main className="mx-auto w-full px-6 py-8">
      <QuoteHeader onNewQuote={() => setOpenModal(true)} />

      <QuoteFilters
        search={search}
        priority={priority}
        status={status}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onSearch={setSearch}
        onStatusChange={setStatus}
        onPriorityChange={setPriority}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onClearFilters={handleClearFilters}
      />

      {loading && <p className="text-sm text-slate-400">Cargando cotizaciones...</p>}
      {error && <p className="text-sm text-red-500">Error al cargar cotizaciones.</p>}

      {!loading && !error && (
        <QuoteTable
          quotes={quotes}
          onPreview={setPreviewQuote}
          onEdit={setEditingQuote}
          onAccept={handleAccept}
          onPay={setPayingQuote}
          onDelete={async (quote) => {
            const result = await Swal.fire({
              title: "¿Estás seguro?",
              text: "Esta acción no se puede deshacer.",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Eliminar",
            });

            if (result.isConfirmed) {
              await deleteQuote(quote.id);
            }
          }}
        />
      )}

      {!loading && !error && pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Página {pagination.page} de {pagination.totalPages} · {pagination.total} cotizaciones
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!pagination.hasPrev}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!pagination.hasNext}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      <QuoteFormModal
        open={openModal}
        isAdmin={isAdmin}
        clients={clients}
        articles={articles}
        fabricTypes={fabricTypes}
        onClose={() => setOpenModal(false)}
        onSave={handleCreate}
      />

      <QuoteEditModal
        open={editingQuote !== null}
        isAdmin={isAdmin}
        quote={editingQuote}
        articles={articles}
        fabricTypes={fabricTypes}
        onClose={() => setEditingQuote(null)}
        onAddIva={handleAddIva}
        onSave={handleUpdate}
      />

      <QuotePreviewModal
        quote={previewQuote}
        onClose={() => setPreviewQuote(null)}
      />

      <AddPaymentModal
        quote={payingQuote}
        onClose={() => setPayingQuote(null)}
        onSaved={refetch}
      />
    </main>
  );
};

export default Quotes;
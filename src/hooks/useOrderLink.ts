import { useState } from "react";
import { addOrderLink } from "../services/orderLink.service";
import { getApiErrorMessage } from "../utils/apiError";

type GenerateResult = { url: string } | { error: string };

export function useOrderLink(orderId: number) {
  const [link, setLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate(): Promise<GenerateResult> {
    setLoading(true);
    try {
      const { token } = await addOrderLink(orderId);
      const url = `${window.location.origin}/form/${token}`;
      setLink(url);
      return { url };
    } catch (e) {
      return { error: getApiErrorMessage(e, "No se pudo generar el link. Inténtalo de nuevo.") };
    } finally {
      setLoading(false);
    }
  }

  return { link, loading, generate };
}
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { getClientAddressById } from "../../services/client-address.service";
import type { ClientAddress } from "../../types/client";

const cache = new Map<number, Promise<ClientAddress>>();

function loadAddress(id: number) {
  let request = cache.get(id);
  if (!request) {
    request = getClientAddressById(id);
    request.catch(() => cache.delete(id));
    cache.set(id, request);
  }
  return request;
}

interface Props {
  sending: number;
  addressId: number | null;
}

export default function DeliveryAddressInfo({ sending, addressId }: Props) {
  const [address, setAddress] = useState<ClientAddress | null>(null);

  useEffect(() => {
    if (sending !== 1 || addressId == null) {
      setAddress(null);
      return;
    }

    let cancelled = false;
    loadAddress(addressId)
      .then((a) => !cancelled && setAddress(a))
      .catch(() => !cancelled && setAddress(null));

    return () => {
      cancelled = true;
    };
  }, [sending, addressId]);

  if (sending !== 1 || addressId == null || !address) return null;

  const text = `${address.street} ${address.number}, ${address.neighborhood}, ${address.city}, ${address.state}, C.P. ${address.zipCode}`;

  return (
    <p className="mt-1 flex max-w-[240px] items-start gap-1 text-m text-gray-500" title={text}>
      <MapPin size={14} className="mt-0.5 shrink-0" />
      <span className="truncate">{`${address.street} ${address.number}, ${address.neighborhood}`}</span>
    </p>
  );
}
import { Mail, Phone, Building2, FileText, MapPin, Receipt, CalendarDays } from "lucide-react";
import type { Client } from "../../types/client";
import { FISCAL_REGIMES, CFDI_USES, catalogLabel } from "../../constants/sat-catalogs";

interface ClientContactInfoProps {
  client: Client;
}


function formatDate(value: string) {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return value;
  return new Date(y, m - 1, d).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function InfoRow({
  icon: Icon,
  children,
  title,
}: {
  icon: typeof Mail;
  children: string;
  title?: string;
}) {
  return (
    <div className="flex items-center gap-2" title={title ?? children}>
      <Icon className="size-5 shrink-0 text-gray-600" />
      <span className="truncate text-gray-600">{children}</span>
    </div>
  );
}

export function ClientContactInfo({ client }: ClientContactInfoProps) {
  const regime = catalogLabel(FISCAL_REGIMES, client.fiscalRegime);
  const cfdiUse = catalogLabel(CFDI_USES, client.cfdiUse);

  const hasFiscal = Boolean(
    client.fiscalName || regime || client.fiscalZipCode || cfdiUse
  );

  return (
    <div className="mt-4 space-y-3 text-sm">
      <div className="space-y-1.5">
        {client.email && <InfoRow icon={Mail}>{client.email}</InfoRow>}
        {client.phone && <InfoRow icon={Phone}>{client.phone}</InfoRow>}
      </div>

      <div className="space-y-1.5 border-t border-gray-100 pt-3">
        {hasFiscal ? (
          <>
            {client.fiscalName && <InfoRow icon={Building2}>{client.fiscalName}</InfoRow>}
            {regime && <InfoRow icon={FileText}>{regime}</InfoRow>}
            {client.fiscalZipCode && (
              <InfoRow icon={MapPin}>{`C.P. fiscal ${client.fiscalZipCode}`}</InfoRow>
            )}
            {cfdiUse && <InfoRow icon={Receipt}>{cfdiUse}</InfoRow>}
          </>
        ) : (
          <p className="text-xs text-gray-400">Sin datos fiscales</p>
        )}
      </div>

      {client.registrationDate && (
        <div className="border-t border-gray-100 pt-3 text-xs">
          <InfoRow icon={CalendarDays}>{`Registrado el ${formatDate(client.registrationDate)}`}</InfoRow>
        </div>
      )}
    </div>
  );
}
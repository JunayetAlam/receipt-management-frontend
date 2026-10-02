"use client";

import { Phone, MapPin, Mail } from "lucide-react";

export default function CustomerTransactionFooter({
  pageNo,
  pageCount,
  contactPhones,
  contactLocations,
  contactEmails,
}: {
  pageNo: number;
  pageCount: number;
  contactPhones?: string;
  contactLocations?: string;
  contactEmails?: string;
}) {
  const hasRow1 = Boolean(contactLocations || contactPhones);

  return (
    <div className="w-full bg-primary text-primary-foreground py-2 px-9 flex flex-col gap-y-1 text-[11px] font-medium">
      {/* Row 1: Address (Left) & Phone Number (Right) */}
      {hasRow1 && (
        <div className="flex items-center justify-between gap-4 w-full">
          {contactLocations ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="size-3 text-primary-foreground/80 shrink-0" />
              <span className="truncate">{contactLocations}</span>
            </div>
          ) : (
            <span />
          )}

          {contactPhones ? (
            <div className="flex items-center gap-1.5 shrink-0 ml-auto">
              <Phone className="size-3 text-primary-foreground/80 shrink-0" />
              <span>{contactPhones}</span>
            </div>
          ) : (
            <span />
          )}
        </div>
      )}

      {/* Row 2: Mail (Left) & Page Number (Right) */}
      <div className="flex items-center justify-between gap-4 w-full">
        {contactEmails ? (
          <div className="flex items-center gap-1.5 min-w-0">
            <Mail className="size-3 text-primary-foreground/80 shrink-0" />
            <span className="truncate">{contactEmails}</span>
          </div>
        ) : !hasRow1 ? (
          <span className="tracking-wide uppercase text-primary-foreground/80">
            Customer Transactions
          </span>
        ) : (
          <span />
        )}

        <div className="shrink-0 font-mono text-[11px] font-semibold text-primary-foreground ml-auto">
          Page {pageNo} of {pageCount}
        </div>
      </div>
    </div>
  );
}

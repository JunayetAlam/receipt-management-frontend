"use client";

import { Phone, MapPin, Mail, Clock } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function RIV_Footer({
  isLastPage,
  pageNo,
  pageCount,
  contactPhones,
  contactLocations,
  contactEmails,
  copyType,
}: {
  isLastPage: boolean;
  pageNo: number;
  pageCount: number;
  contactPhones: string;
  contactLocations: string;
  contactEmails: string;
  copyType?: string;
}) {
  const [printTime, setPrintTime] = useState("");

  useEffect(() => {
    const d = new Date();
    const dateFormatted = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(d);
    const timeFormatted = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d);
    setPrintTime(`${dateFormatted} ${timeFormatted}`);
  }, []);

  return (
    <div className="w-full">
      {isLastPage && (
        <div className="flex flex-col sm:flex-row justify-between items-end gap-4 w-full px-10 pb-3 print:flex-row">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Thank you for your business!
            </p>
          </div>
          <div className="w-56 text-center">
            <div className="border-b-2 border-primary/60 pb-1 mb-2 h-15"></div>
            <p className="text-xs font-semibold text-slate-700">
              Authorized Signed
            </p>
          </div>
        </div>
      )}
      <div className="bg-primary text-primary-foreground py-3.5 px-9 flex flex-col gap-2.5 text-xs font-medium">
        {/* Phone and email take only the width they need; the address gets all
            the remaining width so it stays on one line. */}
        <div className="flex items-center gap-6">
          {contactPhones && (
            <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
              <Phone className="size-3.5 text-primary-foreground/90 shrink-0" />
              <span>{contactPhones}</span>
            </div>
          )}

          {contactEmails && (
            <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
              <Mail className="size-3.5 text-primary-foreground/90 shrink-0" />
              <span>{contactEmails}</span>
            </div>
          )}

          {contactLocations && (
            <div className="flex items-center justify-end gap-2 flex-1 min-w-0">
              <MapPin className="size-3.5 text-primary-foreground/90 shrink-0" />
              <span className="truncate" title={contactLocations}>
                {contactLocations}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 font-mono text-[11px]">
          <span className="font-semibold text-primary-foreground whitespace-nowrap">
            {copyType}
          </span>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {printTime && (
              <span className="text-primary-foreground/80 flex items-center gap-1.5 whitespace-nowrap">
                <Clock className="size-3 opacity-70 shrink-0" />
                <span>Printed: {printTime}</span>
              </span>
            )}
            <span className="font-semibold text-primary-foreground whitespace-nowrap">
              Page {pageNo} of {pageCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

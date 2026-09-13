import { Phone, MapPin, Mail } from "lucide-react";
import React from "react";

export default function RIV_Footer({
  isLastPage,
  pageNo,
  pageCount,
  contactPhones,
  contactLocations,
  contactEmails,
}: {
  isLastPage: boolean;
  pageNo: number;
  pageCount: number;
  contactPhones: string;
  contactLocations: string;
  contactEmails: string;
}) {
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
      <div className="bg-primary text-primary-foreground py-3.5 px-9 flex flex-wrap justify-between items-center gap-3 text-xs font-medium">
        {contactPhones && (
          <div className="flex items-center gap-2">
            <Phone className="size-3.5 text-primary-foreground/90 shrink-0" />
            <span>{contactPhones}</span>
          </div>
        )}

        {contactLocations && (
          <div className="flex items-center gap-2">
            <MapPin className="size-3.5 text-primary-foreground/90 shrink-0" />
            <span>{contactLocations}</span>
          </div>
        )}

        {contactEmails && (
          <div className="flex items-center gap-2">
            <Mail className="size-3.5 text-primary-foreground/90 shrink-0" />
            <span>{contactEmails}</span>
          </div>
        )}

        <span className="font-semibold ml-auto shrink-0">
          Page {pageNo} of {pageCount}
        </span>
      </div>
    </div>
  );
}

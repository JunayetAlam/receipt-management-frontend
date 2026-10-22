'use client'
import { TMeta } from "@/types";
import PageNav from "@/components/Global/PageNav";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchParams } from "next/navigation";
import useHandleSearchParams from "@/hooks/useHandleSearchParams";

export default function DefaultPagination({ meta, showItemPerPage = true }: { meta: TMeta, showItemPerPage?: boolean }) {
  const searchParams = useSearchParams();
  const { handleSetSearchParams } = useHandleSearchParams()
  const currentLimit = searchParams.get("limit") || String(meta.limit);

  const handleLimitChange = (value: string) => {
    handleSetSearchParams({ limit: value, page: "1" })
  };

  return (
    <div className="flex flex-col justify-end gap-4 mt-6">
      {/* Pagination Controls */}
      <PageNav
        page={meta.page}
        totalPage={meta.totalPage}
        onPageChange={(p) => handleSetSearchParams({ page: String(p) })}
      />
      {/* Limit Selector */}
      {
        showItemPerPage && <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-muted-foreground">Items per page:</span>
          <Select defaultValue={currentLimit} onValueChange={handleLimitChange}>
            <SelectTrigger className="w-[80px] h-9">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {[2, 5, 10, 20, 30, 50, 100].map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }



    </div>
  );
}

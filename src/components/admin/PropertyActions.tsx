"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PencilLine, Trash2, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { requestJson } from "@/lib/client-api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function PropertyActions({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function remove() {
    setPending(true);
    try {
      await requestJson(
        `/api/admin/properties/${id}`,
        { method: "DELETE" },
        "Không thể xóa tin đăng",
      );
      toast.success("Đã xóa tin đăng");
      router.refresh();
    } catch {
      toast.error("Không thể xóa tin. Vui lòng thử lại.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="tableActions">
      <Button asChild variant="outline" size="sm" className="tableActionEdit">
        <Link href={`/admin/properties/${id}/edit`} aria-label="Sửa tin đăng">
          <PencilLine aria-hidden="true" />
          Sửa
        </Link>
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="sm"
            className="tableActionDelete"
            aria-label="Xóa tin đăng"
          >
            <Trash2 aria-hidden="true" />
            Xóa
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="propertyDeleteDialog">
          <AlertDialogHeader className="propertyDeleteDialogHeader">
            <span className="propertyDeleteDialogIcon" aria-hidden="true">
              <TriangleAlert />
            </span>
            <AlertDialogTitle>Xóa tin đăng này?</AlertDialogTitle>
            <AlertDialogDescription>
              Tin sẽ bị ẩn khỏi website và chuyển sang trạng thái đã xóa. Hành
              động này không ảnh hưởng đến các khách hàng đã liên hệ.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="propertyDeleteDialogFooter">
            <AlertDialogCancel>Giữ lại</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pending}
              onClick={(event) => {
                event.preventDefault();
                void remove();
              }}
            >
              {pending ? "Đang xóa…" : "Xóa tin"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

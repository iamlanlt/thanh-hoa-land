"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { leadSchema } from "@/lib/validations";
import type { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { requestJson } from "@/lib/client-api";

type Values = z.infer<typeof leadSchema>;

export function LeadForm({
  propertyId,
  brandName,
}: {
  propertyId?: string;
  brandName: string;
}) {
  const [message, setMessage] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      propertyId: propertyId || "",
      consent: false,
      website: "",
    },
  });
  async function submit(values: Values) {
    setMessage("");
    try {
      await requestJson(
        "/api/leads",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
        "Không thể gửi thông tin, vui lòng thử lại.",
      );
      reset({
        name: "",
        phone: "",
        location: "",
        budget: "",
        message: "",
        propertyId: propertyId || "",
        consent: false,
        website: "",
      });
      setMessage("Đã nhận thông tin. Chúng tôi sẽ liên hệ với bạn sớm nhất.");
      toast.success("Đã gửi yêu cầu tư vấn");
    } catch (requestError) {
      const errorMessage =
        requestError instanceof Error
          ? requestError.message
          : "Không thể kết nối. Vui lòng thử lại sau.";
      setMessage(errorMessage);
      toast.error(errorMessage);
    }
  }
  return (
    <form className="leadForm" onSubmit={handleSubmit(submit)}>
      <div className="formGrid">
        <label>
          Họ và tên
          <Input
            {...register("name")}
            aria-invalid={errors.name ? "true" : "false"}
            autoComplete="name"
            placeholder="Nguyễn Văn A"
          />
          {errors.name && (
            <small className="fieldError" role="alert">{errors.name.message}</small>
          )}
        </label>
        <label>
          Số điện thoại
          <Input
            {...register("phone")}
            aria-invalid={errors.phone ? "true" : "false"}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="09xx xxx xxx"
          />
          {errors.phone && (
            <small className="fieldError" role="alert">{errors.phone.message}</small>
          )}
        </label>
        <label>
          Khu vực quan tâm
          <Input
            {...register("location")}
            autoComplete="address-level2"
            placeholder="Ví dụ: Quảng Xương"
          />
        </label>
        <label>
          Khoảng ngân sách
          <Input {...register("budget")} placeholder="Ví dụ: 1–2 tỷ" />
        </label>
      </div>
      <label>
        Nhu cầu của bạn
        <Textarea
          rows={4}
          {...register("message")}
          placeholder="Bạn đang quan tâm khu vực hoặc sản phẩm nào?"
        />
      </label>
      <label className="consentLabel">
        <input type="checkbox" {...register("consent")} />
        <span>
          Tôi đồng ý để {brandName} liên hệ tư vấn.{" "}
          <Link href="/privacy">Chính sách bảo mật</Link>
        </span>
        {errors.consent && (
          <small className="fieldError" role="alert">{errors.consent.message}</small>
        )}
      </label>
      <input
        className="honeypot"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        {...register("website")}
      />
      <input type="hidden" {...register("propertyId")} />
      {message && (
        <p
          className={message.startsWith("Đã") ? "formSuccess" : "formError"}
          role={message.startsWith("Đã") ? "status" : "alert"}
          aria-live="polite"
        >
          {message}
        </p>
      )}
      <Button
        type="submit"
        size="lg"
        className="button h-12 bg-primary px-6 text-primary-foreground"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="spin" size={17} aria-hidden="true" />
            Đang gửi…
          </>
        ) : (
          "Nhận tư vấn miễn phí"
        )}
      </Button>
    </form>
  );
}

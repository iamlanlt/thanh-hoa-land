import { MapPinned, MessageCircleMore, PhoneCall } from "lucide-react";

type ContactActionsVariant = "contact" | "detail" | "mobile";

type ContactActionsProps = {
  phone: string;
  zaloUrl: string;
  mapUrl?: string;
  variant?: ContactActionsVariant;
};

const variantStyles: Record<
  ContactActionsVariant,
  { container?: string; primary?: string; secondary?: string }
> = {
  contact: {
    container: "contactActions",
    primary: "button light",
    secondary: "button outline",
  },
  detail: {
    container: "detailActions",
    primary: "button",
    secondary: "button secondary darkButton",
  },
  mobile: {},
};

export function ContactActions({
  phone,
  zaloUrl,
  mapUrl,
  variant = "contact",
}: ContactActionsProps) {
  const isMobile = variant === "mobile";
  const styles = variantStyles[variant];
  const callLabel = isMobile ? "Gọi tư vấn" : "Liên hệ tư vấn";

  const actions = (
    <>
      <a
        className={styles.primary}
        href={`tel:${phone}`}
        aria-label={`${callLabel} qua số ${phone}`}
      >
        <PhoneCall size={18} aria-hidden="true" />
        {callLabel}
      </a>
      <a
        className={styles.secondary}
        href={zaloUrl}
        target="_blank"
        rel="noreferrer"
      >
        <MessageCircleMore size={18} aria-hidden="true" />
        {isMobile ? "Nhắn Zalo" : "Chat Zalo"}
      </a>
      {variant === "detail" && mapUrl ? (
        <a
          className={styles.secondary}
          href={mapUrl}
          target="_blank"
          rel="noreferrer"
        >
          <MapPinned size={18} aria-hidden="true" />
          Mở bản đồ
        </a>
      ) : null}
    </>
  );

  if (isMobile) return actions;

  return (
    <div className={styles.container}>{actions}</div>
  );
}

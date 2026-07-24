"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Banknote,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  Eye,
  HeartHandshake,
  MapPin,
  MessageCircle,
  MessageSquareText,
  PencilLine,
  Phone,
  Save,
  Search,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { FilterSelect } from "@/components/ui/filter-select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AdminMetricGrid } from "@/components/admin/AdminPage";
import { AdminPagination } from "@/components/admin/AdminPagination";
import {
  formatLeadDate,
  getLeadStatusLabel,
  LEAD_STATUS_OPTIONS,
} from "@/lib/lead-status";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { requestJson } from "@/lib/client-api";
import { useDebouncedQuery } from "@/hooks/use-debounced-query";

type LeadFilters = { query?: string; status?: string };

function pageHref(filters: LeadFilters, page: number) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  params.set("page", String(page));
  return `/admin/leads?${params.toString()}`;
}

type Lead = {
  id: string;
  name: string;
  phone: string;
  location: string | null;
  budget: string | null;
  message: string | null;
  status: string;
  note: string | null;
  createdAt: string;
  property: { title: string } | null;
};

function LeadCareEditor({
  lead,
  saving,
  feedback,
  mode = "inline",
  onSave,
}: {
  lead: Lead;
  saving: boolean;
  feedback?: string;
  mode?: "inline" | "detail";
  onSave: (status: string, note: string) => Promise<void>;
}) {
  const [draftStatus, setDraftStatus] = useState(lead.status);
  const [draftNote, setDraftNote] = useState(lead.note || "");

  useEffect(() => {
    setDraftStatus(lead.status);
    setDraftNote(lead.note || "");
  }, [lead.id, lead.note, lead.status]);

  const hasChanges =
    draftStatus !== lead.status || draftNote.trim() !== (lead.note || "").trim();

  if (mode === "detail") {
    return (
      <section className="leadDetailEditor" aria-label="Cập nhật chăm sóc khách hàng">
        <div className="leadDetailEditorHeading">
          <span><PencilLine size={17} aria-hidden="true" /></span>
          <div>
            <h4>Cập nhật chăm sóc</h4>
            <p>Điều chỉnh trạng thái và lưu ghi chú ngay trong hồ sơ.</p>
          </div>
        </div>
        <div className="leadStatusPicker">
          <FilterSelect
            label="Trạng thái chăm sóc"
            value={draftStatus}
            displayValue={getLeadStatusLabel(draftStatus)}
            options={LEAD_STATUS_OPTIONS}
            onChange={setDraftStatus}
            Icon={CheckCircle2}
          />
        </div>
        <label className="noteField leadDetailNoteField">
          <span>Ghi chú tư vấn</span>
          <Textarea
            value={draftNote}
            onChange={(event) => setDraftNote(event.target.value)}
            placeholder="Ghi lại kết quả cuộc gọi hoặc bước chăm sóc tiếp theo…"
            maxLength={2000}
            disabled={saving}
          />
        </label>
        <div className="leadDetailEditorActions">
          <small
            className="leadSaveState"
            data-error={feedback?.startsWith("Không")}
            aria-live="polite"
          >
            {feedback || (hasChanges ? "Có thay đổi chưa lưu" : "")}
          </small>
          <Button
            type="button"
            size="sm"
            disabled={!hasChanges || saving}
            onClick={() => void onSave(draftStatus, draftNote)}
          >
            <Save aria-hidden="true" /> {saving ? "Đang lưu…" : "Lưu cập nhật"}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <div className="leadControls">
      <div className="leadStatusPicker">
        <FilterSelect
          label="Trạng thái chăm sóc"
          value={draftStatus}
          displayValue={getLeadStatusLabel(draftStatus)}
          options={LEAD_STATUS_OPTIONS}
          onChange={(status) => {
            setDraftStatus(status);
            void onSave(status, draftNote);
          }}
          Icon={CheckCircle2}
        />
      </div>
      <label className="noteField">
        <span>Ghi chú tư vấn</span>
        <input
          value={draftNote}
          placeholder="Thêm ghi chú sau cuộc gọi…"
          maxLength={2000}
          onChange={(event) => setDraftNote(event.target.value)}
          onBlur={(event) => {
            if (event.target.value.trim() !== (lead.note || "").trim()) {
              void onSave(draftStatus, event.target.value);
            }
          }}
          disabled={saving}
        />
      </label>
      {feedback && (
        <small
          className="leadSaveState"
          data-error={feedback.startsWith("Không")}
          aria-live="polite"
        >
          {feedback}
        </small>
      )}
    </div>
  );
}

type Props = {
  leads: Lead[];
  filters: LeadFilters;
  pagination: { page: number; pageCount: number; total: number };
  stats: { total: number; newCount: number; activeCount: number };
};

export function LeadManager({ leads, filters, pagination, stats }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(leads);
  const [saving, setSaving] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [isFiltering, startFiltering] = useTransition();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const hasFilters = Boolean(filters.query || filters.status);

  useEffect(() => setItems(leads), [leads]);

  function navigate(nextFilters: LeadFilters, mode: "push" | "replace" = "push") {
    const params = new URLSearchParams();
    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const href = params.size ? `/admin/leads?${params.toString()}` : "/admin/leads";
    startFiltering(() => {
      router[mode](href, { scroll: false });
    });
  }

  const [query, setQuery] = useDebouncedQuery(filters.query, (nextQuery) => {
    navigate({ ...filters, query: nextQuery }, "replace");
  });

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate({ ...filters, query: query.trim() || undefined });
  }

  async function update(id: string, status: string, note: string) {
    setSaving(id);
    setFeedback((current) => ({ ...current, [id]: "Đang lưu…" }));
    try {
      await requestJson(
        `/api/leads/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, note }),
        },
        "Không thể cập nhật khách hàng",
      );
      setItems((current) =>
        current.map((lead) =>
          lead.id === id ? { ...lead, status, note } : lead,
        ),
      );
      setFeedback((current) => ({ ...current, [id]: "Đã lưu" }));
      window.setTimeout(() => {
        setFeedback((current) => {
          if (current[id] !== "Đã lưu") return current;
          const next = { ...current };
          delete next[id];
          return next;
        });
      }, 2200);
    } catch {
      setFeedback((current) => ({
        ...current,
        [id]: "Không thể lưu, vui lòng thử lại",
      }));
    } finally {
      setSaving(null);
    }
  }
  const selectedLead = items.find((lead) => lead.id === selectedLeadId) ?? null;
  return (
    <div className="leadWorkspace">
      <AdminMetricGrid
        className="leadSummary"
        label="Tổng quan khách hàng"
        metrics={[
          { label: "Tổng khách", value: stats.total, icon: <UsersRound size={20} aria-hidden="true" /> },
          { label: "Khách mới", value: stats.newCount, icon: <CircleDot size={20} aria-hidden="true" /> },
          { label: "Đang chăm sóc", value: stats.activeCount, icon: <HeartHandshake size={20} aria-hidden="true" /> },
        ]}
      />
      <form className="leadToolbar" role="search" onSubmit={submitSearch} aria-busy={isFiltering}>
        <label className="leadSearch">
          <Search size={18} aria-hidden="true" />
          <span className="srOnly">Tìm khách hàng</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm tên, số điện thoại, nhu cầu…"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Xóa từ khóa"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </label>
        <div className="leadToolbarFilter">
          <FilterSelect
            label="Trạng thái"
            value={filters.status || "ALL"}
            displayValue={
              filters.status ? getLeadStatusLabel(filters.status) : "Tất cả khách"
            }
            options={[
              { value: "ALL", label: "Tất cả khách" },
              ...LEAD_STATUS_OPTIONS,
            ]}
            onChange={(status) =>
              navigate({
                ...filters,
                query: query.trim() || undefined,
                status: status === "ALL" ? undefined : status,
              })
            }
            Icon={CheckCircle2}
          />
        </div>
        <span className="leadResultCount">
          <strong>{pagination.total}</strong> khách đang hiển thị
        </span>
      </form>
      <div className="leadList">
        {pagination.total === 0 && !hasFilters ? (
          <div className="emptyState">Chưa có khách hàng trong database.</div>
        ) : items.length === 0 ? (
          <div className="emptyState propertyEmpty">
            <Search size={28} aria-hidden="true" />
            <strong>Không tìm thấy khách phù hợp</strong>
            <span>Thử đổi từ khóa hoặc trạng thái chăm sóc.</span>
            <button
              type="button"
              className="button secondary darkButton"
              onClick={() => navigate({})}
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          items.map((lead) => (
            <article className="leadItem" key={lead.id}>
              <header className="leadCardHeader">
                <div className="leadIdentity">
                  <span className="leadAvatar">
                    <UserRound size={19} aria-hidden="true" />
                  </span>
                  <div className="leadIdentityBody">
                    <div className="leadIdentityHeading">
                      <h3>{lead.name}</h3>
                      <span className="leadBadge" data-status={lead.status}>
                        <CheckCircle2 size={13} aria-hidden="true" />
                        {getLeadStatusLabel(lead.status)}
                      </span>
                    </div>
                    <a className="leadPhone" href={`tel:${lead.phone}`}>
                      <Phone size={15} aria-hidden="true" />
                      {lead.phone}
                    </a>
                  </div>
                </div>
                <div className="leadQuickActions" aria-label={`Thao tác với ${lead.name}`}>
                  <a href={`tel:${lead.phone}`}>
                    <Phone size={14} aria-hidden="true" /> Gọi ngay
                  </a>
                  <a
                    href={`https://zalo.me/${lead.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle size={14} aria-hidden="true" /> Mở Zalo
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedLeadId(lead.id)}
                  >
                    <Eye size={14} aria-hidden="true" /> Chi tiết
                  </button>
                </div>
                <div className="leadDate">
                  <CalendarClock size={14} aria-hidden="true" />
                  <time>{formatLeadDate(lead.createdAt)}</time>
                </div>
              </header>
              <div className="leadCardContent">
                <p className="leadMessage">
                  <MessageSquareText size={16} aria-hidden="true" />
                  {lead.message || "Không có nhu cầu ghi chú."}
                </p>
                <div className="leadMeta">
                  <span>
                    <MapPin size={14} aria-hidden="true" />
                    {lead.location || "Chưa có khu vực"}
                  </span>
                  <span>
                    <Banknote size={14} strokeWidth={1.8} aria-hidden="true" />
                    {lead.budget || "Chưa có ngân sách"}
                  </span>
                  {lead.property && <span className="leadPropertyInterest">Quan tâm: {lead.property.title}</span>}
                </div>
              </div>
              <LeadCareEditor
                lead={lead}
                saving={saving === lead.id}
                feedback={feedback[lead.id]}
                onSave={(status, note) => update(lead.id, status, note)}
              />
            </article>
          ))
        )}
      </div>
      <Sheet
        open={Boolean(selectedLead)}
        onOpenChange={(open) => {
          if (!open) setSelectedLeadId(null);
        }}
      >
        <SheetContent className="leadDetailSheet" aria-label="Chi tiết khách hàng">
          {selectedLead ? (
            <>
              <SheetHeader className="leadDetailHeader">
                <div className="leadDetailIdentity">
                  <span className="leadDetailAvatar">
                    <UserRound size={22} aria-hidden="true" />
                  </span>
                  <div>
                    <SheetTitle>{selectedLead.name}</SheetTitle>
                    <SheetDescription>
                      Hồ sơ nhu cầu và lịch sử chăm sóc
                    </SheetDescription>
                  </div>
                </div>
                <span
                  className="leadBadge leadDetailStatus"
                  data-status={selectedLead.status}
                >
                  <CheckCircle2 size={13} aria-hidden="true" />
                  {getLeadStatusLabel(selectedLead.status)}
                </span>
              </SheetHeader>

              <div className="leadDetailBody">
                <dl className="leadDetailGrid">
                  <div>
                    <dt><Phone size={15} aria-hidden="true" /> Số điện thoại</dt>
                    <dd>{selectedLead.phone}</dd>
                  </div>
                  <div>
                    <dt><CalendarClock size={15} aria-hidden="true" /> Thời gian gửi</dt>
                    <dd>{formatLeadDate(selectedLead.createdAt)}</dd>
                  </div>
                  <div>
                    <dt><MapPin size={15} aria-hidden="true" /> Khu vực</dt>
                    <dd>{selectedLead.location || "Chưa cung cấp"}</dd>
                  </div>
                  <div>
                    <dt><Banknote size={15} aria-hidden="true" /> Ngân sách</dt>
                    <dd>{selectedLead.budget || "Chưa cung cấp"}</dd>
                  </div>
                </dl>

                <LeadCareEditor
                  lead={selectedLead}
                  saving={saving === selectedLead.id}
                  feedback={feedback[selectedLead.id]}
                  mode="detail"
                  onSave={(status, note) =>
                    update(selectedLead.id, status, note)
                  }
                />

                <section className="leadDetailSection">
                  <h4><MessageSquareText size={16} aria-hidden="true" /> Nhu cầu khách hàng</h4>
                  <p>{selectedLead.message || "Khách hàng chưa để lại nội dung."}</p>
                </section>

                <section className="leadDetailSection">
                  <h4><HeartHandshake size={16} aria-hidden="true" /> Bất động sản quan tâm</h4>
                  <p>{selectedLead.property?.title || "Chưa gắn với tin đăng cụ thể."}</p>
                </section>
              </div>

              <SheetFooter className="leadDetailFooter">
                <a className="button" href={`tel:${selectedLead.phone}`}>
                  <Phone size={16} aria-hidden="true" /> Gọi ngay
                </a>
                <a
                  className="button secondary darkButton"
                  href={`https://zalo.me/${selectedLead.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle size={16} aria-hidden="true" /> Mở Zalo
                </a>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
      <AdminPagination
        page={pagination.page}
        pageCount={pagination.pageCount}
        className="leadPagination"
        ariaLabel="Phân trang khách hàng"
        getHref={(page) => pageHref(filters, page)}
      />
    </div>
  );
}

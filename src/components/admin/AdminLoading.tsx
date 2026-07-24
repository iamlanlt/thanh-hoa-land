import { Skeleton } from "@/components/ui/skeleton";

const metricItems = Array.from({ length: 3 });
const filterItems = Array.from({ length: 4 });
const recordItems = Array.from({ length: 4 });

export function AdminLoadingContent() {
  return (
    <div
      className="adminLoading"
      aria-busy="true"
      aria-label="Đang tải trang quản trị"
    >
      <div className="adminLoadingIntro" aria-hidden="true">
        <div>
          <Skeleton className="adminLoadingEyebrow" />
          <Skeleton className="adminLoadingTitle" />
          <Skeleton className="adminLoadingDescription" />
        </div>
        <Skeleton className="adminLoadingCta" />
      </div>

      <div className="adminLoadingStats" aria-hidden="true">
        {metricItems.map((_, index) => (
          <div className="adminLoadingStat" key={index}>
            <Skeleton className="adminLoadingStatIcon" />
            <Skeleton className="adminLoadingStatLabel" />
            <Skeleton className="adminLoadingStatValue" />
          </div>
        ))}
      </div>

      <div className="adminLoadingToolbar" aria-hidden="true">
        <Skeleton className="adminLoadingSearch" />
        <div className="adminLoadingFilters">
          {filterItems.map((_, index) => (
            <Skeleton className="adminLoadingFilter" key={index} />
          ))}
          <Skeleton className="adminLoadingCount" />
        </div>
      </div>

      <div className="adminLoadingList" aria-hidden="true">
        {recordItems.map((_, index) => (
          <div className="adminLoadingRecord" key={index}>
            <Skeleton className="adminLoadingRecordImage" />
            <div className="adminLoadingRecordContent">
              <Skeleton className="adminLoadingRecordTitle" />
              <Skeleton className="adminLoadingRecordMeta" />
              <Skeleton className="adminLoadingRecordDetails" />
            </div>
            <div className="adminLoadingRecordActions">
              <Skeleton />
              <Skeleton />
              <Skeleton />
              <Skeleton />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

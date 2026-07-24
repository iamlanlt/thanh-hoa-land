import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="loadingPage" aria-busy="true" aria-label="Đang tải nội dung">
      <div className="loadingHeader" aria-hidden="true">
        <div className="container loadingHeaderInner">
          <div className="loadingBrand">
            <Skeleton className="loadingBrandMark" />
            <Skeleton className="loadingBrandName" />
          </div>
          <div className="loadingNav">
            <Skeleton /><Skeleton /><Skeleton /><Skeleton className="loadingNavCall" />
          </div>
        </div>
      </div>
      <main className="container loadingContent">
        <div className="loadingIntro" aria-hidden="true">
          <Skeleton className="loadingEyebrow" />
          <Skeleton className="loadingTitle" />
          <Skeleton className="loadingDescription" />
        </div>
        <div className="loadingGrid" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="loadingCard" key={index}>
            <Skeleton className="loadingCardImage" />
            <div className="loadingCardBody">
              <Skeleton className="loadingLine loadingLineLocation" />
              <Skeleton className="loadingLine loadingLineTitle" />
              <Skeleton className="loadingLine loadingLineTitleShort" />
              <div className="loadingCardMeta">
                <Skeleton className="loadingLine loadingLineMeta" />
                <Skeleton className="loadingLine loadingLinePrice" />
              </div>
            </div>
          </div>
        ))}
        </div>
      </main>
    </div>
  );
}

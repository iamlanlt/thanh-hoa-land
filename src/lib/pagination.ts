export type PaginationItem = number | "start-ellipsis" | "end-ellipsis";

export function getPaginationItems(
  currentPage: number,
  pageCount: number,
): PaginationItem[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const items: PaginationItem[] = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(pageCount - 1, currentPage + 1);

  if (start > 2) items.push("start-ellipsis");
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < pageCount - 1) items.push("end-ellipsis");
  items.push(pageCount);

  return items;
}

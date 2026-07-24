export function jsonLdScriptProps(data: unknown) {
  return {
    dangerouslySetInnerHTML: {
      __html: JSON.stringify(data).replace(/</g, "\\u003c"),
    },
  };
}

type BreadcrumbItem = {
  name: string;
  item: string;
};

export function createBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(({ name, item }, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      item,
    })),
  };
}

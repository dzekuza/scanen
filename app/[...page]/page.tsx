import { builder } from "@builder.io/sdk";
import { RenderBuilderContent } from "../../components/builder";

// Initialize Builder.io
builder.init(process.env.BUILDER_PUBLIC_KEY!);

interface PageProps {
  params: {
    page: string[];
  };
}

export default async function Page(props: PageProps) {
  const urlPath = "/" + (props.params?.page?.join("/") || "");

  // Get the page content from Builder.io
  const content = await builder
    .get("page", {
      userAttributes: {
        urlPath,
      },
    })
    .toPromise();

  return (
    <>
      <RenderBuilderContent content={content} />
    </>
  );
}

export async function generateStaticParams() {
  // Get a list of all pages in Builder.io
  const pages = await builder.getAll("page", {
    fields: "data.url",
    options: { noTargeting: true },
  });

  return pages
    .map((page) => ({
      page: page.data?.url.replace("/", "").split("/").filter(Boolean) || [],
    }))
    .filter((page) => page.page.length > 0);
}

"use client";

import { BuilderComponent, useIsPreviewing } from "@builder.io/react";
import { BuilderContent } from "@builder.io/sdk";

interface BuilderPageProps {
  content: BuilderContent | null;
}

export function RenderBuilderContent({ content }: BuilderPageProps) {
  const isPreviewing = useIsPreviewing();

  if (content || isPreviewing) {
    return <BuilderComponent content={content ?? undefined} model="page" />;
  }

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Welcome to Builder.io + Next.js!</h1>
      <p>
        This is your Builder.io page. Create content in Builder.io to see it
        here.
      </p>
      <p>
        <a
          href={`https://builder.io/content/${process.env.NEXT_PUBLIC_BUILDER_KEY}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#0070f3", textDecoration: "underline" }}
        >
          Go to Builder.io to create content ���
        </a>
      </p>
    </div>
  );
}

import { Suspense } from "react";
import StartSessionClient from "./StartSessionClient";

export default function StartSessionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StartSessionClient />
    </Suspense>
  );
} 
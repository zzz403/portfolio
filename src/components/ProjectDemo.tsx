"use client";

import dynamic from "next/dynamic";

const demoMap: Record<string, React.ComponentType> = {
  youwoai: dynamic(() => import("./demos/YouWoDemo")),
  "openbrowser-ai": dynamic(() => import("./demos/OpenBrowserDemo")),
  "uoft-timetable": dynamic(() => import("./demos/TimetableDemo")),
  remeda: dynamic(() => import("./demos/RemedaDemo")),
};

export default function ProjectDemo({ slug }: { slug: string }) {
  const Demo = demoMap[slug];
  if (!Demo) return null;

  return (
    <div className="mt-10">
      <Demo />
    </div>
  );
}

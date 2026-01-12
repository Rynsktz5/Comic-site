import ChapterRow from "./ChapterRow";

export default function ChapterList({ chapters, comicId }: any) {
  return (
    <div className="space-y-4">
      {chapters.map((ch: any) => (
        <ChapterRow
          key={ch.id}
          chapter={ch}
          comicId={comicId}
        />
      ))}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Images } from "lucide-react";
import { useSeo } from "../lib/useSeo";
import SectionHeading from "../components/SectionHeading";
import { getGalleryAlbums } from "../data/content";

export default function Gallery() {
  useSeo({ title: 'Gallery', description: 'Photos from services, worship, conferences, youth activities and outreach at FGCK Christ Centre.' });
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    getGalleryAlbums().then(setAlbums);
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <SectionHeading eyebrow="Moments" title="Church Gallery" align="center" />
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {albums.map((a) => (
          <div key={a.id} className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink/5 ring-1 ring-ink/10">
            {a.cover_image ? (
              <img src={a.cover_image} alt={a.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-ink/30">
                <Images size={40} />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-5">
              <p className="font-display text-lg font-extrabold text-cream">{a.title}</p>
              <p className="text-xs text-cream/70">{a.image_count} photos</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

type Props = {
  name: string;
  slug: string;
  image?: string | null;
  index?: number;
};

export function CategoryCard({ name, slug, image, index = 0 }: Props) {
  return (
    <Link
      href={`/catalogo?categoria=${slug}`}
      className="group relative overflow-hidden rounded-card aspect-square flex items-end p-3 transition-all duration-300 hover:-translate-y-1"
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      }}
    >
      {image ? (
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
      ) : (
        <div className="absolute inset-0">
          <CategoryIcon slug={slug} index={index} />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <span className="relative z-10 text-[#e8e8e8] font-semibold text-sm group-hover:text-gold transition-colors leading-tight">
        {name}
      </span>
    </Link>
  );
}

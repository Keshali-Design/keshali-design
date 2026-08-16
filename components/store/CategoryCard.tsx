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
    <Link href={`/catalogo?categoria=${slug}`} className="group card-product flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden bg-subtle2">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <CategoryIcon slug={slug} index={index} />
        )}
      </div>
      <div className="px-3 py-3 bg-white flex items-center justify-between">
        <span className="font-semibold text-sm text-ink group-hover:text-gold-700 transition-colors leading-tight">
          {name}
        </span>
      </div>
    </Link>
  );
}

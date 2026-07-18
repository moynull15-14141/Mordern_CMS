import { ImageOff } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function FacebookPreview({
  title,
  description,
  image,
  domain,
}: {
  title: string;
  description: string;
  image?: string;
  domain: string;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex aspect-[1.91/1] items-center justify-center bg-muted">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- preview thumbnail of an arbitrary user-supplied URL
          <img src={image} alt="" className="size-full object-cover" />
        ) : (
          <ImageOff className="size-8 text-muted-foreground" aria-hidden="true" />
        )}
      </div>
      <div className="space-y-0.5 p-3">
        <p className="text-xs uppercase text-muted-foreground">{domain}</p>
        <p className="truncate text-sm font-semibold">{title || 'Open Graph title preview'}</p>
        <p className="line-clamp-1 text-xs text-muted-foreground">
          {description || 'Open Graph description preview will appear here.'}
        </p>
      </div>
    </Card>
  );
}

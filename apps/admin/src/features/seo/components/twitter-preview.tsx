import { ImageOff } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function TwitterPreview({
  title,
  description,
  image,
  domain,
  card = 'summary_large_image',
}: {
  title: string;
  description: string;
  image?: string;
  domain: string;
  card?: string;
}) {
  const large = card !== 'summary';

  return (
    <Card className="overflow-hidden">
      <div className={large ? 'flex aspect-[1.91/1] items-center justify-center bg-muted' : 'flex'}>
        <div
          className={
            large
              ? 'flex size-full items-center justify-center'
              : 'flex size-20 shrink-0 items-center justify-center bg-muted'
          }
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element -- preview thumbnail of an arbitrary user-supplied URL
            <img src={image} alt="" className="size-full object-cover" />
          ) : (
            <ImageOff className="size-6 text-muted-foreground" aria-hidden="true" />
          )}
        </div>
        {!large ? (
          <div className="min-w-0 space-y-0.5 p-3">
            <p className="truncate text-sm font-semibold">
              {title || 'Twitter Card title preview'}
            </p>
            <p className="line-clamp-1 text-xs text-muted-foreground">{description}</p>
            <p className="text-xs text-muted-foreground">{domain}</p>
          </div>
        ) : null}
      </div>
      {large ? (
        <div className="space-y-0.5 p-3">
          <p className="truncate text-sm font-semibold">{title || 'Twitter Card title preview'}</p>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {description || 'Twitter Card description preview will appear here.'}
          </p>
          <p className="text-xs text-muted-foreground">{domain}</p>
        </div>
      ) : null}
    </Card>
  );
}

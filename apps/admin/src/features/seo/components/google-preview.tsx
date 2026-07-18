import { Card, CardContent } from '@/components/ui/card';

export function GooglePreview({
  title,
  description,
  url,
}: {
  title: string;
  description: string;
  url: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-1 p-4">
        <p className="truncate text-sm text-[#202124] dark:text-neutral-300">
          {url || 'https://example.com/…'}
        </p>
        <p className="truncate text-lg text-[#1a0dab] dark:text-[#8ab4f8]">
          {title || 'SEO title preview'}
        </p>
        <p className="line-clamp-2 text-sm text-[#4d5156] dark:text-neutral-400">
          {description || 'Meta description preview will appear here as you type.'}
        </p>
      </CardContent>
    </Card>
  );
}

import {
  collectMediaReferenceIds,
  type MediaRefBlockNodeLike,
} from './media-reference-collector.util';

describe('collectMediaReferenceIds', () => {
  it('collects a top-level media-ref field (image.mediaId)', () => {
    const nodes: MediaRefBlockNodeLike[] = [
      { type: 'image', data: { mediaId: 'media-1', alt: 'x' } },
    ];
    expect(collectMediaReferenceIds(nodes)).toEqual(['media-1']);
  });

  it('collects media-ref fields nested inside a list itemFields (gallery.images[].mediaId)', () => {
    const nodes: MediaRefBlockNodeLike[] = [
      {
        type: 'gallery',
        data: {
          images: [
            { mediaId: 'media-1', alt: 'a' },
            { mediaId: 'media-2', alt: 'b' },
          ],
        },
      },
    ];
    expect(collectMediaReferenceIds(nodes).sort()).toEqual(['media-1', 'media-2']);
  });

  it('collects two media-ref fields on the same block (video.mediaId + posterMediaId)', () => {
    const nodes: MediaRefBlockNodeLike[] = [
      { type: 'video', data: { mediaId: 'media-1', posterMediaId: 'media-2' } },
    ];
    expect(collectMediaReferenceIds(nodes).sort()).toEqual(['media-1', 'media-2']);
  });

  it('recurses into container children at any depth', () => {
    const nodes: MediaRefBlockNodeLike[] = [
      {
        type: 'container',
        data: {},
        children: [{ type: 'image', data: { mediaId: 'media-1', alt: 'x' } }],
      },
    ];
    expect(collectMediaReferenceIds(nodes)).toEqual(['media-1']);
  });

  it('deduplicates repeated references', () => {
    const nodes: MediaRefBlockNodeLike[] = [
      { type: 'image', data: { mediaId: 'media-1', alt: 'x' } },
      { type: 'file-download', data: { mediaId: 'media-1' } },
    ];
    expect(collectMediaReferenceIds(nodes)).toEqual(['media-1']);
  });

  it('ignores blocks with no media-ref fields (paragraph)', () => {
    const nodes: MediaRefBlockNodeLike[] = [{ type: 'paragraph', data: { text: 'hi' } }];
    expect(collectMediaReferenceIds(nodes)).toEqual([]);
  });

  it('ignores unknown block types without throwing', () => {
    const nodes: MediaRefBlockNodeLike[] = [
      { type: 'not-a-real-type', data: { mediaId: 'media-1' } },
    ];
    expect(collectMediaReferenceIds(nodes)).toEqual([]);
  });

  it('returns an empty array for undefined input', () => {
    expect(collectMediaReferenceIds(undefined)).toEqual([]);
  });
});

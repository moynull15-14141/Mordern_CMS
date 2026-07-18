import { describe, expect, it } from 'vitest';
import { inferMediaTypeFromMimeType, STATUS_LABELS, TYPE_LABELS } from './media.constants';

describe('inferMediaTypeFromMimeType', () => {
  it('infers IMAGE from an image/* mime type', () => {
    expect(inferMediaTypeFromMimeType('image/png')).toBe('IMAGE');
  });

  it('infers VIDEO from a video/* mime type', () => {
    expect(inferMediaTypeFromMimeType('video/mp4')).toBe('VIDEO');
  });

  it('infers AUDIO from an audio/* mime type', () => {
    expect(inferMediaTypeFromMimeType('audio/mpeg')).toBe('AUDIO');
  });

  it('falls back to DOCUMENT for anything else', () => {
    expect(inferMediaTypeFromMimeType('application/pdf')).toBe('DOCUMENT');
    expect(inferMediaTypeFromMimeType('text/plain')).toBe('DOCUMENT');
  });
});

describe('label maps', () => {
  it('TYPE_LABELS covers all 4 real MediaType values', () => {
    expect(Object.keys(TYPE_LABELS).sort()).toEqual(['AUDIO', 'DOCUMENT', 'IMAGE', 'VIDEO']);
  });

  it('STATUS_LABELS covers all 4 real MediaStatus values', () => {
    expect(Object.keys(STATUS_LABELS).sort()).toEqual(['ARCHIVED', 'FAILED', 'PROCESSING', 'READY']);
  });
});

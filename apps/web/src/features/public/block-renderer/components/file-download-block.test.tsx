import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FileDownloadBlock } from './file-download-block';

const { getMediaMock } = vi.hoisted(() => ({ getMediaMock: vi.fn() }));

vi.mock('../../services/media.service', () => ({
  getMedia: getMediaMock,
}));

describe('FileDownloadBlock', () => {
  beforeEach(() => {
    getMediaMock.mockReset();
  });

  it('renders a download link from the legacy url string (never calls getMedia)', async () => {
    const element = await FileDownloadBlock({
      block: {
        id: 'b1',
        type: 'file-download',
        data: { url: 'https://example.com/report.pdf', filename: 'Report.pdf', filesize: '2.4 MB' },
      },
    });
    render(<>{element}</>);
    const link = screen.getByRole('link', { name: /Report\.pdf/ });
    expect(link).toHaveAttribute('href', 'https://example.com/report.pdf');
    expect(link).toHaveAttribute('download');
    expect(screen.getByText('2.4 MB')).toBeInTheDocument();
    expect(getMediaMock).not.toHaveBeenCalled();
  });

  it('resolves mediaId via getMedia', async () => {
    getMediaMock.mockResolvedValue({
      id: 'media-1',
      urls: { original: 'https://cdn.example.com/report.pdf' },
      altText: null,
      blurPlaceholder: null,
    });
    const element = await FileDownloadBlock({
      block: {
        id: 'b1',
        type: 'file-download',
        data: { mediaId: 'media-1', filename: 'Report.pdf' },
      },
    });
    render(<>{element}</>);
    expect(screen.getByRole('link', { name: /Report\.pdf/ })).toHaveAttribute(
      'href',
      'https://cdn.example.com/report.pdf'
    );
  });

  it('renders nothing when mediaId is dangling', async () => {
    getMediaMock.mockResolvedValue(null);
    const element = await FileDownloadBlock({
      block: { id: 'b1', type: 'file-download', data: { mediaId: 'missing' } },
    });
    expect(element).toBeNull();
  });

  it('renders nothing for an unsafe url', async () => {
    const element = await FileDownloadBlock({
      block: { id: 'b1', type: 'file-download', data: { url: 'javascript:alert(1)' } },
    });
    expect(element).toBeNull();
  });

  it('renders nothing when url is missing', async () => {
    const element = await FileDownloadBlock({
      block: { id: 'b1', type: 'file-download', data: {} },
    });
    expect(element).toBeNull();
  });
});

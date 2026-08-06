import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FileDownloadBlock } from './file-download-block';

describe('FileDownloadBlock', () => {
  it('renders a download link with filename and size', () => {
    render(
      <FileDownloadBlock
        block={{
          id: 'b1',
          type: 'file-download',
          data: {
            url: 'https://example.com/report.pdf',
            filename: 'Report.pdf',
            filesize: '2.4 MB',
          },
        }}
      />
    );
    const link = screen.getByRole('link', { name: /Report\.pdf/ });
    expect(link).toHaveAttribute('href', 'https://example.com/report.pdf');
    expect(link).toHaveAttribute('download');
    expect(screen.getByText('2.4 MB')).toBeInTheDocument();
  });

  it('renders nothing for an unsafe url', () => {
    const { container } = render(
      <FileDownloadBlock
        block={{ id: 'b1', type: 'file-download', data: { url: 'javascript:alert(1)' } }}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when url is missing', () => {
    const { container } = render(
      <FileDownloadBlock block={{ id: 'b1', type: 'file-download', data: {} }} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});

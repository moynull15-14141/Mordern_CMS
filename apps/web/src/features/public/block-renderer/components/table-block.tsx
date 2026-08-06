import type { BlockComponentProps } from '../types/block.types';

interface Cell {
  text?: unknown;
}
interface Row {
  cells?: unknown;
}

function cellText(cell: unknown): string {
  return typeof (cell as Cell)?.text === 'string' ? ((cell as Cell).text as string) : '';
}

export function TableBlock({ block }: BlockComponentProps) {
  const headers = Array.isArray(block.data.headers) ? block.data.headers : [];
  const rows = Array.isArray(block.data.rows) ? (block.data.rows as Row[]) : [];
  if (headers.length === 0 && rows.length === 0) return null;

  return (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        {headers.length > 0 ? (
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-900"
                >
                  {cellText(header)}
                </th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {rows.map((row, rowIndex) => {
            const cells = Array.isArray(row.cells) ? row.cells : [];
            return (
              <tr key={rowIndex}>
                {cells.map((cell, cellIndex) => (
                  <td key={cellIndex} className="border border-gray-200 px-3 py-2 text-gray-700">
                    {cellText(cell)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

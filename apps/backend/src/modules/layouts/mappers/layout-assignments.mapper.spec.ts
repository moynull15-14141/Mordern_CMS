import { LayoutAssignment } from '@prisma/client';
import { LayoutAssignmentsMapper } from './layout-assignments.mapper';

function buildAssignment(overrides: Partial<LayoutAssignment> = {}): LayoutAssignment {
  return {
    id: 'assignment-1',
    siteId: 'site-1',
    layoutId: 'layout-1',
    contentType: 'PAGE',
    pageId: 'page-1',
    articleId: null,
    categoryId: null,
    createdAt: new Date('2026-01-01'),
    createdBy: null,
    updatedAt: new Date('2026-01-02'),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  } as LayoutAssignment;
}

describe('LayoutAssignmentsMapper', () => {
  it('maps every field flat, with no nested Layout/Page/Article/Category object', () => {
    const mapper = new LayoutAssignmentsMapper();
    const result = mapper.toResponseDto(buildAssignment());

    expect(result).toEqual({
      id: 'assignment-1',
      layoutId: 'layout-1',
      contentType: 'PAGE',
      pageId: 'page-1',
      articleId: null,
      categoryId: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      deletedAt: null,
    });
  });
});

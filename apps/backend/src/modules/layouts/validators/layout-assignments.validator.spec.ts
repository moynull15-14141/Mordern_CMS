import { LayoutAssignmentsValidator } from './layout-assignments.validator';
import { InvalidLayoutAssignmentTargetException } from '../exceptions/layout.exceptions';

describe('LayoutAssignmentsValidator', () => {
  const validator = new LayoutAssignmentsValidator();

  describe('HOMEPAGE', () => {
    it('accepts HOMEPAGE with no entity FK set', () => {
      expect(() => validator.validateAssignmentTarget({ contentType: 'HOMEPAGE' })).not.toThrow();
    });

    it('rejects HOMEPAGE with any entity FK set', () => {
      expect(() =>
        validator.validateAssignmentTarget({ contentType: 'HOMEPAGE', pageId: 'page-1' })
      ).toThrow(InvalidLayoutAssignmentTargetException);
    });
  });

  describe('PAGE / ARTICLE / CATEGORY', () => {
    it('accepts a content-default assignment (no entity FK set)', () => {
      expect(() => validator.validateAssignmentTarget({ contentType: 'PAGE' })).not.toThrow();
    });

    it('accepts an instance-specific assignment matching contentType', () => {
      expect(() =>
        validator.validateAssignmentTarget({ contentType: 'PAGE', pageId: 'page-1' })
      ).not.toThrow();
      expect(() =>
        validator.validateAssignmentTarget({ contentType: 'ARTICLE', articleId: 'article-1' })
      ).not.toThrow();
      expect(() =>
        validator.validateAssignmentTarget({ contentType: 'CATEGORY', categoryId: 'cat-1' })
      ).not.toThrow();
    });

    it('rejects more than one entity FK set', () => {
      expect(() =>
        validator.validateAssignmentTarget({
          contentType: 'PAGE',
          pageId: 'page-1',
          articleId: 'article-1',
        })
      ).toThrow(InvalidLayoutAssignmentTargetException);
    });

    it('rejects a mismatched entity FK (contentType PAGE with articleId set)', () => {
      expect(() =>
        validator.validateAssignmentTarget({ contentType: 'PAGE', articleId: 'article-1' })
      ).toThrow(InvalidLayoutAssignmentTargetException);
    });
  });
});

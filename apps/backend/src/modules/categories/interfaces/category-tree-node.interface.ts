import { Category } from '@prisma/client';

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

export interface CategoryBreadcrumbItem {
  id: string;
  name: string;
  slug: string;
}

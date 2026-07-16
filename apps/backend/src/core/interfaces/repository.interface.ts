/**
 * Generic persistence contract future business modules implement against
 * Prisma-backed repositories. No implementation exists yet — Database
 * Foundation (schema/models) is the next milestone.
 */
export interface Repository<TEntity, TId> {
  findById(id: TId): Promise<TEntity | null>;
  findAll(): Promise<TEntity[]>;
  create(data: Partial<TEntity>): Promise<TEntity>;
  update(id: TId, data: Partial<TEntity>): Promise<TEntity>;
  delete(id: TId): Promise<void>;
}

import { Provider } from './provider.interface';

export enum SearchProviderType {
  DATABASE = 'database',
  MEILISEARCH = 'meilisearch',
  ELASTICSEARCH = 'elasticsearch',
  TYPESENSE = 'typesense',
}

export interface SearchQuery {
  term: string;
  filters?: Record<string, unknown>;
  page?: number;
  limit?: number;
}

export interface SearchResult<TDocument> {
  items: TDocument[];
  total: number;
}

/**
 * Interface only. V1 default is relational/database search (no external
 * search engine required, per docs/35_ARCHITECTURE_FREEZE.md). Meilisearch/
 * Elasticsearch/Typesense are future options behind the same contract. No
 * implementation exists yet.
 */
export interface SearchProvider extends Provider {
  search<TDocument>(index: string, query: SearchQuery): Promise<SearchResult<TDocument>>;
  index<TDocument>(index: string, id: string, document: TDocument): Promise<void>;
  remove(index: string, id: string): Promise<void>;
}

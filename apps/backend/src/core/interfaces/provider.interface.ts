/**
 * Base marker interface every pluggable provider abstraction (Cache,
 * Storage, Email, AI, Search) extends, so provider implementations can be
 * identified/logged generically regardless of concrete type.
 */
export interface Provider {
  readonly name: string;
}

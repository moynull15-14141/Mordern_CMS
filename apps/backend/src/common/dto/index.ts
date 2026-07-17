// Shared DTO conventions. Populated once business modules (Users, Articles,
// ...) define concrete request/response contracts — Users (Milestone 7) is
// the first to do so, contributing the generic pagination contract below.
export * from './pagination.dto';

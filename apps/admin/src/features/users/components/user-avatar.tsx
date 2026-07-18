import { cn } from '@/utils/cn';

export interface UserAvatarProps {
  displayName: string | null;
  email: string;
  className?: string;
}

function getInitials(displayName: string | null, email: string): string {
  const source = displayName?.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

/**
 * Initials-only placeholder — approved decision 3 (Frontend Milestone 3):
 * "Do NOT implement image rendering or upload." `User.profileImageId` is a
 * bare `MediaAsset` id with no resolvable URL on `UserResponseDto`;
 * rendering a real photo would require `GET /media/:id`, which is Media
 * module (out of scope). See docs/63_FRONTEND_USERS.md "Avatar".
 */
export function UserAvatar({ displayName, email, className }: UserAvatarProps) {
  return (
    <div
      role="img"
      aria-label={displayName ?? email}
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground',
        className,
      )}
    >
      {getInitials(displayName, email)}
    </div>
  );
}

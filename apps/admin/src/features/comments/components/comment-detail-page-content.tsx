'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { usePermissions } from '@/hooks/use-permissions';
import { PageHeader } from '@/components/layout/page-header';
import { ConfirmDialog } from '@/components/layout/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { SYSTEM_ROLES, PERMISSIONS } from '@/constants/permissions';
import { ARTICLE_ROUTES } from '@/constants/routes';
import { formatDateTime } from '@/utils/format';
import { CommentStatusBadge } from './comment-status-badge';
import { CommentFormDialog } from './comment-form-dialog';
import { CommentReasonDialog } from './comment-reason-dialog';
import { useComment } from '../hooks/use-comment';
import { useCommentReplies } from '../hooks/use-comment-replies';
import { useCreateComment } from '../hooks/use-create-comment';
import { useUpdateComment } from '../hooks/use-update-comment';
import { useDeleteComment } from '../hooks/use-delete-comment';
import { useRestoreComment } from '../hooks/use-restore-comment';
import { useApproveComment } from '../hooks/use-approve-comment';
import { useRejectComment } from '../hooks/use-reject-comment';
import { useSpamComment } from '../hooks/use-spam-comment';
import { useArticle } from '@/features/articles/hooks/use-article';
import { useUser } from '@/features/users/hooks/use-user';

export interface CommentDetailPageContentProps {
  commentId: string;
}

function canManageComment(currentUserId: string | undefined, roles: string[], commentUserId: string | null) {
  if (currentUserId && commentUserId && currentUserId === commentUserId) return true;
  return (
    roles.includes(SYSTEM_ROLES.SUPER_ADMIN) ||
    roles.includes(SYSTEM_ROLES.ADMINISTRATOR) ||
    roles.includes(SYSTEM_ROLES.MODERATOR)
  );
}

export function CommentDetailPageContent({ commentId }: CommentDetailPageContentProps) {
  const router = useRouter();
  const auth = useAuth();
  const { can, canAny } = usePermissions();
  const canModerate = can(PERMISSIONS.COMMENT_MODERATE);
  const canViewArticleDetails = canAny([
    PERMISSIONS.ARTICLE_CREATE,
    PERMISSIONS.ARTICLE_UPDATE,
    PERMISSIONS.ARTICLE_DELETE,
    PERMISSIONS.ARTICLE_PUBLISH,
  ]);
  const canViewAuthorDetails = can(PERMISSIONS.USERS_MANAGE);

  const { data: comment, isLoading, error, refetch } = useComment(commentId);
  const { data: article } = useArticle(comment && canViewArticleDetails ? comment.articleId : '');
  const { data: author } = useUser(comment?.userId && canViewAuthorDetails ? comment.userId : undefined);
  const { data: replies, isLoading: repliesLoading, error: repliesError } = useCommentReplies(commentId, {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'asc',
  });

  const updateMutation = useUpdateComment(commentId, comment?.articleId);
  const deleteMutation = useDeleteComment(comment?.articleId);
  const restoreMutation = useRestoreComment(comment?.articleId);
  const approveMutation = useApproveComment(comment?.articleId);
  const rejectMutation = useRejectComment(comment?.articleId);
  const spamMutation = useSpamComment(comment?.articleId);
  const createMutation = useCreateComment();

  const [editOpen, setEditOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [spamOpen, setSpamOpen] = useState(false);

  const canManage = comment ? canManageComment(auth.user?.id, auth.roles, comment.userId) : false;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) return <ErrorState error={error} onRetry={() => refetch()} />;
  if (!comment) return <EmptyState title="Comment not found" />;

  const title = comment.authorName ?? comment.authorEmail ?? comment.id;

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={`Comment ${comment.id}`}
        actions={
          <div className="flex flex-wrap gap-2">
            {comment.deletedAt ? (
              canManage ? <Button onClick={() => setRestoreOpen(true)}>Restore</Button> : null
            ) : (
              <>
                <Button variant="outline" onClick={() => setReplyOpen(true)}>
                  Reply
                </Button>
                {canManage ? (
                  <Button variant="outline" onClick={() => setEditOpen(true)}>
                    Edit
                  </Button>
                ) : null}
                {canModerate ? (
                  <>
                    <Button variant="outline" onClick={() => setApproveOpen(true)}>
                      Approve
                    </Button>
                    <Button variant="outline" onClick={() => setRejectOpen(true)}>
                      Reject
                    </Button>
                    <Button variant="outline" onClick={() => setSpamOpen(true)}>
                      Spam
                    </Button>
                  </>
                ) : null}
                {canManage ? (
                  <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                    Delete
                  </Button>
                ) : null}
              </>
            )}
          </div>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <CardTitle>Comment</CardTitle>
          <CommentStatusBadge status={comment.status} />
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="whitespace-pre-wrap leading-7">{comment.body}</p>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Article</dt>
              <dd>
                {article ? (
                  <button className="text-left underline-offset-4 hover:underline" onClick={() => router.push(ARTICLE_ROUTES.detail(article.id))}>
                    {article.title}
                  </button>
                ) : (
                  <span className="font-mono">{comment.articleId}</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Author</dt>
              <dd>{author ? author.displayName ?? author.email : comment.authorName ?? comment.authorEmail ?? comment.userId ?? 'Guest'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Parent</dt>
              <dd>{comment.parentId ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Votes / replies</dt>
              <dd>
                {comment.votes} votes · {comment.replyCount} replies
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{formatDateTime(comment.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Updated</dt>
              <dd>{formatDateTime(comment.updatedAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Deleted</dt>
              <dd>{comment.deletedAt ? formatDateTime(comment.deletedAt) : '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Moderation note</dt>
              <dd>{comment.moderationReason ?? '—'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {comment.parentId ? (
        <Card>
          <CardHeader>
            <CardTitle>Parent comment</CardTitle>
          </CardHeader>
          <CardContent>
            <ParentCommentPreview parentId={comment.parentId} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Replies</CardTitle>
        </CardHeader>
        <CardContent>
          {repliesLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : repliesError ? (
            <ErrorState error={repliesError} />
          ) : !replies?.data.length ? (
            <EmptyState title="No replies yet" description="Direct replies will appear here." />
          ) : (
            <ul className="space-y-3">
              {replies.data.map((reply) => (
                <li key={reply.id} className="rounded-md border border-border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">{reply.authorName ?? reply.authorEmail ?? reply.userId ?? 'Guest'}</div>
                    <CommentStatusBadge status={reply.status} />
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{reply.body}</p>
                  <div className="mt-2 text-xs text-muted-foreground">{formatDateTime(reply.createdAt)}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <CommentFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit comment"
        defaultBody={comment.body}
        submitLabel="Update"
        onSubmit={async (body) => {
          await updateMutation.mutateAsync({ body });
        }}
      />
      <CommentFormDialog
        open={replyOpen}
        onOpenChange={setReplyOpen}
        title="Reply to comment"
        submitLabel="Reply"
        onSubmit={async (body) => {
          await createMutation.mutateAsync({ articleId: comment.articleId, parentId: comment.id, body });
        }}
      />
      <CommentReasonDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title="Approve comment"
        submitLabel="Approve"
        onSubmit={async (reason) => {
          await approveMutation.mutateAsync({ id: comment.id, input: { reason } });
        }}
      />
      <CommentReasonDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Reject comment"
        submitLabel="Reject"
        required
        onSubmit={async (reason) => {
          await rejectMutation.mutateAsync({ id: comment.id, input: { reason: reason ?? '' } });
        }}
      />
      <CommentReasonDialog
        open={spamOpen}
        onOpenChange={setSpamOpen}
        title="Mark as spam"
        submitLabel="Mark spam"
        onSubmit={async (reason) => {
          await spamMutation.mutateAsync({ id: comment.id, input: { reason } });
        }}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => !open && setDeleteOpen(false)}
        title="Delete comment"
        description="Soft-delete this comment?"
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={async () => {
          await deleteMutation.mutateAsync(comment.id);
        }}
      />
      <ConfirmDialog
        open={restoreOpen}
        onOpenChange={(open) => !open && setRestoreOpen(false)}
        title="Restore comment"
        description="Restore this soft-deleted comment?"
        confirmLabel="Restore"
        onConfirm={async () => {
          await restoreMutation.mutateAsync(comment.id);
        }}
      />
    </div>
  );
}

function ParentCommentPreview({ parentId }: { parentId: string }) {
  const { data, isLoading, error } = useComment(parentId);
  if (isLoading) return <Skeleton className="h-20 w-full" />;
  if (error) return <ErrorState error={error} />;
  if (!data) return <EmptyState title="Parent comment not found" />;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <CommentStatusBadge status={data.status} />
        <span className="text-sm text-muted-foreground">{formatDateTime(data.createdAt)}</span>
      </div>
      <p className="whitespace-pre-wrap text-sm">{data.body}</p>
    </div>
  );
}

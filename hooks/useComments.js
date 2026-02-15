import { useState, useEffect, useCallback } from 'react';
import { getStoryById } from '../services/stories.service';
import { createComment, deleteComment } from '../services/comments.service';
import { useSocket } from '../lib/socket/socketContext';

export function useComments(storyId) {
  const { socket } = useSocket();
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);

  // ── Load initial comments via REST ──

  useEffect(() => {
    if (!storyId) return;

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await getStoryById(storyId);
        if (!cancelled) {
          setComments(data.data.comments || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load comments:', err);
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [storyId]);

  // ── WebSocket: join/leave room + listen for events ──

  useEffect(() => {
    if (!socket || !storyId) return;

    const joinRoom = () => {
      socket.emit('story:join', { storyId });
    };

    // Join initially
    joinRoom();

    // Rejoin on reconnect
    socket.on('connect', joinRoom);

    const handleNewComment = (comment) => {
      setComments((prev) => {
        if (prev.some((c) => c.id === comment.id)) return prev;
        return [...prev, comment];
      });
    };

    const handleDeletedComment = ({ commentId }) => {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    };

    const handleError = (err) => {
      console.warn('Story socket error:', err.message || err);
    };

    socket.on('comment:new', handleNewComment);
    socket.on('comment:deleted', handleDeletedComment);
    socket.on('story:error', handleError);

    return () => {
      socket.emit('story:leave', { storyId });
      socket.off('connect', joinRoom);
      socket.off('comment:new', handleNewComment);
      socket.off('comment:deleted', handleDeletedComment);
      socket.off('story:error', handleError);
    };
  }, [socket, storyId]);

  // ── Add comment ──

  const addComment = useCallback(async (content) => {
    if (!storyId || !content.trim()) return null;

    setIsSending(true);
    try {
      const { data } = await createComment(storyId, content.trim());
      const newComment = data.data;

      // Add immediately (dedup handles WebSocket echo)
      setComments((prev) => {
        if (prev.some((c) => c.id === newComment.id)) return prev;
        return [...prev, newComment];
      });

      return newComment;
    } finally {
      setIsSending(false);
    }
  }, [storyId]);

  // ── Delete comment (optimistic) ──

  const removeComment = useCallback(async (commentId) => {
    // Capture snapshot for rollback
    let snapshot = [];
    setComments((prev) => {
      snapshot = prev;
      return prev.filter((c) => c.id !== commentId);
    });

    try {
      await deleteComment(commentId);
    } catch (err) {
      // Rollback: try server reload, fallback to snapshot
      try {
        const { data } = await getStoryById(storyId);
        setComments(data.data.comments || []);
      } catch (rollbackErr) {
        console.error('Failed to rollback comment deletion:', rollbackErr);
        setComments(snapshot);
      }
      throw err;
    }
  }, [storyId]);

  return {
    comments,
    isLoading,
    error,
    isSending,
    addComment,
    removeComment,
  };
}

'use client';

/**
 * Card Comments Component
 * Add comments, @mentions, and collaboration to pulse cards
 */

import React, { useState } from 'react';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  mentions?: string[];
  replies?: Comment[];
}

interface CardCommentsProps {
  cardId: string;
  comments: Comment[];
  currentUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  onAddComment: (content: string, mentions: string[]) => void;
  onReply: (commentId: string, content: string, mentions: string[]) => void;
  teamMembers?: Array<{ id: string; name: string; avatar?: string }>;
}

export default function CardComments({
  cardId,
  comments,
  currentUser,
  onAddComment,
  onReply,
  teamMembers = [],
}: CardCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');

  // Detect @mentions in text
  const detectMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const matches = text.match(mentionRegex);
    return matches ? matches.map(m => m.slice(1)) : [];
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    const mentions = detectMentions(newComment);
    onAddComment(newComment, mentions);
    setNewComment('');
  };

  const handleSubmitReply = (commentId: string) => {
    if (!replyContent.trim()) return;

    const mentions = detectMentions(replyContent);
    onReply(commentId, replyContent, mentions);
    setReplyContent('');
    setReplyingTo(null);
  };

  const filteredTeamMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Add Comment */}
      <div className="space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => {
            setNewComment(e.target.value);
            if (e.target.value.includes('@')) {
              setShowMentions(true);
              const match = e.target.value.match(/@(\w*)$/);
              setMentionQuery(match ? match[1] : '');
            } else {
              setShowMentions(false);
            }
          }}
          placeholder="Add a comment... Use @ to mention team members"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          rows={3}
        />
        {showMentions && filteredTeamMembers.length > 0 && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 max-h-40 overflow-y-auto">
            {filteredTeamMembers.map(member => (
              <button
                key={member.id}
                onClick={() => {
                  const beforeAt = newComment.lastIndexOf('@');
                  setNewComment(
                    newComment.slice(0, beforeAt) + `@${member.name} ` + newComment.slice(beforeAt + mentionQuery.length + 1)
                  );
                  setShowMentions(false);
                }}
                className="w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm flex items-center gap-2"
              >
                {member.avatar && (
                  <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full" />
                )}
                <span>{member.name}</span>
              </button>
            ))}
          </div>
        )}
        <button
          onClick={handleSubmitComment}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Add Comment
        </button>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.id} className="border-l-2 border-gray-200 dark:border-gray-700 pl-4 space-y-2">
            <div className="flex items-start gap-2">
              {comment.userAvatar && (
                <img
                  src={comment.userAvatar}
                  alt={comment.userName}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {comment.userName}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(comment.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {comment.content.split(' ').map((word, idx) => {
                    if (word.startsWith('@')) {
                      const mention = word.slice(1);
                      return (
                        <span key={idx} className="text-blue-600 dark:text-blue-400 font-medium">
                          @{mention}{' '}
                        </span>
                      );
                    }
                    return word + ' ';
                  })}
                </p>
                {comment.mentions && comment.mentions.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {comment.mentions.map((mention, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded"
                      >
                        @{mention}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  Reply
                </button>
              </div>
            </div>

            {/* Reply Form */}
            {replyingTo === comment.id && (
              <div className="ml-10 space-y-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSubmitReply(comment.id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-10 space-y-2">
                {comment.replies.map(reply => (
                  <div key={reply.id} className="border-l-2 border-gray-100 dark:border-gray-800 pl-3">
                    <div className="flex items-start gap-2">
                      {reply.userAvatar && (
                        <img
                          src={reply.userAvatar}
                          alt={reply.userName}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                            {reply.userName}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(reply.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 dark:text-gray-300">{reply.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


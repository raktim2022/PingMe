import React, { useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { useSocket } from "../../context/SocketContext";
import MediaPreview from "../common/MediaPreview";

const REACTIONS = ["❤️", "👍", "👎", "😄", "😢", "😮"];

const MessageBubble = ({ message }) => {
  const { userId } = useAuth();
  const { socket } = useSocket();
  const {
    deleteMessage,
    editMessage,
    addReaction,
    removeReaction,
    setReplyingTo,
    selectedChat,
  } = useChat();

  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [showReactions, setShowReactions] = useState(false);
  const [showMediaPreview, setShowMediaPreview] = useState(false);

  const isOwnMessage = message?.sender?._id === userId;
  const isVideo = message.fileUrl?.match(/\.(mp4|webm|ogg)$/i);
  const isImage = message.fileUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isFile = message.fileUrl && !isVideo && !isImage;

  const getFileNameFromUrl = useCallback((url) => {
    if (!url) return "";
    return url.split("/").pop().split("?")[0];
  }, []);

  const handleEdit = async () => {
    if (!editedContent.trim() || editedContent.trim() === message.content) {
      setIsEditing(false);
      return;
    }

    try {
      await editMessage(message._id, editedContent);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to edit message:", error);
    }
  };

  const handleReaction = async (reaction) => {
    try {
      const existingReaction = message.reactions?.find(
        r => r.user === userId && r.reaction === reaction
      );

      let success;
      if (existingReaction) {
        success = await removeReaction(message._id);
      } else {
        success = await addReaction(message._id, reaction);
      }

      if (success) {
        socket?.emit("message:react", {
          messageId: message._id,
          receiverId: message.sender._id !== userId ? message.sender._id : selectedChat._id,
          reaction: existingReaction ? null : reaction,
          userId,
          timestamp: new Date().toISOString()
        });
      }

      setShowReactions(false);
    } catch (error) {
      console.error("Failed to handle reaction:", error);
    }
  };

  const renderMessageContent = () => {
    if (isEditing) {
      return (
        <input
          type="text"
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          onBlur={handleEdit}
          onKeyDown={(e) => e.key === "Enter" && handleEdit()}
          className="input input-bordered input-sm w-full"
          autoFocus
        />
      );
    }

    if (isFile) {
      return (
        <a
          href={message.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-2 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm">{getFileNameFromUrl(message.fileUrl)}</span>
        </a>
      );
    }

    if (isImage || isVideo) {
      return (
        <div
          className="cursor-pointer"
          onClick={() => setShowMediaPreview(true)}
        >
          {isImage ? (
            <img
              src={message.fileUrl}
              alt="Media content"
              className="max-w-xs rounded-lg"
            />
          ) : (
            <video
              src={message.fileUrl}
              className="max-w-xs rounded-lg"
              controls={false}
            />
          )}
        </div>
      );
    }

    return <p className="whitespace-pre-wrap">{message.content}</p>;
  };

  const senderAvatar = isOwnMessage
    ? message?.sender?.avatar
    : selectedChat?.avatar;
  const senderName = isOwnMessage
    ? message?.sender?.username
    : selectedChat?.username;

  const ReplyContent = () => {
    if (!message.replyTo) return null;
    return (
      <div className="bg-base-300/50 p-2 rounded-lg mb-2 text-sm cursor-pointer hover:bg-base-300/70 transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-0.5 h-full bg-primary rounded"></div>
          <div>
            <p className="font-medium text-primary">
              {message.replyTo.sender?.username || "Unknown"}
            </p>
            <p className="truncate opacity-70">
              {message.replyTo.fileUrl ? (
                message.replyTo.messageType === 'image' ? '📷 Image' :
                message.replyTo.messageType === 'video' ? '🎥 Video' :
                '📎 File'
              ) : message.replyTo.content}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Message Options Component
  const MessageOptions = () => (
    <div className="absolute -top-8 right-0 flex items-center gap-1 bg-base-200 rounded-lg shadow-lg p-1 z-50">
      <div className="dropdown dropdown-end">
        <label 
          tabIndex={0} 
          className="btn btn-ghost btn-xs cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setShowReactions(!showReactions);
          }}
        >
          😀
        </label>
        {showReactions && (
          <div 
            tabIndex={0} 
            className="dropdown-content bg-base-200 p-2 rounded-lg shadow-xl flex gap-1 z-50"
          >
            {REACTIONS.map(reaction => (
              <button
                key={reaction}
                onClick={(e) => {
                  e.stopPropagation();
                  handleReaction(reaction);
                }}
                className="btn btn-ghost btn-xs hover:scale-110 transition-transform"
              >
                {reaction}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        className="btn btn-ghost btn-xs"
        onClick={() => setReplyingTo(message)}
        title="Reply"
      >
        ↩️
      </button>

      {isOwnMessage && (
        <>
          <button
            className="btn btn-ghost btn-xs"
            onClick={() => setIsEditing(true)}
            title="Edit"
          >
            ✏️
          </button>
          <button
            className="btn btn-ghost btn-xs"
            onClick={() => deleteMessage(message._id)}
            title="Delete"
          >
            🗑️
          </button>
        </>
      )}
    </div>
  );

  return (
    <div
      className={`chat ${isOwnMessage ? "chat-end" : "chat-start"} group relative`}
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => {
        setShowOptions(false);
        setShowReactions(false);
      }}
    >
      <div className="chat-image avatar">
        <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
          <img
            src={senderAvatar || "/default-avatar.png"}
            alt={senderName || "User"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/default-avatar.png";
            }}
          />
        </div>
      </div>

      <div
        className={`chat-bubble ${isOwnMessage ? "chat-bubble-primary" : ""} relative`}
      >
        <ReplyContent />
        {renderMessageContent()}
      {showOptions && <MessageOptions />}
      </div>

      <div className="chat-footer text-xs flex items-center gap-2">
        {message.isEdited && <span className="italic">(edited)</span>}
        {message.reactions?.length > 0 && (
          <div className="flex gap-1 bg-base-200/50 rounded-full px-2 py-1">
            {Array.from(new Set(message.reactions.map(r => r.reaction))).map(reaction => {
              const count = message.reactions.filter(r => r.reaction === reaction).length;
              const hasReacted = message.reactions.some(r => r.reaction === reaction && r.user === userId);
              
              return (
                <span
                  key={reaction}
                  className={`hover:scale-110 transition-transform cursor-pointer ${
                    hasReacted ? 'opacity-100' : 'opacity-70'
                  }`}
                  onClick={() => handleReaction(reaction)}
                  title={`${count} ${count === 1 ? 'reaction' : 'reactions'}`}
                >
                  {reaction} {count > 1 && count}
                </span>
              );
            })}
          </div>
        )}
        <time dateTime={message.createdAt}>
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
        {message.status === "seen" && <span className="text-primary">✓✓</span>}
        {message.status === "delivered" && (
          <span className="text-base-content/70">✓</span>
        )}
      </div>

      {(isVideo || isImage) && (
        <MediaPreview
          isOpen={showMediaPreview}
          onClose={() => setShowMediaPreview(false)}
          mediaUrl={message.fileUrl}
          mediaType={isVideo ? "video" : "image"}
          caption={message.content}
        />
      )}

      {/* {showOptions && <MessageOptions />} */}
    </div>
  );
};

export default MessageBubble;

import React, { useState } from 'react';
import { MessageSquare, Pin, Trash2, CheckCircle2, Reply, Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminCommentsFeedback: React.FC = () => {
  const { comments, updateCommentStatus, deleteComment, feedbacks, replyFeedback, deleteFeedback } = useApp();
  const [activeTab, setActiveTab] = useState<'comments' | 'feedback'>('comments');

  const [replyInputMap, setReplyInputMap] = useState<Record<string, string>>({});

  const handleReplySubmit = (feedbackId: string) => {
    const text = replyInputMap[feedbackId];
    if (!text) return;
    replyFeedback(feedbackId, text);
    setReplyInputMap(prev => ({ ...prev, [feedbackId]: '' }));
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div>
          <h2 className="text-xl font-black text-white font-display">Comments & User Feedback</h2>
          <p className="text-xs text-zinc-400">Moderate community comments or reply to user support inquiries.</p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'comments' ? 'bg-red-600 text-white' : 'bg-zinc-900 text-zinc-400'}`}
          >
            Comments ({comments.length})
          </button>
          <button 
            onClick={() => setActiveTab('feedback')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'feedback' ? 'bg-red-600 text-white' : 'bg-zinc-900 text-zinc-400'}`}
          >
            Feedback Inbox ({feedbacks.length})
          </button>
        </div>
      </div>

      {activeTab === 'comments' && (
        <div className="space-y-3">
          {comments.map(c => (
            <div key={c.id} className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">{c.username}</span>
                  {c.isPinned && <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold">Pinned</span>}
                </div>
                <p className="text-xs text-zinc-300">{c.content}</p>
                <div className="text-[10px] text-zinc-500">{new Date(c.createdAt).toLocaleString()}</div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => updateCommentStatus(c.id, c.status, !c.isPinned)}
                  className="p-1.5 rounded-lg bg-zinc-800 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                  title={c.isPinned ? "Unpin Comment" : "Pin Comment"}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => deleteComment(c.id)}
                  className="p-1.5 rounded-lg bg-rose-950/30 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                  title="Delete Comment"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="space-y-4">
          {feedbacks.map(f => (
            <div key={f.id} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{f.subject}</div>
                  <div className="text-[10px] text-zinc-400">From: {f.userEmail}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${f.status === 'solved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {f.status}
                  </span>
                  <button 
                    onClick={() => deleteFeedback(f.id)}
                    className="p-1.5 rounded-lg bg-rose-950/30 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                    title="Delete Feedback"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">{f.message}</p>

              {f.reply && (
                <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/40 text-xs text-red-300">
                  <span className="font-bold">Admin Reply:</span> {f.reply}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="text"
                  placeholder="Write reply to user..."
                  value={replyInputMap[f.id] || ''}
                  onChange={(e) => setReplyInputMap(prev => ({ ...prev, [f.id]: e.target.value }))}
                  className="flex-1 bg-zinc-950 border border-zinc-800 text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:border-red-500"
                />
                <button 
                  onClick={() => handleReplySubmit(f.id)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

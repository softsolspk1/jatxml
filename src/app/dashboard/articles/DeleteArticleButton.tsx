'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DeleteArticleButton({ articleId }: { articleId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        router.refresh();
      } else {
        alert('Failed to delete article. You may not have permission.');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while deleting the article.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      style={{ 
        color: '#EF4444', 
        background: 'none', 
        border: 'none', 
        cursor: isDeleting ? 'not-allowed' : 'pointer',
        padding: '5px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isDeleting ? 0.5 : 1
      }}
      title="Delete Article"
    >
      {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
    </button>
  );
}

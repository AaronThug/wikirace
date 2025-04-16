import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';

const ArticleDisplay = ({ article, onLinkClick, loading, setLoading }) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticleContent = async () => {
      if (!article || !article.title) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const res = await axios.get(`/api/game/wikipedia/${encodeURIComponent(article.title)}`, {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });
        
        setContent(res.data.content);
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to load article content');
      } finally {
        setLoading(false);
      }
    };

    fetchArticleContent();
  }, [article, setLoading]);

  const handleLinkClick = (e) => {
    // Only intercept Wikipedia internal links
    if (e.target.tagName === 'A' && e.target.href && !e.target.href.includes('://')) {
      e.preventDefault();
      
      // Extract title from href
      const href = e.target.getAttribute('href');
      if (href && href.startsWith('/wiki/')) {
        const title = decodeURIComponent(href.replace('/wiki/', '').replace(/_/g, ' '));
        const url = `https://en.wikipedia.org${href}`;
        
        onLinkClick({ title, url });
      }
    }
  };

  const createMarkup = () => {
    // Sanitize HTML to prevent XSS attacks
    return { __html: DOMPurify.sanitize(content) };
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="article-container">
      <h2>{article?.title || 'Loading Article...'}</h2>
      <div 
        className="article-content" 
        onClick={handleLinkClick}
        dangerouslySetInnerHTML={createMarkup()}
      />
    </div>
  );
};

export default ArticleDisplay;
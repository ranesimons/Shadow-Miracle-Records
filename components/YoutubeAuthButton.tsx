// components/YouTubeAuthButton.tsx

'use client';

const YouTubeAuthButton = () => {
  const handleAuth = () => {
    // This points to your backend route that handles Google OAuth
    window.location.href = '/api/auth/youtube';
  };

  return (
    <button 
      onClick={handleAuth}
      style={{ 
        color: '#FFFFFF', 
        backgroundColor: '#FF0000', 
        padding: '10px 20px', 
        border: 'none', 
        borderRadius: '4px',
        cursor: 'pointer' 
      }}
    >
      Authenticate with YouTube
    </button>
  );
};

export default YouTubeAuthButton;
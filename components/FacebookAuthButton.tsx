// components/FacebookAuthButton.tsx

'use client';

const FacebookAuthButton = () => {
  const handleAuth = () => {
    window.location.href = '/api/auth/facebook';
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
      Authenticate with Facebook
    </button>
  );
};

export default FacebookAuthButton;

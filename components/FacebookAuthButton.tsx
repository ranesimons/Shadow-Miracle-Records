// // components/FacebookAuthButton.tsx

// 'use client';

// import React from 'react';

// interface FacebookAuthButtonProps {
//   onToken: (accessToken: string) => void;
// }

// const FacebookAuthButton: React.FC<FacebookAuthButtonProps> = ({ onToken }) => {
//   const handleAuth = () => {
//     window.location.href = '/api/auth/facebook';
//   };

//   console.log('$$$');
//   console.log('testing');
//   console.log('$$$');

//   return (
//     <button onClick={handleAuth}>
//       Authenticate with Facebook
//     </button>
//   );
// };

// export default FacebookAuthButton;


// components/FacebookAuthButton.tsx

'use client';

import React from 'react';

const FacebookAuthButton = () => {
  const handleAuth = () => {
    window.location.href = '/api/auth/facebook';
  };

  return (
    <button onClick={handleAuth}>
      Authenticate with Facebook
    </button>
  );
};

export default FacebookAuthButton;

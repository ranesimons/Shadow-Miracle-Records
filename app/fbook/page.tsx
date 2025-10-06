

// 'use client';

// import { useEffect, useState } from "react";
// import FacebookAuthButton from "@/components/FacebookAuthButton";

// interface Video {
//   id: string;
//   createdTime: string;
//   title: string;
//   videoId: string;
//   viewCount: number;
//   error: string | null;
// }

// const FacebookAuthPage: React.FC = () => {
//   const [token, setToken] = useState<string | null>(null);
//   const [videos, setVideos] = useState<Video[] | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [loadingAuth, setLoadingAuth] = useState<boolean>(false);
//   const [loadingVideos, setLoadingVideos] = useState<boolean>(false);
//   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

//   const handleToken = (accessToken: string) => {
//     setToken(accessToken);
//     setLoadingAuth(false);
//   };

//   useEffect(() => {
//     setLoadingAuth(true);

//     const searchParams = new URLSearchParams(window.location.search);
//     const queryToken = searchParams.get("access_token");

//     if (queryToken) {
//       window.history.replaceState({}, "", window.location.pathname);
//       handleToken(queryToken);
//       return;
//     }

//     if (window.location.hash) {
//       const hash = window.location.hash.substring(1);
//       const hashParams = new URLSearchParams(hash);
//       const hashToken = hashParams.get("access_token");

//       if (hashToken) {
//         window.history.replaceState({}, "", window.location.pathname);
//         handleToken(hashToken);
//         return;
//       }
//     }
//   }, []);

//   useEffect(() => {
//     if (!token) return;

//     const fetchVideos = async () => {
//       setLoadingVideos(true);
//       try {
//         const resp = await fetch("/api/facebook", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ access_token: token }),
//         });
//         const data = await resp.json();
//         if (!resp.ok) {
//           throw new Error(data.error || "Failed to fetch videos");
//         }
//         setVideos(data.videos);
//       } catch (err) {
//         setError(err instanceof Error ? err.message : "Unknown error");
//       } finally {
//         setLoadingVideos(false);
//       }
//     };

//     fetchVideos();
//   }, [token]);

//   const handleSort = () => {
//     const sorted = [...videos ?? []].sort((a, b) => {
//       const aViews = a.viewCount ?? 0;
//       const bViews = b.viewCount ?? 0;
//       return sortOrder === 'asc' ? aViews - bViews : bViews - aViews;
//     });
//     setVideos(sorted);
//     setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
//   };

//   return (
//     <div>
//       <h1>Facebook Authentication</h1>

//       {loadingAuth && !token && <p>Authenticating with Facebook...</p>}

//       {!token && <FacebookAuthButton />}

//       {token && loadingVideos && <p>Loading videos...</p>}

//       {error && <p style={{ color: "red" }}>Error: {error}</p>}

//       {videos && (
//         <div>
//           <button onClick={handleSort}>
//             Sort by Views ({sortOrder === 'asc' ? 'Ascending' : 'Descending'})
//           </button>
//           <ul>
//             {videos.map((v) => (
//               <li key={v.id}>
//                 <h3>{v.title || "(no title)"}</h3>
//                 <p>Views: {v.viewCount}</p>
//                 <p>Created: {v.createdTime}</p>
//                 <iframe
//                   src={`https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/1389669548028513/videos/${v.id}/&show_text=0&width=560`}
//                   width="560"
//                   height="315"
//                   allow="autoplay; encrypted-media; picture-in-picture"
//                   allowFullScreen
//                 ></iframe>
//                 {v.error && <p style={{ color: "orange" }}>Insight error: {v.error}</p>}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FacebookAuthPage;




'use client';

import { useEffect, useState } from "react";
import FacebookAuthButton from "@/components/FacebookAuthButton";
import styled from 'styled-components';

interface Video {
  id: string;
  createdTime: string;
  title: string;
  videoId: string;
  viewCount: number;
  error: string | null;
}

const PageContainer = styled.div`
  font-family: 'Arial', sans-serif;
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #333;
  font-size: 2rem;
  margin-bottom: 20px;
`;

const Button = styled.button`
  background-color: #1877f2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;

  &:hover {
    background-color: #145dbf;
  }
`;

const VideoList = styled.ul`
  list-style: none;
  padding: 0;
`;

const VideoItem = styled.li`
  background-color: #f9f9f9;
  margin-bottom: 15px;
  padding: 15px;
  height: 1000px; /* Set a fixed height */
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const VideoTitle = styled.h3`
  font-size: 1.25rem;
  color: #333;
`;

const VideoInfo = styled.p`
  font-size: 1rem;
  color: #555;
`;

const ErrorText = styled.p`
  color: red;
`;

const LoadingText = styled.p`
  font-size: 1.2rem;
  color: #888;
`;

const FacebookAuthPage: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(false);
  const [loadingVideos, setLoadingVideos] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleToken = (accessToken: string) => {
    setToken(accessToken);
    setLoadingAuth(false);
  };

  useEffect(() => {
    setLoadingAuth(true);

    const searchParams = new URLSearchParams(window.location.search);
    const queryToken = searchParams.get("access_token");

    if (queryToken) {
      window.history.replaceState({}, "", window.location.pathname);
      handleToken(queryToken);
      return;
    }

    if (window.location.hash) {
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      const hashToken = hashParams.get("access_token");

      if (hashToken) {
        window.history.replaceState({}, "", window.location.pathname);
        handleToken(hashToken);
        return;
      }
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchVideos = async () => {
      setLoadingVideos(true);
      try {
        const resp = await fetch("/api/facebook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: token }),
        });
        const data = await resp.json();
        if (!resp.ok) {
          throw new Error(data.error || "Failed to fetch videos");
        }
        setVideos(data.videos);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoadingVideos(false);
      }
    };

    fetchVideos();
  }, [token]);

  const handleSort = () => {
    const sorted = [...(videos ?? [])].sort((a, b) => {
      const aViews = a.viewCount ?? 0;
      const bViews = b.viewCount ?? 0;
      return sortOrder === 'asc' ? aViews - bViews : bViews - aViews;
    });
    setVideos(sorted);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <PageContainer>
      <Title>Facebook Authentication</Title>

      {loadingAuth && !token && <LoadingText>Authenticating with Facebook...</LoadingText>}

      {!token && <FacebookAuthButton />}

      {token && loadingVideos && <LoadingText>Loading videos...</LoadingText>}

      {error && <ErrorText>Error: {error}</ErrorText>}

      {videos && (
        <div>
          <Button onClick={handleSort}>
            Sort by Views ({sortOrder === 'asc' ? 'Ascending' : 'Descending'})
          </Button>
          <VideoList>
            {videos.map((v) => (
              <VideoItem key={v.id}>
                <VideoTitle>{v.title || "(no title)"}</VideoTitle>
                <VideoInfo>Views: {v.viewCount}</VideoInfo>
                <VideoInfo>Created: {v.createdTime}</VideoInfo>
                <VideoInfo>Id: {v.id}</VideoInfo>
                <iframe
                  src={`https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/1389669548028513/videos/${v.id}/&show_text=0&width=560`}
                  width="560"
                  height="840"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                ></iframe>
                {v.error && <ErrorText>Insight error: {v.error}</ErrorText>}
              </VideoItem>
            ))}
          </VideoList>
        </div>
      )}
    </PageContainer>
  );
};

export default FacebookAuthPage;

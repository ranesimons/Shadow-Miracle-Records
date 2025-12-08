// pages/api/upload-facebook.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";

interface FacebookUploadRequestBody {
  blobUrl: string;
  title?: string;
  description?: string;
}

type ApiResponse =
  | { success: true; videoId: string }
  | { success: false; error: string };

// Type of the object we expect from Facebook on success.
interface FacebookVideoResponse {
  id: string;
  // There may be other fields — we only enforce `id`.
}

// Type guard for verifying unknown is FacebookVideoResponse
function isFacebookVideoResponse(
  obj: unknown
): obj is FacebookVideoResponse {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    typeof (obj as Record<string, unknown>).id === "string"
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const body = req.body as FacebookUploadRequestBody;
  const { blobUrl, title = "", description = "" } = body;

  if (!blobUrl) {
    return res.status(400).json({ success: false, error: "Missing required field blobUrl" });
  }

  const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;

  if (!pageAccessToken || !pageId) {
    return res.status(500).json({ success: false, error: "Server misconfigured: missing token or page ID" });
  }

  try {
    const params = new URLSearchParams();
    params.append("file_url", blobUrl);
    if (description) params.append("description", description);
    if (title)       params.append("title", title);
    params.append("published", "true");
    params.append("access_token", pageAccessToken);

    const apiUrl = `https://graph-video.facebook.com/v16.0/${pageId}/videos`;
    const fbResp = await fetch(apiUrl, {
      method: "POST",
      body: params,
    });

    const raw = await fbResp.json(); // raw is unknown

    if (isFacebookVideoResponse(raw)) {
      const videoId = raw.id;
      return res.status(200).json({ success: true, videoId });
    } else {
      // Try to extract error info if present
      let errorDetail = "";
      if (
        typeof raw === "object" &&
        raw !== null &&
        "error" in raw
      ) {
        try {
          errorDetail = JSON.stringify(
            (raw as Record<string, unknown>).error
          );
        } catch {
          errorDetail = "Unknown error object";
        }
      } else {
        errorDetail = JSON.stringify(raw);
      }
      return res.status(500).json({ success: false, error: `Unexpected response: ${errorDetail}` });
    }
  } catch (err: unknown) {
    console.error("Upload to Facebook Error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ success: false, error: message });
  }
}

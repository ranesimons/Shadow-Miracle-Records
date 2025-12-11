// pages/api/create-mockup.ts
import type { NextApiRequest, NextApiResponse } from "next";

const PRINTFUL_API_BASE = "https://api.printful.com";
// const PRINTFUL_TOKEN = process.env.PRINTFUL_TOKEN!;
const PRINTFUL_TOKEN = process.env.PRINTFUL_API_TOKEN!;
const STORE_ID = process.env.PRINTFUL_STORE_ID;  // optional depending on your auth mode

// --- Types ---
// Request body you expect from client
export interface CreateMockupRequestBody {
  productId: number;
  variantIds: number[];
  imageUrl: string;
  format?: "jpg" | "png";
}

// Printful API JSON response types:

interface PrintfulCreateTaskResponse {
  code: number;
  result: {
    task_key: string;
    status: "pending" | "completed" | "failed";
    error?: string;
  };
}

interface GenerationTaskMockup {
  placement: string;
  variant_ids: number[];
  mockup_url: string;
  extra?: {
    title?: string;
    url?: string;
    option?: string;
    option_group?: string;
  }[];
}

interface PrintfulGetTaskResponse {
  code: number;
  result: {
    task_key: string;
    status: "pending" | "completed" | "failed";
    error?: string;
    mockups?: GenerationTaskMockup[];
    printfiles?: any[];
  };
}

// Response your API returns:
type ErrorResponse = { error: string };
type SuccessResponse = {
  taskKey: string;
  mockupUrls?: string[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  let body: CreateMockupRequestBody;
  try {
    body = req.body;
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const { productId, variantIds, imageUrl, format = "png" } = body;

  console.log('(((')
  console.log(productId)
  console.log(variantIds)
  console.log(imageUrl)
  console.log(format)
  console.log('(((')

  if (
    typeof productId !== "number" ||
    !Array.isArray(variantIds) ||
    variantIds.some((v) => typeof v !== "number") ||
    typeof imageUrl !== "string"
  ) {
    return res.status(400).json({ error: "Invalid request payload" });
  }

  try {
    const taskKey = await createMockupTask(productId, variantIds, imageUrl, format);

    // Wait a bit before first check (Printful recommends ~10s) :contentReference[oaicite:4]{index=4}
    await new Promise((r) => setTimeout(r, 10_000));

    const result = await fetchMockupTask(taskKey);

    if (result.status !== "completed") {
      return res.status(202).json({ taskKey }); // still processing
    }

    const urls = result.mockups?.map((m) => m.mockup_url).filter(Boolean) ?? [];
    return res.status(200).json({ taskKey, mockupUrls: urls });
  } catch (err: any) {
    console.error("Error with Printful mockup:", err);
    return res.status(500).json({ error: err.message ?? "Unknown error" });
  }
}

interface PrintfileInfo {
  printfile_id: number;
  width: number;
  height: number;
  // maybe other fields depending on what the API returns
}

async function getPrintfileInfo(variantId: number): Promise<PrintfileInfo> {
  const resp = await fetch(`https://api.printful.com/mockup-generator/printfiles/${variantId}`, {
    headers: {
      'Authorization': `Bearer ${PRINTFUL_TOKEN}`,
      'Content-Type': 'application/json',
      ...(STORE_ID ? { "X-PF-Store-ID": STORE_ID } : {}),
    },
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Failed to fetch printfile info: ${resp.status} — ${text}`);
  }
  const json = await resp.json();
  // example structure — adjust based on actual response
  const pf = json.result.printfiles?.[0];
  if (!pf) throw new Error('No printfiles found for variant ' + variantId);
  return {
    printfile_id: pf.printfile_id,
    width: pf.width,
    height: pf.height,
  };
}

async function createMockupTask(
  productId: number,
  variantIds: number[],
  imageUrl: string,
  format: "jpg" | "png"
): Promise<string> {
  const pf = await getPrintfileInfo(variantIds[0]);

  const position = {
    area_width: pf.width,
    area_height: pf.height,
    width: pf.width,
    height: pf.height,
    top: 0,
    left: 0,
    limit_to_print_area: true,
  };

  const resp = await fetch(
    `${PRINTFUL_API_BASE}/mockup-generator/create-task/${productId}`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PRINTFUL_TOKEN}`,
        "Content-Type": "application/json",
        ...(STORE_ID ? { "X-PF-Store-ID": STORE_ID } : {}),
      },
      body: JSON.stringify({
        variant_ids: variantIds,
        format,
        files: [
          {
            // placement: "front",
            placement: "default",
            image_url: imageUrl,
            position
          },
        ],
      }),
    }
  );

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Printful create-task failed: ${resp.status} ${text}`);
  }

  const data = (await resp.json()) as PrintfulCreateTaskResponse;
  return data.result.task_key;
}

async function fetchMockupTask(taskKey: string): Promise<PrintfulGetTaskResponse["result"]> {
  const resp = await fetch(
    `${PRINTFUL_API_BASE}/mockup-generator/task?task_key=${encodeURIComponent(taskKey)}`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${PRINTFUL_TOKEN}`,
        ...(STORE_ID ? { "X-PF-Store-ID": STORE_ID } : {}),
      },
    }
  );

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Printful task fetch failed: ${resp.status} ${text}`);
  }

  const data = (await resp.json()) as PrintfulGetTaskResponse;
  return data.result;
}

import { NextResponse } from "next/server"
import sharp from 'sharp';

// Cấu hình API TensorArt
const TENSOR_ART_API_URL = "https://ap-east-1.tensorart.cloud/v1"
const WORKFLOW_TEMPLATE_ID = "837405094118019506"

// Thêm interface cho lỗi
interface APIError {
  code: number
  message: string
}

function isValidBase64(str: string): boolean {
  try {
    return Buffer.from(str, 'base64').toString('base64') === str;
  } catch (e) {
    return false;
  }
}

// Hàm upload ảnh lên TensorArt
async function uploadImageToTensorArt(imageData: string) {
  const apiKey = process.env.NEXT_PUBLIC_TENSOR_ART_API_KEY;
  if (!apiKey) throw new Error("NEXT_PUBLIC_TENSOR_ART_API_KEY is not defined");

  try {
    const isUrl = imageData.startsWith('http://') || imageData.startsWith('https://');
    let buffer: Buffer;

    if (isUrl) {
      const response = await fetch(imageData);
      if (!response.ok) {
        throw new Error(`Failed to fetch image from URL: ${response.status} - ${response.statusText}`);
      }
      buffer = Buffer.from(await response.arrayBuffer());
    } else {
      const base64Data = imageData.split(',')[1] || imageData;
      if (!isValidBase64(base64Data)) {
        throw new Error('Invalid base64 data');
      }
      buffer = Buffer.from(base64Data, 'base64');
    }

    // Kiểm tra định dạng ảnh bằng sharp
    await sharp(buffer).metadata();

    // Tạo resource mới
    const resourceRes = await fetch(`${TENSOR_ART_API_URL}/resource/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ expireSec: 7200 }),
    });

    if (!resourceRes.ok) {
      throw new Error(`POST failed: ${resourceRes.status} - ${await resourceRes.text()}`);
    }

    const resourceResponse = await resourceRes.json();
    const putUrl = resourceResponse.putUrl as string;
    const resourceId = resourceResponse.resourceId as string;
    const putHeaders = (resourceResponse.headers as Record<string, string>) || { 'Content-Type': 'image/png' };

    // Upload ảnh thực tế
    const putResponse = await fetch(putUrl, {
      method: 'PUT',
      headers: putHeaders,
      body: buffer,
    });

    if (![200, 203].includes(putResponse.status)) {
      throw new Error(`PUT failed: ${putResponse.status} - ${await putResponse.text()}`);
    }

    return resourceId;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// Hàm tạo job xử lý ảnh
async function createInpaintingJob(uploadedImageId: string, productImageId: string, maskImageId: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_TENSOR_ART_API_KEY;
  if (!apiKey) throw new Error("NEXT_PUBLIC_TENSOR_ART_API_KEY is not defined");

  const workflowData = {
    request_id: Date.now().toString(),
    templateId: WORKFLOW_TEMPLATE_ID,
    fields: {
      fieldAttrs: [
        { nodeId: "731", fieldName: "image", fieldValue: uploadedImageId }, // Ảnh gốc
        { nodeId: "735", fieldName: "image", fieldValue: productImageId },  // Ảnh kết cấu đá
        { nodeId: "745", fieldName: "image", fieldValue: maskImageId },     // Ảnh mask
      ],
    },
  };

  const response = await fetch(`${TENSOR_ART_API_URL}/jobs/workflow/template`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(workflowData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  if (!data.job?.id) throw new Error("Missing job ID");
  return data.job.id;
}

// Hàm theo dõi tiến trình job
async function pollJobStatus(jobId: string) {
  const apiKey = process.env.NEXT_PUBLIC_TENSOR_ART_API_KEY;
  if (!apiKey) throw new Error("NEXT_PUBLIC_TENSOR_ART_API_KEY is not defined");

  const maxAttempts = 36; // Tăng số lần thử lên 36 (36 * 5s = 180s = 3 phút)
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(`${TENSOR_ART_API_URL}/jobs/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    const { job } = await response.json();
    
    if (job.status === 'SUCCESS') {
      return job.resultUrl || job.successInfo?.images?.[0]?.url || job.output?.[0]?.url;
    }
    
    if (job.status === 'FAILED') {
      throw new Error(job.failedInfo?.reason || 'Job failed');
    }

    await new Promise((resolve) => setTimeout(resolve, 5000)); // Chờ 5 giây giữa các lần thử
  }
  throw new Error('Job processing timed out');
}

// Handler cho POST request
export async function POST(request: Request) {
  const { originalImage, textureImage, maskedImage } = await request.json();

  try {
    // Upload các ảnh lên TensorArt
    const [uploadedImageId, productImageId, maskImageId] = await Promise.all([
      uploadImageToTensorArt(originalImage),
      uploadImageToTensorArt(textureImage),
      uploadImageToTensorArt(maskedImage)
    ]);

    // Tạo job xử lý
    const jobId = await createInpaintingJob(uploadedImageId, productImageId, maskImageId);

    // Theo dõi tiến trình job
    const resultUrl = await pollJobStatus(jobId);

    return NextResponse.json({ resultUrl });
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lỗi khi xử lý ảnh' },
      { status: 500 }
    );
  }
}

// Handler cho OPTIONS request
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}


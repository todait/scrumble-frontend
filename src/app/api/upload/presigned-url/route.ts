import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Runtime 설정 (Vercel Functions 호환성)
export const runtime = 'nodejs';
export const maxDuration = 30; // 30초 타임아웃

// 환경변수 검증
function validateEnvironment() {
  const required = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}

// R2 클라이언트 설정 (lazy initialization)
let r2Client: S3Client | null = null;

function getR2Client() {
  if (!r2Client) {
    validateEnvironment();
    
    r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
      // Vercel 환경에서의 추가 설정
      forcePathStyle: true,
      maxAttempts: 3,
    });
  }
  
  return r2Client;
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== Presigned URL API 시작 ===');
    
    // 환경변수 검증
    validateEnvironment();
    console.log('환경변수 검증 완료');

    // 인증 확인 (선택사항)
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.log('인증 헤더 누락');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileName, contentType } = await request.json();
    console.log('요청 데이터:', { fileName, contentType });

    // 파일 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(contentType)) {
      console.log('허용되지 않는 파일 타입:', contentType);
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // 고유한 파일 키 생성
    const timestamp = new Date().toISOString().split('T')[0];
    const uuid = uuidv4();
    const extension = fileName.split('.').pop();
    const key = `uploads/${timestamp}/${uuid}.${extension}`;
    console.log('생성된 키:', key);

    // R2 클라이언트 가져오기
    const client = getR2Client();
    console.log('R2 클라이언트 초기화 완료');

    // Presigned URL 생성
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      ContentType: contentType,
      // 추가 메타데이터
      Metadata: {
        originalName: fileName,
        uploadedAt: new Date().toISOString(),
      },
    });

    console.log('PutObjectCommand 생성 완료');

    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: 3600, // 1시간
    });

    console.log('Presigned URL 생성 완료');

    // Public URL
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    const response = {
      uploadUrl,
      publicUrl,
      key,
    };

    console.log('=== API 응답 ===', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('=== Presigned URL 생성 에러 ===');
    console.error('Error details:', error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json({ 
      error: 'Failed to generate presigned URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

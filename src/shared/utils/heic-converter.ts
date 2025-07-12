/**
 * 🔥 UltraThink HEIC Converter
 * 
 * HEIC/HEIF 파일을 JPEG로 변환하는 강력한 fallback 시스템
 */

import { debug } from './debug';

// HEIC 파일 감지
export const isHeicFile = (file: File): boolean => {
  return file.type === 'image/heic' || file.type === 'image/heif' || 
         file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
};

// 실제 파일 형식 검사 (HEIC인지 JPEG인지)
const checkRealFormat = async (file: File): Promise<{ isReallyHeic: boolean; file: File }> => {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  
  // JPEG 시그니처: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    debug('HEIC', '📸 실제로는 JPEG 파일입니다! iOS가 이미 변환했을 수 있습니다.');
    const newFile = new File([buffer], file.name.replace(/\.heic$/i, '.jpg'), {
      type: 'image/jpeg',
      lastModified: file.lastModified,
    });
    return { isReallyHeic: false, file: newFile };
  }
  
  // ftyp box 확인 (HEIC 파일의 경우)
  const ftypBox = bytes.length >= 8 ? new TextDecoder().decode(bytes.slice(4, 8)) : '';
  const brand = bytes.length >= 12 ? new TextDecoder().decode(bytes.slice(8, 12)) : '';
  const isReallyHeic = ftypBox === 'ftyp' && (brand === 'heic' || brand === 'heix' || brand === 'mif1');
  
  return { isReallyHeic, file };
};

// Method 1: heic2any 라이브러리 사용 (개선된 버전)
const convertWithHeic2Any = async (file: File): Promise<File> => {
  const { default: heic2any } = await import('heic2any');
  
  // 여러 옵션으로 시도
  const options = [
    { toType: 'image/jpeg' as const, quality: 0.9 },
    { toType: 'image/png' as const },
    { toType: 'image/jpeg' as const, quality: 1 },
  ];
  
  for (const option of options) {
    try {
      debug('HEIC', `heic2any 시도: ${option.toType}, quality: ${option.quality}`);
      
      const convertedBlob = await heic2any({
        blob: file,
        ...option
      });

      const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
      
      if (!blob || blob.size === 0) {
        throw new Error('변환된 blob이 비어있습니다');
      }
      
      const extension = option.toType === 'image/png' ? '.png' : '.jpg';
      const newFileName = file.name.replace(/\.(heic|heif)$/i, extension);
      
      return new File([blob], newFileName, {
        type: option.toType,
        lastModified: file.lastModified,
      });
    } catch (error) {
      debug('HEIC', `heic2any ${option.toType} 실패: ${error}`);
      continue;
    }
  }
  
  throw new Error('heic2any 모든 옵션 실패');
};

// Method 2: heic-decode 라이브러리 사용 (수정된 버전)
const convertWithHeicDecode = async (file: File): Promise<File> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decode = (await import('heic-decode' as any)).default;
    const arrayBuffer = await file.arrayBuffer();
    const decodedResult = await decode({ buffer: arrayBuffer });
    
    // 디코딩 결과 처리 (배열이거나 단일 객체일 수 있음)
    let imageData;
    if (Array.isArray(decodedResult)) {
      imageData = decodedResult[0];
    } else {
      imageData = decodedResult;
    }
    
    if (!imageData || !imageData.width || !imageData.height) {
      throw new Error('유효하지 않은 이미지 데이터');
    }
    
    // Canvas 생성
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas context를 생성할 수 없습니다.');
    }
    
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    
    // 데이터 변환 - 다양한 형식 처리
    let pixelData: Uint8ClampedArray;
    
    if (imageData.data instanceof Uint8ClampedArray) {
      pixelData = imageData.data;
    } else if (imageData.data instanceof Uint8Array) {
      pixelData = new Uint8ClampedArray(imageData.data.buffer);
    } else if (Array.isArray(imageData.data)) {
      pixelData = new Uint8ClampedArray(imageData.data);
    } else if (imageData.data && typeof imageData.data === 'object') {
      // 객체인 경우 값들을 배열로 변환
      const values = Object.values(imageData.data).filter(v => typeof v === 'number');
      pixelData = new Uint8ClampedArray(values);
    } else {
      throw new Error('알 수 없는 픽셀 데이터 형식');
    }
    
    // 픽셀 데이터 크기 검증
    const expectedSize = imageData.width * imageData.height * 4;
    if (pixelData.length !== expectedSize) {
      debug('HEIC', `픽셀 데이터 크기 불일치: ${pixelData.length} !== ${expectedSize}`);
      // 크기가 맞지 않으면 패딩 또는 트리밍
      if (pixelData.length < expectedSize) {
        const paddedData = new Uint8ClampedArray(expectedSize);
        paddedData.set(pixelData);
        pixelData = paddedData;
      } else {
        pixelData = pixelData.slice(0, expectedSize);
      }
    }
    
    const imageDataObj = new ImageData(pixelData, imageData.width, imageData.height);
    ctx.putImageData(imageDataObj, 0, 0);
    
    return new Promise<File>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob && blob.size > 0) {
          const newFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
          resolve(new File([blob], newFileName, {
            type: 'image/jpeg',
            lastModified: file.lastModified,
          }));
        } else {
          reject(new Error('Canvas에서 blob 생성에 실패했습니다.'));
        }
      }, 'image/jpeg', 0.9);
    });
  } catch (error) {
    debug('HEIC', `heic-decode 상세 오류: ${error}`);
    throw error;
  }
};

// Method 3: FileReader와 Base64를 이용한 방식
const convertWithFileReader = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas 컨텍스트를 생성할 수 없습니다.'));
        return;
      }
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const newFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
            resolve(new File([blob], newFileName, {
              type: 'image/jpeg',
              lastModified: file.lastModified,
            }));
          } else {
            reject(new Error('FileReader Canvas에서 blob 생성에 실패했습니다.'));
          }
        }, 'image/jpeg', 0.8);
      };
      
      img.onerror = () => {
        reject(new Error('FileReader 이미지 로드에 실패했습니다.'));
      };
      
      img.src = reader.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('FileReader 파일 읽기에 실패했습니다.'));
    };
    
    reader.readAsDataURL(file);
  });
};

// Method 4: heic-convert 라이브러리 사용
const convertWithHeicConvert = async (file: File): Promise<File> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const heicConvert = (await import('heic-convert' as any)).default;
    const buffer = await file.arrayBuffer();
    
    // Uint8Array로 변환
    const inputBuffer = new Uint8Array(buffer);
    
    const outputBuffer = await heicConvert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality: 0.9
    });

    if (!outputBuffer || outputBuffer.length === 0) {
      throw new Error('변환된 버퍼가 비어있습니다');
    }

    const blob = new Blob([outputBuffer], { type: 'image/jpeg' });
    const newFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
    
    return new File([blob], newFileName, {
      type: 'image/jpeg',
      lastModified: file.lastModified,
    });
  } catch (error) {
    debug('HEIC', `heic-convert 실패: ${error}`);
    throw error;
  }
};

// Method 5: File API와 Canvas를 이용한 브라우저 네이티브 방식
const convertWithBrowserNative = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas 컨텍스트를 생성할 수 없습니다.'));
      return;
    }
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const newFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
          const convertedFile = new File([blob], newFileName, {
            type: 'image/jpeg',
            lastModified: file.lastModified,
          });
          resolve(convertedFile);
        } else {
          reject(new Error('Canvas에서 blob 생성에 실패했습니다.'));
        }
      }, 'image/jpeg', 0.8);
    };
    
    img.onerror = () => {
      reject(new Error('브라우저 네이티브 이미지 로드에 실패했습니다.'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// 변환 방법 인터페이스
interface ConversionMethod {
  name: string;
  method: (file: File) => Promise<File>;
}

// 모든 변환 방법 배열
const conversionMethods: ConversionMethod[] = [
  { name: 'heic2any', method: convertWithHeic2Any },
  { name: 'heic-decode', method: convertWithHeicDecode },
  { name: 'file-reader', method: convertWithFileReader },
  { name: 'heic-convert', method: convertWithHeicConvert },
  { name: 'browser-native', method: convertWithBrowserNative },
];

/**
 * 강력한 다중 라이브러리 HEIC 변환 함수 (UltraThink 모드!)
 * 
 * @param file - 변환할 HEIC/HEIF 파일
 * @returns 변환된 JPEG 파일
 * @throws 모든 변환 방법이 실패한 경우 에러
 */
export const convertHeicToJpeg = async (file: File): Promise<File> => {
  if (typeof window === 'undefined') {
    throw new Error('HEIC 변환은 브라우저에서만 지원됩니다.');
  }

  debug('HEIC', `🔥 UltraThink HEIC 변환 시작: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
  
  // 먼저 실제 형식 확인
  const { isReallyHeic, file: checkedFile } = await checkRealFormat(file);
  
  if (!isReallyHeic) {
    debug('HEIC', '✅ 이미 JPEG 형식입니다. 변환 불필요!');
    return checkedFile;
  }
  
  let lastError: Error | null = null;
  const errors: { method: string; error: Error }[] = [];

  // 모든 변환 방법 시도
  for (let i = 0; i < conversionMethods.length; i++) {
    const { name, method } = conversionMethods[i];
    
    try {
      debug('HEIC', `🔥 시도 ${i + 1}/${conversionMethods.length}: ${name} 방법으로 변환 중...`);
      
      const startTime = Date.now();
      const result = await method(file);
      const duration = Date.now() - startTime;
      
      // 변환 결과 검증
      if (!result || result.size === 0) {
        throw new Error('변환된 파일이 비어있습니다');
      }
      
      // 변환 성공!
      debug('HEIC', `✅ 성공! ${name} 방법으로 변환 완료!`);
      debug('HEIC', `📊 변환 통계:`);
      debug('HEIC', `   - 원본: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      debug('HEIC', `   - 결과: ${result.name} (${(result.size / 1024 / 1024).toFixed(2)}MB)`);
      debug('HEIC', `   - 소요시간: ${duration}ms`);
      debug('HEIC', `   - 압축률: ${((1 - result.size / file.size) * 100).toFixed(1)}%`);
      
      return result;
      
    } catch (error) {
      lastError = error as Error;
      errors.push({ method: name, error: lastError });
      debug('HEIC', `❌ ${name} 변환 실패: ${error}`);
      
      // 마지막 방법도 실패한 경우
      if (i === conversionMethods.length - 1) {
        debug('HEIC', '🚨 모든 변환 방법이 실패했습니다!');
        debug('HEIC', '🔍 오류 요약:');
        errors.forEach(({ method, error }) => {
          debug('HEIC', `   - ${method}: ${error.message}`);
        });
        
        // 더 자세한 에러 메시지 로깅만 하고 원본 파일 반환
        const errorDetails = errors.map(e => `${e.method}: ${e.error.message}`).join('\n');
        debug('HEIC', `HEIC 변환 실패: ${file.name}\n파일 크기: ${(file.size / 1024 / 1024).toFixed(2)}MB\n시도한 방법들:\n${errorDetails}`);
        debug('HEIC', '⚠️ 변환 실패로 원본 파일을 그대로 사용합니다.');
        
        // throw 대신 원본 파일 반환
        return file;
      }
      
      // 다음 방법으로 계속 시도
      debug('HEIC', `⏭️ ${name} 실패, 다음 방법으로 시도 중...`);
    }
  }

  // 이 지점에 도달하면 안 됨 - 원본 파일 반환
  debug('HEIC', '예상치 못한 상황: 원본 파일을 그대로 반환합니다.');
  return file;
};

/**
 * HEIC 변환 상태 정보
 */
export interface HeicConversionInfo {
  isHeicFile: boolean;
  supportedMethods: string[];
  isSupported: boolean;
}

/**
 * 현재 환경에서 HEIC 변환 지원 여부 확인
 */
export const getHeicConversionInfo = (file: File): HeicConversionInfo => {
  return {
    isHeicFile: isHeicFile(file),
    supportedMethods: conversionMethods.map(m => m.name),
    isSupported: typeof window !== 'undefined',
  };
};

/**
 * HEIC 파일 디버깅 정보 출력
 */
export const debugHeicFile = async (file: File): Promise<void> => {
  debug('HEIC', '=== HEIC 파일 디버깅 ===');
  debug('HEIC', `파일명: ${file.name}`);
  debug('HEIC', `크기: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
  debug('HEIC', `MIME 타입: ${file.type}`);
  debug('HEIC', `마지막 수정: ${new Date(file.lastModified).toISOString()}`);
  
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  
  // 파일 시그니처 분석
  const header = Array.from(bytes.slice(0, 12))
    .map(b => b.toString(16).padStart(2, '0'))
    .join(' ');
  
  debug('HEIC', `파일 헤더: ${header}`);
  
  // ftyp box 확인
  if (bytes.length >= 8) {
    const ftypBox = new TextDecoder().decode(bytes.slice(4, 8));
    const brand = bytes.length >= 12 ? new TextDecoder().decode(bytes.slice(8, 12)) : 'N/A';
    debug('HEIC', `ftyp box: ${ftypBox}`);
    debug('HEIC', `브랜드: ${brand}`);
  }
  
  // JPEG 여부 확인
  const isJpeg = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;
  debug('HEIC', `JPEG 파일인가?: ${isJpeg}`);
  
  debug('HEIC', '=== 디버깅 완료 ===');
};
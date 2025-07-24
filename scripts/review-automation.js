#!/usr/bin/env node

/**
 * Tiptap 에디터 통합 자동 리뷰 스크립트
 * 
 * 이 스크립트는 코드 리뷰 과정을 자동화하여 
 * 일관성 있고 철저한 검증을 제공합니다.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Tiptap 에디터 통합 자동 리뷰 시작\n');

// 리뷰 결과를 저장할 객체
const reviewResult = {
  timestamp: new Date().toISOString(),
  architecture: {},
  functionality: {},
  performance: {},
  accessibility: {},
  compatibility: {},
  tests: {},
  issues: {
    critical: [],
    high: [],
    medium: [],
    low: []
  },
  score: 0,
  passed: false
};

// 1. 아키텍처 검증
console.log('📁 1. 아키텍처 구조 검증...');

function checkArchitecture() {
  const tiptapDir = 'src/shared/components/tiptap';
  const requiredFiles = [
    'BaseTiptapEditor.tsx',
    'tiptap.types.ts',
    'hooks/useOptimizedEditor.ts',
    'components/PostFormEditor.tsx',
    'components/CommentEditor.tsx', 
    'components/TodoEditor.tsx',
    'components/MentionList.tsx',
    'extensions/AutoLink.ts',
    'extensions/CustomMention.tsx',
    'extensions/post-form-extensions.ts',
    'extensions/comment-extensions.ts',
    'extensions/todo-extensions.ts'
  ];

  let missingFiles = [];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(tiptapDir, file);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
    }
  });

  reviewResult.architecture.structure = missingFiles.length === 0;
  
  if (missingFiles.length > 0) {
    reviewResult.issues.critical.push(`필수 파일 누락: ${missingFiles.join(', ')}`);
    console.log('❌ 필수 파일 누락:', missingFiles);
  } else {
    console.log('✅ 모든 필수 파일 존재');
  }

  // 순환 의존성 검사 (간단한 버전)
  try {
    const result = execSync('npx madge --circular src/shared/components/tiptap --ts-config tsconfig.json', { encoding: 'utf-8' });
    reviewResult.architecture.circularDeps = result.trim() === 'No circular dependency found!';
    
    if (reviewResult.architecture.circularDeps) {
      console.log('✅ 순환 의존성 없음');
    } else {
      reviewResult.issues.high.push('순환 의존성 발견');
      console.log('⚠️ 순환 의존성 발견');
    }
  } catch (error) {
    console.log('⚠️ 순환 의존성 검사 실패 (madge 설치 필요)');
  }
}

// 2. 타입 안전성 검증  
console.log('\n🔒 2. 타입 안전성 검증...');

function checkTypeSafety() {
  try {
    execSync('npm run type-check', { stdio: 'pipe' });
    reviewResult.architecture.typeSafety = true;
    console.log('✅ TypeScript 타입 검사 통과');
  } catch (error) {
    reviewResult.architecture.typeSafety = false;
    reviewResult.issues.critical.push('TypeScript 타입 에러 존재');
    console.log('❌ TypeScript 타입 에러 존재');
    console.log(error.stdout?.toString() || error.message);
  }
}

// 3. 린트 검사
console.log('\n🧹 3. 코드 품질 검증...');

function checkCodeQuality() {
  try {
    execSync('npm run lint', { stdio: 'pipe' });
    reviewResult.architecture.linting = true;
    console.log('✅ ESLint 검사 통과');
  } catch (error) {
    reviewResult.architecture.linting = false;
    reviewResult.issues.medium.push('ESLint 규칙 위반 존재');
    console.log('⚠️ ESLint 규칙 위반 존재');
  }
}

// 4. 단위 테스트 실행
console.log('\n🧪 4. 단위 테스트 실행...');

function runUnitTests() {
  try {
    const result = execSync('npm test -- --passWithNoTests --coverage', { encoding: 'utf-8' });
    reviewResult.tests.unit = true;
    
    // 커버리지 정보 추출 (간단한 버전)
    const coverageMatch = result.match(/All files[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*(\d+\.?\d*)/);
    if (coverageMatch) {
      const coverage = parseFloat(coverageMatch[1]);
      reviewResult.tests.coverage = coverage;
      
      if (coverage >= 80) {
        console.log(`✅ 단위 테스트 통과 (커버리지: ${coverage}%)`);
      } else {
        reviewResult.issues.medium.push(`테스트 커버리지 부족: ${coverage}% (목표: 80%)`);
        console.log(`⚠️ 테스트 커버리지 부족: ${coverage}% (목표: 80%)`);
      }
    } else {
      console.log('✅ 단위 테스트 통과');
    }
  } catch (error) {
    reviewResult.tests.unit = false;
    reviewResult.issues.critical.push('단위 테스트 실패');
    console.log('❌ 단위 테스트 실패');
  }
}

// 5. 번들 크기 분석
console.log('\n📦 5. 번들 크기 분석...');

function analyzeBundleSize() {
  try {
    execSync('npm run build', { stdio: 'pipe' });
    
    // .next/static/chunks 폴더에서 JS 파일 크기 확인
    const chunksDir = '.next/static/chunks';
    if (fs.existsSync(chunksDir)) {
      let totalSize = 0;
      const files = fs.readdirSync(chunksDir);
      
      files.forEach(file => {
        if (file.endsWith('.js')) {
          const filePath = path.join(chunksDir, file);
          const stats = fs.statSync(filePath);
          totalSize += stats.size;
        }
      });
      
      const totalSizeKB = Math.round(totalSize / 1024);
      reviewResult.performance.bundleSize = totalSizeKB;
      
      if (totalSizeKB <= 2000) { // 2MB 이하
        console.log(`✅ 번들 크기 적절: ${totalSizeKB}KB`);
      } else {
        reviewResult.issues.medium.push(`번들 크기 큼: ${totalSizeKB}KB (권장: <2MB)`);
        console.log(`⚠️ 번들 크기 큼: ${totalSizeKB}KB`);
      }
    }
  } catch (error) {
    console.log('⚠️ 번들 크기 분석 실패');
  }
}

// 6. 컴포넌트 통합 검증
console.log('\n🔗 6. 컴포넌트 통합 검증...');

function checkComponentIntegration() {
  const integrationFiles = [
    'src/shared/components/ui/PostForm.tsx',
    'src/shared/components/ui/CommentSection.tsx'
  ];
  
  let integrationIssues = [];
  
  integrationFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8');
      
      // PostForm 검증
      if (file.includes('PostForm.tsx')) {
        if (!content.includes('PostFormEditor')) {
          integrationIssues.push('PostForm에 PostFormEditor 통합되지 않음');
        }
        if (content.includes('textarea')) {
          integrationIssues.push('PostForm에서 기존 textarea 완전히 제거되지 않음');
        }
      }
      
      // CommentSection 검증  
      if (file.includes('CommentSection.tsx')) {
        if (!content.includes('CommentEditor')) {
          integrationIssues.push('CommentSection에 CommentEditor 통합되지 않음');
        }
        if (content.includes('textareaRef')) {
          integrationIssues.push('CommentSection에서 textareaRef 완전히 제거되지 않음');
        }
      }
    } else {
      integrationIssues.push(`통합 파일 누락: ${file}`);
    }
  });
  
  reviewResult.compatibility.integration = integrationIssues.length === 0;
  
  if (integrationIssues.length === 0) {
    console.log('✅ 컴포넌트 통합 완료');
  } else {
    integrationIssues.forEach(issue => {
      reviewResult.issues.critical.push(issue);
    });
    console.log('❌ 컴포넌트 통합 이슈:', integrationIssues);
  }
}

// 7. 이미지 업로드 호환성 검증
console.log('\n🖼️ 7. 이미지 업로드 호환성 검증...');

function checkImageUploadCompatibility() {
  const tiptapTypesPath = 'src/shared/components/tiptap/tiptap.types.ts';
  
  if (fs.existsSync(tiptapTypesPath)) {
    const content = fs.readFileSync(tiptapTypesPath, 'utf-8');
    
    const requiredMethods = [
      'uploadImages',
      'uploadingImages', 
      'completedImages',
      'removeImage',
      'clearImages',
      'isUploading',
      'isConverting',
      'convertingCount',
      'initializeWithImages',
      'isHeicSupported'
    ];
    
    const missingMethods = requiredMethods.filter(method => !content.includes(method));
    
    if (missingMethods.length === 0) {
      reviewResult.compatibility.imageUpload = true;
      console.log('✅ 이미지 업로드 인터페이스 완전 호환');
    } else {
      reviewResult.compatibility.imageUpload = false;
      reviewResult.issues.critical.push(`ImageUploadHook 인터페이스 불완전: ${missingMethods.join(', ')}`);
      console.log('❌ ImageUploadHook 인터페이스 불완전:', missingMethods);
    }
  } else {
    reviewResult.issues.critical.push('tiptap.types.ts 파일 누락');
    console.log('❌ tiptap.types.ts 파일 누락');
  }
}

// 8. 접근성 기본 검증
console.log('\n♿ 8. 접근성 기본 검증...');

function checkAccessibility() {
  const componentFiles = [
    'src/shared/components/tiptap/components/PostFormEditor.tsx',
    'src/shared/components/tiptap/components/CommentEditor.tsx',
    'src/shared/components/tiptap/components/MentionList.tsx'
  ];
  
  let a11yIssues = [];
  
  componentFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8');
      
      // ARIA 속성 확인
      if (!content.includes('aria-') && !content.includes('role=')) {
        a11yIssues.push(`${path.basename(file)}: ARIA 속성 누락`);
      }
      
      // contenteditable 확인
      if (file.includes('Editor.tsx') && !content.includes('contenteditable')) {
        a11yIssues.push(`${path.basename(file)}: contenteditable 속성 확인 필요`);
      }
    }
  });
  
  reviewResult.accessibility.basic = a11yIssues.length === 0;
  
  if (a11yIssues.length === 0) {
    console.log('✅ 기본 접근성 요구사항 충족');
  } else {
    a11yIssues.forEach(issue => {
      reviewResult.issues.high.push(issue);
    });
    console.log('⚠️ 접근성 이슈:', a11yIssues);
  }
}

// 9. 성능 기본 검증
console.log('\n⚡ 9. 성능 기본 검증...');

function checkPerformance() {
  const extensionFiles = [
    'src/shared/components/tiptap/extensions/post-form-extensions.ts',
    'src/shared/components/tiptap/extensions/comment-extensions.ts',
    'src/shared/components/tiptap/extensions/todo-extensions.ts'
  ];
  
  let performanceIssues = [];
  
  extensionFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8');
      
      // 동적 import 확인
      if (!content.includes('import(') || !content.includes('Promise.all')) {
        performanceIssues.push(`${path.basename(file)}: 동적 import 미사용`);
      }
      
      // as any 캐스팅 확인 (타입 안전성)
      const asAnyCount = (content.match(/as any/g) || []).length;
      if (asAnyCount > 5) {
        performanceIssues.push(`${path.basename(file)}: 과도한 타입 캐스팅 (${asAnyCount}개)`);
      }
    }
  });
  
  reviewResult.performance.optimization = performanceIssues.length === 0;
  
  if (performanceIssues.length === 0) {
    console.log('✅ 기본 성능 최적화 확인');
  } else {
    performanceIssues.forEach(issue => {
      reviewResult.issues.medium.push(issue);
    });
    console.log('⚠️ 성능 최적화 이슈:', performanceIssues);
  }
}

// 10. 최종 점수 계산
function calculateScore() {
  let score = 0;
  const maxScore = 100;
  
  // 아키텍처 (25점)
  if (reviewResult.architecture.structure) score += 10;
  if (reviewResult.architecture.typeSafety) score += 10;
  if (reviewResult.architecture.linting) score += 5;
  
  // 기능성 (25점)
  if (reviewResult.compatibility.integration) score += 15;
  if (reviewResult.compatibility.imageUpload) score += 10;
  
  // 테스트 (20점)
  if (reviewResult.tests.unit) score += 15;
  if (reviewResult.tests.coverage >= 80) score += 5;
  
  // 성능 (15점)
  if (reviewResult.performance.optimization) score += 10;
  if (reviewResult.performance.bundleSize <= 2000) score += 5;
  
  // 접근성 (15점)
  if (reviewResult.accessibility.basic) score += 15;
  
  // 이슈별 감점
  score -= reviewResult.issues.critical.length * 20;
  score -= reviewResult.issues.high.length * 10;
  score -= reviewResult.issues.medium.length * 5;
  score -= reviewResult.issues.low.length * 2;
  
  reviewResult.score = Math.max(0, score);
  reviewResult.passed = reviewResult.score >= 80 && reviewResult.issues.critical.length === 0;
  
  return reviewResult.score;
}

// 리뷰 보고서 생성
function generateReport() {
  const reportPath = 'review-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(reviewResult, null, 2));
  
  console.log('\n📊 리뷰 결과 요약:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🎯 최종 점수: ${reviewResult.score}/100`);
  console.log(`📋 전체 결과: ${reviewResult.passed ? '✅ 통과' : '❌ 실패'}`);
  console.log('');
  
  if (reviewResult.issues.critical.length > 0) {
    console.log('🚨 Critical Issues (반드시 수정):');
    reviewResult.issues.critical.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
    console.log('');
  }
  
  if (reviewResult.issues.high.length > 0) {
    console.log('⚠️ High Priority Issues (우선 수정):');
    reviewResult.issues.high.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
    console.log('');
  }
  
  if (reviewResult.issues.medium.length > 0) {
    console.log('📝 Medium Priority Issues (개선 권장):');
    reviewResult.issues.medium.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
    console.log('');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📄 상세 보고서: ${reportPath}`);
  
  if (reviewResult.passed) {
    console.log('🎉 축하합니다! 코드 리뷰를 통과했습니다.');
  } else {
    console.log('💪 Critical 이슈를 해결한 후 다시 실행해주세요.');
  }
}

// 메인 실행 함수
async function main() {
  try {
    checkArchitecture();
    checkTypeSafety();
    checkCodeQuality();
    runUnitTests();
    analyzeBundleSize();
    checkComponentIntegration();
    checkImageUploadCompatibility();
    checkAccessibility();
    checkPerformance();
    
    calculateScore();
    generateReport();
    
  } catch (error) {
    console.error('❌ 자동 리뷰 실행 중 오류 발생:', error.message);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { main, reviewResult };
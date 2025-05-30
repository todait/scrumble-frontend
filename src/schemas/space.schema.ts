import { z } from 'zod';

// 스페이스 이름 스키마
export const spaceNameSchema = z.object({
  name: z
    .string()
    .min(1, '워크스페이스 이름을 입력해주세요')
    .min(2, '워크스페이스 이름은 최소 2글자 이상이어야 합니다')
    .max(50, '워크스페이스 이름은 최대 50글자까지 가능합니다')
    .regex(
      /^[가-힣a-zA-Z0-9\s\-_]+$/,
      '워크스페이스 이름에는 한글, 영문, 숫자, 공백, 하이픈(-), 밑줄(_)만 사용할 수 있습니다'
    ),
});

// 이메일 스키마
export const emailSchema = z
  .string()
  .email('올바른 이메일 주소를 입력해주세요')
  .min(1, '이메일을 입력해주세요');

// 이메일 목록 스키마
export const emailListSchema = z.object({
  emails: z
    .array(emailSchema)
    .min(1, '최소 1개의 이메일을 입력해주세요')
    .max(10, '최대 10개의 이메일까지 입력할 수 있습니다'),
});

// 스페이스 생성 스키마
export const createSpaceSchema = spaceNameSchema;

// 팀 초대 스키마
export const inviteTeamSchema = emailListSchema;

// 타입 추출
export type SpaceNameFormData = z.infer<typeof spaceNameSchema>;
export type EmailListFormData = z.infer<typeof emailListSchema>;
export type CreateSpaceFormData = z.infer<typeof createSpaceSchema>;
export type InviteTeamFormData = z.infer<typeof inviteTeamSchema>;
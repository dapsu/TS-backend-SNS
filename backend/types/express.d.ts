// JWT 인증 위해 user 필드 추가
declare namespace Express {
  export interface Request {
    user: string | JwtPayload | undefined
  }
}
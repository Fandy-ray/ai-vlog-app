export interface UserProfile {
  id: string
  phone: string
  nickname: string
  avatarUrl: string | null
  createdAt: number
}

export interface UserSessionState {
  user: UserProfile | null
}

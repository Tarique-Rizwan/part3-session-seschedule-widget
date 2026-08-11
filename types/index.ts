export type SessionStatus = "Scheduled" | "Completed" | "Canceled"
export type RescheduleReason = "Conflict" | "Illness" | "Time zone" | "Other"

export interface TutoringSession {
  id: string
  subject: string
  teacherName: string
  datetime: string
  status: SessionStatus
}

export interface RescheduleRequest {
  sessionId: string
  originalDatetime: string
  newDatetime: string
  reason: RescheduleReason
}

export interface RescheduleResponse {
  success: boolean
  error?: string
}

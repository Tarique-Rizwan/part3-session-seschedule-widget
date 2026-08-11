import { TutoringSession } from "../types"

// Mock data for the next 3 upcoming sessions.
// Dates are stored in UTC, but will be formatted to local time on the UI.
export const mockSessions: TutoringSession[] = [
  {
    id: "session_1",
    subject: "Mathemaics",
    teacherName: "Mohit Tyagi",
    datetime: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    status: "Scheduled",
  },
  {
    id: "session_2",
    subject: "Physics",
    teacherName: "H. C. Verma",
    datetime: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
    status: "Scheduled",
  },
  {
    id: "session_3",
    subject: "English Literature",
    teacherName: "Neetu Singh",
    datetime: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
    status: "Scheduled",
  },
]

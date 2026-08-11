import { RescheduleRequest, RescheduleResponse } from "../types"

export const requestReschedule = async (
  data: RescheduleRequest,
): Promise<RescheduleResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const now = new Date()
  const newDate = new Date(data.newDatetime)
  const oldDate = new Date(data.originalDatetime)

  if (newDate.getTime() < now.getTime()) {
    return {
      success: false,
      error: "Invalid request: The proposed time slot is in the past.",
    }
  }

  if (newDate.getTime() === oldDate.getTime()) {
    return {
      success: false,
      error:
        "Invalid request: The new time slot cannot be identical to the existing slot.",
    }
  }

  return { success: true }
}

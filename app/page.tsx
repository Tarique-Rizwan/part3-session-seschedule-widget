"use client"

import React, { useState, useEffect } from "react"
import { TutoringSession, RescheduleReason } from "@/types"
import { mockSessions } from "@/data/mockSessions"
import { requestReschedule } from "@/utils/mockCloudFunction"

export default function UpcomingSessionsWidget() {
  const [sessions] = useState<TutoringSession[]>(mockSessions)
  const [selectedSession, setSelectedSession] =
    useState<TutoringSession | null>(null)

  const [newLocalDatetime, setNewLocalDatetime] = useState<string>("")
  const [reason, setReason] = useState<RescheduleReason>("Conflict")
  const [minDatetime, setMinDatetime] = useState<string>("")

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    const calculateMinLeadTime = () => {
      const date = new Date()
      date.setHours(date.getHours() + 2) // Add 2-hour lead time

      // Format locally to avoid timezone shifting from .toISOString()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      const hours = String(date.getHours()).padStart(2, "0")
      const minutes = String(date.getMinutes()).padStart(2, "0")

      setMinDatetime(`${year}-${month}-${day}T${hours}:${minutes}`)
    }
    calculateMinLeadTime()
  }, [selectedSession]) // Recalculate whenever the modal is opened

  const handleOpenModal = (session: TutoringSession) => {
    setSelectedSession(session)
    setNewLocalDatetime("")
    setReason("Conflict")
    setErrorMsg(null)
    setSuccessMsg(null)
  }

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setSelectedSession(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSession || !newLocalDatetime) return

    setIsSubmitting(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const utcDateString = new Date(newLocalDatetime).toISOString()

      const response = await requestReschedule({
        sessionId: selectedSession.id,
        originalDatetime: selectedSession.datetime,
        newDatetime: utcDateString,
        reason: reason,
      })

      if (!response.success) {
        setErrorMsg(response.error || "An unknown error occurred.")
      } else {
        setSuccessMsg("Reschedule request submitted successfully!")
        // Keep modal open for a moment to read success, then close
        setTimeout(() => setSelectedSession(null), 2000)
      }
    } catch (err) {
      setErrorMsg("Failed to connect to the server. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md font-sans">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Upcoming Tutoring Sessions
      </h2>

      {/* Widget List */}
      <div className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="p-4 border rounded-md flex justify-between items-center bg-gray-50"
          >
            <div>
              <p className="font-semibold text-lg text-gray-900">
                {session.subject}
              </p>
              <p className="text-gray-600">Teacher: {session.teacherName}</p>
              {/* Displaying stored UTC datetime in the parent's local time */}
              <p className="text-sm text-gray-500">
                {new Date(session.datetime).toLocaleString([], {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
              <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {session.status}
              </span>
            </div>
            <button
              onClick={() => handleOpenModal(session)}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              Request Reschedule
            </button>
          </div>
        ))}
      </div>

      {/* Reschedule Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold mb-4">Reschedule Session</h3>
            <p className="text-sm text-gray-600 mb-4">
              Current slot:{" "}
              {new Date(selectedSession.datetime).toLocaleString()}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Date & Time (Local)
                </label>
                <input
                  type="datetime-local"
                  required
                  min={minDatetime} // UI Constraint: Disables slots within 2 hours
                  value={newLocalDatetime}
                  onChange={(e) => setNewLocalDatetime(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm border p-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  *Time slots within 2 hours of current time are unavailable per
                  our lead-time policy.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Rescheduling
                </label>
                <select
                  value={reason}
                  onChange={(e) =>
                    setReason(e.target.value as RescheduleReason)
                  }
                  className="w-full border-gray-300 rounded-md shadow-sm border p-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Conflict">Conflict</option>
                  <option value="Illness">Illness</option>
                  <option value="Time zone">Time zone</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Status Messages */}
              {errorMsg && (
                <div className="p-3 bg-red-100 text-red-700 text-sm rounded">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-3 bg-green-100 text-green-700 text-sm rounded">
                  {successMsg}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newLocalDatetime}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

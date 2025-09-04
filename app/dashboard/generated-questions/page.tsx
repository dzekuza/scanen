"use client"

import * as React from "react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabaseClient"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useDashboardTitle } from "@/components/dashboard-title-context"
import { useEffect, useState } from "react"

interface AnalyzedResult {
  id: string
  file_id: string | null
  user_id: string | null
  business_id: string | null
  questions: Record<string, string> | string | string[] | null
  created_at: string
}

export default function ReportsPage() {
  const { user } = useAuth()
  const [results, setResults] = React.useState<AnalyzedResult[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [editedQuestions, setEditedQuestions] = React.useState<Record<string, Record<string, string>>>({})
  const [saving, setSaving] = React.useState<string | null>(null)
  const { setTitle } = useDashboardTitle()
  const [responses, setResponses] = useState<any[]>([])
  const [responsesLoading, setResponsesLoading] = useState(false)
  const [responsesError, setResponsesError] = useState<string | null>(null)

  useEffect(() => {
    setTitle("Generated Questions")
  }, [setTitle])

  React.useEffect(() => {
    if (!user) return
    const fetchResults = async () => {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from("analyzed_results")
        .select("id, file_id, user_id, business_id, questions, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      if (error) {
        setError(error.message)
        setResults([])
      } else {
        setResults(data || [])
      }
      setLoading(false)
    }
    fetchResults()
  }, [user])

  useEffect(() => {
    if (!user) return
    const fetchResponses = async () => {
      setResponsesLoading(true)
      setResponsesError(null)
      const { data: businesses } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
      const businessIds = (businesses || []).map((b: any) => b.id)
      if (businessIds.length === 0) {
        setResponses([])
        setResponsesLoading(false)
        return
      }
      const { data: answers, error } = await supabase
        .from("customer_answers")
        .select("id, business_id, user_id, question_id, answers, answered_at")
        .in("business_id", businessIds)
        .order("answered_at", { ascending: false })
      if (error) {
        setResponsesError(error.message)
        setResponses([])
      } else {
        setResponses(answers || [])
      }
      setResponsesLoading(false)
    }
    fetchResponses()
  }, [user])

  const handleInputChange = (resultId: string, qKey: string, value: string) => {
    setEditedQuestions((prev) => ({
      ...prev,
      [resultId]: {
        ...prev[resultId],
        [qKey]: value,
      },
    }))
  }

  const handleSave = async (result: AnalyzedResult, qKey: string) => {
    if (!result.questions) return
    setSaving(`${result.id}-${qKey}`)
    const updatedQuestions = { ...result.questions, [qKey]: editedQuestions[result.id]?.[qKey] }
    const { error } = await supabase
      .from("analyzed_results")
      .update({ questions: updatedQuestions })
      .eq("id", result.id)
    if (!error) {
      setResults((prev) =>
        prev.map((r) =>
          r.id === result.id ? { ...r, questions: updatedQuestions } : r
        )
      )
      setEditedQuestions((prev) => {
        const { [qKey]: _, ...rest } = prev[result.id] || {}
        return { ...prev, [result.id]: rest }
      })
    }
    setSaving(null)
  }

  return (
    <div className="px-4 lg:px-6">
      {loading ? (
        <div>Loading generated questions...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : results.length === 0 ? (
        <div>No generated questions found.</div>
      ) : (
        <div className="space-y-8">
          {results.map((result) => (
            <div key={result.id} className="border rounded-lg p-6">
              <div className="mb-4">
                <div className="font-semibold text-lg mb-1">Generated Questions</div>
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Analyzed on:</span> {new Date(result.created_at).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Business ID:</span> {result.business_id}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {(() => {
                  const q = result.questions
                  if (!q) return <div className="col-span-1">No questions found for this report.</div>

                  // If stored as a plain string (single question)
                  if (typeof q === 'string') {
                    const qKey = 'q1'
                    const qVal = q
                    const edited = editedQuestions[result.id]?.[qKey] ?? qVal
                    const isChanged = edited !== qVal
                    return (
                      <div className="flex flex-col gap-2">
                        <Input value={edited} onChange={e => handleInputChange(result.id, qKey, e.target.value)} />
                        {isChanged && (
                          <Button size="sm" onClick={() => handleSave(result as any, qKey)} disabled={saving === `${result.id}-${qKey}`}>
                            {saving === `${result.id}-${qKey}` ? 'Saving...' : 'Save'}
                          </Button>
                        )}
                      </div>
                    )
                  }

                  // If stored as an array of strings
                  if (Array.isArray(q)) {
                    return q.map((qVal, i) => {
                      const qKey = `q${i + 1}`
                      const edited = editedQuestions[result.id]?.[qKey] ?? qVal
                      const isChanged = edited !== qVal
                      return (
                        <div key={qKey} className="flex flex-col gap-2">
                          <Input value={edited} onChange={e => handleInputChange(result.id, qKey, e.target.value)} />
                          {isChanged && (
                            <Button size="sm" onClick={() => handleSave(result as any, qKey)} disabled={saving === `${result.id}-${qKey}`}>
                              {saving === `${result.id}-${qKey}` ? 'Saving...' : 'Save'}
                            </Button>
                          )}
                        </div>
                      )
                    })
                  }

                  // Fallback to object map behavior
                  const entries = Object.entries(q as Record<string, string>)
                  if (entries.length === 0) return <div className="col-span-1">No questions found for this report.</div>
                  return entries.map(([qKey, qVal], i) => {
                    const edited = editedQuestions[result.id]?.[qKey] ?? qVal
                    const isChanged = edited !== qVal
                    return (
                      <div key={i} className="flex flex-col gap-2">
                        <Input value={edited} onChange={e => handleInputChange(result.id, qKey, e.target.value)} />
                        {isChanged && (
                          <Button size="sm" onClick={() => handleSave(result as any, qKey)} disabled={saving === `${result.id}-${qKey}`}>
                            {saving === `${result.id}-${qKey}` ? 'Saving...' : 'Save'}
                          </Button>
                        )}
                      </div>
                    )
                  })
                })()}
              </div>
            </div>
          ))}
          <div className="mt-10">
            <h2 className="text-lg font-semibold mb-4">All Responses</h2>
            {responsesLoading ? (
              <div>Loading responses...</div>
            ) : responsesError ? (
              <div className="text-red-500">{responsesError}</div>
            ) : responses.length === 0 ? (
              <div>No responses found.</div>
            ) : (
              <div className="space-y-6">
                {responses.map((response: any) => (
                  <div key={response.id} className="border rounded p-4">
                    <div className="mb-2 text-sm text-gray-500">
                      <b>User ID:</b> {response.user_id} <br />
                      <b>Submitted:</b> {new Date(response.answered_at).toLocaleString()}
                    </div>
                    <div className="space-y-2">
                      {response.answers && typeof response.answers === 'object' ? (
                        Object.entries(response.answers).map(([questionId, answer]: [string, any]) => (
                          <div key={questionId} className="flex flex-col gap-1">
                            <div className="text-sm font-medium">Q: {questionId}</div>
                            <div className="text-sm text-gray-600">A: {String(answer)}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">No answers found</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 
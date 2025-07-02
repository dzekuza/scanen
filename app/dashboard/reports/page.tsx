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
  questions: Record<string, string> | null
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
    setTitle("Your Analyzed Reports")
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
        .select("id, business_id, name, email, phone, question_id, answer, inserted_at")
        .in("business_id", businessIds)
        .order("inserted_at", { ascending: false })
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
        <div>Loading analyzed results...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : results.length === 0 ? (
        <div>No analyzed reports found.</div>
      ) : (
        <div className="space-y-6">
          {results.map((result) => (
            <React.Fragment key={result.id}>
              <div className="font-semibold mb-2">Analyzed on {new Date(result.created_at).toLocaleString()}</div>
              <div className="text-xs text-gray-500 mb-2">
                <b>Business ID:</b> {result.business_id}
              </div>
              <div className="grid grid-cols-1 gap-4">
                {result.questions && Object.entries(result.questions).length > 0 ? (
                  Object.entries(result.questions).map(([qKey, qVal], i) => {
                    const edited = editedQuestions[result.id]?.[qKey] ?? qVal
                    const isChanged = edited !== qVal
                    return (
                      <div key={i} className="flex flex-col gap-2">
                        <Input
                          value={edited}
                          onChange={e => handleInputChange(result.id, qKey, e.target.value)}
                        />
                        {isChanged && (
                          <Button
                            size="sm"
                            onClick={() => handleSave(result, qKey)}
                            isDisabled={saving === `${result.id}-${qKey}`}
                          >
                            {saving === `${result.id}-${qKey}` ? "Saving..." : "Save"}
                          </Button>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div className="col-span-1">No questions found for this report.</div>
                )}
              </div>
            </React.Fragment>
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
                {Object.entries(
                  responses.reduce((acc, curr) => {
                    const key = `${curr.user_id}|${curr.inserted_at}`;
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(curr);
                    return acc;
                  }, {} as Record<string, any[]>)
                ).map(([key, group]) => {
                  const g = group as any[];
                  return (
                    <div key={key} className="border rounded p-4">
                      <div className="mb-2 text-sm text-gray-500">
                        <b>User ID:</b> {g[0].user_id} <br />
                        <b>Submitted:</b> {new Date(g[0].inserted_at).toLocaleString()}
                      </div>
                      <ul className="list-disc pl-6">
                        {g.map((resp: any, idx: any) => (
                          <li key={resp.question_id + idx}><b>Q:</b> {resp.question_id} <b>A:</b> {resp.answer}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 
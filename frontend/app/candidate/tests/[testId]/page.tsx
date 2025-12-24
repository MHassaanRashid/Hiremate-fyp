"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import CandidateLayout from "@/layouts/CandidateLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, AlertCircle, Loader2, CheckCircle2, Code2 } from "lucide-react"
import { getTest, submitAnswer, completeTest } from "@/lib/api/tests"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import type { TestQuestion } from "@/types/dashboard"

export default function TestExecutionPage() {
    const router = useRouter()
    const params = useParams()
    const testId = params.testId as string

    const [test, setTest] = useState<any>(null)
    const [questions, setQuestions] = useState<TestQuestion[]>([])
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, any>>({})
    const [timeRemaining, setTimeRemaining] = useState(0)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetchTest()
    }, [testId])

    useEffect(() => {
        if (timeRemaining <= 0) return

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    handleAutoSubmit()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [timeRemaining])

    const fetchTest = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/auth/candidate')
                return
            }

            const data = await getTest(session.access_token, testId)
            setTest(data.test)
            setQuestions(data.questions)

            // Calculate time remaining
            const startTime = new Date(data.test.started_at).getTime()
            const now = Date.now()
            const elapsed = Math.floor((now - startTime) / 1000)
            const total = data.test.duration_minutes * 60
            setTimeRemaining(Math.max(0, total - elapsed))
        } catch (error) {
            console.error("Error fetching test:", error)
            toast.error("Failed to load test")
            router.push('/candidate/tests')
        } finally {
            setLoading(false)
        }
    }

    const handleAnswerChange = (questionId: string, value: any) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: value
        }))
    }

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1)
        }
    }

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1)
        }
    }

    const handleAutoSubmit = async () => {
        toast.error("Time's up! Submitting test...")
        await handleSubmit()
    }

    const handleSubmit = async () => {
        setSubmitting(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            // Submit all answers
            for (const question of questions) {
                const answer = answers[question.id]
                if (answer !== undefined) {
                    await submitAnswer(session.access_token, testId, {
                        question_id: question.id,
                        selected_option: question.type === 'mcq' ? answer : undefined,
                        code_submission: question.type === 'coding' ? answer : undefined,
                        time_spent_seconds: 0
                    })
                }
            }

            // Complete test
            await completeTest(session.access_token, testId)

            toast.success("Test submitted successfully!")
            router.push(`/candidate/tests/${testId}/report`)
        } catch (error) {
            console.error("Error submitting test:", error)
            toast.error("Failed to submit test")
        } finally {
            setSubmitting(false)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    if (loading) {
        return (
            <CandidateLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            </CandidateLayout>
        )
    }

    const currentQuestion = questions[currentQuestionIndex]

    return (
        <CandidateLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6 md:p-8">
                <div className="max-w-4xl mx-auto space-y-6">

                    {/* Header with Timer */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{test?.language} Test</h1>
                            <p className="text-slate-600">Question {currentQuestionIndex + 1} of {questions.length}</p>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                            <Clock className="w-5 h-5" />
                            <span className="font-mono text-lg font-bold">{formatTime(timeRemaining)}</span>
                        </div>
                    </div>

                    {/* Warning */}
                    {timeRemaining < 300 && (
                        <Alert className="border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-700">
                                Less than 5 minutes remaining! The test will auto-submit when time expires.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Question Card */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl">
                                Question {currentQuestion?.number}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-lg text-slate-700">{currentQuestion?.text}</p>

                            {currentQuestion?.type === 'mcq' && currentQuestion.options && (
                                <RadioGroup
                                    value={answers[currentQuestion.id]?.toString()}
                                    onValueChange={(value) => handleAnswerChange(currentQuestion.id, parseInt(value))}
                                >
                                    {currentQuestion.options.map((option, index) => (
                                        <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                            <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                                            <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                                                {option}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}

                            {currentQuestion?.type === 'coding' && (
                                <div className="space-y-2">
                                    <Label>Your Code</Label>
                                    <Textarea
                                        value={answers[currentQuestion.id] || ''}
                                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                        placeholder={currentQuestion.code_template || '// Write your code here'}
                                        className="font-mono min-h-[300px]"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={currentQuestionIndex === 0}
                        >
                            Previous
                        </Button>

                        <div className="flex gap-2">
                            {questions.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentQuestionIndex(index)}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${index === currentQuestionIndex
                                            ? 'bg-blue-600 text-white'
                                            : answers[questions[index].id] !== undefined
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-slate-200 text-slate-600'
                                        }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>

                        {currentQuestionIndex < questions.length - 1 ? (
                            <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                                Next
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Submit Test
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </CandidateLayout>
    )
}

'use client'
import { QuestionCarousel, QUESTIONS } from '@/components/QuestionTemplates'
import { Button } from '@/components/ui/button'
import { isBrowser } from '@/lib/utils'
import dynamic from 'next/dynamic'
import { useEffect } from 'react'

import { useForm } from 'react-hook-form'
import { TokenProgress } from './components/TokenProgress'
import { APPROX_CHARS_PER_TOKEN, MAX_CHARS, MAX_TOKENS } from './constants'

interface BattleFormProps {
  onSubmit: (question: string) => Promise<void>
  loading: boolean
}

interface FormValues {
  question: string
}

const CACHE_KEY = 'BATTLE_QUESTION'
export function BattleForm({ onSubmit, loading }: BattleFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      question: '',
    },
  })

  const question = watch('question')
  const estimatedTokens = Math.ceil(question.length / APPROX_CHARS_PER_TOKEN)

  useEffect(() => {
    const cachedQuestion = localStorage.getItem(CACHE_KEY)
    if (cachedQuestion)
      setValue('question', cachedQuestion)
  }, [setValue])

  useEffect(() => {
    localStorage.setItem(CACHE_KEY, question)
  }, [question])

  const handleQuestionClick = (question: string) => {
    setValue('question', question)
  }

  const onSubmitForm = handleSubmit(async (data) => {
    await onSubmit(data.question)
  })

  return (
    <>
      <form onSubmit={onSubmitForm} className="relative">
        <textarea
          {...register('question', {
            maxLength: {
              value: MAX_CHARS,
              message: 'Question is too long. Please shorten it.',
            },
          })}
          placeholder="Ask a question about the JFK files..."
          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300 min-h-[100px] pr-24 pb-10"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              if (question && !loading && estimatedTokens <= MAX_TOKENS) {
                onSubmitForm()
              }
            }
          }}
        />
        <div className="absolute bottom-3 left-3">
          <TokenProgress estimatedTokens={estimatedTokens} />
        </div>
        <div className="absolute bottom-3 right-3 flex items-end gap-3">
          <div className="text-xs text-zinc-500">
            Shift + Enter for new line
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={!question || loading || estimatedTokens > MAX_TOKENS}
          >
            {loading
              ? (
                  <span className="flex items-center gap-1">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
                    <span>Sending</span>
                  </span>
                )
              : (
                  'Send'
                )}
          </Button>
        </div>
      </form>

      {errors.question && (
        <div className="text-destructive text-sm mt-2">{errors.question.message}</div>
      )}

      <QuestionCarousel onQuestionClick={handleQuestionClick} />
    </>
  )
}

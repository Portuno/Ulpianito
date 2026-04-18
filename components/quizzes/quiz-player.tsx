"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { QuizQuestion } from "@/lib/types/database";
import { submitQuizAttempt } from "@/app/(dashboard)/quizzes/actions";

type QuizPlayerProps = {
  quizId: string;
  questions: QuizQuestion[];
};

export const QuizPlayer = ({ quizId, questions }: QuizPlayerProps) => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const handleSelect = (questionId: string, index: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: index }));
  };

  const handleSubmit = () => {
    setError(null);
    setResult(null);
    if (questions.some((q) => answers[q.id] === undefined)) {
      setError("Respondé todas las preguntas antes de enviar.");
      return;
    }

    startTransition(async () => {
      const payload = questions.map((q) => ({
        questionId: q.id,
        selectedIndex: answers[q.id],
      }));
      const res = await submitQuizAttempt(quizId, payload);
      if (res.error) {
        setError(res.error);
        return;
      }
      setResult("Intento enviado. Si aprobaste, ya sumaste IUS.");
    });
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {result && (
        <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
          {result}
        </div>
      )}
      {questions.map((q, idx) => {
        const options = Array.isArray(q.options) ? q.options : [];
        return (
          <Card key={q.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {idx + 1}. {q.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {options.map((opt, optionIdx) => (
                <button
                  key={`${q.id}-${optionIdx}`}
                  type="button"
                  className={`w-full rounded-md border p-2 text-left text-sm transition ${
                    answers[q.id] === optionIdx
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted"
                  }`}
                  onClick={() => handleSelect(q.id, optionIdx)}
                  aria-label={`Elegir opción ${optionIdx + 1}`}
                >
                  {String(opt)}
                </button>
              ))}
            </CardContent>
          </Card>
        );
      })}
      <Button type="button" onClick={handleSubmit} disabled={isPending}>
        {isPending ? "Enviando…" : "Enviar quiz"}
      </Button>
    </div>
  );
};

"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ExerciseCard } from "./exercise-card";

interface SessionExercise {
  id: number;
  sortOrder: number;
  exercise: { id: number; name: string; muscleGroup: string };
  sets: {
    id: number;
    userId: number;
    setNumber: number;
    reps: number;
    weightKg: number;
    user: { id: number; name: string };
  }[];
}

interface Participant {
  userId: number;
  user: { id: number; name: string };
}

interface ExerciseListProps {
  sessionId: number;
  sessionExercises: SessionExercise[];
  participants: Participant[];
}

export function ExerciseList({
  sessionId,
  sessionExercises,
  participants,
}: ExerciseListProps) {
  const router = useRouter();
  const [exercises, setExercises] = useState(sessionExercises);
  const dragIndex = useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    dragIndex.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === index) return;

    const updated = [...exercises];
    const [moved] = updated.splice(dragIndex.current, 1);
    updated.splice(index, 0, moved);
    dragIndex.current = index;
    setExercises(updated);
  };

  const handleDrop = async () => {
    const orders = exercises.map((ex, i) => ({ id: ex.id, sortOrder: i }));
    dragIndex.current = null;

    await fetch(`/api/sessions/${sessionId}/exercises`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orders }),
    });

    router.refresh();
  };

  return (
    <div className="space-y-4">
      {exercises.map((se, index) => (
        <div
          key={se.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={handleDrop}
          className="cursor-grab active:cursor-grabbing"
        >
          <ExerciseCard
            sessionId={sessionId}
            sessionExercise={se}
            participants={participants}
          />
        </div>
      ))}
    </div>
  );
}

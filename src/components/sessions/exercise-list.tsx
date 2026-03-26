"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ExerciseCard } from "./exercise-card";

interface SessionExercise {
  id: number;
  sortOrder: number;
  exercise: { id: number; name: string; muscleGroup: string; imageUrl: string | null };
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

function SortableExercise({
  sessionId,
  sessionExercise,
  participants,
  onDelete,
}: {
  sessionId: number;
  sessionExercise: SessionExercise;
  participants: Participant[];
  onDelete: (id: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sessionExercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
      <ExerciseCard
        sessionId={sessionId}
        sessionExercise={sessionExercise}
        participants={participants}
        onDelete={onDelete}
      />
    </div>
  );
}

export function ExerciseList({
  sessionId,
  sessionExercises,
  participants,
}: ExerciseListProps) {
  const router = useRouter();
  const [exercises, setExercises] = useState(sessionExercises);

  const handleDelete = (id: number) => {
    setExercises((prev) => prev.filter((e) => e.id !== id));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = exercises.findIndex((e) => e.id === active.id);
    const newIndex = exercises.findIndex((e) => e.id === over.id);
    const updated = arrayMove(exercises, oldIndex, newIndex);
    setExercises(updated);

    const orders = updated.map((ex, i) => ({ id: ex.id, sortOrder: i }));

    await fetch(`/api/sessions/${sessionId}/exercises`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orders }),
    });

    router.refresh();
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={exercises.map((e) => e.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {exercises.map((se) => (
            <SortableExercise
              key={se.id}
              sessionId={sessionId}
              sessionExercise={se}
              participants={participants}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

import { useCallback, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { PipelineColumn } from './PipelineColumn';
import { DealCard } from './DealCard';
import { useUpdateDealStage } from '../hooks/useDealMutations';
import type { Deal } from '../api/pipeline.api';
import type { DealStage } from '@ai-crm/shared';

interface PipelineBoardProps {
  deals: Deal[];
  onDealClick?: (deal: Deal) => void;
}

const STAGES: DealStage[] = [
  'discovery',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
];

export function PipelineBoard({ deals, onDealClick }: PipelineBoardProps) {
  const { t } = useTranslation('pipeline');
  const queryClient = useQueryClient();
  const updateStage = useUpdateDealStage();
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const dealsByStage = STAGES.reduce(
    (acc, stage) => {
      acc[stage] = deals.filter((d) => d.stage === stage);
      return acc;
    },
    {} as Record<DealStage, Deal[]>,
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const deal = deals.find((d) => d._id === event.active.id);
      setActiveDeal(deal ?? null);
    },
    [deals],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDeal(null);
      const { active, over } = event;
      if (!over) return;

      const dealId = active.id as string;
      const deal = deals.find((d) => d._id === dealId);
      if (!deal) return;

      const targetStage = STAGES.includes(over.id as DealStage)
        ? (over.id as DealStage)
        : deals.find((d) => d._id === over.id)?.stage;

      if (!targetStage || targetStage === deal.stage) return;

      // Optimistic update
      queryClient.setQueryData<{ items: Deal[] }>(
        ['deals', undefined],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((d) =>
              d._id === dealId ? { ...d, stage: targetStage } : d,
            ),
          };
        },
      );

      updateStage.mutate(
        { id: dealId, data: { stage: targetStage } },
        {
          onError: () => {
            queryClient.invalidateQueries({ queryKey: ['deals'] });
            alert(t('messages.stageUpdateFailed'));
          },
        },
      );
    },
    [deals, queryClient, updateStage, t],
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <PipelineColumn
            key={stage}
            stage={stage}
            deals={dealsByStage[stage]}
            onDealClick={onDealClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeDeal ? (
          <div className="w-[280px]">
            <DealCard deal={activeDeal} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

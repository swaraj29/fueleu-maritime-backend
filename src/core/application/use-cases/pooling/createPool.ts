import { PoolMember } from "@core/domain/entities/Pool";
import {
  validatePoolSum,
  validatePostPoolingState
} from "@core/domain/services/validatePoolRules";
import { PoolRepository } from "@core/ports/PoolRepository";

export const createPool = async (
  members: PoolMember[],
  poolRepo: PoolRepository
) => {

  validatePoolSum(members);

  const sorted = [...members].sort(
    (a, b) => b.cbBefore - a.cbBefore
  );

  let i = 0;
  let j = sorted.length - 1;

  while (i < j) {
    const surplus = sorted[i];
    const deficit = sorted[j];

    if (surplus.cbBefore <= 0) break;
    if (deficit.cbBefore >= 0) break;

    const transfer = Math.min(
      surplus.cbBefore,
      Math.abs(deficit.cbBefore)
    );

    surplus.cbAfter = surplus.cbBefore - transfer;
    deficit.cbAfter = deficit.cbBefore + transfer;

    validatePostPoolingState(surplus);
    validatePostPoolingState(deficit);

    // Move pointers after processing
    // If surplus is depleted or negative, move to next surplus
    if (surplus.cbAfter <= 0) i++;
    // If deficit is satisfied or positive, move to next deficit
    if (deficit.cbAfter >= 0) j--;
  }

  await poolRepo.save(sorted);

  return sorted;
};
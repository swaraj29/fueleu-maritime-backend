import { PoolMember } from "@core/domain/entities/Pool";

export const validatePoolSum = (
  members: PoolMember[]
): number => {

  const total = members.reduce(
    (sum, member) => sum + member.cbBefore,
    0
  );

  if (total < 0) {
    throw new Error("Pool total CB must be >= 0");
  }

  return total;
};

export const validatePostPoolingState = (
  member: PoolMember
): void => {

  // cbAfter must be defined for validation
  if (member.cbAfter === undefined) {
    throw new Error(`Member ${member.shipId} does not have cbAfter calculated`);
  }

  // Deficit ship cannot exit worse
  if (member.cbBefore < 0 && member.cbAfter < member.cbBefore) {
    throw new Error(
      `Deficit ship ${member.shipId} cannot exit worse after pooling`
    );
  }

  // Surplus ship cannot become negative
  if (member.cbBefore > 0 && member.cbAfter < 0) {
    throw new Error(
      `Surplus ship ${member.shipId} cannot become negative`
    );
  }
};
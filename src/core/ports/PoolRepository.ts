import { PoolMember } from "@core/domain/entities/Pool";

export interface PoolRepository {
  save(members: PoolMember[]): Promise<void>;
}
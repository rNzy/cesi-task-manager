import { TaskTypeormEntity } from '../tasks.entity';
import { CreateTaskDto } from '../dto/create-task.dto';

/**
 * Contrat d'abstraction du repository.
 * Le service applicatif dépend de cette interface, pas de TypeORM.
 *
 * Avantages :
 * - Testabilité : on peut injecter un InMemoryTaskRepository en test
 * - Découplage : changer d'ORM ne touche pas la logique métier
 * - Lisibilité : le contrat est explicite et documenté
 */
export interface ITaskRepository {
  findAll(): Promise<TaskTypeormEntity[]>;
  findById(id: string): Promise<TaskTypeormEntity | null>;
  create(dto: CreateTaskDto): Promise<TaskTypeormEntity>;
  updateStatus(id: string, done: boolean): Promise<TaskTypeormEntity>;
  delete(id: string): Promise<void>;
}

export const TASK_REPOSITORY = 'TASK_REPOSITORY';

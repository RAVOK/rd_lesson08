import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum FileStatus {
  PENDING = 'PENDING',
  READY = 'READY',
}

export enum FileVisibility {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
}

@Entity({ name: 's_file_record', schema: 'site' })
@Index(['ownerId', 'entityId'])
@Index(['key'])
export class FileRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'owner_id', type: 'int', nullable: false })
  ownerId: number;

  @Column({ name: 'entity_id', type: 'int', nullable: true })
  entityId: number;

  @Column({ type: 'varchar', length: 500, nullable: false })
  key: string;

  @Column({ name: 'content_type', type: 'varchar', length: 255, nullable: false })
  contentType: string;

  @Column({ type: 'bigint', nullable: false })
  size: number;

  @Column({
    type: 'enum',
    enum: FileStatus,
    enumName: 'file_status',
    default: FileStatus.PENDING,
  })
  status: FileStatus;

  @Column({
    type: 'enum',
    enum: FileVisibility,
    enumName: 'file_visibility',
    default: FileVisibility.PRIVATE,
  })
  visibility: FileVisibility;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
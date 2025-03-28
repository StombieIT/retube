import {
    Entity, PrimaryGeneratedColumn, Column,
    OneToMany, ManyToOne,
    OneToOne, JoinColumn
} from 'typeorm';
import { FlowStatus, VideoStatus } from './enums';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    email!: string;

    @Column({ name: 'password_hash' })
    passwordHash!: string;

    @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;
}

@Entity({ name: 'upload_sessions' })
export class UploadSession {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column('int', { name: 'total_bytes' })
    totalBytes!: number;

    @Column('int', { name: 'uploaded_bytes', default: 0 })
    uploadedBytes!: number;

    @OneToOne(() => Flow, (flow) => flow.uploadSession, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'flow_id' })
    flow!: Flow;
}

@Entity({ name: 'flows' })
export class Flow {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        type: 'varchar',
        enum: FlowStatus,
        default: FlowStatus.CREATED,
    })
    status!: FlowStatus;

    @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

    @Column({ name: 'uploaded_at', type: 'timestamptz', nullable: true })
    uploadedAt?: Date;

    @ManyToOne(() => Video, (video) => video.flows, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'video_id' })
    video!: Video;

    @OneToOne(() => UploadSession, (uploadSession) => uploadSession.flow, { cascade: true })
    uploadSession!: UploadSession;
}

@Entity({ name: 'videos' })
export class Video {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ length: 255 })
    title!: string;

    @Column('text')
    description!: string;

    @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

    @Column({ name: 'uploaded_at', type: 'timestamptz', nullable: true })
    uploadedAt?: Date;

    @Column({
        type: 'varchar',
        enum: VideoStatus,
        default: VideoStatus.CREATED,
    })
    status!: VideoStatus;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @OneToMany(() => Flow, (flow) => flow.video)
    flows!: Flow[];
}

import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("bikes")
export class Bike {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    code: string;

    @Column()
    type: string;

    @Column()
    maintenance: boolean;

    @Column()
    station: number;

    @Column()
    locked: boolean;

    @Column()
    paused: boolean;
}
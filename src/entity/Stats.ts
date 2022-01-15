import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("statistics")
export class Stats {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    key: string;

    @Column()
    amount: number;

}
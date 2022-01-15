import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("stations")
export class Station {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    location: string;

}
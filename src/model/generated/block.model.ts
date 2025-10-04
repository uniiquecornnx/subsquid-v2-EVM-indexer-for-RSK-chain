import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, IntColumn as IntColumn_, Index as Index_, DateTimeColumn as DateTimeColumn_, OneToMany as OneToMany_} from "@subsquid/typeorm-store"
import {Transaction} from "./transaction.model"
import {Transfer} from "./transfer.model"

@Entity_()
export class Block {
    constructor(props?: Partial<Block>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @IntColumn_({nullable: false})
    height!: number

    @DateTimeColumn_({nullable: false})
    timestamp!: Date

    @OneToMany_(() => Transaction, e => e.block)
    transactions!: Transaction[]

    @OneToMany_(() => Transfer, e => e.block)
    transfers!: Transfer[]
}

import * as borsh from "borsh"

export class counterAccountt {
    count = 0;

    constructor({count}: {count: number}){
        this.count = count
    }
}

export const schema = {struct: {count: 'u32'}};

export const GREETING_SIZE = borsh.serialize(
    schema,
    new counterAccountt({count: 0})
).length
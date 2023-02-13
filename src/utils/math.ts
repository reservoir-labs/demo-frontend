import JSBI from "jsbi";

// accurate to 1 basis point
export const calculateSlippageAmount = (value: JSBI, slippage: number): [JSBI, JSBI] => {
    if (slippage < 0 || slippage > 10000) {
        throw Error(`Unexpected slippage value: ${slippage}`)
    }
    return [
        JSBI.divide(JSBI.multiply(value, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000)),
        JSBI.divide(JSBI.multiply(value, JSBI.BigInt(10000 + slippage)), JSBI.BigInt(10000))
    ]
}

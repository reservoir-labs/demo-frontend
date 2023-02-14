import {
    Badge,
    Box, Divider,
    Heading, MenuDivider, NumberInput,
    NumberInputField, Radio, RadioGroup,
    Select, Spacer, Stat, StatGroup, StatLabel, StatNumber, useControllableState, Text, Button
} from "@chakra-ui/react";
import {Fetcher, Pair, Route} from "@reservoir-labs/sdk";
import {useEffect} from "react";
import {useAccount, useContractWrite, usePrepareContractWrite, useProvider} from "wagmi";
import {CurrencyAmount, Token} from "@reservoir-labs/sdk-core";
import {CHAINID, ROUTER_ADDRESS, ROUTER_INTERFACE, TOKEN_ADDRESS} from "../../../constants";
import {parseUnits} from "@ethersproject/units";
import {calculateSlippageAmount} from "../../../utils/math";
import JSBI from "jsbi";

export const AddLiq = () => {
    // wallet, provider, smart contract state
    const provider = useProvider()
    const { address: connectedAddress } = useAccount()
    const [funcName, setFuncName] = useControllableState({defaultValue: null})
    const [args, setArgs] = useControllableState({defaultValue: null})
    const { config, error } = usePrepareContractWrite({
        address: ROUTER_ADDRESS,
        abi: ROUTER_INTERFACE,
        functionName: funcName,
        args: args,
        enabled: (funcName != null && args != null)
    })
    const { write } = useContractWrite(config)

    // page state
    const [tokenA, setTokenA] = useControllableState({defaultValue: null})
    const [tokenB, setTokenB] = useControllableState({defaultValue: null})
    const [tokenAAmt, setTokenAAmt] = useControllableState({defaultValue: ''})
    const [tokenBAmt, setTokenBAmt] = useControllableState({defaultValue: ''})
    const [tokenAAsQuote, setTokenAAsQuote] = useControllableState({defaultValue: false})
    const [curveId, setCurveId] = useControllableState({defaultValue: null})
    const [pairExists, setPairExists] = useControllableState({defaultValue: false})

    const [pairTokenAReserves, setPairTokenAReserves] = useControllableState({defaultValue: null})
    const [pairTokenBReserves, setPairTokenBReserves] = useControllableState({defaultValue: null})

    const handleTokenAChange = async (event) => {
        const token = await Fetcher.fetchTokenData(CHAINID, TOKEN_ADDRESS[CHAINID][event.target.value], provider, event.target.value, event.target.value)
        setTokenA(token)
    }

    const handleTokenBChange = async (event) => {
        const token = await Fetcher.fetchTokenData(CHAINID, TOKEN_ADDRESS[CHAINID][event.target.value], provider, event.target.value, event.target.value)
        setTokenB(token)
    }

    const handleCurveChange = (event) => {
        setCurveId(parseInt(event))
    }

    const calcAddLiqAmounts = async () => {
        if (tokenA === null || tokenB === null || curveId === null) {
            return
        }
        // this should not ever be allowed to happen on the UI
        if (tokenA.equals(tokenB)) {
            return
        }
        if (tokenAAmt === '' && tokenAAsQuote || tokenBAmt === '' && !tokenAAsQuote) {
            return
        }

        let pair: Pair | null
        try {
            pair = await Fetcher.fetchPairData(tokenA, tokenB, curveId, provider)
        } catch {
            pair = null
        }

        if (pair != null) {
            setPairExists(true)
            setPairTokenAReserves(pair.reserveOf(tokenA).toSignificant(6))
            setPairTokenBReserves(pair.reserveOf(tokenB).toSignificant(6))

            if (tokenAAsQuote) {
                // unsure if this is the best way or we can just use pair.token0/1Price()
                const route: Route<Token, Token> = new Route([pair], tokenA, tokenB)
                const midPrice = route.midPrice

                const correspondingAmount = midPrice.quote(CurrencyAmount.fromRawAmount(tokenA, parseUnits(tokenAAmt, tokenA.decimals).toString()))
                setTokenBAmt(correspondingAmount.toSignificant(6))
            }
            else {
                const route: Route<Token, Token> = new Route([pair], tokenB, tokenA)
                const midPrice = route.midPrice

                const correspondingAmount = midPrice.quote(CurrencyAmount.fromRawAmount(tokenB, parseUnits(tokenBAmt, tokenB.decimals).toString()))
                setTokenAAmt(correspondingAmount.toSignificant(6))
            }

            if (tokenAAmt !== '' && tokenBAmt !== '') {
                const tokenARawAmt = parseUnits(tokenAAmt, tokenA.decimals).toString()
                const tokenBRawAmt = parseUnits(tokenBAmt, tokenB.decimals).toString()

                const tokenASlippageAmt = calculateSlippageAmount(JSBI.BigInt(tokenARawAmt), 100)  // 1%
                const tokenBSlippageAmt = calculateSlippageAmount(JSBI.BigInt(tokenBRawAmt), 100)
                console.log("slippage amt", tokenBSlippageAmt)

                setFuncName('addLiquidity')
                setArgs([
                    tokenA.address,
                    tokenB.address,
                    curveId,
                    tokenARawAmt,
                    tokenBRawAmt,
                    tokenASlippageAmt[0].toString(),
                    tokenBSlippageAmt[0].toString(),
                    connectedAddress
                ])
            }
        }
        else {
            setPairExists(false)
        }
    }

    const doAddLiquidity = () => {
        if (funcName === null || args == null || write == null) {
            return
        }

        console.log("funcname", funcName)
        console.log("args", args)

        // write()
    }

    useEffect(() => {
        calcAddLiqAmounts()
    }, [tokenA, tokenB, tokenAAmt, tokenBAmt, curveId])

    return (
    <>
    <Heading size="lg" marginBottom={6}>
        Add Liquidity
    </Heading>

    <Box>
        <Badge> First Token </Badge>
        <Select placeholder='select first token' id={'firstToken'} onChange={handleTokenAChange}>
            <option value={'USDC'}>USDC</option>
            <option value={'USDT'}>USDT</option>
            <option value={'WAVAX'}>WAVAX</option>
        </Select>

        <NumberInput value={tokenAAmt} onChange={(value) => {setTokenAAmt(value); setTokenAAsQuote(true) }}>
            <NumberInputField placeholder={'Amount'} />
        </NumberInput>

        <Badge> Second token </Badge>
        <Select placeholder={'select second token'} id={'secondToken'} onChange={handleTokenBChange}>
            <option value={'USDC'}>USDC</option>
            <option value={'USDT'}>USDT</option>
            <option value={'WAVAX'}>WAVAX</option>
        </Select>
        <NumberInput value={tokenBAmt} onChange={(value) => {setTokenBAmt(value); setTokenAAsQuote(false)} }>
            <NumberInputField placeholder={'Amount'} />
        </NumberInput>

        <Badge> Curve Type </Badge>
        <RadioGroup onChange={handleCurveChange}>
            <Radio value='0'>Constant Product</Radio>
            <Radio value='1'>Stable </Radio>
        </RadioGroup>

        <Spacer height={'10px'}></Spacer>

        <Text> { pairExists ? "You will receive XXX amount of LP tokens" : "This pair does not exist yet. You're the first to add liq for this pair" } </Text>

        <Button isLoading={false} onClick={doAddLiquidity} size='lg'>Add Liquidity</Button>
    </Box>

    <Spacer height={'50px'}></Spacer>

    <Box>
        <Heading>
            Pool Info
        </Heading>

        <StatGroup>
        <Stat>
            <StatLabel>Amount of {tokenA ? tokenA.symbol : ''} in pair</StatLabel>
            <StatNumber>{pairTokenAReserves}</StatNumber>
        </Stat>

        <Stat>
            <StatLabel>Amount of {tokenB ? tokenB.symbol : ''} in pair</StatLabel>
            <StatNumber>{pairTokenBReserves}</StatNumber>
        </Stat>
        </StatGroup>
    </Box>
    </>
    )
}

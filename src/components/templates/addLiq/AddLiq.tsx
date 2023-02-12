import {
    Badge,
    Box, Divider,
    Heading, MenuDivider, NumberInput,
    NumberInputField, Radio, RadioGroup,
    Select, Spacer, Stat, StatGroup, StatLabel, StatNumber, useControllableState, Text
} from "@chakra-ui/react";
import {Fetcher, Pair, Route} from "@reservoir-labs/sdk";
import {useEffect} from "react";
import {useProvider} from "wagmi";
import {CurrencyAmount, Token} from "@reservoir-labs/sdk-core";
import {CHAINID, TOKEN_ADDRESS} from "../../../constants";


export const AddLiq = () => {
    const provider = useProvider()

    const [tokenA, setTokenA] = useControllableState({defaultValue: null})
    const [tokenB, setTokenB] = useControllableState({defaultValue: null})
    const [tokenAAmt, setTokenAAmt] = useControllableState({defaultValue: null})
    const [tokenBAmt, setTokenBAmt] = useControllableState({defaultValue: null})
    const [curveId, setCurveId] = useControllableState({defaultValue: null})
    const [pairExists, setPairExists] = useControllableState({defaultValue: false})

    const [pairTokenAReserves, setPairTokenAReserves] = useControllableState({defaultValue: null})
    const [pairTokenBReserves, setPairTokenBReserves] = useControllableState({defaultValue: null})

    const handleTokenAChange = async (event) => {
        const token = await Fetcher.fetchTokenData(CHAINID, TOKEN_ADDRESS[CHAINID][event.target.value], provider, event.target.value, event.target.value)
        console.log("token ist", token)
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
        if (tokenA == null || tokenB == null || curveId == null) {
            return
        }
        if (tokenAAmt == null) {
            return
        }

        let pair: Pair
        try {
            pair = await Fetcher.fetchPairData(tokenA, tokenB, curveId, provider)
        } catch {
            console.log()
            pair = new Pair(CurrencyAmount.fromRawAmount(tokenA, 0), CurrencyAmount.fromRawAmount(tokenB, 0), curveId)
        }

        console.log("pair is", pair)

        // do we need to instantiate a route??
        const route: Route<Token, Token> = new Route([pair], tokenA, tokenB)

        console.log("midprice", route.midPrice.toSignificant(6))

        const pairExists = pair != null

        if (pair != null) {
            // setTokenBAmt()
            setPairExists(true)

            setPairTokenAReserves(pair.reserveOf(tokenA).toSignificant(6))
            setPairTokenBReserves(pair.reserveOf(tokenB).toSignificant(6))

        }
        else {
            setPairExists(false)
        }

        console.log("exists", pairExists)


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

        <NumberInput >
            <NumberInputField placeholder={'Amount'} value={tokenAAmt} onChange={setTokenAAmt}></NumberInputField>
        </NumberInput>

        <Badge> Second token </Badge>
        <Select placeholder={'select second token'} id={'secondToken'} onChange={handleTokenBChange}>
            <option value={'USDC'}>USDC</option>
            <option value={'USDT'}>USDT</option>
            <option value={'WAVAX'}>WAVAX</option>
        </Select>
        <NumberInput>
            <NumberInputField placeholder={'Amount'} value={tokenBAmt} onChange={setTokenBAmt}></NumberInputField>
        </NumberInput>

        <Badge> Curve Type </Badge>
        <RadioGroup onChange={handleCurveChange}>
            <Radio value='0'>Constant Product</Radio>
            <Radio value='1'>Stable </Radio>
        </RadioGroup>

        <Spacer height={'10px'}></Spacer>

        <Text> { pairExists ? "You will receive XXX amount of LP tokens" : "This pair does not exist yet. You're the first to add liq for this pair" } </Text>

    </Box>

    <Spacer height={'50px'}></Spacer>

    <Box>
        <Heading>
            DEBUG - Pool Info
        </Heading>

        <StatGroup>
        <Stat>
            <StatLabel>Amount of {tokenA?.symbol} in pair</StatLabel>
            <StatNumber>{pairTokenAReserves}</StatNumber>
        </Stat>

        <Stat>
            <StatLabel>Amount of {tokenB?.symbol} in pair</StatLabel>
            <StatNumber>{pairTokenBReserves}</StatNumber>
        </Stat>
        </StatGroup>
    </Box>
    </>
    )
}

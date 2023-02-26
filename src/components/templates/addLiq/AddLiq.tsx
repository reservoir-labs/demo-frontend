import {
    Badge,
    Box,
    Heading, NumberInput,
    NumberInputField, Radio, RadioGroup,
    Select, Spacer, Stat, StatGroup, StatLabel, StatNumber, useControllableState, Text, Button
} from "@chakra-ui/react";
import {Fetcher, Pair, Route} from "@reservoir-labs/sdk";
import {useEffect} from "react";
import {
    erc20ABI,
    useAccount,
    useBalance,
    useContractRead,
    useContractWrite,
    usePrepareContractWrite,
    useProvider
} from "wagmi";
import {CurrencyAmount, Token} from "@reservoir-labs/sdk-core";
import {CHAINID, ROUTER_ADDRESS, ROUTER_INTERFACE, TOKEN_ADDRESS} from "../../../constants";
import {parseUnits} from "@ethersproject/units";
import {calculateSlippageAmount} from "utils/math";
import JSBI from "jsbi";

export const AddLiq = () => {
    // wallet, provider, smart contract state
    const provider = useProvider()
    const { address: connectedAddress } = useAccount()
    const [funcName, setFuncName] = useControllableState({defaultValue: null})
    const [args, setArgs] = useControllableState({defaultValue: null})
    const { config, error, status } = usePrepareContractWrite({
        address: ROUTER_ADDRESS,
        abi: ROUTER_INTERFACE,
        functionName: funcName,
        args: args,
        // enabled: (funcName != null && args != null)
    })
    const { write } = useContractWrite(config)

    // page state
    const [tokenA, setTokenA] = useControllableState({defaultValue: null})
    const [tokenB, setTokenB] = useControllableState({defaultValue: null})
    const [tokenAAmt, setTokenAAmt] = useControllableState({defaultValue: ''})
    const [tokenBAmt, setTokenBAmt] = useControllableState({defaultValue: ''})
    const [tokenAAsQuote, setTokenAAsQuote] = useControllableState({defaultValue: false})
    const [curveId, setCurveId] = useControllableState({defaultValue: null})
    const [currentPair, setCurrentPair] = useControllableState({defaultValue: null})

    const [pairTokenAReserves, setPairTokenAReserves] = useControllableState({defaultValue: null})
    const [pairTokenBReserves, setPairTokenBReserves] = useControllableState({defaultValue: null})

    const [expectedLpTokenAmt, setExpectedLpTokenAmt] = useControllableState({defaultValue: null})
    const { data: userLpTokenBalance } = useBalance({
        token: currentPair?.liquidityToken.address,
        address: connectedAddress,
        enabled: (connectedAddress != null && currentPair != null),
        watch: true
    })
    const { data : lpTotalSupplyData } = useContractRead({
        address: currentPair?.liquidityToken.address,
        abi: erc20ABI,
        functionName: 'totalSupply',
        enabled: currentPair != null
    })

    const handleTokenAChange = async (event) => {
        const token = await Fetcher.fetchTokenData(CHAINID, TOKEN_ADDRESS[CHAINID][event.target.value], provider, event.target.value, event.target.value)
        setTokenA(token)
    }

    const handleTokenBChange = async (event) => {
        const token = await Fetcher.fetchTokenData(CHAINID, TOKEN_ADDRESS[CHAINID][event.target.value], provider, event.target.value, event.target.value)
        setTokenB(token)
    }

    const tokenAAmtChanged = (value) => {
        setTokenAAmt(value)
        setTokenAAsQuote(true)
    }

    const tokenBAmtChanged = (value) => {
        setTokenBAmt(value)
        setTokenAAsQuote(false)
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
            setCurrentPair(pair)
        } catch {
            pair = null
        }

        if (currentPair != null && lpTotalSupplyData != null) {
            setPairTokenAReserves(currentPair.reserveOf(tokenA).toSignificant(6))
            setPairTokenBReserves(currentPair.reserveOf(tokenB).toSignificant(6))

            const lpTotalSupply = CurrencyAmount.fromRawAmount(currentPair.liquidityToken, lpTotalSupplyData)

            if (tokenAAsQuote) {
                // unsure if this is the best way or we can just use pair.token0/1Price()
                const route: Route<Token, Token> = new Route([pair], tokenA, tokenB)
                const midPrice = route.midPrice

                const tokenAQuoteAmt = CurrencyAmount.fromRawAmount(tokenA, parseUnits(tokenAAmt, tokenA.decimals).toString())
                const correspondingAmount = midPrice.quote(tokenAQuoteAmt)
                setTokenBAmt(correspondingAmount.toSignificant(6))

                const mintedAmt = currentPair.getLiquidityMinted(lpTotalSupply, tokenAQuoteAmt, correspondingAmount)
                setExpectedLpTokenAmt(mintedAmt.toExact())
            }
            else {
                const route: Route<Token, Token> = new Route([currentPair], tokenB, tokenA)
                const midPrice = route.midPrice

                const tokenBQuoteAmt = CurrencyAmount.fromRawAmount(tokenB, parseUnits(tokenBAmt, tokenB.decimals).toString())
                const correspondingAmount = midPrice.quote(tokenBQuoteAmt)
                setTokenAAmt(correspondingAmount.toSignificant(6))

                const mintedAmt = currentPair.getLiquidityMinted(lpTotalSupply, correspondingAmount, tokenBQuoteAmt)
                setExpectedLpTokenAmt(mintedAmt.toExact())
            }

            if (tokenAAmt !== '' && tokenBAmt !== '') {
                const tokenARawAmt = parseUnits(tokenAAmt, tokenA.decimals).toString()
                const tokenBRawAmt = parseUnits(tokenBAmt, tokenB.decimals).toString()

                const tokenASlippageAmt = calculateSlippageAmount(JSBI.BigInt(tokenARawAmt), 100)  // 1%
                const tokenBSlippageAmt = calculateSlippageAmount(JSBI.BigInt(tokenBRawAmt), 100)

                console.log(tokenARawAmt)
                console.log(tokenBRawAmt)

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
            setCurrentPair(null)
        }
    }

    const doAddLiquidity = () => {
        if (funcName === null || args == null || write == null) {
            return
        }

        write()
    }

    useEffect(() => {
        calcAddLiqAmounts()
    }, [tokenA, tokenB, tokenAAmt, tokenBAmt, curveId, lpTotalSupplyData])

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

        <NumberInput value={tokenAAmt} onChange={tokenAAmtChanged}>
            <NumberInputField placeholder={'Amount'} />
        </NumberInput>

        <Badge> Second token </Badge>
        <Select placeholder={'select second token'} id={'secondToken'} onChange={handleTokenBChange}>
            <option value={'USDC'}>USDC</option>
            <option value={'USDT'}>USDT</option>
            <option value={'WAVAX'}>WAVAX</option>
        </Select>
        <NumberInput value={tokenBAmt} onChange={ tokenBAmtChanged }>
            <NumberInputField placeholder={'Amount'} />
        </NumberInput>

        <Badge> Curve Type </Badge>
        <RadioGroup onChange={handleCurveChange}>
            <Radio value='0'>Constant Product</Radio>
            <Radio value='1'>Stable </Radio>
        </RadioGroup>

        <Spacer height={'10px'}></Spacer>

        <Text> { currentPair ? `You currently have ${userLpTokenBalance ? userLpTokenBalance.formatted : '0'} LP tokens` : "" } </Text>
        <Text> { currentPair ? `You will receive ${expectedLpTokenAmt ? expectedLpTokenAmt : '-'} LP tokens` : "This pair does not exist yet. You're the first to add liq for this pair" } </Text>

        <Text maxWidth={'100%'}>On chain simulation error returns { error ? error.message : '' } </Text>
        <Text maxWidth={'100%'}>On chain simulation status { status ? status : '' } </Text>

        <Button isLoading={false} onClick={doAddLiquidity} size='lg' colorScheme='green'>Add Liquidity</Button>
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

import {
    Badge,
    Box,
    Heading, NumberInput,
    NumberInputField, Radio, RadioGroup,
    Select, Spacer, Stat, StatGroup, StatLabel, StatNumber, useControllableState, Text, Button
} from "@chakra-ui/react";
import {Fetcher, Pair, Route, Router, MethodParameters} from "@reservoir-labs/sdk";
import {useEffect} from "react";
import {
    erc20ABI,
    useAccount,
    useBalance,
    useContractRead,
    useSendTransaction,
    usePrepareSendTransaction,
    useProvider
} from "wagmi";
import {CurrencyAmount, Ether, Token} from "@reservoir-labs/sdk-core";
import {CHAINID, ROUTER_ADDRESS, SLIPPAGE, TOKEN_ADDRESS} from "../../../constants";
import {parseUnits} from "@ethersproject/units";
import {AddressZero} from "@ethersproject/constants";

export const AddLiq = () => {
    // wallet, provider, smart contract state
    const provider = useProvider()
    const { address: connectedAddress } = useAccount()
    const [calldata, setCalldata] = useControllableState({defaultValue: null})
    const [value, setValue] = useControllableState({defaultValue: null})
    const { config, error, status } = usePrepareSendTransaction({
        request: {
            to: ROUTER_ADDRESS,
            value: value,
            data: calldata
        },
        enabled: calldata != null
    })
    const { sendTransaction } = useSendTransaction(config)

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
        const tokenAddress = TOKEN_ADDRESS[CHAINID][event.target.value]
        if (tokenAddress === AddressZero) {
            // token is native token
            setTokenA(Ether.onChain(CHAINID))
        } else {
            const token = await Fetcher.fetchTokenData(CHAINID, tokenAddress, provider, event.target.value, event.target.value)
            setTokenA(token)
        }
    }

    const handleTokenBChange = async (event) => {
        const tokenAddress = TOKEN_ADDRESS[CHAINID][event.target.value]
        if (tokenAddress === AddressZero) {
            setTokenB(Ether.onChain(CHAINID))
        } else {
            const token = await Fetcher.fetchTokenData(CHAINID, TOKEN_ADDRESS[CHAINID][event.target.value], provider, event.target.value, event.target.value)
            setTokenB(token)
        }
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
            pair = await Fetcher.fetchPairData(tokenA.wrapped, tokenB.wrapped, curveId, provider)
            setCurrentPair(pair)
        } catch {
            pair = null
        }

        if (currentPair != null && lpTotalSupplyData != null) {
            setPairTokenAReserves(currentPair.reserveOf(tokenA.wrapped).toSignificant(6))
            setPairTokenBReserves(currentPair.reserveOf(tokenB.wrapped).toSignificant(6))

            const lpTotalSupply = CurrencyAmount.fromRawAmount(currentPair.liquidityToken, lpTotalSupplyData)

            if (tokenAAsQuote) {
                // unsure if this is the best way or we can just use pair.token0/1Price()
                const route: Route<Token, Token> = new Route([pair], tokenA.wrapped, tokenB.wrapped)
                const midPrice = route.midPrice

                const tokenAQuoteAmt = CurrencyAmount.fromRawAmount(tokenA.wrapped, parseUnits(tokenAAmt, tokenA.decimals).toString())
                const correspondingAmount = midPrice.quote(tokenAQuoteAmt)
                setTokenBAmt(correspondingAmount.toSignificant(6))

                const mintedAmt = currentPair.getLiquidityMinted(lpTotalSupply, tokenAQuoteAmt, correspondingAmount)
                setExpectedLpTokenAmt(mintedAmt.toExact())
            }
            else {
                const route: Route<Token, Token> = new Route([currentPair], tokenB.wrapped, tokenA.wrapped)
                const midPrice = route.midPrice

                const tokenBQuoteAmt = CurrencyAmount.fromRawAmount(tokenB.wrapped, parseUnits(tokenBAmt, tokenB.decimals).toString())
                const correspondingAmount = midPrice.quote(tokenBQuoteAmt)
                setTokenAAmt(correspondingAmount.toSignificant(6))

                const mintedAmt = currentPair.getLiquidityMinted(lpTotalSupply, correspondingAmount, tokenBQuoteAmt)
                setExpectedLpTokenAmt(mintedAmt.toExact())
            }

            // should we move this out?
            if (tokenAAmt !== '' && tokenBAmt !== '') {
                const tokenAAmtIn = CurrencyAmount.fromRawAmount(tokenA, parseUnits(tokenAAmt, tokenA.decimals).toString())
                const tokenBAmtIn = CurrencyAmount.fromRawAmount(tokenB, parseUnits(tokenBAmt, tokenB.decimals).toString())

                const parameters: MethodParameters = Router.addLiquidityParameters(tokenAAmtIn, tokenBAmtIn, curveId, { allowedSlippage: SLIPPAGE, recipient: connectedAddress })
                setCalldata(parameters.calldata)
                setValue(parameters.value)
            }
        }
        // creating a new pair
        else {
            let amountA, amountB
            if (tokenAAmt !== '') {
                amountA = CurrencyAmount.fromRawAmount(tokenA, parseUnits(tokenAAmt, tokenA.decimals).toString())
            }
            if (tokenBAmt !== '') {
                amountB = CurrencyAmount.fromRawAmount(tokenB, parseUnits(tokenBAmt, tokenB.decimals).toString())
            }

            // N.B slippage also matters during the creation of a pair to guard
            // against someone frontrunning your adding liq operation
            const parameters: MethodParameters = Router.addLiquidityParameters(amountA, amountB, curveId, { allowedSlippage: SLIPPAGE, recipient: connectedAddress })

            setCalldata(parameters.calldata)
            setValue(parameters.value)

            setCurrentPair(null)
        }
    }

    const doAddLiquidity = () => {
        if (calldata === null || sendTransaction == null) {
            return
        }

        sendTransaction()
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
            <option value={'AVAX'}>AVAX</option>
        </Select>

        <NumberInput value={tokenAAmt} onChange={tokenAAmtChanged}>
            <NumberInputField placeholder={'Amount'} />
        </NumberInput>

        <Badge> Second token </Badge>
        <Select placeholder={'select second token'} id={'secondToken'} onChange={handleTokenBChange}>
            <option value={'USDC'}>USDC</option>
            <option value={'USDT'}>USDT</option>
            <option value={'WAVAX'}>WAVAX</option>
            <option value={'AVAX'}>AVAX</option>
        </Select>
        <NumberInput value={tokenBAmt} onChange={ tokenBAmtChanged }>
            <NumberInputField placeholder={'Amount'} />
        </NumberInput>

        <Badge>Curve Type</Badge>
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

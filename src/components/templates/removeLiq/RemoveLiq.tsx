import {
    erc20ABI,
    useAccount,
    useBalance,
    useContractRead,
    useContractWrite,
    usePrepareContractWrite,
    useProvider
} from "wagmi";
import {
    Badge,
    Button,
    Heading, Input,
    NumberInput,
    NumberInputField, Radio, RadioGroup,
    Spacer, Stack,
    Text,
    useControllableState
} from "@chakra-ui/react";
import {CHAINID, ROUTER_ADDRESS, ROUTER_INTERFACE} from "../../../constants";
import {useEffect} from "react";
import {Fetcher} from "@reservoir-labs/sdk";
import {calculateSlippageAmount} from "../../../utils";
import {CurrencyAmount} from "@reservoir-labs/sdk-core";
import {parseUnits} from "@ethersproject/units";
import JSBI from "jsbi";

export const RemoveLiq = () => {
    const provider = useProvider()
    const { address: connectedAddress } = useAccount()
    const [args, setArgs] = useControllableState({defaultValue: null})
    const { config, error } = usePrepareContractWrite({
        address: ROUTER_ADDRESS,
        abi: ROUTER_INTERFACE,
        functionName: "removeLiquidity",
        args: args,
        enabled: args != null
    })
    const { isLoading, write } = useContractWrite(config)

    // app state
    const [allPairs, setAllPairs] = useControllableState({defaultValue: null})
    const [pair, setPair] = useControllableState({defaultValue: null})
    const [redeemAmountInput, setRedeemAmountInput] = useControllableState({defaultValue: null})
    const { data: lpTokenBalance } = useBalance({
        token: pair?.liquidityToken.address,
        chainId: CHAINID,
        address: connectedAddress,
        enabled: (pair != null && connectedAddress != null),
    })
    const { data : lpTotalSupply } = useContractRead({
        address: pair?.liquidityToken.address,
        abi: erc20ABI,
        functionName: 'totalSupply',
    })

    const [tokenAAmt, setTokenAAmt] = useControllableState({defaultValue: ''})
    const [tokenBAmt, setTokenBAmt] = useControllableState({defaultValue: ''})

    const calc = () => {
        if (pair === null || redeemAmountInput === null) {
            return
        }

        const totalSupply = CurrencyAmount.fromRawAmount(pair.liquidityToken, lpTotalSupply)
        const redeemAmount = CurrencyAmount.fromRawAmount(pair.liquidityToken, parseUnits(redeemAmountInput, pair.liquidityToken.decimals).toString())

        const token0Amt = pair.getLiquidityValue(pair.token0, totalSupply, redeemAmount)
        const token1Amt = pair.getLiquidityValue(pair.token1, totalSupply, redeemAmount)

        const token0SlippageAmt = calculateSlippageAmount(JSBI.BigInt(parseUnits(token0Amt.toExact(), pair.token0.decimals).toString()), 100)[0]
        const token1SlippageAmt = calculateSlippageAmount(JSBI.BigInt(parseUnits(token1Amt.toExact(), pair.token1.decimals).toString()), 100)[0]

        setTokenAAmt(token0Amt.toExact())
        setTokenBAmt(token1Amt.toExact())

        setArgs([
            pair.token0.address,
            pair.token1.address,
            pair.curveId,
            redeemAmount.quotient.toString(),
            token0SlippageAmt.toString(),
            token1SlippageAmt.toString(),
            connectedAddress
        ])
    }

    const doRemoveLiq = () => {
        if (args == null) {
            return
        }
        write()
    }

    const selectPair = (pairAddress) => {
        getPairData(pairAddress)
    }

    const getPairData = async (pairAddress) => {
        if (pairAddress != null) {
            const pairData = await Fetcher.fetchPairDataUsingAddress(CHAINID, pairAddress, provider)
            setPair(pairData)
        }
    }

    useEffect(() => {
        const fetchPairs = async () => {
            if (!provider || allPairs !== null) {
                return
            }
            const allPairsData = await Fetcher.fetchAllPairs(CHAINID, provider)
            setAllPairs(allPairsData)
        }
        fetchPairs()
    }, [])

    useEffect(calc, [redeemAmountInput])

    return (
        <>
            <Heading size="lg" marginBottom={6}>
                Remove Liquidity
            </Heading>

            <RadioGroup onChange={selectPair}>
                <Heading size='md'>List of pairs you have tokens for</Heading>
                <Stack spacing={2} direction={'column'}>
                    { allPairs?.map(item => <Radio size='md' value={item} key={item}> {item} </Radio>) }
                </Stack>
            </RadioGroup>

            <Spacer height={'20px'} />
            <Text maxWidth={'80%'}>Your LP token balance { lpTokenBalance?.formatted } </Text>
            <NumberInput min={0} onChange={setRedeemAmountInput}>
                <NumberInputField />
            </NumberInput>

            <Spacer height={'20px'} />

            <Text>You will obtain the following tokens if you remove liq</Text>
            <Badge>TokenA</Badge>
            <Input isReadOnly={true} value={tokenAAmt} />
            <Badge>TokenB</Badge>
            <Input isReadOnly={true} value={tokenBAmt} />

            <Button isLoading={isLoading} onClick={doRemoveLiq}>Remove Liquidity</Button>

            <Text maxWidth={'100%'}>On-chain simulation returns {error?.message} </Text>
        </>
    )
}

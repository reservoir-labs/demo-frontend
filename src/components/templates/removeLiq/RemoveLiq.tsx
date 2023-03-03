import {
    erc20ABI,
    useAccount,
    useBalance,
    useContractRead,
    useSendTransaction,
    usePrepareSendTransaction,
    useProvider
} from "wagmi";
import {
    Badge,
    Button, Checkbox,
    Heading, Input,
    NumberInput,
    NumberInputField, Radio, RadioGroup,
    Spacer, Stack,
    Text,
    useControllableState
} from "@chakra-ui/react";
import {CHAINID, ROUTER_ADDRESS} from "../../../constants";
import {useEffect} from "react";
import {Fetcher, Router, FEE_ACCURACY} from "@reservoir-labs/sdk";
import {CurrencyAmount, Ether, Percent, WETH9} from "@reservoir-labs/sdk-core";
import {parseUnits} from "@ethersproject/units";

export const RemoveLiq = () => {
    const provider = useProvider()
    const { address: connectedAddress } = useAccount()
    const [calldata, setCalldata] = useControllableState({defaultValue: null})
    const { config, error } = usePrepareSendTransaction({
        request: {
            to: ROUTER_ADDRESS,
            value: 0,
            data: calldata
        },
        enabled: calldata != null
    })
    const { isLoading, sendTransaction } = useSendTransaction(config)

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
    const [unwrap, setUnwrap] = useControllableState({defaultValue: null})

    const calc = () => {
        if (pair === null || redeemAmountInput === null) {
            return
        }

        const totalSupply = CurrencyAmount.fromRawAmount(pair.liquidityToken, lpTotalSupply)
        const redeemAmount = CurrencyAmount.fromRawAmount(pair.liquidityToken, parseUnits(redeemAmountInput, pair.liquidityToken.decimals).toString())

        let token0Amt = pair.getLiquidityValue(pair.token0, totalSupply, redeemAmount)
        let token1Amt = pair.getLiquidityValue(pair.token1, totalSupply, redeemAmount)

        // N.B if the user wants to unwrap the wrapped native token
        // we need to pass in the native currency (amount) to the sdk encoding function
        if (unwrap) {
            if (token0Amt.currency.address === WETH9[CHAINID].address) {
                token0Amt = CurrencyAmount.fromRawAmount(Ether.onChain(CHAINID), token0Amt.quotient)
            }
            if (token1Amt.currency.address === WETH9[CHAINID].address) {
                token1Amt = CurrencyAmount.fromRawAmount(Ether.onChain(CHAINID), token1Amt.quotient)
            }
        }

        setTokenAAmt(token0Amt.toExact())
        setTokenBAmt(token1Amt.toExact())

        // N.B it is important for the frontend to validate that the pair as selected by the user exists
        // as the sdk function does not perform this check
        // if invalid tokenA/B is provided the call will revert
        // this is unlikely to happen if we use getLiquidityValue
        const parameters = Router.removeLiquidityParameters(token0Amt, token1Amt, pair.curveId, redeemAmount.quotient, { allowedSlippage: new Percent(pair.swapFee, FEE_ACCURACY) , recipient: connectedAddress })

        setCalldata(parameters.calldata)
    }

    const handleCheckbox = (e) => {
        if (e) {
            setUnwrap(e.target.checked)
        }
    }
    const doRemoveLiq = () => {
        if (calldata == null || sendTransaction == null) {
            return
        }
        sendTransaction()
        // console.log(calldata)
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

    useEffect(calc, [redeemAmountInput, pair, unwrap])

    return (
        <>
            <Heading size="lg" marginBottom={6}>
                Remove Liquidity
            </Heading>

            <RadioGroup onChange={selectPair}>
                <Heading size='md'>List of pairs you have LP tokens for</Heading>
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
            <Badge>TokenA { pair?.token0.symbol } </Badge>
            <Input isReadOnly={true} value={tokenAAmt} />
            { pair?.token0.address == WETH9[CHAINID].address ? <Checkbox onChange={handleCheckbox}>Unwrap WAVAX</Checkbox> : null }
            <Badge>TokenB { pair?.token1.symbol }</Badge>
            <Input isReadOnly={true} value={tokenBAmt} />
            { pair?.token1.address == WETH9[CHAINID].address ? <Checkbox onChange={handleCheckbox}>Unwrap WAVAX</Checkbox> : null }
            <Button isLoading={isLoading} onClick={doRemoveLiq} colorScheme='green'>Remove Liquidity</Button>

            <Text maxWidth={'100%'}>On-chain simulation returns {error?.message} </Text>
        </>
    )
}

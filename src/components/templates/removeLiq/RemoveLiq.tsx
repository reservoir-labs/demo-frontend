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
    Divider,
    Heading, Input,
    NumberInput,
    NumberInputField,
    Spacer,
    Text,
    useControllableState
} from "@chakra-ui/react";
import {CHAINID, ROUTER_ADDRESS, ROUTER_INTERFACE} from "../../../constants";
import {useEffect} from "react";
import {Fetcher} from "@reservoir-labs/sdk";
import {calculateSlippageAmount} from "../../../utils";

export const RemoveLiq = () => {
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

    // app state
    const [allPairs, setAllPairs] = useControllableState({defaultValue: null})
    const [pair, setPair] = useControllableState({defaultValue: null})
    const [redeemAmount, setRedeemAmount] = useControllableState({defaultValue: null})
    const { data: lpTokenBalance } = useBalance({
        token: pair?.address,
        chainId: CHAINID,
        address: connectedAddress,
        enabled: (pair !== null && connectedAddress !== null),
        watch: true
    })
    const { data : lpTotalSupply } = useContractRead({
        address: pair ? pair.address : null,
        abi: erc20ABI,
        functionName: 'totalSupply',
        enabled: (pair != null)
    })

    const [tokenAAmt, setTokenAAmt] = useControllableState({defaultValue: ''})
    const [tokenBAmt, setTokenBAmt] = useControllableState({defaultValue: ''})

    const calc = () => {
        if (pair === null || redeemAmount === null) {
            return
        }

        const totalSupply = lpTotalSupply
        console.log("totalSupply", totalSupply.toString())
        const token0Amt = pair.getLiquidityValue(pair.token0, totalSupply, redeemAmount)
        const token1Amt = pair.getLiquidityValue(pair.token1, totalSupply, redeemAmount)

        setTokenAAmt(token0Amt)
        setTokenBAmt(token1Amt)

        setFuncName("removeLiquidity")
        setArgs([
            pair.token0.address,
            pair.token1.address,
            pair.curveId,
            redeemAmount,
            calculateSlippageAmount(token0Amt),
            calculateSlippageAmount(token1Amt),
            connectedAddress
        ])
    }

    const doRemoveLiq = () => {
        // console.log("args", args)
        console.log("tokenBal", lpTokenBalance)
        console.log("totalSupply", lpTotalSupply)
    }

    useEffect(() => {
        const fetchPairs = async () => {
            if (!provider || allPairs !== null) {
                return
            }
            console.log(provider)
            const allPairsData = await Fetcher.fetchAllPairs(CHAINID, provider)
            setAllPairs(allPairsData)
        }
        fetchPairs()
    }, [])

    useEffect(() => {
        const getPairData = async () => {
            if (allPairs === null) {
                return
            }

            const pairData = await Fetcher.fetchPairDataUsingAddress(CHAINID, allPairs[0], provider)
            setPair(pairData)
        }

        getPairData()
    }, [allPairs])

    useEffect(calc, [redeemAmount])

    return (
        <>
            <Heading size="lg" marginBottom={6}>
                Remove Liquidity
            </Heading>

            <Text maxWidth={'80%'}>Your LP token balance {lpTokenBalance?.formatted} </Text>
            <NumberInput min={0} onChange={setRedeemAmount}>
                <NumberInputField />
            </NumberInput>

            <Spacer height={'20px'} />

            <Text>You will obtain the following tokens if you remove liq</Text>
            <Badge>TokenA</Badge>
            <Input isReadOnly={true} value={tokenAAmt} />
            <Badge>TokenB</Badge>
            <Input isReadOnly={true} value={tokenBAmt} />

            <Button isLoading={false} onClick={doRemoveLiq}>Remove Liquidity</Button>

            <Text maxWidth={'100%'}>On-chain simulation returns {error?.message} </Text>
        </>
    )
}

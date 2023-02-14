import {useAccount, useBalance, useContractWrite, usePrepareContractWrite, useProvider} from "wagmi";
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
    const [pair, setPair] = useControllableState({defaultValue: null})
    const [allPairs, setAllPairs] = useControllableState({defaultValue: null})
    const { data: lpTokenBalance } = useBalance({
        token: pair?.address,
        address: connectedAddress,
        enabled: (connectedAddress !== null && pair !== null)

    })
    const [tokenAAmt, setTokenAAmt] = useControllableState({defaultValue: null})
    const [tokenBAmt, setTokenBAmt] = useControllableState({defaultValue: null})

    const doRemoveLiq = () => {

    }

    useEffect(() => {
        const fetchPairs = async () => {
            const allPairs = await Fetcher.fetchAllPairs(CHAINID, provider)
            setAllPairs(allPairs)
        }
        fetchPairs()
    }, [])

    useEffect(() => {
        if (allPairs === null) {
            return
        }

        setPair(allPairs[0])

    }, [allPairs])

    return (
        <>
            <Heading size="lg" marginBottom={6}>
                Remove Liquidity
            </Heading>

            <Text maxWidth={'80%'}>Your LP token balance {lpTokenBalance?.formatted} </Text>
            <NumberInput min={0}>
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

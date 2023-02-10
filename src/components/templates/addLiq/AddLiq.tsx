import {
    Badge,
    Box, Divider,
    Heading, MenuDivider, NumberInput,
    NumberInputField, Radio, RadioGroup,
    Select, Spacer, Stat, StatGroup, StatLabel, StatNumber, useControllableState, Text
} from "@chakra-ui/react";
import { Pair } from "@reservoir-labs/sdk";
import {useEffect} from "react";


export const AddLiq = () => {
    const [tokenA, setTokenA] = useControllableState({defaultValue: null})
    const [tokenB, setTokenB] = useControllableState({defaultValue: null})

    const [tokenAAmt, setTokenAAmt] = useControllableState({defaultValue: null})
    const [tokenBAmt, setTokenBAmt] = useControllableState({defaultValue: null})
    const [curveId, setCurveId] = useControllableState({defaultValue: null})

    const handleTokenAChange = (event) => {
        console.log(event.target.value)
        console.log(event)

        setTokenA(event.target.value)
    }

    const handleTokenBChange = (event) => {
        setTokenB(event.target.value)
    }
    const handleCurveChange = (event) => {
        setCurveId(parseInt(event))
    }

    const calcAddLiqAmounts = () => {
        if (tokenA == null || tokenB == null || curveId == null) {
            return
        }
        if (tokenAAmt == null) {
            return
        }


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

        <Text>You will receive XXX amount of LP tokens</Text>

    </Box>

    <Spacer height={'50px'}></Spacer>

    <Box>
        <Heading>
            Pool Info
        </Heading>

        <StatGroup>
        <Stat>
            <StatLabel>Amount of SYM in pair</StatLabel>
            <StatNumber>3123123</StatNumber>
        </Stat>

        <Stat>
            <StatLabel>Amount of SYM in pair</StatLabel>
            <StatNumber>3123123</StatNumber>
        </Stat>
        </StatGroup>
    </Box>
    </>
    )
}

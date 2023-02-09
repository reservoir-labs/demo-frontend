import {
    Badge,
    Box, Divider,
    Heading, MenuDivider, NumberInput,
    NumberInputField,
    Select, Spacer, useControllableState,
} from "@chakra-ui/react";

export const AddLiq = () => {

    const [tokenA, setTokenA] = useControllableState({defaultValue: null})
    const [tokenB, setTokenB] = useControllableState({defaultValue: null})

    const handleTokenAChange = (event) => {
        console.log(event.target.value)
        console.log(event)

        setTokenA(event.target.value)
    }

    const handleTokenBChange = (event) => {
        setTokenB(event.target.value)
    }

    return (
    <>
    <Heading size="lg" marginBottom={6}>
        Add Liquidity
    </Heading>

    <Box>
        <Badge> First Token </Badge>
        <Select placeholder='select first token' id={'firstToken'} onChange={handleTokenAChange}>
            <option value={'a'}>a</option>
            <option value={'b'}>b</option>
            <option value={'c'}>c</option>
        </Select>

        <NumberInput >
            <NumberInputField placeholder={'Amount'}></NumberInputField>
        </NumberInput>

        <Badge> Second token </Badge>
        <Select placeholder={'select second token'} id={'secondToken'} onChange={handleTokenBChange}>
            <option value={'a'}>a</option>
            <option value={'b'}>b</option>
            <option value={'c'}>c</option>
        </Select>
        <NumberInput>
            <NumberInputField placeholder={'Amount'}></NumberInputField>
        </NumberInput>
    </Box>

    <Spacer height={'50px'}></Spacer>

    <Box>
        <Heading>
            Pool Info
        </Heading>
        <Badge variant={'outline'}>Token1 liq</Badge>


        <Badge variant={'outline'}>Token2 liq</Badge>
    </Box>
    </>
    )
}

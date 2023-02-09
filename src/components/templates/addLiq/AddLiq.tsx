import {
    Badge,
    Box,
    Heading, NumberInput,
    NumberInputField,
    Select,
} from "@chakra-ui/react";

export const AddLiq = () => {
    return (
    <>
    <Heading size="lg" marginBottom={6}>
        Add Liquidity
    </Heading>

    <Box>
        <Badge> First Token </Badge>
        <Select label='select first token'/>
        <NumberInput>
            <NumberInputField></NumberInputField>
        </NumberInput>

        <Badge> Second token </Badge>
        <Select label={'123'} />
    </Box>
    </>
    )
}

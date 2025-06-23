import { TokenPayload} from "../types/tokenTypes";


export function isValidPaiload(decade: any): decade is TokenPayload {
    return (
        typeof decade === "object" &&
            decade !== null &&
            typeof decade.id === "string"
    )
}
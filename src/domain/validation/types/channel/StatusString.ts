import { PropertyValidator } from "../../PropertyValidator"
import { checkIsString } from "../../validator/string/isString"
import GraphemeSplitter from "grapheme-splitter"
import { ValidationError } from "../../error"

function checkLength(str: string) {
    const splitter = new GraphemeSplitter()
    const graphemes = splitter.splitGraphemes(str)
    if (graphemes.length == 1) {
        return
    } else {
        throw new ValidationError("`statusString`は1文字で設定してください")
    }
}

export function StatusStringValidator() {
    return new PropertyValidator<string>({}, [checkIsString, checkLength])
}

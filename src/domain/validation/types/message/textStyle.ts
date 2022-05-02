import { isInteger, isString } from "../../functions"

import { Options } from "../string"
import Prism from "prismjs"
import { PropertyValidator } from "../../PropertyValidator"
import { checkIsString } from "../../validator/string/isString"

require("prismjs/components/prism-clike")
require("prismjs/components/prism-javascript")
require("prismjs/components/prism-markup")
require("prismjs/components/prism-markdown")
require("prismjs/components/prism-c")
require("prismjs/components/prism-css")
require("prismjs/components/prism-objectivec")
require("prismjs/components/prism-sql")
require("prismjs/components/prism-python")
require("prismjs/components/prism-rust")
require("prismjs/components/prism-swift")

// import config from "../../../../config/app"
const getCodeLanguages = () =>
    Object.keys(Prism.languages)
        .filter((language) => typeof Prism.languages[language] !== "function")
        .sort()

type NodeStyle = {
    format: number
    color: string | null
}

type Node = {
    children: Node[]
    type: string
    language?: string
    style: NodeStyle | null
    indices: number[]
}

const NodeKeys = ["children", "type", "style", "indices", "language"]
const AllowedTypes = ["code", "list", "listitem", "linebreak", "text", "heading_1", "heading_2", "paragraph", "quote"]
const NodeStyleKeys = ["format", "color"]
const SupportedLanguages = getCodeLanguages()

function checkIsValidNode(node: Node) {
    Object.keys(node).forEach((key) => {
        if (NodeKeys.includes(key) == false) {
            throw new SyntaxError()
        }
        if (Array.isArray(node.children) == false) {
            throw new SyntaxError()
        }
        if (Array.isArray(node.indices) == false) {
            throw new SyntaxError()
        }
        if (node.indices.length != 0 && node.indices.length != 2) {
            throw new SyntaxError()
        }
        if (isString(node.type) == false) {
            throw new SyntaxError()
        }
        if (AllowedTypes.includes(node.type) == false) {
            throw new SyntaxError()
        }
        if (node.style) {
            Object.keys(node.style).forEach((_key) => {
                if (NodeStyleKeys.includes(_key) == false) {
                    throw new SyntaxError()
                }
            })
            if (isInteger(node.style.format) == false) {
                throw new SyntaxError()
            }
            if (node.style.color) {
                if (isString(node.style.color) == false) {
                    throw new SyntaxError()
                }
            }
        }
        if (node.language) {
            if (SupportedLanguages.includes(node.language) == false) {
                throw new SyntaxError()
            }
        }
        node.children.forEach((child) => {
            checkIsValidNode(child)
        })
    })
}

export function checkIsValidStyleJson(jsonString: string): void {
    const styleTree: Node[] = JSON.parse(jsonString)
    if (Array.isArray(styleTree) == false) {
        throw new SyntaxError()
    }
    styleTree.forEach((node) => {
        checkIsValidNode(node)
    })
}

export function textStyle() {
    const options: Options = {}
    return new PropertyValidator<string>(options, [checkIsString, checkIsValidStyleJson])
}

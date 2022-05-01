import { isInteger, isString } from "../../functions"

import { Options } from "../string"
import { PropertyValidator } from "../../PropertyValidator"
import { checkIsString } from "../../validator/string/isString"

// import config from "../../../../config/app"

type NodeStyle = {
    format: number
    color: string | null
}

type Node = {
    children: Node[]
    type: string
    style: NodeStyle | null
    indices: number[]
}

const NodeKeys = ["children", "type", "style", "indices"]
const NodeStyleKeys = ["format", "color"]

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

import mongoose, {
    Document,
    FilterQuery,
    Query,
    DocumentQuery,
    EnforceDocument,
    ClientSession,
    Model,
} from "mongoose"
import { ObjectID } from "mongodb"

type FindOneOptions<T> = {
    additionalQueryFunc: (query: T) => T
    transactionSession: ClientSession | null
}

export function toObjectId(value?: string): ObjectID | undefined {
    if (value == null) {
        return undefined
    }
    return mongoose.Types.ObjectId(value)
}

function setDefaultOptions<T>(options?: Partial<FindOneOptions<T>>): FindOneOptions<T> {
    if (options === undefined) {
        return {
            additionalQueryFunc: (query: any) => query,
            transactionSession: null,
        }
    }
    const additionalQueryFunc = options.additionalQueryFunc
        ? options.additionalQueryFunc
        : (query: any) => query
    const transactionSession = options.transactionSession ? options.transactionSession : null
    return {
        additionalQueryFunc,
        transactionSession,
    }
}

export async function findOne<T extends Document>(
    cls: Model<T>,
    condition: {},
    options?: Partial<FindOneOptions<Query<EnforceDocument<T, {}> | null, EnforceDocument<T, {}>>>>
): Promise<T | null> {
    const _options = setDefaultOptions(options)
    const { additionalQueryFunc, transactionSession } = _options
    const query = cls.findOne(condition).session(transactionSession ? transactionSession : null)
    return await additionalQueryFunc(query).exec()
}

export async function find<T extends Document>(
    cls: Model<T, {}>,
    condition: FilterQuery<T>,
    additional_query_func?: (query: DocumentQuery<T[], T, {}>) => DocumentQuery<T[], T, {}>
): Promise<T[]> {
    return new Promise((resolve, reject) => {
        additional_query_func = additional_query_func
            ? additional_query_func
            : (x: DocumentQuery<T[], T, {}>) => x
        additional_query_func(cls.find(condition)).exec((error, docs) => {
            if (error) {
                reject(error)
            } else {
                resolve(docs)
            }
        })
    })
}

export async function createWithSession<T extends Document>(
    cls: Model<T, {}>,
    doc: CreateQuery<T>,
    session: ClientSession
): Promise<T> {
    return new Promise((resolve, reject) => {
        cls.create(
            [doc],
            {
                session,
            },
            (error, docs) => {
                if (error) {
                    return reject(error)
                } else {
                    resolve(docs[0])
                }
            }
        )
    })
}

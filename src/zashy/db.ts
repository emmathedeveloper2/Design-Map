
const DATABASE_NAME = "design-map"

const DATABASE_VERSION = 1

type CreateTableOptionsFields = {
    name: string

    type: string

    default: 'false' | 'true' | 'now' | 'autogenerate' | null
}

type CreateTableOptions = {[x: string] : CreateTableOptionsFields}


const generateIntId = () => Math.floor(Math.random() * 1000000000)

const generateStringId = () => {

    let letters = 'abcdefghijklomopqurstuvwxyz#@&!'.split('')

    let content = ''

    for(let i = 0 ; i < 25; i++){

        const rand = Math.floor(Math.random() * letters.length)

        content += letters[rand]
    }

    return content
}

const processDefaults = (record: any , options: CreateTableOptions) => {

    if(!options) return record

    let updatedRecord = record

    Object.keys(options).forEach(key => {

        if(options[key].default === 'autogenerate' && record[key] === undefined){

            if(options[key].type === 'number') updatedRecord[key] = generateIntId()

            if(options[key].type === 'string') updatedRecord[key] = generateStringId()
        }

        if(options[key].default === 'now' && record[key] === undefined){

            if(options[key].type === 'number') updatedRecord[key] = (new Date()).getTime()

            if(options[key].type === 'string') updatedRecord[key] = (new Date()).toISOString()
        }

        if(options[key].default === 'false' && record[key] === undefined){
            if(options[key].type === 'boolean') updatedRecord[key] = false
        }

        if(options[key].default === 'true' && record[key] !== undefined){
            if(options[key].type === 'boolean') updatedRecord[key] = true
        }
    })

    return updatedRecord
}

/**
 * 
 * @param {string} name
 * @param {string} options
 * 
 */
function createTable<T>(name: string , options: string){

    /**
     * @function
     * 
     * @param {T} record
     * 
     * @returns {Promise<number>}
     * 
     * @description Adds a single record to the table and returns the key of the record. If a record with the same key already exists, the existing record is overwritten. 
     */
    function addOne(record: T): Promise<number>{

        /**
         * @type {IDBOpenDBRequest}
         */
        const connection: IDBOpenDBRequest = indexedDB.open(DATABASE_NAME , DATABASE_VERSION)

        let updatedRecord = processDefaults(record , JSON.parse(options))

        return new Promise((res , rej) => {

            connection.addEventListener('success' , e => {

                /**
                 * @type {IDBDatabase}
                 */
                const db: IDBDatabase = (e.target as IDBOpenDBRequest)?.result
                
                /**
                 * @type {IDBTransaction}
                 */
                const transaction: IDBTransaction = db.transaction([name] , "readwrite")

                transaction.addEventListener('error' , rej)

                /**
                 * @type {IDBObjectStore}
                 */
                const store: IDBObjectStore = transaction.objectStore(name)

                const operation = store.add(updatedRecord)

                operation.addEventListener('success' , e => {
                    res((e.target as any)?.result)
                })

                operation.addEventListener('error' , rej)
            })

            connection.addEventListener('error' , rej)
        })
    }

    /**
     * @function
     * 
     * @param {T[]} records
     * 
     * @returns {Promise<number[]>}
     * 
     * @description Adds multiple records and returns an Array containing the key of each record.
     */
    async function addMany(records: T[]): Promise<number[]>{

        return await Promise.all(records.map(record => addOne(record)))
    }

    /**
     * @function
     * 
     * @param {number} key
     * 
     * @param {(data: T) => T} callback
     * 
     * @returns {Promise<number>}
     * 
     * @description Updates a record in the table.
     */
    function updateOne(key: number | string , callback: (data: T) => T): Promise<number>{

        /**
         * @type {IDBOpenDBRequest}
         */
        const connection: IDBOpenDBRequest = indexedDB.open(DATABASE_NAME , DATABASE_VERSION)
        
        return new Promise(async (res , rej) => {
            

            connection.addEventListener('success' , e => {

                /**
                 * @type {IDBDatabase}
                 */
                const db: IDBDatabase = (e.target as IDBOpenDBRequest)?.result
                
                /**
                 * @type {IDBTransaction}
                 */
                const transaction: IDBTransaction = db.transaction([name] , "readwrite")

                transaction.addEventListener('error' , rej)
                
                /**
                 * @type {IDBObjectStore}
                */
               const store: IDBObjectStore = transaction.objectStore(name)
               
               const operation = store.get(key)
               
               
               operation.addEventListener('success' , e => {
                    let data = (e.target as any).result

                    const updateOperation = store.put(callback(data))

                    updateOperation.addEventListener('success' , e => {
                        res((e.target as any)?.result)
                    })

                    updateOperation.addEventListener('error' , rej)
                })

                operation.addEventListener('error' , rej)
            })

            connection.addEventListener('error' , rej)
        })
    } 
    
    /**
     * @function
     * 
     * @param {T} query
     * 
     * @param {(data: T) => T} callback
     * 
     * @returns {Promise<void>}
     * 
     * @description updates a single record in the table based on a query.
     */
    async function updateOneWhere(query: T , callback: (data: T) => T): Promise<void>{

        const found = await getOneWhere(query) as any

        if(found) await updateOne(found.id , callback)
    }

    /**
     * @function
     * 
     * @param {T} query
     * 
     * @param {(data: T) => T} callback
     * 
     * @returns {Promise<void>}
     * 
     * @description updates multiple records in the table based on a query.
     */
    async function updateAllWhere(query: T , callback: (data: T) => T): Promise<void>{

        const matches = await getAllWhere(query)

        await Promise.all(matches.map(() => updateOneWhere(query , callback)))
    }

    /**
     * 
     * 
     * @function
     * 
     * @param {number} key
     * 
     * @returns {Promise<T>}
     * 
     * @description Retrieves a record from the table.
     */
    function getOne(key: number): Promise<T>{

        /**
         * @type {IDBOpenDBRequest}
         */
        const connection: IDBOpenDBRequest = indexedDB.open(DATABASE_NAME , DATABASE_VERSION)

        return new Promise((res , rej) => {

            connection.addEventListener('success' , e => {

                /**
                 * @type {IDBDatabase}
                 */
                const db: IDBDatabase = (e.target as IDBOpenDBRequest)?.result
                
                /**
                 * @type {IDBTransaction}
                 */
                const transaction: IDBTransaction = db.transaction([name])

                transaction.addEventListener('error' , e => {
                    rej(e)
                })

                /**
                 * @type {IDBObjectStore}
                 */
                const store: IDBObjectStore = transaction.objectStore(name)

                const operation = store.get(key)

                operation.addEventListener('success' , e => {

                    const result = (e.target as any).result

                    result !== undefined ? res(result) : rej("Record not found")
                })

                operation.addEventListener('error' , e => {
                    rej(e)
                })
            })

            connection.addEventListener('error' , e => {
                rej(e)
            })
        })
    }

    /**
     * @function
     * 
     * @param {T} query
     * 
     * @returns {Promise<T|undefined>}
     * 
     * @description Retrieves a record from the table based on a given query.
     */
    function getOneWhere(query: T): Promise<T | undefined>{

        /**
         * @type {IDBOpenDBRequest}
         */
        const connection: IDBOpenDBRequest = indexedDB.open(DATABASE_NAME , DATABASE_VERSION)

        return new Promise((res , rej) => {

            connection.addEventListener('success' , e => {

                /**
                 * @type {IDBDatabase}
                 */
                const db: IDBDatabase = (e.target as IDBOpenDBRequest)?.result
                
                /**
                 * @type {IDBTransaction}
                 */
                const transaction: IDBTransaction = db.transaction([name])

                transaction.addEventListener('error' , e => {
                    rej(e)
                })

                /**
                 * @type {IDBObjectStore}
                 */
                const store: IDBObjectStore = transaction.objectStore(name)

                const operation = store.getAll()

                operation.addEventListener('success' , e => {
                    let data = (e.target as any).result as T[]

                    const match = data.find(record => Object.entries(query as any).every(([key , value]) => record[key] === value))

                    res(match)
                })

                operation.addEventListener('error' , e => {
                    rej(e)
                })
            })

            connection.addEventListener('error' , e => {
                rej(e)
            })
        })
    }    

    /**
     * @function
     * 
     * @returns {Promise<T[]>}
     * 
     * @description Retrieves multiple records from the table.
     */
    function getAll(): Promise<T[]>{

        /**
         * @type {IDBOpenDBRequest}
         */
        const connection: IDBOpenDBRequest = indexedDB.open(DATABASE_NAME , DATABASE_VERSION)

        return new Promise((res , rej) => {

            connection.addEventListener('success' , e => {

                /**
                 * @type {IDBDatabase}
                 */
                const db: IDBDatabase = (e.target as IDBOpenDBRequest)?.result
                
                /**
                 * @type {IDBTransaction}
                 */
                const transaction: IDBTransaction = db.transaction([name])

                transaction.addEventListener('error' , e => {
                    rej(e)
                })

                /**
                 * @type {IDBObjectStore}
                 */
                const store: IDBObjectStore = transaction.objectStore(name)

                const operation = store.getAll()

                operation.addEventListener('success' , e => {
                    res((e.target as any).result)
                })

                operation.addEventListener('error' , e => {
                    rej(e)
                })
            })

            connection.addEventListener('error' , e => {
                rej(e)
            })
        })
    }

    /**
     * @function
     * 
     * @param {T} query
     * 
     * @returns {Promise<T[]>}
     * 
     * @description Retrieves multiple records from the table based on a given query.
     */
    function getAllWhere(query: T): Promise<T[]>{

        /**
         * @type {IDBOpenDBRequest}
         */
        const connection: IDBOpenDBRequest = indexedDB.open(DATABASE_NAME , DATABASE_VERSION)

        return new Promise((res , rej) => {

            connection.addEventListener('success' , e => {

                /**
                 * @type {IDBDatabase}
                 */
                const db: IDBDatabase = (e.target as IDBOpenDBRequest)?.result
                
                /**
                 * @type {IDBTransaction}
                 */
                const transaction: IDBTransaction = db.transaction([name])

                transaction.addEventListener('error' , e => {
                    rej(e)
                })

                /**
                 * @type {IDBObjectStore}
                 */
                const store: IDBObjectStore = transaction.objectStore(name)

                const operation = store.getAll()

                operation.addEventListener('success' , e => {
                    let data = (e.target as any).result as T[]

                    const matches = data.filter(record => Object.entries(query as any).every(([key , value]) => record[key] === value))

                    res(matches)
                })

                operation.addEventListener('error' , e => {
                    rej(e)
                })
            })

            connection.addEventListener('error' , e => {
                rej(e)
            })
        })
    }    

    /**
     * @function
     * 
     * @param {number | string} key
     * 
     * @returns {Promise<void>}
     * 
     * @description removes a single record from the table.
     */
    function deleteOne(key: number | string): Promise<void>{

        /**
         * @type {IDBOpenDBRequest}
         */
        const connection: IDBOpenDBRequest = indexedDB.open(DATABASE_NAME , DATABASE_VERSION)

        return new Promise((res , rej) => {

            connection.addEventListener('success' , e => {

                /**
                 * @type {IDBDatabase}
                 */
                const db: IDBDatabase = (e.target as IDBOpenDBRequest)?.result
                
                /**
                 * @type {IDBTransaction}
                 */
                const transaction: IDBTransaction = db.transaction([name] , "readwrite")

                transaction.addEventListener('error' , e => {
                    rej(e)
                })

                /**
                 * @type {IDBObjectStore}
                 */
                const store: IDBObjectStore = transaction.objectStore(name)

                const operation = store.delete(key)

                operation.addEventListener('success' , e => {
                    res()
                })

                operation.addEventListener('error' , e => {
                    rej(e)
                })
            })

            connection.addEventListener('error' , e => {
                rej(e)
            })
        })
    }

    /**
     * @function
     * 
     * @param {T} query
     * 
     * @returns {Promise<void>}
     * 
     * @description removes a single record from the table based on a query.
     */
    async function deleteOneWhere(query: T): Promise<void>{

        const found = await getOneWhere(query) as any

        if(found) await deleteOne(found.id)
    }    

    /**
     * @function
     * 
     * @param {(number | string)[]} keys
     * 
     * @returns {Promise<void>}
     * 
     * @description removes multiple records from the table.
     */
    async function deleteMany(keys: (number | string)[]): Promise<void>{

        await Promise.all(keys.map(key => deleteOne(key)))
    }

    /**
     * @function
     * 
     * @param {T} query
     * 
     * @returns {Promise<void>}
     * 
     * @description removes multiple records from the table based on a query.
     */
    async function deleteAllWhere(query: any): Promise<void>{

        const matches = await getAllWhere(query) as any[]

        await deleteMany(matches.map(m => m.id))
    }    

    /**
     * @function
     * 
     * @param {T} query
     * 
     * @returns {Promise<boolean>}
     * 
     * @description Checks wether a record exists by a given query. 
     */
    function hasRecord(query: T): Promise<boolean>{

        /**
         * @type {IDBOpenDBRequest}
         */
        const connection: IDBOpenDBRequest = indexedDB.open(DATABASE_NAME , DATABASE_VERSION)

        return new Promise((res , rej) => {

            connection.addEventListener('success' , e => {

                /**
                 * @type {IDBDatabase}
                 */
                const db: IDBDatabase = (e.target as IDBOpenDBRequest)?.result
                
                /**
                 * @type {IDBTransaction}
                 */
                const transaction: IDBTransaction = db.transaction([name] , "readwrite")

                transaction.addEventListener('error' , rej)

                /**
                 * @type {IDBObjectStore}
                 */
                const store: IDBObjectStore = transaction.objectStore(name)

                const operation = store.getAll()

                operation.addEventListener('success' , e => {

                    let data: T[] = (e.target as any)?.result

                    const found = data.find(record => Object.entries(query as any).every(([key , value]) => record[key] === value))

                    res(found ? true : false)
                })

                operation.addEventListener('error' , rej)
            })

            connection.addEventListener('error' , rej)
        })
    }

    return { addOne , addMany , updateOne , updateOneWhere , updateAllWhere , getOne , getOneWhere , getAll , getAllWhere , deleteOne , deleteOneWhere , deleteMany , deleteAllWhere , hasRecord }
}

/**
 * @description Initializes the database
 */
function initializeDatabase(){

    const connection = indexedDB.open(DATABASE_NAME , DATABASE_VERSION)

    connection.addEventListener('upgradeneeded' , e => {

        /**
         * @type {IDBDatabase}
         */
        const db: IDBDatabase = (e.target as IDBOpenDBRequest)?.result

        
        

        const Project_table: IDBObjectStore = db.createObjectStore('project' , { keyPath: 'id' })

        
    

        const Stage_table: IDBObjectStore = db.createObjectStore('stage' , { keyPath: 'id' })

        
    

        const Task_table: IDBObjectStore = db.createObjectStore('task' , { keyPath: 'id' })

        
    
    })

    connection.addEventListener('error' , e => {

        throw new Error("Couldn't open database. error: " + e)
    })
}

//Types

    export interface Project {
        id?: number,name: string,description?: string,createdAt?: number,
    }
    
    export interface Stage {
        id?: number,projectId: number,name: string,createdAt?: number,
    }
    
    export interface Task {
        id?: number,stageId: number,projectId: number,label: string,completed: boolean,isSubTask: boolean,subTasks?: Task[],createdAt?: number,
    }
    

initializeDatabase()


const Project_table = createTable<Project>('project' , '{"id":{"name":"id","type":"number","default":"autogenerate"},"createdAt":{"name":"createdAt","type":"number","default":"now"}}'
)
const Stage_table = createTable<Stage>('stage' , '{"id":{"name":"id","type":"number","default":"autogenerate"},"createdAt":{"name":"createdAt","type":"number","default":"now"}}'
)
const Task_table = createTable<Task>('task' , '{"id":{"name":"id","type":"number","default":"autogenerate"},"createdAt":{"name":"createdAt","type":"number","default":"now"}}'
)

const db = {
    project: Project_table,
stage: Stage_table,
task: Task_table,

}

export default db


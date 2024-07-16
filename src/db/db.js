import Nex from './nex.js'


export const CURRENT_DESIGNMAP_DB_VERSION = 1

export const designMapDB = new Nex({
    name: 'designMap', version: CURRENT_DESIGNMAP_DB_VERSION, migrators: {
        1: ({ createStore, }) => {
            createStore('projects')
            createStore('stages')
            createStore('tasks')
        },
        2: ({ addFields, }) => {
            addFields('tasks', { subTasks: [] })
        }

    }
})


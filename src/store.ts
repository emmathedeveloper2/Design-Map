import { writable } from "svelte/store";
import { designMapDB as db } from "./db/db.js";
import { projectStore, stageStore, taskStore, type Project, type Stage, type Task } from "./db/index.js";

export const projectId = writable<number|undefined>(undefined)

export const projectList = writable<Project[]>([])

export const current_project = writable<Project|null>(null)

export const stages = writable<Stage[]>([])

export const tasks = writable<Task[]>([])

export const theme = writable(localStorage.getItem('theme') || 'dark')

theme.subscribe(value => {
    localStorage.setItem('theme' , value)
    document.body.setAttribute('data-theme' , value)
})

export const updateProject = async (projectId: number , name: string, description: string) => {

    await projectStore.updateOne(projectId , (prev) => ({...prev , name , description}))

    projectList.update(prev => {

        const found = prev.find(p => p._id === projectId)

        if(found) {
            found.name = name
            found.description = description
        }

        return prev
    })
}

export const deleteProject = async (projectId: number) => {
    await projectStore.deleteOne(projectId)

    projectList.update(prev => prev.filter(p => p._id !== projectId))
}

export const addNewStage = async (projectId: number) => {

    let newStage: Stage = { projectId, name: "untitled" , createdAt: (new Date()).getTime() } as any

    const stageId = await stageStore.addOne(newStage)

    newStage = await stageStore.getOne(stageId) as Stage

    stages.update(prev => {
        if(!prev) return prev;

        return [...prev , newStage].sort((a , b) => (a.createdAt as number) - (b.createdAt as number))
    })
}

export const renameStage = async (stageId: number , newName: string) => {

    await stageStore.updateOne(stageId , data => {
        data.name = newName

        stages.update(prev => {
            if(!prev) return prev;
    
            return [...prev.filter(n => n._id !== stageId) , data].sort((a , b) => (a.createdAt as number) - (b.createdAt as number))
        })

        return data
    })
}

export const deleteStage = async (stageId: number) => {

    await stageStore.deleteOne(stageId)

    stages.update(prev => prev.filter(stg => stg._id != stageId))
}

export const addNewTask = async (projectId: number , stageId: number , extra?: { isSubTask: boolean , parentTaskId: number , label: string }) => {

    let newTask: Task = { projectId, stageId, label: extra?.label || "", completed: false, isSubTask: extra?.isSubTask || false , subTasks: [] , createdAt: (new Date()).getTime() } as any

    const taskId = await taskStore.addOne(newTask)

    if(extra){
        taskStore.updateOne(extra.parentTaskId , data => {
            data.subTasks = [...data.subTasks , taskId]
            data.completed = false
            return data
        })
    }

    newTask = await taskStore.getOne(taskId) as Task

    tasks.update(prev => {
        if(!prev) return prev;

        if(extra){
            const foundParentTask = prev.find(t => t._id === extra.parentTaskId)

            if(foundParentTask) {
                foundParentTask.subTasks = [...foundParentTask.subTasks , taskId]
                foundParentTask.completed = false
            }
        }

        return [...prev , newTask].sort((a , b) => (a.createdAt as number) - (b.createdAt as number))
    })
}

export const renameTask = async (taskId: number , newLabel: string) => {

    await taskStore.updateOne(taskId , data => {
        data.label = newLabel

        tasks.update(prev => {
            if(!prev) return prev;
    
            return [...prev.filter(n => n._id !== taskId) , data].sort((a , b) => (a.createdAt as number) - (b.createdAt as number))
        })

        return data
    })
}

export const deleteTask = async (taskId: number) => {

    await taskStore.deleteOne(taskId)

    tasks.update(prev => prev.filter(t => t._id != taskId))
}

export const markTaskAsCompleted = async (taskId: number) => {

    await taskStore.updateOne(taskId , data => {

        tasks.update(prev => {

            const found = prev.find(t => t._id === taskId)

            if(found) found.completed = !found.completed

            return prev
        })

        return {...data , completed: !data.completed}
    })
}
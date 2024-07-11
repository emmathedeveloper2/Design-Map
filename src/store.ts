import { writable } from "svelte/store";
import db, { type Project, type Stage, type Task } from "./zashy/db";

export const projectId = writable<number|undefined>(undefined)

export const current_project = writable<Project|null>(null)

export const stages = writable<Stage[]>([])

export const tasks = writable<Task[]>([])

export const theme = writable(localStorage.getItem('theme') || 'dark')

theme.subscribe(value => {
    localStorage.setItem('theme' , value)
    document.body.setAttribute('data-theme' , value)
})

export const addNewStage = async (projectId: number) => {

    let newStage: Stage = { projectId, name: "untitled" }

    const stageId = await db.stage.addOne(newStage)

    newStage = await db.stage.getOne(stageId)

    stages.update(prev => {
        if(!prev) return prev;

        return [...prev , newStage].sort((a , b) => (a.createdAt as number) - (b.createdAt as number))
    })
}

export const renameStage = async (stageId: number , newName: string) => {

    await db.stage.updateOne(stageId , data => {
        data.name = newName

        stages.update(prev => {
            if(!prev) return prev;
    
            return [...prev.filter(n => n.id !== stageId) , data].sort((a , b) => (a.createdAt as number) - (b.createdAt as number))
        })

        return data
    })
}

export const deleteStage = async (stageId: number) => {

    await db.stage.deleteOne(stageId)

    stages.update(prev => prev.filter(stg => stg.id != stageId))
}

export const addNewTask = async (projectId: number , stageId: number) => {

    let newTask: Task = { projectId, stageId, label: "", completed: false, isSubTask: false }

    const taskId = await db.task.addOne(newTask)

    newTask = await db.task.getOne(taskId)

    tasks.update(prev => {
        if(!prev) return prev;

        return [...prev , newTask].sort((a , b) => (a.createdAt as number) - (b.createdAt as number))
    })
}

export const renameTask = async (taskId: number , newLabel: string) => {

    await db.task.updateOne(taskId , data => {
        data.label = newLabel

        tasks.update(prev => {
            if(!prev) return prev;
    
            return [...prev.filter(n => n.id !== taskId) , data].sort((a , b) => (a.createdAt as number) - (b.createdAt as number))
        })

        return data
    })
}

export const deleteTask = async (taskId: number) => {

    await db.task.deleteOne(taskId)

    tasks.update(prev => prev.filter(t => t.id != taskId))
}
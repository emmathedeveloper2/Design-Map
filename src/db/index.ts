import { designMapDB } from "./db"

export type Project = {
    _id: number,
    name: string,
    description: string,
    createdAt: number
}

export type Stage = {
    _id: number,
    projectId: number,
    name: string,
    createdAt: number
}

export type Task = {
    _id: number,
    projectId: number,
    stageId: number,
    label: string,
    subTasks: number[],
    isSubTask: boolean,
    createdAt: number,
    completed: boolean,
}

export const projectStore = designMapDB.store<Project>('projects')

export const stageStore = designMapDB.store<Stage>('stages')

export const taskStore = designMapDB.store<Task>('tasks')
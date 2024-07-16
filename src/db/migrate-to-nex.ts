const getOldData = () => {
  return new Promise<{ projects: any[]; stages: any[]; tasks: any[] }>(
    (res) => {
      const request = indexedDB.open("design-map");

      let projects = [] as any[];

      let stages = [] as any;

      let tasks = [] as any;

      request.onsuccess = (e: any) => {
        const db = e.target?.result as IDBDatabase;

        const transaction = db.transaction(["project", "task", "stage"]);

        const projectsStore = transaction.objectStore("project");

        const stagesStore = transaction.objectStore("stage");

        const tasksStore = transaction.objectStore("task");

        projectsStore.getAll().onsuccess = (e) => {
          projects = [...(e.target as any).result].map((p) => {
            const id = p.id;

            const newData = Object.entries(p)
              .filter(([key]) => key != "id")
              .reduce((prev, [key, value]) => ({ ...prev, [key]: value }), {});

            return { ...newData, _id: id };
          });

          stagesStore.getAll().onsuccess = (e) => {
            stages = [...(e.target as any).result].map((p) => {
              const id = p.id;

              const newData = Object.entries(p)
                .filter(([key]) => key != "id")
                .reduce(
                  (prev, [key, value]) => ({ ...prev, [key]: value }),
                  {}
                );

              return { ...newData, _id: id };
            });

            tasksStore.getAll().onsuccess = (e) => {
              tasks = [...(e.target as any).result].map((p) => {
                const id = p.id;

                const newData = Object.entries(p)
                  .filter(([key]) => key != "id")
                  .reduce(
                    (prev, [key, value]) => ({ ...prev, [key]: value }),
                    {}
                  );

                return { ...newData, _id: id };
              });

              res({ projects, stages, tasks });
            };
          };
        };
      };
    }
  );
};

const putInNewData = async (data: {
  projects: any[];
  stages: any[];
  tasks: any[];
}) => {
  return new Promise<void>((res, rej) => {
    const request = indexedDB.open("designMap");

    request.onupgradeneeded = (e: any) => {
      const db = e.target?.result as IDBDatabase;

      db.createObjectStore("projects", { keyPath: "_id" });

      db.createObjectStore("stages", { keyPath: "_id" });

      db.createObjectStore("tasks", { keyPath: "_id" });
    };

    request.onsuccess = (e: any) => {
      const db = e.target?.result as IDBDatabase;

      const transaction = db.transaction(
        ["projects", "tasks", "stages"],
        "readwrite"
      );

      const projectsStore = transaction.objectStore("projects");

      const stagesStore = transaction.objectStore("stages");

      const tasksStore = transaction.objectStore("tasks");

      data.projects.forEach((p, i, arr) => {
        const addProject = projectsStore.put(p);

        addProject.onsuccess = (e) => {
          if (i == arr.length - 1) {
            data.stages.forEach((p, i, arr) => {
              const addStage = stagesStore.put(p);

              addStage.onsuccess = (e) => {
                if (i == arr.length - 1) {
                  data.tasks.forEach((p, i, arr) => {
                    const addTask = tasksStore.put({ ...p, subTasks: [] });

                    addTask.onsuccess = (e) => {
                      if (i == arr.length - 1) {
                        res();
                      }
                    };

                    addTask.onerror = rej;
                  });
                }
              };

              addStage.onerror = rej;
            });
          }
        };

        addProject.onerror = rej;
      });
    };

    request.onerror = rej;
  });
};

const migrateToNex = async () => {
  await new Promise((res) => setTimeout(res, 3000));
  if (!(await oldDatabaseExists())) return;

  const oldTransformedData = await getOldData();

  await putInNewData(oldTransformedData);

  indexedDB.deleteDatabase("design-map");
};

const oldDatabaseExists = async () => {
  return (await indexedDB.databases()).find((d) => d.name === "design-map");
};

export default migrateToNex;

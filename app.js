const express = require('express')
const app = express()
app.use(express.json())

const format = require('date-fns/format')
const isValid = require('date-fns/isValid')
const toDate = require('date-fns/toDate')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const databasePath = path.join(__dirname, 'todoApplicaton.db')

let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(error.message)
  }
}
initializeDbAndServer()

const checkRequestQueries = async (request, response, next) => {
  const {search_q, category, priority, status, date} = request.query
  const {todoId} = request.params
  if (category !== undefined) {
    const categoryArray = ['WORK', 'HOME', 'LEARNING']
    const categoryIsInArray = categoryArray.includes(category)
    if (categoryIsInArray === true) {
      request.category = category
    } else {
      response.status(400)
      response.send('Invalid Todo Category')
      return
    }
  }
  if (priority !== undefined) {
    const priorityArray = ['HIGH', 'MEDIUM', 'LOW']
    const priorityIsInArray = priorityArray.includes(priority)
    if (priorityIsInArray === true) {
      request.priority = priority
    } else {
      response.status(400)
      response.send('Invalid Todo Priority')
      return
    }
  }
  if (status !== undefined) {
    const statusArray = ['TO DO', 'IN PROGRESS', 'DONE']
    const statusIsInArray = statusArray.includes(status)
    if (statusIsInArray === true) {
      request.status = status
    } else {
      response.status(400)
      response.send('Invalid Todo Status')
    }
  }
  if (date !== undefined) {
    try {
      const myDate = new Date(date)
      const formatedDate = format(new Date(date), 'yyyy-MM-dd')
      console.log(formatedDate, 'f')
      const result = toDate(
        new Date(
          `${myDate.getFullYear()}-${
            myDate.getMonth() + 1
          }-${myDate.getDate()}`,
        ),
      )
      console.log(result, 'r')
      console.log(new Date(), 'new')
      const isValidDate = await isValid(result)
      console.log(isValidDate, 'v')
      if (isValidDate === true) {
        request.date = formatedDate
      } else {
        response.status(400)
        response.send('Invalid Due Date')
      }
    } catch (e) {
      response.status(400)
      response.send('Invalid Due Date')
      return
    }
  }
  request.todoId = todoId
  request.search_q = search_q
  next()
}

checkRequestBody = (request, response, next) => {
  const {id, todo, category, priority, status, dueDate} = request.body
  const {todoId} = request.params
  if (category !== undefined) {
    categoryArray = ['WORK', 'HOME', 'LEARNING']
    categoryIsInArray = categoryArray.includes(category)
    if (categoryIsInArray === true) {
      request.category = category
    } else {
      response.status(400)
      response.send('Invalid Todo Category')
      return
    }
  }
  if (priority !== undefined) {
    priorityArray = ['HIGH', 'MEDIUM', 'LOW']
    priorityIsInArray = priorityArray.includes(priority)
    if (priorityIsInArray === true) {
      request.priority = priority
    } else {
      response.status(400)
      response.send('Invalid Todo Priority')
    }
  }
  if (status !== undefined) {
    statusArray = ['TO DO', 'IN PROGRESS', 'DONE']
    statusIsInArray = statusArray.includes(status)
    if (statusIsInArray === true) {
      request.status = status
    } else {
      response.status(400)
      response.send('Invalid Todo Status')
    }
  }
  if (dueDate !== undefined) {
    try {
      const myDate = new Date(dueDate)
      const formatedDate = format(new Date(dueDate), 'yyyy-MM-dd')
      console.log(formatedDate)
      const result = toDate(new Date(formatedDate))
      const isValidDate = isValid(result)
      console.log(isValidDate)
      console.log(isValidDate)
      if (isValidDate === true) {
        request.dueDate = formatedDate
      } else {
        response.status(400)
        response.send('Invalid Due Date')
      }
    } catch (e) {
      response.status(400)
      response.send('Invalid Due Date')
      return
    }
  }
  request.todo = todo
  request.id = id
  request.todoId = todoId
  next()
}
/*const convertTodoDbObjectToResponseObject = dbObject => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    category: dbObject.category,
    priority: dbObject.priority,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  }
}
const hasPriorityAndStatusProperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}
const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}
const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}
const hasCategoryAndStatus = requestQuery => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  )
}
const hasCategoryAndPriority = requestQuery => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  )
}
const hasSearchProperty = requestQuery => {
  return requestQuery.search_q !== undefined
}
const hasCategoryProperty = requestQuery => {
  return requestQuery.category !== undefined
}*/

app.get('/todos/', checkRequestQueries, async (request, response) => {
  const {status = '', search_q = '', priority = '', category = ''} = request
  console.log(status, search_q, priority, category)
  const getTodosQuery = `
  SELECT
     id, todo, priority, status, category, due_date AS dueDate 
   FROM todo WHERE todo LIKE '%${search_q}%' AND priority LIKE '%${priority}%'
   AND status LIKE '%${status}%' AND category LIKE '%${category}%';`
  const todosArray = await db.all(getTodosQuery)
  response.send(todosArray)
})

app.get('/todos/:todoId/', checkRequestQueries, async (request, response) => {
  const {todoId} = request
  const getTodosQuery = `
  SELECT 
     id, todo, priority, status, category, due_date AS dueDate
  FROM 
     todo
  WHERE
     id = ${todoId};`
  const todo = await db.get(getTodosQuery)
  response.send(todo)
})

app.get('/agenda/', checkRequestQueries, async (request, response) => {
  const {date} = request
  console.log(date, 'a')
  const selectDueDateQuery = `
  SELECT
     id, todo, priority, status, category, due_date AS dueDate
  FROM
     todo
  WHERE
     due_date = '${date}';`
  const todosArray = await db.all(selectDueDateQuery)
  if (todosArray === undefined) {
    response.status(400)
    response.send('Invalid Due Date')
  } else {
    response.send(todosArray)
  }
})

app.post('/todos/', checkRequestBody, async (request, response) => {
  const {id, todo, priority, status, category, dueDate} = request
  const postTodoQuery = `
          INSERT INTO
             todo(id, todo, category, priority, status, due_date)
          VALUES
             (${id},'${todo}', '${category}', '${priority}', '${status}', '${dueDate}');`
  const creatUser = await db.run(postTodoQuery)
  console.log(creatUser)
  response.send('Todo Successfully Added')
})

app.put('/todos/:todoId/', checkRequestBody, async (request, response) => {
  const {todoId} = request
  const {priority, todo, status, category, dueDate} = request
  let updateTodoQuery = null
  console.log(priority, todo, status, category, dueDate)

  switch (true) {
    case status !== undefined:
      updateTodoQuery = `
        UPDATE
           todo
        SET 
            status = '${status}'
        WHERE 
        id = ${todoId};`
      await db.run(updateTodoQuery)
      response.send('Status Updated')
      break
    case priority !== undefined:
      updateTodoQuery = `
        UPDATE
           todo
        SET
            priority = '${priority}' 
        WHERE 
          id = '${todoId}';`
      await db.run(updateTodoQuery)
      response.send('Priority Updated')
      break
    case todo !== undefined:
      updateTodoQuery = `
      UPDATE
         todo
      SET
         todo = '${todo}'
      WHERE 
      id = ${todoId};`
      await db.run(updateTodoQuery)
      response.send('Todo Updated')
      break
    case category !== undefined:
      updateCategoryQuery = `
        UPDATE
           todo
        SET
           category = '${category}' 
        WHERE 
        id = ${todoId};`
      await db.run(updateCategoryQuery)
      response.send('Category Updated')
      break
    case dueDate !== undefined:
      updateDateQuery = `
        UPDATE
           todo
        SET
           due_date = '${dueDate}' 
        WHERE 
        id = ${todoId};`
      await db.run(updateDateQuery)
      response.send('Due Date Updated')
      break
  }
})

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteTodoQuery = `
           DELETE FROM
                todo
           WHERE
                id = ${todoId};`
  await db.run(deleteTodoQuery)
  response.send('Todo Deleted')
})

module.exports = app

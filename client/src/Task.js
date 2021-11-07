import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import React from "react";
import { v4 as uuid } from 'uuid';
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

// const itemsFromBackend = [
//   {
//     id: uuid(),
//     content: 'Item 1'
//   },
//   {
//     id: uuid(),
//     content: 'Item 2'
//   }
// ];

// const columnsFromBackend = {
//   [uuid()]: {
//     name: 'Requested',
//     items: itemsFromBackend
//   },
//   [uuid()]: {
//     name: 'Todo',
//     items: []
//   },
//   [uuid()]: {
//     name: 'In Progress',
//     items: []
//   },
//   [uuid()]: {
//     name: 'Completed',
//     items: []
//   }
// }

class Task extends React.Component{
  state = {
    teamId: '',
    task: '',
    category: '',
    itemsFromBackend: [],
    columnsFromBackend: {
      [uuid()]: {
        name: 'Requested',
        items: []
      },
      [uuid()]: {
        name: 'Todo',
        items: []
      },
      [uuid()]: {
        name: 'In Progress',
        items: []
      },
      [uuid()]: {
        name: 'Completed',
        items: []
      }
    }
  };

  componentDidMount(){
    this.getTasks();
  }

  onDragEnd = (result, columns) => {
    if (!result.destination) {
      return;
    }
  
    const { source, destination } = result;
  
    if(source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);

      this.setState({
        columnsFromBackend: {
          ...columns,
          [source.droppableId]: {
            ...sourceColumn,
            items: sourceItems
          },
          [destination.droppableId]: {
            ...destColumn,
            items: destItems
          }
        }
      });

      //code to change 'category' of [removed] task
      const data = {
        teamId: this.state.teamId,
        taskId: removed.id,
        dest: destColumn.name
      };
      console.log(data);
  
      axios({
        url: 'http://localhost:9000/data/edit',
        method: 'POST',
        data: data
      })
      .then(res => {
        console.log("Data has been sent to the server");
        console.log(res);
      })
      .catch(err => console.log(err));

    }else{
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);

      this.setState({
        columnsFromBackend: {
          ...columns,
          [source.droppableId]: {
            ...column,
            items: copiedItems
          }
        }
      });
    }
  }

  getTasks = (argId = '') => {
    const teamId = (argId === '') ? this.props.teamId : argId;

    axios.get('http://localhost:9000/data/teams/'+teamId)
         .then(res => {
            console.log(res.data);
            const tasks = res.data;
            var itemsList = [];
            var requestedItemsList = [];
            var todoitemsList = [];
            var inprogressitemsList = [];
            var completeditemsList = [];

            tasks.map(task => {
              var item = {
                id: task._id,
                content: task.content,
                category: task.category
              }

              itemsList.push(item);

              if(task.category === 'Requested'){
                requestedItemsList.push(item);
              }else if(task.category === 'Todo'){
                todoitemsList.push(item);
              }else if(task.category === 'In Progress'){
                inprogressitemsList.push(item);
              }else if(task.category === 'Completed'){
                completeditemsList.push(item);
              }
            })

            var requestedId, todoId, inprogressId, completedId;
            Object.entries(this.state.columnsFromBackend).map(([id, column]) => {
              if(column.name === 'Requested') requestedId = id;
              else if(column.name === 'Todo') todoId = id;
              else if(column.name === 'In Progress') inprogressId = id;
              else if(column.name === 'Completed') completedId = id;
            })

            this.setState({ 
              teamId: teamId,
              itemsFromBackend: itemsList,
              columnsFromBackend: {
                ...this.state.columnsFromBackend,
                [requestedId]: {
                  name: 'Requested',
                  items: requestedItemsList
                },
                [todoId]: {
                  name: 'Todo',
                  items: todoitemsList
                },
                [inprogressId]: {
                  name: 'In Progress',
                  items: inprogressitemsList
                },
                [completedId]: {
                  name: 'Completed',
                  items: completeditemsList
                }
              }
            });

            console.log('State is...');
            console.log(this.state);
         })
  }

  handleChange = ({ target }) => {
    const { name, value } = target;
    this.setState({ [name]: value });
  };

  submit = (event) => {
    event.preventDefault();

    const data = {
      task: this.state.task,
      category: this.state.category,
      teamId: this.state.teamId
    };


    axios({
      url: 'http://localhost:9000/data',
      method: 'POST',
      data: data
    })
      .then(() => {
        console.log('Data for adding task has been sent to the server');
        this.resetUserInputs();
        this.getTasks(this.state.teamId);
      })
      .catch(() => {
        console.log('Internal server error');
      });;
  };

  resetUserInputs = () => {
    this.setState({
      task: '',
      category: ''
    });
  };

  render(){
    return(
      <div style={{ display: 'flex', justifyContent: 'center', height: '100%', }}>
        <DragDropContext onDragEnd={result => this.onDragEnd(result, this.state.columnsFromBackend)}>
          {Object.entries(this.state.columnsFromBackend).map(([id, column]) => {
            return(
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <h2>{column.name}</h2>
                <Droppable droppableId={id} key={id}>
                  {(provided, snapshot) => {
                    return(
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={{
                          background: snapshot.isDraggingOver ? 'lightblue' : 'lightgrey',
                          padding: 4,
                          width: 250,
                          minHeight: 500,
                          margin: '0 10px 10px 0'
                        }}
                      >
                        {column.items.map((item, index) => {
                          return(
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                              {(provided, snapshot) => {
                                return(
                                  <div 
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      userSelect: 'none',
                                      padding: 16,
                                      margin: '0 0 8px 0',
                                      minHeight: '50px',
                                      backgroundColor: snapshot.isDragging ? '#263B4A' : '#456C86',
                                      color: 'white',
                                      ...provided.draggableProps.style
                                    }}
                                  >
                                    {item.content}
                                  </div>
                                )
                              }}
                            </Draggable>
                          )
                        })}
                        {provided.placeholder}
                      </div>
                    )
                  }}
                </Droppable>
              </div>
            )
          })}
        </DragDropContext>
        <div style={{ paddingTop: '55px' }}>
          <h2>Team id: {this.state.teamId}</h2>
          <form onSubmit={this.submit}>
            <input type="text" placeholder="Task name..." value={this.state.task} required name="task" onChange={this.handleChange}/>
            <input type="text" placeholder="Category" value={this.state.category} required name="category" onChange={this.handleChange} />
            <br />
            <input type="submit" value="Add Task" />
          </form>
        </div>
      </div>
    )
  }
}

export default Task;

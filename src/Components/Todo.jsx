import { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { FiEdit } from "react-icons/fi";
import { MdDeleteForever } from "react-icons/md";
import { RxCross1 } from "react-icons/rx";

const today = new Date();
const month = today.toLocaleString("default", { month: "long" });
const date = new Date().getDate();
const day = today.toLocaleString("default", { weekday: "long" });

function Toast({ message, onClose, duration, deleteColor }) {
  const [counter, setCounter] = useState(duration);

  useEffect(() => {
    const timer = setInterval(() => {
      setCounter((prevCounter) => prevCounter - 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (counter === 0) {
      onClose();
    }
  }, [counter, onClose]);
  return (
    <div
      className="toast"
      style={{ backgroundColor: deleteColor ? "#a92424" : "#53e2a0" }}
    >
      {message}
      <button className="toast-cross" onClick={onClose}>
        <RxCross1 />
      </button>
    </div>
  );
}

const Todo = () => {
  const [todoList, setTodoList] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [editTodo, setEditTodo] = useState(null);
  const [inputDiv, setInputDiv] = useState(false);
  const [buttonColor, setButtonColor] = useState("#53e2a0");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deleteColor, setDeleteColor] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isError, setIsError] = useState(false);

  //get data from server
  const getTodos = async () => {
    try {
      const response = await fetch("http://localhost:3000/todos", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const getResponse = await response.json();
      setTodoList(getResponse);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  useEffect(() => {
    getTodos();
  }, []);

  //post data to server
  const handleNewChange = async (event) => {
    event.preventDefault();
    if (!newTodo) {
      alert("Please enter a Todo");
      return;
    }
    const todoData = {
      id: todoList.length > 0 ? todoList[todoList.length - 1].id + 1 : 1,
      todo: newTodo,
      completed: false,
    };
    if (inputValue.length > 50) {
      setIsError(true);
    } else {
      setIsError(false);
    }
    try {
      await fetch("http://localhost:3000/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(todoData),
      })
        .then((response) => response.json())
        .then((data) => setTodoList([...todoList, data]));
    } catch (error) {
      console.error("Error:", error);
    }
    setNewTodo("");
    setInputDiv(false);
    setButtonColor("#53e2a0");
    setShowToast(true);
    setToastMessage("Listed Todo successfully!");
  };

  //delete data from the server
  const handleDelete = async (todo) => {
    try {
      await fetch(`http://localhost:3000/todos/${todo.id}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          const newList = todoList.filter((elem) => elem.id !== todo.id);
          setTodoList(newList);
          setToastMessage("Todo deleted successfully!");
          setShowToast(true);
          setShowConfirmation(false);
          setDeleteColor(true);
        });
    } catch (error) {
      console.log(error.message);
    }
  };

  //update data of the server
  const handleEditTodo = async (event) => {
    event.preventDefault();
    if (!editTodo || !editTodo.todo) {
      return;
    }
    try {
      await fetch(`http://localhost:3000/todos/${editTodo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editTodo),
      })
        .then((response) => response.json())
        .then((data) => {
          const newTodos = todoList.map((elem) => {
            if (elem.id !== editTodo.id) {
              return elem;
            }
            return editTodo;
          });
          setTodoList(newTodos);
          setEditTodo(null);
          setShowToast(true);
          setToastMessage("Edited Todo successfully!");
        });
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    setNewTodo(event.target.value);
    setInputValue(value);
    if (value.length > 50) {
      setIsError(true);
    } else {
      setIsError(false);
    }
  };

  const toggleInput = () => {
    setInputDiv(!inputDiv);
    setButtonColor(buttonColor === "#53e2a0" ? "#a92424" : "#53e2a0");
  };

  const closeToast = () => {
    setShowToast(false);
    setDeleteColor(false);
  };

  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

  return (
    <section className="container">
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={closeToast}
          duration={4}
          deleteColor={deleteColor}
          setDeleteColor={setDeleteColor}
        />
      )}
      <div className="content">
        <div className="content-date">
          <div className="left-details">
            <h4>{day}</h4>
            <h5>
              {date}, {month}
            </h5>
          </div>
          <div className="right-details">Todos</div>
        </div>
        <div className="todo-content">
          <h4 className="quote">"Nothing Will Work Unless You DO."</h4>
          <div className="todo-list">
            {todoList.map((item) =>
              editTodo && editTodo.id === item.id ? (
                <div className="edit-input" key={editTodo.id}>
                  <form onSubmit={handleEditTodo}>
                    <input
                      type="text"
                      value={editTodo.todo}
                      onChange={(event) =>
                        setEditTodo({
                          ...editTodo,
                          todo: event.target.value,
                        })
                      }
                    />
                  </form>
                  <div className="change-button">
                    <button className="form-btn" onClick={handleEditTodo}>
                      Save
                    </button>
                    <button
                      className="change-cross"
                      onClick={() => setEditTodo(null)}
                    >
                      <RxCross1 />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="main-todo" key={item.id}>
                  <p>{item.todo}</p>
                  <div className="changes-button">
                    <button
                      className="edit-button"
                      onClick={() => setEditTodo(item)}
                    >
                      <FiEdit />
                    </button>
                    <button id="delete-button" onClick={handleDeleteClick}>
                      <MdDeleteForever />
                    </button>
                    {showConfirmation && (
                      <div className="delete">
                        <span>Are you sure you want to delete?</span>
                        <br />
                        <button
                          id="delete-yes"
                          onClick={() => handleDelete(item)}
                        >
                          Yes
                        </button>
                        <button id="delete-no" onClick={handleCancelDelete}>
                          No
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
        <div
          className="form"
          style={{
            transform: inputDiv ? "scaleY(1)" : "scaleY(0)",
            transition: "transform 0.5s ease-in-out",
          }}
        >
          <h5 className="form-heading">Add task</h5>
          <form className="main-input" onSubmit={handleNewChange}>
            <input
              type="text"
              value={newTodo}
              onChange={handleInputChange}
              placeholder="Add a task here"
              style={{
                border: isError
                  ? "2px solid red"
                  : "2px solid rgba(106, 105, 105, 0.2)",
              }}
            />
            {isError && (
              <p style={{ color: "red", marginTop: "5px" }}>
                Enter a valid input (max 50 characters).
              </p>
            )}

            <button
              className="form-btn"
              onClick={!isError ? null : handleNewChange}
            >
              Save
            </button>
          </form>
        </div>
        <button
          className="add-btn"
          onClick={toggleInput}
          style={{
            backgroundColor: buttonColor,
            transform: inputDiv ? "rotate(45deg)" : "none",
          }}
        >
          <FiPlus />
        </button>
      </div>
    </section>
  );
};

export default Todo;

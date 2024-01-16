import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export function Checklist() {
  const { checklistId } = useParams();
  const [checklist, setChecklist] = useState({});
  const [newInput, setNewInput] = useState({});

  useEffect(() => {
    fetch(`http://localhost:3000/api/lists/${checklistId}`) // default method by fetch is GET
      .then((res) => res.json())
      .then(({ success, result, error }) => {
        if (!success) throw error; // FIXME: add proper error handling
        setChecklist(result); // result ist hier ein single checklist objekt(!) mit den items
      });
  }, []);

  // toggleChecked ist ein thunk --> eine funktion die eine andere funktion returned
  function toggleChecked(itemId) {
    const url = `http://localhost:3000/api/lists/${checklist.id}/items/${itemId}/toggleChecked`;
    // console.log(url);
    return function onClickRun() {
      fetch(url, { method: "PATCH" })
        .then((res) => res.json())
        .then(({ success, result, error }) => {
          if (!success) throw error; // FIXME: add proper error handling
          setChecklist(result);
        });
    };
  }

  function deleteItem(itemId) {
    const url = `http://localhost:3000/api/lists/${checklist.id}/items/${itemId}`;
    // console.log(url);
    return function onClickRun() {
      fetch(url, { method: "DELETE" })
        .then((res) => res.json())
        .then(({ success, result, error }) => {
          if (!success) throw error; // FIXME: add proper error handling
          setChecklist(result);
        });
    };
  }

  // neues To-Do hinzufügen
  function addItem() {
    const url = `http://localhost:3000/api/lists/${checklist.id}/items/addItem`;

    fetch(url, {
      method: "POST",
      body: JSON.stringify({ description: `${newInput}` }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then(({ success, result, error }) => {
        if (!success) throw error;

        setChecklist(result);
        setNewInput({});
      });
  }

  return (
    <div>
      <h1 className="logo-h1">Your Daily To-Do´s</h1>
      <div className="input-new">
        <h2>Gibt es noch mehr zu tun?</h2>

        <form onClick={(event) => event.preventDefault()}>
          <input
            type="text"
            placeholder="Füge ein neues To-Do hinzu..."
            className="input-text"
            onChange={(e) => setNewInput(e.target.value)}
          />
          <button className="btn" onClick={addItem}>
            Hinzufügen
          </button>
        </form>
      </div>
      <h2>Was du heute erledigen solltest:</h2>
      <ul>
        {checklist.items?.map((item) => (
          <li key={item.itemId} className="list-item-wrapper">
            <div
              className={
                item.checked ? "list-item list-item-checked" : "list-item"
              }
            >
              {item.description}
            </div>
            <div
              className="list-item-check"
              onClick={toggleChecked(item.itemId)}
            >
              ✅
            </div>
            <div className="list-item-delete" onClick={deleteItem(item.itemId)}>
              🗑️
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { useEffect, useState } from "react";
import ChecklistCardList from "../components/ChecklistCardList";

export function Dashboard() {
  const [checklist, setChecklists] = useState([{ name: "Demo...", id: -1 }]);

  useEffect(() => {
    fetch("http://localhost:3000/api/lists")
      .then((res) => res.json())
      .then(({ success, result, error }) => {
        if (!success) throw error; // FIXME: add proper error handling
        setChecklists(result);
      });
  }, []);

  return (
    <main>
      <h1 className="logo-h1">Checklisto</h1>
      <ChecklistCardList checklists={checklist} />
      {/* Add new checklist button */}
      {/* Add new checklist form */}
    </main>
  );
}

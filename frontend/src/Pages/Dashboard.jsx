import { useEffect, useState } from "react";
import ChecklistCardList from "../components/ChecklistCardList";
import ChecklistCard from "../components/ChecklistCard";

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
      <h1 className="logo-h1">Your Daily To-Do´s</h1>
      <p className="logo-underline">Just do it - now!</p>
      <p className="dashboard-descriptio">
        Effizientes Aufgabenmanagement beginnt mit klarer Organisation und dem
        Bewusstsein für deine täglichen Ziele. "Your Daily To-Dos" ist mehr als
        nur eine App; es ist dein persönlicher Assistent im Taschenformat!
      </p>
      <ChecklistCardList checklists={checklist} />
    </main>
  );
}

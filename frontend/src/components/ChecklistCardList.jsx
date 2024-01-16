import ChecklistCard from "./ChecklistCard";

const ChecklistCardList = ({ checklists }) => {
  return (
    <section className="checklist-card-list-view">
      {checklists.map((list) => (
        <ChecklistCard key={list.id} id={list.id} name={list.name} />
      ))}
    </section>
  );
};

export default ChecklistCardList;

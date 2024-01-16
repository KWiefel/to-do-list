import { useNavigate } from "react-router-dom";

const ChecklistCard = ({ id, name }) => {
  const navigate = useNavigate();

  function navigateToDetailPage() {
    navigate(`/checklist/${id}`);
  }

  return (
    <article className="checklist-card" onClick={navigateToDetailPage}>
      <h2>{name}</h2>
    </article>
  );
};

export default ChecklistCard;

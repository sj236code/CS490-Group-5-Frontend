import { useEffect, useState } from "react";

function AboutTab({ salon }) {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (!salon || !salon.id) return;

    const fetchDetails = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/salons/details/${salon.id}`
        );
        const data = await res.json();
        setDetails(data);
      } catch (err) {
        console.error("Error loading salon details:", err);
      }
    };

    fetchDetails();
  }, [salon]);

  const aboutText =
    details?.about || "This salon has not added an about section yet.";

  return (
    <div className="about-container">
      <div className="about-textbox">
        <h2>About {details?.name || salon.title}</h2>
        <p>{aboutText}</p>
      </div>
    </div>
  );
}

export default AboutTab;
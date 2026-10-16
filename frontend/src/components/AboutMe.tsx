export default function AboutMe() {
  const rows = [
    ["Name", "Ashish Kumar Mahto"],
    ["Location", "Ranchi, Jharkhand"],
    ["Education", "BCA Student"],
    ["University", "Amity University Jharkhand"],
    ["Career interest", "Software Development"],
  ];
  return (
    <div className="about">
      <div className="about-inner">
        <h2>About</h2>
        <p className="about-sub">The developer behind STUDS-HELP AI</p>
        <dl className="about-list">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

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
      <div className="card">
        <h2>About Me</h2>
        <dl>
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

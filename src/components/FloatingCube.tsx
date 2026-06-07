const faces = [
  { transform: 'translateZ(90px)', label: '{ }', accent: '#b600a8' },
  { transform: 'rotateY(180deg) translateZ(90px)', label: '</>', accent: '#7621b0' },
  { transform: 'rotateY(90deg) translateZ(90px)', label: '01', accent: '#be4c00' },
  { transform: 'rotateY(-90deg) translateZ(90px)', label: '◆', accent: '#bbccd7' },
  { transform: 'rotateX(90deg) translateZ(90px)', label: '◈', accent: '#646973' },
  { transform: 'rotateX(-90deg) translateZ(90px)', label: '⚡', accent: '#fff' },
];

export default function FloatingCube() {
  return (
    <div className="cube-scene" aria-hidden>
      <div className="cube">
        {faces.map((f, i) => (
          <div
            key={i}
            className="cube-face mono"
            style={{
              transform: f.transform,
              borderColor: `${f.accent}55`,
              color: f.accent,
              boxShadow: `inset 0 0 40px ${f.accent}22`,
            }}
          >
            <span>{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

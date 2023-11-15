export function Loading(Props: { size?: "large" | "small" }) {
  let sizeStyle =
    Props.size === "small"
      ? { width: "1rem", height: "1rem" }
      : { width: "3rem", height: "3rem" };
  return (
    <div
      className={`spinner-grow text-primary`}
      style={sizeStyle}
      role="status"
    >
      <span className="visually-hidden">Loading...</span>
    </div>
  );
}

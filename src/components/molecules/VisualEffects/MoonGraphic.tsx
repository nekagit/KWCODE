export function MoonGraphic() {
  return (
    <div
      className="pointer-events-none absolute top-[12%] right-[14%] z-[1] w-16 h-16 sm:w-20 sm:h-20"
      aria-hidden
    >
      <div
        className="absolute inset-0 rounded-full bg-[#fef9c3] opacity-95"
        style={{
          boxShadow: "0 0 40px 20px rgba(254,249,195,0.4), 0 0 80px 30px rgba(254,249,195,0.2)",
        }}
      />
      <div
        className="absolute rounded-full bg-[#e4e4e7] opacity-40"
        style={{
          width: "28%",
          height: "28%",
          top: "18%",
          left: "22%",
        }}
      />
    </div>
  );
}
